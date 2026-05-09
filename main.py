from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse
import requests
import json
import time
from typing import AsyncGenerator

app = FastAPI()

MODEL_MAP = {
    # Legacy OpenAI mappings
    "gpt-3.5-turbo": "gpt-4o-mini",
    "gpt-4": "gpt-4o",
    "gpt-4-turbo": "gpt-4o",
    "gpt-4o": "gpt-4o",

    # OpenAI models
    "gpt-5.2-pro": "gpt-5.2-pro",
    "gpt-5.4": "gpt-5.4",
    "gpt-5.4-mini": "gpt-5.4-mini",
    "gpt-5.4-nano": "gpt-5.4-nano",
    "gpt-5.4-pro": "gpt-5.4-pro",
    "gpt-5.5": "gpt-5.5",
    "o3-pro": "o3-pro",

    # Anthropic Claude models
    "claude-3-5-sonnet-20241022": "claude-sonnet-4-6",
    "claude-4-5-haiku": "claude-4-5-haiku",
    "claude-opus-4-6": "claude-opus-4-6",
    "claude-opus-4-7": "claude-opus-4-7",
    "claude-sonnet-4-6": "claude-sonnet-4-6",

    # DeepSeek models
    "deep-seek-v4-pro": "deep-seek-v4-pro",

    # Google Gemini models
    "gemini-2.5-pro": "gemini-2.5-pro",
    "gemini-3-flash-preview": "gemini-3-flash-preview",
    "gemini-3.1-pro-preview": "gemini-3.1-pro-preview",

    # xAI Grok models
    "grok-4.20-0309-non-reasoning": "grok-4.20-0309-non-reasoning",
    "grok-4.20-0309-reasoning": "grok-4.20-0309-reasoning",

    # Trinity models
    "trinity-large-thinking": "trinity-large-thinking",
}

def extract_user_input(messages: list) -> str:
    """Extract user input from messages, handling both string and array content."""
    if not messages:
        return ""

    last_message = messages[-1]
    content = last_message.get("content", "")

    # Handle string content
    if isinstance(content, str):
        return content

    # Handle array content (OpenCode format)
    if isinstance(content, list):
        text_parts = [
            item.get("text", "")
            for item in content
            if isinstance(item, dict) and item.get("type") == "text" and item.get("text")
        ]
        return " ".join(text_parts)

    return ""

def create_genspark_payload(openai_request: dict) -> dict:
    """Convert OpenAI format to Genspark format."""
    model = openai_request.get("model", "gpt-4")
    mapped_model = MODEL_MAP.get(model, model)
    messages = openai_request.get("messages", [])
    user_input = extract_user_input(messages)
    tools = openai_request.get("tools", [])

    # If tools are provided, inject them into system message
    if tools:
        tools_description = "You have access to the following tools:\n\n"
        for tool in tools:
            func = tool.get("function", {})
            tools_description += f"- {func.get('name')}: {func.get('description')}\n"
            params = func.get('parameters', {}).get('properties', {})
            if params:
                tools_description += f"  Parameters: {', '.join(params.keys())}\n"

        tools_description += "\nTo use a tool, respond with JSON in this format:\n"
        tools_description += '{"tool_calls": [{"name": "function_name", "arguments": {"param": "value"}}]}'

        # Inject tools into system message
        system_message = None
        for msg in messages:
            if msg.get("role") == "system":
                system_message = msg
                break

        if system_message:
            system_message["content"] = f"{system_message['content']}\n\n{tools_description}"
        else:
            messages.insert(0, {"role": "system", "content": tools_description})

    payload = {
        "ai_chat_model": mapped_model,
        "ai_chat_enable_search": False,
        "ai_chat_disable_personalization": False,
        "use_moa_proxy": False,
        "moa_models": [],
        "writingContent": None,
        "type": "ai_chat",
        "project_id": None,
        "messages": messages,
        "user_s_input": user_input,
        "g_recaptcha_token": "",
        "is_private": True,
        "push_token": "",
        "session_state": {
            "steps": [],
            "messages": messages,
        },
    }

    return payload

def parse_genspark_stream(response):
    """Parse Genspark SSE stream."""
    for line in response.iter_lines():
        if not line:
            continue

        line = line.decode('utf-8')
        if not line.startswith('data: '):
            continue

        data = line[6:].strip()
        if data == '[DONE]':
            continue

        try:
            event = json.loads(data)
            yield event
        except json.JSONDecodeError:
            continue

