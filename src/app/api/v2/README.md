# API v2 Documentation

**Version**: 2.0.0
**Base URL**: `/api/v2`
**Status**: 🚧 In Development

---

## Overview

API v2 introduces a domain-centric, event-driven RESTful API for LendingOS. It replaces the route-centric v1 API with a more structured, type-safe approach.

### Key Features

- ✅ **Event-Driven**: All mutations publish domain events
- ✅ **Type-Safe**: Full TypeScript with Zod validation
- ✅ **RESTful**: Consistent REST patterns
- ✅ **Versioned**: Backwards compatible with v1
- ✅ **Documented**: OpenAPI/Swagger compatible
- ✅ **Error Handling**: Standardized error responses
- ✅ **Pagination**: Built-in pagination support
- ✅ **Filtering**: Query-based filtering

---

## Authentication

All API v2 endpoints require authentication.

### Headers

```http
Authorization: Bearer <token>
x-user-id: <user-id>
x-organization-id: <organization-id>
```

### Example

```bash
curl -H "Authorization: Bearer <token>" \
     -H "x-user-id: <user-id>" \
     -H "x-organization-id: <org-id>" \
     https://api.example.com/api/v2/loans
```

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [ ... ],
    "timestamp": "2025-10-26T21:00:00Z",
    "path": "/api/v2/loans"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Loans

#### List Loans

```http
GET /api/v2/loans
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `pageSize` (number) - Items per page (default: 20, max: 100)
- `status` (string) - Filter by status
- `loanCategory` (string) - Filter by category
- `minPrincipal` (number) - Minimum principal
- `maxPrincipal` (number) - Maximum principal

**Example:**
```bash
GET /api/v2/loans?status=funded&page=1&pageSize=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "principal": "100000.00",
      "rate": "7.500",
      "termMonths": 12,
      "status": "funded",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

---

#### Create Loan

```http
POST /api/v2/loans
```

**Request Body:**
```json
{
  "borrowerId": "uuid",
  "lenderId": "uuid",
  "principal": 100000,
  "rate": 7.5,
  "termMonths": 12,
  "paymentType": "amortized",
  "paymentFrequency": "monthly"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "principal": "100000.00",
    "rate": "7.500",
    ...
  },
  "meta": {
    "message": "Loan created successfully"
  }
}
```

**Events Published:**
- `Loan.Created`

---

#### Get Loan

```http
GET /api/v2/loans/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "principal": "100000.00",
    "borrower": { ... },
    "lender": { ... },
    "property": { ... },
    ...
  }
}
```

---

#### Update Loan

```http
PATCH /api/v2/loans/:id
```

**Request Body:** (all fields optional)
```json
{
  "status": "funded",
  "fundedDate": "2025-10-26"
}
```

**Events Published:**
- `Loan.StatusChanged` (if status changed)
- `Loan.Funded` (if status changed to funded)

---

### Payments

#### List Payments

```http
GET /api/v2/loans/:id/payments
```

**Query Parameters:**
- `page`, `pageSize` - Pagination
- `status` - Filter by status
- `paymentMethod` - Filter by method
- `paymentDateFrom`, `paymentDateTo` - Date range

---

#### Record Payment

```http
POST /api/v2/loans/:id/payments
```

**Request Body:**
```json
{
  "loanId": "uuid",
  "paymentType": "combined",
  "amount": 8607.02,
  "principalAmount": 7857.02,
  "interestAmount": 750.00,
  "feeAmount": 0,
  "paymentMethod": "ach",
  "paymentDate": "2025-10-26",
  "transactionReference": "TXN-12345"
}
```

**Events Published:**
- `Payment.Processed`

---

### Draws

#### List Draws

```http
GET /api/v2/loans/:id/draws
```

**Query Parameters:**
- `page`, `pageSize` - Pagination
- `status` - Filter by status
- `drawType` - Filter by type

---

#### Request Draw

```http
POST /api/v2/loans/:id/draws
```

**Request Body:**
```json
{
  "loanId": "uuid",
  "drawType": "progress",
  "amount": 50000,
  "workDescription": "Foundation and framing complete",
  "budgetLineItems": [
    {
      "description": "Foundation",
      "budgetedAmount": 30000,
      "requestedAmount": 30000
    },
    {
      "description": "Framing",
      "budgetedAmount": 20000,
      "requestedAmount": 20000
    }
  ],
  "inspectionRequired": true,
  "percentComplete": 35
}
```

**Events Published:**
- `Draw.Requested`

---

## Pagination

All list endpoints support pagination:

```http
GET /api/v2/loans?page=2&pageSize=50
```

**Response includes:**
```json
{
  "data": [ ... ],
  "meta": {
    "page": 2,
    "pageSize": 50,
    "total": 150
  }
}
```

---

## Filtering

Use query parameters to filter results:

```http
GET /api/v2/loans?status=funded&minPrincipal=50000&maxPrincipal=500000
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per user
- **Burst**: 20 requests per second

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635264000
```

---

## Validation

All requests are validated using Zod schemas. Validation errors return detailed information:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": ["principal"],
        "message": "Principal must be greater than 0"
      }
    ]
  }
}
```

---

## Events

API v2 publishes domain events for all mutations. See [Event Documentation](../../../.cursor/docs/architecture/event-driven-system.md) for details.

### Event Types

| Event | Trigger | Description |
|-------|---------|-------------|
| `Loan.Created` | POST /loans | New loan created |
| `Loan.Funded` | PATCH /loans/:id (status=funded) | Loan funded |
| `Loan.StatusChanged` | PATCH /loans/:id | Loan status changed |
| `Payment.Processed` | POST /loans/:id/payments | Payment recorded |
| `Draw.Requested` | POST /loans/:id/draws | Draw requested |

---

## Migration from v1

### Breaking Changes

1. Response format changed (wrapped in `{ data, meta }`)
2. Error format standardized
3. Authentication headers required
4. Field names may differ (camelCase vs snake_case)

### Compatibility

- v1 endpoints remain available at `/api/v1/*`
- Both versions can be used simultaneously
- Gradual migration recommended

---

## Development

### Adding New Endpoints

1. Create route file in `/api/v2/`
2. Add Zod validation schema
3. Use `withAPIMiddleware` wrapper
4. Publish domain events for mutations
5. Update this documentation

### Testing

```bash
# Run API tests
npm run test:api

# Test specific endpoint
npm run test:api -- --grep "loans"
```

---

## Support

- **Issues**: GitHub Issues
- **Slack**: #api-v2
- **Documentation**: [Full Docs](../../../.cursor/docs/)

---

**Last Updated**: October 26, 2025
**Status**: 🚧 Alpha - Subject to change
