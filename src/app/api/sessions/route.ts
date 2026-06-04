import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import type { CreateSessionResponse } from '@/types'

export async function POST(): Promise<NextResponse<CreateSessionResponse>> {
  const [session] = await db.insert(sessions).values({}).returning()

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status as 'active' | 'completed',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
  })
}
