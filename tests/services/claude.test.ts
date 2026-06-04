import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Message } from '@/types'

// Mock the Anthropic SDK
const mockStream = {
  [Symbol.asyncIterator]: async function* () {
    yield {
      type: 'content_block_delta',
      delta: { type: 'text_delta', text: 'Hello' },
    }
    yield {
      type: 'content_block_delta',
      delta: { type: 'text_delta', text: ', world!' },
    }
  },
}

const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: 'text', text: '# Architecture Blueprint\n\nTest content.' }],
})

const mockMessages = {
  stream: vi.fn().mockReturnValue(mockStream),
  create: mockCreate,
}

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: mockMessages,
  })),
}))

// Import after mock
const { streamInterviewResponse, generateBlueprint } = await import(
  '@/services/claude'
)

const sampleMessages: Message[] = [
  {
    id: '1',
    sessionId: 'session-1',
    role: 'user',
    content: 'I want to build a task management app',
    createdAt: new Date(),
  },
  {
    id: '2',
    sessionId: 'session-1',
    role: 'assistant',
    content: 'How many users do you expect?',
    createdAt: new Date(),
  },
]

describe('streamInterviewResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages.stream.mockReturnValue(mockStream)
  })

  it('returns a ReadableStream', () => {
    const result = streamInterviewResponse(sampleMessages)
    expect(result).toBeInstanceOf(ReadableStream)
  })

  it('calls the Anthropic SDK stream with the correct model', async () => {
    const { CLAUDE_MODELS } = await import('@/constants')
    const stream = streamInterviewResponse(sampleMessages)

    const reader = stream.getReader()
    const chunks: string[] = []
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(decoder.decode(value))
    }

    expect(mockMessages.stream).toHaveBeenCalledWith(
      expect.objectContaining({
        model: CLAUDE_MODELS.interview,
        max_tokens: 1024,
      }),
    )
  })

  it('includes the system prompt in the API call', () => {
    streamInterviewResponse(sampleMessages)

    expect(mockMessages.stream).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('You are Arki'),
      }),
    )
  })

  it('passes full conversation history to the API', () => {
    streamInterviewResponse(sampleMessages)

    expect(mockMessages.stream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
          expect.objectContaining({ role: 'assistant' }),
        ]),
      }),
    )
  })

  it('streams the text chunks from the response', async () => {
    const stream = streamInterviewResponse(sampleMessages)
    const reader = stream.getReader()
    const chunks: string[] = []
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(decoder.decode(value))
    }

    expect(chunks.join('')).toBe('Hello, world!')
  })
})

describe('generateBlueprint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({
      content: [
        { type: 'text', text: '# Architecture Blueprint\n\nTest content.' },
      ],
    })
  })

  it('returns a markdown string', async () => {
    const result = await generateBlueprint(sampleMessages)
    expect(typeof result).toBe('string')
    expect(result).toContain('# Architecture Blueprint')
  })

  it('calls the Anthropic SDK with the blueprint model', async () => {
    const { CLAUDE_MODELS } = await import('@/constants')
    await generateBlueprint(sampleMessages)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: CLAUDE_MODELS.blueprint,
        max_tokens: 4096,
      }),
    )
  })

  it('includes the blueprint system prompt', async () => {
    await generateBlueprint(sampleMessages)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('Architecture Blueprint'),
      }),
    )
  })

  it('passes the full message history as context', async () => {
    await generateBlueprint(sampleMessages)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: 'I want to build a task management app',
          }),
        ]),
      }),
    )
  })

  it('throws when response has no text content', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'image', source: {} }],
    })

    await expect(generateBlueprint(sampleMessages)).rejects.toThrow(
      'No text content in blueprint response',
    )
  })
})
