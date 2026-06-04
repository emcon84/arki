import Anthropic from '@anthropic-ai/sdk'
import type { Message } from '@/types'
import { CLAUDE_MODELS } from '@/constants'
import { parseMessageContent } from '@/lib/parseMessageContent'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const INTERVIEW_SYSTEM_PROMPT = `You are Arki, a senior software architect with 15+ years of experience.
Your role is to help users define the architecture of their software project
through a structured, guided interview.

BEHAVIOR:
- Ask ONE question at a time. Never chain questions.
- Start by asking what the user wants to build (in simple terms).
- Guide the conversation through these topics naturally (not as a fixed list):
  * Project type (web app, mobile, API, etc.)
  * Expected users and scale (10 users vs 1M users changes everything)
  * Team size and technical skills
  * Data sensitivity (payments, PII, healthcare?)
  * Real-time needs (live updates, chat, notifications?)
  * Budget and infrastructure constraints
  * Existing tech stack (if any)
  * Must-have features for the first version
- Speak in the same language the user uses. If they write in Spanish, respond in Spanish. If English, respond in English.
- Be direct. Be helpful. Don't pad responses with filler.
- Never use emojis.

CRITICAL — BLUEPRINT TRIGGER:
- When you have gathered enough context (typically after 6-10 exchanges), your LAST message MUST end with this EXACT phrase on its own line, regardless of the conversation language:
  Ready to generate your architecture blueprint?
- Do NOT translate this phrase. Use it exactly as written.
- After the user confirms they want the blueprint, respond with ONLY a brief one-line acknowledgment (e.g. "Perfect, generating now." or "Perfecto, generando ahora.").
- NEVER generate the blueprint content yourself. The system handles blueprint generation separately. Your job ends the moment the user confirms.`

const DEV_SPECS_SYSTEM_PROMPT = `You are a senior software architect and developer. Based on the Architecture Blueprint provided, generate a comprehensive Developer Specifications document that can be handed directly to an AI coding agent (Claude Code, Cursor, Bolt, v0) to implement the project.

The document MUST follow this exact structure:

# Developer Specifications - [Project Name]

## Overview
[2-3 sentences summarizing what to build. Written as instructions to a developer, not as architecture analysis.]

## Tech Stack
[Simple bullet list: framework, language, database, ORM, deployment. No tables, no explanations. Just the list.]

## Project Setup

### Prerequisites
[List of tools to install]

### Initialize Project
[Exact shell commands to create the project, install dependencies, set up config files]

### Environment Variables
[List of all required env vars with placeholder values and a comment explaining each]

## Folder Structure
[Complete file tree using ASCII art. Include every folder and key files. Mark files to create with a comment.]

\`\`\`
project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ...
│   └── ...
└── ...
\`\`\`

## Database Schema

[Complete ORM schema code (Drizzle or Prisma based on the stack) or raw SQL. Include all tables, columns, types, relations, and indexes.]

\`\`\`typescript
// or \`\`\`sql
[schema code]
\`\`\`

## API Contract

For each API endpoint, define:

### [METHOD] /path/to/endpoint
**Purpose**: [one line]
**Auth**: [required / not required]
**Request body**:
\`\`\`typescript
{ field: type }
\`\`\`
**Response**:
\`\`\`typescript
{ field: type }
\`\`\`
**Errors**: [list of possible error codes and reasons]

## Key Components

For each major UI component or module:

### [ComponentName]
**File**: src/path/to/Component.tsx
**Purpose**: [what it does]
**Props**: [interface]
**Notes**: [any important implementation details]

## Implementation Checklist

Ordered list of implementation tasks. Group by phase. Each task should be completable in under 4 hours.

### Phase 1 - Foundation
- [ ] [Task with acceptance criteria]

### Phase 2 - Core Features
- [ ] [Task]

### Phase 3 - Polish
- [ ] [Task]

## AI Agent Instructions

Instructions written specifically to be pasted into an AI coding agent. Be direct and imperative.

\`\`\`
You are implementing [Project Name]. Follow these specifications exactly.

Stack: [list]
Architecture: [pattern]

RULES:
- [rule 1]
- [rule 2]

START WITH:
1. [first thing to do]
2. [second thing]
\`\`\`

---
Be concrete and implementation-ready. Every section should have real code or commands, not placeholders.
Use the exact technologies from the blueprint. If the blueprint recommends Go + PostgreSQL, the schema must be in Go/SQL, not Node/Prisma.`

