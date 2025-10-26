# Agent Rules - Lending OS

## 🚨 CRITICAL RULES

### 1. Tech Stack Adherence
**BEFORE installing ANY package:**
- Check `.cursor/rules/tech-stack-lock.md`
- If package is NOT listed → **STOP and ASK user**
- If there's a compatibility issue → **PRESENT OPTIONS, don't improvise**

### 2. No Silent Changes
**NEVER silently:**
- Switch authentication libraries
- Change UI frameworks
- Replace ORMs or databases
- Add alternative styling systems
- Change the design system

### 3. Ask Before Deviating
**When something doesn't work:**
```
❌ BAD: "Let me try this other library instead"
✅ GOOD: "This isn't working. Here are 3 options: [A, B, C]. Which would you prefer?"
```

## 📋 Quick Reference

### Our Stack
- **UI**: Shadcn UI + Tailwind CSS v4
- **Framework**: Next.js 16 + React 19
- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: iron-session (custom)
- **Forms**: React Hook Form + Zod
- **State**: Zustand (minimal) + TanStack Query
- **Fonts**: Open Sans + Geist Mono

### Forbidden
- ❌ NextAuth, Clerk, Auth0, Better Auth
- ❌ Prisma, TypeORM, Kysely
- ❌ Material UI, Chakra, Bootstrap
- ❌ Redux, MobX, Recoil
- ❌ Supabase, Firebase (except with approval)

## 🎯 Decision Flow

```
Is this in tech-stack-lock.md?
├─ YES → Proceed
└─ NO → Is it critical?
    ├─ YES → Present 2-3 options to user, wait for approval
    └─ NO → Ask user if we should add it
```

## 📝 Documentation Requirements

**After ANY approved deviation:**
1. Update `tech-stack-lock.md` → "Approved Deviations Log"
2. Update `.cursor/notes/agentnotes.md`
3. Update relevant technical docs

## 🔍 Pre-Install Checklist

Before `npm install [package]`:
- [ ] Is it in tech-stack-lock.md?
- [ ] Does it align with Shadcn UI ecosystem?
- [ ] Is there already a package that does this?
- [ ] Have I checked for Next.js 16 compatibility?
- [ ] Will this introduce design inconsistency?

**If ANY checkbox is uncertain → ASK USER**

## 💡 User Preferences (from agentnotes.md)

- Prefers shadcn icon components over emojis
- Uses colocation architecture (keep feature code together)
- Focus on clean, modern UI
- Maintain responsive design
- Use TypeScript for type safety

## ⚠️ Common Mistakes to Avoid

1. **Don't assume compatibility** - Next.js 16 is new, many packages incompatible
2. **Don't switch horses mid-stream** - Stick with chosen technologies
3. **Don't add "just one more library"** - Bloat adds up
4. **Don't optimize prematurely** - Follow PRD timeline
5. **Don't break the design system** - Shadcn UI consistency matters

## ✅ Good Practices

1. **Check docs first** - See `.cursor/docs/` for project decisions
2. **Use existing patterns** - Look at how we solved similar problems
3. **Keep it simple** - Fewer dependencies = better
4. **Ask when uncertain** - User prefers questions over bad decisions
5. **Document decisions** - Future agents need context

