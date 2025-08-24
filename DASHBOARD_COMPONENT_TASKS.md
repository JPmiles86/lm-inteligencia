# Dashboard and Component Extraction Tasks

## Assignment Date: 2024-12-23
## Assigned By: Main Orchestrator Agent
## Priority: High

## TASKS TO COMPLETE:

### 1. Fix Dashboard Blog Display
**Current Issue:** Dashboard is not showing the last 3 blog posts
**Required Actions:**
- Fix the AdminDashboard.tsx to properly fetch and display the 3 most recent blog posts
- Create proper blog post cards with:
  - Blog title
  - Excerpt (first 100 chars)
  - Publish date
  - Author
  - Edit button
  - Delete button with confirmation
- Remove the "Features" section that describes blog capabilities
- Style cards with brand colors (primary: purple, secondary: pink)

### 2. Extract Content Visibility Settings Component
**Current Issue:** Content Visibility Settings needs to be reusable across pages
**Required Actions:**
- Find the Content Visibility Settings in AdminDashboard.tsx
- Extract it into a separate component: `src/components/admin/shared/ContentVisibilitySettings.tsx`
- Make it fully self-contained with its own state management
- Import and use the new component in AdminDashboard.tsx
- Import and use the new component in Settings page (if Settings page exists)
- Document props interface clearly

### 3. Clean Up Dashboard Layout
**Required Actions:**
- Remove any remaining mentions of "Rich Text Editor" or "Block Editor"
- Ensure "Create New Blog Post" button is prominent
- Clean up any dead code or unused imports
- Make sure dashboard is responsive and looks good on mobile

## IMPORTANT NOTES:
- DO NOT create any new .md documentation files
- Follow existing code patterns and styles
- Use existing brand colors (primary/secondary)
- Ensure all TypeScript types are properly defined
- Test that blog posts actually display after changes

## Expected Deliverables:
1. Fixed dashboard showing 3 latest blog posts in cards
2. Extracted ContentVisibilitySettings component
3. Clean, working dashboard without editor references

## Status: ASSIGNED - Awaiting Completion