const BLUEPRINT_SYSTEM_PROMPT = `You are Arki, a senior software architect. Based on the conversation below,
generate a professional Architecture Blueprint document in Markdown format.

The document MUST include these sections:

# Architecture Blueprint — [Project Name]

## Executive Summary
[2-3 sentences: what we're building and the key architectural decision]

## Recommended Architecture
[Name the pattern: Monolith / Modular Monolith / Microservices / Serverless / etc.]
[Explain WHY this is the right choice for THIS project specifically]

## Technology Stack
[Table with: Layer | Technology | Reason]

## System Architecture Diagram
[Mermaid diagram showing main components and their relationships]
\`\`\`mermaid
[diagram code]
\`\`\`

## Data Model Overview
[Key entities and their relationships — keep it high level]

## Infrastructure & Deployment
[Where it runs, how it scales, what to watch out for]

## Key Risks & Mitigations
[Top 3 risks for this specific project with concrete mitigations]

## Recommended Next Steps
[Ordered list: what to build first, what to defer]

---

## Architecture Decision Records

For each major architectural decision in this blueprint, generate a structured ADR.
Include 3 to 5 ADRs covering the most impactful decisions.

Format each as:

### ADR-[N]: [Short decision title]

**Status**: Accepted

**Context**: [1-2 sentences: what situation or constraint led to this decision]

**Decision**: [1 sentence: what was decided]

**Rationale**: [2-3 sentences: why this is the right choice for THIS specific project. Be concrete, reference the user's constraints (team size, budget, scale).]

**Alternatives Considered**:
- [Alternative 1]: [Why it was not chosen]
- [Alternative 2]: [Why it was not chosen]

**Consequences**: [What becomes easier and what becomes harder as a result of this decision]

---

## Observability Plan

Based on the recommended stack, generate a concrete observability plan the team should implement from day one.

### Metrics to Collect
[List 5-8 key metrics specific to this stack and domain. Include: what to measure, suggested tool, alert threshold if applicable]

### Structured Logs
[List 4-6 key events to log with their log level and required fields. Be specific to the application domain.]

### Traces
[List 3-4 critical user flows to instrument end-to-end. Include entry point and key spans.]

### Alerts (Priority)
| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
[3-5 rows of the most important alerts for this specific system]

### Day-One Dashboard
[Describe 4-5 panels the team should have in their monitoring dashboard from the first deploy. Be specific to the recommended stack.]

---
Be opinionated. Don't say "it depends" without immediately resolving it.
This document should be ready to hand to a development team.`

function toAnthropicMessages(
  messages: Message[],
): Anthropic.MessageParam[] {
  return messages.map((msg) => {
    const { text, image } = parseMessageContent(msg.content)

    if (image && msg.role === 'user') {
      return {
        role: 'user' as const,
        content: [
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: image.mediaType,
              data: image.base64,
            },
          },
          {
            type: 'text' as const,
            text,
          },
        ],
      }
    }

    return {
      role: msg.role,
      content: text,
    }
  })
}

export function streamInterviewResponse(
  messages: Message[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: CLAUDE_MODELS.interview,
          max_tokens: 1024,
          system: INTERVIEW_SYSTEM_PROMPT,
          messages: toAnthropicMessages(messages),
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

export async function generateBlueprint(
  messages: Message[],
): Promise<string> {
  const anthropicMessages = toAnthropicMessages(messages)
  const lastMessage = anthropicMessages[anthropicMessages.length - 1]
  if (lastMessage?.role === 'assistant') {
    anthropicMessages.push({ role: 'user', content: 'Please generate the architecture blueprint now.' })
  }

  const response = await client.messages.create({
    model: CLAUDE_MODELS.blueprint,
    max_tokens: 8192,
    system: BLUEPRINT_SYSTEM_PROMPT,
    messages: anthropicMessages,
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in blueprint response')
  }

  return textBlock.text
}

export async function generateDevSpecs(blueprintContent: string): Promise<string> {
  const response = await client.messages.create({
    model: CLAUDE_MODELS.blueprint,
    max_tokens: 8192,
    system: DEV_SPECS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is the Architecture Blueprint:\n\n${blueprintContent}`,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in specs response')
  }

  return textBlock.text
}
