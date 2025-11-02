/**
 * Clerk Webhook Handler
 * 
 * Syncs Clerk user events to our app_users table.
 * Handles user.created, user.updated, and user.deleted events.
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { appUsers } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const body = await req.text();

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Process event
  const eventType = evt.type;
  console.log(`📥 Clerk webhook received: ${eventType}`, { 
    userId: evt.data?.id,
    email: evt.data?.email_addresses?.[0]?.email_address 
  });

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        await upsertUser(evt.data);
        break;
        
      case 'user.deleted':
        await softDeleteUser(evt.data.id);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`Webhook processing error for ${eventType}:`, error);
    return new Response('Processing error', { status: 500 });
  }
}

/**
 * Upsert user from Clerk webhook data
 * CRITICAL: Sets deletedAt to null to handle user reinstatement
 */
async function upsertUser(clerkUser: any) {
  const email = clerkUser.email_addresses?.[0]?.email_address || '';
  const firstName = clerkUser.first_name || '';
  const lastName = clerkUser.last_name || '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || 
                clerkUser.username || 
                'Unknown';

  try {
    await db.insert(appUsers).values({
      id: clerkUser.id,
      email,
      name,
      firstName: firstName || null,
      lastName: lastName || null,
      imageUrl: clerkUser.image_url || null,
      isActive: !clerkUser.banned && !clerkUser.locked,
      deletedAt: null, // Clear deletedAt on creation/update
    }).onConflictDoUpdate({
      target: appUsers.id,
      set: {
        email,
        name,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: clerkUser.image_url || null,
        isActive: !clerkUser.banned && !clerkUser.locked,
        deletedAt: null, // CRITICAL: Clear deletedAt when user is reinstated
        updatedAt: new Date(),
      }
    });

    console.log(`✅ Synced user ${clerkUser.id} to app_users`);
  } catch (error) {
    console.error(`Failed to upsert user ${clerkUser.id}:`, error);
    throw error;
  }
}

/**
 * Soft delete user (preserve audit trail)
 * Sets deletedAt and isActive=false instead of deleting the row
 */
async function softDeleteUser(userId: string) {
  try {
    await db.update(appUsers)
      .set({ 
        deletedAt: new Date(), 
        isActive: false 
      })
      .where(eq(appUsers.id, userId));

    console.log(`✅ Soft-deleted user ${userId}`);
  } catch (error) {
    console.error(`Failed to soft-delete user ${userId}:`, error);
    throw error;
  }
}

