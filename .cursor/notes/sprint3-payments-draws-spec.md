# Sprint 3 - Payments & Draws Technical Specification

**Date**: October 26, 2025  
**Status**: 📋 Specification Complete - Ready for Implementation  
**Epic**: Payments & Draws Management System  

---

## 🎯 Overview

Sprint 3 introduces comprehensive payment tracking and construction draw management capabilities to Lending OS. This system enables lenders to:

1. **Track loan payments** (principal, interest, fees) with multiple payment methods
2. **Manage construction draws** with approval workflows and inspection tracking
3. **Calculate real-time loan balances** and payment schedules
4. **Support mobile inspections** with offline-capable PWA
5. **Generate payment reports** and draw summaries

---

## 🏗️ Architecture Overview

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payment UI    │    │    Draw UI      │    │ Mobile Inspector│
│                 │    │                 │    │      (PWA)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    API Layer                                     │
├─────────────────────────────────┼─────────────────────────────────┤
│ PaymentService │ DrawService │ LoanBalanceService │ InspectionService │
└─────────────────────────────────┼─────────────────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                   Database Layer                                │
├─────────────────────────────────┼─────────────────────────────────┤
│ payments │ draws │ inspections │ payment_schedules │ draw_schedules │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### 1. Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Payment Details
  payment_type payment_type_enum NOT NULL, -- 'principal', 'interest', 'fee', 'combined'
  amount NUMERIC(14, 2) NOT NULL,
  principal_amount NUMERIC(14, 2) DEFAULT 0,
  interest_amount NUMERIC(14, 2) DEFAULT 0,
  fee_amount NUMERIC(14, 2) DEFAULT 0,
  
  -- Payment Method & Status
  payment_method payment_method_enum NOT NULL, -- 'wire', 'ach', 'check', 'cash'
  status payment_status_enum DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  
  -- Transaction Tracking
  transaction_reference TEXT,
  bank_reference TEXT,
  check_number TEXT,
  
  -- Timing
  payment_date DATE NOT NULL,
  received_date DATE,
  processed_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enums
CREATE TYPE payment_type_enum AS ENUM ('principal', 'interest', 'fee', 'combined');
CREATE TYPE payment_method_enum AS ENUM ('wire', 'ach', 'check', 'cash', 'other');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Indexes
CREATE INDEX payments_loan_id_idx ON payments(loan_id);
CREATE INDEX payments_payment_date_idx ON payments(payment_date);
CREATE INDEX payments_status_idx ON payments(status);
CREATE INDEX payments_payment_method_idx ON payments(payment_method);
```

### 2. Draws Table

```sql
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Draw Details
  draw_number INTEGER NOT NULL, -- Sequential per loan
  amount_requested NUMERIC(14, 2) NOT NULL,
  amount_approved NUMERIC(14, 2),
  amount_disbursed NUMERIC(14, 2),
  
  -- Work Description
  work_description TEXT NOT NULL,
  budget_line_item TEXT, -- Links to collateral.draw_schedule
  contractor_name TEXT,
  contractor_contact TEXT,
  
  -- Status & Workflow
  status draw_status_enum DEFAULT 'requested', -- 'requested', 'approved', 'inspected', 'disbursed', 'rejected'
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  inspected_by UUID REFERENCES users(id),
  
  -- Dates
  requested_date DATE DEFAULT CURRENT_DATE,
  approved_date DATE,
  inspection_date DATE,
  disbursed_date DATE,
  
  -- Metadata
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(loan_id, draw_number)
);

-- Enums
CREATE TYPE draw_status_enum AS ENUM ('requested', 'approved', 'inspected', 'disbursed', 'rejected');

-- Indexes
CREATE INDEX draws_loan_id_idx ON draws(loan_id);
CREATE INDEX draws_status_idx ON draws(status);
CREATE INDEX draws_requested_date_idx ON draws(requested_date);
```

### 3. Inspections Table

```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  
  -- Inspection Details
  inspection_type inspection_type_enum NOT NULL, -- 'progress', 'final', 'quality', 'safety'
  status inspection_status_enum DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'failed'
  
  -- Inspector & Location
  inspector_name TEXT NOT NULL,
  inspector_contact TEXT,
  inspection_location TEXT, -- Property address or specific area
  
  -- Results
  work_completion_percentage INTEGER CHECK (work_completion_percentage >= 0 AND work_completion_percentage <= 100),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  safety_compliant BOOLEAN DEFAULT true,
  
  -- Findings
  findings TEXT,
  recommendations TEXT,
  photos JSONB, -- Array of photo metadata
  signatures JSONB, -- Digital signatures
  
  -- Timing
  scheduled_date DATE,
  completed_date DATE,
  inspection_duration_minutes INTEGER,
  
  -- Metadata
  weather_conditions TEXT,
  equipment_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enums
