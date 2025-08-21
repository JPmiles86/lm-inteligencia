# Task: Implement Rich Text Editor for Blog System

## Assignment
Create a Rich Text Editor (TinyMCE-style) for the blog management system. This editor should provide a familiar WYSIWYG interface for content creation with comprehensive formatting and media handling capabilities.

## Context
- **Location**: `/Users/jpmiles/lm-inteligencia/`
- **Existing Infrastructure**:
  - Blog service at `src/services/blogService.ts` (uses localStorage)
  - Blog management components at `src/components/admin/BlogManagement/`
  - Admin panel accessible at `/admin` (login: laurie@inteligenciadm.com / Inteligencia2025!)
  - Blog visibility currently disabled via admin settings

## Requirements

### 1. Rich Text Editor Component
Create `src/components/admin/BlogManagement/RichTextEditor.tsx`:
- Use TinyMCE React or Quill.js
- Full toolbar with formatting options
- Image upload/management interface
- Link insertion with target options
- Table creation and editing
- Code block support with syntax highlighting
- Emoji picker
- Find and replace functionality

### 2. Editor Features
**Text Formatting**:
- Bold, italic, underline, strikethrough
- Headings (H1-H6)
- Font family and size selection
- Text color and background color
- Alignment (left, center, right, justify)
- Lists (ordered, unordered, checklist)
- Blockquotes
- Horizontal rules

**Media Management**:
- Image upload via drag & drop or file picker
- Image resize handles
- Image alignment (left, center, right, full-width)
- Alt text and caption fields
- Gallery creation
- Video embed (YouTube, Vimeo)
- File attachments

**Advanced Features**:
- Undo/redo with history
- Word count and character count
- Auto-save every 30 seconds
- Full-screen editing mode
- Preview mode (show as it will appear)
- HTML source code view
- Paste from Word cleanup
- Keyboard shortcuts

### 3. Integration Points
- Integrate with existing `BlogEditor.tsx`
- Use `blogService.ts` for saving/loading
- Store content as HTML string
- Handle image storage in localStorage (base64 for MVP)

### 4. Blog Post Management
Enhance the editor to support:
- Post scheduling (date/time picker)
- Draft/Published/Scheduled status
- Categories and tags management
- SEO metadata (title, description, keywords)
- Featured image selection
- Excerpt editor
- URL slug editor with auto-generation
- Author information

### 5. Storage Approach (MVP)
For initial testing with localStorage:
```javascript
{
  id: string,
  title: string,
  slug: string,
  content: string, // HTML from rich text editor
  editorType: 'rich',
  excerpt: string,
  featuredImage: string, // base64 for MVP
  images: string[], // array of base64 images
  author: {
    name: string,
    title: string,
    image: string
  },
  status: 'draft' | 'published' | 'scheduled',
  publishDate: Date,
  scheduledDate?: Date,
  category: string,
  tags: string[],
  metaTitle: string,
  metaDescription: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. UI/UX Requirements
- Clean, professional interface
- Responsive design for tablet/desktop
- Loading states for image uploads
- Error handling with user-friendly messages
- Confirmation dialogs for destructive actions
- Tooltips for all toolbar buttons
- Accessibility (ARIA labels, keyboard navigation)

### 7. File Structure
```
src/components/admin/BlogManagement/
  RichTextEditor.tsx (main editor component)
  RichTextToolbar.tsx (toolbar component)
  ImageUploadModal.tsx (image management)
  LinkInsertModal.tsx (link management)
  ScheduleModal.tsx (scheduling interface)
  
src/utils/
  editorHelpers.ts (HTML cleanup, validation)
  imageCompression.ts (resize/compress images)
```

## Implementation Steps
1. Install TinyMCE React or Quill.js
2. Create base RichTextEditor component
3. Implement toolbar with all formatting options
4. Add image upload/management functionality
5. Implement auto-save and draft management
6. Add scheduling and metadata fields
7. Integrate with existing BlogEditor.tsx
8. Test with localStorage limitations
9. Document any limitations or future improvements

## Testing Checklist
- [ ] All formatting options work correctly
- [ ] Images upload and display properly
- [ ] Auto-save functions every 30 seconds
- [ ] Preview matches final output
- [ ] Scheduling works as expected
- [ ] SEO metadata saves correctly
- [ ] Editor handles paste from Word/Google Docs
- [ ] Mobile responsive (tablet minimum)
- [ ] Keyboard shortcuts work
- [ ] Accessibility standards met

## Dependencies to Install
```bash
npm install @tinymce/tinymce-react
# OR
npm install react-quill
npm install date-fns react-datepicker
npm install @types/react-datepicker
```

## Notes for Implementation
- Start with basic editor, add features incrementally
- Consider localStorage 5MB limit for images
- Implement image compression before storing
- Add warning when approaching storage limit
- Consider lazy loading for image galleries
- Ensure all user content is sanitized

## Completion Criteria
- Rich text editor fully functional
- All formatting options available
- Image upload and management working
- Scheduling system implemented
- Auto-save functioning
- Integration with existing blog system complete
- Testing checklist completed
- Documentation updated

## Output Documentation
Upon completion, update this file with:
- Actual implementation details
- Any deviations from plan
- Known limitations
- Future enhancement suggestions
- Performance considerations