def should_process_event(event: dict) -> bool:
    """Check if event should be processed."""
    event_type = event.get("type")
    field_name = event.get("field_name")

    return (
        (event_type == "message_field_delta" and field_name == "content") or
        (event_type == "message_field" and field_name == "content" and event.get("delta") is not None) or
        (event_type == "project_field" and event.get("field_value") == "FINISHED")
    )

def extract_content(event: dict) -> str:
    """Extract content from event."""
    event_type = event.get("type")
    field_name = event.get("field_name")

    # Prefer delta over field_value to avoid duplicates
    if event_type == "message_field_delta" and field_name == "content":
        return event.get("delta", "")
    elif event_type == "message_field" and field_name == "content":
        # Only use field_value if it's incremental (not full content)
        # Check if this is a delta-style update
        delta = event.get("delta")
        if delta is not None:
            return delta
        # Otherwise use field_value but this might cause duplicates
        return event.get("field_value", "")
    return ""

def is_finished(event: dict) -> bool:
    """Check if stream is finished."""
    return event.get("type") == "project_field" and event.get("field_value") == "FINISHED"

def parse_tool_calls_from_content(content: str) -> tuple[str, list]:
    """Parse tool calls from model response content.

    Returns: (cleaned_content, tool_calls)
    """
    import re

    # Try to find JSON tool calls in the content
    tool_calls = []
    cleaned_content = content

    # Look for JSON pattern: {"tool_calls": [...]}
    json_pattern = r'\{["\']tool_calls["\']\s*:\s*\[.*?\]\s*\}'
    matches = re.finditer(json_pattern, content, re.DOTALL)

    for match in matches:
        try:
            tool_data = json.loads(match.group())
            calls = tool_data.get("tool_calls", [])

            for call in calls:
                tool_calls.append({
                    "id": f"call_{len(tool_calls)}",
                    "type": "function",
                    "function": {
                        "name": call.get("name", ""),
                        "arguments": json.dumps(call.get("arguments", {}))
                    }
                })

            # Remove the JSON from content
            cleaned_content = cleaned_content.replace(match.group(), "").strip()
        except json.JSONDecodeError:
            continue

    return cleaned_content, tool_calls if tool_calls else None

def create_stream_chunk(request_id: str, content: str, finish_reason: str = None) -> dict:
    """Create OpenAI-compatible stream chunk."""
    return {
        "id": request_id,
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": "gpt-4",
        "choices": [{
            "index": 0,
            "delta": {} if finish_reason else {"content": content},
            "finish_reason": finish_reason,
        }],
    }

def create_non_stream_response(request_id: str, content: str) -> dict:
    """Create OpenAI-compatible non-stream response."""
    # Parse tool calls from content
    cleaned_content, tool_calls = parse_tool_calls_from_content(content)

    # Use cleaned content if available, otherwise use original
    final_content = cleaned_content if cleaned_content else content

    message = {
        "role": "assistant",
        "content": final_content if not tool_calls else None,
    }

    if tool_calls:
        message["tool_calls"] = tool_calls

    return {
        "id": request_id,
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "gpt-4",
        "choices": [{
            "index": 0,
            "message": message,
            "finish_reason": "tool_calls" if tool_calls else "stop",
        }],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        },
    }

