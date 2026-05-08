// OpenAI API Types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIChatRequest {
  model: string
  messages: OpenAIMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface OpenAIChatResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: 'stop' | 'length' | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenAIChatStreamChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      content?: string
      role?: 'assistant'
    }
    finish_reason: 'stop' | 'length' | null
  }>
}

export interface OpenAIModel {
  id: string
  object: 'model'
  created: number
  owned_by: string
}

export interface OpenAIModelsResponse {
  object: 'list'
  data: OpenAIModel[]
}

// Genspark API Types
export interface GensparkMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GensparkRequest {
  ai_chat_model: string
  ai_chat_enable_search: boolean
  ai_chat_disable_personalization: boolean
  use_moa_proxy: boolean
  moa_models: string[]
  writingContent: string | null
  type: 'ai_chat'
  project_id: string | null
  messages: GensparkMessage[]
  user_s_input: string
  g_recaptcha_token: string
  is_private: boolean
  push_token: string
  session_state: {
    steps: unknown[]
    messages: GensparkMessage[]
  }
}

export interface GensparkStreamEvent {
  type: string
  id?: string
  message_id?: string
  field_name?: string
  field_value?: string
  delta?: string
  message?: {
    content: string
    [key: string]: unknown
  }
}

// Model mapping type
export type ModelMap = Record<string, string>
