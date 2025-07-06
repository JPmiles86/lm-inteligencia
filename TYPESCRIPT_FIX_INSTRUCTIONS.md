# TypeScript Error Fix Instructions

## CRITICAL RULES - NEVER BREAK THESE
1. **NEVER DELETE FUNCTIONALITY** - If code does something, preserve that behavior
2. **NEVER USE 'any' AS A QUICK FIX** - Properly type everything
3. **NEVER SUPPRESS ERRORS** - Fix them properly with correct types
4. **TEST EACH FIX** - Ensure functionality remains intact
5. **UNDERSTAND BEFORE FIXING** - Know why the error exists and what the code does
6. **DELETION REQUIRES APPROVAL** - If you feel like something needs to be deleted (duplicate function, old/outdated/unused code), you MUST:
   - Document it in your notes with full explanation
   - Explain why it should be deleted
   - Explain potential risks of deletion
   - Wait for user confirmation before deleting
   - NEVER delete without explicit approval

## Error Categories and Fix Strategies

### 1. Missing 'main' Property in IndustryType Records

**Files Affected:**
- SeamlessIndustrySelectorFixed.tsx
- TransitionManager.tsx
- UnifiedInteligenciaApp.tsx
- UnifiedPageHeader.tsx

**Current Issue:**
Objects typed as `Record<IndustryType, string>` are missing the 'main' entry.

**PROPER FIX:**
1. First, understand what 'main' represents in the context
2. Check if 'main' should have a color/value or if it's a special case
3. If 'main' is not applicable for these mappings, create a new type:
   ```typescript
   type IndustryTypeWithoutMain = Exclude<IndustryType, 'main'>;
   ```
4. Use `Record<IndustryTypeWithoutMain, string>` for these objects
5. DO NOT just add a dummy 'main' value

### 2. Component Prop Mismatches

**Files Affected:**
- SharedIndustryLayout.tsx (Footer missing selectedIndustry)
- UnifiedInteligenciaApp.tsx (BlogPostPage receiving unexpected slug)
- IndustryRoutes.tsx (Pages receiving unexpected config)

**PROPER FIX:**
1. Check what props each component actually accepts
2. For Footer: Add the selectedIndustry prop to its interface
3. For BlogPostPage: Check if it should accept slug or get it from useParams
4. For page components: Verify if they need config or get it from context
5. Update component interfaces to match usage
6. NEVER remove prop passing if it might break functionality

### 3. Type Indexing Errors (IndustryNames[config.industry])

**Files Affected:**
- AboutPage.tsx
- BlogListingPage.tsx
- BlogPostPage.tsx
- CaseStudiesPage.tsx
- SeamlessIndustryPage.tsx
- ServicesPage.tsx

**PROPER FIX:**
1. Add type guard to ensure industry is valid:
   ```typescript
   const industryName = config.industry in IndustryNames 
     ? IndustryNames[config.industry as keyof typeof IndustryNames]
     : 'Default Name';
   ```
2. Or create a helper function:
   ```typescript
   function getIndustryName(industry: IndustryType): string {
     return IndustryNames[industry as keyof typeof IndustryNames] || 'Default';
   }
   ```

### 4. Implicit 'any' Type Parameters

**Files Affected:**
- ContactPage.tsx
- PricingPage.tsx
- ServicesPage.tsx
- SimplifiedPricingSection.tsx

**PROPER FIX:**
1. Add explicit types to all map callbacks:
   ```typescript
   // Instead of: features.map(feature => ...)
   // Use: features.map((feature: FeatureType) => ...)
   ```
2. Define interfaces for all data structures being mapped
3. Import types from appropriate type definition files

### 5. Possibly Undefined Values

**Files Affected:**
- ServicesSection.tsx (images)
- blogService.ts (various string assignments)
- BlogPostPage.tsx (object access)

**PROPER FIX:**
1. Add null/undefined checks:
   ```typescript
   // Instead of: images.main
   // Use: images?.main || defaultImage
   ```
2. For required values, add validation:
   ```typescript
   if (!images) {
     throw new Error('Images are required for ServicesSection');
   }
   ```
3. Use optional chaining and nullish coalescing

### 6. Missing Return Values

**Files Affected:**
- IndustryNavbar.tsx
- UnifiedInteligenciaApp.tsx

**PROPER FIX:**
1. Ensure all code paths return a value
2. Add explicit return statements
3. For switch statements, add default cases
4. For conditional renders, ensure all branches return JSX or null

### 7. Missing Property on IndustryConfig

**File Affected:**
- UnifiedInteligenciaApp.tsx (caseStudies property)

**PROPER FIX:**
1. Check if caseStudies should exist on IndustryConfig type
2. If yes, add it to the interface
3. If no, remove the reference or use optional chaining
4. Check all industry config files to ensure consistency

## Fix Order

1. **Start with type definitions** - Fix IndustryType and IndustryConfig interfaces
2. **Fix component interfaces** - Ensure props match usage
3. **Add type guards** - Make indexing safe
4. **Add explicit types** - Remove implicit any
5. **Handle undefined cases** - Add proper null checks
6. **Fix return paths** - Ensure all functions return properly

## Testing Each Fix

After each fix:
1. Run `npm run type-check` to see remaining errors
2. Run `npm run dev` and test the functionality
3. Click through the affected pages/components
4. Ensure no runtime errors in console
5. Document what was changed and why

## Communication Protocol

1. Create `TYPESCRIPT_FIX_AGENT_NOTES.md` for findings
2. Document each error investigated
3. Note the fix applied and reasoning
4. Flag any concerns or uncertainties
5. List any functionality that might be affected


**If you feel like something needs to be deleted, be it a duplicate function, or old outdated or un-used code, you are required to confirm with the user before deleting. Explain the reasons why and why we may not want to delete the code. If the user agrees, you can delete it.**