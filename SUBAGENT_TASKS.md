# Subagent Task Specifications

## Subagent 1: Code Structure & Routing Updates

### Primary Objective
Update all routing, URL mappings, and navigation to support the new 4-vertical structure.

### Files to Modify
1. `src/utils/industryMapping.ts`
2. `src/components/LandingArea/LandingArea.tsx`
3. `src/components/layout/UnifiedInteligenciaApp.tsx`
4. `src/config/universal-content.ts` (footer industries list)

### Specific Tasks

#### 1. Update `industryMapping.ts`
```typescript
// Update URL to industry mappings
export const urlToIndustryMap: Record<string, IndustryType> = {
  // Hospitality & Lifestyle
  'hospitality': 'hospitality',
  'hotels': 'hospitality', // redirect
  'restaurants': 'hospitality', // redirect
  
  // Health & Wellness
  'health': 'healthcare',
  'wellness': 'healthcare',
  'dental': 'healthcare', // redirect
  
  // Tech, AI & Digital Innovation
  'tech': 'tech', // NEW TYPE
  'technology': 'tech',
  'ai': 'tech',
  
  // Sport, Media & Events
  'sports': 'athletics',
  'sport': 'athletics',
  'media': 'athletics',
  'events': 'athletics',
};

// Update industry to URL mappings
export const industryToUrlMap: Record<IndustryType, string> = {
  'hospitality': 'hospitality',
  'healthcare': 'health',
  'tech': 'tech', // NEW
  'athletics': 'sports',
  'main': ''
};
```

#### 2. Update `LandingArea.tsx`
```typescript
const industries: Industry[] = [
  {
    industry: 'hospitality',
    title: 'hospitality & lifestyle',
    label: 'hotels • restaurants • travel & tourism'
  },
  {
    industry: 'healthcare',
    title: 'health & wellness',
    label: 'dentistry • health clinics • retreats • fitness'
  },
  {
    industry: 'tech', // NEW TYPE
    title: 'tech & AI',
    label: 'SaaS • AI startups • martech • platforms'
  },
  {
    industry: 'athletics',
    title: 'sport & media',
    label: 'pickleball • events • tournaments • media'
  }
];
```

#### 3. Update Type Definitions
Add 'tech' to IndustryType in `src/types/Industry.ts`

---

## Subagent 2: Hospitality & Health Verticals Content

### Primary Objective
Create comprehensive content for Hospitality & Lifestyle and Health & Wellness verticals, matching the Hotels standard.

### Files to Modify
- `src/config/industry-configs.ts` (hospitality and healthcare sections)

### Hospitality & Lifestyle Vertical

#### Hero Content
```typescript
hero: {
  title: 'Marketing That Drives Bookings, Fills Tables & Grows Tourism',
  subtitle: 'Comprehensive digital strategies for hotels, restaurants, and travel businesses',
  stats: [
    { value: '40%', label: 'Increase in Direct Bookings' },
    { value: '65%', label: 'More Restaurant Reservations' },
    { value: '3.5x', label: 'Tourism Revenue Growth' },
  ],
}
```

#### 7 Core Services
1. **Hotel & Resort Marketing**
   - Direct booking optimization
   - OTA channel management
   - Revenue management consulting
   - Guest experience campaigns

2. **Restaurant & F&B Marketing**
   - Local SEO dominance
   - Online ordering optimization
   - Social media food campaigns
   - Delivery platform management

3. **Travel & Tourism Promotion**
   - Destination marketing
   - Tour operator campaigns
   - Experience-based marketing
   - International market reach

4. **Meta Advertising Excellence**
   - Visual storytelling campaigns
   - Geo-targeted promotions
   - Seasonal campaign management
   - Influencer partnerships

5. **Email & CRM Automation**
   - Guest journey automation
   - Loyalty program management
   - Personalized offers
   - Win-back campaigns

6. **Strategic Consulting**
   - Market positioning
   - Competitive analysis
   - Revenue optimization
   - Digital transformation

7. **Event & Launch Campaigns**
   - Grand openings
   - Seasonal promotions
   - Special events marketing
   - PR and media outreach

#### Pricing Structure
- **Starter Hospitality**: $1,500/month
- **Growth Hospitality**: $3,000/month (Recommended)
- **Pro+ Hospitality**: $5,500/month+

#### Add-Ons
- Landing Page Development: $500
- Photography Package: $750
- Influencer Campaign Setup: $1,200
- Market Research Report: $899

### Health & Wellness Vertical

#### Hero Content
```typescript
hero: {
  title: 'Grow Your Practice & Transform Lives',
  subtitle: 'HIPAA-compliant marketing for healthcare, dental, wellness, and fitness businesses',
  stats: [
    { value: '150+', label: 'New Patients Monthly' },
    { value: '95%', label: 'Patient Retention Rate' },
    { value: '40%', label: 'Practice Growth Rate' },
  ],
}
```

#### 7 Core Services
1. **Patient Acquisition Campaigns**
   - HIPAA-compliant advertising
   - Insurance provider targeting
   - New patient offers
   - Community outreach

2. **Dental Practice Marketing**
   - Cosmetic dentistry promotion
   - Family practice growth
   - Orthodontic campaigns
   - Emergency dental SEO

3. **Wellness & Retreat Marketing**
   - Retreat package promotion
   - Wellness program marketing
   - Spa and resort campaigns
   - Mindfulness app promotion

4. **Fitness & Gym Marketing**
   - Membership growth campaigns
   - Class and program promotion
   - Personal training marketing
   - Virtual fitness solutions

