# Vertical Migration Plan - Inteligencia

## Overview
This document outlines the comprehensive plan to migrate from the current 4 verticals to the new 4 verticals, ensuring all match the Hotels vertical standard.

## New Vertical Structure

### 1. Hospitality & Lifestyle
- **Primary URL**: `/hospitality`
- **Industries**: Hotels • Restaurants • Travel & Tourism
- **Target Clients**: Hotel Groups, Boutique Resorts, Tourism Boards, Chef-Led Restaurants, Hospitality Tech Platforms
- **Migration**: Merge current Hotels + Restaurants verticals

### 2. Health & Wellness  
- **Primary URL**: `/health`
- **Industries**: Dentistry • Health Clinics • Retreats • Fitness & Mental Health
- **Target Clients**: Private Clinics, Wellness Resorts, Therapists, Dentists, Health Tech
- **Migration**: Expand current Healthcare vertical

### 3. Tech, AI & Digital Innovation
- **Primary URL**: `/tech`
- **Industries**: SaaS • AI Startups • Martech • Platforms • Future-Forward Brands
- **Target Clients**: AI/ML Companies, Tech-Enabled Services, No-Code Tools, Future-of-Work Platforms, Crypto/Blockchain
- **Migration**: New vertical (no current equivalent)

### 4. Sport, Media & Events
- **Primary URL**: `/sports`
- **Industries**: Pickleball • Events • Tournaments • Sponsorships • Media
- **Target Clients**: Sport Brands, Fitness Tech, Tournaments, Niche Events, Media-Led Summits
- **Migration**: Update current Athletics vertical

## URL Structure Recommendations

### Primary URLs (Clean and Professional)
```
/hospitality - Hospitality & Lifestyle
/health      - Health & Wellness  
/tech        - Tech, AI & Digital Innovation
/sports      - Sport, Media & Events
```

### URL Mapping Updates Required
```typescript
// Current → New
'/hotels'      → '/hospitality'
'/restaurants' → '/hospitality' (merged)
'/dental'      → '/health'
'/sports'      → '/sports' (stays same)
```

## Implementation Standards (Based on Hotels Vertical)

### Each Vertical Must Have:

#### 1. **7 Core Services** (Industry-Specific)
- Each with icon, description, and key benefit
- 4 feature bullets per service
- Learn more links to services page sections

#### 2. **Pricing Structure**
- 3 tiers with industry-specific names
- Starter: $1,500/month
- Growth: $3,000/month (Recommended)
- Pro+: $5,500/month+
- Add-on section with 4+ a la carte options

#### 3. **Content Requirements**
- Hero with video backgrounds (desktop + mobile)
- 3+ testimonials with company URLs
- 2+ detailed case studies
- 4+ FAQ questions
- Office hours
- Detailed contact form options

#### 4. **Services Page Structure**
- Gradient hero section
- SimplifiedPricingSection early in page
- 7 services in grid format
- Bottom CTA section

## High-Level Task Breakdown

### Phase 1: Documentation & Planning
1. ✅ Create migration plan (this document)
2. Define content templates for each vertical
3. Map existing content to new verticals
4. Identify content gaps

### Phase 2: Code Structure Updates
1. Update `industryMapping.ts` with new URLs
2. Update `LandingArea.tsx` with new vertical names
3. Create new configurations in `industry-configs.ts`
4. Update navigation and routing

### Phase 3: Content Migration (Per Vertical)
1. **Hospitality & Lifestyle**
   - Merge Hotels + Restaurants content
   - Add Travel & Tourism services
   - Update pricing names
   - Add missing services (currently has 7, needs refinement)

2. **Health & Wellness**
   - Expand beyond dental to full health services
   - Add retreat and wellness services
   - Create 7 comprehensive services
   - Add add-on pricing section

3. **Tech, AI & Digital Innovation**
   - Create entirely new content
   - Define 7 tech-specific services
   - Create tech-focused testimonials/case studies
   - Tech-specific pricing names

4. **Sport, Media & Events**
   - Expand beyond athletics
   - Add media and event services
   - Update from 3 to 7 services
   - Add add-on pricing

### Phase 4: Visual Assets
1. Service icons/images for each vertical
2. Case study images
3. Video backgrounds (if available)

### Phase 5: Testing & Validation
1. URL redirect testing
2. Content review
3. Mobile responsiveness
4. Cross-browser testing

## Subagent Task Distribution

### Subagent 1: Code Structure Updates
**Files to modify:**
- `src/utils/industryMapping.ts`
- `src/components/LandingArea/LandingArea.tsx`
- `src/components/layout/UnifiedInteligenciaApp.tsx`

**Tasks:**
1. Update URL mappings
2. Update landing page industries array
3. Ensure routing works correctly
4. Add redirects from old URLs

### Subagent 2: Hospitality & Health Verticals
**Files to modify:**
- `src/config/industry-configs.ts` (hospitality section)
- `src/config/industry-configs.ts` (health section)

**Tasks:**
1. Merge Hotels + Restaurants into Hospitality
2. Expand Healthcare to Health & Wellness
3. Ensure 7 services each
4. Add add-on pricing sections
5. Update all content to match Hotels standard

### Subagent 3: Tech & Sports Verticals
**Files to modify:**
- `src/config/industry-configs.ts` (tech section - new)
- `src/config/industry-configs.ts` (sports section)

**Tasks:**
1. Create new Tech vertical configuration
2. Update Sports vertical with expanded scope
3. Ensure 7 services each
4. Add add-on pricing sections
5. Create industry-specific content

## Content Templates

### Service Template (7 per vertical)
```typescript
{
  title: '[Service Name]',
  description: '[Brief description of service value]',
  keyBenefit: '[Specific measurable outcome]',
  icon: '[emoji or icon name]',
  image: '/images/[ServiceImage].png',
  learnMoreLink: '/[vertical]/services#[service-id]',
}
```

### Pricing Add-Ons Template
```typescript
addOns: [
  { name: '[Service Name]', price: '$XXX' },
  { name: '[Service Name]', price: '$XXX' },
  { name: '[Service Name]', price: '$XXX' },
  { name: '[Service Name]', price: '$XXX' },
],
addOnsTitle: 'Optional Add-Ons (A La Carte)',
```

### Pricing Tier Names Template
- Starter [Industry]: $1,500/month
- Growth [Industry]: $3,000/month  
- Pro+ [Industry]: $5,500/month+

## Success Criteria
1. All 4 verticals have 7 services displayed
2. All verticals have add-on pricing sections
3. All verticals have industry-specific content
4. Services page structure matches Hotels standard
5. URLs are clean and professional
6. Old URLs redirect properly
7. Content depth matches Hotels vertical

## Risk Mitigation
1. Keep backup of current configuration
2. Test thoroughly in development
3. Implement redirects for SEO preservation
4. Review all content for accuracy
5. Validate mobile experience

## Next Steps
1. Review and approve this plan
2. Create detailed content for each vertical
3. Assign tasks to subagents
4. Implement in phases
5. Test thoroughly
6. Deploy with monitoring