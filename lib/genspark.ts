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
  const { join } = await import('path')

  const payloadJson = JSON.stringify(payload)
  const scriptPath = join(process.cwd(), 'scripts', 'genspark-curl.sh')

  return (async function* () {
    const proc = spawn(scriptPath, [sessionId], {
      shell: true
    })

    // Write payload to stdin
    proc.stdin.write(payloadJson)
    proc.stdin.end()

    for await (const chunk of proc.stdout) {
      yield chunk.toString()
    }

    // Check for errors
    const stderr: Buffer[] = []
    for await (const chunk of proc.stderr) {
      stderr.push(chunk)
    }

    if (stderr.length > 0) {
      const errorMsg = Buffer.concat(stderr).toString()
      if (errorMsg.trim()) {
        throw new Error(`Curl error: ${errorMsg}`)
      }
    }
  })()
}

export async function callGensparkAPI(
  payload: GensparkRequest,
  sessionId: string
): Promise<AsyncGenerator<string>> {
  return callGensparkAPIViaCurl(payload, sessionId)
}

export async function* parseGensparkStreamFromGenerator(
  generator: AsyncGenerator<string>
): AsyncGenerator<GensparkStreamEvent> {
  let buffer = ''

  for await (const chunk of generator) {
    buffer += chunk
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
}

