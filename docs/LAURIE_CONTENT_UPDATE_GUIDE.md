# Laurie's Content Update Guide

## 🎯 Quick Start: How to Update Website Content

**Important**: All website content is now in ONE file: `/src/config/industry-configs.ts`

This means you can update ANY text, images, team members, services, pricing, or other content by editing just this single file!

## 📁 Where to Find the Content File

1. Navigate to: `src/config/industry-configs.ts`
2. This file contains ALL content for all 4 industries:
   - Hotels & Hospitality (`hospitality`)
   - Restaurants & Food Service (`foodservice`) 
   - Dental & Healthcare (`healthcare`)
   - Sports & Recreation (`athletics`)

## 🏨 Industry Sections Explained

Each industry has the same content structure. Here's what each section controls:

### 🌟 HERO SECTION (`hero`)
**Controls**: Main homepage banner
```typescript
hero: {
  title: 'Transform Your Hotel\'s Digital Presence',        // Big headline
  subtitle: 'Drive direct bookings and reduce OTA...',      // Supporting text
  backgroundSrc: 'https://youtube.com/video-url',           // Background video/image
  ctaText: 'Get Free Hotel Marketing Audit',                // Button text
  ctaLink: '/contact',                                       // Button destination
  stats: [                                                   // Statistics displayed
    { value: '40%', label: 'Increase in Direct Bookings' }
  ]
}
```

### 🛠️ SERVICES SECTION (`services`)
**Controls**: Main services listed on homepage
```typescript
services: [
  {
    title: 'Google Hotel Ads',                              // Service name
    description: 'Capture guests at the exact moment...',   // Service description
    features: ['Direct booking optimization', '...'],       // Bullet points
    icon: 'hotel',                                          // Icon type
    results: 'Average 35% increase in direct bookings'     // Expected results
  }
]
```

### 👥 ABOUT PAGE CONTENT (`about`)
**Controls**: Everything on the About page

#### Founder Story
```typescript
about: {
  founderStory: {
    title: 'Meet Laurie Meiring',                          // Section headline
    description: 'With over 15 years of experience...',    // Main story paragraph
    extendedStory: 'Unlike generic marketing agencies...',  // Second paragraph
    approach: 'Laurie\'s approach combines data-driven...',// Third paragraph
    image: '/images/team/laurie-photo.jpg',                // Laurie's photo
    certifications: ['Google Ads Certified', 'Meta...']    // Certifications list
  },
  
  // Company values displayed as cards
  values: [
    {
      title: 'Industry Expertise',                          // Value title
      description: 'Deep specialization in...',             // Value explanation
      icon: '🎯'                                            // Value emoji/icon
    }
  ],
  
  // All team members
  team: [
    {
      name: 'Laurie Meiring',                               // Team member name
      title: 'Founder & Hotel Marketing Strategist',        // Job title
      bio: 'With 15+ years of experience...',               // Biography
      image: '/images/team/laurie.jpg',                     // Photo path
      certifications: ['Google Ads Certified']              // Certifications
    }
  ]
}
```

### 📞 CONTACT PAGE CONTENT (`contact`)
**Controls**: Contact page forms and information

#### Basic Contact Info
```typescript
contact: {
  title: 'Ready to Transform Your Hotel\'s Performance?',   // Page headline
  subtitle: 'Get your free hotel marketing audit...',       // Page description
  email: 'hotels@inteligencia.com',                        // Contact email
  phone: '(555) 123-4567',                                 // Phone number
  address: '123 Business Ave, Suite 100, Miami, FL',       // Office address
  
  // Form dropdown options
  businessTypes: ['Boutique Hotel', 'Resort', 'Other'],    // Business type options
  budgetRanges: ['$1,000 - $2,500/month', 'Other'],       // Budget options
  timelineOptions: ['ASAP', 'Within 1 month', 'Other'],   // Timeline options
  
  // Office hours display
  officeHours: {
    weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM EST',    // Weekday hours
    saturday: 'Saturday: 10:00 AM - 2:00 PM EST',          // Saturday hours
    sunday: 'Sunday: Closed',                              // Sunday hours
    emergency: 'Emergency support available 24/7...'       // Emergency note
  },
  
  // FAQ section
  faq: [
    {
      question: 'How quickly can I expect to see results?', // FAQ question
      answer: 'Most clients see initial improvements...'    // FAQ answer
    }
  ]
}
```

### 🛠️ SERVICES PAGE EXTENDED (`servicesPage`)
**Controls**: Additional content on Services page

