import { GensparkRequest, OpenAIChatRequest, GensparkStreamEvent } from '@/types'
import { mapModel } from './models'

function extractUserInput(messages: any[]): string {
  if (!messages || messages.length === 0) return ''

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage) return ''

  const content = lastMessage.content

  // Handle string content
  if (typeof content === 'string') {
    return content
  }

  // Handle array content (OpenCode format)
  if (Array.isArray(content)) {
    // Extract text from array of content blocks
    const textParts = content
      .filter((item: any) => item.type === 'text' && item.text)
      .map((item: any) => item.text)
    return textParts.join(' ')
  }

  return ''
}

export function createGensparkPayload(openaiRequest: OpenAIChatRequest): GensparkRequest {
  const model = mapModel(openaiRequest.model)
  const messages = openaiRequest.messages || []
  const userInput = extractUserInput(messages)

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
    user_s_input: userInput,
    g_recaptcha_token: '',
    is_private: true,
    push_token: '',
    session_state: {
      steps: [],
      messages: messages,
    },
  }
}

export async function callGensparkAPI(
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

    // Collect stderr in background
    let stderrData = ''
    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString()
    })

    // Write payload to stdin
    proc.stdin.write(payloadJson)
    proc.stdin.end()

    // Stream stdout
    for await (const chunk of proc.stdout) {
      yield chunk.toString()
    }

    // Check for errors after streaming completes
    if (stderrData.trim()) {
      console.error('[Genspark] Stderr:', stderrData)
      throw new Error(`Curl error: ${stderrData}`)
    }
  })()
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

