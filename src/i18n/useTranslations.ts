'use client'

import { translations } from './translations'
import { useLocale } from './LocaleContext'

export function useTranslations() {
  const { locale, setLocale } = useLocale()
  return {
    t: translations[locale],
    locale,
    setLocale,
  }
}
