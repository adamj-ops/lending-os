# Claude Code Documentation Index

Welcome to the Lending OS Claude Code documentation!

This folder contains everything Claude Code needs to be immediately productive in this codebase.

## 📚 Documentation Files

### 1. [README.md](./README.md) - **START HERE**
**The main guide** - Read this first for comprehensive project overview.

**Contains:**
- Project overview and current phase
- Essential commands (dev, database, testing)
- Tech stack rules (CRITICAL - what's allowed/forbidden)
- Architecture patterns (colocation, service layer, API routes)
- Frontend patterns (forms, data fetching, tables)
- Common workflows (adding entities, schema changes, etc.)
- Environment variables
- Common gotchas and tips

**Read this when:** Starting work on this project for the first time.

---

### 2. [QUICKSTART.md](./QUICKSTART.md) - **QUICK REFERENCE**
**TL;DR version** - Fast access to most common tasks.

**Contains:**
- Most common tasks (copy-paste ready)
- Tech stack quick reference
- Essential commands
- Common patterns (minimal, focused)
- Current sprint status

**Read this when:** You need a quick reminder or copy-paste pattern.

---

### 3. [PATTERNS.md](./PATTERNS.md) - **CODE EXAMPLES**
**Copy-paste code library** - Complete, working code patterns.

**Contains:**
- Database schema patterns
- Service layer templates
- API route templates (GET, POST, PATCH, DELETE)
- React Query hooks
- Form components
- Table components
- Type definitions

**Read this when:** Implementing a new feature and need a working template.

---

### 4. [CONTEXT.md](./CONTEXT.md) - **CURRENT STATE**
**Project status tracker** - What's done, what's in progress, what's next.

**Contains:**
- Current sprint focus (Sprint 2A - Borrower & Lender Management)
- What's complete vs. pending
- Known issues and decisions
- File organization status
- Recent changes
- Next immediate steps

**Read this when:** You need to know what's already been done and what to work on next.

---

## 🎯 Quick Navigation

### "I need to..."

**Get started for the first time**
→ Read [README.md](./README.md) from top to bottom

**Add a new database entity**
→ See [PATTERNS.md - Database Schema Pattern](./PATTERNS.md#database-schema-pattern)

**Create a new API endpoint**
→ See [PATTERNS.md - API Route Patterns](./PATTERNS.md#api-route-patterns)

**Build a form**
→ See [PATTERNS.md - Form Patterns](./PATTERNS.md#form-patterns)

**Check what's allowed in tech stack**
→ See [README.md - Tech Stack Rules](./README.md#tech-stack-rules---critical) or `.cursor/rules/tech-stack-lock.md`

**Know what to work on next**
→ See [CONTEXT.md - Next Steps](./CONTEXT.md#next-steps)

**Find the right command**
→ See [QUICKSTART.md - Essential Commands](./QUICKSTART.md#essential-commands)

---

## 🗺️ Related Documentation

### In `.cursor/rules/` (Project Rules)
- `tech-stack-lock.md` - **CRITICAL** - Approved/forbidden technologies
- `agent-rules.md` - Decision-making rules and workflow
- `shadcn-usage.md` - Shadcn UI component guide
- `frontend.md` - Frontend development guidelines

### In `.cursor/docs/` (Technical Docs)
- Database schemas
- API endpoint documentation
- Authentication flow
- Architecture decisions

### In `.cursor/notes/` (Development Notes)
- `project_checklist.md` - Sprint progress tracker
- `agentnotes.md` - Development decisions and notes

### Root Level
- `SETUP.md` - Installation and setup instructions
- `README.md` - Original project README
- `package.json` - Dependencies and scripts

---

## 🚀 Recommended Reading Order

### First Time Working on This Project
1. [README.md](./README.md) - Full overview
2. [CONTEXT.md](./CONTEXT.md) - Current status
3. `.cursor/rules/tech-stack-lock.md` - Tech constraints
4. [PATTERNS.md](./PATTERNS.md) - Code patterns

### Returning to Work
1. [CONTEXT.md](./CONTEXT.md) - What's changed?
2. [QUICKSTART.md](./QUICKSTART.md) - Quick refresher

### Implementing a Feature
1. [CONTEXT.md - Next Steps](./CONTEXT.md#next-steps) - What to build
2. [PATTERNS.md](./PATTERNS.md) - Copy-paste templates
3. [QUICKSTART.md](./QUICKSTART.md) - Common commands

---

## 🎨 File Naming Convention

All files in this folder use uppercase:
- `README.md` - Main guide
- `QUICKSTART.md` - Quick reference
- `PATTERNS.md` - Code patterns
- `CONTEXT.md` - Current state
- `INDEX.md` - This file

---

## 📝 Keeping Documentation Updated

When making significant changes:

1. **Update CONTEXT.md** - Mark features complete/in-progress
2. **Update PATTERNS.md** - Add new patterns if they differ
3. **Update README.md** - Only if architecture changes
4. **Never update INDEX.md** - This file is structural only

---

## 💡 Pro Tips

### For Maximum Productivity
1. **Bookmark QUICKSTART.md** - Use it constantly
2. **Copy from PATTERNS.md** - Don't rewrite from scratch
3. **Check CONTEXT.md first** - Avoid duplicate work
4. **Respect tech-stack-lock.md** - Saves time, avoids conflicts

### Before Installing Any Package
```
1. Is it in tech-stack-lock.md? → YES: Install, NO: ASK USER
2. Is it a Shadcn component? → YES: Install freely (pre-approved)
```

### Before Starting a Feature
```
1. Check CONTEXT.md - Is it already done?
2. Check PATTERNS.md - Is there a template?
3. Check existing code - Is there a similar feature?
```

---

## 🔗 External Resources

- **Shadcn UI:** https://ui.shadcn.com/docs
- **Next.js 16:** https://nextjs.org/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **TanStack Query:** https://tanstack.com/query/latest/docs
- **React Hook Form:** https://react-hook-form.com/docs

---

**Happy Coding! 🚀**

For questions or issues, check the project documentation or ask the user.