CREATE TYPE inspection_type_enum AS ENUM ('progress', 'final', 'quality', 'safety');
CREATE TYPE inspection_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'failed');

-- Indexes
CREATE INDEX inspections_draw_id_idx ON inspections(draw_id);
CREATE INDEX inspections_status_idx ON inspections(status);
CREATE INDEX inspections_completed_date_idx ON inspections(completed_date);
```

### 4. Payment Schedules Table

```sql
CREATE TABLE payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Schedule Details
  schedule_type schedule_type_enum NOT NULL, -- 'amortized', 'interest_only', 'balloon'
  payment_frequency payment_frequency_enum NOT NULL, -- 'monthly', 'quarterly', 'annually'
  
  -- Schedule Data
  total_payments INTEGER NOT NULL,
  payment_amount NUMERIC(14, 2) NOT NULL,
  schedule_data JSONB NOT NULL, -- Detailed payment breakdown
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES users(id)
);

-- Enums
CREATE TYPE schedule_type_enum AS ENUM ('amortized', 'interest_only', 'balloon');

-- Indexes
CREATE INDEX payment_schedules_loan_id_idx ON payment_schedules(loan_id);
CREATE INDEX payment_schedules_is_active_idx ON payment_schedules(is_active);
```

### 5. Draw Schedules Table

```sql
CREATE TABLE draw_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Schedule Details
  total_draws INTEGER NOT NULL,
  total_budget NUMERIC(14, 2) NOT NULL,
  schedule_data JSONB NOT NULL, -- Detailed draw breakdown
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX draw_schedules_loan_id_idx ON draw_schedules(loan_id);
CREATE INDEX draw_schedules_is_active_idx ON draw_schedules(is_active);
```

---

## 🔧 Service Layer Architecture

### 1. PaymentService

```typescript
export class PaymentService {
  // CRUD Operations
  static async createPayment(data: CreatePaymentDTO): Promise<Payment>
  static async getPayment(id: string): Promise<Payment | null>
  static async updatePayment(id: string, data: UpdatePaymentDTO): Promise<Payment>
  static async deletePayment(id: string): Promise<boolean>
  
  // Loan-specific operations
  static async getLoanPayments(loanId: string, filters?: PaymentFilters): Promise<Payment[]>
  static async getPaymentHistory(loanId: string): Promise<PaymentHistory>
  static async getPaymentSummary(loanId: string): Promise<PaymentSummary>
  
  // Payment processing
  static async processPayment(paymentId: string): Promise<Payment>
  static async reversePayment(paymentId: string, reason: string): Promise<Payment>
  
  // Balance calculations
  static async calculateLoanBalance(loanId: string, asOfDate?: Date): Promise<LoanBalance>
  static async calculateInterestAccrued(loanId: string, asOfDate?: Date): Promise<number>
  
  // Schedule generation
  static async generatePaymentSchedule(loanId: string): Promise<PaymentSchedule>
  static async updatePaymentSchedule(loanId: string): Promise<PaymentSchedule>
}
```

### 2. DrawService

```typescript
export class DrawService {
  // CRUD Operations
  static async createDraw(data: CreateDrawDTO): Promise<Draw>
  static async getDraw(id: string): Promise<Draw | null>
  static async updateDraw(id: string, data: UpdateDrawDTO): Promise<Draw>
  static async deleteDraw(id: string): Promise<boolean>
  
  // Loan-specific operations
  static async getLoanDraws(loanId: string, filters?: DrawFilters): Promise<Draw[]>
  static async getDrawHistory(loanId: string): Promise<DrawHistory>
  static async getDrawSummary(loanId: string): Promise<DrawSummary>
  
  // Workflow operations
  static async approveDraw(drawId: string, approvedBy: string, amount?: number): Promise<Draw>
  static async rejectDraw(drawId: string, rejectedBy: string, reason: string): Promise<Draw>
  static async disburseDraw(drawId: string, disbursedBy: string, amount: number): Promise<Draw>
  
  // Schedule management
  static async generateDrawSchedule(loanId: string): Promise<DrawSchedule>
  static async updateDrawSchedule(loanId: string): Promise<DrawSchedule>
  
