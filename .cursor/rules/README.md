# Agent Rules Directory

## 📚 Files in This Directory

### 1. `ui-standards.md` ⭐ **MOST IMPORTANT FOR UI WORK**
**Read this when building any UI component**

Contains:
- Data fetching with custom hooks (NEVER use fetch + useEffect)
- Loading/error/empty state patterns (use shared components)
- Design token usage (semantic colors only)
- Component discovery guide
- Complete examples and checklists
- **1000+ lines of UI best practices**

### 2. `pending-ui-improvements.md` ⚠️ **CHECK BEFORE CODING**
**Lists components that need refactoring**

Contains:
- 10+ components using old patterns (HIGH PRIORITY)
- Design token implementation tasks (MEDIUM PRIORITY)
- Storybook story needs (LOW PRIORITY)
- Progress tracking
- **If a file is listed here, REFACTOR it while working on it**

### 3. `tech-stack-lock.md` 🔒 **READ BEFORE INSTALLING PACKAGES**
**Technology decisions are locked**

Contains:
- Approved technologies for EVERY layer
- Explicitly forbidden alternatives
- Change approval process
- Approved deviations log

### 4. `frontend.md`
Main frontend development rules:
- Next.js 15 patterns
- React best practices
- Code quality guidelines
- **References ui-standards.md for UI work**

### 5. `agent-rules.md`
Quick reference for common agent workflows:
- Decision flow for tech choices
- Pre-install checklist
- Common mistakes to avoid
- Documentation requirements

### 6. `shadcn-usage.md` ✅ **ALWAYS APPROVED**
Comprehensive guide for Shadcn UI:
- All Shadcn components pre-approved
- CLI usage examples
- Component patterns
- Ecosystem libraries (Magic UI, etc.)
- **NO approval needed for Shadcn**

### 7. `domain-rules.md`
Domain-specific business logic rules

---

## 🚨 QUICK START FOR NEW AGENTS

### Before Working on ANY UI Component:

```
1. Check: Is it in pending-ui-improvements.md?
   ├─ YES → REFACTOR it while working on it ⚠️
   └─ NO → Continue
2. Follow: ui-standards.md patterns
   ├─ Use custom hooks (never fetch + useEffect)
   ├─ Use shared components (never custom loading UI)
   └─ Use semantic tokens (never hardcoded colors)
3. Check: .cursor/templates/ for boilerplate
```

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

1. **FOLLOW UI standards** - Read ui-standards.md, use custom hooks, shared components, semantic tokens
2. **CHECK pending work** - Read pending-ui-improvements.md before touching any UI component
3. **ASK, don't assume** - When in doubt, ask the user
4. **CONSISTENCY over novelty** - Stick with the chosen stack
5. **DOCUMENT changes** - Update tech-stack-lock.md and pending-ui-improvements.md
6. **CHECK compatibility** - Next.js 16 is new, verify everything
7. **RESPECT the design system** - Shadcn UI consistency matters

---

## 📖 Full Documentation

**UI Standards & Templates:**
- `.cursor/rules/ui-standards.md` - Complete UI guide (1000+ lines)
- `.cursor/rules/pending-ui-improvements.md` - Pending refactoring work
- `.cursor/templates/` - Boilerplate code (hooks, pages, stories)
- `UI-STANDARDS-QUICKSTART.md` (root) - Quick reference for team

**Project Context:**
- `.cursor/docs/` - Technical documentation
- `.cursor/docs/ui-standardization-implementation.md` - UI implementation details
- `.cursor/notes/` - Project notes and checklists
- `SETUP.md` - Project setup guide

**Root Files:**
- `.cursorrules` - Critical rules Cursor reads automatically

