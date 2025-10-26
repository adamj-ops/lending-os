# API Versioning Strategy

> **Status**: Active (v1) / Planned (v2)

---

## Overview

LendingOS uses **URL-based versioning** to maintain backward compatibility while evolving the API architecture.

---

## Versioning Scheme

### Current: v1 (Route-Centric)

**Base Path**: `/api/v1`

**Structure**: Resource-based organization

```
/api/v1/
├── loans/
├── payments/
├── draws/
├── borrowers/
└── lenders/
```

### Future: v2 (Domain-Centric)

**Base Path**: `/api/v2`

**Structure**: Domain-based organization

```
/api/v2/
├── loans/
│   ├── applications/
│   ├── payments/
│   └── draws/
├── borrowers/
└── funds/
```

---

## Version Lifecycle

| Version | Status | Introduced | Deprecated | Sunset |
|---------|--------|------------|------------|--------|
| v1 | Active | Sprint 1 | TBD (Sprint 9) | +6 months |
| v2 | Planned | Sprint 4 | - | - |

---

## Migration Timeline

1. **Sprint 4**: v2 API introduced, v1 continues unchanged
2. **Sprint 6**: All internal systems migrated to v2
3. **Sprint 9**: v1 deprecated, sunset date announced (6 months)
4. **6 months later**: v1 removed

---

## Backward Compatibility

v1 endpoints will remain functional during transition. No breaking changes to v1.

---

## Related Documentation

- [Migration Guide](../architecture/migration-v1-to-v2.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
