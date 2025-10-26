# Epic E2: Borrower & Lender Management API Documentation

## Overview

This document provides comprehensive documentation for the Borrower and Lender Management Module API endpoints, including request/response schemas, validation rules, and usage examples.

## Base URL

All API endpoints are prefixed with `/api/v1`

---

## Borrower Endpoints

### List All Borrowers

**Endpoint:** `GET /api/v1/borrowers`

**Description:** Retrieves all borrowers for the authenticated user's organization.

**Authentication:** Required (iron-session)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "type": "individual" | "entity",
      "firstName": "string | null",
      "lastName": "string | null",
      "name": "string | null",
      "email": "string",
      "phone": "string | null",
      "address": "string | null",
      "creditScore": "number | null",
      "companyName": "string | null",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

---

### Get Single Borrower

**Endpoint:** `GET /api/v1/borrowers/:id`

**Description:** Retrieves a single borrower by ID.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Borrower UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "type": "individual",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St, City, State 12345",
    "creditScore": 720,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `404`: Borrower not found
- `401`: Unauthorized

---

### Create Borrower

**Endpoint:** `POST /api/v1/borrowers`

**Description:** Creates a new borrower.

**Authentication:** Required

**Request Body:**

```json
{
  "type": "individual" | "entity",
  "firstName": "string (required if type=individual)",
  "lastName": "string (required if type=individual)",
  "name": "string (required if type=entity)",
  "email": "string (required, must be valid email)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "creditScore": "number (optional, 300-850)"
}
```

**Validation Rules:**
- `type`: Must be "individual" or "entity"
- `email`: Must be a valid email address
- `firstName` + `lastName`: Required when `type="individual"`
- `name`: Required when `type="entity"`
- `creditScore`: If provided, must be between 300 and 850

**Example Request:**

```json
{
  "type": "individual",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "(555) 987-6543",
  "creditScore": 750
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "newly-generated-uuid",
    "organizationId": "org-uuid",
    "type": "individual",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "(555) 987-6543",
    "creditScore": 750,
    "createdAt": "2025-01-15T11:00:00Z",
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": ["firstName"],
      "message": "Individual borrowers require first and last name"
    }
  ]
}
```

---

### Update Borrower

**Endpoint:** `PUT /api/v1/borrowers/:id`

**Description:** Updates an existing borrower.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Borrower UUID

**Request Body:** Same as Create Borrower

**Response:** Same as Create Borrower

**Error Responses:**
- `404`: Borrower not found
- `400`: Validation failed
- `401`: Unauthorized

---

### Delete Borrower

**Endpoint:** `DELETE /api/v1/borrowers/:id`

**Description:** Deletes a borrower and all associated loan relationships.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Borrower UUID

**Success Response:**

```json
{
  "success": true
}
```

**Error Responses:**
- `404`: Borrower not found
- `401`: Unauthorized

**Note:** This operation cascades and removes all borrower-loan associations.

---

### Get Borrower Loans

**Endpoint:** `GET /api/v1/borrowers/:id/loans`

