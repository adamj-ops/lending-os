const { config } = require('dotenv');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq } = require('drizzle-orm');

// Load environment variables
config({ path: '.env.local' });

async function setupUserOrg() {
  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);
  
  try {
    // Create organization
    const [org] = await db.execute(`
      INSERT INTO organizations (id, name, slug, logo, settings, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Everyday Homebuyers', 'everyday-homebuyers', null, '{}', NOW(), NOW())
      RETURNING id, name
    `);
    
    console.log('✅ Created organization:', org[0].name);
    
    // Assign user to organization with portal access
    await db.execute(`
      INSERT INTO user_portal_access (id, user_id, organization_id, portal_type, role, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), 'xiDye21pr8EaFgTdcUHx5p5BDmKOgo07', '${org[0].id}', 'ops', 'admin', true, NOW(), NOW())
    `);
    
    console.log('✅ Assigned user to organization with ops access');
    
    // Update user's organizationId
    await db.execute(`
      UPDATE users SET organization_id = '${org[0].id}' 
      WHERE id = 'xiDye21pr8EaFgTdcUHx5p5BDmKOgo07'
    `);
    
    console.log('✅ Updated user organizationId');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupUserOrg();
