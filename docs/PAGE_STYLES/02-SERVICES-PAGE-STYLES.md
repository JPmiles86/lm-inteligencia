# Services Page Style Documentation

This document follows the visual flow of the Services page from top to bottom. This page shows a comprehensive overview of all marketing services offered.

## Navigation Bar
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Hero Section
*Full-width gradient header section*

### Hero Container
**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Text color: White
- Padding: 80px top and bottom
- Overlay: Black with 20% opacity over gradient

**New:**

### Hero Title
**Current:**
- Text: "[Industry] Marketing Services" (e.g., "Hospitality Marketing Services")
- Font size: 5xl on mobile, 6xl on desktop (48px/60px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom
- Text alignment: Center

**New:**

### Hero Subtitle
**Current:**
- Text: "Comprehensive digital marketing solutions designed specifically for your industry"
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

---

## Simplified Pricing Section
*Early pricing information to set expectations*

### Pricing Container
**Current:**
- Background: White
- Padding: 80px top and bottom

**New:**

### Pricing Header
**Current:**
- Title varies by industry
- Subtitle explains pricing approach
- Text alignment: Center
- Margin: 64px bottom

**New:**

### Pricing Cards
**Current:**
- Layout: 1 column on mobile, 3 columns on desktop
- Gap: 32px between cards
- Max width: 1280px (7xl)

**New:**

#### Essential Package Card
**Current:**
- Background: White
- Border: Gray-200
- Border radius: 2xl (16px)
- Padding: 32px
- Shadow: Large drop shadow
- Hover: Shadow increases

**New:**

##### Package Title
**Current:**
- Text: "Essential" or industry-specific name
- Font size: 2xl (24px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 16px bottom

**New:**

##### Package Price
**Current:**
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Primary (#371657)
- Format: "$X,XXX/month"
- Margin: 24px bottom

**New:**

##### Package Features List
**Current:**
- Check icons: Green-500, 16px x 16px
- Feature text: Gray-600, sm size (14px)
- Spacing: 12px between features
- Features vary by industry

**New:**

#### Professional Package Card (Featured)
**Current:**
- Background: Gradient from primary to purple
- Text: White
- Border: None
- Transform: Scale 105% on desktop
- "Most Popular" badge at top

**New:**

#### Enterprise Package Card
**Current:**
- Same styling as Essential but different content
- Features focus on advanced/premium services

**New:**

---

## Core Services Section
*Main services grid showing all offerings*

### Section Container
**Current:**
- Background: White
- Padding: 80px top and bottom
- Section ID: "services"

**New:**

### Section Header
**Current:**
- Title: "Our Digital Marketing Services"
- Subtitle: "Our comprehensive marketing services work together to drive growth and maximize your ROI."
- Text alignment: Center
- Margin: 64px bottom

**New:**

#### Section Title
**Current:**
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom

**New:**

#### Section Subtitle
**Current:**
- Font size: xl (20px)
- Color: Gray-600
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Services Grid
**Current:**
- Layout: 1 column on mobile, 2 on tablet, 3 on desktop
- Gap: 32px between cards

**New:**

### Service Card (Individual)
**Current:**
- Background: Gradient from gray-50 to white
- Border: Gray-100, 1px
- Border radius: xl (12px)
- Padding: 32px
- Hover: Shadow increases to xl
- Transition: Shadow change

**New:**

#### Service Icon
**Current:**
- Size: Text 4xl (emoji icons like 🏨, 📱, 📧)
- Position: Center top of card
- Margin: 24px bottom

**New:**

#### Service Title
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 16px bottom
- Examples: "Hotels Ad Management", "Meta Advertising", etc.

**New:**

#### Service Description
**Current:**
- Color: Gray-600
- Margin: 24px bottom
- Line height: Normal
- Content varies by service and industry

**New:**

#### Service Features List
**Current:**
- Check icons: Green-500, 16px x 16px
- Feature text: Gray-700, sm size (14px)
- Spacing: 8px between features
- Features are specific to each service

**New:**

---

## Final CTA Section
*Bottom call-to-action section*

### CTA Container
**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Text color: White
- Padding: 80px top and bottom

**New:**

### CTA Content
**Current:**
- Max width: 1024px (4xl)
- Centered with auto margins
- Text alignment: Center

**New:**

#### CTA Title
**Current:**
- Text: "Ready to Transform Your [Industry] Marketing?"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### CTA Description
**Current:**
- Text: "Let's discuss how our proven strategies can help grow your business. Schedule a free consultation with our [industry] marketing experts today."
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom

**New:**

#### CTA Button
**Current:**
- Background: White
- Text color: Primary
- Hover: Background gray-100
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Bold (700)
- Font size: lg (18px)
- Text: "Get Your Free Consultation"
- Transition: Colors and transform

**New:**

---

## Footer
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Responsive Behavior Notes

### Mobile (Under 640px)
- Hero text sizes reduce
- Pricing cards stack vertically
- Services grid becomes single column
- Padding reduces to maintain readability

### Tablet (640px - 1024px)
- Pricing cards may show 2 per row
- Services grid shows 2 columns
- Text sizes between mobile and desktop

### Desktop (1024px+)
- Full 3-column layouts display
- Hover effects are active
- Featured pricing card scales up
- Full spacing and padding applied

## Industry Variations

### Hospitality
- Services include: Hotels Ad Management, OTA Optimization, Restaurant Marketing
- Pricing typically higher due to specialized nature
- Industry-specific terminology throughout

### Healthcare  
- Services include: HIPAA-compliant marketing, local SEO emphasis
- Compliance messaging prominent
- Patient-focused language

### Tech/SaaS
- Services include: Product marketing, demand generation
- Technical terminology
- Focus on growth metrics

### Athletics/Sports
- Services include: Event marketing, facility promotion
- Community and engagement focused
- Seasonal considerations

## Animation Notes
- Service cards animate in with stagger effect on scroll
- Pricing cards have hover animations
- CTA section fades in from below
- All transitions use Framer Motion with 0.6s duration
- Stagger delays of 0.1s between items in grids