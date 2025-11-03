# Lending OS - Tech Stack Summary

**Last Updated**: 2024-10-25

---

## ✅ Pre-Approved (Use Freely)

### UI & Design
- ✅ **Shadcn UI** - All components, CLI, registry
- ✅ **Tailwind CSS v4** - All utilities
- ✅ **Radix UI** - Primitives
- ✅ **Lucide Icons** - Icon library
- ✅ **Simple Icons** - Brand icons
- ✅ **Shadcn Ecosystem**: Magic UI, Aceternity UI, Origin UI, Shadcn Blocks

### Core Stack
- ✅ **Next.js 16** - Framework
- ✅ **React 19** - Library
- ✅ **TypeScript** - Language
- ✅ **Drizzle ORM** - Database layer
- ✅ **Neon Postgres** - Database
- ✅ **postgres-js** - DB driver

### Forms & Validation
- ✅ **React Hook Form** - Forms
- ✅ **Zod** - Validation

### State & Data
- ✅ **Zustand** - Client state (minimal)
- ✅ **TanStack Query** - Server state

### Auth & Security
- ✅ **iron-session** - Session management
- ✅ **bcryptjs** - Password hashing

### Utilities
- ✅ **clsx / tailwind-merge** - Class utilities
- ✅ **class-variance-authority** - Component variants
- ✅ **date-fns** - Date utilities

---

## ⚠️ Ask Before Adding

- Any non-Shadcn UI library
- Any authentication library
- Any ORM other than Drizzle
- Any database other than Neon
- Any CSS framework other than Tailwind
- Any state library other than Zustand/TanStack Query

---

## 🚫 Never Use (Without Explicit Approval)

- Material UI, Ant Design, Chakra UI, Bootstrap
- NextAuth, Clerk, Auth0, Better Auth
- Prisma, TypeORM, Kysely
- Redux, MobX, Recoil
- styled-components, Emotion
- MySQL, MongoDB (without approval)

---

## 📦 Installed Packages Reference

```json
{
  "dependencies": {
    "@fontsource/geist-mono": "^5.2.7",
    "@fontsource/open-sans": "^5.2.7",
    "@neondatabase/serverless": "^0.10.6",
    "axios": "^1.12.2",
    "bcryptjs": "^2.4.3",
    "drizzle-orm": "^0.44.7",
    "iron-session": "^8.0.3",
    "lucide-react": "^0.453.0",
    "next": "^16.0.0",
    "postgres": "^3.4.7",
    "react": "^19.2.0",
    "react-hook-form": "^7.65.0",
    "recharts": "^2.15.4",
    "simple-icons": "^15.17.0",
    "zod": "^3.25.76",
    "zustand": "^5.0.8"
  }
}
```

---

## 🎯 Quick Decision Tree

```
Need a UI component?
├─ Is it in Shadcn? 
│  ├─ YES → Use Shadcn ✅
│  └─ NO → Check Shadcn ecosystem (Magic UI, etc.)
│      ├─ Found → Use it ✅
│      └─ Not found → Ask user ⚠️

Need authentication?
├─ Current: iron-session ✅
└─ Want to change → Ask user ⚠️

Need database work?
├─ Query → Use Drizzle ✅
├─ Schema change → Use Drizzle migrations ✅
└─ Different DB → Ask user ⚠️

Need forms?
├─ React Hook Form + Zod ✅
└─ Different library → Ask user ⚠️

Need state management?
├─ Server state → TanStack Query ✅
├─ Client state → Zustand ✅
└─ Different library → Ask user ⚠️
```

---

## 📚 Documentation Links

- **Tech Stack Lock**: `.cursor/rules/tech-stack-lock.md` (full details)
- **Shadcn Usage**: `.cursor/rules/shadcn-usage.md` (component guide)
- **Agent Rules**: `.cursor/rules/agent-rules.md` (workflow guide)
- **Database Schema**: `.cursor/docs/database-schema.md`
- **API Endpoints**: `.cursor/docs/api-endpoints.md`

---

## 🔄 Deviation Log

### 2024-10-25: Authentication
- **Planned**: BetterAuth
- **Actual**: iron-session
- **Reason**: BetterAuth incompatibility with Next.js 16
- **Status**: ✅ Approved and documented

