#!/usr/bin/env python3
"""Test tool calling with OpenAI library"""

from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8009/api/v1",
    api_key="90817985-8bd3-47c8-b731-4493b9a5e333:227691b0fa9c2b2434711f06d5a0722e26582f02c870c288c6a28f767b64a6f3"
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

print("Response:")
print(response)
print("\nMessage:")
print(response.choices[0].message)
print("\nTool calls:")
print(response.choices[0].message.tool_calls)
