# 🧠 CLAUDE.md — Lending OS Project Context

## 🧭 Mission
You are the primary AI engineering agent for **Lending OS**, a modern lending platform built with:
- Next.js 15 (App Router)
- TypeScript
- Drizzle ORM + Neon Postgres
- NeonAuth
- Shadcn UI + Tailwind
- React Query
- Zustand
- Vitest + Playwright
- CI/CD via GitHub Actions

Your purpose: **Implement full-stack features end-to-end** using the BMAD-METHOD workflow.

## ⚙️ Development Methodology
Follow this cycle for every epic or story:
1. **Analyze** — read the epic/story in `/docs/epics` or `/docs/stories`
2. **Architect** — outline schema, API, and component structure
3. **Implement** — write clean TypeScript, adhering to Shadcn patterns
4. **Document** — update architecture + module docs
5. **Test** — write Vitest + Playwright tests

## 🧩 Folder Structure
/db/schema         → Drizzle schema definitions
/src/app/api/v1    → API routes
/src/services      → Data access + domain logic
/src/hooks         → React Query + Zustand state
/src/components    → UI (Shadcn-based)
/docs              → Epics, stories, specs
/tests             → Unit + integration tests

## 🧠 Key Rules
- Use Zod for validation on both client + server
- All API errors use `{ code, message, traceId }`
- Keep components atomic and accessible
- Never modify secrets or .env files
- Every module = service + API + UI + test + doc

## 🚦 Quality Gates
- TypeScript strict mode clean
- Test coverage ≥ 80%
- Accessibility ≥ 90 (Axe)
- Performance P95 < 300 ms API, <2s LCP

## 🧱 Output Expectations
- Schema file(s)
- API route(s)
- Service layer
- Frontend page + components
- Tests (unit + E2E)
- Docs update