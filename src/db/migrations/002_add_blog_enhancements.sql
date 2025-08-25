-- Migration: Add blog enhancement fields
-- Date: 2025-08-25
-- Description: Adds SEO, scheduling, and revision support to blog posts

-- Add SEO fields to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(160),
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(260),
ADD COLUMN IF NOT EXISTS keywords JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS og_image VARCHAR(500),
ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);

-- Add scheduling fields
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York';

-- Add autosave and draft fields
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS draft_content TEXT,
ADD COLUMN IF NOT EXISTS last_autosave TIMESTAMP,
ADD COLUMN IF NOT EXISTS autosave_version INTEGER DEFAULT 0;

-- Create revisions table for version history
CREATE TABLE IF NOT EXISTS blog_revisions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_data JSON,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('auto', 'manual', 'publish')),
  change_summary TEXT,
  author_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Ensure unique revision numbers per post
  UNIQUE(post_id, revision_number)
);

-- Create index for faster revision queries
CREATE INDEX IF NOT EXISTS idx_blog_revisions_post_id ON blog_revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_revisions_created_at ON blog_revisions(created_at DESC);

-- Create scheduled posts index for efficient queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON blog_posts(scheduled_publish_date) 
WHERE status = 'scheduled';

-- Create status index for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- Update existing posts to have proper status
UPDATE blog_posts 
SET status = CASE 
  WHEN published = true THEN 'published'
  ELSE 'draft'
END
WHERE status IS NULL;

-- Add comment to document the migration
COMMENT ON TABLE blog_revisions IS 'Stores version history for blog posts with change tracking';
COMMENT ON COLUMN blog_posts.meta_title IS 'SEO meta title, max 160 chars';
COMMENT ON COLUMN blog_posts.meta_description IS 'SEO meta description, max 260 chars';
COMMENT ON COLUMN blog_posts.keywords IS 'JSON array of SEO keywords';
COMMENT ON COLUMN blog_posts.scheduled_publish_date IS 'Future publish date for scheduled posts';
COMMENT ON COLUMN blog_posts.draft_content IS 'Autosaved draft content separate from published content';