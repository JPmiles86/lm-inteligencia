# WEBSITE RESTORATION PLAN - INTELIGENCIA
## Preserving What Works While Adding Back Missing Elements

### KEY FINDINGS

#### What Was Lost from Original Config:
1. **Detailed Service Pages Content** - Original had specific service descriptions for:
   - Google Ads Management
   - Meta (FB/IG) Advertising  
   - Email Marketing & Funnels
   - Marketing Strategy Consulting
   - Event/Launch Campaigns

2. **Homepage Sections** - Original config had rich homepage sections:
   - Commission cost breakdown
   - Success stories with stats
   - Process/approach steps
   - ROI calculator
   - Extended value propositions

3. **Case Studies Timeline View** - You mentioned this existed but was removed

4. **Separate Pages Navigation** - Everything collapsed into single-page sections

5. **Traditional DM Services** - Focus shifted entirely to industry-specific, lost general digital marketing offerings

#### What's Working Well:
1. **4 Vertical Structure** - Clean industry separation
2. **Industry-Specific Configs** - Good customization per vertical
3. **Visual Design** - Modern, vibrant color schemes
4. **Responsive Layout** - Mobile-friendly implementation

### HIGH-LEVEL PLAN: ONE VERTICAL EXAMPLE (HOSPITALITY)

#### Page Structure for Each Vertical:
```
/hotels (Homepage - Overview & Teasers)
├── /hotels/services (Detailed service pages)
├── /hotels/about (Team, values, approach)
├── /hotels/case-studies (Timeline view of successes)
├── /hotels/pricing (Detailed packages)
├── /hotels/blog (Content marketing)
└── /hotels/contact (Full contact page)
```

#### Homepage Content Strategy:
1. **Hero Section** - Keep current impactful design
2. **Value Proposition** - Brief, with "Learn More" CTAs
3. **Services Overview** - 3 cards with key benefits + "See All Services"
4. **Featured Case Studies** - 2-3 previews + "View All Success Stories"
5. **Testimonials Carousel** - 3-4 rotating + "Read More Reviews"
6. **Pricing Teaser** - Starting prices + "View Full Packages"
7. **Contact CTA** - Simple form + "Full Contact Options"

#### Services Page Must Include:
1. **Core DM Services** (from original spec):
   - Google Ads Management
   - Meta Advertising
   - Email Marketing & Funnels
   - Marketing Strategy Consulting
   - Event/Launch Campaigns

2. **Industry-Specific Services**:
   - Direct booking optimization
   - OTA reduction strategies
   - Guest intelligence systems
   - Revenue management

3. **Each Service Should Have**:
   - Problem it solves
   - How it works
   - Expected results
   - Pricing indication
   - Case study example
   - CTA to contact

#### Case Studies Page Features:
1. **Timeline View** - Visual journey of client successes
2. **Filter by Service** - See results by service type
3. **Before/After Metrics** - Clear ROI demonstration
4. **Client Testimonials** - Integrated with results
5. **Industry Stats** - Benchmarks and comparisons

### IMPLEMENTATION APPROACH

#### Phase 1: Restore Navigation Structure
1. Update App.tsx to support multi-page routing
2. Create proper navigation menu with:
   - Home
   - Services (with dropdown for specific services)
   - About
   - Case Studies
   - Pricing
   - Blog
   - Contact

#### Phase 2: Expand Homepage Content
1. Use homepageSections from original config
2. Add "teaser" versions of each major section
3. Implement clear CTAs to drive deeper engagement
4. Keep current aesthetic but add more substance

#### Phase 3: Build Out Service Pages
1. Create individual pages for each core service
2. Include detailed descriptions from original spec
3. Add industry-specific variations
4. Include clear benefit statements and ROI data

#### Phase 4: Restore Missing Features
1. Timeline view for case studies
2. ROI calculators
3. Blog infrastructure
4. Enhanced contact forms with scheduling

### CRITICAL SUCCESS FACTORS

1. **Don't Break What Works**:
   - Keep 4-vertical structure
   - Maintain industry configs
   - Preserve responsive design
   - Keep vibrant branding

2. **Add Back What's Missing**:
   - Traditional DM services
   - Separate pages for depth
   - Case studies with timeline
   - Blog system
   - Detailed pricing

3. **User Journey**:
   - Homepage → Interest → Detailed Info → Contact
   - Clear navigation between sections
   - Multiple conversion points
   - Progressive disclosure of information

### SUB-AGENT TASK ASSIGNMENTS

#### Sub-Agent 1: Navigation & Routing
- Implement multi-page routing structure
- Create navigation component with proper menus
- Ensure smooth transitions between pages
- Maintain industry switcher functionality

#### Sub-Agent 2: Homepage Enhancement
- Expand homepage with teaser sections
- Add CTAs throughout to drive to detailed pages
- Implement homepage sections from original config
- Keep current design language

#### Sub-Agent 3: Service Pages Creation
- Build individual service pages
- Import content from original specification
- Create service-specific templates
- Add interactive elements (calculators, etc.)

#### Sub-Agent 4: Case Studies & Features
- Implement timeline view for case studies
- Create blog infrastructure
- Build enhanced contact pages
- Add missing interactive features

### TIMELINE
- Day 1-2: Navigation and routing structure
- Day 3-4: Homepage enhancements
- Day 5-6: Service pages buildout
- Day 7-8: Case studies and additional features
- Day 9-10: Testing and refinement

This plan maintains the elegant vertical structure while restoring the depth and traditional navigation expected from a professional marketing agency website. Each vertical becomes a full website with proper information architecture.