# Agent Rules Directory

## 📚 Files in This Directory

### 1. `tech-stack-lock.md` ⭐ **MOST IMPORTANT**
**Read this FIRST before installing ANY package**

Contains:
- Approved technologies for EVERY layer
- Explicitly forbidden alternatives
- Change approval process
- Approved deviations log

### 2. `agent-rules.md`
Quick reference for common agent workflows:
- Decision flow for tech choices
- Pre-install checklist
- Common mistakes to avoid
- Documentation requirements

### 3. `shadcn-usage.md` ✅ **ALWAYS APPROVED**
Comprehensive guide for Shadcn UI:
- All Shadcn components pre-approved
- CLI usage examples
- Component patterns
- Ecosystem libraries (Magic UI, etc.)
- **NO approval needed for Shadcn**

### 4. Other Rules
- `python_rules.md` - Python coding standards (if applicable)
- `communication_rules.md` - How to communicate with user

---

## 🚨 QUICK START FOR NEW AGENTS

### Before Installing ANY Package:

```
1. Check: Is it in tech-stack-lock.md?
   ├─ YES → Proceed ✅
   └─ NO → STOP 🛑
       └─ Present options to user
           └─ Wait for approval
               └─ Update tech-stack-lock.md
```

### When Something Breaks:

```
❌ DON'T: Install alternative package
✅ DO: Present 2-3 options to user with pros/cons
```

---

## 📋 Tech Stack Summary

```
UI Layer:     Shadcn UI + Tailwind CSS v4
Framework:    Next.js 16 + React 19 + TypeScript
Database:     Neon Postgres + Drizzle ORM
Auth:         iron-session (custom)
Forms:        React Hook Form + Zod
State:        Zustand + TanStack Query
Fonts:        Open Sans + Geist Mono
```

**DO NOT deviate without user approval**

---

## 🎯 Golden Rules

1. **ASK, don't assume** - When in doubt, ask the user
2. **CONSISTENCY over novelty** - Stick with the chosen stack
3. **DOCUMENT changes** - Update tech-stack-lock.md
4. **CHECK compatibility** - Next.js 16 is new, verify everything
5. **RESPECT the design system** - Shadcn UI consistency matters

---

## 📖 Full Documentation

For complete project context:
- `.cursor/docs/` - Technical documentation
- `.cursor/notes/` - Project notes and checklists
- `SETUP.md` - Project setup guide

