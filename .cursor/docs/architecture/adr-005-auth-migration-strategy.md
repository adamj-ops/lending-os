# ADR-005: Auth Migration Strategy

> **Note:** This ADR is part of the unified auth series. Future ADRs should continue numbering in `.cursor/docs/architecture/`.

## Status
Accepted

## Context

Lending OS needs to migrate from the current hardcoded `organizationId` patterns to the unified auth system with BetterAuth organization plugin and portal-based access control. This migration involves:

- **Session Management**: Moving from simple sessions to organization-aware sessions
- **Data Scoping**: Updating all services to use session-based organization context
- **API Routes**: Migrating from hardcoded org checks to `requireOrganization()`
- **Frontend Components**: Updating to use session organization context
- **Database Schema**: Adding BetterAuth organization tables and portal access
- **User Experience**: Handling organization switching and portal access

The migration must be done safely without breaking existing functionality while maintaining backward compatibility during the transition.

## Decision

Implement a phased migration strategy with backward compatibility, deprecation warnings, and user re-authentication requirements.

### Migration Phases

**Phase 1: Foundation (DONE)**
- ✅ Enable BetterAuth organization plugin
- ✅ Update session helpers to include organization context
- ✅ Create portal access table and types

**Phase 2: Service Migration (IN PROGRESS)**
- 🔄 Migrate services to use `session.organizationId`
- 🔄 Update API routes to use `requireOrganization()`
- 🔄 Add portal access checks to routes

**Phase 3: Frontend Migration (TODO)**
- ⏳ Update frontend components to use session context
- ⏳ Add organization switching UI
- ⏳ Implement portal routing logic

**Phase 4: Deprecation (TODO)**
- ⏳ Add deprecation warnings for old patterns
- ⏳ Update documentation and examples
- ⏳ Communicate changes to developers

**Phase 5: Cleanup (Phase 2+)**
- ⏳ Remove backward compatibility code
- ⏳ Remove deprecated helpers
- ⏳ Clean up hardcoded organizationId patterns

### Session Migration Strategy

**Cookie Invalidation Required**: Users must re-authenticate after migration to get new session cookies with organization context.

**Migration Process**:
1. Deploy new auth system with backward compatibility
2. Invalidate all existing session cookies
3. Users re-login and get new organization-aware sessions
4. Remove backward compatibility after transition period

### Deprecated APIs

**Deprecated Helpers** (targeted for removal in Phase 2+):

```typescript
// src/lib/auth-server.ts lines 178-181
/**
 * @deprecated Use getSession() instead. This function is kept for backward compatibility.
 * Will be removed in Phase 2.
 */
export async function getSessionFromRequest(): Promise<SessionData> {
  console.warn("getSessionFromRequest() is deprecated. Use getSession() or requireOrganization() instead.");
  return await requireOrganization();
}
```

**Deprecated Patterns**:
- Hardcoded `organizationId` in services
- Manual organization context passing
- Old middleware patterns without org context
- Direct database queries without organization scoping

### Backward Compatibility Approach

**Dual Support Period**: During migration, support both old and new patterns:

```typescript
// Example: Service with backward compatibility
export async function getLoansForOrganization(organizationId?: string) {
  // New pattern: Get from session
  if (!organizationId) {
    const { organizationId: sessionOrgId } = await requireOrganization();
    organizationId = sessionOrgId;
  }
  
  // Legacy pattern: Use provided organizationId
  return await db.query.loans.findMany({
    where: eq(loans.organizationId, organizationId)
  });
}
```

**Deprecation Warnings**: Add console warnings for old patterns:

```typescript
// Example: Deprecated service method
export async function getLoansLegacy(organizationId: string) {
  console.warn("getLoansLegacy() is deprecated. Use getLoansForOrganization() without parameters.");
  return await getLoansForOrganization(organizationId);
}
```

## Consequences

### Positive

- **Safe Migration**: Phased approach minimizes risk of breaking changes
- **Backward Compatibility**: Existing code continues to work during transition
- **Clear Deprecation Path**: Developers know what to update and when
- **User Communication**: Clear timeline for user re-authentication
- **Rollback Capability**: Can revert changes if issues arise
- **Documentation**: Clear migration guide for developers

### Negative

