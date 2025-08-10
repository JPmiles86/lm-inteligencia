# URGENT SITE RESTRUCTURE PLAN
## Laurie Meiring Digital Marketing Website

### CURRENT ISSUES
1. **Missing Separate Pages**: Everything is crammed into single-page sections instead of proper pages
2. **Missing Core DM Content**: No detailed service descriptions for Google Ads, Meta Ads, Email Marketing, etc.
3. **No Blog System**: Blog infrastructure exists but isn't connected
4. **No Case Studies/Portfolio**: Critical for showcasing results
5. **Limited Navigation**: Only smooth scroll, no real page navigation

### IMMEDIATE IMPLEMENTATION PLAN

## Phase 1: Core Structure Fix (Priority: URGENT)

### 1. Update Routing Structure
From current single-page per vertical to proper multi-page:

```
Current:
/hotels (everything on one page)

New:
/hotels (homepage with key info)
/hotels/services (detailed services page)
/hotels/about (about & team page)
/hotels/contact (dedicated contact page)
/hotels/case-studies (portfolio)
/hotels/blog (blog listing)
/hotels/pricing (pricing packages)
```

### 2. Homepage Content Strategy
Each vertical homepage should have:
- **Hero**: Clear value proposition + CTA
- **Services Overview**: Brief intro with "Learn More" linking to services page
- **Social Proof**: 2-3 testimonials with link to full testimonials
- **Quick Contact**: Simple form with link to full contact page
- **Recent Results**: 2-3 case study previews

### 3. Services Page Content (CRITICAL)
Must include detailed pages for:
- **Google Ads Management**
  - Campaign types supported
  - Industries served
  - Expected results
  - Process overview
- **Meta Advertising**
  - Facebook & Instagram strategies
  - Creative approach
  - Targeting methods
- **Email Marketing & Funnels**
  - Automation capabilities
  - Funnel design
  - List management
- **Marketing Strategy Consulting**
  - Audit process
  - Strategic planning
  - Implementation support

### 4. Pricing Structure
Create dedicated pricing page with:
- Starter Package ($1,500/month)
- Growth Package ($3,000/month)
- Pro+ Package ($5,500+/month)
- Add-on services

## Phase 2: Content Implementation

### Sub-Agent Task Assignments

#### Sub-Agent 1: Routing & Navigation
1. Update App.tsx with new routing structure
2. Implement proper navigation component with:
   - Main nav: Home, Services, About, Case Studies, Blog, Contact, Pricing
   - Industry switcher (keep current dropdown)
3. Create route structure for all 4 verticals

#### Sub-Agent 2: Page Creation
1. Connect existing page components to routes
2. Create missing pages:
   - PricingPage.tsx
   - Individual service detail pages
3. Ensure responsive design on all pages

#### Sub-Agent 3: Content Population
1. Extract service details from original spec
2. Create content for each service page
3. Implement pricing packages from spec
4. Add team/about content

#### Sub-Agent 4: Homepage Optimization
1. Restructure homepage to show overview only
2. Add clear CTAs to deeper pages
3. Implement "Learn More" links throughout
4. Keep vertical-specific customization

## Phase 3: Polish & Launch

### Final Checklist
- [ ] All pages accessible via navigation
- [ ] Services properly explained with benefits
- [ ] Pricing clearly displayed
- [ ] Contact forms on appropriate pages
- [ ] Blog system connected (can be empty initially)
- [ ] Case studies page ready (even with placeholder content)
- [ ] Mobile responsive on all pages
- [ ] CTAs throughout site

### CRITICAL SUCCESS FACTORS
1. **User Journey**: Homepage → Service Interest → Detailed Info → Contact/Pricing
2. **Information Architecture**: Don't hide everything in one page
3. **Service Clarity**: Visitors must understand WHAT you offer
4. **Trust Building**: Case studies, testimonials, about page all build credibility

### TIMELINE
- **Day 1**: Fix routing structure and navigation
- **Day 2**: Create/connect all pages
- **Day 3**: Populate with content from spec
- **Day 4**: Testing and polish

This plan maintains the elegant vertical structure while adding the depth and navigation expected from a professional marketing agency website.