async def stream_genspark_response(genspark_payload: dict, session_id: str, request_id: str) -> AsyncGenerator[str, None]:
    """Stream response from Genspark API."""
    headers = {
        'Content-Type': 'application/json',
        'Cookie': f'session_id={session_id}',
        'Origin': 'https://www.genspark.ai',
        'Referer': 'https://www.genspark.ai/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    }

    response = requests.post(
        'https://www.genspark.ai/api/agent/ask_proxy',
        headers=headers,
        json=genspark_payload,
        stream=True
    )

    if response.status_code != 200:
        raise Exception(f"Genspark API error: {response.status_code}")

    full_content = ""
    in_tool_call_json = False
    finished_properly = False

    for event in parse_genspark_stream(response):
        if not should_process_event(event):
            continue

        if is_finished(event):
            finished_properly = True
            # Parse tool calls from accumulated content
            cleaned_content, tool_calls = parse_tool_calls_from_content(full_content)

            if tool_calls:
                # Send tool calls as proper delta chunks
                for i, tool_call in enumerate(tool_calls):
                    tool_chunk = {
                        "id": request_id,
                        "object": "chat.completion.chunk",
                        "created": int(time.time()),
                        "model": "gpt-4",
                        "choices": [{
                            "index": 0,
                            "delta": {
                                "tool_calls": [{
                                    "index": i,
                                    "id": tool_call["id"],
                                    "type": tool_call["type"],
                                    "function": {
                                        "name": tool_call["function"]["name"],
                                        "arguments": tool_call["function"]["arguments"]
                                    }
                                }]
                            },
                            "finish_reason": None,
                        }],
                    }
                    yield f"data: {json.dumps(tool_chunk)}\n\n"

                # Final chunk with tool_calls finish reason
                final_chunk = create_stream_chunk(request_id, "", "tool_calls")
            else:
                # Normal finish
                final_chunk = create_stream_chunk(request_id, "", "stop")

            yield f"data: {json.dumps(final_chunk)}\n\n"
            yield "data: [DONE]\n\n"
            break

        content = extract_content(event)
        if content:
            full_content += content

            # Detect start of tool call JSON - check for opening brace
            if not in_tool_call_json and (content.strip().startswith('{') or '{"tool' in full_content):
                in_tool_call_json = True

            # Don't stream if we're in tool call JSON
            if in_tool_call_json:
                continue

            # Stream normal content
            chunk = create_stream_chunk(request_id, content)
            yield f"data: {json.dumps(chunk)}\n\n"

    # Handle case where stream ends without FINISHED event
    if not finished_properly:
        # Parse tool calls from accumulated content
        cleaned_content, tool_calls = parse_tool_calls_from_content(full_content)

        if tool_calls:
            # Send tool calls as proper delta chunks
            for i, tool_call in enumerate(tool_calls):
                tool_chunk = {
                    "id": request_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": "gpt-4",
                    "choices": [{
                        "index": 0,
                        "delta": {
                            "tool_calls": [{
                                "index": i,
                                "id": tool_call["id"],
                                "type": tool_call["type"],
                                "function": {
                                    "name": tool_call["function"]["name"],
                                    "arguments": tool_call["function"]["arguments"]
                                }
                            }]
                        },
                        "finish_reason": None,
                    }],
                }
                yield f"data: {json.dumps(tool_chunk)}\n\n"

            # Final chunk with tool_calls finish reason
            final_chunk = create_stream_chunk(request_id, "", "tool_calls")
        else:
            # Normal finish
            final_chunk = create_stream_chunk(request_id, "", "stop")

        yield f"data: {json.dumps(final_chunk)}\n\n"
        yield "data: [DONE]\n\n"

@app.post("/api/v1/chat/completions")
async def chat_completions(request: Request):
    """OpenAI-compatible chat completions endpoint."""
    # Get session ID from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response(
            content=json.dumps({"error": "Missing or invalid Authorization header"}),
            status_code=401,
            media_type="application/json"
        )

    session_id = auth_header[7:]  # Remove "Bearer " prefix

    # Parse request body
    body = await request.json()

    # Create Genspark payload
    genspark_payload = create_genspark_payload(body)
    request_id = f"chatcmpl-{int(time.time() * 1000)}"

    # Handle streaming
    if body.get("stream", False):
        return StreamingResponse(
            stream_genspark_response(genspark_payload, session_id, request_id),
            media_type="text/event-stream"
        )

    # Handle non-streaming
    full_content = ""
    headers = {
        'Content-Type': 'application/json',
        'Cookie': f'session_id={session_id}',
        'Origin': 'https://www.genspark.ai',
        'Referer': 'https://www.genspark.ai/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    }

    response = requests.post(
        'https://www.genspark.ai/api/agent/ask_proxy',
        headers=headers,
        json=genspark_payload,
        stream=True
    )

    for event in parse_genspark_stream(response):
        if not should_process_event(event):
            continue
        if is_finished(event):
            break
        content = extract_content(event)
        if content:
            full_content += content

    return create_non_stream_response(request_id, full_content)

@app.get("/api/v1/models")
async def list_models():
    """List available models."""
    return {
        "object": "list",
        "data": [
            {"id": model, "object": "model", "owned_by": "genspark"}
            for model in MODEL_MAP.keys()
        ]
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Genspark OpenAI Proxy API (Python)"}
