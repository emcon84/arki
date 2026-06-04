import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── DB mock ──────────────────────────────────────────────────────────────────
const mockSession = {
  id: 'session-uuid-1',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockMessage = {
  id: 'msg-uuid-1',
  sessionId: 'session-uuid-1',
  role: 'user',
  content: 'I want to build a SaaS app',
  createdAt: new Date('2024-01-01'),
}

const mockBlueprint = {
  id: 'blueprint-uuid-1',
  sessionId: 'session-uuid-1',
  content: '# Architecture Blueprint\n\nContent here.',
  createdAt: new Date('2024-01-01'),
}

// Chainable drizzle mock builder
function makeDbMock(returnValue: unknown) {
  const chain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([returnValue]),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
    set: vi.fn().mockReturnThis(),
    unique: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
  }
  return chain
}

const insertMock = vi.fn()
const selectMock = vi.fn()
const updateMock = vi.fn()

vi.mock('@/db', () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    update: updateMock,
  },
}))

// ── Claude service mock ───────────────────────────────────────────────────────
vi.mock('@/services/claude', () => ({
  streamInterviewResponse: vi.fn().mockReturnValue(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Test response'))
        controller.close()
      },
    }),
  ),
  generateBlueprint: vi.fn().mockResolvedValue(
    '# Architecture Blueprint\n\nContent here.',
  ),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('POST /api/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const chain = makeDbMock(mockSession)
    insertMock.mockReturnValue(chain)
  })

  it('creates a session and returns it', async () => {
    const { POST } = await import('@/app/api/sessions/route')

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.session).toMatchObject({
      id: mockSession.id,
      status: 'active',
    })
    expect(insertMock).toHaveBeenCalledOnce()
  })
})

describe('POST /api/sessions/[id]/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when content is empty', async () => {
    const { POST } = await import(
      '@/app/api/sessions/[id]/messages/route'
    )

    const req = new NextRequest('http://localhost/api/sessions/session-uuid-1/messages', {
      method: 'POST',
      body: JSON.stringify({ content: '' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(req, {
      params: Promise.resolve({ id: 'session-uuid-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('returns 400 when content is whitespace only', async () => {
    const { POST } = await import(
      '@/app/api/sessions/[id]/messages/route'
    )

    const req = new NextRequest('http://localhost/api/sessions/session-uuid-1/messages', {
      method: 'POST',
      body: JSON.stringify({ content: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(req, {
      params: Promise.resolve({ id: 'session-uuid-1' }),
    })

    expect(response.status).toBe(400)
  })

  it('saves user message and streams assistant response', async () => {
    const insertChain = makeDbMock(mockMessage)
    insertMock.mockReturnValue(insertChain)

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([mockMessage]),
    }
    selectMock.mockReturnValue(selectChain)

    const { POST } = await import(
      '@/app/api/sessions/[id]/messages/route'
    )

    const req = new NextRequest('http://localhost/api/sessions/session-uuid-1/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'I want to build a SaaS app' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(req, {
      params: Promise.resolve({ id: 'session-uuid-1' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/plain')
    expect(insertMock).toHaveBeenCalled()
  })
})

describe('POST /api/sessions/[id]/blueprint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when no messages exist', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    }
    selectMock.mockReturnValue(selectChain)

    const { POST } = await import(
      '@/app/api/sessions/[id]/blueprint/route'
    )

    const req = new NextRequest('http://localhost/api/sessions/session-uuid-1/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(req, {
      params: Promise.resolve({ id: 'session-uuid-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('generates and returns blueprint with session completion', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([mockMessage]),
    }
    selectMock.mockReturnValue(selectChain)

    const insertChain = makeDbMock(mockBlueprint)
    insertMock.mockReturnValue(insertChain)

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    }
    updateMock.mockReturnValue(updateChain)

    const { POST } = await import(
      '@/app/api/sessions/[id]/blueprint/route'
    )

    const req = new NextRequest('http://localhost/api/sessions/session-uuid-1/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(req, {
      params: Promise.resolve({ id: 'session-uuid-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.blueprint).toMatchObject({
      id: mockBlueprint.id,
      sessionId: mockBlueprint.sessionId,
      content: expect.stringContaining('Architecture Blueprint'),
    })
    expect(updateMock).toHaveBeenCalledOnce()
  })
})
