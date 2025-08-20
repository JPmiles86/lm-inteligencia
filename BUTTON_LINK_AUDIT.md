# Button and Link Audit - Remove All /hotels References

## Problem Statement
Some buttons and links still use the old `/hotels/` prefix instead of clean URLs on the hospitality subdomain.

## Known Issue
- Service cards "Learn More" buttons go to `/hotels/services`
- Need to check ALL buttons and links throughout the app

## Areas to Audit

### 1. Homepage Components
- [ ] Hero section buttons
- [ ] Service cards "Learn More" buttons
- [ ] Testimonial section links
- [ ] Video CTA section buttons
- [ ] Contact section buttons

### 2. Footer
- [ ] All service links
- [ ] Industry links
- [ ] Contact links
- [ ] Social media links

### 3. Individual Pages
- [ ] Services page - all buttons and links
- [ ] About page - all CTAs and links
- [ ] Case Studies page - all project links
- [ ] Blog listing page - all blog post links
- [ ] Blog post page - related posts, CTAs
- [ ] Contact page - all links

### 4. Components to Check
- ServicesSection.tsx
- HeroSection.tsx
- TestimonialsSection.tsx
- VideoCTASection.tsx
- Footer.tsx
- All page components

## Expected Behavior
On `hospitality.inteligenciadm.com`:
- ALL links should use clean paths without `/hotels`
- Examples:
  - `/services` NOT `/hotels/services`
  - `/about` NOT `/hotels/about`
  - `/contact` NOT `/hotels/contact`

## Investigation Results

### Comprehensive Search Complete
- Searched entire codebase for `/hotels` references using grep
- Analyzed key component files and configuration files
- Identified critical issues in industry configuration file

### Key Findings
1. **Main Issue**: `src/config/industry-configs.ts` contains hardcoded `/hotels` paths in:
   - Service `learnMoreLink` properties (7 occurrences)
   - VideoCTA `ctaLink` property (1 occurrence)
   
2. **Components Are Clean**: 
   - `ServicesSection.tsx` uses dynamic `industryPath` parameter correctly
   - `HeroSection.tsx` uses dynamic URL construction
   - `Footer.tsx` implements subdomain detection and URL prefix logic
   - No hardcoded `/hotels` paths found in main component files

3. **URL Generation**: 
   - Existing `subdomainDetection.ts` has helper functions but lacks subdomain-aware URL construction
   - `domainRedirect.ts` has `getCurrentSubdomain()` function for detection
   - Footer.tsx shows correct pattern for subdomain-aware URL generation

### Root Cause Analysis
The issue is in the **configuration data**, not the components. The service configuration contains hardcoded `/hotels/services#anchor` links that should be dynamically generated based on current context.

## Files That Need Fixing

### Critical Priority
1. **`/Users/jpmiles/lm-inteligencia/src/config/industry-configs.ts`**
   - Lines 53, 61, 69, 77, 85, 93, 101: Service `learnMoreLink` properties
   - Line 144: VideoCTA `ctaLink` property
   - **Impact**: All "Learn More" buttons on service cards use hardcoded `/hotels` paths
   - **Fix**: Replace with dynamic URL generation or relative paths

### Additional Files Checked (Clean)
- `/Users/jpmiles/lm-inteligencia/src/components/sections/ServicesSection.tsx` - ✅ Uses dynamic `industryPath`
- `/Users/jpmiles/lm-inteligencia/src/components/sections/HeroSection.tsx` - ✅ Uses dynamic URL construction  
- `/Users/jpmiles/lm-inteligencia/src/components/layout/Footer.tsx` - ✅ Implements subdomain-aware URLs
- All page components in `src/components/pages/` - ✅ No hardcoded `/hotels` references found

## Implementation Progress

### Phase 1: Configuration Fix ✅ COMPLETED
- [x] Identify hardcoded `/hotels` references in industry-configs.ts
- [x] Create subdomain-aware URL helper function (`src/utils/urlHelpers.ts`)
- [x] Replace hardcoded paths with dynamic URL generation
- [x] Update service learnMoreLink properties (7 fixes completed):
  - Google Ads: `/hotels/services#google-ads` → `/services#google-ads`
  - Meta Advertising: `/hotels/services#meta-advertising` → `/services#meta-advertising`  
  - Email Marketing: `/hotels/services#email-marketing` → `/services#email-marketing`
  - Strategy Consulting: `/hotels/services#strategy-consulting` → `/services#strategy-consulting` (2 instances)
  - Event Campaigns: `/hotels/services#event-campaigns` → `/services#event-campaigns`
  - Restaurant Marketing: `/hotels/services#restaurant-marketing` → `/services#restaurant-marketing`
- [x] Update VideoCTA ctaLink property: `/hotels/contact` → `/contact`

### Phase 2: Component Updates ✅ COMPLETED
- [x] **SharedIndustryLayout.tsx**: Added subdomain detection for industryPath
- [x] **UnifiedInteligenciaApp.tsx**: Added subdomain detection for industryPath  
- [x] **VideoCTASection.tsx**: Added industryPath prop support for dynamic URL generation
- [x] **ServicesSection.tsx**: Made mobile/desktop link handling consistent with industryPath
- [x] **IndustryPage.tsx**: Added useIndustryContext to access industryPath and pass to components

### Phase 3: Verification ⏳ READY FOR TESTING
- [ ] Test service card "Learn More" buttons on hospitality subdomain
- [ ] Test video CTA button navigation  
- [ ] Verify all URLs use clean paths (no `/hotels` prefix)
- [ ] Test on both main domain and subdomain contexts

## ✅ FIXES IMPLEMENTED

### Core Issue Resolution
**Root Cause**: Hardcoded `/hotels` paths in configuration data instead of relative paths
**Solution**: Convert to relative paths + dynamic industryPath handling based on subdomain detection

### Files Modified
1. **`src/config/industry-configs.ts`** - 8 hardcoded paths fixed to relative paths
2. **`src/components/layout/SharedIndustryLayout.tsx`** - Added subdomain-aware industryPath
3. **`src/components/layout/UnifiedInteligenciaApp.tsx`** - Added subdomain-aware industryPath
4. **`src/components/sections/VideoCTASection.tsx`** - Added industryPath prop support
5. **`src/components/sections/ServicesSection.tsx`** - Fixed mobile version consistency
6. **`src/components/pages/IndustryPage.tsx`** - Added industryPath context usage
7. **`src/utils/urlHelpers.ts`** - Created subdomain-aware URL helper functions

### URL Behavior After Fix
**On `hospitality.inteligenciadm.com`:**
- ✅ Service "Learn More" buttons → `/services#anchor`
- ✅ Video CTA button → `/contact`
- ✅ All navigation uses clean paths without `/hotels` prefix

**On main domain or other contexts:**
- ✅ Service "Learn More" buttons → `/hotels/services#anchor`
- ✅ Video CTA button → `/hotels/contact`
- ✅ Industry-prefixed paths maintained for proper routing