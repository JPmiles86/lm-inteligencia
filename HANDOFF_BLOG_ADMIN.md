# Handoff Document - Blog Admin Implementation

## Current Status

### ✅ Completed Work
1. **Admin Panel** - Located at `/admin`
   - Login: `laurie@inteligenciadm.com` / `Inteligencia2025!`
   - Toggle for Staff section visibility
   - Toggle for Blog visibility
   - Settings saved in localStorage

2. **URL Routing** - All fixed and working
   - Subdomain detection working (hospitality.inteligenciadm.com)
   - Clean URLs without `/hotels` prefix
   - All navigation functioning properly

3. **Documentation Created**
   - `URL_FIX_INVESTIGATION.md` - Complete routing investigation
   - `BLOG_EDITOR_PLAN.md` - Detailed plans for both editor options

## 📝 Next Task: Implement BOTH Blog Editors

### Client Request
The client wants BOTH editor options built so they can test and choose:
1. **Rich Text Editor** (TinyMCE style)
2. **Block Editor** (WordPress Gutenberg style)

### Key Requirements

#### Both Editors Need:
- **Text Management**
  - Add/edit/delete text
  - Formatting (bold, italic, headings, lists)
  
- **Image Management** (CRITICAL)
  - Upload images
  - Resize images
  - Position images (left, center, right, full-width)
  - Add alt tags
  - Add captions
  - Image galleries for block editor

- **Blog Management**
  - Save as draft
  - Schedule posts
  - Publish immediately
  - Categories and tags
  - SEO fields (meta title, description)

- **Admin Interface**
  - List all blog posts
  - Edit/delete posts
  - Search and filter
  - Preview before publishing

### Implementation Plan (from BLOG_EDITOR_PLAN.md)

#### Option 1: Rich Text Editor
- Use TinyMCE React component
- WYSIWYG interface
- Drag & drop images
- Immediate visual feedback

#### Option 2: Block Editor
- Use Editor.js or build custom
- Drag & drop blocks
- More flexible layouts
- Each block independently styled

### Storage Recommendation
Start with **localStorage** for quick testing (2-3 hours), then upgrade to Firebase once client chooses preferred editor.

### File Structure
```
/src/components/admin/
  AdminPanel.tsx (exists)
  AdminAuth.tsx (exists)
  BlogEditor.tsx (to create)
  RichTextEditor.tsx (to create)
  BlockEditor.tsx (to create)
  BlogList.tsx (to create)

/src/hooks/
  useAdminSettings.ts (exists)
  useBlogPosts.ts (to create)
```

### Routes Needed
- `/admin/blog` - Blog management dashboard
- `/admin/blog/new` - Create new post
- `/admin/blog/edit/:id` - Edit existing post
- `/blog` - Public blog listing
- `/blog/:slug` - Individual blog post

### Database Schema
```javascript
{
  id: string,
  title: string,
  slug: string,
  content: string, // HTML for rich text, JSON for blocks
  editorType: 'rich' | 'block',
  excerpt: string,
  featuredImage: string,
  author: string,
  status: 'draft' | 'published' | 'scheduled',
  publishDate: Date,
  category: string,
  tags: string[],
  metaTitle: string,
  metaDescription: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Priority Features for MVP
1. Both editors working side by side
2. Image upload and positioning
3. Save/load from localStorage
4. Preview mode
5. Basic publish/draft status

### Known Issues to Address
- Contact page might still have issues (investigate if reported)
- Blog visibility toggle in admin works but needs testing with actual blog pages

### Testing Instructions
1. Login to admin at `/admin`
2. Navigate to `/admin/blog` (once implemented)
3. Create test posts with both editors
4. Test image uploads and positioning
5. Verify preview matches final display

### Client Communication
Client wants to test both editors to make informed decision. Build both with ability to:
- Create same post in both formats
- Switch between editors
- Compare editing experience
- Choose preferred option

## Important Notes
- Client is non-technical, needs user-friendly interface
- Image handling is CRITICAL - must be intuitive
- Client needs full control over formatting and layout
- This is temporary blog system until client chooses preferred editor

## Questions for Next Session
1. Image storage preference (localStorage has 5MB limit)
2. Need for image optimization/compression?
3. Required image formats (JPEG, PNG, WebP)?
4. Max image size limits?
5. Need for image library/media manager?

Good luck with the implementation!