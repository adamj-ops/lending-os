CLAUDE.md — Backend & API (Neon Postgres + Neon Auth)

🧭 Context

Backend stack for Lending OS:
	•	API: Next.js App Router (/app/api/v1/*)
	•	Database: Neon serverless Postgres (@neondatabase/serverless) + Drizzle ORM
	•	Auth: Neon Auth (JWT) — verify with JWKS; extract user_id, org_id, role
	•	Validation: Zod
	•	Language: TypeScript (strict)
	•	Style: Service-first (handlers thin, logic in /src/services)

Goal: Implement production-grade, testable REST/RPC endpoints that enforce org-scoped access from Neon Auth JWT claims.

⸻

🔐 Authentication & Session Model (Neon Auth)

Token Input
	•	Clients send Authorization: Bearer <JWT> to all /api/v1/* routes.
	•	Token issued by Neon Auth (OIDC/JWT).
	•	Validate via JWKS (no hardcoded secrets).

Required Claims (normalize internally)
	•	sub → userId: string
	•	org_id (or organization_id) → organizationId: string
	•	role → one of admin | manager | analyst (extendable)

    Session Helper (server)

Create a shared helper to verify tokens & expose a typed session:

// src/lib/auth/session.ts
import { jwtVerify, createRemoteJWKSet } from 'jose'

const jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!))
const ISSUER = process.env.NEON_AUTH_ISSUER!
const AUD = process.env.NEON_AUTH_AUDIENCE // optional

export type Session = {
  userId: string
  organizationId: string
  role: 'admin' | 'manager' | 'analyst' | string
}

export async function getSessionFromRequest(req: Request): Promise<Session> {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) throw new Error('UNAUTHORIZED')

  const { payload } = await jwtVerify(token, jwks, {
    issuer: ISSUER,
    audience: AUD,
  })

  // Normalize/guard
  const userId = String(payload.sub ?? '')
  const organizationId = String(payload.org_id ?? payload.organization_id ?? '')
  const role = String(payload.role ?? 'analyst')

  if (!userId || !organizationId) throw new Error('UNAUTHORIZED')

  return { userId, organizationId, role }
}

Rule: All API handlers must call getSessionFromRequest(req) and scope queries by organizationId.

🗄️ Database Conventions (Drizzle + Neon)

Driver: @neondatabase/serverless + drizzle-orm/neon-http (edge friendly)

Schema Rules
	•	Primary keys: uuid (server-generated)
	•	Common columns on every domain table:
	•	organization_id uuid not null
	•	created_at timestamptz default now()
	•	updated_at timestamptz default now()
	•	Indexes: (organization_id), frequently queried fields (e.g., email, status)

Example Borrowers Schema

// db/schema/borrowers.ts
import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'

export const borrowers = pgTable('borrowers', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  entityType: text('entity_type').$type<'individual' | 'llc' | 'trust'>(),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  orgIdx: index('idx_borrowers_org').on(t.organizationId),
  emailIdx: index('idx_borrowers_email').on(t.email),
}))

Drizzle DB Bootstrap
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '@/db/schema'

const sql = neon(process.env.NEON_DATABASE_URL!)
export const db = drizzle(sql, { schema })

🧱 Service Layer Pattern

Keep route handlers thin. Business logic & queries live in services.

// src/services/BorrowerService.ts
import { db } from '@/lib/db'
import { borrowers } from '@/db/schema/borrowers'
import { eq, and } from 'drizzle-orm'

type OrgScoped = { organizationId: string }

export class BorrowerService {
  static async list({ organizationId }: OrgScoped) {
    return db.select().from(borrowers).where(eq(borrowers.organizationId, organizationId))
  }

  static async getById(id: string, { organizationId }: OrgScoped) {
    const [row] = await db.select().from(borrowers)
      .where(and(eq(borrowers.id, id), eq(borrowers.organizationId, organizationId)))
    return row ?? null
  }

  static async create(data: any, { organizationId }: OrgScoped) {
    const [row] = await db.insert(borrowers).values({ ...data, organizationId }).returning()
    return row
  }

  static async update(id: string, data: any, { organizationId }: OrgScoped) {
    const [row] = await db.update(borrowers).set(data)
      .where(and(eq(borrowers.id, id), eq(borrowers.organizationId, organizationId)))
      .returning()
    return row
  }

  static async remove(id: string, { organizationId }: OrgScoped) {
    await db.delete(borrowers).where(and(eq(borrowers.id, id), eq(borrowers.organizationId, organizationId)))
    return { success: true }
  }
}

🌐 API Design (REST + RPC, org-scoped)

Base path: /api/v1/*
Error format: { code, message, traceId?, details? }
Validation: Zod on all inputs

List/Create Borrowers

// src/app/api/v1/borrowers/route.ts
import { z } from 'zod'
import { BorrowerService } from '@/services/BorrowerService'
import { getSessionFromRequest } from '@/lib/auth/session'

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  entityType: z.enum(['individual','llc','trust']).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req)
    const rows = await BorrowerService.list({ organizationId: session.organizationId })
    return Response.json({ code: 200, message: 'OK', data: rows })
  } catch (e: any) {
    return Response.json({ code: 401, message: 'UNAUTHORIZED' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()
    const parsed = createSchema.parse(body)
    const row = await BorrowerService.create(parsed, { organizationId: session.organizationId })
    return Response.json({ code: 201, message: 'Created', data: row }, { status: 201 })
  } catch (e: any) {
    const status = e?.name === 'ZodError' ? 400 : 500
    return Response.json({ code: status, message: e.message }, { status })
  }
}

By ID
// src/app/api/v1/borrowers/[id]/route.ts
import { getSessionFromRequest } from '@/lib/auth/session'
import { BorrowerService } from '@/services/BorrowerService'
import { z } from 'zod'

const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  entityType: z.enum(['individual','llc','trust']).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(_req)
    const row = await BorrowerService.getById(params.id, { organizationId: session.organizationId })
    if (!row) return Response.json({ code: 404, message: 'Not found' }, { status: 404 })
    return Response.json({ code: 200, message: 'OK', data: row })
  } catch (e: any) {
    return Response.json({ code: 401, message: 'UNAUTHORIZED' }, { status: 401 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()
    const parsed = updateSchema.parse(body)
    const row = await BorrowerService.update(params.id, parsed, { organizationId: session.organizationId })
    if (!row) return Response.json({ code: 404, message: 'Not found' }, { status: 404 })
    return Response.json({ code: 200, message: 'Updated', data: row })
  } catch (e: any) {
    const status = e?.name === 'ZodError' ? 400 : 500
    return Response.json({ code: status, message: e.message }, { status })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    await BorrowerService.remove(params.id, { organizationId: session.organizationId })
    return Response.json({ code: 200, message: 'Deleted' })
  } catch (e: any) {
    return Response.json({ code: 401, message: 'UNAUTHORIZED' }, { status: 401 })
  }
}

🧪 Testing Strategy
	•	Unit (Vitest): services with mocked db
	•	Integration: run against a Neon test branch or local container; verify org scoping
	•	E2E (Playwright): token-in-header flows for /api/v1/*
	•	Factories/Seeds: /tests/factories/* create valid org/user IDs to embed in JWT fixtures

Example JWT test helper:
// tests/utils/jwt.ts
import * as jose from 'jose'

// In tests, you can sign with a local key OR stub jwtVerify to return a payload.
export function stubSession(overrides?: Partial<{ userId: string; organizationId: string; role: string }>) {
  return {
    userId: overrides?.userId ?? 'user_test',
    organizationId: overrides?.organizationId ?? 'org_test',
    role: overrides?.role ?? 'admin',
  }
}

🧩 Best Practices & Rules
	•	Always scope queries by organizationId from the Neon Auth JWT.
	•	Keep API handlers thin; move logic to /src/services/*.
	•	No raw SQL unless performance requires; prefer Drizzle query builder.
	•	Return typed responses. Never leak internal errors (map to { code, message }).
	•	Add indices with every migration where lookups are expected.
	•	If adding new roles/claims, extend the session type & guards once (centralized).

⸻

🚦 Definition of Done (Backend)
	•	Handlers: implemented under /api/v1/*
	•	Services: implemented & unit-tested
	•	Schema: Drizzle models + migrations committed
	•	Auth: JWT verified, claims normalized, org scoping enforced
	•	Tests: ≥80% coverage for services; key routes integration-tested
	•	Docs: /docs/modules/[feature].md updated with endpoints, request/response examples