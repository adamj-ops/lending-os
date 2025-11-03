# Loan Features User Guide

Quick reference for using the Loan Detail Drawer and Loan Wizard features.

---

## 🗂️ Loan Detail Drawer

### Opening the Drawer

From the **Loans** page (`/dashboard/loans`):
1. Find any loan in the table
2. Click the **⋮ (three dots)** button in the Actions column
3. Select **"View details"**
4. Drawer slides in from the right

### Navigating Tabs

The drawer contains 7 tabs:

**1. Overview**
- View key loan metrics
- See status and related entities
- Quick action buttons (Edit, Change Status, Delete)

**2. Property**
- View associated property details
- Link to full property page
- Or assign a property if none exists

**3. Borrower**
- View borrower information
- Link to full borrower profile
- Or assign a borrower if none exists

**4. Lender**
- View lender details
- Link to full lender profile
- Or assign a lender if none exists

**5. Documents**
- **Upload documents**: 
  1. Select document type from dropdown
  2. Drag files or click "Choose Files"
  3. Files upload automatically to S3
- **Manage documents**:
  - Download: Click download icon
  - Delete: Click trash icon
- Shows all document metadata (type, size, upload date, uploader)

**6. Notes**
- **Add notes**:
  1. Type in textarea
  2. Click "Add Note"
- **View notes**: Timeline view with most recent first
- **Delete notes**: Click trash icon on any note

**7. Progress**
- View repayment progress bar (will show real data in Sprint 3)
- See calculated monthly payment
- View loan summary (principal, interest, total)
- Days to maturity countdown
- Payment history placeholder (Sprint 3)

---

## 🧙 Loan Creation Wizard

### Starting the Wizard

From the **Loans** page (`/dashboard/loans`):
1. Click **"+ New Loan"** button (top right)
2. Wizard modal opens with Step 1

### Step-by-Step Guide

**Step 1: Loan Type**
1. Click a loan purpose card (Purchase, Refinance, or Construction)
2. Enter estimated loan amount
3. Select property type from dropdown
4. Click **"Next"**

**Step 2: Borrower**
- **Option A - Select Existing**:
  1. Stay on "Select Existing" tab
  2. Search for borrower by name or email
  3. Click borrower card to select
  4. Click **"Next"**

- **Option B - Create New**:
  1. Click "Create New" tab
  2. Fill in required fields (*, firstName, lastName, email)
  3. Optional: phone, company name, credit score
  4. Click **"Next"**

**Step 3: Property**
- **Option A - Select Existing**:
  1. Stay on "Select Existing" tab
  2. Search for property by address
  3. Click property card to select
  4. Click **"Next"**

- **Option B - Create New**:
  1. Click "Create New" tab
  2. Fill in required fields (*, address, city, state)
  3. Optional: ZIP, property type, purchase price
  4. Click **"Next"**

**Step 4: Lender**
- **Option A - Select Existing**:
  1. Stay on "Select Existing" tab
  2. Search for lender by name
  3. Click lender card to select
  4. Click **"Next"**

- **Option B - Create New**:
  1. Click "Create New" tab
  2. Fill in required fields (*, name, entity type)
  3. Optional: contact email, contact phone
  4. Click **"Next"**

**Step 5: Loan Terms**
1. Enter exact loan amount
2. Enter interest rate (percentage)
3. Enter term in months (or use preset buttons: 12, 24, 36, 60, 84, 120)
4. Optional: Select funded date
5. Optional: Select maturity date
6. Review loan summary
7. Click **"Next"**

**Step 6: Documents** (Optional)
1. Select document type (if uploading)
2. Drag files or click "Choose Files"
3. Wait for upload progress to complete
4. Can upload up to 10 files, 25MB each
5. Click **"Next"** (even with no documents)

**Step 7: Review**
1. Review all entered information
2. Check for accuracy
3. Click **"Create Loan"**
4. Wait for success confirmation
5. Wizard closes automatically
6. New loan appears in loans list

### Wizard Tips

