# CRITICAL CONTENT CONFIGURATION REQUIREMENTS

## ⚠️ ABSOLUTE RULE: ALL TEXT MUST COME FROM CONFIG FILES

### Content Sources:
1. **Industry-specific content**: `/src/config/industry-configs.ts`
2. **Universal content**: `/src/config/universal-content.ts`

### NO HARDCODED TEXT ALLOWED
- Every heading, paragraph, button text, label, etc. MUST reference config files
- No inline strings in components
- All content changes happen in config files only

### Example Implementation:

❌ **WRONG - Hardcoded text**:
```tsx
<h1>Welcome to Our Services</h1>
<p>We offer the best marketing solutions</p>
```

✅ **CORRECT - Config-sourced**:
```tsx
<h1>{industryConfig.content.services.title}</h1>
<p>{industryConfig.content.services.description}</p>
```

### Config Structure to Use:

1. **For Industry-Specific Content**:
```typescript
const config = defaultIndustryConfigs[industry];
// Use: config.content.hero.title
// Use: config.content.services[0].description
// Use: config.content.pricing.plans[0].features
```

2. **For Universal Content**:
```typescript
import { universalContent } from '@/config/universal-content';
// Use: universalContent.about.founderStory.title
// Use: universalContent.about.team[0].name
// Use: universalContent.footer.copyright
```

### Adding New Content:

When you need new text that doesn't exist in configs:

1. **ADD to industry-configs.ts** for industry-specific content:
```typescript
content: {
  // Add new sections here
  servicesPage: {
    title: 'Our Services',
    subtitle: 'Comprehensive marketing solutions',
    coreServices: {
      googleAds: {
        title: 'Google Ads Management',
        description: '...',
        benefits: ['...', '...']
      }
    }
  }
}
```

2. **ADD to universal-content.ts** for shared content:
```typescript
navigation: {
  mainMenu: {
    services: 'Services',
    about: 'About Us',
    caseStudies: 'Case Studies',
    pricing: 'Pricing',
    contact: 'Contact'
  }
}
```

### Content Requirements for New Pages:

**Services Page** - Add to industry-configs.ts:
- servicesPage.title
- servicesPage.subtitle
- servicesPage.coreServices (array)
- servicesPage.industryServices (array)
- servicesPage.cta

**Case Studies Page** - Add to industry-configs.ts:
- caseStudiesPage.title
- caseStudiesPage.subtitle
- caseStudiesPage.studies (array with timeline data)
- caseStudiesPage.filterLabels

**About Page** - Use universal-content.ts:
- about.founderStory
- about.values
- about.team
- about.mission
- about.vision

**Pricing Page** - Use existing from industry-configs.ts:
- content.pricing.plans
- Add: pricingPage.comparisons
- Add: pricingPage.faqs

### Database Migration Path:
Since this will eventually move to a database:
1. Keep all content in these config files
2. Structure content with clear keys/paths
3. Make it easy to map to database tables later
4. Use consistent naming conventions

### Sub-Agent Instructions:
1. NEVER write text directly in components
2. ALWAYS reference config files
3. If text doesn't exist in config, ADD IT to the appropriate config file
4. Test that changing config text updates the UI
5. Document any new config properties you add