- **Temporary Complexity**: Codebase has both old and new patterns during migration
- **User Disruption**: Users must re-login after migration
- **Extended Timeline**: Migration takes longer due to compatibility requirements
- **Technical Debt**: Deprecated code remains in codebase longer
- **Testing Overhead**: Must test both old and new patterns

### Implementation Notes

#### Migration Checklist

**Services Using Hardcoded organizationId**:
- [ ] `src/services/loan.service.ts` - Update to use session context
- [ ] `src/services/borrower.service.ts` - Update to use session context
- [ ] `src/services/lender.service.ts` - Update to use session context
- [ ] `src/services/property.service.ts` - Update to use session context
- [ ] `src/services/payment.service.ts` - Update to use session context

**API Routes Needing `requireOrganization()`**:
- [ ] `src/app/api/v1/loans/route.ts` - Add organization requirement
- [ ] `src/app/api/v1/borrowers/route.ts` - Add organization requirement
- [ ] `src/app/api/v1/lenders/route.ts` - Add organization requirement
- [ ] `src/app/api/v1/properties/route.ts` - Add organization requirement
- [ ] `src/app/api/v1/payments/route.ts` - Add organization requirement

**Frontend Components Using Session Context**:
- [ ] Dashboard components - Update to use session.organizationId
- [ ] Data tables - Update to use session context
- [ ] Forms - Update to use session context
- [ ] Navigation - Add organization switching

**Middleware Portal Routing Logic**:
- [ ] `src/middleware.ts` - Add portal access checking
- [ ] Portal route protection - Implement portal-specific redirects
- [ ] Organization switching - Handle organization context changes

#### Cookie Invalidation Script

```typescript
// Migration script: Invalidate all sessions
export async function invalidateAllSessions() {
  // Clear all session cookies
  await db.delete(sessions);
  
  // Log migration event
  console.log("All sessions invalidated for auth migration");
  
  // Send notification to users
  await sendMigrationNotification();
}
```

#### User Re-Login Communication

**Communication Plan**:
1. **Pre-Migration**: Email users about upcoming re-login requirement
2. **Migration Day**: Display banner about re-login requirement
3. **Post-Migration**: Confirm successful migration and new features

**Notification Content**:
```
Subject: Lending OS Update - Re-login Required

We're upgrading Lending OS with new multi-organization support and portal access features.

To complete the upgrade, you'll need to log in again on [DATE]. This is a one-time requirement.

New features after re-login:
- Switch between multiple organizations
- Access different portals (Operations, Investor, Borrower)
- Enhanced security and role-based access

Thank you for your patience during this upgrade.
```

#### Migration Testing Strategy

**Test Coverage**:
- [ ] Old patterns still work during migration
- [ ] New patterns work correctly
- [ ] Session invalidation works properly
- [ ] User re-login flow works
- [ ] Organization switching works
- [ ] Portal access checking works
- [ ] Role-based access works

**Rollback Plan**:
- [ ] Database migration rollback scripts
- [ ] Code rollback to previous version
- [ ] Session cookie restoration
- [ ] User communication about rollback

#### Phase 2+ Cleanup Tasks

**Code Removal**:
- [ ] Remove `getSessionFromRequest()` function
- [ ] Remove hardcoded organizationId patterns
- [ ] Remove backward compatibility code
- [ ] Remove deprecation warnings
- [ ] Clean up old middleware patterns

**Database Cleanup**:
- [ ] Remove unused organization columns
- [ ] Clean up old session data
- [ ] Optimize portal access queries
- [ ] Update database indexes

**Documentation Updates**:
- [ ] Update API documentation
- [ ] Update developer guides
- [ ] Update user documentation
- [ ] Archive migration documentation

## Related ADRs

- [ADR-001: Multi-Organization Model](./adr-001-multi-organization-model.md) - Target architecture for migration
- [ADR-002: Session Management](./adr-002-session-management.md) - New session system being migrated to
- [ADR-003: Portal Access Model](./adr-003-portal-access-model.md) - Portal system being migrated to
- [ADR-004: RBAC Implementation](./adr-004-role-based-access-control.md) - Role system being migrated to

## References

- [src/lib/auth-server.ts](../src/lib/auth-server.ts) - Deprecated helpers and new patterns
- [src/lib/auth.ts](../src/lib/auth.ts) - BetterAuth configuration
- [src/middleware.ts](../src/middleware.ts) - Route protection patterns
- [Migration Scripts](../scripts/) - Database migration and cleanup scripts
