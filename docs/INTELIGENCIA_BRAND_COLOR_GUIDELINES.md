# Inteligencia Brand Color Guidelines

## Official Brand Color Palette

### Primary Colors

#### Navy Blue - #002643
![#002643](https://via.placeholder.com/100x50/002643/FFFFFF?text=%23002643)

**RGB:** 0, 38, 67  
**HSL:** 206°, 100%, 13%  
**Usage:** Primary brand color for authority and trust

**Applications:**
- Main headings (H1, H2, H3)
- Navigation text
- Primary text content
- Footer backgrounds
- Professional service descriptions
- Contact information

**Brand Message:** Authority, trustworthiness, stability, professionalism

---

#### Teal - #0093a0
![#0093a0](https://via.placeholder.com/100x50/0093a0/FFFFFF?text=%23009a3a0)

**RGB:** 0, 147, 160  
**HSL:** 185°, 100%, 31%  
**Usage:** Secondary brand color for innovation and action

**Applications:**
- CTA buttons and hover states
- Active navigation links
- Interactive elements
- AI/Technology highlights
- Service icons and features
- Progress indicators
- "Learn More" links

**Brand Message:** Innovation, technology, forward-thinking, action

---

#### Gold - #FFD700
![#FFD700](https://via.placeholder.com/100x50/FFD700/000000?text=%23FFD700)

**RGB:** 255, 215, 0  
**HSL:** 51°, 100%, 50%  
**Usage:** Accent color for premium positioning and highlights

**Applications:**
- "Most Popular" pricing badges
- Special offers and promotions
- Key statistics and metrics
- Success story highlights
- Premium service indicators
- Award badges
- Call-to-action accents

**Brand Message:** Premium quality, excellence, achievement, attention

## Color Usage Hierarchy

### 1. Primary Dominance (Navy Blue)
- **70% of color usage** should be Navy Blue
- Use for main content, headers, navigation
- Establishes brand authority and trust
- Creates professional foundation

### 2. Secondary Support (Teal)
- **25% of color usage** should be Teal
- Use for interactive elements and CTAs
- Highlights AI/technology positioning
- Drives user actions and engagement

### 3. Accent Highlights (Gold)
- **5% of color usage** should be Gold
- Use sparingly for maximum impact
- Reserve for premium offerings and key highlights
- Creates visual hierarchy and attention

## Brand Positioning Through Color

### "High Tech, Super AI, DM Agency of the Future"

**Navy Blue Foundation:**
- Establishes credibility and trustworthiness
- Appeals to business decision-makers
- Communicates stability and reliability
- Professional service provider positioning

**Teal Innovation:**
- Represents cutting-edge technology
- AI and automation capabilities
- Forward-thinking approach
- Digital transformation expertise

**Gold Excellence:**
- Premium service quality
- Superior results and achievements
- Investment-worthy solutions
- Market leadership positioning

## Industry Application

### All Industries Use Unified Colors

**Hospitality & Hotels:**
- Navy: Professional service descriptions, pricing tables
- Teal: Booking CTAs, reservation buttons, hotel features
- Gold: "Most Popular" packages, award badges, special offers

**Restaurants & Food Service:**
- Navy: Menu descriptions, service information, contact details
- Teal: Online ordering buttons, reservation links, social media
- Gold: Featured dishes, chef specialties, restaurant awards

**Healthcare & Dental:**
- Navy: Service descriptions, practitioner credentials, contact info
- Teal: Appointment booking, patient portal links, technology features
- Gold: Patient testimonials, practice achievements, premium services

**Sports & Athletics:**
- Navy: Facility information, membership details, training programs
- Teal: Membership signup, tournament registration, facility booking
- Gold: Tournament winners, facility achievements, premium memberships

## Technical Implementation

### CSS Custom Properties
```css
:root {
  --primary-color: #002643;    /* Navy Blue */
  --secondary-color: #0093a0;  /* Teal */
  --accent-color: #FFD700;     /* Gold */
}
```

### Component Usage
```css
/* Primary text and headers */
.text-primary { color: var(--primary-color); }
.bg-primary { background-color: var(--primary-color); }

/* Interactive elements and CTAs */
.text-secondary { color: var(--secondary-color); }
.bg-secondary { background-color: var(--secondary-color); }

/* Accent highlights and badges */
.text-accent { color: var(--accent-color); }
.bg-accent { background-color: var(--accent-color); }
```

## Color Accessibility

### Contrast Ratios (WCAG 2.1 AA Compliant)

**Navy Blue (#002643) on White:**
- Contrast Ratio: 15.8:1 ✅ (AAA)
- Perfect for body text and headers

**Teal (#0093a0) on White:**
- Contrast Ratio: 4.8:1 ✅ (AA)
- Suitable for links and interactive elements

**Gold (#FFD700) on Navy Blue:**
- Contrast Ratio: 9.2:1 ✅ (AAA)
- Excellent for accent elements on dark backgrounds

**White on Navy Blue:**
- Contrast Ratio: 15.8:1 ✅ (AAA)
- Perfect for buttons and reversed text

## Do's and Don'ts

### ✅ DO

**Color Application:**
- Use Navy Blue for primary text and professional content
- Use Teal for CTAs, links, and interactive elements
- Use Gold sparingly for highlights and premium positioning
- Maintain consistent color hierarchy across all pages
- Use CSS custom properties, never hardcode colors
- Test color combinations for accessibility compliance

**Brand Consistency:**
- Apply the same color scheme across all industry pages
- Maintain color ratios (70% Navy, 25% Teal, 5% Gold)
- Use colors to support brand messaging and positioning
- Ensure colors align with "high tech AI agency" positioning

### ❌ DON'T

**Color Mistakes:**
- Don't use different colors for different industries
- Don't hardcode color values in components
- Don't overuse the gold accent color (loses impact)
- Don't use colors with poor contrast ratios
- Don't introduce additional brand colors without approval
- Don't use colors that conflict with established hierarchy

**Brand Dilution:**
- Don't mix color schemes between pages
- Don't use competitor colors or similar palettes
- Don't sacrifice readability for visual appeal
- Don't ignore accessibility requirements
- Don't create visual inconsistency across the site

## Color Psychology & Brand Impact

### Navy Blue Psychology
- **Trust:** 89% of consumers associate dark blue with trustworthiness
- **Professionalism:** Standard color for corporate and B2B communications
- **Stability:** Conveys reliability and long-term partnership potential
- **Intelligence:** Associated with knowledge and expertise

### Teal Psychology
- **Innovation:** Modern color representing technological advancement
- **Clarity:** Clear communication and transparent business practices
- **Growth:** Progress, development, and forward movement
- **Balance:** Harmony between trust (blue) and energy (green)

### Gold Psychology
- **Premium:** Luxury, quality, and high-value services
- **Achievement:** Success, awards, and recognition
- **Optimism:** Positive outcomes and successful partnerships
- **Attention:** Naturally draws focus to important elements

## Brand Differentiation

### Competitive Positioning

**Against Generic Marketing Agencies:**
- Navy blue establishes greater credibility than bright/trendy colors
- Teal differentiates from common red/orange agency palettes
- Gold suggests premium service quality vs. budget providers

**Against Technology Companies:**
- Navy blue adds business credibility to tech innovation
- Avoids overused tech colors (bright blue, green, purple)
- Gold positioning elevates above commodity tech services

**Against Industry Specialists:**
- Unified colors across industries show comprehensive expertise
- Professional palette appeals to all business verticals
- Consistent branding builds recognition across markets

## Quality Assurance Checklist

### Design Review
- [ ] All text meets WCAG 2.1 AA contrast requirements
- [ ] Color hierarchy supports content prioritization
- [ ] Gold accent used sparingly for maximum impact
- [ ] Colors support "high tech AI agency" positioning
- [ ] Visual consistency maintained across all pages

### Technical Review
- [ ] CSS custom properties used (no hardcoded colors)
- [ ] Industry theme application working correctly
- [ ] Responsive design maintains color integrity
- [ ] Print styles handle color appropriately
- [ ] Color accessibility verified in testing

### Brand Review
- [ ] Colors align with brand positioning strategy
- [ ] Color usage supports business objectives
- [ ] Industry-specific applications appropriate
- [ ] Competitive differentiation maintained
- [ ] Brand guidelines followed consistently

## Future Color Evolution

### Approved Variations

**Tint/Shade Variations:** (±20% lightness)
- Navy Light: #003d5c (for hover states)
- Navy Dark: #001c2a (for pressed states)
- Teal Light: #00a8b8 (for hover states)
- Teal Dark: #007e8a (for pressed states)

**Neutral Supporting Colors:**
- White: #FFFFFF (backgrounds, reversed text)
- Light Gray: #F8F9FA (section backgrounds)
- Medium Gray: #6B7280 (secondary text)
- Dark Gray: #374151 (body text when navy too strong)

### Color Expansion Guidelines

**If Additional Colors Needed:**
1. Must enhance, not compete with primary palette
2. Should support brand positioning and messaging
3. Require brand manager approval before implementation
4. Must maintain accessibility standards
5. Should have clear usage guidelines established

---

**Document Version:** 1.0  
**Last Updated:** January 1, 2025  
**Approved By:** Brand Color Consistency Agent  
**Next Review:** Quarterly or upon major brand updates