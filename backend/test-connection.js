#!/usr/bin/env node

/**
 * Supabase Connection Diagnostic Script
 * Tests if your database is reachable and provides troubleshooting info
 */

const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
  }

  console.log('📋 Connection Details:');
  console.log(`   Host: ${dbUrl.match(/@([^:]+):/)?.[1] || 'unknown'}`);
  console.log(`   Port: ${dbUrl.match(/:(\d+)\//)?.[1] || 'unknown'}`);
  console.log(`   Database: ${dbUrl.match(/\/([^?]+)$/)?.[1] || 'unknown'}`);
  console.log();

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
  });

  try {
    console.log('⏳ Attempting to connect...');
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Test if database has tables
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log('📊 Database Tables Found:');
    if (result.rows.length === 0) {
      console.log('   (none - schema needs migration)');
      console.log('\n   Next step: npx prisma migrate deploy');
    } else {
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }

    await client.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', err.message);
    console.error('\nPossible causes:');

    if (err.message.includes('ENOTFOUND')) {
      console.error('  • Host unreachable (DNS issue)');
      console.error('  • Supabase project is paused');
      console.error('  • Network connectivity issue');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('  • Database port is not accepting connections');
      console.error('  • Supabase project is down');
    } else if (err.message.includes('authentication')) {
      console.error('  • Wrong password in DATABASE_URL');
      console.error('  • Wrong username');
    } else if (err.message.includes('timeout')) {
      console.error('  • Database is slow to respond');
      console.error('  • Network latency issue');
      console.error('  • Supabase project might be paused');
    }

    console.error('\n💡 Troubleshooting:');
    console.error('  1. Visit https://supabase.com/dashboard');
    console.error('  2. Check if your project is "Active" (not paused)');
    console.error('  3. If paused, click "Resume"');
    console.error('  4. Wait 2-3 minutes for it to wake up');
    console.error('  5. Run this script again');

    process.exit(1);
  }
}

testConnection();
