import { OpenAIModel } from '@/types'

export const MODEL_MAP: Record<string, string> = {
  // GPT models
  'gpt-4': 'grok-4.20-0309-non-reasoning',
  'gpt-4-turbo': 'grok-4.20-0309-non-reasoning',
  'gpt-4o': 'grok-4.20-0309-non-reasoning',
  'gpt-3.5-turbo': 'grok-4.20-0309-non-reasoning',
  'gpt-5': 'gpt-5.2-pro',
  'gpt-5-pro': 'gpt-5.2-pro',
  'gpt-5.2-pro': 'gpt-5.2-pro',
  'gpt-5.4': 'gpt-5.4',
  'gpt-5.4-mini': 'gpt-5.4-mini',
  'gpt-5.4-nano': 'gpt-5.4-nano',
  'gpt-5.4-pro': 'gpt-5.4-pro',
  'gpt-5.5': 'gpt-5.5',

  // Claude models
  'claude-3-5-sonnet': 'claude-sonnet-4-6',
  'claude-3-opus': 'claude-opus-4-6',
  'claude-sonnet-4-6': 'claude-sonnet-4-6',
  'claude-opus-4-6': 'claude-opus-4-6',
  'claude-opus-4-7': 'claude-opus-4-7',
  'claude-4-5-haiku': 'claude-4-5-haiku',

  // Grok models
  'grok-4.20-0309-non-reasoning': 'grok-4.20-0309-non-reasoning',
  'grok-4.20-0309-reasoning': 'grok-4.20-0309-reasoning',

  // O3 models
  'o3-pro': 'o3-pro',

  // Gemini models
  'gemini-2.5-pro': 'gemini-2.5-pro',
  'gemini-3-flash-preview': 'gemini-3-flash-preview',
  'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview',

  // DeepSeek models
  'deepseek-v3': 'deep-seek-v3',
  'deepseek-v4-pro': 'deep-seek-v4-pro',
  'deepseek-r1': 'deep-seek-r1',

  // Trinity models
  'trinity-large-thinking': 'trinity-large-thinking',
}

export function mapModel(openaiModel: string): string {
  return MODEL_MAP[openaiModel] || openaiModel
}

// Static list of all available models
export function getAvailableModels(): OpenAIModel[] {
  const models: OpenAIModel[] = [
    // Claude models
    { id: 'claude-4-5-haiku', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'claude-opus-4-6', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'claude-opus-4-7', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'claude-sonnet-4-6', object: 'model', created: 1687882411, owned_by: 'genspark' },

    // DeepSeek models
    { id: 'deep-seek-v4-pro', object: 'model', created: 1687882411, owned_by: 'genspark' },

    // Gemini models
    { id: 'gemini-2.5-pro', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gemini-3-flash-preview', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gemini-3.1-pro-preview', object: 'model', created: 1687882411, owned_by: 'genspark' },

    // GPT models
    { id: 'gpt-5.2-pro', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gpt-5.4', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gpt-5.4-mini', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gpt-5.4-nano', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gpt-5.4-pro', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'gpt-5.5', object: 'model', created: 1687882411, owned_by: 'genspark' },

    // Grok models
    { id: 'grok-4.20-0309-non-reasoning', object: 'model', created: 1687882411, owned_by: 'genspark' },
    { id: 'grok-4.20-0309-reasoning', object: 'model', created: 1687882411, owned_by: 'genspark' },

    // O3 models
    { id: 'o3-pro', object: 'model', created: 1687882411, owned_by: 'genspark' },

    // Trinity models
    { id: 'trinity-large-thinking', object: 'model', created: 1687882411, owned_by: 'genspark' },
  ]

  return models.sort((a, b) => a.id.localeCompare(b.id))
}
