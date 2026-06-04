export const API_ROUTES = {
  sessions: '/api/sessions',
  sessionMessages: (id: string) => `/api/sessions/${id}/messages`,
  sessionBlueprint: (id: string) => `/api/sessions/${id}/blueprint`,
  sessionSpecs: (id: string) => `/api/sessions/${id}/specs`,
  submitFeedback: (id: string) => `/api/sessions/${id}/feedback`,
  adminStats: '/api/admin/stats',
  adminSession: (id: string) => `/api/admin/sessions/${id}`,
} as const

export const CLAUDE_MODELS = {
  interview: 'claude-sonnet-4-6',
  blueprint: 'claude-opus-4-8',
} as const

export const MAX_INTERVIEW_MESSAGES = 20

export const BLUEPRINT_TRIGGER_PHRASE =
  'Ready to generate your architecture blueprint?'
