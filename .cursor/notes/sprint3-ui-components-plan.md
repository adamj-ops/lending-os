# Sprint 3 UI Components Plan

**Date**: October 26, 2025  
**Status**: 📋 Planning Complete - Ready for Phase 2 Implementation  

---

## 🎨 Payment UI Components

### 1. PaymentHistoryTable

**Location**: `src/app/(main)/dashboard/loans/_components/tabs/payment-tab.tsx`

**Purpose**: Display comprehensive payment history with filtering, sorting, and export capabilities

**Features**:
- Data table with columns: Date, Amount, Type, Method, Status, Reference
- Sort by date, amount, status
- Filter by payment method, status, date range
- Pagination (20 items per page)
- Payment status badges (pending, completed, failed, cancelled)
- Quick actions: View details, Edit, Reverse
- Export to CSV/PDF
- Summary cards: Total Paid, Principal Paid, Interest Paid, Fees Paid

**Components Used**:
- `DataTable` from data-table components
- `Badge` for status indicators
- `Button` for actions
- `DateRangePicker` for date filtering
- `Select` for status/method filters
- `Card` for summary display

**API Integration**:
- `GET /api/v1/loans/:loanId/payments?status=...&paymentMethod=...&startDate=...&endDate=...&page=1&limit=20`

**State Management**:
- React Query for data fetching
- URL search params for filter persistence
- Local state for table interactions

---

### 2. PaymentEntryForm

**Location**: `src/app/(main)/dashboard/loans/_components/forms/payment-entry-form.tsx`

**Purpose**: Create new payment records with validation

**Features**:
- Payment type selection (principal, interest, combined)
- Amount breakdown calculator
  - If "combined" selected, show fields for principal/interest/fees breakdown
  - Auto-calculate totals
- Payment method selection dropdown
- Transaction reference input
- Bank reference input
- Check number input (conditional on method)
- Payment date picker
- Notes textarea
- Real-time validation
- Submit button with loading state

**Components Used**:
- `Form` from react-hook-form
- `Input` for amounts and references
- `Select` for dropdowns
- `DatePicker` for dates
- `Textarea` for notes
- `Button` for submit

**Validation Schema**:
```typescript
const PaymentFormSchema = z.object({
  paymentType: z.enum(["principal", "interest", "fee", "combined"]),
  amount: z.number().positive(),
  principalAmount: z.number().optional(),
  interestAmount: z.number().optional(),
  feeAmount: z.number().optional(),
  paymentMethod: z.enum(["wire", "ach", "check", "cash", "other"]),
  paymentDate: z.date(),
  transactionReference: z.string().optional(),
  checkNumber: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.paymentType === "combined") {
    const total = (data.principalAmount || 0) + (data.interestAmount || 0) + (data.feeAmount || 0);
    return Math.abs(total - data.amount) < 0.01; // Allow for rounding
  }
  return true;
}, "Total breakdown must equal payment amount");
```

**API Integration**:
- `POST /api/v1/loans/:loanId/payments`

---

### 3. PaymentScheduleView

**Location**: `src/app/(main)/dashboard/loans/_components/tabs/schedule-tab.tsx`

**Purpose**: Display and interact with generated payment schedule

**Features**:
- Table view of payment schedule
  - Payment #, Due Date, Principal, Interest, Total, Remaining Balance
- Interactive calendar view (alternative display)
- Highlight upcoming payment
- Show payment status (paid, upcoming, overdue)
- Schedule modification options
- Regenerate schedule button
- Export schedule to PDF

**Components Used**:
- `DataTable` for schedule display
- `Calendar` for calendar view
- `Badge` for status indicators
- `Button` for actions
- `Card` for totals

**API Integration**:
- `GET /api/v1/loans/:loanId/payment-schedule`
- `POST /api/v1/loans/:loanId/payment-schedule` (regenerate)

---

### 4. BalanceSummaryCards

**Location**: `src/app/(main)/dashboard/loans/_components/balance-summary.tsx`

**Purpose**: Display current loan balance and key metrics

**Features**:
- Card 1: Current Principal Balance
  - Large amount display
  - Percentage paid indicator
- Card 2: Interest Accrued
  - Current accrued interest
  - Daily accrual rate
- Card 3: Next Payment Due
  - Amount due
  - Due date
  - Days until due
- Card 4: Payment History Summary
  - Total payments made
  - Last payment date
  - Quick link to payment history

**Components Used**:
- `Card` component
- `Progress` for percentage indicators
- `Badge` for status
- `Button` for quick actions

**API Integration**:
- Custom endpoint (to be created): `GET /api/v1/loans/:loanId/balance`

---

## 🏗️ Draw UI Components

### 1. DrawRequestWizard

**Location**: `src/app/(main)/dashboard/loans/_components/draw-request-wizard.tsx`

**Purpose**: Multi-step wizard for creating draw requests

**Steps**:

**Step 1: Work Description**
- Work description textarea
- Budget line item selection (from collateral.draw_schedule)
- Amount requested input with budget validation

