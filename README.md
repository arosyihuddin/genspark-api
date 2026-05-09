# Genspark OpenAI Proxy (Python)

OpenAI-compatible API proxy untuk Genspark AI, built with FastAPI and Python.

## Why Python?

Node.js implementation memerlukan shell scripts untuk bypass Cloudflare protection. Python's `requests` library dapat bypass Cloudflare langsung tanpa external dependencies, making it deployable to serverless platforms.

## Features

- ✅ OpenAI-compatible API (`/v1/chat/completions`, `/v1/models`)
- ✅ Streaming & non-streaming support
- ✅ Support multiple models (GPT, Claude, Grok, Gemini, DeepSeek, O3, Trinity)
- ✅ Bypass Cloudflare protection natively
- ✅ Deploy ke Vercel/Railway/Render
- ✅ No environment variables needed - users provide their own session ID

## Quick Start

### 1. Deploy ke Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/arosyihuddin/genspark-api)

### 2. Get Your Genspark Session ID

1. Login ke https://www.genspark.ai
2. Buka DevTools (F12) → Application → Cookies
3. Copy nilai `session_id`

### 3. Use the API

```bash
curl https://your-domain.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GENSPARK_SESSION_ID" \
  -d '{
    "model": "gpt-5.4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

## Supported Models

18 models tersedia:

| Model ID | Provider |
|----------|----------|
| `claude-4-5-haiku` | Anthropic |
| `claude-opus-4-6` | Anthropic |
| `claude-opus-4-7` | Anthropic |
| `claude-sonnet-4-6` | Anthropic |
| `deep-seek-v4-pro` | DeepSeek |
| `gemini-2.5-pro` | Google |
| `gemini-3-flash-preview` | Google |
| `gemini-3.1-pro-preview` | Google |
| `gpt-5.2-pro` | OpenAI |
| `gpt-5.4` | OpenAI |
| `gpt-5.4-mini` | OpenAI |
| `gpt-5.4-nano` | OpenAI |
| `gpt-5.4-pro` | OpenAI |
| `gpt-5.5` | OpenAI |
| `grok-4.20-0309-non-reasoning` | xAI |
| `grok-4.20-0309-reasoning` | xAI |
| `o3-pro` | OpenAI |
| `trinity-large-thinking` | Trinity |

## API Endpoints

### POST `/api/v1/chat/completions`

OpenAI-compatible chat completions endpoint.

**Request:**
```json
{
  "model": "gpt-5.4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

**Headers:**
```
Authorization: Bearer YOUR_GENSPARK_SESSION_ID
Content-Type: application/json
```

### GET `/api/v1/models`

List available models.

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-5.4",
      "object": "model",
      "created": 1687882411,
      "owned_by": "genspark"
    }
  ]
}
```

## Use with OpenAI SDK

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-domain.vercel.app/api/v1",
    api_key="your-genspark-session-id"
)

response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")
```

### Node.js

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://your-domain.vercel.app/api/v1',
  apiKey: 'your-genspark-session-id'
});

const stream = await client.chat.completions.create({
  model: 'gpt-5.4',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## Authentication

Each user provides their own Genspark session ID as the API key. No server-side configuration needed.

**Format:**
```
Authorization: Bearer <your-genspark-session-id>
```

## Local Development

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv pip install fastapi uvicorn requests

# Run dev server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Visit http://localhost:8000

## Limitations

- Session ID bisa expire, perlu diperbarui secara manual
- Rate limiting tergantung pada akun Genspark Anda

## License

MIT

## Credits

Based on reverse-engineered Genspark API. See [GENSPARK_API_DOCS.md](./GENSPARK_API_DOCS.md) for details.
