'use client'

import { useState, useCallback } from 'react'
import type { Message, MessageImage } from '@/types'
import { API_ROUTES } from '@/constants'

interface UseChatOptions {
  sessionId: string
  initialMessages?: Message[]
}

interface UseChatReturn {
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
  sendMessage: (content: string, image?: MessageImage) => Promise<void>
  error: string | null
}

export function useChat({
  sessionId,
  initialMessages = [],
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, image?: MessageImage): Promise<void> => {
      if (isStreaming || content.trim().length === 0) return

      // Optimistic content mirrors what gets stored in the DB
      const optimisticContent =
        image !== undefined
          ? JSON.stringify({ text: content.trim(), image })
          : content.trim()

      const userMessage: Message = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'user',
        content: optimisticContent,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsStreaming(true)
      setStreamingContent('')
      setError(null)

      try {
        const response = await fetch(API_ROUTES.sessionMessages(sessionId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim(), ...(image !== undefined ? { image } : {}) }),
        })

        if (!response.ok) {
          const data = (await response.json()) as { error?: string }
          throw new Error(data.error ?? 'Failed to send message')
        }

        if (!response.body) {
          throw new Error('Response body is null')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setStreamingContent(accumulated)
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          sessionId,
          role: 'assistant',
          content: accumulated,
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setStreamingContent('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsStreaming(false)
      }
    },
    [sessionId, isStreaming],
  )

  return { messages, isStreaming, streamingContent, sendMessage, error }
}