**Description:** Retrieves all loans associated with a borrower.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Borrower UUID

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "loan-uuid",
      "propertyAddress": "456 Oak Ave",
      "principal": "250000.00",
      "status": "active",
      "createdAt": "2025-01-10T09:00:00Z"
    }
  ]
}
```

---

### Sync Borrower Loans

**Endpoint:** `PUT /api/v1/borrowers/:id/loans`

**Description:** Replaces all loan associations for a borrower. This is a "sync" operation that removes existing associations and creates new ones.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Borrower UUID

**Request Body:**

```json
{
  "loanIds": ["loan-uuid-1", "loan-uuid-2", "loan-uuid-3"]
}
```

**Validation:**
- `loanIds`: Must be an array of valid UUIDs

**Success Response:**

```json
{
  "success": true
}
```

**Error Responses:**
- `400`: Invalid loan IDs or validation failed
- `404`: Borrower not found

---

## Lender Endpoints

### List All Lenders

**Endpoint:** `GET /api/v1/lenders`

**Description:** Retrieves all lenders for the authenticated user's organization.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "ABC Capital Partners",
      "entityType": "company" | "individual" | "fund" | "ira",
      "contactEmail": "contact@abccapital.com",
      "contactPhone": "(555) 111-2222",
      "totalCommitted": "5000000.00",
      "totalDeployed": "3250000.00",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

---

### Get Single Lender

**Endpoint:** `GET /api/v1/lenders/:id`

**Description:** Retrieves a single lender by ID.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Lender UUID

**Response:** Similar to List All Lenders, but returns single object in `data`

---

### Create Lender

**Endpoint:** `POST /api/v1/lenders`

**Description:** Creates a new lender.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "string (required)",
  "entityType": "individual" | "company" | "fund" | "ira" (required)",
  "contactEmail": "string (required, valid email)",
  "contactPhone": "string (optional)",
  "totalCommitted": "string (optional, numeric)",
  "totalDeployed": "string (optional, numeric)"
}
```

**Validation Rules:**
- `name`: Minimum 1 character
- `entityType`: Must be one of: "individual", "company", "fund", "ira"
- `contactEmail`: Must be a valid email address
- `totalCommitted`: If provided, must be numeric (can be decimal)
- `totalDeployed`: If provided, must be numeric and ≤ totalCommitted

**Example Request:**

```json
{
  "name": "XYZ Investment Fund",
  "entityType": "fund",
  "contactEmail": "investments@xyzfund.com",
  "contactPhone": "(555) 333-4444",
  "totalCommitted": "10000000.00",
  "totalDeployed": "6500000.00"
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "newly-generated-uuid",
    "organizationId": "org-uuid",
    "name": "XYZ Investment Fund",
    "entityType": "fund",
    "contactEmail": "investments@xyzfund.com",
    "contactPhone": "(555) 333-4444",
    "totalCommitted": "10000000.00",
    "totalDeployed": "6500000.00",
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  }
}
```

---

### Update Lender

**Endpoint:** `PUT /api/v1/lenders/:id`

**Description:** Updates an existing lender.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Lender UUID

**Request Body:** Same as Create Lender

**Response:** Same as Create Lender

---

### Delete Lender

**Endpoint:** `DELETE /api/v1/lenders/:id`

**Description:** Deletes a lender and all associated loan relationships.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Lender UUID

**Success Response:**

```json
{
  "success": true
}
```

**Note:** This operation cascades and removes all lender-loan associations.

---

### Get Lender Loans

**Endpoint:** `GET /api/v1/lenders/:id/loans`