```typescript
servicesPage: {
  // 4-step marketing process
  marketingProcess: [
    {
      step: '01',                                           // Step number
      title: 'Discovery & Analysis',                        // Step title
      description: 'Deep dive into your business...',       // Step description
      icon: '🔍'                                            // Step icon
    }
  ],
  
  // Core capabilities section
  coreCapabilities: [
    {
      title: 'Paid Advertising',                            // Capability name
      description: 'Google Ads, Meta Ads, and...',         // Capability description
      features: ['Search Engine Marketing', 'Social...'],   // Feature list
      icon: '🎯'                                            // Capability icon
    }
  ],
  
  // Industry-specific benefits
  industryBenefits: [
    'Reduce OTA dependency by 30%+',                       // Benefit statement
    'Increase direct bookings by 40%+'                     // Benefit statement
  ]
}
```

### 💰 PRICING SECTION (`pricing`)
**Controls**: Pricing plans and packages
```typescript
pricing: {
  plans: [
    {
      name: 'Starter Package',                              // Plan name
      price: '$1,500',                                      // Plan price
      duration: 'per month',                                // Price period
      description: 'Perfect for boutique hotels...',        // Plan description
      features: ['Google Hotel Ads setup', 'Basic...'],     // What's included
      recommended: true,                                     // Highlight plan
      ctaText: 'Get Started',                               // Button text
      ctaLink: '/contact'                                    // Button destination
    }
  ]
}
```

### 📈 CASE STUDIES (`caseStudies`)
**Controls**: Success stories and testimonials
```typescript
caseStudies: [
  {
    id: 'oceanview-resort',                                 // Unique ID
    title: 'Oceanview Resort Miami Transforms...',         // Case study title
    industry: 'Hotels & Hospitality',                      // Industry category
    client: 'Oceanview Resort Miami',                      // Client name
    challenge: 'High dependency on OTA platforms...',       // Problem description
    solution: 'Implemented a comprehensive digital...',     // Solution description
    results: [                                              // Results achieved
      {
        metric: 'Direct Bookings',                         // What was measured
        value: '+40%',                                      // Result value
        description: 'Increase in direct bookings...'      // Result description
      }
    ],
    testimonial: {                                          // Client testimonial
      quote: 'Laurie\'s Google Hotel Ads strategy...',     // Client quote
      author: 'Sarah Mitchell',                             // Client name
      position: 'General Manager',                          // Client title
      company: 'Oceanview Resort Miami'                     // Client company
    },
    image: 'https://picsum.photos/800/600?random=1',       // Case study image
    tags: ['Google Hotel Ads', 'Direct Bookings']         // Related tags
  }
]
```

## ✏️ Common Content Updates

### Update Service Descriptions
1. Find the industry section (e.g., `hospitality:`)
2. Find `services:` array
3. Edit the `description` field for any service
4. Save the file

### Add a New Team Member
1. Find the industry section
2. Find `about: { team: [` array
3. Add a new team member object:
```typescript
{
  name: 'New Team Member',
  title: 'Marketing Specialist',
  bio: 'Brief biography...',
  image: '/images/team/new-member.jpg',
  certifications: ['Certification Name']
}
```

### Update Contact Information
1. Find the industry section
2. Find `contact:` section
3. Update `email`, `phone`, `address` fields
4. Save the file

### Change Pricing
1. Find the industry section
2. Find `pricing: { plans: [` array
3. Update `price`, `features`, or `description` fields
4. Save the file

### Update FAQ Questions
1. Find the industry section
2. Find `contact: { faq: [` array
3. Edit existing questions/answers or add new ones:
```typescript
{
  question: 'New question here?',
  answer: 'Detailed answer here...'
}
```

## 🔧 Technical Notes

### Image Paths
- Use relative paths: `/images/team/photo.jpg`
- Place images in the `public/images/` folder
- Supported formats: JPG, PNG, WebP

### Text Formatting
- Use `\'` for apostrophes in text (e.g., `'Laurie\'s approach'`)
- Use `\"` for quotes in text (e.g., `'He said \"Hello\"'`)
- Keep line breaks reasonable for readability

### Icons
- Services use text icons: `'hotel'`, `'camera'`, `'mail'`, etc.
- Values and processes use emoji: `'🎯'`, `'📊'`, `'🛡️'`, etc.

## 🚨 Important Reminders

1. **Always save the file** after making changes
2. **Test the website** to make sure changes appear correctly
3. **Use consistent formatting** - follow the existing patterns
4. **Don't delete commas** - they're required between items in arrays
5. **Keep backups** of your changes in case something goes wrong

## 🆘 Need Help?

If something breaks or you need assistance:
1. Check that all commas and brackets are in place
2. Make sure you didn't accidentally delete any quotes
3. Save a backup of the working version before making large changes
4. Contact your technical team for assistance with complex changes

**Remember**: This one file controls your ENTIRE website content across all 4 industries!