# Routing Fix Plan - Inteligencia Website

## Issues Identified:

1. **Incorrect industryPath**: Currently using full pathname instead of just industry root
   - Example: On `/restaurants/case-studies`, industryPath becomes `/restaurants/case-studies`
   - This causes links to become `/restaurants/case-studies/services` instead of `/restaurants/services`

2. **Navigation Not Working**: Pages exist but links aren't navigating properly

3. **Direct URL Access**: Going to `/contact` shows landing page instead of contact page

## Root Cause:
The `industryPath` in `SeamlessIndustryPage.tsx` is being set to `location.pathname` which includes the full path, not just the industry root.

## Fix Strategy:

### Phase 1: Fix industryPath Calculation
1. Update `SeamlessIndustryPage.tsx` to extract just the industry key
2. Pass correct industry root path to all sections
3. Ensure CTAs use the correct base path

### Phase 2: Fix Direct Route Access
1. Ensure routes like `/contact` redirect to industry-specific pages or show a proper error
2. Add catch-all routes for non-industry paths

### Phase 3: Test All Navigation
1. Test all CTAs on the seamless page
2. Test navbar links from different pages
3. Test direct URL access
4. Test industry switching

## Sub-Agent Tasks:

### Sub-Agent 1: Fix industryPath in SeamlessIndustryPage
- Extract industry key from pathname correctly
- Pass `/restaurants` not `/restaurants/case-studies` as industryPath
- Update all section components to receive correct path

### Sub-Agent 2: Fix Navigation Links
- Ensure all CTAs use absolute paths with industry prefix
- Fix any hardcoded links
- Verify IndustryNavbar works from all pages

### Sub-Agent 3: Add Route Guards
- Handle direct access to non-industry routes
- Add redirects or error pages for invalid routes
- Ensure seamless experience

## Expected Results:
- Clicking "View Case Studies" on `/restaurants` goes to `/restaurants/case-studies`
- Navbar links always go to correct industry-specific pages
- Direct URL access works for all valid routes
- Invalid routes show appropriate error or redirect