  // Budget tracking
  static async getBudgetStatus(loanId: string): Promise<BudgetStatus>
  static async updateBudgetLineItem(loanId: string, lineItem: string, amount: number): Promise<void>
}
```

### 3. InspectionService

```typescript
export class InspectionService {
  // CRUD Operations
  static async createInspection(data: CreateInspectionDTO): Promise<Inspection>
  static async getInspection(id: string): Promise<Inspection | null>
  static async updateInspection(id: string, data: UpdateInspectionDTO): Promise<Inspection>
  static async deleteInspection(id: string): Promise<boolean>
  
  // Draw-specific operations
  static async getDrawInspections(drawId: string): Promise<Inspection[]>
  static async scheduleInspection(drawId: string, data: ScheduleInspectionDTO): Promise<Inspection>
  
  // Inspection workflow
  static async startInspection(inspectionId: string, inspectorId: string): Promise<Inspection>
  static async completeInspection(inspectionId: string, data: CompleteInspectionDTO): Promise<Inspection>
  static async failInspection(inspectionId: string, reason: string): Promise<Inspection>
  
  // Photo management
  static async addInspectionPhoto(inspectionId: string, photo: PhotoData): Promise<void>
  static async getInspectionPhotos(inspectionId: string): Promise<PhotoData[]>
  
  // Mobile/PWA operations
  static async syncOfflineInspections(inspectorId: string): Promise<SyncResult>
  static async getOfflineInspectionData(inspectorId: string): Promise<OfflineData>
}
```

### 4. LoanBalanceService

```typescript
export class LoanBalanceService {
  // Real-time calculations
  static async getCurrentBalance(loanId: string): Promise<LoanBalance>
  static async getBalanceAsOf(loanId: string, date: Date): Promise<LoanBalance>
  
  // Payment impact calculations
  static async calculatePaymentImpact(loanId: string, payment: PaymentData): Promise<BalanceImpact>
  static async calculateDrawImpact(loanId: string, draw: DrawData): Promise<BalanceImpact>
  
  // Interest calculations
  static async calculateDailyInterest(loanId: string, date: Date): Promise<number>
  static async calculateInterestAccrued(loanId: string, fromDate: Date, toDate: Date): Promise<number>
  
  // Schedule calculations
  static async calculateNextPayment(loanId: string): Promise<PaymentCalculation>
  static async calculateRemainingPayments(loanId: string): Promise<PaymentCalculation[]>
  
  // Reporting
  static async generateBalanceReport(loanId: string, period: DateRange): Promise<BalanceReport>
  static async generatePaymentProjection(loanId: string, months: number): Promise<PaymentProjection[]>
}
```

---

## 🌐 API Endpoint Design

### Payment Endpoints

#### `POST /api/v1/loans/:loanId/payments`
Create a new payment record.

**Request:**
```json
{
  "paymentType": "combined",
  "amount": 2500.00,
  "principalAmount": 2000.00,
  "interestAmount": 450.00,
  "feeAmount": 50.00,
  "paymentMethod": "wire",
  "paymentDate": "2025-10-26",
  "transactionReference": "WIRE123456789",
  "notes": "Monthly payment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "loanId": "loan-uuid",
    "paymentType": "combined",
    "amount": "2500.00",
    "status": "pending",
    "paymentDate": "2025-10-26",
    "createdAt": "2025-10-26T10:30:00Z"
  }
}
```

#### `GET /api/v1/loans/:loanId/payments`
Get payment history with filtering.

**Query Parameters:**
- `status`: Filter by payment status
- `paymentMethod`: Filter by payment method
- `startDate`: Filter payments from date
- `endDate`: Filter payments to date
- `page`: Page number for pagination
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "summary": {
      "totalPaid": "125000.00",
      "principalPaid": "100000.00",
      "interestPaid": "22500.00",
      "feesPaid": "2500.00"
    }
  }
}
```

