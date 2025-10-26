# 🎨 CLAUDE.md — Shadcn Frontend Development

## 🌐 Context
Frontend stack: Next.js (App Router) + TypeScript + Tailwind + Shadcn UI  
Design system: Accessible, composable, and minimal — Open Sans as base font

## 🧩 Component Workflow
When building UI:
1. Use `npx shadcn-ui add [component]` if available.
2. Place components in `/components/ui`.
3. Re-export shared components via `/lib/components/index.ts`.
4. For stateful UI, use React hooks or Zustand stores.

## ✨ Shadcn Patterns
- Composition first: `Dialog → DialogTrigger + DialogContent`
- Use `Card`, `Sheet`, `Tabs`, and `DropdownMenu` for structured layouts
- Prefer Tailwind utilities (`flex`, `gap`, `space-y`) over inline CSS
- Use `lucide-react` icons
- Add `'use client'` only when interaction is needed

## 🧱 Example Layout Scaffold
```tsx
'use client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export default function BorrowersPage() {
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Borrowers</h2>
          <Button>New Borrower</Button>
        </CardHeader>
        <CardContent>
          {/* Table or list here */}
        </CardContent>
      </Card>
    </div>
  )
}

🧠 Best Practices
	•	Keep all layout widths within max-w-7xl mx-auto
	•	Use md: breakpoints for responsive stacking
	•	Always test with keyboard navigation
	•	Store filters/search state in URL query params

🚀 Commands
	•	pnpm dev — start dev server
	•	pnpm shadcn add [component]
	•	pnpm lint — lint + a11y
	•	pnpm test:ui — Vitest UI tests