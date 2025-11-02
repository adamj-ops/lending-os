# Dev User Creation Note

## Issue

The `create-dev-user.ts` script cannot automatically create users in Clerk because the Clerk instance has specific requirements configured in the dashboard (phone number validation, etc.).

## Error

```
ClerkAPIError: Phone number must be a valid phone number according to E.164 international standard.
```

## Solutions

### Option 1: Use UI Registration (Recommended)
Create dev users through the registration UI:
1. Visit http://localhost:3000/auth/v2/register
2. Fill in the form
3. Complete email verification if required
4. Create organization

### Option 2: Adjust Clerk Dashboard Settings
1. Go to Clerk Dashboard → User & Authentication → Email, Phone, Username
2. Disable phone number requirement
3. Set email + password as only required fields
4. Then run: `npx tsx scripts/create-dev-user.ts`

### Option 3: Use Clerk Dashboard
1. Go to Clerk Dashboard → Users
2. Click "Create User"
3. Add email, name, password manually
4. User will be auto-synced to app_users via webhook

## Current Status

**Migration completed successfully**: ✅
- Webhook handler ready
- Bootstrap endpoint ready
- 1 user migrated (adam@opsfx.io)
- System fully operational

**Recommended action**: Use the UI to create new dev users. The registration flow is fully functional and will:
1. Create user in Clerk
2. Bootstrap to app_users (via /api/auth/bootstrap)
3. Allow organization creation
4. Grant portal access

## Test Credentials

If you need a working user immediately, you can use:
- **Email**: adam@opsfx.io (already migrated)
- **Password**: (check your records or reset via Clerk)

Or register fresh through the UI to test the complete flow.

