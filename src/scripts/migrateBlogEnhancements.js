/**
 * Migration script to update existing blog posts with new enhancement fields
 * Run this after applying the database schema migration
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogPosts, blogRevisions } from '../db/schema.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

async function migrateExistingPosts() {
  console.log('🚀 Starting blog enhancements migration...');
  
  try {
    // First, run the SQL migration to add new columns
    console.log('📦 Applying database schema changes...');
    const migrationSQL = `
      -- Add SEO fields if they don't exist
      ALTER TABLE blog_posts 
      ADD COLUMN IF NOT EXISTS meta_title VARCHAR(160),
      ADD COLUMN IF NOT EXISTS meta_description VARCHAR(260),
      ADD COLUMN IF NOT EXISTS keywords JSON DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS og_image VARCHAR(500),
      ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York',
      ADD COLUMN IF NOT EXISTS draft_content TEXT,
      ADD COLUMN IF NOT EXISTS last_autosave TIMESTAMP,
      ADD COLUMN IF NOT EXISTS autosave_version INTEGER DEFAULT 0;

      -- Create revisions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS blog_revisions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        revision_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        meta_data JSON,
        change_type VARCHAR(20) NOT NULL,
        change_summary TEXT,
        author_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, revision_number)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_blog_revisions_post_id ON blog_revisions(post_id);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
    `;
    
    await pool.query(migrationSQL);
    console.log('✅ Database schema updated');

    // Get all existing posts
    console.log('📝 Fetching existing blog posts...');
    const existingPosts = await db.select().from(blogPosts);
    console.log(`Found ${existingPosts.length} posts to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    // Update each post with default values for new fields
    for (const post of existingPosts) {
      try {
        console.log(`Migrating post: ${post.title}`);
        
        // Generate SEO fields from existing content
        const metaTitle = post.title.length > 160 
          ? post.title.substring(0, 157) + '...' 
          : post.title;
        
        const metaDescription = post.excerpt 
          ? (post.excerpt.length > 260 
              ? post.excerpt.substring(0, 257) + '...' 
              : post.excerpt)
          : (post.content.substring(0, 257) + '...');

        // Extract keywords from tags or generate from title
        const keywords = post.tags && Array.isArray(post.tags) 
          ? post.tags 
          : post.title.toLowerCase().split(' ').filter(word => word.length > 4);

        // Determine status based on published field
        const status = post.published ? 'published' : 'draft';

        // Update the post with new fields
        await pool.query(`
          UPDATE blog_posts 
          SET 
            meta_title = COALESCE(meta_title, $1),
            meta_description = COALESCE(meta_description, $2),
            keywords = COALESCE(keywords, $3::json),
            og_image = COALESCE(og_image, featured_image),
            status = COALESCE(status, $4),
            timezone = COALESCE(timezone, 'America/New_York'),
            autosave_version = COALESCE(autosave_version, 0)
          WHERE id = $5
        `, [metaTitle, metaDescription, JSON.stringify(keywords), status, post.id]);

        // Create initial revision for existing content
        const revisionExists = await pool.query(
          'SELECT id FROM blog_revisions WHERE post_id = $1 LIMIT 1',
          [post.id]
        );

        if (revisionExists.rows.length === 0) {
          await pool.query(`
            INSERT INTO blog_revisions (
              post_id, revision_number, title, content, excerpt, 
              meta_data, change_type, change_summary, author_name, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6::json, $7, $8, $9, $10)
          `, [
            post.id,
            1,
            post.title,
            post.content,
            post.excerpt,
            JSON.stringify({
              seo: { metaTitle, metaDescription, keywords },
              scheduling: { timezone: 'America/New_York' }
            }),
            'manual',
            'Initial revision from migration',
            post.authorName || 'System',
            post.createdAt || new Date()
          ]);
        }

        migratedCount++;
        console.log(`✅ Migrated: ${post.title}`);
      } catch (error) {
        console.error(`❌ Error migrating post ${post.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} posts`);
    if (errorCount > 0) {
      console.log(`❌ Failed to migrate: ${errorCount} posts`);
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const verifyQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(meta_title) as posts_with_seo,
        COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as posts_with_status
      FROM blog_posts
    `);
    
    const stats = verifyQuery.rows[0];
    console.log(`Total posts: ${stats.total_posts}`);
    console.log(`Posts with SEO: ${stats.posts_with_seo}`);
    console.log(`Posts with status: ${stats.posts_with_status}`);

    const revisionCount = await pool.query('SELECT COUNT(*) as count FROM blog_revisions');
    console.log(`Total revisions created: ${revisionCount.rows[0].count}`);

    console.log('\n✨ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExistingPosts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateExistingPosts;