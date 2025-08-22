# Google Cloud Storage Setup Task

## Assignment
**Task:** Set up Google Cloud Storage integration for blog image uploads and management
**Status:** Pending Assignment
**Priority:** High
**Estimated Time:** 2-3 hours

## Objective
Integrate Google Cloud Storage to handle blog image uploads, storage, and serving. Replace current Unsplash image links with proper GCS-hosted images.

## Requirements

### Environment Configuration
```env
GOOGLE_APPLICATION_CREDENTIALS="./laurie-storage-key.json"
GCS_BUCKET_NAME="laurie-blog-media"
GCS_PROJECT_ID="pbguisecr-laurie-meirling"
```

### Tasks to Complete

#### 1. Install GCS Dependencies
```bash
npm install @google-cloud/storage multer --save
npm install @types/multer --save-dev
```

#### 2. Create GCS Service
Create `/src/services/gcsService.ts` with:
- Bucket connection
- Image upload function
- Image deletion function
- URL generation
- Image optimization (resize/compress)

#### 3. Create Image Upload API Endpoints
Create `/src/api/upload.ts` (or similar structure) with:
- `POST /api/upload/image` - Single image upload
- `DELETE /api/upload/image/:filename` - Delete image
- Image validation (type, size limits)
- Secure file naming

#### 4. Update Environment Setup
- Add GCS credentials to `.env.example`
- Document GCS setup process
- Add error handling for missing credentials

#### 5. Create Image Management Component
Create `/src/components/admin/ImageUploader.tsx` with:
- Drag & drop interface
- Image preview
- Upload progress
- Error handling
- Integration with Quill editor

#### 6. Integration Points
- Integrate with Quill editor for inline image uploads
- Update featured image upload in blog editor
- Ensure proper cleanup on post deletion

## Current State Analysis
- Blog posts currently use Unsplash URLs in `featuredImage` field
- No image upload functionality exists
- Quill editor configured but needs image upload integration
- Database schema supports image URLs in `featured_image` field

## Expected Deliverables
1. ✅ GCS service with upload/delete/URL generation
2. ✅ Image upload API endpoints with validation
3. ✅ Image uploader React component
4. ✅ Quill editor integration for inline images
5. ✅ Featured image upload in blog editor
6. ✅ Error handling and progress indicators
7. ✅ Documentation for setup

## Testing Requirements
- Test image upload with various formats (JPG, PNG, WebP)
- Test file size limits and validation
- Test error scenarios (network, auth, storage full)
- Test integration with blog editor

## Notes
- Use secure random filenames to prevent conflicts
- Implement image compression/optimization
- Set up proper CORS for GCS bucket
- Consider implementing image variants (thumbnails, different sizes)

## Completion Criteria
- Images can be uploaded via admin interface
- Images are properly stored in GCS bucket
- Image URLs are correctly generated and accessible
- Integration with blog editor works seamlessly
- Error handling covers all edge cases

## Handoff Instructions
When complete, update this file with:
- ✅ Status of each deliverable
- 📁 File locations created/modified
- 🔧 Configuration steps taken
- 🐛 Issues encountered and resolved
- 📋 Testing results
- ➡️ Next steps for dependent tasks