# Services Implementation Plan

## Issues to Fix:

### 1. **Pricing Standardization** (Priority: HIGH)
Current: Varies by industry (e.g., Hotels: $2,500/$7,500/$15,000)
Target: Client's original spec - $1,500/$3,000/$5,500+ across ALL industries

### 2. **Navigation Behavior** (Priority: HIGH)
Issue: Services link sometimes scrolls, sometimes navigates
Fix: ALWAYS navigate to /industry/services page

### 3. **Services Page CTAs** (Priority: MEDIUM)
- Remove "View services below" button (redundant)
- Move "Get a free consult" CTA to bottom of page after services

### 4. **Content Migration** (Priority: MEDIUM)
- Move hardcoded fallback content to configs
- Remove complex acronyms
- Implement "less is more" approach

### 5. **Add Missing Services** (Priority: LOW)
Add the optional add-ons from client spec:
- Landing Page Build: $700
- Email Funnel Setup: $950
- Ad Creative Design: $250/ad set
- Audit & Strategy Session (90 mins): $399

## Sub-Agent Assignments:

### Sub-Agent 1: Fix Pricing & Add Services
1. Update all industry configs to use client's original pricing
2. Add optional add-on services section
3. Ensure pricing is consistent across all 4 industries
4. Document changes in PRICING_STANDARDIZATION.md

### Sub-Agent 2: Fix Navigation & CTAs
1. Update IndustryNavbar to always navigate to services page
2. Remove scroll behavior for services link
3. Fix services page CTAs:
   - Remove "View services below" button
   - Move main CTA to bottom
4. Document in NAVIGATION_FIXES.md

### Sub-Agent 3: Content Simplification
1. Move hardcoded fallbacks to config files
2. Review all content for complex acronyms
3. Simplify language while maintaining professionalism
4. Apply "less is more" principle
5. Document in CONTENT_SIMPLIFICATION.md

## Key Guidelines for All Agents:
- Work only in `/Users/jpmiles/laurie-meiring-website/clients/laurie-inteligencia`
- Create .md files for ALL documentation
- Test changes thoroughly
- Keep content accessible to "mom-and-pop" businesses
- Maintain AI/tech focus without overwhelming