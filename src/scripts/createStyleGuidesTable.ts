#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createStyleGuidesTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Creating style_guides table...');
    
    // Create the table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS style_guides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL CHECK (type IN ('brand', 'vertical', 'writing_style', 'persona')),
        name VARCHAR(255) NOT NULL,
        vertical VARCHAR(50) CHECK (vertical IN ('hospitality', 'healthcare', 'tech', 'athletics')),
        content TEXT NOT NULL,
        description TEXT,
        version INTEGER DEFAULT 1,
        parent_id UUID,
        active BOOLEAN DEFAULT true,
        is_default BOOLEAN DEFAULT false,
        perspective VARCHAR(255),
        voice_characteristics JSON DEFAULT '[]'::json,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(type, name, vertical)
      );
    `);
    
    console.log('✅ Style guides table created successfully!');
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_style_guides_type ON style_guides(type);
      CREATE INDEX IF NOT EXISTS idx_style_guides_vertical ON style_guides(vertical);
      CREATE INDEX IF NOT EXISTS idx_style_guides_active ON style_guides(active);
    `);
    
    console.log('✅ Indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await pool.end();
  }
}

createStyleGuidesTable();