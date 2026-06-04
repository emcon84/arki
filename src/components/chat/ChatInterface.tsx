'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Send, FileCode, Layers, Paperclip, X } from 'lucide-react'
import type { Message, Blueprint, Spec, MessageImage, ImageMediaType } from '@/types'
import { BLUEPRINT_TRIGGER_PHRASE } from '@/constants'
import { useChat } from '@/hooks/useChat'
import { useBlueprint } from '@/hooks/useBlueprint'
import { useTranslations } from '@/i18n/useTranslations'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { BlueprintView } from '@/components/blueprint/BlueprintView'

interface ChatInterfaceProps {
  sessionId: string
  initialMessages: Message[]
  initialBlueprint: Blueprint | null
  initialSpec?: Spec | null
}

export function ChatInterface({
  sessionId,
  initialMessages,
  initialBlueprint,
  initialSpec,
}: ChatInterfaceProps) {
  const { messages, isStreaming, streamingContent, sendMessage, error } =
    useChat({ sessionId, initialMessages })

  const {
    blueprint,
    isGenerating,
    generate,
    error: blueprintError,
  } = useBlueprint({ sessionId })

  const [inputValue, setInputValue] = useState('')
  const [pendingImage, setPendingImage] = useState<MessageImage | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resolvedBlueprint = blueprint ?? initialBlueprint
  const { t } = useTranslations()

  const [generatingStep, setGeneratingStep] = useState(0)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  // Refocus textarea when streaming ends
  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus()
    }
  }, [isStreaming])

  // Cycle through generating step messages
  useEffect(() => {
    if (!isGenerating) {
      setGeneratingStep(0)
      return
    }
    const steps = t.chat.generatingSteps
    const interval = setInterval(() => {
      setGeneratingStep((prev) => (prev + 1) % steps.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [isGenerating, t.chat.generatingSteps])

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')

  const showBlueprintButton =
    !resolvedBlueprint &&
    !isGenerating &&
    lastAssistantMessage?.content.includes(BLUEPRINT_TRIGGER_PHRASE)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setImageError(t.chat.imageTooLarge)
      e.target.value = ''
      return
    }

    setImageError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const [header, base64] = dataUrl.split(',')
      const mediaType = header.split(':')[1].split(';')[0] as ImageMediaType
      setPendingImage({ base64, mediaType })
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content || isStreaming) return
    const imageToSend = pendingImage
    setInputValue('')
    setPendingImage(null)
    setImageError(null)
    textareaRef.current?.focus()
    await sendMessage(content, imageToSend ?? undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-black">
      {/* Header */}
      <header className="flex items-center border-b border-black/[0.08] bg-white px-6 py-4 dark:border-white/10 dark:bg-black">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] dark:bg-white flex-shrink-0">
            <Layers className="h-4 w-4 text-white dark:text-black" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#111111] dark:text-[#ededed]">
              Arki
            </h1>
            <p className="text-xs text-[#888888]">{t.common.softwareAdvisor}</p>
          </div>
        </Link>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto w-full max-w-3xl space-y-2">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#fafafa] dark:border-white/10 dark:bg-[#111111]">
              <Layers className="h-6 w-6 text-[#111111] dark:text-[#ededed]" strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[#111111] dark:text-[#ededed]">
              {t.chat.readyToBuild}
            </h2>
            <p className="max-w-sm text-sm text-[#666666] dark:text-[#888888]">
              {t.chat.readyToBuildDesc}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isStreaming && (
          <>
            {streamingContent ? (
              <MessageBubble
                message={{
                  id: 'streaming',
                  sessionId,
                  role: 'assistant',
                  content: streamingContent,
                  createdAt: new Date(),
                }}
                isStreaming
                streamingContent={streamingContent}
              />
            ) : (
              <TypingIndicator />
            )}
          </>
        )}

        {(error || blueprintError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error ?? blueprintError}
          </div>
        )}

        {showBlueprintButton && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => void generate()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-[#ededed]"
            >
              <FileCode className="h-4 w-4" strokeWidth={2} />
              {t.chat.generateBlueprint}
            </button>
          </div>
        )}

        {resolvedBlueprint && (
          <div className="mt-6">
            <BlueprintView
              blueprint={resolvedBlueprint}
              sessionId={sessionId}
              initialSpec={initialSpec ?? null}
              isNewlyGenerated={blueprint !== null}
            />
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white" />
            <span
              key={generatingStep}
              className="animate-pulse text-sm text-[#888888]"
              style={{ animationDuration: '1s' }}
            >
              {t.chat.generatingSteps[generatingStep]}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - hidden once blueprint is generated */}
      {!resolvedBlueprint && (
        <div className="border-t border-black/[0.08] bg-white px-4 py-4 dark:border-white/10 dark:bg-black">
          <div className="mx-auto max-w-3xl">
            {/* Image preview */}
            {pendingImage && (
              <div className="relative mb-2 inline-block">
                <img
                  src={`data:${pendingImage.mediaType};base64,${pendingImage.base64}`}
                  alt="Attached image"
                  className="h-20 w-20 rounded-lg object-cover border border-black/[0.08] dark:border-white/10"
                />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] text-white dark:bg-white dark:text-black"
                  aria-label={t.chat.removeImage}
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            )}

            {/* Image size error */}
            {imageError && (
              <p className="mb-2 text-xs text-red-600 dark:text-red-400">{imageError}</p>
            )}

            <div className="flex items-end gap-3">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* Attach image button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                aria-label={t.chat.attachImage}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-[#666666] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-[#111111] dark:text-[#888888] dark:hover:bg-[#1a1a1a]"
              >
                <Paperclip className="h-4 w-4" strokeWidth={2} />
              </button>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chat.placeholder}
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#888888] focus:border-black/30 focus:outline-none focus:ring-1 focus:ring-black/20 disabled:opacity-50 dark:border-white/10 dark:bg-[#111111] dark:text-[#ededed] dark:placeholder-[#666666] dark:focus:border-white/30 dark:focus:ring-white/10"
                style={{ minHeight: '48px', maxHeight: '160px', overflowY: 'auto' }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={isStreaming || inputValue.trim().length === 0}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#111111] transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:hover:bg-[#ededed]"
              >
                <Send className="h-4 w-4 text-white dark:text-black" strokeWidth={2} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-[#888888]">
            {t.chat.enterHint}
          </p>
        </div>
      )}
    </div>
  )
}
