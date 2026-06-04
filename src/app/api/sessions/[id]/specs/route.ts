import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { blueprints, specs } from '@/db/schema'
import { generateDevSpecs } from '@/services/claude'
import type { GenerateSpecsResponse } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<GenerateSpecsResponse | { error: string }>> {
  const { id: sessionId } = await params

  const [blueprint] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.sessionId, sessionId))
    .limit(1)

  if (!blueprint) {
    return NextResponse.json(
      { error: 'Blueprint must be generated before specs.' },
      { status: 400 },
    )
  }

  let specsContent: string
  try {
    specsContent = await generateDevSpecs(blueprint.content)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[specs] Claude API error:', message)
    return NextResponse.json({ error: `Claude API error: ${message}` }, { status: 500 })
  }

  const [spec] = await db
    .insert(specs)
    .values({
      sessionId,
      content: specsContent,
    })
    .onConflictDoUpdate({
      target: specs.sessionId,
      set: { content: specsContent },
    })
    .returning()

  return NextResponse.json({
    spec: {
      id: spec.id,
      sessionId: spec.sessionId,
      content: spec.content,
      createdAt: spec.createdAt,
    },
  })
}
