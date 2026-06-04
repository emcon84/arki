'use client'

import { useState, useCallback } from 'react'
import type { Spec, GenerateSpecsResponse } from '@/types'
import { API_ROUTES } from '@/constants'

interface UseSpecsOptions {
  sessionId: string
}

interface UseSpecsResult {
  spec: Spec | null
  isGenerating: boolean
  generate: () => Promise<void>
  error: string | null
}

export function useSpecs({ sessionId }: UseSpecsOptions): UseSpecsResult {
  const [spec, setSpec] = useState<Spec | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (): Promise<void> => {
    if (isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.sessionSpecs(sessionId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to generate specs')
      }

      const data = (await response.json()) as GenerateSpecsResponse
      setSpec(data.spec)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsGenerating(false)
    }
  }, [sessionId, isGenerating])

  return { spec, isGenerating, generate, error }
}
