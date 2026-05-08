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

export async function callGensparkAPI(
  payload: GensparkRequest,
  sessionId: string
): Promise<Response> {
  const response = await fetch(GENSPARK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `session_id=${sessionId}`,
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Genspark API error: ${response.statusText} - ${errorText}`)
  }

  return response
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

