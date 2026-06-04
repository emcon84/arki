import type { MessageImage } from '@/types'

interface ParsedMessageContent {
  text: string
  image?: MessageImage
}

export function parseMessageContent(content: string): ParsedMessageContent {
  try {
    const parsed = JSON.parse(content) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'text' in parsed &&
      typeof (parsed as Record<string, unknown>).text === 'string'
    ) {
      return parsed as ParsedMessageContent
    }
  } catch {
    // not JSON, treat as plain text
  }
  return { text: content }
}
