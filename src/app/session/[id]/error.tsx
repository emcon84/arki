'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SessionError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="rounded-2xl border border-black/[0.08] bg-white p-12 text-center dark:border-white/10 dark:bg-[#111111]">
        <p className="text-2xl font-bold text-[#111111] dark:text-[#ededed]">Something went wrong</p>
        <p className="mt-2 text-sm text-[#888888]">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[#111111] px-4 py-2 text-sm text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
