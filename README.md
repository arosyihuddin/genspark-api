# Genspark OpenAI Proxy

OpenAI-compatible API proxy untuk Genspark AI. Deploy ke Vercel dalam hitungan menit.

## Features

- ✅ OpenAI-compatible API (`/v1/chat/completions`, `/v1/models`)
- ✅ Streaming & non-streaming support
- ✅ Multiple model support (GPT-4, Claude, Gemini, DeepSeek)
- ✅ Deploy ke Vercel dengan 1 klik
- ✅ Optional API key authentication

## Quick Start

### 1. Deploy ke Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/genspark-openai-proxy)

### 2. Set Environment Variables

Di Vercel dashboard, tambahkan environment variables:

```bash
GENSPARK_SESSION_ID=your-session-id-here
API_KEY=your-optional-api-key  # Optional
```

**Cara mendapatkan Session ID:**
1. Login ke https://www.genspark.ai
2. Buka DevTools (F12) → Application → Cookies
3. Copy nilai `session_id`

### 3. Test API

```bash
curl https://your-domain.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

## Supported Models

| OpenAI Model | Genspark Model |
|--------------|----------------|
| `gpt-4`, `gpt-4-turbo`, `gpt-4o` | Grok 4.20 |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 |
| `claude-opus-4-6` | Claude Opus 4.6 |
| `gpt-5`, `gpt-5-pro` | GPT-5 |
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `deepseek-v3`, `deepseek-r1` | DeepSeek |

## API Endpoints

### POST `/api/v1/chat/completions`

OpenAI-compatible chat completions endpoint.

**Request:**
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

**Response (streaming):**
```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: [DONE]
```

### GET `/api/v1/models`

List available models.

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1687882411,
      "owned_by": "genspark"
    }
  ]
}
```

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your GENSPARK_SESSION_ID

# Run dev server
npm run dev
```

Visit http://localhost:3000

## Use with OpenAI SDK

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-domain.vercel.app/api/v1",
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="gpt-4",
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
  apiKey: 'your-api-key'
});

const stream = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## Authentication

Jika `API_KEY` environment variable di-set, semua request harus menyertakan header:

```
Authorization: Bearer YOUR_API_KEY
```

Jika `API_KEY` tidak di-set, authentication dinonaktifkan.

## Limitations

- Session ID bisa expire, perlu diperbarui secara manual
- Rate limiting tergantung pada akun Genspark Anda
- Tidak ada support untuk function calling (belum ditest)

## Troubleshooting

**Error: GENSPARK_SESSION_ID not configured**
- Pastikan environment variable `GENSPARK_SESSION_ID` sudah di-set di Vercel

**Error: 401 Unauthorized dari Genspark**
- Session ID Anda mungkin sudah expire
- Login ulang ke Genspark dan dapatkan session ID baru

**Streaming tidak bekerja**
- Pastikan client Anda support SSE (Server-Sent Events)
- Coba dengan `stream: false` untuk non-streaming mode

## License

MIT

## Credits

Based on reverse-engineered Genspark API. See [GENSPARK_API_DOCS.md](./GENSPARK_API_DOCS.md) for details.