#### `GET /api/v1/loans/:loanId/payment-schedule`
Get generated payment schedule.

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduleType": "amortized",
    "paymentFrequency": "monthly",
    "totalPayments": 36,
    "paymentAmount": "2500.00",
    "schedule": [
      {
        "paymentNumber": 1,
        "dueDate": "2025-11-26",
        "principalAmount": "2000.00",
        "interestAmount": "450.00",
        "totalAmount": "2450.00",
        "remainingBalance": "398000.00"
      }
    ]
  }
}
```

#### `PUT /api/v1/payments/:paymentId`
Update payment status or details.

**Request:**
```json
{
  "status": "completed",
  "processedDate": "2025-10-26T14:30:00Z",
  "bankReference": "ACH789012345"
}
```

### Draw Endpoints

#### `POST /api/v1/loans/:loanId/draws`
Create a new draw request.

**Request:**
```json
{
  "amountRequested": 15000.00,
  "workDescription": "Kitchen renovation - cabinets and countertops",
  "budgetLineItem": "kitchen_renovation",
  "contractorName": "ABC Construction",
  "contractorContact": "john@abcconstruction.com",
  "notes": "Materials delivered, work in progress"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "draw-uuid",
    "loanId": "loan-uuid",
    "drawNumber": 3,
    "amountRequested": "15000.00",
    "status": "requested",
    "requestedDate": "2025-10-26",
    "createdAt": "2025-10-26T10:30:00Z"
  }
}
```

#### `GET /api/v1/loans/:loanId/draws`
Get draw history with filtering.

**Query Parameters:**
- `status`: Filter by draw status
- `contractor`: Filter by contractor name
- `startDate`: Filter draws from date
- `endDate`: Filter draws to date

**Response:**
```json
{
  "success": true,
  "data": {
    "draws": [...],
    "summary": {
      "totalRequested": "75000.00",
      "totalApproved": "70000.00",
      "totalDisbursed": "65000.00",
      "remainingBudget": "25000.00"
    }
  }
}
```

#### `PUT /api/v1/draws/:drawId/status`
Update draw status (approve/reject/disburse).

**Request:**
```json
{
  "status": "approved",
  "amountApproved": 15000.00,
  "notes": "Work looks good, approved for full amount"
}
```

### Inspection Endpoints

#### `POST /api/v1/draws/:drawId/inspections`
Schedule an inspection.

**Request:**
```json
{
  "inspectionType": "progress",
  "inspectorName": "Jane Inspector",
  "inspectorContact": "jane@inspections.com",
  "scheduledDate": "2025-10-28",
  "inspectionLocation": "123 Main St, Kitchen"
}
```

#### `PUT /api/v1/inspections/:inspectionId/complete`
Complete an inspection.

**Request:**
```json
{
  "workCompletionPercentage": 85,
  "qualityRating": 4,
  "safetyCompliant": true,
  "findings": "Work progressing well, minor touch-ups needed",
  "recommendations": "Complete cabinet installation before next draw",
  "photos": [
    {
      "url": "https://s3.../photo1.jpg",
      "caption": "Kitchen cabinets installed",
      "timestamp": "2025-10-28T14:30:00Z"
    }
  ]
}
```

---

## 🎨 UI Components Planning

### Payment UI Components

#### 1. PaymentHistoryTable
- **Purpose**: Display payment history with filtering and pagination
- **Features**: 
  - Sort by date, amount, status
  - Filter by payment method, status, date range
  - Export to CSV/PDF
  - Payment status badges
  - Quick actions (view details, edit, reverse)

#### 2. PaymentEntryForm
- **Purpose**: Create new payment records
- **Features**:
  - Payment type selection (principal, interest, combined)
  - Amount breakdown calculator
  - Payment method selection
  - Transaction reference tracking
  - Validation and error handling

#### 3. PaymentScheduleView
- **Purpose**: Display generated payment schedule
- **Features**:
  - Interactive calendar view
  - Payment breakdown details
  - Remaining balance tracking
  - Payment status indicators
  - Schedule modification options

#### 4. BalanceSummaryCards
- **Purpose**: Show current loan balance and payment summary
- **Features**:
  - Current principal balance
  - Interest accrued
  - Next payment due
  - Payment history summary
  - Quick payment actions

### Draw UI Components

#### 1. DrawRequestWizard
- **Purpose**: Multi-step draw request creation
- **Steps**:
  1. Work description and amount
  2. Contractor information
  3. Budget line item selection
  4. Supporting documentation
  5. Review and submit

#### 2. DrawTimelineTracker
- **Purpose**: Visual timeline of draw status
- **Features**:
  - Status progression indicators
  - Timeline with dates and actions
  - Approval workflow visualization
  - Inspector assignment tracking
  - Disbursement status

#### 3. BudgetVsActualChart
- **Purpose**: Compare budgeted vs actual draw amounts
- **Features**:
  - Bar chart visualization
  - Budget line item breakdown
  - Variance analysis
  - Trend tracking
  - Export capabilities

#### 4. DrawApprovalDashboard
- **Purpose**: Manage pending draw approvals
- **Features**:
  - Pending draws list
  - Quick approve/reject actions
  - Bulk operations
  - Approval workflow management
  - Notification system

### Mobile Inspector App (PWA)

#### 1. InspectionForm
- **Purpose**: Offline-capable inspection data entry
- **Features**:
  - Work completion percentage slider
  - Quality rating (1-5 stars)
  - Safety compliance checklist
  - Photo capture with geolocation
  - Voice notes recording
  - Digital signature capture

#### 2. PhotoCapture
- **Purpose**: Document work progress with photos
- **Features**:
  - Camera integration
  - Photo annotation
  - GPS location tagging
  - Offline storage
  - Batch upload when online

#### 3. OfflineSync
- **Purpose**: Sync offline data when connection restored
- **Features**:
  - Background sync
  - Conflict resolution
  - Upload progress tracking
  - Error handling and retry
  - Data integrity validation

---

## 📱 Mobile Inspector App (PWA) Architecture

### Core Features

1. **Offline-First Design**
   - Service worker for offline functionality
   - IndexedDB for local data storage
   - Background sync for data upload
   - Conflict resolution strategies

2. **Photo Documentation**
   - Camera API integration
   - Photo compression and optimization
   - GPS location tagging
   - Batch upload with progress tracking

3. **Digital Forms**
   - Responsive form design
   - Input validation
   - Auto-save functionality
   - Digital signature capture

4. **Workflow Integration**
   - Draw status updates
   - Inspector assignment
   - Real-time notifications
   - Push notifications

### Technical Stack

- **Framework**: Next.js 16 with PWA support
- **State Management**: Zustand with persistence
- **Offline Storage**: IndexedDB via Dexie.js
- **Camera**: Web Camera API
- **Geolocation**: Web Geolocation API
- **Push Notifications**: Web Push API
- **Background Sync**: Service Worker API

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer methods
- Balance calculation algorithms
- Payment processing logic
- Draw workflow validation

### Integration Tests
- API endpoint functionality
- Database operations
- Payment processing workflows
- Draw approval processes

### End-to-End Tests
- Complete payment recording workflow
- Draw request and approval process
- Mobile inspector app functionality
- Offline sync capabilities

### Performance Tests
- Large payment history queries
- Real-time balance calculations
- Mobile app performance
- Offline data sync performance

---

## 📊 Success Metrics

### Functional Metrics
- ✅ Payments can be recorded and tracked accurately
- ✅ Draw requests can be submitted and approved
- ✅ Loan balances calculate correctly in real-time
- ✅ Payment schedules generate accurately
- ✅ Mobile inspector app functions offline
- ✅ All tests pass (unit, integration, e2e)

### Performance Metrics
- Payment history queries < 200ms
- Balance calculations < 100ms
- Mobile app loads < 3 seconds
- Offline sync completes < 30 seconds
- Photo uploads < 10 seconds per image

### User Experience Metrics
- Payment entry completion rate > 95%
- Draw approval workflow completion < 2 days
- Mobile inspector satisfaction > 4.5/5
- Offline functionality reliability > 99%

---

## 🚀 Implementation Phases

### Phase 1: Core Database & Services (Week 1)
- Create database tables and migrations
- Implement PaymentService and DrawService
- Build core API endpoints
- Unit tests for service layer

### Phase 2: Payment Management (Week 2)
- Payment UI components
- Payment history and scheduling
- Balance calculation integration
- Payment processing workflows

### Phase 3: Draw Management (Week 3)
- Draw request wizard
- Draw approval workflow
- Budget tracking and reporting
- Draw timeline visualization

### Phase 4: Mobile Inspector App (Week 4)
- PWA setup and offline functionality
- Inspection forms and photo capture
- Offline sync implementation
- Mobile-specific UI optimizations

### Phase 5: Integration & Testing (Week 5)
- End-to-end testing
- Performance optimization
- User acceptance testing
- Documentation and training

---

## 📚 Documentation Deliverables

1. **API Documentation**: Complete endpoint documentation with examples
2. **Service Layer Docs**: Method documentation and usage examples
3. **Database Schema**: ERD and table documentation
4. **Mobile App Guide**: PWA setup and usage instructions
5. **Testing Guide**: Test scenarios and validation procedures
6. **User Manuals**: Payment and draw management workflows

---

**Status**: 📋 Specification Complete - Ready for Implementation  
**Next Step**: Begin Phase 1 implementation (Database & Services)
