#!/usr/bin/env python3
"""Test tool calling with OpenAI library"""

from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8009/api/v1",
    api_key="ebb824bc-8eeb-413a-a58b-392aa0f277d7:c809ce5d5b80b956860e8561d2eaefd7151cd668c6baeaf12048b6c21b8fb7e7"
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

