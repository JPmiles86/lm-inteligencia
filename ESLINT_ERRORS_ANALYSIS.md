# ESLint Errors Analysis - Complete List

## Summary: 43 Errors, 9 Warnings

### Critical Errors by File

#### 1. IndustryNavbar.tsx
- Line 48: React Hook "useIndustryContext" called conditionally
- Line 14: require() statement instead of import
- Line 12: Unexpected any type

#### 2. PageWrapper.tsx
- Line 11, 35: Unexpected any types (2 instances)
- Line 35, 37: React refresh warnings (exporting non-components)

#### 3. Admin Components - Type Safety Issues
**BlogEditor.tsx**
- Line 74: any type in event handler

**BlogList.tsx**
- Line 256, 287: any types in map functions
- Line 26-28: Unnecessary dependencies in useMemo

**BlogManagement/index.tsx**
- Line 28, 40: Unused variables (_post, _imageUrl)

**ContentEditor.tsx**
- Line 69, 91: any types
- Line 35: Missing dependency in useEffect

**BrandingPanel.tsx**
- Line 26, 473: any types

**ContactSettings.tsx**
- Line 27, 461: any types

**TypographyPanel.tsx**
- Line 24: any type

**SiteCustomization/index.tsx**
- Line 14: Unused variable _refreshTrigger

#### 4. Other Components
**Navbar.tsx**
- Line 15: any type

**TeamSection.tsx**
- Line 17: any type

**ManyChat.tsx**
- Line 13: any type

**SeamlessIndustryPage.tsx**
- Line 40: Unused variable

**Services/CsvImportService.ts**
- Line 180, 194: any types

**Services/ExportService.ts**
- Line 71: any type

**Old App files** (6 files with various issues)

### Error Categories Breakdown

1. **any types**: 23 instances
2. **Unused variables**: 8 instances
3. **React Hooks violations**: 4 instances
4. **React refresh warnings**: 4 instances
5. **require() statement**: 1 instance
6. **Missing dependencies**: 3 instances

### Priority Fixes

1. **React Hook conditional call** - Most critical, breaks React rules
2. **require() to import** - Simple modernization
3. **Unused variables** - Clean up code
4. **any types** - Requires proper type definitions
5. **React refresh warnings** - Code organization
6. **Hook dependencies** - Optimize performance