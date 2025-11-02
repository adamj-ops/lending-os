# Type Definition Conventions

## Database-Backed Enums

All database enum types should be defined in the Drizzle schema and exported using type inference.

### Pattern

1. **Define in Schema**: Create enum in `src/db/schema/*.ts` using `pgEnum()`
2. **Export TypeScript Type**: Use Drizzle's type inference pattern
3. **Export Constants**: Create enum-like constants for backward compatibility
4. **Re-export from Index**: Export from `src/db/schema/index.ts`

### Example

```typescript
// In src/db/schema/draws.ts

export const inspectionStatusEnum = pgEnum("inspection_status_enum", [
  "scheduled",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

// Export type using Drizzle's inference
export type InspectionStatus = (typeof inspectionStatusEnum.enumValues)[number];

// Export constants for enum-like syntax
export const InspectionStatusValues = {
  SCHEDULED: "scheduled" as InspectionStatus,
  IN_PROGRESS: "in_progress" as InspectionStatus,
  COMPLETED: "completed" as InspectionStatus,
  FAILED: "failed" as InspectionStatus,
  CANCELLED: "cancelled" as InspectionStatus,
} as const;
```

### Usage in Code

```typescript
// Import the constants
import { InspectionStatusValues as InspectionStatus } from '@/db/schema';

// Use enum-like syntax
await db.update(inspections)
  .set({ status: InspectionStatus.COMPLETED })
  .where(eq(inspections.id, inspectionId));
```

### Current Examples

- `InspectionStatus` in [src/db/schema/draws.ts](src/db/schema/draws.ts)
- `InspectionType` in [src/db/schema/draws.ts](src/db/schema/draws.ts)
- `DrawStatus` in [src/db/schema/draws.ts](src/db/schema/draws.ts)
- `PortalType` in [src/db/schema/portal-roles.ts](src/db/schema/portal-roles.ts)

## DO NOT

- ❌ Create duplicate enum definitions in `src/types/*`
- ❌ Use separate TypeScript enum declarations for DB-backed types
- ❌ Use string literals instead of the typed constants
- ❌ Import types from multiple sources

## Adding New Enum Values

When adding new values to a PostgreSQL enum:

1. **Update Schema**: Add new value to `pgEnum()` array in schema file
2. **Generate Migration**: Run `npm run db:generate`
3. **Review Migration**: Check generated SQL for ALTER TYPE statements
4. **Apply Migration**: Run `npm run db:migrate`
5. **Update Constants**: Add new value to the Values constant object
6. **TypeScript Types Auto-Update**: Type inference handles the rest

### Important Notes

- PostgreSQL enum values **CANNOT be removed** once added (only added)
- Values cannot be reordered
- To remove values, you must create a new enum and migrate data
- Always add values in a way that maintains backward compatibility

## Why This Pattern?

### Benefits

1. **Single Source of Truth**: Database schema drives TypeScript types
2. **Type Safety**: Compile-time checking ensures values match database
3. **Auto-Sync**: Types automatically update when schema changes
4. **Migration Safety**: Schema changes require explicit migrations
5. **No Duplication**: Eliminates conflicting type definitions

### Problems This Solves

- Type mismatches between database and application code
- Duplicate enum definitions getting out of sync
- Runtime errors from using invalid enum values
- Confusion about which type definition is canonical

## Migration History

### Sprint 5: Inspection Type Consolidation

**Date**: 2025-10-31

**Problem**: Multiple conflicting definitions of `InspectionStatus` and `InspectionType` across 4 locations:
- `src/types/inspection.ts` (6 values)
- `src/types/draw.ts` (4 values)
- `src/app/(main)/(ops)/loans/draws/schema.ts` (Zod schema)
- `src/db/schema/draws.ts` (database enums - 4 values)

**Solution**:
1. Added missing values to database enums (`cancelled`, `compliance`, `other`)
2. Deleted duplicate enums from `src/types/inspection.ts` and `src/types/draw.ts`
3. Updated those files to import and re-export from schema
4. Created `*Values` constants for backward compatibility
5. Updated imports in service files and components

**Files Modified**: 15+ files across services, components, and API routes
