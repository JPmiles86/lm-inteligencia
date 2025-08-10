# Migration Summary - Quick Reference

## What We're Doing

Migrating from 4 verticals to 4 NEW verticals, ensuring all match the Hotels standard:

| Current | New | URL |
|---------|-----|-----|
| Hotels + Restaurants | Hospitality & Lifestyle | /hospitality |
| Healthcare | Health & Wellness | /health |
| [NEW] | Tech, AI & Digital Innovation | /tech |
| Athletics | Sport, Media & Events | /sports |

## Key Standards (From Hotels)

✅ **Each vertical MUST have:**
- 7 core services (not 3!)
- Add-on pricing section (A La Carte)
- SimplifiedPricingSection on services page
- Industry-specific pricing names
- Video backgrounds (optional)
- 3+ testimonials
- 2+ case studies
- 4+ FAQs

## Files That Need Updates

### Phase 1 - Structure
1. `src/types/Industry.ts` - Add 'tech' type, remove 'foodservice'
2. `src/utils/industryMapping.ts` - Update URL mappings
3. `src/components/LandingArea/LandingArea.tsx` - Update industries array

### Phase 2 - Content  
4. `src/config/industry-configs.ts` - Update all 4 vertical configurations
5. `src/config/universal-content.ts` - Update footer industries

### Phase 3 - Services
6. `src/components/pages/ServicesPage.tsx` - Ensure handles all verticals

## Subagent Assignments

**Subagent 1**: Code Structure & Routing
- Update types and mappings
- Fix navigation and URLs
- Ensure redirects work

**Subagent 2**: Hospitality & Health Content
- Merge Hotels + Restaurants content
- Expand Healthcare to Health & Wellness
- Ensure 7 services each with add-ons

**Subagent 3**: Tech & Sports Content  
- Create new Tech vertical from scratch
- Update Sports with media/events
- Ensure 7 services each with add-ons

## Critical Success Factors

1. **Services**: All show 7 (not 3!)
2. **Pricing**: All have add-ons section
3. **Names**: Industry-specific, not generic
4. **Content**: Depth matches Hotels
5. **URLs**: Clean and professional
6. **Redirects**: Old URLs work

## Quick Wins

These should be easy fixes across all verticals:
- Add add-on pricing sections
- Update from 3 to 7 services display
- Standardize pricing tier names
- Add FAQs where missing

## Risks to Watch

- TypeScript errors from type changes
- Broken routes from URL updates
- Missing content for new Tech vertical
- SEO impact from URL changes

## Validation Checklist

Before considering complete:
- [ ] All verticals show 7 services
- [ ] All have add-on pricing
- [ ] Services page matches Hotels layout
- [ ] No TypeScript errors
- [ ] All URLs work correctly
- [ ] Mobile responsive
- [ ] Content is industry-appropriate

## Ready to Execute?

When you say "go", we'll deploy 3 subagents to implement these changes in parallel. I'll then review their work to ensure everything meets the Hotels standard.