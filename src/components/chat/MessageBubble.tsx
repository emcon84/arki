'use client'

import ReactMarkdown from 'react-markdown'
import { User, Bot } from 'lucide-react'
import type { Message } from '@/types'
import { parseMessageContent } from '@/lib/parseMessageContent'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  streamingContent?: string
}

export function MessageBubble({
  message,
  isStreaming = false,
  streamingContent = '',
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  // Streaming content is always plain text — no need to parse
  const { text, image } = isStreaming
    ? { text: streamingContent, image: undefined }
    : parseMessageContent(message.content)
  const displayContent = text

  return (
    <div
      className={`mb-4 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mr-2 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#111111] dark:bg-white">
          <Bot className="h-4 w-4 text-white dark:text-black" strokeWidth={2} />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-tr-sm bg-[#111111] text-white dark:bg-white dark:text-black'
            : 'rounded-tl-sm bg-[#fafafa] text-[#111111] dark:bg-[#111111] dark:text-[#ededed]'
        }`}
      >
        {isUser ? (
          <>
            {image && (
              <img
                src={`data:${image.mediaType};base64,${image.base64}`}
                alt="Attached image"
                className="mb-2 max-h-48 rounded-lg object-contain"
              />
            )}
            <p className="whitespace-pre-wrap text-sm">{displayContent}</p>
          </>
        ) : (
          <div className="text-sm leading-relaxed">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-[#888888]" />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="ml-2 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fafafa] dark:bg-[#111111]">
          <User
            className="h-4 w-4 text-[#666666] dark:text-[#888888]"
            strokeWidth={2}
          />
        </div>
      )}
    </div>
  )
}
