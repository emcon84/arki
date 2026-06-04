'use client'

import { useState, useCallback } from 'react'
import type { Blueprint, GenerateBlueprintResponse } from '@/types'
import { API_ROUTES } from '@/constants'

interface UseBlueprintOptions {
  sessionId: string
}

interface UseBlueprintReturn {
  blueprint: Blueprint | null
  isGenerating: boolean
  generate: () => Promise<void>
  error: string | null
}

export function useBlueprint({
  sessionId,
}: UseBlueprintOptions): UseBlueprintReturn {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (): Promise<void> => {
    if (isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.sessionBlueprint(sessionId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to generate blueprint')
      }

      const data = (await response.json()) as GenerateBlueprintResponse
      setBlueprint(data.blueprint)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      )
    } finally {
      setIsGenerating(false)
    }
  }, [sessionId, isGenerating])

  return { blueprint, isGenerating, generate, error }
}
