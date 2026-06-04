import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { messages } from '@/db/schema'
import { streamInterviewResponse } from '@/services/claude'
import type { Message, SendMessageRequest, ImageMediaType } from '@/types'

const ALLOWED_MEDIA_TYPES: ImageMediaType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: sessionId } = await params
  const body = (await req.json()) as SendMessageRequest

  if (!body.content || body.content.trim().length === 0) {
    return NextResponse.json(
      { error: 'Message content cannot be empty' },
      { status: 400 },
    )
  }

  if (body.image !== undefined) {
    if (typeof body.image.base64 !== 'string' || body.image.base64.length === 0) {
      return NextResponse.json(
        { error: 'Image base64 data is invalid' },
        { status: 400 },
      )
    }
    if (!ALLOWED_MEDIA_TYPES.includes(body.image.mediaType)) {
      return NextResponse.json(
        { error: 'Unsupported image media type' },
        { status: 400 },
      )
    }
  }

  // Store content: plain string for text-only, JSON string when image is present
  const storedContent =
    body.image !== undefined
      ? JSON.stringify({ text: body.content.trim(), image: body.image })
      : body.content.trim()

  // Save the user message
  await db.insert(messages).values({
    sessionId,
    role: 'user',
    content: storedContent,
  })

  // Fetch all messages for this session
  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt)

  const typedMessages: Message[] = sessionMessages.map((m) => ({
    id: m.id,
    sessionId: m.sessionId,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt,
  }))

  // Accumulate the full assistant response to save after stream
  let assistantContent = ''

  const upstream = streamInterviewResponse(typedMessages)
  const reader = upstream.getReader()
  const decoder = new TextDecoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk
          controller.enqueue(value)
        }
        controller.close()

        // Save assistant reply to DB after stream completes
        if (assistantContent.trim().length > 0) {
          await db.insert(messages).values({
            sessionId,
            role: 'assistant',
            content: assistantContent,
          })
        }
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
