import { OpenAIChatResponse, OpenAIChatStreamChunk, GensparkStreamEvent } from '@/types'

export function createStreamChunk(
  requestId: string,
  content: string,
  finishReason: 'stop' | null = null
): OpenAIChatStreamChunk {
  return {
    id: requestId,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-4',
    choices: [{
      index: 0,
      delta: finishReason ? {} : { content },
      finish_reason: finishReason,
    }],
  }
}

export function createNonStreamResponse(
  requestId: string,
  content: string
): OpenAIChatResponse {
  return {
    id: requestId,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-4',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: content,
      },
      finish_reason: 'stop',
    }],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
}

export function shouldProcessEvent(event: GensparkStreamEvent): boolean {
  return (
    (event.type === 'message_field_delta' && event.field_name === 'content') ||
    (event.type === 'project_field' && event.field_value === 'FINISHED')
  )
}

export function extractContent(event: GensparkStreamEvent): string {
  if (event.type === 'message_field_delta' && event.field_name === 'content') {
    return event.delta || ''
  }
  return ''
}

export function isFinished(event: GensparkStreamEvent): boolean {
  return event.type === 'project_field' && event.field_value === 'FINISHED'
}
