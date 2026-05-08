import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIChatRequest } from '@/types'
import { authenticate, getSessionId } from '@/lib/auth'
import { createGensparkPayload, callGensparkAPI, parseGensparkStream } from '@/lib/genspark'
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
  gensparkResponse: Response,
  requestId: string
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    for await (const event of parseGensparkStream(gensparkResponse)) {
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
    console.error('Stream error:', error)
  } finally {
    res.end()
  }
}

async function handleNonStreamingResponse(
  res: NextApiResponse,
  gensparkResponse: Response,
  requestId: string
): Promise<void> {
  let fullContent = ''

  try {
    for await (const event of parseGensparkStream(gensparkResponse)) {
      if (!shouldProcessEvent(event)) continue

      if (isFinished(event)) break

      const content = extractContent(event)
      if (content) {
        fullContent += content
      }
    }
  } catch (error) {
    console.error('Collection error:', error)
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

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const sessionId = getSessionId()
    const openaiRequest = req.body as OpenAIChatRequest
    const gensparkPayload = createGensparkPayload(openaiRequest)
    const requestId = `chatcmpl-${Date.now()}`

    const gensparkResponse = await callGensparkAPI(gensparkPayload, sessionId)

    if (openaiRequest.stream) {
      await handleStreamingResponse(res, gensparkResponse, requestId)
    } else {
      await handleNonStreamingResponse(res, gensparkResponse, requestId)
    }
  } catch (error) {
    console.error('Handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
