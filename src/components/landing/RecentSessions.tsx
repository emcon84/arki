'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ArrowRight, X } from 'lucide-react'
import { getStoredSessions, removeStoredSession } from './StartSessionButton'
import { useTranslations } from '@/i18n/useTranslations'

interface StoredSession {
  id: string
  createdAt: string
}

export function RecentSessions() {
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const { t } = useTranslations()

  useEffect(() => {
    setSessions(getStoredSessions())
  }, [])

  if (sessions.length === 0) return null

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeStoredSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[#888888]">
        <Clock className="h-3 w-3" strokeWidth={2} />
        {t.landing.recentSessionsLabel}
      </p>
      <ul className="space-y-2">
        {sessions.slice(0, 3).map((session) => (
          <li key={session.id}>
            <Link
              href={`/session/${session.id}`}
              className="group flex items-center justify-between rounded-xl border border-black/[0.08] bg-[#fafafa] px-4 py-3 transition-colors hover:border-black/[0.15] hover:bg-white dark:border-white/10 dark:bg-[#111111] dark:hover:border-white/20 dark:hover:bg-[#1a1a1a]"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-[#111111] dark:text-[#ededed]">
                  {session.id.slice(0, 8)}...
                </p>
                <p className="mt-0.5 text-xs text-[#888888]">
                  {new Date(session.createdAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-[#888888] transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                <button
                  onClick={(e) => handleRemove(session.id, e)}
                  className="rounded p-0.5 text-[#cccccc] hover:text-[#888888] dark:text-[#444444] dark:hover:text-[#888888]"
                  title="Quitar de recientes"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
