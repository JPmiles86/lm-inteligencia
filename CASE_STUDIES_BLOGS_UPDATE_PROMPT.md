# Case Studies and Blogs Update Prompt for Sonnet Agent

## Context
You are tasked with updating case studies and blog content for the Inteligencia marketing platform, which has recently undergone a vertical restructuring. The platform has migrated from 4 old verticals to 4 new verticals.

## Vertical Migration Overview

### Old Structure → New Structure
1. **Hotels + Restaurants** → **Hospitality & Lifestyle** (/hospitality)
   - Hotels content is preserved and approved by client
   - Restaurant content merged into hospitality
   
2. **Healthcare (Dental)** → **Health & Wellness** (/health)
   - Expanded from dental-only to full health & wellness
   - Now includes: dentistry, health clinics, retreats, fitness, mental health

3. **Athletics** → **Sport, Media & Events** (/sports)
   - Expanded to include media companies and event organizers
   - Now includes: pickleball, events, tournaments, sponsorships, media

4. **[NEW]** → **Tech, AI & Digital Innovation** (/tech)
   - Completely new vertical
   - Includes: SaaS, AI startups, MarTech, platforms, future-forward brands

## Critical Requirements

### For Hospitality Case Studies
The hospitality vertical has 3 real client testimonials that need matching case studies:

1. **40 Acres Farmhouse** (Rodney Knotts, Owner)
   - Location: Magaliesburg, South Africa
   - Website: https://www.40acres.co.za/
   - Success: Reduced OTA reliance, implemented Book Direct Strategy
   
2. **Casa Salita and Suegra** (Jason Adelman, Owner)
   - Location: Sayulita, Mexico
   - Website: https://www.sayulitalife.com/salita-6br
   - Success: 53% occupancy increase in two months
   
3. **Hotel Amavi** (Stephanie Sitt, Owner)
   - Location: Jaco, Costa Rica
   - Website: https://hotelamavi.com/
   - Success: Major spike in direct bookings, 50% reduction in cost-per-booking

**IMPORTANT**: Replace the existing generic hospitality case studies (Oceanview Resort Miami, Paradise Inn Boutique Hotel) with case studies based on these REAL clients.

## Your Tasks

### 1. Update Case Studies Configuration
File: `src/config/industry-configs.ts`

For each vertical, ensure there are 2-3 case studies following this structure:
```typescript
{
  id: 'unique-identifier',
  title: 'Compelling Case Study Title',
  industry: 'Industry Name',
  client: 'Client Company Name',
  challenge: 'Detailed challenge description',
  solution: 'Comprehensive solution description',
  results: [
    {
      metric: 'Metric Name',
      value: '+XX%',
      description: 'Description of the achievement'
    },
    // 3 metrics total
  ],
  testimonial: {
    quote: "Client testimonial quote",
    author: 'Person Name',
    position: 'Title',
    company: 'Company Name'
  },
  image: 'https://images.unsplash.com/[appropriate-image]',
  tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4']
}
```

### 2. Case Study Requirements by Vertical

#### Hospitality & Lifestyle (Priority: HIGH)
- Create 3 case studies based on the REAL clients above
- Use actual testimonial quotes from the config
- Expand on their success stories with realistic metrics
- Keep the focus on hospitality (hotels, resorts, restaurants)

#### Health & Wellness
- Update existing healthcare case studies to reflect broader health & wellness focus
- Include examples from: dental practices, wellness retreats, fitness facilities, health clinics
- Maintain HIPAA compliance messaging

#### Sport, Media & Events
- Update existing athletics case studies to include media and events
- Add examples from: sports facilities, tournaments, media companies, event organizers
- Focus on community building and event success

#### Tech, AI & Digital Innovation (NEW)
- Create 2-3 brand new case studies
- Focus on: SaaS companies, AI startups, B2B tech platforms
- Use metrics like ARR growth, CAC reduction, user acquisition

### 3. Blog Content Updates
File: `src/data/blogData.ts`

The blog system exists with 8+ sample blog posts in `blogData.ts`. You need to:

1. **Update blog categories** to match new verticals:
   ```typescript
   export const blogCategories = [
     'All',
     'Hospitality Marketing',  // was 'Hotel Marketing' and 'Restaurant Marketing'
     'Health & Wellness Marketing',  // was 'Healthcare Marketing'
     'Tech & AI Marketing',  // NEW
     'Sports & Media Marketing',  // was 'Sports Marketing'
     'Digital Marketing Tips',
     'Industry Trends'
   ];
   ```

