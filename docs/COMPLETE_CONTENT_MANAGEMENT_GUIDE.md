# COMPLETE CONTENT MANAGEMENT GUIDE FOR LAURIE

## Overview

This guide shows you exactly how to update all content on your Inteligencia website. Everything is controlled through configuration files - no technical knowledge needed, just edit text files.

## Quick Reference: What Controls What

### Universal Content (Same Across All Industries)
**File**: `src/config/universal-content.ts`
- About page founder story
- Company values (4 core values) 
- Team member details (Laurie + supporting team)
- Footer content (company name, copyright, etc.)

### Industry-Specific Content
**File**: `src/config/industry-configs.ts`
- Hero sections (titles, stats, call-to-action)
- Homepage services (3 services per industry)
- Pricing plans (3 tiers per industry)
- Contact forms (business types, form labels)
- Testimonials (customer quotes)
- FAQ sections

### Blog Content
**File**: `src/data/blogData.ts`
- All blog posts and related content

---

## PART 1: Editing Universal Content

### File: `src/config/universal-content.ts`

This file controls content that appears **identical** across all 4 industry websites.

#### Updating Your Founder Story

```typescript
founderStory: {
  title: 'Meet Laurie Meiring',
  description: 'Your main description here...',
  extendedStory: 'Your extended story here...',
  approach: 'Your approach description here...',
  image: '/images/team/Laurie Meiring/laurie ai face 1x1.jpg',
  certifications: ['Google Ads Certified', 'Meta Blueprint Certified', 'HIPAA Compliance Expert', 'Local SEO Specialist'],
},
```

**What you can edit**:
- `title`: Your name/title on About page
- `description`: First paragraph about you
- `extendedStory`: Second paragraph about Inteligencia
- `approach`: Third paragraph about your methodology
- `certifications`: List of your certifications

#### Updating Company Values

```typescript
values: [
  {
    title: 'Industry Expertise',
    description: 'Deep specialization in hospitality, food service, healthcare, and athletics marketing.',
    icon: '🎯',
  },
  // ... 3 more values
]
```

**What you can edit**:
- `title`: Value name
- `description`: What this value means
- `icon`: Emoji icon (keep existing ones)

#### Updating Team Members

```typescript
team: [
  {
    name: 'Laurie Meiring',
    title: 'Founder & CEO',
    bio: 'Your bio here...',
    image: '/images/team/Laurie Meiring/laurie ai face 1x1.jpg',
    certifications: ['Google Ads Certified', 'Meta Blueprint Certified', 'HIPAA Compliance Expert', 'Local SEO Specialist'],
  },
  {
    name: 'Sarah Johnson',
    title: 'Digital Strategy Director',
    bio: 'Sarah bio here...',
    // ... etc
  }
]
```

**What you can edit**:
- `name`: Team member name
- `title`: Their job title
- `bio`: Description of their role and expertise
- `certifications`: List of their qualifications

#### Updating Footer Content

```typescript
footer: {
  companyName: 'Inteligencia',
  companyDescription: 'Specialized marketing solutions across multiple industries.',
  servicesTitle: 'Services',
  industriesTitle: 'Industries',
  industriesList: [
    'Hotels & Hospitality',
    'Restaurants & Food Service', 
    'Dental & Healthcare',
    'Sports & Recreation'
  ],
  contactTitle: 'Contact',
  copyright: '© 2024 Inteligencia. All rights reserved.'
}
```

---

## PART 2: Editing Industry-Specific Content

### File: `src/config/industry-configs.ts`

This file has 4 main sections: `hospitality`, `foodservice`, `healthcare`, `athletics`

#### Updating Hero Sections

Find the industry you want to edit and locate the `hero` section:

```typescript
hero: {
  title: 'Transform Your Hotel\'s Digital Presence',
  subtitle: 'Drive direct bookings and reduce OTA dependency with proven advertising strategies',
  backgroundType: 'video',
  backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
  ctaText: 'Get Free Hotel Marketing Audit',
  ctaLink: '/contact',
  stats: [
    { value: '40%', label: 'Increase in Direct Bookings' },
    { value: '25%', label: 'Reduction in OTA Commissions' },
    { value: '60%', label: 'Better ROI vs Traditional Marketing' },
  ],
},
```

**What you can edit**:
- `title`: Main headline
- `subtitle`: Supporting text under headline
- `ctaText`: Button text
- `stats`: Three statistics with values and labels

#### Updating Homepage Services

```typescript
services: [
  {
    title: 'Google Hotel Ads',
    description: 'Capture guests at the exact moment they\'re ready to book with AI-optimized campaigns.',
    keyBenefit: 'Reduce OTA dependency by 35%',
    icon: 'hotel',
    learnMoreLink: '/services#google-hotel-ads',
  },
  // ... 2 more services
]
```

**What you can edit**:
- `title`: Service name
- `description`: What this service does
- `keyBenefit`: Main benefit/result
- `learnMoreLink`: Where "Learn More" button goes

#### Updating Pricing Plans

```typescript
pricing: {
  plans: [
    {
      name: 'Starter Package',
      price: '$1,500',
      duration: 'per month',
      description: 'Perfect for boutique hotels (1-50 rooms) looking to reduce OTA dependency',
      features: ['Google Hotel Ads setup', 'Basic website optimization', 'Monthly performance reports'],
      ctaText: 'Get Started',
      ctaLink: '/contact',
    },
    // ... 2 more plans
  ]
}
```

