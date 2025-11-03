# Clerk Dashboard Guide

This guide explains how to use the Clerk Dashboard for managing users and authentication in Lending OS.

## Accessing Clerk Dashboard

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in with your Clerk account
3. Select your application

## User Management

### Creating Users

1. Navigate to **Users** in the sidebar
2. Click **+ Add user**
3. Enter:
   - Email address (required)
   - First name (optional)
   - Last name (optional)
   - Temporary password (or send invitation email)
4. Click **Create user**

### Managing Users

- **View users**: Users → List all users
- **Edit user**: Click on a user → Edit profile
- **Reset password**: Click on a user → Reset password
- **Delete user**: Click on a user → Delete (use with caution)

## API Keys

### Finding API Keys

1. Navigate to **API Keys** in the sidebar
2. View your keys:
   - **Secret Key** (`sk_test_...` or `sk_live_...`) → Use as `CLERK_SECRET_KEY`
   - **Publishable Key** (`pk_test_...` or `pk_live_...`) → Use as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Rotating Keys

1. Navigate to **API Keys**
2. Click **Rotate** next to the key you want to rotate
3. Update environment variables immediately
4. Old key remains valid for 5 minutes for graceful rotation

## Sessions

### Viewing Active Sessions

1. Navigate to **Sessions**
2. View all active user sessions
3. Sessions are managed automatically by Clerk

### Revoking Sessions

1. Navigate to **Users**
2. Click on a user
3. Go to **Sessions** tab
4. Click **Revoke** next to any session

## Organization Management

**Note**: Lending OS uses custom organizations (not Clerk Organizations feature).

Organizations are managed via:
- Database: `organizations` table
- Portal access: `user_portal_access` table
- API: `/api/auth/create-organization` endpoint

See `.cursor/docs/technical/clerk-setup.md` for organization management details.

## Webhooks

### Setting Up Webhooks

1. Navigate to **Webhooks** in the sidebar
2. Click **+ Endpoint**
3. Enter your webhook URL (e.g., `https://your-app.com/api/webhooks/clerk`)
4. Select events to listen to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
   - `session.ended`
5. Save the endpoint

### Webhook Security

- Clerk signs webhooks with a secret
- Verify webhook signatures in your endpoint
- See [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks) for details

## Environment Configuration

### Development vs Production

- **Development**: Use test keys (`sk_test_...`, `pk_test_...`)
- **Production**: Use live keys (`sk_live_...`, `pk_live_...`)

Switch between environments in Clerk Dashboard:
1. Click application name in top-left
2. Select environment (Development or Production)
3. Get keys for the selected environment

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Support](https://clerk.com/support)
- Internal docs: `.cursor/docs/technical/clerk-setup.md`

