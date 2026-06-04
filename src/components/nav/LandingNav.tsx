'use client'

import { Sun, Moon, Layers } from 'lucide-react'
import { useTheme } from '@/theme/ThemeContext'
import { useTranslations } from '@/i18n/useTranslations'

export function LandingNav() {
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale } = useTranslations()

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111111] dark:bg-white">
            <Layers className="h-4 w-4 text-white dark:text-black" strokeWidth={2} />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#111111] dark:text-[#ededed]">
            Arki
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center rounded-lg border border-black/[0.08] dark:border-white/10 overflow-hidden">
            <button
              onClick={() => setLocale('es')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'es'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-black'
                  : 'text-[#666666] hover:text-[#111111] dark:text-[#888888] dark:hover:text-[#ededed]'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'en'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-black'
                  : 'text-[#666666] hover:text-[#111111] dark:text-[#888888] dark:hover:text-[#ededed]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] text-[#666666] transition-colors hover:text-[#111111] dark:border-white/10 dark:text-[#888888] dark:hover:text-[#ededed]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
