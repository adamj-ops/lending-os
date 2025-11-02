# Fund Service Org-Scoping Hardening - Follow-On Work

## Completed ✅
- `FundService.getFundDistributions(fundId, organizationId)` - Added org-scoped access guard with innerJoin

## Pending Security Vulnerabilities 🚨

The following FundService methods have the same cross-organization access vulnerability and need the same treatment:

### 1. `getFundCommitments(fundId)` 
**Location:** `src/services/fund.service.ts:347`
**Current vulnerability:** Only filters by `fundId`, no organization check
**Fix needed:** Add `organizationId` parameter and innerJoin with `funds` table

### 2. `getFundCalls(fundId)`
**Location:** `src/services/fund.service.ts:492` 
**Current vulnerability:** Only filters by `fundId`, no organization check
**Fix needed:** Add `organizationId` parameter and innerJoin with `funds` table

### 3. `getFundAllocations(fundId)`
**Location:** `src/services/fund.service.ts:625`
**Current vulnerability:** Only filters by `fundId`, no organization check  
**Fix needed:** Add `organizationId` parameter and innerJoin with `funds` table

## Recommended Implementation Pattern

For each method, follow the same pattern used for `getFundDistributions`:

1. **Service Layer:**
   ```typescript
   static async getFundCommitments(
     fundId: string,
     organizationId: string
   ): Promise<FundCommitmentWithLender[]> {
     const result = await db
       .select({ /* existing select fields */ })
       .from(fundCommitments)
       .innerJoin(funds, eq(fundCommitments.fundId, funds.id))
       .where(
         and(
           eq(fundCommitments.fundId, fundId),
           eq(funds.organizationId, organizationId)
         )
       )
       .orderBy(/* existing orderBy */);
     
     return result as FundCommitmentWithLender[];
   }
   ```

2. **API Layer:** Update corresponding route handlers to:
   - Pass `session.organizationId` to service method
   - Add explicit fund existence check with `getFundById`
   - Return proper `{ code: 404, message: "Fund not found", traceId }` for unauthorized access

3. **Tests:** Create comprehensive test suites for each method:
   - `src/services/__tests__/fund-commitments-access.test.ts`
   - `src/services/__tests__/fund-calls-access.test.ts` 
   - `src/services/__tests__/fund-allocations-access.test.ts`
   - `src/app/api/v1/funds/[fundId]/commitments/__tests__/route.test.ts`
   - `src/app/api/v1/funds/[fundId]/calls/__tests__/route.test.ts`
   - `src/app/api/v1/funds/[fundId]/allocations/__tests__/route.test.ts`

## Priority Assessment

**High Priority:** All three methods expose financial data and should be fixed in the next sprint.

**Estimated Effort:** 
- Service layer changes: ~2 hours each (6 hours total)
- API layer changes: ~1 hour each (3 hours total)  
- Test creation: ~2 hours each (6 hours total)
- **Total: ~15 hours**

## Security Impact

**Risk:** Cross-organization data leakage for:
- Fund commitments (investor data)
- Fund calls (capital call data) 
- Fund allocations (loan allocation data)

**Business Impact:** High - financial data exposure between organizations

## Tracking

- [ ] Create JIRA epic: "Fund Service Org-Scoping Hardening Phase 2"
- [ ] Create individual tickets for each method
- [ ] Assign to security-focused developer
- [ ] Schedule for next sprint

---
*Created: 2025-01-26*
*Related to: Fund Distribution Hardening implementation*
