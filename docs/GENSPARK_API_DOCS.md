# Genspark API Documentation

> **Catatan**: Dokumentasi ini berdasarkan reverse engineering API Genspark per 8 Mei 2026.
> API official di `/v1/*` tidak tersedia. Endpoint yang benar adalah `/api/agent/ask_proxy`.

## Session ID

```
session_id=c4f9863c-8c95-43a6-b772-c485550f6908:a61a1b14d963dfaed0f54f2398961d3e91088a5550ba8d0f9efcdb0bbf3f6a4b
```

---

## Endpoints

### 1. Chat/Ask (POST)

**URL:**
```
POST https://www.genspark.ai/api/agent/ask_proxy
```

**Headers (Minimal):**
```http
Content-Type: application/json
Cookie: session_id=c4f9863c-8c95-43a6-b772-c485550f6908:a61a1b14d963dfaed0f54f2398961d3e91088a5550ba8d0f9efcdb0bbf3f6a4b
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
```

**Payload:**
```json
{
  "ai_chat_model": "grok-4.20-0309-non-reasoning",
  "ai_chat_enable_search": false,
  "ai_chat_disable_personalization": false,
  "use_moa_proxy": false,
  "moa_models": [],
  "writingContent": null,
  "type": "ai_chat",
  "project_id": null,
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello"}
  ],
  "user_s_input": "Hello",
  "g_recaptcha_token": "",
  "is_private": true,
  "push_token": "",
  "session_state": {
    "steps": [],
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "Hello"}
    ]
  }
}
```

**Response (SSE Stream):**
```
data: {"id": "...", "type": "project_start"}
data: {"message_id": "...", "field_name": "content", "delta": "Hello", "type": "message_field_delta"}
data: {"message_id": "...", "field_name": "content", "field_value": "Hello", "type": "message_field"}
data: {"type": "message_result", "message": {"content": "Hello", ...}}
data: {"field_name": "status", "field_value": "FINISHED", "type": "project_field"}
```

**cURL Example:**
```bash
curl -X POST https://www.genspark.ai/api/agent/ask_proxy \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=c4f9863c-8c95-43a6-b772-c485550f6908:a61a1b14d963dfaed0f54f2398961d3e91088a5550ba8d0f9efcdb0bbf3f6a4b" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36" \
  -d '{
    "ai_chat_model": "grok-4.20-0309-non-reasoning",
    "ai_chat_enable_search": false,
    "type": "ai_chat",
    "project_id": null,
    "messages": [{"role": "user", "content": "Hello"}],
    "user_s_input": "Hello",
    "is_private": true,
    "session_state": {
      "messages": [{"role": "user", "content": "Hello"}]
    }
  }'
```

---

### 2. List Projects/Conversations (GET)

**URL:**
```
GET https://www.genspark.ai/api/project/my?from=agents
```

**Headers (Minimal):**
```http
Cookie: session_id=c4f9863c-8c95-43a6-b772-c485550f6908:a61a1b14d963dfaed0f54f2398961d3e91088a5550ba8d0f9efcdb0bbf3f6a4b
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
```

**Response:**
```json
{
  "status": 0,
  "data": {
    "projects": [
      {
        "id": "0e9c5f9b-b971-4a5b-b943-49c409226832",
        "chat_model": "grok-4.20-0309-non-reasoning",
        "name": "One-word hello request",
        "type": "ai_chat",
        "status": "FINISHED",
        "ctime": "2026-05-08T16:46:20.955172"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl https://www.genspark.ai/api/project/my?from=agents \
  -H "Cookie: session_id=c4f9863c-8c95-43a6-b772-c485550f6908:a61a1b14d963dfaed0f54f2398961d3e91088a5550ba8d0f9efcdb0bbf3f6a4b" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
```

---

### 3. Delete Project (GET)

**URL:**
```
GET https://www.genspark.ai/api/project/delete?project_id={PROJECT_ID}
```

**Headers:**
```http
Cookie: session_id=c4f9863c-8c95-43a6-b772-c485550f6908:a61a1b14d963dfaed0f54f2398961d3e91088a5550ba8d0f9efcdb0bbf3f6a4b
```

---

## Authentication

**Metode:** Session-based Cookie

**Format Cookie:**
```
session_id=<uuid>:<hash>
```

**Cara Mendapatkan Session ID:**
1. Login ke https://www.genspark.ai
2. Buka DevTools (F12) → Application → Cookies
3. Copy nilai `session_id`

**Catatan:**
- ❌ Tidak ada JWT token
- ❌ Tidak ada Bearer token
- ❌ Endpoint `/v1/*` tidak tersedia
- ✅ Hanya cookie `session_id` yang berfungsi

---

## Supported Roles

- ✅ `system` - Custom instructions (berfungsi dengan baik)
- ✅ `user` - User messages
- ✅ `assistant` - Multi-turn conversation

**Contoh dengan System Role:**
```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant that always responds in Indonesian."},
    {"role": "user", "content": "What is 2+2?"}
  ],
  "session_state": {
    "messages": [
      {"role": "system", "content": "You are a helpful assistant that always responds in Indonesian."},
      {"role": "user", "content": "What is 2+2?"}
    ]
  }
}
```

---

## Available Models

Dari testing, model yang tersedia:
- `grok-4.20-0309-non-reasoning`
- `claude-sonnet-4-6`
- `claude-opus-4-6`
- `gpt-5`, `gpt-5-pro`
- `gemini-2.5-pro`
- `deep-seek-v3`, `deep-seek-r1`

**Catatan:** Tidak ada endpoint untuk list models. Harus hardcode atau scrape dari web.

---

## ReCaptcha V3

Genspark menggunakan **Google ReCaptcha Enterprise** dengan site key:
```
6LfYyWcsAAAAAK8DUr6Oo1wHl2CJ5kKbO0AK3LIM
```

**Field di payload:**
```json
{
  "g_recaptcha_token": "..."
}
```

Jika tidak ada token, request mungkin ditolak atau model "dumbing down".

---

## Perbedaan dengan Code Lama

Proyek `genspark2api` ini **outdated**. Perubahan API:

| Aspek | Code Lama | API Baru |
|-------|-----------|----------|
| Endpoint | `/api/copilot/ask` | `/api/agent/ask_proxy` |
| Type | `COPILOT_MOA_CHAT` | `ai_chat` |
| Model field | `extra_data.models` | `ai_chat_model` |
| Structure | Nested `extra_data` | Flat structure |

---

## Testing Results

✅ **Berhasil ditest:**
- Chat dengan system role → Berfungsi
- Multi-turn conversation → Berfungsi
- List projects → Berfungsi
- Session cookie authentication → Berfungsi

❌ **Tidak tersedia:**
- JWT token
- Bearer authentication
- `/v1/chat/completions` endpoint
- `/v1/models` endpoint

---

## Next Steps untuk Update Proyek

1. Update `controller/chat.go` line 29:
   ```go
   apiEndpoint = baseURL + "/api/agent/ask_proxy"
   ```

2. Update `controller/chat.go` line 32:
   ```go
   chatType = "ai_chat"
   ```

3. Update payload structure di `createRequestBody()` function

4. Test dengan session ID yang valid
