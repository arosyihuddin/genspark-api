import { GensparkRequest, OpenAIChatRequest, GensparkStreamEvent } from '@/types'
import { mapModel } from './models'

const GENSPARK_API = 'https://www.genspark.ai/api/agent/ask_proxy'
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'

export function createGensparkPayload(openaiRequest: OpenAIChatRequest): GensparkRequest {
  const model = mapModel(openaiRequest.model)
  const messages = openaiRequest.messages || []

  return {
    ai_chat_model: model,
    ai_chat_enable_search: false,
    ai_chat_disable_personalization: false,
    use_moa_proxy: false,
    moa_models: [],
    writingContent: null,
    type: 'ai_chat',
    project_id: null,
    messages: messages,
    user_s_input: messages[messages.length - 1]?.content || '',
    g_recaptcha_token: '',
    is_private: true,
    push_token: '',
    session_state: {
      steps: [],
      messages: messages,
    },
  }
}

export async function callGensparkAPIViaCurl(
  payload: GensparkRequest,
  sessionId: string
): Promise<AsyncGenerator<string>> {
  const { spawn } = await import('child_process')

  const payloadJson = JSON.stringify(payload)

  return (async function* () {
    const curl = spawn('curl', [
      '-s',
      '-N',
      '-X', 'POST',
      GENSPARK_API,
      '-H', 'Content-Type: application/json',
      '-H', `Cookie: session_id=${sessionId}`,
      '-H', `User-Agent: ${USER_AGENT}`,
      '-d', payloadJson
    ])

    for await (const chunk of curl.stdout) {
      yield chunk.toString()
    }

    // Check for errors
    const stderr: Buffer[] = []
    for await (const chunk of curl.stderr) {
      stderr.push(chunk)
    }

    if (stderr.length > 0) {
      throw new Error(`Curl error: ${Buffer.concat(stderr).toString()}`)
    }
  })()
}

export async function callGensparkAPI(
  payload: GensparkRequest,
  sessionId: string
): Promise<Response> {
  // Use curl to bypass Cloudflare
  const streamGenerator = await callGensparkAPIViaCurl(payload, sessionId)

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamGenerator) {
          controller.enqueue(new TextEncoder().encode(chunk))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' }
  })
}

export async function* parseGensparkStream(
  response: Response
): AsyncGenerator<GensparkStreamEvent> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data) as GensparkStreamEvent
          yield parsed
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

