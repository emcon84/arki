import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { sessions, messages, blueprints, specs } from '@/db/schema'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { BlueprintView } from '@/components/blueprint/BlueprintView'
import { SessionNav } from '@/components/nav/SessionNav'
import type { Message, Blueprint, Session, Spec } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getSessionData(id: string): Promise<{
  session: Session
  messages: Message[]
  blueprint: Blueprint | null
  spec: Spec | null
}> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1)

  if (!session) {
    notFound()
  }

  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, id))
    .orderBy(messages.createdAt)

  const [blueprint] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.sessionId, id))
    .limit(1)

  const [spec] = await db
    .select()
    .from(specs)
    .where(eq(specs.sessionId, id))
    .limit(1)

  return {
    session: {
      id: session.id,
      status: session.status as 'active' | 'completed',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    messages: sessionMessages.map((m) => ({
      id: m.id,
      sessionId: m.sessionId,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: m.createdAt,
    })),
    blueprint: blueprint
      ? {
          id: blueprint.id,
          sessionId: blueprint.sessionId,
          content: blueprint.content,
          createdAt: blueprint.createdAt,
        }
      : null,
    spec: spec
      ? {
          id: spec.id,
          sessionId: spec.sessionId,
          content: spec.content,
          createdAt: spec.createdAt,
        }
      : null,
  }
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params
  const { session, messages: initialMessages, blueprint, spec } = await getSessionData(id)

  // If session is completed and has a blueprint, show it standalone
  if (session.status === 'completed' && blueprint) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <SessionNav />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <BlueprintView blueprint={blueprint} sessionId={id} initialSpec={spec} />
        </main>
      </div>
    )
  }

  return (
    <ChatInterface
      sessionId={id}
      initialMessages={initialMessages}
      initialBlueprint={blueprint}
      initialSpec={spec}
    />
  )
}
