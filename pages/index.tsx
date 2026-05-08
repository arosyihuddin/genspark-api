export default function Home() {
  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Genspark OpenAI Proxy</h1>
      <p>OpenAI-compatible API proxy for Genspark AI</p>

      <h2>Endpoints</h2>
      <ul>
        <li><code>POST /api/v1/chat/completions</code> - Chat completions (streaming & non-streaming)</li>
        <li><code>GET /api/v1/models</code> - List available models</li>
      </ul>

      <h2>Usage</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`curl https://your-domain.vercel.app/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'`}
      </pre>

      <h2>Supported Models</h2>
      <ul>
        <li><code>gpt-4</code>, <code>gpt-4-turbo</code>, <code>gpt-4o</code> → Grok 4.20</li>
        <li><code>claude-sonnet-4-6</code> → Claude Sonnet 4.6</li>
        <li><code>claude-opus-4-6</code> → Claude Opus 4.6</li>
        <li><code>gpt-5</code>, <code>gpt-5-pro</code> → GPT-5</li>
        <li><code>gemini-2.5-pro</code> → Gemini 2.5 Pro</li>
        <li><code>deepseek-v3</code>, <code>deepseek-r1</code> → DeepSeek</li>
      </ul>

      <h2>Configuration</h2>
      <p>Set environment variables in Vercel:</p>
      <ul>
        <li><code>GENSPARK_SESSION_ID</code> - Your Genspark session ID (required)</li>
        <li><code>API_KEY</code> - Optional API key for authentication</li>
      </ul>

      <h2>Links</h2>
      <ul>
        <li><a href="https://github.com/yourusername/genspark-openai-proxy">GitHub Repository</a></li>
        <li><a href="https://www.genspark.ai">Genspark AI</a></li>
      </ul>
    </div>
  )
}
