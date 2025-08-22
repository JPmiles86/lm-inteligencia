# Blog Database System Implementation Task

## Overview
Convert the static blog system to a dynamic database-driven system with Google Cloud Storage for images.

## Current Status
✅ **COMPLETED:**
- PostgreSQL database connected (Railway)
- Drizzle ORM configured
- Database schema created (`blog_posts` table)
- Migration applied successfully
- Database connection established

## Subagent Tasks

### 1. GOOGLE_CLOUD_STORAGE_SETUP_TASK.md
**Status:** Pending
**Assigned to:** Not yet assigned
**Objective:** Set up Google Cloud Storage integration for blog image uploads

### 2. BLOG_API_ENDPOINTS_TASK.md  
**Status:** Pending
**Assigned to:** Not yet assigned
**Objective:** Create REST API endpoints for blog CRUD operations

### 3. BLOG_MIGRATION_TASK.md
**Status:** Pending  
**Assigned to:** Not yet assigned
**Objective:** Migrate existing blog posts from static files to database + download/upload images to GCS

### 4. ADMIN_INTERFACE_UPDATE_TASK.md
**Status:** Pending
**Assigned to:** Not yet assigned  
**Objective:** Update admin interface to use database API instead of localStorage

## Database Schema (Reference)
```sql
Table: blog_posts
- id (serial, primary key)
- title (varchar 255, not null)
- slug (varchar 255, unique, not null)
- excerpt (text)
- content (text, not null)
- featured_image (varchar 500) -- GCS URL
- category (varchar 100, not null)
- tags (json array)
- featured (boolean, default false)
- published (boolean, default false)
- published_date (varchar 50)
- created_at (timestamp, default now)
- updated_at (timestamp, default now)
- author_name (varchar 100, not null)
- author_title (varchar 150)
- author_image (varchar 500) -- GCS URL
- read_time (integer, default 5)
- editor_type (varchar 20, default 'rich')
```

## GCS Configuration
```env
GOOGLE_APPLICATION_CREDENTIALS="./laurie-storage-key.json"
GCS_BUCKET_NAME="laurie-blog-media"
GCS_PROJECT_ID="pbguisecr-laurie-meirling"
```

## File Locations
- Database schema: `/src/db/schema.ts`
- Database connection: `/src/db/index.ts`
- Current blog data: `/src/data/blogData.ts`
- Admin interface: `/src/components/admin/BlogManagement/`
- Blog service: `/src/services/blogService.ts`

## Dependencies Added
- `pg` - PostgreSQL client
- `@types/pg` - TypeScript types
- `drizzle-orm` - ORM
- `drizzle-kit` - Migration tool

## Next Actions
1. Create individual task MD files for each subagent
2. Assign subagents following MD rule
3. Track progress through MD file updates
4. Ensure seamless handoffs between agents

## Notes
- All existing blog posts use Unsplash images that need to be downloaded and uploaded to GCS
- Current blog routing and display is working
- Admin interface currently uses localStorage (needs database integration)
- Quill.js editor is configured and working