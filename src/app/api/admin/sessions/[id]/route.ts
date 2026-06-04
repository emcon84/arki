import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { sessions, messages, blueprints, specs, feedbacks } from '@/db/schema'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Delete in dependency order
  await db.delete(feedbacks).where(eq(feedbacks.sessionId, id))
  await db.delete(specs).where(eq(specs.sessionId, id))
  await db.delete(blueprints).where(eq(blueprints.sessionId, id))
  await db.delete(messages).where(eq(messages.sessionId, id))
  await db.delete(sessions).where(eq(sessions.id, id))

  return NextResponse.json({ success: true })
}
