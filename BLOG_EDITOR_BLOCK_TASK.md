# Task: Implement Block Editor for Blog System

## Assignment
Create a Block Editor (WordPress Gutenberg-style) for the blog management system. This editor should provide a modern, flexible block-based interface for creating rich, structured content with drag-and-drop capabilities.

## Context
- **Location**: `/Users/jpmiles/lm-inteligencia/`
- **Existing Infrastructure**:
  - Blog service at `src/services/blogService.ts` (uses localStorage)
  - Blog management components at `src/components/admin/BlogManagement/`
  - Admin panel accessible at `/admin` (login: laurie@inteligenciadm.com / Inteligencia2025!)
  - Blog visibility currently disabled via admin settings

## Requirements

### 1. Block Editor Component
Create `src/components/admin/BlogManagement/BlockEditor.tsx`:
- Use Editor.js or build custom block system
- Drag & drop block reordering
- Block insertion menu with search
- Inline editing for text blocks
- Block settings panel
- Undo/redo functionality
- Keyboard navigation between blocks

### 2. Block Types to Implement

**Text Blocks**:
- Paragraph (with inline formatting)
- Headings (H1-H6 with style presets)
- Quote/Blockquote (with citation)
- List (ordered, unordered, checklist)
- Code (with syntax highlighting)
- Preformatted text

**Media Blocks**:
- Image (single with caption, alt text)
- Gallery (grid, carousel, masonry layouts)
- Video (upload or embed)
- Audio (upload or embed)
- File/Download

**Layout Blocks**:
- Columns (2-4 columns, responsive)
- Spacer/Divider
- Button/CTA
- Card (image + text combination)
- Accordion/Collapsible
- Tabs

**Embed Blocks**:
- YouTube/Vimeo
- Twitter/X posts
- Instagram posts
- CodePen/CodeSandbox
- Google Maps
- Custom HTML

**Special Blocks**:
- Table (with header/footer options)
- Call-to-action box
- Alert/Notice box
- Testimonial
- Team member card
- Pricing table

### 3. Block Features
Each block should support:
- Settings panel (alignment, colors, spacing)
- Duplicate block
- Delete block
- Move up/down or drag to reorder
- Convert to different block type (where applicable)
- Copy/paste blocks
- Block templates/patterns

### 4. Editor Interface
```
+----------------------------------+
|  [Add Block] [Undo] [Redo] [⚙️]  |  <- Top toolbar
+----------------------------------+
|                                  |
|  [+] Add block here             |  <- Block inserter
|                                  |
|  +----------------------------+ |
|  | Heading Block              | |  <- Individual blocks
|  | [H2] Title Goes Here       | |
|  +----------------------------+ |
|                                  |
|  +----------------------------+ |
|  | Paragraph Block            | |
|  | Content text here...       | |
|  +----------------------------+ |
|                                  |
|  [+] Add block                  |
|                                  |
+----------------------------------+
| Block Settings Panel (sidebar)   |
+----------------------------------+
```

### 5. Data Structure
Store blocks as JSON array:
```javascript
{
  id: string,
  title: string,
  slug: string,
  content: [
    {
      id: string,
      type: 'heading',
      data: {
        text: 'Title',
        level: 2,
        alignment: 'left'
      },
      settings: {
        className: '',
        anchor: ''
      }
    },
    {
      id: string,
      type: 'image',
      data: {
        url: 'base64...',
        alt: 'Description',
        caption: 'Image caption',
        size: 'full',
        alignment: 'center'
      }
    },
    // ... more blocks
  ],
  editorType: 'block',
  // ... other post metadata
}
```

### 6. Block Templates
Pre-designed block combinations:
- Blog post intro (heading + featured image + paragraph)
- Product showcase (columns with images + text)
- FAQ section (accordion blocks)
- Contact section (text + button + map)
- Gallery showcase
- Testimonials section

### 7. Advanced Features
- **Block Patterns Library**: Save and reuse block combinations
- **Global Blocks**: Reusable blocks across posts
- **Revision History**: Track changes to blocks
- **Collaborative Editing Indicators**: Show which block is being edited
- **Block Locking**: Prevent certain blocks from being edited/moved
- **Responsive Preview**: Show how blocks appear on mobile/tablet
- **Export/Import**: Export blocks as JSON or HTML

### 8. File Structure
```
src/components/admin/BlogManagement/
  BlockEditor.tsx (main editor)
  BlockEditor.css (styles)
  blocks/
    TextBlock.tsx
    HeadingBlock.tsx
    ImageBlock.tsx
    GalleryBlock.tsx
    EmbedBlock.tsx
    ColumnsBlock.tsx
    ... (other block types)
  BlockInserter.tsx
  BlockSettings.tsx
  BlockMover.tsx
  BlockTemplates.tsx
  
src/utils/
  blockHelpers.ts
  blockValidation.ts
  blockRenderer.ts
```

### 9. User Experience
- **Slash Commands**: Type "/" to quickly insert blocks
- **Drag & Drop**: Visual indicators for drop zones
- **Keyboard Shortcuts**: 
  - Enter: New paragraph block
  - Shift+Enter: Line break
  - Tab/Shift+Tab: Navigate blocks
  - Ctrl+D: Duplicate block
  - Delete: Remove empty block
- **Inline Toolbar**: Appears when selecting text
- **Block Toolbar**: Appears when block is selected
- **Distraction-Free Mode**: Hide all UI except content

### 10. Performance Considerations
- Lazy load block components
- Virtualize long lists of blocks
- Debounce auto-save
- Optimize image loading
- Cache block templates
- Minimize re-renders

## Implementation Steps
1. Set up Editor.js or custom block framework
2. Create base block types (paragraph, heading, image)
3. Implement drag & drop functionality
4. Add block inserter and search
5. Create block settings panel
6. Add more complex blocks (columns, embeds)
7. Implement block templates
8. Add undo/redo system
9. Integrate with existing BlogEditor.tsx
10. Test with various content types

## Testing Checklist
- [ ] All block types render correctly
- [ ] Drag & drop works smoothly
- [ ] Block settings save properly
- [ ] Keyboard navigation functions
- [ ] Slash commands work
- [ ] Templates insert correctly
- [ ] Undo/redo maintains state
- [ ] Content exports to HTML correctly
- [ ] Mobile responsive editing
- [ ] Performance with 50+ blocks

## Dependencies to Install
```bash
npm install @editorjs/editorjs
npm install @editorjs/header
npm install @editorjs/list
npm install @editorjs/image
npm install @editorjs/embed
npm install @editorjs/table
npm install @editorjs/code
npm install react-sortable-hoc
# OR build custom with:
npm install react-dnd react-dnd-html5-backend
npm install uuid
```

## Notes for Implementation
- Start with 3-5 basic blocks, expand gradually
- Ensure smooth drag & drop experience
- Consider localStorage limitations for images
- Implement progressive enhancement
- Focus on user experience over features
- Ensure accessibility for all blocks

## Comparison with Rich Text Editor
The block editor should offer:
- More flexible layouts
- Better content structure
- Easier rearrangement
- More visual variety
- Component-based approach
- Better mobile content creation

## Completion Criteria
- Block editor fully functional
- At least 10 block types implemented
- Drag & drop working smoothly
- Block templates available
- Auto-save functioning
- Integration with existing blog system
- Testing checklist completed
- Performance optimized

## Output Documentation
Upon completion, update this file with:
- Actual implementation details
- Block types implemented
- Performance metrics
- User feedback points
- Future enhancement ideas
- Comparison notes with rich text editor