# Style Documentation Redesign Task - Plain English Version

## Current Problem
The existing PAGE_STYLES documentation is too technical with hex codes, pixel values, and Tailwind classes. Laurie needs plain English descriptions he can understand.

## Issues to Fix
1. **Contact Link Bug**: On homepage, Contact link scrolls to bottom instead of going to Contact page
2. **Scroll Position Bug**: When navigating between pages, should start at top of new page
3. **Video Loading**: Gray background shows for too long before video loads
4. **Console Errors**: 28+ errors showing in F12 console logs

## New Documentation Format Needed

### Global Typography Document
Create one document that defines all text styles site-wide:
- H1: Size (Large/Medium/Small), Color, Weight (Bold/Normal)
- H2: Size, Color, Weight
- H3: Size, Color, Weight
- Paragraph: Size, Color
- Button Text: Size, Weight
- Links: Color, Hover behavior

### Page-by-Page Documents (Plain English)
Each page document should describe elements like this:

```
HERO SECTION
Background: White (or None)
Contents:
  - Main Title: "Digital marketing that drives occupancy" 
    Style: Large bold text, Black color
  - Subtitle: "Drive direct bookings"
    Style: Medium text, Gray color
  - Button: "Book Your Free Consultation"
    Style: Pink background, White text, Rounded corners
  - Statistics: 
    Numbers: Large blue text
    Labels: Small gray text ("Increase in direct bookings")
```

### What to Document
- Colors in plain terms (Pink, Gray, White, Black, Blue, Purple)
- Sizes in relative terms (Large, Medium, Small)
- Shapes (Rounded corners, Circle, Square)
- Hover effects in plain language ("Gets bigger", "Changes to pink", "Shows shadow")
- Backgrounds and gradients ("Purple fading to black from top to bottom")

### Required Documents
1. `GLOBAL-TEXT-STYLES.md` - All H1, H2, paragraph definitions
2. `HEADER-FOOTER-STYLES.md` - Navigation and footer
3. `01-HOMEPAGE-HOSPITALITY-STYLES.md` - Homepage elements
4. `02-SERVICES-PAGE-STYLES.md` - Services page
5. `03-ABOUT-PAGE-STYLES.md` - About page
6. `04-CASE-STUDIES-PAGE-STYLES.md` - Case studies
7. `05-CONTACT-PAGE-STYLES.md` - Contact page

## Bugs to Fix
1. Contact link on homepage scrolls to bottom instead of navigating
2. Page navigation should reset scroll to top
3. Video loading delay issue
4. Console errors growing

## Example Format
```
SERVICES SECTION
Background: Gray
Title: "Marketing that moves the metrics that matter"
  - Style: Large bold black text
Subtitle: "AI strategies for hotels"
  - Style: Medium gray text

SERVICE CARDS (Left side - smaller cards)
Card Background: Same as section (gray), White on hover with shadow
Each Card Has:
  - Icon: Black (turns pink on hover)
  - Title: Bold black text, medium size
  - Description: Gray text, small size
  
Icons for each service:
  - Hotel Ads Management: Hotel/Suitcase icon
  - Meta/Facebook Ads: Facebook icon
  - [List all 9 services with their icons]

FEATURED SERVICE (Right side - big card)
Image: Rounded corners
Title: Medium bold black text
Subtitle: Small gray text
Key Benefit Box:
  - Background: Light gray with rounded corners
  - "Key Benefit" label: Small gray text
  - Benefit text: Medium bold pink text
Learn More Button: Pink background, white text, rounded corners
```

## Success Criteria
- Laurie can read and understand without any coding knowledge
- Uses plain English (no hex codes, no pixels, no technical terms)
- Describes visual appearance as a person would describe it
- Includes all hover states and animations in simple terms
- Follows the actual visual flow of each page