2. **Update existing blog posts**:
   - Change categories to match new structure
   - Update any references to old vertical names
   - Ensure content aligns with expanded vertical scope

3. **Add new blog posts** for Tech vertical (2-3 posts):
   - Topics: SaaS growth, B2B demand generation, AI marketing strategies
   - Follow the existing blog post structure
   - Use appropriate tech industry examples

4. **Review and update** all blog content to ensure:
   - No references to "foodservice" (should be hospitality)
   - Healthcare expanded to health & wellness
   - Athletics expanded to sports & media

### 4. Content Guidelines

#### DO:
- Use realistic, industry-specific metrics
- Include location and company details for real clients
- Match the professional tone of existing content
- Ensure all content aligns with new vertical positioning
- Use high-quality Unsplash images with proper dimensions

#### DON'T:
- Change any approved hospitality hotel content (except case studies)
- Use generic or vague metrics
- Create unrealistic success stories
- Mix industries within a single case study
- Forget to update tags and categories

### 5. Technical Implementation

1. All case studies must be in `industry-configs.ts` under each vertical's configuration
2. Ensure TypeScript types are satisfied (use existing case studies as templates)
3. Maintain consistent formatting and structure
4. Test that all image URLs are valid
5. Verify all client websites are correct (especially for real clients)

### 6. Priority Order

1. **HIGHEST**: Create real case studies for hospitality (40 Acres, Casa Salita, Hotel Amavi)
2. **HIGH**: Create new tech vertical case studies
3. **MEDIUM**: Update health & wellness case studies
4. **MEDIUM**: Update sport, media & events case studies
5. **LOW**: Update/create blog content

## Validation Checklist

Before completing:
- [ ] Each vertical has 2-3 case studies
- [ ] Hospitality has case studies for real clients
- [ ] All case studies follow the exact TypeScript structure
- [ ] Metrics are realistic and industry-appropriate
- [ ] Images are high-quality and relevant
- [ ] Tags reflect new vertical structure
- [ ] No references to old vertical names remain
- [ ] Blog categories updated to new verticals

## Current Case Study Status

Each vertical currently has 2 case studies, but they need updating:
- **Hospitality**: Has generic case studies that MUST be replaced with real clients
- **Health & Wellness**: Has healthcare-focused studies that need wellness expansion
- **Tech**: Has placeholder case studies that need real tech examples
- **Sports**: Has athletics studies that need media/events expansion

## Example: Real Client Case Study

Here's how to transform the 40 Acres testimonial into a case study:

```typescript
{
  id: 'forty-acres-farmhouse',
  title: '40 Acres Farmhouse Slashes OTA Commissions by 40%',
  industry: 'Hospitality & Lifestyle',
  client: '40 Acres Farmhouse',
  challenge: 'This luxury farmhouse retreat in South Africa was heavily dependent on OTAs, with commission fees eating into profitability. They needed to build direct booking channels while maintaining occupancy rates.',
  solution: 'Implemented a comprehensive digital strategy including Google Hotel Ads, targeted social media campaigns for the local luxury travel market, and a sophisticated email nurture sequence for past guests. Built a "Book Direct" incentive program with exclusive perks.',
  results: [
    {
      metric: 'OTA Commission Savings',
      value: '40%',
      description: 'Reduction in total OTA commission fees'
    },
    {
      metric: 'Direct Bookings',
      value: '+65%',
      description: 'Increase in direct reservation revenue'
    },
    {
      metric: 'Repeat Guest Rate',
      value: '+45%',
      description: 'Growth in returning guest bookings'
    }
  ],
  testimonial: {
    quote: "Laurie helped us build out our online channels, ramping up our initial demand, following this we were able to reduce OTA reliance and implement a Book Direct Strategy that saved us a ton in OTA Commissions. Laurie is great to work with, upbeat, efficient and most importantly, he gets results",
    author: 'Rodney Knotts',
    position: 'Owner',
    company: '40 Acres Farmhouse'
  },
  image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
  tags: ['Boutique Hotels', 'Direct Bookings', 'OTA Optimization', 'South Africa']
}
```

Good luck! Remember to maintain the high quality and professionalism of the existing platform while bringing fresh, relevant content to each vertical.