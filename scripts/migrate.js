/**
 * MediTrack - Supabase Cloud PostgreSQL Migration Runner
 * 
 * Applies /supabase/migrations/001_initial_schema.sql directly to Supabase Cloud.
 * Supports:
 *  1. Direct PostgreSQL connection via DATABASE_URL or SUPABASE_DB_URL (Pooler / Direct)
 *  2. Supabase Management Query API using project ref & SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ACCESS_TOKEN
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local first, then .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const { Client } = require('pg');

async function runMigration() {
  console.log('🚀 MediTrack Database Migration Runner');
  console.log('==================================================');

  const migrationFilePath = path.resolve(
    process.cwd(),
    'supabase',
    'migrations',
    '001_initial_schema.sql'
  );

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found: ${migrationFilePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFilePath, 'utf8');
  console.log(`📄 Loaded migration: supabase/migrations/001_initial_schema.sql (${Buffer.byteLength(sql)} bytes)`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  let databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

  // Extract project ref from URL if possible
  let projectRef = '';
  if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
    const match = supabaseUrl.match(/https:\/\/([a-z0-9_-]+)\.supabase\.co/i);
    if (match) projectRef = match[1];
  }

  console.log(`🌐 Supabase Target URL: ${supabaseUrl || 'Not specified'}`);
  if (projectRef) console.log(`🏷️  Project Reference: ${projectRef}`);
  console.log(`🔑 Service Role Key: ${serviceRoleKey ? '***' + serviceRoleKey.slice(-6) : 'Missing'}`);

  // 1. If DATABASE_URL is available, use direct PG connection
  if (databaseUrl && !databaseUrl.includes('placeholder')) {
    console.log('\n🔌 Connecting to Supabase Cloud PostgreSQL via DATABASE_URL...');
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }, // Required for Supabase Cloud
    });

    try {
      await client.connect();
      console.log('✅ Connected successfully to Supabase PostgreSQL database!');
      console.log('⏳ Executing migration script (tables, RLS policies, triggers, seed data)...');

      const startTime = Date.now();
      await client.query(sql);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`🎉 Migration applied successfully in ${elapsed}s!\n`);

      // Verify created tables and counts
      console.log('🔍 Verifying schema objects in Supabase:');
      const tableRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('profiles', 'pharmacies', 'inventory')
        ORDER BY table_name;
      `);
      console.log(`   • Tables present: ${tableRes.rows.map(r => r.table_name).join(', ')}`);

      const pharmRes = await client.query('SELECT COUNT(*) FROM public.pharmacies;');
      const invRes = await client.query('SELECT COUNT(*) FROM public.inventory;');
      const profRes = await client.query('SELECT COUNT(*) FROM public.profiles;');

      console.log(`   • Seeded Profiles count:   ${profRes.rows[0].count}`);
      console.log(`   • Seeded Pharmacies count: ${pharmRes.rows[0].count}`);
      console.log(`   • Seeded Inventory count:  ${invRes.rows[0].count}`);

      await client.end();
      console.log('\n✨ Database migration completed successfully.');
      return;
    } catch (err) {
      console.error('❌ Direct PostgreSQL migration error:', err.message);
      await client.end().catch(() => {});
      process.exit(1);
    }
  }

  // 2. If Service Role Key & Supabase Management API is available
  if (projectRef && serviceRoleKey && !serviceRoleKey.includes('placeholder')) {
    console.log('\n📡 Attempting migration via Supabase SQL API using Service Role Key...');
    
    // Test Supabase SQL endpoint
    const queryEndpoints = [
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      `${supabaseUrl}/rest/v1/rpc/exec_sql`
    ];

    try {
      const response = await fetch(queryEndpoints[0], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok) {
        console.log('✅ Migration applied via Supabase SQL API successfully!');
        return;
      } else {
        const text = await response.text();
        console.log(`ℹ️ Supabase Management API response (${response.status}): ${text.substring(0, 120)}...`);
      }
    } catch (apiErr) {
      console.log('ℹ️ HTTP SQL execution not supported on standard REST endpoint.');
    }
  }

  // 3. Fallback instructions for Hackathon / Developer Setup
  console.log('\n==================================================');
  console.log('ℹ️ HOW TO RUN THIS MIGRATION IN SUPABASE CLOUD:');
  console.log('==================================================');
  console.log('Method A (Instant Recommended): Direct Connection');
  console.log('  1. Open your Supabase Project Settings -> Database.');
  console.log('  2. Copy the "Connection String" (URI) under Connection pooling or Direct connection.');
  console.log('  3. Add it to .env.local:');
  console.log('     DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
  console.log('  4. Run: npm run migrate\n');
  console.log('Method B (1-Click in Browser):');
  console.log('  1. Open your Supabase Dashboard -> SQL Editor.');
  console.log('  2. Click "New Query".');
  console.log('  3. Paste the contents of /supabase/migrations/001_initial_schema.sql and click "Run".\n');
}

runMigration().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
