# 🧪 Loan Builder v2 - End-to-End Testing Guide

**Status**: Migration applied ✅ - Ready for full testing  
**URL**: http://localhost:3000/dashboard/loans

---

## 🎯 **Test Scenario 1: Yield Note** (5 minutes)

You already started this - let's complete it!

### **Steps:**

**Step 1: Category** ✅ (Already done)
- Selected "Yield Note / Capital Placement"

**Step 2: Party (Investor)** ✅ (Already done)
- Created or selected investor/lender

**Step 3: Investment Details** ✅ (Currently on this step)
- Return Rate: 8.5% (already filled)
- Compounding: Simple ✅
- Payment Frequency: Select "Quarterly" or "Monthly"
- Start Date: Click calendar icon, select today's date
- Maturity Date: Click calendar icon, select 12 months from now
- Click "Next"

**Step 4: Loan Terms**
- Principal Amount: $250,000
- Interest Rate: 8.5%
- Term (Months): 12
- Payment Type: Interest Only
- Payment Frequency: Quarterly
- (Fees optional - can skip)
- Escrow: Leave disabled
- Click "Next"

**Step 5: Documents**
- Skip (optional) - Click "Next"

**Step 6: Forecast**
- Should show AI-generated:
  - ROI Percentage
  - Default Probability
  - Efficiency Score
  - Risk Level
- Click "Next"

**Step 7: Review**
- Verify all data is displayed:
  - Loan Category: Yield Note
  - Investor details
  - Investment terms
  - Loan terms
- Click "Create Loan"

**Expected Result:**
- ✅ Success toast: "Loan created successfully!"
- ✅ Wizard closes
- ✅ Loans list shows new loan
- ✅ Loan has "draft" status

---

## 🎯 **Test Scenario 2: Asset-Backed Loan** (7 minutes)

### **Start Fresh:**
1. Click "New Loan"
2. Select "Asset-Backed Loan" (blue radio button)
3. Click "Next"

**Step 2: Borrower**
- Tab: Create New
- Type: Individual
- First Name: John
- Last Name: Doe
- Email: john.doe@example.com
- Phone: (555) 123-4567
- Credit Score: 720
- Click "Next"

**Step 3: Property**
- Address: 123 Main Street
- City: Denver
- State: CO
- ZIP: 80202
- Property Type: Single Family
- Occupancy: Owner Occupied
- Purchase Price: $450,000
- Estimated Value: $475,000
- Rehab Budget: $25,000 (optional)
- Click "Next"

**Step 4: Loan Terms**
- Principal: $400,000
- Rate: 12.5%
- Term: 12 months
- Payment Type: Interest Only
- Payment Frequency: Monthly
- Origination Fee: 250 BPS (shows as 2.50%)
- Late Fee: 500 BPS (shows as 5.00%)
- Escrow: Enable
- Click "Next"

**Step 5: Documents**
- Skip or upload test files
- Click "Next"

**Step 6: Collateral**
- Lien Position: 1st
- Description: "First position lien on single-family property"
- Click "Next"

**Step 7: Forecast**
- Should show calculations
- Click "Next"

**Step 8: Review**
- Verify everything
- Click "Create Loan"

---

## 🎯 **Test Scenario 3: Draft Persistence** (3 minutes)

1. Click "New Loan"
2. Select any category
3. Fill Steps 1-2
4. Click "Save Draft" (should see toast)
5. Close wizard (X button)
6. Click "New Loan" again
7. **Expected**: Prompt "Resume from draft?"
8. Click "Yes"
9. **Expected**: All data restored, step position restored
10. Complete the workflow OR test "Clear Draft"

---

## ✅ **Success Criteria**

### **For Each Loan Type:**
- [ ] Wizard completes without errors
- [ ] Success toast appears
- [ ] Wizard closes automatically
- [ ] New loan appears in loans list
- [ ] Loan has correct category tag
- [ ] All fields saved correctly

### **For Draft Persistence:**
- [ ] "Save Draft" shows success toast
- [ ] Draft survives wizard close
- [ ] Draft loads on reopen
- [ ] Draft clears on successful submit

### **For Validation:**
- [ ] Required fields prevent "Next"
- [ ] Error messages are helpful
- [ ] Can navigate back to fix errors
- [ ] Optional fields don't block progress

---

## 🐛 **If You Encounter Errors**

### **"Failed to create loan"**
Check:
1. Browser console (F12) for errors
2. Network tab for API response
3. Database connection in .env.local

### **Validation errors**
- Check which field is highlighted
- Hover over error message
- Verify required fields are filled

### **Calendar doesn't open**
- Click the calendar icon (not the input)
- Should open popover with month picker

### **Draft doesn't load**
- Check browser localStorage (F12 → Application → Local Storage)
- Look for key: "loan-builder-storage"

---

## 📊 **What to Verify**

### **In Browser Console:**
- No red errors (warnings are OK for now)
- API calls return 200 status
- Form data structure looks correct

### **In Database:**
After creating a loan, verify:
- Loan record exists with correct loanCategory
- Related tables populated (borrower/lender/property)
- loan_terms table has entry (if applicable)
- collateral table has entry (if applicable)

### **Visual Check:**
- Dialog fits screen
- No horizontal scrolling
- All text readable
- Buttons accessible
- Progress bar updates

---

## 🎉 **You're Testing Live!**

The wizard is fully functional. You can:
- Create all 3 loan types
- Save drafts
- See AI forecasts
- Review before submitting

**Go ahead and complete the Yield Note you started, then try Asset-Backed!** 🚀

**Questions?** Check `.cursor/notes/v2-implementation-summary.md` for full details.

