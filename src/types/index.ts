export type SessionStatus = 'active' | 'completed'
export type MessageRole = 'user' | 'assistant'
export type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

export interface MessageImage {
  base64: string
  mediaType: ImageMediaType
}

export interface MessageWithImage {
  text: string
  image: MessageImage
}

export interface Session {
  id: string
  status: SessionStatus
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  createdAt: Date
}

export interface Blueprint {
  id: string
  sessionId: string
  content: string
  createdAt: Date
}

export interface SendMessageRequest {
  content: string
  image?: MessageImage
}

export interface SendMessageResponse {
  message: Message
}

export interface CreateSessionResponse {
  session: Session
}

export interface GenerateBlueprintResponse {
  blueprint: Blueprint
}

export interface Spec {
  id: string
  sessionId: string
  content: string
  createdAt: Date
}

export interface GenerateSpecsResponse {
  spec: Spec
}

export interface Feedback {
  id: string
  sessionId: string | null
  rating: number
  wouldRecommend: boolean | null
  comment: string | null
  createdAt: Date
}

export interface SubmitFeedbackRequest {
  sessionId: string
  rating: number
  wouldRecommend?: boolean
  comment?: string
}

export interface AdminStats {
  totalSessions: number
  completedSessions: number
  totalBlueprints: number
  totalSpecs: number
  totalMessages: number
  totalFeedbacks: number
  avgRating: number | null
  sessionsToday: number
  sessionsThisWeek: number
  recentSessions: Array<{
    id: string
    status: string
    createdAt: Date
    hasBlueprint: boolean
    hasSpec: boolean
  }>
}