**What you can edit**:
- `name`: Plan name
- `price`: Price amount
- `description`: Who this plan is for
- `features`: List of what's included
- `ctaText`: Button text

#### Updating Contact Forms

```typescript
contact: {
  title: 'Ready to Transform Your Hotel\'s Performance?',
  subtitle: 'Get your free hotel marketing audit and discover how to reduce OTA dependency while increasing direct bookings.',
  calendlyText: 'Schedule Your Free Hotel Marketing Consultation',
  email: 'hotels@inteligencia.com',
  phone: '(555) 123-4567',
  businessTypes: ['Boutique Hotel', 'Resort', 'Bed & Breakfast', 'Vacation Rental', 'Hotel Chain', 'Other'],
  budgetRanges: ['$1,000 - $2,500/month', '$2,500 - $5,000/month', '$5,000 - $10,000/month', '$10,000+ /month', 'Let\'s discuss'],
  timelineOptions: ['ASAP - I need help now', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring options'],
  formLabels: {
    formTitle: 'Send us a message',
    formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours with a customized strategy for your business.',
    firstName: 'First Name *',
    // ... more form labels
  }
}
```

**What you can edit**:
- `title`: Contact page headline
- `subtitle`: Contact page description
- `email`: Industry-specific email
- `businessTypes`: Dropdown options for business type
- `budgetRanges`: Dropdown options for budget
- `timelineOptions`: Dropdown options for timeline
- All `formLabels`: Every form field label and placeholder

#### Updating Testimonials

```typescript
testimonials: [
  {
    quote: 'Laurie\'s Google Hotel Ads strategy helped us reduce OTA commissions by 30% while increasing direct bookings by 45%. Our revenue per available room improved significantly.',
    author: 'Sarah Mitchell',
    position: 'General Manager',
    company: 'Oceanview Resort Miami',
  },
  // ... 2 more testimonials
]
```

**What you can edit**:
- `quote`: Customer testimonial text
- `author`: Customer name
- `position`: Their job title
- `company`: Their business name

---

## PART 3: Common Content Updates

### Adding a New Testimonial

1. Find the industry in `industry-configs.ts`
2. Locate the `testimonials` array
3. Add a new testimonial object:

```typescript
{
  quote: 'Your new testimonial quote here...',
  author: 'Customer Name',
  position: 'Their Title',
  company: 'Their Business',
}
```

### Updating Pricing

1. Find the industry in `industry-configs.ts`
2. Locate the `pricing.plans` array
3. Edit the `price`, `features`, or `description` for any plan

### Changing Contact Information

1. Find the industry in `industry-configs.ts`
2. Locate the `contact` section
3. Update `email`, `phone`, or `address` as needed

### Updating Your Bio for Each Industry

1. Find the industry in `industry-configs.ts`
2. Locate the `team` array (usually just you)
3. Update your `title` and `bio` to be industry-specific

---

## PART 4: Blog Content Management

### File: `src/data/blogData.ts`

```typescript
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Your Blog Post Title',
    slug: 'your-blog-post-title',
    excerpt: 'Brief description of the post...',
    content: 'Full blog post content here...',
    author: {
      name: 'Laurie Meiring',
      title: 'Marketing Expert',
      image: '/images/team/laurie-meiring.jpg'
    },
    publishedDate: '2024-01-15',
    readTime: 5,
    category: 'Marketing Tips',
    tags: ['SEO', 'Digital Marketing'],
    featuredImage: '/images/blog/post-image.jpg',
    featured: false
  }
]
```

**To add a new blog post**:
1. Copy an existing blog post object
2. Change the `id` to a new number
3. Update all the content fields
4. Set `featured: true` if you want it highlighted

---

## PART 5: Safety Tips

### Before Making Changes
1. **Make a backup**: Copy the file you're editing to a safe location
2. **Test one change**: Make one small change first to test
3. **Keep formatting**: Don't change quotes, commas, or brackets

### Common Mistakes to Avoid
1. **Don't remove commas** between items in lists
2. **Don't change quote marks** from single to double (or vice versa)
3. **Don't remove brackets** `[]` or braces `{}`
4. **Keep exact spacing** for nested items

### Testing Your Changes
1. Save the file
2. Check the website loads properly
3. Test both desktop and mobile views
4. Check all 4 industry sites if you changed universal content

---

## PART 6: Quick Edit Checklist

### Monthly Content Updates
- [ ] Review and update testimonials
- [ ] Check pricing accuracy
- [ ] Update any seasonal messaging in hero sections
- [ ] Add new blog posts

### Quarterly Content Updates  
- [ ] Review and update your bio/certifications
- [ ] Update company values if needed
- [ ] Review FAQ sections for accuracy
- [ ] Update team member information

### Annual Content Updates
- [ ] Update copyright year in footer
- [ ] Review all pricing plans
- [ ] Update founder story if significant changes
- [ ] Review all contact information

---

## Need Help?

If you get stuck:
1. **Check syntax**: Make sure quotes and commas are in the right places
2. **Use a backup**: Restore from your backup if something breaks
3. **Test gradually**: Make one change at a time to isolate issues

**Remember**: These configuration files control your entire website content. Small edits here change content everywhere it appears across all your industry sites.