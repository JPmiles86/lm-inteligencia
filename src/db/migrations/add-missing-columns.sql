-- Migration to add missing columns to blog_posts table
-- This adds the enhanced features without losing existing data

-- Add status column for draft/scheduled/published states
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Update existing posts to have correct status based on published field
UPDATE blog_posts 
SET status = CASE 
  WHEN published = true THEN 'published'
  ELSE 'draft'
END
WHERE status IS NULL;

-- Add scheduling support
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP;

-- Add timezone support for scheduling
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York';

-- Add SEO fields
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(160);

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(260);

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS keywords JSON DEFAULT '[]'::json;

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS og_image VARCHAR(500);

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);

-- Add autosave/draft support
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS draft_content TEXT;

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS last_autosave TIMESTAMP;

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS autosave_version INTEGER DEFAULT 0;

-- Add editor type tracking (if not exists)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS editor_type VARCHAR(20) DEFAULT 'quill';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date);