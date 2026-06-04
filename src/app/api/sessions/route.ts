import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import type { CreateSessionResponse } from '@/types'

export async function POST(): Promise<NextResponse> {
  try {
    const [session] = await db.insert(sessions).values({}).returning()

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status as 'active' | 'completed',
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/sessions]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