- **Navigate backwards**: Click step buttons at top or use "Back" button
- **Cancel anytime**: Click "Cancel" or X button (warns if progress will be lost)
- **Required fields**: Marked with * in form labels
- **Validation**: Can't proceed past a step without completing required fields
- **Smart defaults**: Property type from Step 1 pre-fills in Step 3

---

## 📁 File Upload Best Practices

### Supported File Types
- Images: .jpg, .jpeg, .png, .gif, .webp
- Documents: .pdf, .doc, .docx
- Configurable per upload context

### File Size Limits
- **Loan documents**: 25MB per file
- **Default**: 10MB per file
- Server enforces limits, client validates upfront

### Naming Conventions
- Files stored with timestamp prefix: `1729872000000-original-filename.pdf`
- Prevents name collisions
- Original filename preserved in database

### Organization
Files organized by folder:
- `loan-documents/` - Loan-related documents
- `uploads/` - General uploads
- Future: `property-photos/`, `borrower-documents/`

---

## 🔗 API Endpoints Reference

### Loan Details
- `GET /api/v1/loans/[id]` - Get loan by ID

### Documents
- `GET /api/v1/loans/[id]/documents` - List documents
- `POST /api/v1/loans/[id]/documents` - Create document record
- `DELETE /api/v1/loans/[id]/documents/[docId]` - Delete document

### Notes
- `GET /api/v1/loans/[id]/notes` - List notes
- `POST /api/v1/loans/[id]/notes` - Create note
- `PUT /api/v1/loans/[id]/notes/[noteId]` - Update note
- `DELETE /api/v1/loans/[id]/notes/[noteId]` - Delete note

### Upload
- `POST /api/v1/upload/presigned-url` - Get S3 upload URL

### Wizard
- `POST /api/v1/loans/wizard` - Create loan with all relations

---

## 🎨 UI Components

### Reusable Components Created

**FileUpload**
- Location: `src/components/ui/file-upload.tsx`
- Props:
  - `onUpload`: Callback with uploaded files array
  - `maxFiles`: Maximum number of files (default: 5)
  - `maxSize`: Maximum file size in MB (default: 10)
  - `acceptedTypes`: Array of MIME types
  - `folder`: S3 folder path
- Features: drag-drop, progress, validation, preview, remove

**SimpleDataTable**
- Location: `src/components/data-table/simple-data-table.tsx`
- Simplified wrapper around DataTable
- Props: `columns`, `data`
- Automatically creates table instance

### Existing Components Used

- **Drawer** - Right-side panel from shadcn/ui
- **Dialog** - Modal for wizard from shadcn/ui
- **Tabs** - Tab navigation in drawer
- **Progress** - Progress bars and indicators
- **Calendar** - Date pickers in loan terms
- **Select** - Dropdowns throughout
- **Badge** - Status and type indicators

---

## 🔧 Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Generate database migrations
npm run db:generate

# Apply database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

---

## 📋 Testing Workflow

### Before First Use
1. Configure AWS credentials in `.env.local` (see `aws-s3-setup.md`)
2. Run migrations: `npm run db:migrate`
3. Seed database: `npm run db:seed`
4. Start dev server: `npm run dev`

### Testing New Loan Creation
1. Navigate to `/dashboard/loans`
2. Click "New Loan"
3. Go through all wizard steps
4. Upload a test document in Step 6
5. Review and submit
6. Verify loan appears in table
7. Click ⋮ → "View details"
8. Check all tabs load correctly
9. Try uploading another document in Documents tab
10. Add a note in Notes tab
11. Verify Progress tab calculations

---

## 💡 Pro Tips

- **Quick loan review**: Click loan row action → View details for fast access
- **Batch document upload**: Upload multiple files at once in Documents tab
- **Step navigation**: Click step buttons in wizard to jump to previous steps
- **Empty states**: All tabs show helpful CTAs when data is missing
- **Progress tracking**: Upload progress shows real-time percentage
- **Validation feedback**: Wizard won't proceed without required fields

---

**Features ready for production testing!**

