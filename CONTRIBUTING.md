# Contributing to Arki

Thanks for your interest in contributing. Here's what you need to know.

## Getting started

```bash
# Prerequisites: Node.js 20+, Bun, PostgreSQL
git clone https://github.com/your-org/arki.git
cd arki
bun install
cp .env.example .env   # fill in your values
bun run db:push
bun run dev
```

## Environment variables

See `.env.example` for the full list. Required:

- `ANTHROPIC_API_KEY` — Claude API key
- `DATABASE_URL` — PostgreSQL connection string

## Development workflow

1. Fork the repo and create a feature branch from `main`
2. Make your changes — keep them focused and minimal
3. Run `bun run build` to verify no TypeScript errors
4. Run `bun test` to verify tests pass
5. Open a pull request with a clear description

## Code style

- TypeScript strict mode — no `any`, no `// @ts-ignore`
- Tailwind for styling — no inline styles
- Server Components by default; add `'use client'` only when needed
- Drizzle ORM for all database access — no raw SQL outside schema files
- Conventional Commits for commit messages (`feat:`, `fix:`, `chore:`, etc.)

## Reporting issues

Open a GitHub issue. Include reproduction steps and the relevant error message.
