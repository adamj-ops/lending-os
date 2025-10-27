# Agent Notes

- Repo: Next.js (app router), TypeScript, Drizzle ORM, TanStack Query, Zod.
- Goal: Add detailed header comments to all src TS/TSX files.
- Approach: Script inserts non-invasive header with a unique marker for idempotency.
- Lint: eslint with strict rules; avoid exceeding max-lines budget unnecessarily.

- Header generator located at src/scripts/add-file-headers.ts; run with: npx tsx src/scripts/add-file-headers.ts