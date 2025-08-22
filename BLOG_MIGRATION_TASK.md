# Blog Migration Task

## Assignment
**Task:** Migrate existing blog posts from static files to database and convert Unsplash images to GCS
**Status:** Pending Assignment  
**Priority:** Medium
**Estimated Time:** 2-3 hours

## Objective
Migrate all existing blog posts from `/src/data/blogData.ts` to the PostgreSQL database and download/upload all Unsplash images to Google Cloud Storage.

## Prerequisites
✅ Database setup complete
✅ Blog API endpoints created
✅ GCS integration working

## Current Data Analysis
- **Location:** `/src/data/blogData.ts`
- **Total Posts:** ~12 blog posts
- **Image Sources:** All using Unsplash URLs
- **Format:** TypeScript objects with full content

## Migration Tasks

### 1. Image Migration
**Download and Upload to GCS:**
- Extract all Unsplash URLs from existing posts
- Download images programmatically  
- Upload to GCS bucket with proper naming
- Update database records with new GCS URLs

### 2. Content Migration
**Data Transfer:**
- Parse existing blog post data
- Transform to match database schema
- Insert into `blog_posts` table
- Preserve all metadata (categories, tags, etc.)

### 3. Create Migration Script
Create `/src/scripts/migrateBlog.ts` with:
- Image download functionality
- GCS upload functionality  
- Database insertion
- Error handling and progress tracking
- Rollback capability

## Implementation Steps

### Step 1: Image Analysis and Download
```typescript
// Analyze existing images
const extractImageUrls = () => {
  // Parse blogData.ts
  // Extract featuredImage URLs
  // Extract inline image URLs from content
  // Return unique list
}

// Download images
const downloadImage = async (url: string, filename: string) => {
  // Download from Unsplash
  // Optimize/compress if needed
  // Save temporarily
}
```

### Step 2: GCS Upload
```typescript
const uploadToGCS = async (localPath: string, gcsPath: string) => {
  // Upload to GCS bucket
  // Generate public URL
  // Clean up local file
  // Return GCS URL
}
```

### Step 3: Database Migration
```typescript
const migratePosts = async () => {
  // For each post in blogData.ts:
  // 1. Download and upload images
  // 2. Update image URLs in content
  // 3. Insert to database
  // 4. Log progress
}
```

### Step 4: Content Processing
- Convert any remaining markdown to HTML (if needed)
- Ensure Quill-compatible HTML format
- Preserve formatting and structure
- Update internal image references

## Data Mapping

### From blogData.ts to Database
```typescript
// Current format → Database field
title → title
slug → slug  
excerpt → excerpt
content → content (convert images)
featuredImage → featured_image (download→GCS)
category → category
tags → tags (JSON array)
featured → featured
publishedDate → published_date
author.name → author_name
author.title → author_title  
author.image → author_image (download→GCS)
readTime → read_time
// New fields:
editorType → 'rich' (default)
published → true (all existing posts)
```

## Image Processing Strategy

### Featured Images
- Download from Unsplash
- Resize to optimal dimensions (1200x600)
- Compress for web
- Upload to GCS: `blog/featured/{slug}-{timestamp}.jpg`

### Inline Images  
- Parse HTML content for image tags
- Download referenced images
- Upload to GCS: `blog/content/{slug}-{index}-{timestamp}.jpg`
- Update HTML with new URLs

### Author Images
- Download author profile images
- Resize to 200x200
- Upload to GCS: `authors/{author-slug}.jpg`

## Script Structure
```
/src/scripts/
├── migrateBlog.ts          # Main migration script
├── imageProcessor.ts       # Image download/upload utilities
├── contentProcessor.ts     # HTML/content processing
└── migrationUtils.ts       # Helper functions
```

## Error Handling
- Track failed downloads with retry logic
- Log all operations for debugging
- Implement rollback for partial failures
- Validate data integrity after migration
- Generate migration report

## Validation & Testing
- Compare post count before/after
- Verify all images are accessible
- Test blog display with new data
- Validate admin interface functionality
- Check search and filtering

## Backup Strategy
- Export current localStorage data
- Backup original blogData.ts
- Create database dump before migration
- Implement rollback procedure

## Progress Tracking
```typescript
interface MigrationProgress {
  totalPosts: number;
  postsProcessed: number;
  imagesDownloaded: number;
  imagesUploaded: number;
  postsInserted: number;
  errors: string[];
  startTime: Date;
  estimatedCompletion: Date;
}
```

## Expected Deliverables
1. ✅ Complete migration script with progress tracking
2. ✅ All existing posts migrated to database
3. ✅ All images downloaded and uploaded to GCS
4. ✅ Updated image URLs in post content
5. ✅ Validation of migrated data
6. ✅ Migration report with statistics
7. ✅ Rollback procedure documented

## Post-Migration Cleanup
- Remove dependency on `/src/data/blogData.ts`
- Update blog service to use API instead
- Test all blog functionality
- Update documentation

## Performance Considerations
- Batch process images to avoid rate limits
- Implement concurrent downloads with limits
- Use streams for large file handling
- Monitor GCS usage and costs

## Completion Criteria
- All existing blog posts successfully migrated
- All images accessible via GCS URLs
- Database contains complete and accurate data
- Blog display works with new data source
- Admin interface can manage migrated posts
- No data loss or corruption

## Handoff Instructions
When complete, update this file with:
- ✅ Migration statistics (posts, images processed)
- 📁 File locations of migration scripts
- 🔧 Migration steps taken
- 🧪 Validation results
- 🐛 Issues encountered and resolved
- 📊 Performance metrics
- 📋 Post-migration checklist results
- ➡️ Next steps for admin interface update