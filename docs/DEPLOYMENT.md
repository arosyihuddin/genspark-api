# Deployment Guide

## Deploy ke Vercel

### 1. Via Vercel Dashboard (Recommended)

1. Push code ke GitHub repository
2. Buka [Vercel Dashboard](https://vercel.com/new)
3. Import repository Anda
4. Set environment variables:
   - `GENSPARK_SESSION_ID` (required)
   - `API_KEY` (optional)
5. Deploy

### 2. Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add GENSPARK_SESSION_ID
vercel env add API_KEY

# Deploy production
vercel --prod
```

## Environment Variables

### GENSPARK_SESSION_ID (Required)

Cara mendapatkan:
1. Login ke https://www.genspark.ai
2. Buka DevTools (F12)
3. Application → Cookies → `session_id`
4. Copy nilai lengkap (format: `uuid:hash`)

### API_KEY (Optional)

Jika di-set, semua request harus menyertakan header:
```
Authorization: Bearer YOUR_API_KEY
```

Jika tidak di-set, authentication dinonaktifkan.

## Testing Deployment

```bash
# Test models endpoint
curl https://your-domain.vercel.app/api/v1/models

# Test chat (non-streaming)
curl https://your-domain.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'

# Test chat (streaming)
curl https://your-domain.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## Troubleshooting

### Error: GENSPARK_SESSION_ID not configured

Pastikan environment variable sudah di-set di Vercel dashboard.

### Error: 401 Unauthorized dari Genspark

Session ID Anda mungkin sudah expire. Dapatkan session ID baru dari browser.

### Streaming tidak bekerja

Pastikan client Anda support Server-Sent Events (SSE).

## Monitoring

Vercel menyediakan monitoring built-in:
- Logs: https://vercel.com/dashboard/logs
- Analytics: https://vercel.com/dashboard/analytics

## Updating Session ID

Jika session ID expire:

```bash
# Via CLI
vercel env rm GENSPARK_SESSION_ID
vercel env add GENSPARK_SESSION_ID

# Redeploy
vercel --prod
```

Atau update via Vercel dashboard → Settings → Environment Variables.
