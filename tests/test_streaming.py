#!/usr/bin/env python3
"""Test streaming with OpenAI library"""

from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8009/api/v1",
    api_key="ebb824bc-8eeb-413a-a58b-392aa0f277d7:c809ce5d5b80b956860e8561d2eaefd7151cd668c6baeaf12048b6c21b8fb7e7"
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "The city name"}
                },
                "required": ["location"]
            }
        }
    }
]

print("=== Streaming with tools ===")
stream = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "What is the weather in Jakarta?"}],
    tools=tools,
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(f"Content: {chunk.choices[0].delta.content}")
    if chunk.choices[0].delta.tool_calls:
        print(f"Tool calls: {chunk.choices[0].delta.tool_calls}")
    if chunk.choices[0].finish_reason:
        print(f"Finish reason: {chunk.choices[0].finish_reason}")
