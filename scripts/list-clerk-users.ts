import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function listUsers() {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  const users = await clerk.users.getUserList({ limit: 100 });

  console.log(`Found ${users.data.length} users in Clerk:\n`);

  if (users.data.length === 0) {
    console.log('No users found. This is a fresh Clerk instance.');
  } else {
    users.data.forEach((user, i) => {
      console.log(`${i + 1}. ${user.emailAddresses[0]?.emailAddress || 'No email'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username || 'None'}`);
      console.log(`   Phone: ${user.phoneNumbers[0]?.phoneNumber || 'None'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}\n`);
    });
  }
}

listUsers();
