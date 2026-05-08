import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIModelsResponse } from '@/types'
import { getAvailableModels } from '@/lib/models'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<OpenAIModelsResponse | { error: string }>
): void {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const models = getAvailableModels()

  res.status(200).json({
    object: 'list',
    data: models,
  })
}
