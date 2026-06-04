# Arki — AI Software Architecture Advisor

Arki is an open-source AI tool that acts as a senior software architect. Through a guided conversational interview, it contextualizes your project idea and generates a professional architecture blueprint — ready to hand to your development team or feed directly into an AI coding agent.

**Arki is not a development tool. It is a pre-code tool.**

It sits between your idea and the first prompt you give to Bolt, Cursor, or Claude Code. The architectural questions nobody asks before building — Arki asks them.

---

## The problem

AI coding tools make it easier than ever to turn an idea into a working app. The problem is that nobody does the architectural thinking first. The result: applications that work in the demo and break in production.

```
Today:    Idea → Bolt / v0 / Cursor → Fragile app

With Arki: Idea → Arki → Blueprint + Dev Specs → Bolt / v0 / Cursor → Well-founded app
```

---

## What Arki generates

From a single guided conversation, Arki produces:

- **Architecture Blueprint** — recommended pattern (Monolith, Modular Monolith, Microservices, etc.) with full justification specific to your project constraints
- **Technology Stack** — recommended stack per layer with reasoning
- **System Architecture Diagram** — Mermaid diagram ready to render
- **Data Model Overview** — key entities and relationships
- **Infrastructure & Deployment** — where it runs, how it scales
- **Key Risks & Mitigations** — top risks specific to your project with concrete mitigations
- **Architecture Decision Records (ADRs)** — 3-5 structured records documenting every major decision, the alternatives considered, and the rationale
- **Observability Plan** — metrics, structured logs, traces, alerts, and day-one dashboard panels specific to your stack
- **Developer Specifications** — folder structure, database schema code, API contract, implementation checklist, and AI agent instructions ready to paste into Claude Code, Cursor, or Bolt

All outputs are exportable as Markdown and as a self-contained HTML dashboard.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| AI | Anthropic Claude API (Sonnet for interview, Opus for generation) |
| Styling | Tailwind CSS v4 |
| Package manager | Bun |
| Deployment | Docker Compose |

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [PostgreSQL](https://www.postgresql.org) >= 14
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/emcon84/arki.git
cd arki
bun install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `RESEND_API_KEY` | No | Resend API key for feedback emails |
| `ADMIN_SECRET` | No | Secret key to access the admin dashboard |
| `FEEDBACK_EMAIL` | No | Email address to receive feedback (default: configured in env) |

### Database setup

```bash
# Generate and run migrations
bun run db:generate
bun run db:migrate
```

### Run in development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker deployment

The project includes a production-ready Docker Compose setup with Next.js and PostgreSQL.

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Start all services
docker-compose up -d
```

The app will be available on port `3000`.

---

## Admin dashboard

Arki includes a lightweight admin panel at `/admin` to monitor usage.

```
http://localhost:3000/admin?key=YOUR_ADMIN_SECRET
```

The dashboard shows:
- Session and blueprint counts (today, this week, total)
- Recent sessions with status
- All user feedback with star ratings

---

## Project structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── sessions/           # Session management
│   │   └── admin/              # Admin endpoints
│   ├── admin/                  # Admin dashboard page
│   ├── session/[id]/           # Chat and blueprint page
│   └── page.tsx                # Landing page
├── components/
│   ├── blueprint/              # Blueprint and specs rendering
│   ├── chat/                   # Chat interface
│   ├── feedback/               # Feedback modal
│   ├── landing/                # Landing page components
│   ├── markdown/               # Shared markdown renderer
│   └── nav/                    # Navigation components
├── db/
│   ├── schema.ts               # Drizzle schema (sessions, messages, blueprints, specs, feedbacks)
│   └── index.ts                # Database client
├── hooks/                      # React hooks (useChat, useBlueprint, useSpecs)
├── i18n/                       # Translations (ES / EN)
├── lib/                        # Shared utilities
├── services/
│   └── claude.ts               # All Claude API logic and system prompts
├── theme/                      # Theme context (dark / light)
└── types/                      # TypeScript interfaces
```

---

## Architecture decisions

### Why a single Next.js app instead of separate frontend/backend?

For an MVP that needs to ship fast, the App Router's Server Components give us direct DB access without an intermediate API layer. The separation is maintained through clear module boundaries — the `services/` layer handles all AI logic, `db/` handles all data access, and components are purely presentational.

### Why two Claude models?

- **Interview** (`claude-sonnet-4-6`): Fast, streaming, handles conversational back-and-forth efficiently
- **Blueprint + Specs** (`claude-opus-4-8`): Deeper reasoning for complex architectural decisions, higher output quality for the generated documents

### Why Drizzle over Prisma?

Drizzle is TypeScript-native, has zero runtime overhead, and the schema file IS the type definition. No code generation step, no Prisma Client — just SQL with TypeScript types.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Some areas where contributions are valuable:

- **System prompts**: Better architectural reasoning, more patterns covered, edge cases handled
- **Output formats**: New export formats, better Mermaid diagram generation
- **Observability improvements**: More specific plans per framework/stack
- **i18n**: Additional language support beyond ES/EN
- **UI**: Accessibility improvements, mobile experience

---

## License

MIT — see [LICENSE](LICENSE).
