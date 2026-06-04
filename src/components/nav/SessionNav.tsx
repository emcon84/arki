'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layers, Plus } from 'lucide-react'
import { useTranslations } from '@/i18n/useTranslations'
import { API_ROUTES } from '@/constants'
import { saveSessionToStorage } from '@/components/landing/StartSessionButton'
import type { CreateSessionResponse } from '@/types'

export function SessionNav() {
  const { t } = useTranslations()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleNewSession = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_ROUTES.sessions, { method: 'POST' })
      const data = (await res.json()) as CreateSessionResponse
      saveSessionToStorage(data.session.id)
      router.push(`/session/${data.session.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111111] dark:bg-white">
            <Layers className="h-4 w-4 text-white dark:text-black" strokeWidth={2} />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#111111] dark:text-[#ededed]">
            Arki
          </span>
        </Link>

        <button
          onClick={() => void handleNewSession()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-1.5 text-xs font-medium text-[#444444] transition-colors hover:bg-[#fafafa] disabled:opacity-50 dark:border-white/10 dark:text-[#aaaaaa] dark:hover:bg-white/5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {t.common.newSession}
        </button>
      </div>
    </header>
  )
}
