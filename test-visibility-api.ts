/**
 * Test script for vertical visibility settings API
 * Run with: npx ts-node test-visibility-api.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not configured');
  process.exit(1);
}

async function testAPI() {
  console.log('Testing Vertical Visibility Settings API...\n');

  const sql = postgres(connectionString!, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });

  const db = drizzle(sql);

  try {
    // Check if table exists by running a simple query
    console.log('1. Testing database connection and table...');
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'vertical_visibility_settings';
    `;
    
    if (result.length === 0) {
      console.log('⚠️  Table does not exist yet. Run migrations first:');
      console.log('   npm run db:migrate');
      await sql.end();
      return;
    }
    
    console.log('✅ Table exists');

    // Test fetching all settings
    console.log('\n2. Testing fetch all settings...');
    const allSettings = await sql`
      SELECT * FROM vertical_visibility_settings;
    `;
    console.log('✅ Found settings:', allSettings.length, 'records');
    allSettings.forEach(setting => {
      console.log(`   ${setting.vertical}: staff=${setting.show_staff_section}, blog=${setting.show_blog}, testimonials=${setting.show_testimonials}`);
    });

    // Test fetching specific vertical
    console.log('\n3. Testing fetch healthcare settings...');
    const healthcareSettings = await sql`
      SELECT * FROM vertical_visibility_settings 
      WHERE vertical = 'healthcare'
      LIMIT 1;
    `;
    
    if (healthcareSettings.length > 0) {
      console.log('✅ Healthcare settings found:', healthcareSettings[0]);
    } else {
      console.log('⚠️  No healthcare settings found, inserting defaults...');
      await sql`
        INSERT INTO vertical_visibility_settings (vertical, show_staff_section, show_blog, show_testimonials, show_case_studies, show_optional_add_ons)
        VALUES ('healthcare', false, false, false, false, false);
      `;
      console.log('✅ Default healthcare settings inserted');
    }

    // Test update
    console.log('\n4. Testing update healthcare settings...');
    await sql`
      UPDATE vertical_visibility_settings 
      SET show_staff_section = true, updated_at = NOW()
      WHERE vertical = 'healthcare';
    `;
    
    const updatedSettings = await sql`
      SELECT * FROM vertical_visibility_settings 
      WHERE vertical = 'healthcare'
      LIMIT 1;
    `;
    
    console.log('✅ Updated healthcare settings:', updatedSettings[0]);

    // Test insert/upsert for new vertical
    console.log('\n5. Testing upsert for tech vertical...');
    await sql`
      INSERT INTO vertical_visibility_settings (vertical, show_staff_section, show_blog, show_testimonials, show_case_studies, show_optional_add_ons)
      VALUES ('tech', true, true, true, true, true)
      ON CONFLICT (vertical) 
      DO UPDATE SET 
        show_staff_section = EXCLUDED.show_staff_section,
        show_blog = EXCLUDED.show_blog,
        show_testimonials = EXCLUDED.show_testimonials,
        show_case_studies = EXCLUDED.show_case_studies,
        show_optional_add_ons = EXCLUDED.show_optional_add_ons,
        updated_at = NOW();
    `;
    
    const techSettings = await sql`
      SELECT * FROM vertical_visibility_settings 
      WHERE vertical = 'tech'
      LIMIT 1;
    `;
    
    console.log('✅ Tech settings upserted:', techSettings[0]);

    console.log('\n🎉 All database tests passed!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Navigate to /admin to test the admin panel');
    console.log('3. Check that settings are persisted across browser sessions');
    console.log('4. Verify that public pages reflect the visibility settings');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sql.end();
  }
}

testAPI().catch(console.error);