**Step 2: Contractor Information**
- Contractor name input
- Contractor contact (email/phone)
- Contractor license # (optional)

**Step 3: Supporting Documentation**
- File upload for invoices, receipts, photos
- Document type selection
- Document description

**Step 4: Review**
- Summary of all entered information
- Edit buttons for each section
- Submit button

**Components Used**:
- Similar pattern to loan-builder wizard
- `FormProvider` with React Hook Form
- `Select` for budget line items
- `Input` for amounts and text
- `FileUpload` for documents
- `Button` for navigation

**API Integration**:
- `POST /api/v1/loans/:loanId/draws`

---

### 2. DrawTimelineTracker

**Location**: `src/app/(main)/dashboard/loans/_components/draw-timeline.tsx`

**Purpose**: Visual timeline showing draw status progression

**Features**:
- Timeline visualization with milestones
- Status indicators: Requested → Approved → Inspected → Disbursed
- Date stamps for each status
- User attribution (who approved, who inspected)
- Amount progression (requested → approved → disbursed)
- Inspection results summary
- Current status highlighted

**Components Used**:
- Custom timeline component
- `Badge` for status
- `Avatar` for users
- `Card` for each milestone
- `Separator` for timeline connectors

**Data Structure**:
```typescript
interface DrawTimelineItem {
  status: DrawStatus;
  date: string | null;
  user: string | null;
  amount: string | null;
  notes: string | null;
}
```

---

### 3. BudgetVsActualChart

**Location**: `src/app/(main)/dashboard/loans/_components/budget-chart.tsx`

**Purpose**: Compare budgeted vs actual draw amounts with variance analysis

**Features**:
- Bar chart visualization (grouped bars)
  - Budget amount (blue)
  - Actual disbursed (green)
  - Variance (red if over, green if under)
- Budget line item breakdown
- Percentage used per line item
- Total budget utilization gauge
- Drill-down to individual draws

**Components Used**:
- `Chart` from Tremor or Recharts
- `Card` for container
- `Progress` for utilization gauge
- `Badge` for variance indicators

**API Integration**:
- Custom endpoint: `GET /api/v1/loans/:loanId/budget-status`

---

### 4. DrawApprovalDashboard

**Location**: `src/app/(main)/dashboard/draws/page.tsx` (new page)

**Purpose**: Centralized dashboard for managing pending draw approvals

**Features**:
- List of pending draws across all loans
- Filter by loan, contractor, amount range
- Quick approve/reject actions
- Bulk operations (approve multiple draws)
- Draw details modal
- Inspection scheduling from dashboard
- Notification system for new draw requests

**Components Used**:
- `DataTable` with custom actions
- `Dialog` for draw details
- `Button` for quick actions
- `Checkbox` for bulk selection
- `Badge` for status

**API Integration**:
- `GET /api/v1/draws?status=requested`
- `PUT /api/v1/draws/:drawId/status`

---

## 📱 Mobile Inspector App (PWA) Components

### 1. InspectionForm

**Location**: `src/app/inspector/inspection/[inspectionId]/page.tsx`

**Purpose**: Mobile-optimized offline-capable inspection data entry

**Features**:
- Large touch targets for mobile
- Work completion percentage slider (0-100%)
- Quality rating star picker (1-5)
- Safety compliance checklist
  - Proper PPE usage
  - Site safety barriers
  - Equipment condition
  - Weather compliance
- Photo capture with camera API
- Voice notes recording
- Digital signature pad
- Offline storage to IndexedDB
- Auto-sync when online

**Components Used**:
- Mobile-optimized `Form`
- `Slider` for completion %
- Custom star rating component
- `Checkbox` for safety items
- Camera integration component
- Signature pad library (react-signature-canvas)

**PWA Features**:
- Service worker for offline functionality
- IndexedDB for local storage
- Background sync API
- Push notifications

---

### 2. PhotoCapture

**Location**: `src/app/inspector/components/photo-capture.tsx`

**Purpose**: Enhanced photo documentation with annotation

**Features**:
- Camera API integration
  - Front/back camera selection
  - Flash control
  - Photo preview
- Photo annotation
  - Text labels
  - Arrow markers
  - Measurement tools
- GPS location tagging
- Timestamp overlay
- Photo compression before upload
- Batch upload queue
- Upload progress indicator

**Technical Implementation**:
```typescript
// Camera API
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' } 
});

// Geolocation API
const position = await navigator.geolocation.getCurrentPosition();

// IndexedDB storage
const db = await openDB('inspector-db', 1);
await db.put('photos', photoData);
```

---

### 3. OfflineSync

**Location**: `src/app/inspector/components/offline-sync.tsx`

**Purpose**: Manage offline data synchronization

**Features**:
- Connection status indicator
- Sync status display
  - Pending uploads count
  - Last sync time
  - Sync in progress indicator
- Manual sync trigger
- Conflict resolution UI
- Upload queue management
- Error handling and retry
- Data integrity validation

