# CRITICAL HANDOFF DOCUMENT - Inteligencia Website

## 🚨 CRITICAL ISSUES TO FIX IMMEDIATELY

### 1. **VideoCTASection Breaking the Site**
**Error**: `useIndustryContext must be used within IndustryContext.Provider`
**Cause**: Sub-Agent 3 changed VideoCTASection to use context but it's not wrapped properly
**Fix**: 
- Option 1: Revert VideoCTASection to NOT use context
- Option 2: Pass config as props instead
- File: `src/components/sections/VideoCTASection.tsx`

### 2. **Services Page Content Overload**
**Current State**: MASSIVE wall of text with individual service pricing
**Should Be**: Simple, clean overview with package pricing

**Client's Original Pricing Structure**:
- All services INCLUDED in each package
- Starter: $1,500/month (includes all services)
- Growth: $3,000/month (includes all services)
- Pro+: $5,500+/month (includes all services)

**NOT**: Separate $1,500-$5,500 pricing for EACH service

### 3. **Missing Footers**
Footers disappeared from all pages - need to be restored

## Current Architecture Overview

### Navigation Flow
```
/ (Landing with 4 industries)
├── /hotels (Industry homepage with scroll sections)
├── /hotels/services (Dedicated services page)
├── /hotels/about (About page)
├── /hotels/case-studies (Case studies page)
└── /hotels/contact (Contact page)
```

### Key Components
- `UnifiedInteligenciaApp.tsx` - Main app orchestrator
- `LandingArea` - Handles landing page states
- `IndustryNavbar` - Navigation (recently updated)
- `PageWrapper` - Provides context to pages

## Services Page Fixes Needed

### 1. **Simplify Content Structure**
Current: 5 detailed services × 3 pricing tiers each = 15 pricing options!
Needed: 3 simple packages that include all services

### 2. **Reduce Text by 80%**
- Remove "Our Process" sections
- Remove individual service pricing
- Keep only essential benefits
- One paragraph per service MAX

### 3. **Fix Package Presentation**
```
Starter ($1,500/month)
- ALL marketing services included
- Best for: Small businesses
- [List what's included]

Growth ($3,000/month)  
- ALL marketing services included
- Best for: Growing businesses
- [List what's included]

Pro+ ($5,500+/month)
- ALL marketing services included
- Best for: Established businesses
- [List what's included]
```

## Content Source Verification Needed

Check `src/config/industry-configs.ts`:
- Does `servicesPageContent` exist for each industry?
- Is ALL the services page content coming from there?
- Or is there hardcoded content in ServicesPage.tsx?

## Recommended Sub-Agent Tasks

### Sub-Agent 1: Fix VideoCTASection Error
1. Remove context usage from VideoCTASection
2. Pass videoCTA config as props from parent
3. Test that homepage loads without errors

### Sub-Agent 2: Simplify Services Page
1. Reduce content by 80%
2. Fix pricing to show packages, not individual services
3. Ensure ALL content comes from config
4. Apply "less is more" principle

### Sub-Agent 3: Restore Footers
1. Check why footers are missing
2. Add footer to all pages
3. Ensure footer uses config content

## Key Files to Review
- `/src/components/sections/VideoCTASection.tsx` - BROKEN
- `/src/components/pages/ServicesPage.tsx` - Too much content
- `/src/config/industry-configs.ts` - Verify content source
- `/src/components/layout/UnifiedInteligenciaApp.tsx` - Main app

## Testing Checklist
- [ ] Homepage loads without errors
- [ ] Can navigate to all pages
- [ ] Services page shows simple package pricing
- [ ] Footer appears on all pages
- [ ] All content from configs (not hardcoded)

## REMEMBER
- Work only in `/clients/laurie-inteligencia`
- Create .md files for all documentation
- Client wants SIMPLE, MINIMAL content
- "Less is more" - reduce, don't add