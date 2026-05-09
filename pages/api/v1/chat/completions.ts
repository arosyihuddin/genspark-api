import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIChatRequest } from '@/types'
import { getSessionIdFromRequest } from '@/lib/auth'
import { createGensparkPayload, callGensparkAPI, parseGensparkStreamFromGenerator } from '@/lib/genspark'
import {
  createStreamChunk,
  createNonStreamResponse,
  shouldProcessEvent,
  extractContent,
  isFinished,
} from '@/lib/openai'

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
}

async function handleStreamingResponse(
  res: NextApiResponse,
  gensparkGenerator: AsyncGenerator<string>,
  requestId: string
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    for await (const event of parseGensparkStreamFromGenerator(gensparkGenerator)) {
      if (!shouldProcessEvent(event)) continue

      if (isFinished(event)) {
        const finalChunk = createStreamChunk(requestId, '', 'stop')
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
        res.write('data: [DONE]\n\n')
        break
      }

      const content = extractContent(event)
      if (content) {
        const chunk = createStreamChunk(requestId, content)
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    }
  } catch (error) {
    console.error('[Stream] Error:', error)
    throw error
  } finally {
    res.end()
  }
}

async function handleNonStreamingResponse(
  res: NextApiResponse,
  gensparkGenerator: AsyncGenerator<string>,
  requestId: string
): Promise<void> {
  let fullContent = ''

  try {
    for await (const event of parseGensparkStreamFromGenerator(gensparkGenerator)) {
      if (!shouldProcessEvent(event)) continue
      if (isFinished(event)) break

      const content = extractContent(event)
      if (content) {
        fullContent += content
      }
    }
  } catch (error) {
    console.error('[NonStream] Error:', error)
  }

  const response = createNonStreamResponse(requestId, fullContent)
  res.status(200).json(response)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sessionId = getSessionIdFromRequest(req)
    const openaiRequest = req.body as OpenAIChatRequest
    const gensparkPayload = createGensparkPayload(openaiRequest)
    const requestId = `chatcmpl-${Date.now()}`

    const gensparkGenerator = await callGensparkAPI(gensparkPayload, sessionId)

    if (openaiRequest.stream) {
      await handleStreamingResponse(res, gensparkGenerator, requestId)
    } else {
      await handleNonStreamingResponse(res, gensparkGenerator, requestId)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