**Service Worker Strategy**:
```typescript
// Background sync
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncOfflineData());
  }
});

// Periodic background sync
await registration.periodicSync.register('sync-inspections', {
  minInterval: 60 * 60 * 1000 // 1 hour
});
```

---

## 🗂️ File Structure Plan

```
src/app/(main)/dashboard/
├── loans/
│   └── _components/
│       ├── tabs/
│       │   ├── payment-tab.tsx (NEW)
│       │   └── schedule-tab.tsx (NEW)
│       ├── forms/
│       │   └── payment-entry-form.tsx (NEW)
│       ├── balance-summary.tsx (NEW)
│       ├── draw-request-wizard.tsx (NEW)
│       ├── draw-timeline.tsx (NEW)
│       └── budget-chart.tsx (NEW)
├── draws/ (NEW)
│   ├── page.tsx (Approval Dashboard)
│   └── _components/
│       ├── draw-approval-table.tsx
│       └── draw-details-dialog.tsx
└── payments/ (NEW - Optional)
    └── page.tsx (Payments Dashboard)

src/app/inspector/ (NEW - PWA)
├── layout.tsx (PWA-specific layout)
├── page.tsx (Inspector home)
├── inspection/
│   └── [inspectionId]/
│       └── page.tsx (Inspection form)
└── components/
    ├── photo-capture.tsx
    ├── offline-sync.tsx
    └── signature-pad.tsx
```

---

## 🔧 Component Implementation Priority

### High Priority (Phase 2 - Week 2)
1. ✅ PaymentHistoryTable - Core payment tracking
2. ✅ PaymentEntryForm - Essential for recording payments
3. ✅ BalanceSummaryCards - Critical loan overview
4. ✅ Payment tab in loan drawer

### Medium Priority (Phase 3 - Week 3)
1. ✅ DrawRequestWizard - Core draw functionality
2. ✅ DrawTimelineTracker - Draw status visibility
3. ✅ DrawApprovalDashboard - Workflow management
4. ✅ BudgetVsActualChart - Financial tracking

### Lower Priority (Phase 4 - Week 4)
1. ✅ PaymentScheduleView - Nice-to-have visualization
2. ✅ Mobile Inspector App - Advanced feature
3. ✅ PWA infrastructure - Offline capabilities

---

## 📊 Dependencies & Packages Needed

### UI Libraries
```json
{
  "@tanstack/react-table": "^8.x", // Already installed
  "recharts": "^2.x", // Already installed for charts
  "date-fns": "^2.x", // Date formatting
  "react-signature-canvas": "^1.x", // Digital signatures
  "dexie": "^3.x" // IndexedDB wrapper for PWA
}
```

### PWA Setup
```json
{
  "next-pwa": "^5.x", // PWA support for Next.js
  "workbox-webpack-plugin": "^7.x" // Service worker
}
```

---

## 🧪 Testing Strategy

### Component Tests
- Payment form validation
- Draw wizard flow
- Timeline rendering
- Chart data visualization

### Integration Tests
- Payment creation workflow
- Draw approval process
- Inspection completion
- Offline sync functionality

### E2E Tests
- Complete payment entry and view
- Draw request to disbursement
- Mobile inspection workflow
- PWA offline capability

---

## 📝 Implementation Roadmap

### Week 2: Payment Management UI
**Day 1-2**: PaymentHistoryTable + PaymentEntryForm  
**Day 3**: BalanceSummaryCards  
**Day 4**: Payment tab integration in loan drawer  
**Day 5**: Testing and refinement

### Week 3: Draw Management UI
**Day 1-2**: DrawRequestWizard  
**Day 2-3**: DrawTimelineTracker + DrawApprovalDashboard  
**Day 4**: BudgetVsActualChart  
**Day 5**: Testing and refinement

### Week 4: Mobile Inspector App
**Day 1-2**: PWA setup and InspectionForm  
**Day 3**: PhotoCapture component  
**Day 4**: OfflineSync implementation  
**Day 5**: Testing and refinement

### Week 5: Integration & Polish
**Day 1-2**: End-to-end testing  
**Day 3**: Performance optimization  
**Day 4**: Documentation  
**Day 5**: User acceptance testing

---

## ✅ Success Criteria

### Payment UI
- [ ] Users can view complete payment history
- [ ] Users can record new payments with validation
- [ ] Payment summaries calculate correctly
- [ ] Payment schedules display accurately
- [ ] Filter and search work efficiently

### Draw UI
- [ ] Users can submit draw requests
- [ ] Approvers can approve/reject draws
- [ ] Draw timeline shows clear status
- [ ] Budget tracking shows accurate data
- [ ] Bulk operations work correctly

### Mobile Inspector
- [ ] App works offline
- [ ] Photos capture with location data
- [ ] Inspection data syncs when online
- [ ] App is installable as PWA
- [ ] Performance is acceptable on mobile devices

---

**Status**: 📋 **Planning Complete**  
**Next Step**: Begin implementing PaymentHistoryTable component
