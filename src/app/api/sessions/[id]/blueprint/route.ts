import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { messages, blueprints, sessions } from '@/db/schema'
import { generateBlueprint } from '@/services/claude'
import type { Message, GenerateBlueprintResponse } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<GenerateBlueprintResponse | { error: string }>> {
  const { id: sessionId } = await params

  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt)

  if (sessionMessages.length === 0) {
    return NextResponse.json(
      { error: 'No messages found for this session' },
      { status: 400 },
    )
  }

  const typedMessages: Message[] = sessionMessages.map((m) => ({
    id: m.id,
    sessionId: m.sessionId,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt,
  }))

  let blueprintContent: string
  try {
    blueprintContent = await generateBlueprint(typedMessages)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[blueprint] Claude API error:', message)
    return NextResponse.json({ error: `Claude API error: ${message}` }, { status: 500 })
  }

  const [blueprint] = await db
    .insert(blueprints)
    .values({
      sessionId,
      content: blueprintContent,
    })
    .returning()

  await db
    .update(sessions)
    .set({ status: 'completed', updatedAt: new Date() })
    .where(eq(sessions.id, sessionId))

  return NextResponse.json({
    blueprint: {
      id: blueprint.id,
      sessionId: blueprint.sessionId,
      content: blueprint.content,
      createdAt: blueprint.createdAt,
    },
  })
}
