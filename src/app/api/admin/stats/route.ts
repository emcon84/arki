import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sessions, messages, blueprints, specs, feedbacks } from '@/db/schema'
import { count, eq, avg, gte, sql } from 'drizzle-orm'
import type { AdminStats } from '@/types'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    [totalSessionsRow],
    [completedSessionsRow],
    [totalBlueprintsRow],
    [totalSpecsRow],
    [totalMessagesRow],
    [totalFeedbacksRow],
    [avgRatingRow],
    [sessionsTodayRow],
    [sessionsThisWeekRow],
    recentSessionsRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(sessions),
    db.select({ value: count() }).from(sessions).where(eq(sessions.status, 'completed')),
    db.select({ value: count() }).from(blueprints),
    db.select({ value: count() }).from(specs),
    db.select({ value: count() }).from(messages),
    db.select({ value: count() }).from(feedbacks),
    db.select({ value: avg(feedbacks.rating) }).from(feedbacks),
    db.select({ value: count() }).from(sessions).where(gte(sessions.createdAt, startOfToday)),
    db.select({ value: count() }).from(sessions).where(gte(sessions.createdAt, sevenDaysAgo)),
    db
      .select({
        id: sessions.id,
        status: sessions.status,
        createdAt: sessions.createdAt,
        blueprintId: blueprints.id,
        specId: specs.id,
      })
      .from(sessions)
      .leftJoin(blueprints, eq(blueprints.sessionId, sessions.id))
      .leftJoin(specs, eq(specs.sessionId, sessions.id))
      .orderBy(sql`${sessions.createdAt} DESC`)
      .limit(10),
  ])

  const avgRatingValue = avgRatingRow?.value
  const parsedAvgRating =
    avgRatingValue !== null && avgRatingValue !== undefined
      ? parseFloat(String(avgRatingValue))
      : null

  const stats: AdminStats = {
    totalSessions: Number(totalSessionsRow?.value ?? 0),
    completedSessions: Number(completedSessionsRow?.value ?? 0),
    totalBlueprints: Number(totalBlueprintsRow?.value ?? 0),
    totalSpecs: Number(totalSpecsRow?.value ?? 0),
    totalMessages: Number(totalMessagesRow?.value ?? 0),
    totalFeedbacks: Number(totalFeedbacksRow?.value ?? 0),
    avgRating: parsedAvgRating,
    sessionsToday: Number(sessionsTodayRow?.value ?? 0),
    sessionsThisWeek: Number(sessionsThisWeekRow?.value ?? 0),
    recentSessions: recentSessionsRows.map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      hasBlueprint: row.blueprintId !== null,
      hasSpec: row.specId !== null,
    })),
  }

  return NextResponse.json(stats)
}