5. **Reputation Management**
   - Review generation systems
   - Patient testimonials
   - Online presence optimization
   - Crisis management

6. **Healthcare Content Marketing**
   - Educational content creation
   - Health blog management
   - Video testimonials
   - Podcast sponsorships

7. **Telehealth & Digital Solutions**
   - Virtual care promotion
   - App download campaigns
   - Patient portal adoption
   - Digital health tools

#### Pricing Structure
- **Starter Health**: $1,500/month
- **Growth Health**: $3,000/month (Recommended)
- **Pro+ Health**: $5,500/month+

#### Add-Ons
- HIPAA Compliance Audit: $499
- Patient Education Videos: $850/video
- Automated Appointment Reminders: $299/month
- Health Content Package: $750/month

---

## Subagent 3: Tech & Sports Verticals Content

### Primary Objective
Create comprehensive content for Tech, AI & Digital Innovation and Sport, Media & Events verticals.

### Tech, AI & Digital Innovation Vertical

#### Hero Content
```typescript
hero: {
  title: 'Scale Your Tech Business with Data-Driven Marketing',
  subtitle: 'Growth strategies for SaaS, AI startups, and digital innovators',
  stats: [
    { value: '300%', label: 'Average ARR Growth' },
    { value: '50%', label: 'Lower CAC' },
    { value: '85%', label: 'Better Product-Market Fit' },
  ],
}
```

#### 7 Core Services
1. **SaaS Growth Marketing**
   - Free trial optimization
   - Product-led growth strategies
   - Churn reduction campaigns
   - Expansion revenue tactics

2. **AI & ML Product Marketing**
   - Technical audience targeting
   - Thought leadership campaigns
   - Developer community building
   - API marketing strategies

3. **B2B Demand Generation**
   - Account-based marketing
   - LinkedIn lead generation
   - Webinar and demo campaigns
   - Enterprise sales support

4. **Product Launch Campaigns**
   - Beta user acquisition
   - Product hunt strategies
   - Tech media outreach
   - Launch sequence automation

5. **Content & SEO Strategy**
   - Technical content creation
   - Documentation marketing
   - Developer blog management
   - Organic growth tactics

6. **Paid Acquisition Mastery**
   - Google Ads for SaaS
   - Facebook B2B campaigns
   - Reddit and niche platforms
   - Retargeting sequences

7. **Analytics & Growth Ops**
   - Funnel optimization
   - Cohort analysis setup
   - Revenue attribution
   - Growth experimentation

#### Pricing Structure
- **Starter Tech**: $1,500/month
- **Growth Tech**: $3,000/month (Recommended)
- **Pro+ Tech**: $5,500/month+

#### Add-Ons
- Technical Case Study: $1,500
- Developer Community Setup: $2,000
- Growth Audit & Roadmap: $999
- API Documentation Marketing: $750

### Sport, Media & Events Vertical

#### Hero Content
```typescript
hero: {
  title: 'Fill Your Venues, Grow Your Audience',
  subtitle: 'Marketing excellence for sports facilities, media companies, and event organizers',
  stats: [
    { value: '200%', label: 'Event Attendance Growth' },
    { value: '500K+', label: 'Media Reach Expansion' },
    { value: '85%', label: 'Venue Utilization Rate' },
  ],
}
```

#### 7 Core Services
1. **Sports Facility Marketing**
   - Membership growth campaigns
   - Court and venue booking
   - League and program promotion
   - Community building

2. **Tournament & Event Promotion**
   - Registration optimization
   - Sponsor acquisition support
   - Participant engagement
   - Live event marketing

3. **Media & Content Distribution**
   - Audience growth strategies
   - Content monetization
   - Streaming promotion
   - Podcast marketing

4. **Sponsorship & Partnership**
   - Sponsor prospecting
   - Partnership proposals
   - Activation campaigns
   - ROI reporting

5. **Pickleball & Niche Sports**
   - Fastest growing sport strategies
   - Community development
   - Equipment and gear promotion
   - Training program marketing

6. **Digital Ticketing & Sales**
   - Ticket sales optimization
   - Season pass campaigns
   - VIP experience marketing
   - Last-minute sales tactics

7. **Brand & Athlete Marketing**
   - Personal brand building
   - Endorsement campaigns
   - Social media management
   - Media training support

#### Pricing Structure
- **Starter Sports**: $1,500/month
- **Growth Sports**: $3,000/month (Recommended)
- **Pro+ Sports**: $5,500/month+

#### Add-Ons
- Event Photography/Video: $1,200/event
- Sponsorship Deck Design: $800
- Live Social Media Coverage: $500/day
- Athlete Brand Audit: $699

---

## Implementation Notes for All Subagents

### Critical Requirements
1. **Services Page**: Ensure ServicesPage.tsx properly displays 7 services for each vertical
2. **Pricing**: All verticals must have SimplifiedPricingSection with add-ons
3. **Testimonials**: Include at least 3 per vertical
4. **Case Studies**: Include at least 2 per vertical
5. **FAQ**: Include at least 4 questions per vertical
6. **Contact Form**: Customize business types for each vertical

### Testing Checklist
- [ ] All URLs route correctly
- [ ] Old URLs redirect properly
- [ ] Services display correctly (7 per vertical)
- [ ] Pricing shows with add-ons
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] Content is industry-appropriate

### Style Guidelines
- Use gradient backgrounds for heroes
- Maintain consistent spacing
- Ensure buttons use btn-gradient class
- Keep color scheme consistent with brand