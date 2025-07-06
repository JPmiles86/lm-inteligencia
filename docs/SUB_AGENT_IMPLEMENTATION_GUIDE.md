# SUB-AGENT IMPLEMENTATION GUIDE
## CRITICAL: Preserve Existing Functionality While Adding New Features

### ⚠️ ABSOLUTE REQUIREMENTS - DO NOT BREAK THESE:

1. **Main Landing Page** (`/`) - The 4-vertical selector MUST remain exactly as is
2. **Seamless Scrolling** - When clicking a vertical (e.g., `/hotels`), the current smooth-scroll single-page experience MUST be preserved
3. **Current Homepage Elements** - All existing sections that users can scroll through must remain
4. **Route Change** - Change `/dental` to `/healthcare` throughout the application

### ARCHITECTURE OVERVIEW

```
/ (Main landing - 4 vertical selector) ← DO NOT CHANGE THIS
├── /hotels (Seamless single-page with scroll) ← KEEP CURRENT BEHAVIOR
│   ├── /hotels/services (New separate page)
│   ├── /hotels/about (New separate page)
│   ├── /hotels/case-studies (New separate page)
│   ├── /hotels/pricing (New separate page)
│   └── /hotels/contact (New separate page)
├── /restaurants (Seamless single-page with scroll) ← KEEP CURRENT BEHAVIOR
│   └── [same subpages as hotels]
├── /healthcare (formerly /dental) ← RENAME ROUTE
│   └── [same subpages as hotels]
└── /sports (Seamless single-page with scroll) ← KEEP CURRENT BEHAVIOR
    └── [same subpages as hotels]
```

### SUB-AGENT 1: ROUTING & NAVIGATION UPDATES

**Priority: CRITICAL - Do this first and carefully**

1. **Update Routes** (in App.tsx or router file):
   ```typescript
   // KEEP THESE EXACTLY AS THEY ARE:
   <Route path="/" element={<LandingPage />} />
   <Route path="/hotels" element={<SeamlessIndustryPage industry="hospitality" />} />
   <Route path="/restaurants" element={<SeamlessIndustryPage industry="foodservice" />} />
   <Route path="/healthcare" element={<SeamlessIndustryPage industry="healthcare" />} /> // Changed from /dental
   <Route path="/sports" element={<SeamlessIndustryPage industry="athletics" />} />
   
   // ADD THESE NEW ROUTES:
   <Route path="/hotels/services" element={<ServicesPage industry="hospitality" />} />
   <Route path="/hotels/about" element={<AboutPage industry="hospitality" />} />
   <Route path="/hotels/case-studies" element={<CaseStudiesPage industry="hospitality" />} />
   <Route path="/hotels/pricing" element={<PricingPage industry="hospitality" />} />
   <Route path="/hotels/contact" element={<ContactPage industry="hospitality" />} />
   // Repeat for other industries...
   ```

2. **Update Navigation Component**:
   - Add a new navigation menu that appears ONLY on industry pages
   - This nav should have: Services, About, Case Studies, Pricing, Blog, Contact
   - Make sure it doesn't interfere with smooth scrolling on the main industry page
   - Include industry switcher in the nav

3. **Update all references from 'dental' to 'healthcare'**:
   - Routes
   - Navigation links
   - Industry configs
   - Any hardcoded strings

### SUB-AGENT 2: HOMEPAGE ENHANCEMENT (CAREFUL - DON'T BREAK SCROLLING)

**Priority: HIGH - But preserve existing functionality**

1. **DO NOT REMOVE** any existing sections from SeamlessIndustryPage
2. **ENHANCE** existing sections by:
   - Adding "Learn More" CTAs that link to new detailed pages
   - Making service cards link to `/[industry]/services#[service-name]`
   - Adding "View All Case Studies" link to case studies section
   - Adding "See Full Pricing" link to pricing section

3. **Add Missing Homepage Sections** from original config:
   - Use the `homepageSections` data from industry-configs
   - Insert these between existing sections
   - Maintain smooth scroll behavior

### SUB-AGENT 3: SERVICE PAGES CREATION

**Priority: HIGH - New functionality**

1. **Create ServicesPage Component**:
   - Accept industry prop
   - Display ALL services including:
     - Core DM services (Google Ads, Meta, Email Marketing, etc.)
     - Industry-specific services
   - Each service should have:
     - Detailed description
     - Benefits
     - Process
     - Expected results
     - CTA to contact

2. **Import Missing Content**:
   - Use service descriptions from original specification
   - Add the traditional DM services that were removed
   - Maintain industry customization

3. **Create Service Detail Routes** (optional):
   - `/hotels/services/google-ads`
   - `/hotels/services/email-marketing`
   - etc.

### SUB-AGENT 4: CASE STUDIES & ADDITIONAL FEATURES

**Priority: MEDIUM - New functionality**

1. **Case Studies Page with Timeline View**:
   - Create visual timeline component
   - Show client journey from start to success
   - Include before/after metrics
   - Add filtering by service type

2. **About Page**:
   - Team information (use from config)
   - Company values
   - Approach/methodology
   - Certifications and awards

3. **Enhanced Contact Page**:
   - Full contact form
   - Calendly integration
   - Office hours
   - FAQ section
   - Multiple contact methods

4. **Pricing Page**:
   - Detailed package breakdowns
   - Comparison table
   - Add-on services
   - Custom package request form

### TESTING CHECKLIST

Before considering any task complete, verify:

- [ ] Main landing page (/) still shows 4 verticals
- [ ] Clicking a vertical still shows seamless scrolling page
- [ ] All existing scroll sections are preserved
- [ ] New navigation appears on industry pages
- [ ] New pages load correctly
- [ ] Industry switcher works on all pages
- [ ] /dental redirects to /healthcare
- [ ] No console errors
- [ ] Mobile responsive on all new pages
- [ ] Smooth scroll anchors still work

### CRITICAL WARNINGS

1. **DO NOT** modify the main landing page component
2. **DO NOT** remove or restructure SeamlessIndustryPage
3. **DO NOT** break the smooth scrolling functionality
4. **DO NOT** change the visual design language
5. **TEST EVERYTHING** - One broken route can destroy the entire site

### IMPLEMENTATION ORDER

1. First: Update routes and test that nothing breaks
2. Second: Add new navigation (test it doesn't break scrolling)
3. Third: Create new page components
4. Fourth: Enhance homepage with links to new pages
5. Last: Add advanced features like timeline view

Remember: The goal is to ADD functionality, not REPLACE what's working!