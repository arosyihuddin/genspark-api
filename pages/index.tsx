'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [baseUrl, setBaseUrl] = useState('https://your-domain.vercel.app')

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Genspark OpenAI Proxy</h1>
      <p>OpenAI-compatible API proxy for Genspark AI</p>

      <h2>Base URL</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
        {baseUrl}/api/v1
      </pre>

      <h2>Endpoints</h2>
      <ul>
        <li><code>POST /api/v1/chat/completions</code> - Chat completions (streaming & non-streaming)</li>
        <li><code>GET /api/v1/models</code> - List available models</li>
      </ul>

      <h2>Usage Example</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '0.85rem' }}>
{`curl ${baseUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_GENSPARK_SESSION_ID" \\
  -d '{
    "model": "gpt-5.4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'`}
      </pre>

      <h2>Authentication</h2>
      <p>Use your Genspark session ID as the Bearer token:</p>
      <ol>
        <li>Login to <a href="https://www.genspark.ai" target="_blank">genspark.ai</a></li>
        <li>Open DevTools (F12) → Application → Cookies</li>
        <li>Copy the <code>session_id</code> value</li>
        <li>Use it as: <code>Authorization: Bearer YOUR_SESSION_ID</code></li>
      </ol>

      <h2>Supported Models</h2>
      <p>18 models available - <a href="/api/v1/models">view all models</a></p>

      <h2>Links</h2>
      <ul>
        <li><a href="https://github.com/arosyihuddin/genspark-api" target="_blank">GitHub Repository</a></li>
        <li><a href="https://www.genspark.ai" target="_blank">Genspark AI</a></li>
      </ul>
    </div>
  )
}
