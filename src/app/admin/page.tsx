import { db } from '@/db'
import { sessions, messages, blueprints, specs, feedbacks } from '@/db/schema'
import { count, eq, avg, gte, sql } from 'drizzle-orm'
import type { AdminStats } from '@/types'
import {
  LayoutDashboard,
  CheckCircle,
  FileText,
  Code2,
  MessageSquare,
  Star,
} from 'lucide-react'
import { DeleteSessionButton } from '@/components/admin/DeleteSessionButton'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getStats(): Promise<AdminStats> {
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

  return {
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
}

async function getAllFeedbacks() {
  return db
    .select()
    .from(feedbacks)
    .orderBy(sql`${feedbacks.createdAt} DESC`)
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-black/[0.08] bg-white p-6 dark:border-white/10 dark:bg-[#111111]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-[#888888]">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#555555] dark:bg-[#1a1a1a] dark:text-[#aaaaaa]">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-[#111111] dark:text-[#ededed]">{value}</p>
    </div>
  )
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams
  const key = typeof params.key === 'string' ? params.key : undefined

  if (!key || key !== process.env.ADMIN_SECRET) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-12 text-center dark:border-white/10 dark:bg-[#111111]">
          <p className="text-2xl font-bold text-[#111111] dark:text-[#ededed]">401</p>
          <p className="mt-2 text-sm text-[#888888]">Unauthorized. Provide a valid ?key= param.</p>
        </div>
      </div>
    )
  }

  const [stats, allFeedbacks] = await Promise.all([getStats(), getAllFeedbacks()])

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111111] dark:text-[#ededed]">Arki Admin</h1>
          <p className="mt-1 text-sm text-[#888888]">{currentDate}</p>
        </div>

        {/* Main stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Sessions"
            value={stats.totalSessions}
            icon={<LayoutDashboard className="h-4 w-4" strokeWidth={2} />}
          />
          <StatCard
            label="Completed Sessions"
            value={stats.completedSessions}
            icon={<CheckCircle className="h-4 w-4" strokeWidth={2} />}
          />
          <StatCard
            label="Blueprints Generated"
            value={stats.totalBlueprints}
            icon={<FileText className="h-4 w-4" strokeWidth={2} />}
          />
          <StatCard
            label="Specs Generated"
            value={stats.totalSpecs}
            icon={<Code2 className="h-4 w-4" strokeWidth={2} />}
          />
          <StatCard
            label="Total Messages"
            value={stats.totalMessages}
            icon={<MessageSquare className="h-4 w-4" strokeWidth={2} />}
          />
          <StatCard
            label="Avg Rating"
            value={stats.avgRating !== null ? `${stats.avgRating.toFixed(1)} / 5` : 'N/A'}
            icon={<Star className="h-4 w-4" strokeWidth={2} />}
          />
        </div>

        {/* Quick stats row */}
        <div className="mb-8 flex gap-4">
          <div className="rounded-xl border border-black/[0.08] bg-white px-6 py-4 dark:border-white/10 dark:bg-[#111111]">
            <p className="text-xs text-[#888888]">Sessions Today</p>
            <p className="mt-1 text-xl font-bold text-[#111111] dark:text-[#ededed]">
              {stats.sessionsToday}
            </p>
          </div>
          <div className="rounded-xl border border-black/[0.08] bg-white px-6 py-4 dark:border-white/10 dark:bg-[#111111]">
            <p className="text-xs text-[#888888]">Sessions This Week</p>
            <p className="mt-1 text-xl font-bold text-[#111111] dark:text-[#ededed]">
              {stats.sessionsThisWeek}
            </p>
          </div>
        </div>

        {/* Recent Sessions table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#111111]">
          <div className="border-b border-black/[0.08] px-6 py-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-[#111111] dark:text-[#ededed]">
              Recent Sessions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Blueprint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Spec
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                {stats.recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 font-mono text-xs text-[#111111] dark:text-[#ededed]">
                      {session.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          session.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#888888]">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {session.hasBlueprint ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-[#cccccc] dark:text-[#444444]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {session.hasSpec ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-[#cccccc] dark:text-[#444444]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <DeleteSessionButton sessionId={session.id} adminKey={key} />
                    </td>
                  </tr>
                ))}
                {stats.recentSessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-[#888888]"
                    >
                      No sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback section */}
        <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#111111]">
          <div className="flex items-center justify-between border-b border-black/[0.08] px-6 py-4 dark:border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-[#111111] dark:text-[#ededed]">
                Feedback de usuarios
              </h2>
              <p className="mt-0.5 text-xs text-[#888888]">
                {stats.totalFeedbacks} respuestas
                {stats.avgRating !== null && ` · promedio ${stats.avgRating.toFixed(1)} / 5`}
              </p>
            </div>
          </div>

          {allFeedbacks.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#888888]">
              Todavia no hay feedback.
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.04] dark:divide-white/5">
              {allFeedbacks.map((fb) => (
                <li key={fb.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Stars */}
                      <div className="mb-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-base ${star <= fb.rating ? 'text-[#111111] dark:text-[#ededed]' : 'text-[#dddddd] dark:text-[#333333]'}`}
                          >
                            {star <= fb.rating ? '★' : '☆'}
                          </span>
                        ))}
                        <span className="ml-2 text-xs text-[#888888]">
                          {fb.rating} / 5
                        </span>
                        {fb.wouldRecommend !== null && (
                          <span className={`ml-3 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            fb.wouldRecommend
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {fb.wouldRecommend ? 'Recomendaria' : 'No recomendaria'}
                          </span>
                        )}
                      </div>
                      {fb.comment && (
                        <p className="text-sm text-[#444444] dark:text-[#aaaaaa]">
                          {fb.comment}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-[#aaaaaa]">
                        {new Date(fb.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-[#cccccc] dark:text-[#444444]">
                        {fb.sessionId?.slice(0, 8) ?? 'anon'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
