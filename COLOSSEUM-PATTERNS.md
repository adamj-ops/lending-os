# Colosseum Component Patterns

## Component Library Based on Screenshot

This guide shows exact patterns from the Colosseum forum screenshot, ready to use in your Lending OS.

---

## 1. Category Filter Pills

### Pattern from Screenshot
The "DEFI", "GAMING", "PAYMENTS" filter buttons.

### Implementation

```tsx
import { CategoryPill } from '@/components/colosseum';

// Basic usage
<div className="flex flex-wrap gap-2">
  <CategoryPill active>All</CategoryPill>
  <CategoryPill>DeFi</CategoryPill>
  <CategoryPill>Gaming</CategoryPill>
  <CategoryPill>Payments</CategoryPill>
</div>

// With state management
const [active, setActive] = useState('defi');

{categories.map((cat) => (
  <CategoryPill
    key={cat.id}
    active={active === cat.id}
    onClick={() => setActive(cat.id)}
  >
    {cat.label}
  </CategoryPill>
))}
```

### Visual Specs
- **Inactive**: Teal border, subtle teal background (shade-50), teal text
- **Active**: Filled teal (shade-500), dark text, semibold
- **Hover**: Slightly darker background (shade-100), cyan glow shadow
- **Typography**: Uppercase, tracking-wider, text-xs

### Use Cases in Lending OS
- Loan type filters (Personal, Business, Bridge)
- Status filters (Active, Pending, Closed)
- Category tags on borrower profiles
- Fund type selectors

---

## 2. "Looking for Team" Badge

### Pattern from Screenshot
The orange "◆ LOOKING FOR TEAM" badge on posts.

### Implementation

```tsx
import { TeamBadge } from '@/components/colosseum';

<TeamBadge>LOOKING FOR TEAM</TeamBadge>
<TeamBadge>URGENT</TeamBadge>
<TeamBadge>ACTION REQUIRED</TeamBadge>
```

### Visual Specs
- **Background**: Orange (accent-500)
- **Border**: Darker orange (accent-600)
- **Icon**: Diamond ◆ before text
- **Typography**: Bold, uppercase, tracking-wider
- **Padding**: px-2.5 py-1

### Use Cases in Lending OS
- Urgent loan reviews
- Action required badges
- Priority flags
- Deadline warnings

---

## 3. Post Card Layout

### Pattern from Screenshot
Forum-style post cards with title, author, timestamp, categories, stats.

### Implementation

```tsx
import { PostCard, CategoryPill, TeamBadge } from '@/components/colosseum';

<PostCard
  title="FULL STACK WANTED (EQUITY STAKE WITH FUTURE OPTIONS)"
  author="WanderWonder"
  timestamp="12 hours"
  badges={<TeamBadge>LOOKING FOR TEAM</TeamBadge>}
  excerpt="Seeking a full-stack dev for @SquareOneFinance..."
  categories={
    <>
      <CategoryPill>DeFi</CategoryPill>
      <CategoryPill>Payments</CategoryPill>
    </>
  }
  stats={{ likes: 2, comments: 4 }}
/>
```

### Visual Specs
- **Border**: Top border only (brand-primary-950/30)
- **Hover**: Subtle teal background (brand-primary-950/10)
- **Title**: Bold, large, white text, hover → teal
- **Author**: Teal color (brand-primary-400), medium weight
- **Timestamp**: Muted gray
- **Spacing**: Generous padding (p-6)

### Use Cases in Lending OS
- Activity feed items
- Loan application cards
- Notification list
- Comment threads
- Document list

---

## 4. Search Bar

### Pattern from Screenshot
"Search for topics" input with icon.

### Implementation

```tsx
import { SearchBar } from '@/components/colosseum';

<SearchBar 
  placeholder="Search for topics"
  value={searchQuery}
  onChange={setSearchQuery}
/>

// Or use utility class
<input className="search-colosseum" placeholder="Search..." />
```

### Visual Specs
- **Background**: Very dark teal tint (brand-primary-950/20)
- **Border**: Subtle teal (brand-primary-900/40)
- **Focus**: Teal border (brand-primary-500), soft glow ring
- **Icon**: Search icon, muted color
- **Typography**: System font, regular weight

### Use Cases in Lending OS
- Global search
- Loan search/filter
- Borrower lookup
- Document search
- Fund search

---

## 5. Top Banner (Announcement Style)

### Pattern from Screenshot
"HACKATHON ENDED - Projects under review" banner.

### Implementation

```tsx
<div className="bg-brand-accent-500/10 border-b border-border px-6 py-4">
  <div className="flex items-center gap-3">
    <span>👁️</span>
    <div>
      <span className="font-bold uppercase tracking-wide text-foreground">
        HACKATHON ENDED
      </span>
      <span className="text-muted-foreground ml-2">—</span>
      <span className="text-muted-foreground ml-2">
        Projects under review
      </span>
    </div>
  </div>
  <p className="text-sm text-muted-foreground mt-2">
    Additional context or call to action
  </p>
</div>
```

### Visual Specs
- **Background**: Subtle orange tint (accent-500/10)
- **Typography**: Bold uppercase for main message, regular for details
- **Spacing**: Padding for breathing room
- **Icon**: Emoji or icon before text

### Use Cases in Lending OS
- System announcements
- Maintenance notices
- Feature updates
- Compliance alerts
- Payment deadlines

---

## 6. Tab Toggle (TRENDING / RECENT)

### Pattern from Screenshot
Icon + text toggle buttons.

### Implementation

