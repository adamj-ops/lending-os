# API Endpoints Documentation - v1

## Overview

This document describes the REST API endpoints available in Sprint 1 of Lending OS.

**Base URL:** `/api/v1`

**Authentication:** All endpoints require authentication via BetterAuth session cookie.

---

## Authentication Endpoints

Handled by BetterAuth at `/api/auth/*`

### POST /api/auth/sign-up

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "...",
    "expiresAt": "2024-12-01T00:00:00Z"
  }
}
```

---

### POST /api/auth/sign-in

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "...",
    "expiresAt": "2024-12-01T00:00:00Z"
  }
}
```

---

### POST /api/auth/sign-out

End the current session.

**Response (200):**
```json
{
  "success": true
}
```

---

## Loan Endpoints

### GET /api/v1/loans

Get all loans for the authenticated user's organization.

**Headers:**
```
Cookie: better-auth.session_token=...
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "borrowerId": null,
      "lenderId": null,
      "propertyAddress": "123 Main St, Denver, CO 80202",
      "loanAmount": "450000.00",
      "interestRate": "12.50",
      "termMonths": 12,
      "status": "active",
      "fundedDate": "2024-01-15T00:00:00Z",
      "maturityDate": "2025-01-15T00:00:00Z",
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-10T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### POST /api/v1/loans

Create a new loan.

**Headers:**
```
Content-Type: application/json
Cookie: better-auth.session_token=...
```

**Request Body:**
```json
{
  "propertyAddress": "123 Main St, Denver, CO 80202",
  "loanAmount": 450000,
  "interestRate": 12.5,
  "termMonths": 12,
  "status": "draft",
  "fundedDate": "2024-01-15T00:00:00Z",
  "maturityDate": "2025-01-15T00:00:00Z"
}
```

**Required Fields:**
- `propertyAddress` (string)
- `loanAmount` (number or string)
- `interestRate` (number or string)
- `termMonths` (number)

**Optional Fields:**
- `borrowerId` (string, UUID)
- `lenderId` (string, UUID)
- `status` (enum: draft, approved, funded, active, paid_off)
- `fundedDate` (ISO 8601 date string)
- `maturityDate` (ISO 8601 date string)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "propertyAddress": "123 Main St, Denver, CO 80202",
    "loanAmount": "450000.00",
    "interestRate": "12.50",
    "termMonths": 12,
    "status": "draft",
    "fundedDate": "2024-01-15T00:00:00Z",
    "maturityDate": "2025-01-15T00:00:00Z",
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### GET /api/v1/loans/:id

Get a single loan by ID.

**Headers:**
```
Cookie: better-auth.session_token=...
```

**URL Parameters:**
- `id` (string, UUID): Loan ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "propertyAddress": "123 Main St, Denver, CO 80202",
    "loanAmount": "450000.00",
    "interestRate": "12.50",
    "termMonths": 12,
    "status": "active",
    "fundedDate": "2024-01-15T00:00:00Z",
    "maturityDate": "2025-01-15T00:00:00Z",
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Loan not found
- `500 Internal Server Error`: Server error

---

### PATCH /api/v1/loans/:id

Update a loan.

**Headers:**
```
Content-Type: application/json
Cookie: better-auth.session_token=...
```

**URL Parameters:**
- `id` (string, UUID): Loan ID

**Request Body:**
```json
{
  "status": "active",
  "fundedDate": "2024-01-15T00:00:00Z"
}
```

**All fields are optional:**
- `borrowerId` (string, UUID or null)
- `lenderId` (string, UUID or null)
- `propertyAddress` (string)
- `loanAmount` (number or string)
- `interestRate` (number or string)
- `termMonths` (number)
- `status` (enum)
- `fundedDate` (ISO 8601 date string or null)
- `maturityDate` (ISO 8601 date string or null)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "propertyAddress": "123 Main St, Denver, CO 80202",
    "loanAmount": "450000.00",
    "interestRate": "12.50",
    "termMonths": 12,
    "status": "active",
    "fundedDate": "2024-01-15T00:00:00Z",
    "maturityDate": "2025-01-15T00:00:00Z",
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-10T14:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Loan not found
- `500 Internal Server Error`: Server error

---

### DELETE /api/v1/loans/:id

Delete a loan.

**Headers:**
```
Cookie: better-auth.session_token=...
```

**URL Parameters:**
- `id` (string, UUID): Loan ID

**Response (200):**
```json
{
  "success": true,
  "message": "Loan deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Loan not found
- `500 Internal Server Error`: Server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

**Sprint 1:** No rate limiting implemented

**Future:** Rate limiting will be added in Sprint 3

---

## API Versioning

The API is versioned via URL path (`/api/v1/...`).

Breaking changes will result in a new version (`/api/v2/...`).

---

## Testing with cURL

### Get Loans
```bash
curl -X GET http://localhost:3000/api/v1/loans \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

### Create Loan
```bash
curl -X POST http://localhost:3000/api/v1/loans \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{
    "propertyAddress": "123 Test St",
    "loanAmount": 500000,
    "interestRate": 12,
    "termMonths": 12
  }'
```

### Update Loan
```bash
curl -X PATCH http://localhost:3000/api/v1/loans/LOAN_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{
    "status": "active"
  }'
```

### Delete Loan
```bash
curl -X DELETE http://localhost:3000/api/v1/loans/LOAN_ID \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

---

## Future Endpoints (Sprint 2+)

- `GET /api/v1/borrowers` - List borrowers
- `POST /api/v1/borrowers` - Create borrower
- `GET /api/v1/lenders` - List lenders
- `POST /api/v1/lenders` - Create lender
- `GET /api/v1/properties` - List properties
- `POST /api/v1/properties` - Create property
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Record payment
- `GET /api/v1/draws` - List draw requests
- `POST /api/v1/draws` - Create draw request

