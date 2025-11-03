# Clerk Webhooks Setup

This guide explains how to set up and handle Clerk webhooks in Lending OS.

## Overview

Clerk webhooks allow you to react to user events in real-time:
- User created/deleted/updated
- Session events
- Organization events (if using Clerk Organizations)

## Setting Up Webhooks in Clerk Dashboard

1. Go to Clerk Dashboard → **Webhooks**
2. Click **+ Endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
4. Select events to subscribe to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
   - `session.ended`
5. Copy the **Signing Secret** (starts with `whsec_...`)
6. Add to environment variables as `CLERK_WEBHOOK_SECRET`

## Webhook Endpoint Implementation

### Create Webhook Route

Create `src/app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // User created in Clerk
    const { id, email_addresses, first_name, last_name } = evt.data;
    // Handle user creation (e.g., create portal access, send welcome email)
  }

  if (eventType === 'user.deleted') {
    // User deleted in Clerk
    const { id } = evt.data;
    // Handle user deletion (e.g., cleanup portal access)
  }

  return new Response('', { status: 200 });
}
```

## Common Webhook Events

### user.created
Fired when a new user is created in Clerk.

**Use cases:**
- Create initial portal access
- Send welcome email
- Initialize user preferences

### user.updated
Fired when user profile is updated.

**Use cases:**
- Sync profile changes to your database
- Update user metadata

### user.deleted
Fired when a user is deleted.

**Use cases:**
- Clean up portal access
- Archive user data
- Remove from organizations

### session.created
Fired when a new session is created.

**Use cases:**
- Log user activity
- Track login events

### session.ended
Fired when a session ends.

**Use cases:**
- Log logout events
- Update last activity timestamp

## Security

### Verifying Webhook Signatures

Always verify webhook signatures using Svix:

```typescript
import { Webhook } from 'svix';

const wh = new Webhook(WEBHOOK_SECRET);
const evt = wh.verify(payload, headers);
```

### Webhook Secret

Store the webhook secret securely:
- Never commit to git
- Use environment variable: `CLERK_WEBHOOK_SECRET`
- Rotate if compromised

## Testing Webhooks

### Using Clerk Dashboard

1. Go to **Webhooks** → Your endpoint
2. Click **Send test webhook**
3. Select event type
4. Check your endpoint logs

### Using Local Development

Use Clerk CLI or ngrok to forward webhooks to localhost:

```bash
# Install Clerk CLI
npm install -g @clerk/clerk

# Forward webhooks to localhost
clerk webhooks forward http://localhost:3000/api/webhooks/clerk
```

## Example: Auto-create Portal Access

```typescript
if (eventType === 'user.created') {
  const { id: clerkUserId, email_addresses } = evt.data;
  const email = email_addresses[0]?.email_address;

  // Create default organization and portal access
  await db.insert(organizations).values({
    name: `${email}'s Organization`,
  });

  // Get org ID and create portal access
  // ... (implementation details)
}
```

## Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Documentation](https://docs.svix.com/) (used by Clerk for webhook signing)