```tsx
const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending');

<div className="flex items-center gap-4">
  <button
    onClick={() => setActiveTab('trending')}
    className={`flex items-center gap-2 text-sm font-medium ${
      activeTab === 'trending' 
        ? 'text-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    📈 TRENDING
  </button>
  <button
    onClick={() => setActiveTab('recent')}
    className={`flex items-center gap-2 text-sm font-medium ${
      activeTab === 'recent' 
        ? 'text-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    🕐 RECENT
  </button>
</div>
```

### Visual Specs
- **Active**: White text
- **Inactive**: Muted gray, hover → white
- **Icon**: Emoji or icon before label
- **Typography**: Small, medium weight, uppercase

### Use Cases in Lending OS
- Dashboard views (Overview / Details)
- Loan sorting (Recent / Amount / Status)
- Time period toggles (Week / Month / Year)

---

## 7. Action Button Bar

### Pattern from Screenshot
"EXPLORE PROJECTS" and "JOIN OUR DISCORD" buttons.

### Implementation

```tsx
<div className="flex gap-3">
  <Button variant="colosseum" size="sm">
    EXPLORE PROJECTS
  </Button>
  <Button variant="colosseum-active" size="sm">
    JOIN OUR DISCORD
  </Button>
</div>
```

### Visual Specs
- **Primary CTA**: Filled teal (colosseum-active)
- **Secondary CTA**: Outlined teal (colosseum)
- **Size**: Small, compact
- **Typography**: Uppercase, bold

### Use Cases in Lending OS
- Form actions (Save / Cancel)
- Bulk actions (Approve All / Reject)
- Navigation CTAs
- Modal actions

---

## 8. Stats Display (Likes / Comments)

### Pattern from Screenshot
Heart and chat icons with counts.

### Implementation

```tsx
<div className="flex items-center gap-4 text-xs text-muted-foreground">
  <span className="flex items-center gap-1">
    <span>❤️</span>
    <span>2</span>
  </span>
  <span className="flex items-center gap-1">
    <span>💬</span>
    <span>4</span>
  </span>
  <button className="flex items-center gap-1 hover:text-foreground transition">
    <span>↗️</span>
    <span>SHARE</span>
  </button>
</div>
```

### Visual Specs
- **Size**: text-xs
- **Color**: Muted gray
- **Hover**: Lighten to white
- **Icons**: Emoji or icon glyphs
- **Spacing**: gap-4 between items

### Use Cases in Lending OS
- Document approval counts
- Comment counts on notes
- Activity indicators
- Engagement metrics

---

## Full Example: Loan Feed

Combining all patterns:

```tsx
import { CategoryPill, TeamBadge, PostCard, SearchBar } from '@/components/colosseum';
import { Button } from '@/components/ui/button';

export function LoanFeed() {
  const [filter, setFilter] = useState('all');
  
  return (
    <div>
      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Search loans..." />
          <Button variant="primary" size="sm">+ NEW LOAN</Button>
        </div>
        
        <div className="flex gap-2">
          <CategoryPill active={filter === 'all'} onClick={() => setFilter('all')}>
            All Loans
          </CategoryPill>
          <CategoryPill active={filter === 'personal'} onClick={() => setFilter('personal')}>
            Personal
          </CategoryPill>
          <CategoryPill active={filter === 'business'} onClick={() => setFilter('business')}>
            Business
          </CategoryPill>
        </div>
      </div>

      {/* Loan Cards */}
      <div className="bg-card rounded-lg border border-border">
        <PostCard
          title="BRIDGE LOAN APPLICATION - $250K URGENT"
          author="John Smith"
          timestamp="2 hours ago"
          badges={<TeamBadge>URGENT REVIEW</TeamBadge>}
          excerpt="Seeking bridge financing for property acquisition..."
          categories={
            <>
              <CategoryPill>Bridge Loan</CategoryPill>
              <CategoryPill>Real Estate</CategoryPill>
            </>
          }
          stats={{ likes: 3, comments: 7 }}
        />
        {/* More loans... */}
      </div>
    </div>
  );
}
```

---

## Responsive Patterns

All components are mobile-friendly:

```tsx
// Pills wrap on small screens
<div className="flex flex-wrap gap-2">
  {categories.map((cat) => (
    <CategoryPill key={cat.id}>{cat.label}</CategoryPill>
  ))}
</div>

// Search bar scales
<SearchBar className="w-full md:w-96" />

// Buttons stack on mobile
<div className="flex flex-col sm:flex-row gap-3">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

---

## Color Combinations That Work

### Teal + Orange (Primary + Accent)

```tsx
// Teal pill with orange badge
<div className="flex gap-2 items-center">
  <CategoryPill>DeFi</CategoryPill>
  <TeamBadge>NEW</TeamBadge>
</div>
```

### Teal + Green (Primary + Success)

```tsx
// Teal action with green status
<div className="flex items-center justify-between">
  <Badge variant="success">Approved</Badge>
  <Button variant="colosseum">View Details</Button>
</div>
```

### Full Palette

```tsx
<div className="flex flex-wrap gap-2">
  <CategoryPill active>Teal Active</CategoryPill>
  <TeamBadge>Orange Badge</TeamBadge>
  <Badge variant="success">Green Success</Badge>
  <Badge variant="danger">Red Danger</Badge>
</div>
```

---

## Demo Page

**See all patterns in action:**
```
http://localhost:3000/dashboard/colosseum-demo
```

This page recreates the Colosseum forum layout with:
- Top announcement banner
- Search bar with buttons
- Tab toggle (TRENDING / RECENT)
- Category filter pills
- Post cards with badges
- Stats and interactions

---

**Use these patterns to make your Lending OS feel like the Colosseum forum!** 🎨

