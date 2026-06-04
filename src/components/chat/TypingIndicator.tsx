'use client'

import { useTranslations } from '@/i18n/useTranslations'

export function TypingIndicator() {
  const { t } = useTranslations()

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#111111] dark:bg-white">
        <div className="flex items-center gap-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black animate-bounce" />
        </div>
      </div>
      <span className="text-sm text-[#888888]">{t.chat.thinking}</span>
    </div>
  )
}