**Description:** Retrieves all loans funded by a lender.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Lender UUID

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "loan-uuid",
      "propertyAddress": "789 Pine St",
      "principal": "500000.00",
      "status": "active",
      "createdAt": "2025-01-12T14:00:00Z"
    }
  ]
}
```

---

### Sync Lender Loans

**Endpoint:** `PUT /api/v1/lenders/:id/loans`

**Description:** Replaces all loan associations for a lender.

**Authentication:** Required

**URL Parameters:**
- `id` (required): Lender UUID

**Request Body:**

```json
{
  "loanIds": ["loan-uuid-1", "loan-uuid-2"]
}
```

**Success Response:**

```json
{
  "success": true
}
```

---

## Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (returned for POST operations) |
| 400 | Bad Request - Validation failed or invalid data |
| 401 | Unauthorized - User not authenticated |
| 403 | Forbidden - User doesn't have access to resource |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Authentication

All endpoints require authentication via iron-session. The session must contain:

```typescript
{
  userId: string;
  organizationId: string;
  email: string;
  role: "admin" | "user";
}
```

**Authorization Rules:**
- Users can only access resources within their organization
- All borrowers and lenders are scoped to `organizationId`
- Attempting to access resources from another organization returns `404` (not `403` to avoid information leakage)

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use:

- Recommended: 100 requests per minute per user
- Use middleware like `express-rate-limit` or Next.js Edge middleware

---

## Database Schema

### Borrowers Table

```typescript
{
  id: uuid (primary key),
  organizationId: uuid (foreign key, indexed),
  type: "individual" | "entity",
  firstName: string | null,
  lastName: string | null,
  name: string | null,
  email: string (indexed),
  phone: string | null,
  address: string | null,
  creditScore: integer | null,
  companyName: string | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Lenders Table

```typescript
{
  id: uuid (primary key),
  organizationId: uuid (foreign key, indexed),
  name: string,
  entityType: "individual" | "company" | "fund" | "ira",
  contactEmail: string (indexed),
  contactPhone: string | null,
  totalCommitted: numeric(12, 2),
  totalDeployed: numeric(12, 2),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Relationship Tables

```typescript
// Borrower-Loan Many-to-Many
borrower_loans {
  borrowerId: uuid (foreign key, cascade delete),
  loanId: uuid (foreign key, cascade delete),
  createdAt: timestamp,
  PRIMARY KEY (borrowerId, loanId)
}

// Lender-Loan Many-to-Many
lender_loans {
  lenderId: uuid (foreign key, cascade delete),
  loanId: uuid (foreign key, cascade delete),
  createdAt: timestamp,
  PRIMARY KEY (lenderId, loanId)
}
```

---

## Best Practices

### Creating Borrowers

1. Always validate email addresses on both client and server
2. For individual borrowers, require both first and last name
3. For entity borrowers, use the `name` field for company/organization name
4. Credit scores are optional but should be validated if provided

### Managing Loan Associations

1. Use the `PUT /borrowers/:id/loans` endpoint to sync all associations at once
2. This is more efficient than individual add/remove operations
3. The sync operation is transactional - either all changes succeed or all fail
4. Deleting a borrower/lender automatically removes all loan associations (cascade)

### Search and Filtering

Use the frontend search and filter features:
- Search by name or email (client-side filtering)
- Filter by entity/borrower type
- Sort by any column
- URL parameters persist filter state (`?search=john&type=individual`)

---

## Future Enhancements

Potential improvements for future iterations:

1. **Pagination**: Add `?page=1&limit=20` query parameters
2. **Server-side search**: Move search logic to API for better performance with large datasets
3. **Bulk operations**: Support creating/updating multiple borrowers at once
4. **Export functionality**: Add CSV/Excel export endpoints
5. **Audit logging**: Track all changes to borrower/lender records
6. **Soft deletes**: Add `deletedAt` timestamp instead of hard deletes
7. **Advanced filtering**: Support complex queries (`?creditScore[gte]=700`)
8. **Webhooks**: Notify external systems when borrowers/lenders change

---

## Testing

### Manual Testing Checklist

- [ ] Create individual borrower with all fields
- [ ] Create entity borrower with all fields
- [ ] Validate email format
- [ ] Validate credit score range (300-850)
- [ ] Validate required fields for each borrower type
- [ ] Update borrower information
- [ ] Delete borrower (verify cascade delete of associations)
- [ ] Create lender with each entity type
- [ ] Update lender capital amounts
- [ ] Associate loans with borrower
- [ ] Associate loans with lender
- [ ] Remove loan associations
- [ ] Search by name
- [ ] Search by email
- [ ] Filter by type
- [ ] Sort by each column
- [ ] Verify URL parameter persistence

### Integration Test Examples

```typescript
// Example test for creating a borrower
describe("POST /api/v1/borrowers", () => {
  it("should create an individual borrower", async () => {
    const response = await fetch("/api/v1/borrowers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "individual",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        creditScore: 720
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.firstName).toBe("John");
  });

  it("should fail validation for individual without last name", async () => {
    const response = await fetch("/api/v1/borrowers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "individual",
        firstName: "John",
        email: "john@example.com"
      })
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
```

---

## Support

For questions or issues, please contact the development team or refer to the main project documentation.
