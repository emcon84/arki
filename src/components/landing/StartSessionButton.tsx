'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { API_ROUTES } from '@/constants'
import { useTranslations } from '@/i18n/useTranslations'
import type { CreateSessionResponse } from '@/types'

const SESSIONS_KEY = 'arki_sessions'
const MAX_STORED = 10

interface StoredSession {
  id: string
  createdAt: string
}

export function saveSessionToStorage(id: string) {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    const existing: StoredSession[] = raw ? (JSON.parse(raw) as StoredSession[]) : []
    const updated = [{ id, createdAt: new Date().toISOString() }, ...existing].slice(0, MAX_STORED)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated))
  } catch {
    // localStorage not available
  }
}

export function getStoredSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? (JSON.parse(raw) as StoredSession[]) : []
  } catch {
    return []
  }
}

export function removeStoredSession(id: string) {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    const existing: StoredSession[] = raw ? (JSON.parse(raw) as StoredSession[]) : []
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(existing.filter((s) => s.id !== id)))
  } catch {
    // ignore
  }
}

export function StartSessionButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslations()

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_ROUTES.sessions, { method: 'POST' })
      const data = await res.json() as Record<string, unknown>
      if (!res.ok || !data.session) {
        console.error('[Arki] /api/sessions error:', data)
        return
      }
      const session = data.session as { id: string }
      saveSessionToStorage(session.id)
      router.push(`/session/${session.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={() => void handleStart()}
      disabled={loading}
      className="group inline-flex items-center gap-2 rounded-xl bg-[#111111] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-[#ededed]"
    >
      {loading ? t.landing.cta + '...' : t.landing.cta}
      {!loading && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      )}
    </button>
  )
}
