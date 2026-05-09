#!/usr/bin/env python3
"""Test tool calling with OpenAI library"""

from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8009/api/v1",
    api_key="497d7568-4f1f-4d5f-89b9-2ab7e3b73a72:14127ec0a770888080d767aeea396edb706b0df1a7c836ccaf0e1961045bc657""
)

# Test 1: Simple message without tools
print("=== Test 1: Simple message ===")
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {"role": "user", "content": "say hello"}
    ],
    stream=False
)
print(f"Content: {response.choices[0].message.content}")
print()

# Test 2: Message with tools
print("=== Test 2: With tools ===")
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city name"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {"role": "user", "content": "What is the weather in Jakarta?"}
    ],
    tools=tools,
    stream=False
)

print(f"Content: {response.choices[0].message.content}")
print(f"Tool calls: {response.choices[0].message.tool_calls}")

