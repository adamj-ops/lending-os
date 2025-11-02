# Tech Stack Lock - DO NOT DEVIATE

## ⚠️ CRITICAL RULE
**Any deviation from this tech stack requires EXPLICIT user approval before making changes.**

If a technology doesn't work or has compatibility issues:
1. **STOP** - Do not install alternatives
2. **ASK** - Present the issue and options to the user
3. **WAIT** - Get explicit approval before proceeding
4. **DOCUMENT** - Update this file with approved changes

---

## 🎨 Design System & UI

### UI Framework
- **Shadcn UI** - Component library ✅ **ALWAYS APPROVED**
  - Use Shadcn CLI freely: `npx shadcn@latest add [component]`
  - All Shadcn components are pre-approved
  - Shadcn registry components are approved
- **Tailwind CSS v4** - Styling (DO NOT add Bootstrap, styled-components, etc.)
- **Radix UI** - Headless primitives (underlying Shadcn) ✅ **APPROVED**

### Shadcn Ecosystem (✅ ALL APPROVED)
- **Shadcn CLI** - Component installation
- **Shadcn Registry** - Official component registry
- **Shadcn Blocks** - Pre-built sections
- **Shadcn Themes** - Theme presets (already using: default, tangerine, brutalist, soft-pop)
- **Magic UI** - Shadcn-compatible components
- **Aceternity UI** - Shadcn-compatible components
- **Origin UI** - Shadcn-compatible components
- Any library that uses Shadcn + Tailwind + Radix

### Typography
- **Primary Font**: Open Sans (weights: 300, 400, 500, 600, 700)
- **Monospace Font**: Geist Mono (weights: 400, 500, 600)
- **DO NOT** add: Inter, Roboto, or any other fonts without approval

