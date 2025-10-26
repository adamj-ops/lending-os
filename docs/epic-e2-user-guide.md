# Borrower & Lender Management User Guide

## Overview

The Borrower & Lender Management module allows you to manage all individuals and organizations involved in your lending operations. This guide covers how to create, edit, search, and manage borrowers and lenders, as well as how to associate them with loans.

---

## Table of Contents

1. [Accessing the Module](#accessing-the-module)
2. [Managing Borrowers](#managing-borrowers)
3. [Managing Lenders](#managing-lenders)
4. [Loan Associations](#loan-associations)
5. [Search and Filtering](#search-and-filtering)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Accessing the Module

### Navigating to Borrowers

1. From the main dashboard, click on **Borrowers** in the sidebar navigation
2. You'll see a list of all borrowers in your organization

### Navigating to Lenders

1. From the main dashboard, click on **Lenders** in the sidebar navigation
2. You'll see a list of all lenders/capital providers

---

## Managing Borrowers

### Creating a New Borrower

1. Click the **New Borrower** button in the top right corner
2. Select the borrower type:
   - **Individual**: For personal borrowers
   - **Entity**: For business/corporate borrowers

#### For Individual Borrowers

Fill in the following information:

- **First Name** (required): Borrower's first name
- **Last Name** (required): Borrower's last name
- **Email** (required): Primary contact email
- **Phone** (optional): Contact phone number
- **Address** (optional): Physical or mailing address
- **Credit Score** (optional): FICO score (300-850)

**Example:**
```
Type: Individual
First Name: John
Last Name: Doe
Email: john.doe@example.com
Phone: (555) 123-4567
Credit Score: 720
```

#### For Entity Borrowers

Fill in the following information:

- **Entity Name** (required): Company or organization name
- **Email** (required): Primary contact email
- **Phone** (optional): Contact phone number
- **Address** (optional): Business address
- **Credit Score** (optional): Business credit score

**Example:**
```
Type: Entity
Entity Name: ABC Real Estate Holdings LLC
Email: contact@abcholdings.com
Phone: (555) 987-6543
Credit Score: 680
```

3. Click **Create Borrower** to save

### Editing a Borrower

1. Find the borrower in the table
2. Click the three-dot menu (⋮) in the Actions column
3. Select **Edit borrower**
4. Update the information in the dialog
5. The dialog includes two sections:
   - **Borrower Information**: Basic details
   - **Loan Associations**: Manage loans (see [Loan Associations](#loan-associations))
6. Click **Update Borrower** to save changes

### Deleting a Borrower

⚠️ **Warning**: This action cannot be undone and will remove all loan associations.

1. Find the borrower in the table
2. Click the three-dot menu (⋮) in the Actions column
3. Select **Delete**
4. Confirm the deletion in the popup dialog

---

## Managing Lenders

### Creating a New Lender

1. Click the **New Lender** button in the top right corner
2. Fill in the required information:

**Required Fields:**
- **Lender Name**: Name of the lender or institution
- **Entity Type**: Select one of:
  - **Individual**: Personal lender
  - **Company**: Corporate lender
  - **Fund**: Investment fund
  - **IRA**: Self-directed IRA account
- **Contact Email**: Primary contact email

**Optional Fields:**
- **Contact Phone**: Phone number
- **Total Committed**: Total capital committed by the lender
- **Total Deployed**: Amount currently deployed in loans

**Example:**
```
Name: ABC Capital Partners
Entity Type: Fund
Contact Email: investments@abccapital.com
Phone: (555) 111-2222
Total Committed: $5,000,000.00
Total Deployed: $3,250,000.00
```

3. Click **Create Lender** to save

### Editing a Lender

1. Find the lender in the table
2. Click the three-dot menu (⋮) in the Actions column
3. Select **Edit lender**
4. Update the information (including loan associations)
5. Click **Update Lender** to save changes

### Deleting a Lender

⚠️ **Warning**: This action cannot be undone and will remove all loan associations.

1. Find the lender in the table
2. Click the three-dot menu (⋮) in the Actions column
3. Select **Delete**
4. Confirm the deletion

---

## Loan Associations

### Understanding Loan Associations

Loan associations link borrowers and lenders to specific loans:
- **Borrowers** can be associated with multiple loans they're borrowing against
- **Lenders** can be associated with multiple loans they're funding

### Managing Borrower Loan Associations

1. Edit an existing borrower (you cannot add loan associations during creation)
2. Scroll down to the **Loan Associations** section
3. Click the dropdown to see all available loans
4. Use the search box to find specific loans by address or ID
5. Click on loans to select/deselect them:
   - ✓ Checkmark indicates the loan is associated
   - No checkmark means the loan is not associated
6. Selected loans appear as badges below the dropdown
7. Changes are automatically saved when you select/deselect loans
8. Click **Update Borrower** or **Cancel** to close the dialog

### Managing Lender Loan Associations

The process is identical to managing borrower loan associations:

1. Edit an existing lender
2. Scroll to the **Loan Associations** section
3. Select/deselect loans using the dropdown
4. Changes auto-save

### Viewing Loan Counts

The table shows the number of loans associated with each borrower/lender:
- Look for the **Loans** column
- The number badge shows the count (e.g., "3" means 3 associated loans)

---

## Search and Filtering

### Searching

Use the search bar at the top of the table to find borrowers or lenders:

1. Type in the search box
2. Search works on:
   - **Borrowers**: First name, last name, entity name, and email
   - **Lenders**: Lender name and contact email
3. Results filter in real-time as you type
4. Clear the search box to see all records

**Search Examples:**
- Search for "john" to find all borrowers named John
- Search for "@gmail.com" to find all Gmail addresses
- Search for "LLC" to find all entity borrowers with LLC in the name

### Filtering by Type

#### Borrower Type Filter

1. Click the type filter dropdown
2. Select:
   - **All Types**: Show both individual and entity borrowers
   - **Individual**: Show only personal borrowers
   - **Entity**: Show only business borrowers

#### Lender Entity Type Filter

1. Click the entity type filter dropdown
2. Select:
   - **All Types**: Show all lenders
   - **Individual**: Personal lenders only
   - **Company**: Corporate lenders only
   - **Fund**: Investment funds only
   - **IRA**: Self-directed IRAs only

### Sorting

Click any column header to sort:

**Sortable Columns (Borrowers):**
- Name (alphabetically)
- Email (alphabetically)
- Type (alphabetically)
- Credit Score (numerically)
- Loans (numerically by count)

**Sortable Columns (Lenders):**
- Name (alphabetically)
- Type (alphabetically)
- Email (alphabetically)
- Committed (numerically by amount)
- Deployed (numerically by amount)
- Loans (numerically by count)

**Sorting Tips:**
- Click once to sort ascending (A-Z, 0-9)
- Click again to sort descending (Z-A, 9-0)
- Look for the arrow indicator showing sort direction

### Combining Search, Filter, and Sort

You can use all three features together:

**Example:** Find all high-credit individual borrowers
1. Set type filter to "Individual"
2. Click "Credit Score" column to sort descending
3. Search for specific name if needed

### URL Sharing

Filter states are saved in the URL, which means:
- You can bookmark filtered views
- Share filtered URLs with team members
- Browser back/forward buttons work as expected

**Example URLs:**
- `/dashboard/borrowers?search=john&type=individual`
- `/dashboard/lenders?type=fund`

### Clearing Filters

If no results match your filters, you'll see:
- Message: "No borrowers/lenders match your filters"
- **Clear filters** button to reset all filters

---

## Best Practices

### Data Entry Best Practices

#### Email Addresses
- ✅ Use valid, active email addresses
- ✅ Verify email addresses before saving
- ❌ Avoid using temporary or disposable emails

#### Borrower Types
- Use **Individual** for personal borrowers
- Use **Entity** for:
  - LLCs
  - Corporations
  - Trusts
  - Partnerships
  - Other business entities

#### Credit Scores
- Only enter credit scores if you have verified data
- Scores must be between 300 and 850
- Leave blank if unknown rather than guessing
- Update regularly when new credit reports are available

#### Lender Capital Tracking
- **Total Committed**: The total amount the lender has agreed to provide
- **Total Deployed**: Should never exceed Total Committed
- Update these amounts as loans are funded or repaid
- Use whole dollar amounts (decimals allowed but not required)

### Loan Association Best Practices

1. **Only associate relevant loans:**
   - Don't associate loans just because you can
   - Each association should represent a real financial relationship

2. **Keep associations current:**
   - Remove associations when loans are paid off or transferred
   - Update associations when borrowers or lenders change

3. **One borrower per loan:**
   - While the system supports multiple borrowers per loan, consider using co-borrowers or guarantors appropriately
   - Document joint borrowers clearly in loan notes

4. **Multiple lenders:**
   - Use associations to track syndicated loans or participation
   - Ensure deployed amounts are updated across all lender records

### Organization Tips

1. **Use consistent naming:**
   - For entities: Include the entity type (LLC, Inc, etc.)
   - For individuals: Use full legal names

2. **Keep contact information updated:**
   - Review and update email/phone quarterly
   - Mark inactive contacts clearly

3. **Regular data cleanup:**
   - Monthly: Review and update credit scores
   - Quarterly: Verify all contact information
   - Annually: Archive or delete inactive borrowers/lenders

4. **Document everything:**
   - Use the address field for important details
   - Keep notes in the loan records about specific arrangements

---

## Troubleshooting

### Common Issues

#### "Validation failed" Error

**Problem:** Getting validation errors when creating or updating records.

**Solutions:**
- **For individual borrowers:** Ensure both first and last name are filled
- **For entity borrowers:** Ensure the entity name field is filled (not first/last name)
- **Email validation:** Check that email is in valid format (name@domain.com)
- **Credit score:** Must be between 300-850 if provided

#### "No results found" After Searching

**Problem:** Search returns no results even though you know records exist.

**Solutions:**
- Check your spelling
- Try searching by email instead of name
- Clear the type filter (you might be filtering out the results)
- Click "Clear filters" button to reset everything

#### Can't See Loan Association Section

**Problem:** The loan association section doesn't appear when editing.

**Solution:**
- Loan associations are only available when **editing** existing records
- You must save a new borrower/lender first, then edit it to add loan associations
- This is by design - you can't associate loans that don't exist yet

#### Changes Not Saving

**Problem:** Updates don't seem to persist.

**Solutions:**
- Check for error messages at the top of the dialog
- Ensure all required fields are filled
- Verify you clicked "Update" not "Cancel"
- Check your internet connection
- Refresh the page and try again

#### Can't Delete Borrower/Lender

**Problem:** Delete option is grayed out or failing.

**Possible Causes:**
- Permission issues: Check with your administrator
- System integrity: May have active loans that prevent deletion
- Session timeout: Try logging out and back in

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open search | Click search box or start typing |
| Clear search | ESC (when focused on search) |
| Navigate table | Arrow keys |
| Open actions menu | Click ⋮ icon |

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [API Documentation](./epic-e2-api-documentation.md) for technical details
2. Contact your system administrator
3. Submit a support ticket with:
   - Description of the problem
   - Steps to reproduce
   - Screenshots if applicable
   - Your user role and organization

---

## Feature Requests

We're constantly improving the Borrower & Lender Management module. If you have suggestions for new features, please submit them through your organization's feedback channel.

### Planned Enhancements

Features currently planned for future releases:
- Bulk import from CSV/Excel
- Export to spreadsheet
- Advanced filtering (date ranges, credit score ranges)
- Custom fields for borrowers and lenders
- Document attachment support
- Activity history and audit log
- Email notifications for changes

---

## Appendix: Field Reference

### Borrower Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Type | Select | Yes | Individual or Entity |
| First Name | Text | Conditional | Required for individuals |
| Last Name | Text | Conditional | Required for individuals |
| Entity Name | Text | Conditional | Required for entities |
| Email | Email | Yes | Primary contact email |
| Phone | Text | No | Contact phone number |
| Address | Text Area | No | Physical/mailing address |
| Credit Score | Number | No | 300-850 FICO score |

### Lender Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Lender/institution name |
| Entity Type | Select | Yes | Individual, Company, Fund, or IRA |
| Contact Email | Email | Yes | Primary contact email |
| Contact Phone | Text | No | Contact phone number |
| Total Committed | Number | No | Total capital committed |
| Total Deployed | Number | No | Capital currently in loans |

---

**Last Updated:** January 2025
**Version:** 2.0
**Module:** Epic E2 - Borrower & Lender Management