### Icons
- **Lucide React** - Icon library ✅ **APPROVED** (Shadcn's default)
- **Simple Icons** - Brand icons ✅ **APPROVED** (already installed)
- **DO NOT** add: react-icons, heroicons, font-awesome without approval

---

## 🔧 Core Framework & Language

### Framework
- **Next.js 16** - App Router ONLY
- **React 19.2.0**
- **TypeScript 5.9.3**

### Build Tools
- **Turbopack** - Next.js default bundler
- **PostCSS** - For Tailwind
- **ESLint** - Linting
- **Prettier** - Code formatting

---

## 🗄️ Database & ORM

### Database
- **Neon Postgres** - Serverless PostgreSQL
- **DO NOT** add: MySQL, MongoDB, Supabase, PlanetScale without approval

### ORM
- **Drizzle ORM** - Type-safe SQL
- **DO NOT** replace with: Prisma, TypeORM, Kysely, or raw SQL queries

### Database Tools
- **Drizzle Kit** - Schema management
- **postgres** (postgres-js) - Driver for Drizzle

---

## 🔐 Authentication

### Session Management
- **iron-session** - Encrypted cookie sessions
- **bcryptjs** - Password hashing

### Current Implementation
- Custom auth with iron-session
- Email/password authentication
- Session-based (not JWT tokens in localStorage)

### DO NOT Add
- NextAuth/Auth.js (Next.js 16 incompatibility)
- Clerk
- Auth0
- Supabase Auth
- Firebase Auth
- Better Auth (tried, had issues)

---

## 📊 Data Fetching & State

### Data Fetching
- **TanStack Query (React Query)** - Server state management
- Native `fetch` for API calls

### Client State
- **Zustand** - Minimal global state (preferences only)
- **React Hook Form** - Form state

### DO NOT Add
- Redux / Redux Toolkit
- Jotai
- Recoil
- MobX
- SWR (we use TanStack Query)

---

## 🎯 Form Handling & Validation

### Forms
- **React Hook Form** - Form library
- **Zod** - Schema validation
- **@hookform/resolvers** - RHF + Zod integration

### DO NOT Add
- Formik
- Yup
- Joi
- React Final Form

---

## 📈 Charts & Data Visualization

### Charts (Future)
- **Recharts** - Already installed
- **Tremor** - Optional for financial dashboards

### DO NOT Add
- Chart.js
- Victory
- Nivo
- Apache ECharts

---

## 🎨 Styling Utilities

### Allowed
- **clsx** - Conditional classes
- **tailwind-merge** - Merge Tailwind classes
- **class-variance-authority** - Component variants

### DO NOT Add
- classnames
- @emotion
- styled-components
- CSS modules

---

## 📦 File Upload (Sprint 2+)

### Planned
- **AWS S3** - File storage
- **@aws-sdk/client-s3** - S3 client
- **@aws-sdk/s3-request-presigner** - Presigned URLs

### DO NOT Add
- Uploadthing
- Cloudinary
- Vercel Blob (unless user approves)
- Firebase Storage

---

## 📧 Email (Future)

### Planned
- **Resend** - Email service (per PRD)

### DO NOT Add
- Sendgrid
- Mailgun
- Nodemailer
- AWS SES (unless user approves)

---

## 🧪 Testing (Sprint 6)

### Unit Testing
- **Vitest** - Test runner

### E2E Testing
- **Playwright** - Browser automation

### DO NOT Add
- Jest (Vitest is Next.js 16 compatible)
- Cypress
- Testing Library without approval

---

## 📡 API & Networking

### HTTP Client
- **axios** - Already installed
- Native `fetch` - For simple requests

### DO NOT Add
- ky
- got
- superagent

---

## 🛠️ Development Tools

### Already Installed
- **Husky** - Git hooks
- **lint-staged** - Lint on commit
- **tsx** - TypeScript execution
- **dotenv** - Environment variables

### DO NOT Add
- nodemon
- ts-node (use tsx)
- concurrently

---

## 🚫 Explicitly Forbidden

### Never Install Without Approval
- Any UI component library other than Shadcn UI
- Any CSS framework other than Tailwind CSS
- Any ORM other than Drizzle
- Any auth library other than iron-session (current)
- Any database other than Neon Postgres
- Any state management library beyond Zustand + TanStack Query
- Bootstrap, Material UI, Ant Design, Chakra UI
- Styled-components, Emotion, CSS-in-JS libraries

---

## 🎨 Adding Shadcn Components (No Approval Needed!)

### Using Shadcn CLI
```bash
# Add any Shadcn component - ALL PRE-APPROVED ✅
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
# etc.
```

### Shadcn-Compatible Libraries
These are all Shadcn ecosystem libraries - **pre-approved**:
- Magic UI components
- Aceternity UI components  
- Origin UI components
- Any Shadcn registry component
- Shadcn blocks/templates

### When to Use Shadcn Components
- ✅ Need a new UI component → Check Shadcn first
- ✅ Building a form → Use Shadcn form components
- ✅ Need icons → Use Lucide (Shadcn default)
- ✅ Need a modal/dialog → `npx shadcn add dialog`
- ✅ Building layouts → Use Shadcn layout components

### Example Workflow
```
User asks: "Add a dropdown menu"
Agent response: 
  1. Run: npx shadcn@latest add dropdown-menu
  2. Import and use in component
  3. Style with Tailwind classes (already configured)
  ✅ No approval needed - Shadcn is always approved!
```

---

## 🔄 Change Process

### If Technology Doesn't Work

1. **Document the issue**:
   ```
   - What broke?
   - Error messages?
   - What was attempted?
   ```

2. **Present options to user**:
   ```
   Option A: [Stay with current tech, workaround]
   Option B: [Alternative technology X]
   Option C: [Alternative technology Y]
   
   Pros/cons of each
   ```

3. **Wait for approval** - DO NOT proceed without explicit "yes"

4. **Update this document** - Add approved changes to tech stack

---

## 📝 Approved Deviations Log

### 2024-10-25: Authentication Change
- **Original Plan**: BetterAuth
- **Issue**: Compatibility issues with Next.js 16, 500 errors, complex schema mapping
- **Approved Change**: iron-session with custom auth
- **Approved By**: User (after multiple failed attempts)
- **Reason**: BetterAuth incompatible, iron-session is simpler and works

---

## ✅ Verification Checklist

Before installing ANY new package, verify:

- [ ] Is it in this approved tech stack?
- [ ] Does it conflict with existing technologies?
- [ ] Is there already a solution for this in our stack?
- [ ] Have I asked the user if unsure?

---

## 📚 Package.json Reference

This is our source of truth. Only add packages that align with this tech stack.

**If you need to add a package that's not listed here, STOP and ASK the user first.**

