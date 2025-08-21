# About Page Style Documentation

This document follows the visual flow of the About page from top to bottom. This page tells the company story, showcases values, and introduces the team.

## Navigation Bar
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Hero Section
*Full-width gradient header introducing the about page*

### Hero Container
**Current:**
- Background: Gradient from gray-900 through blue-900 to gray-900
- Overlay: Black with 20% opacity
- Text color: White
- Padding: 80px top and bottom

**New:**

### Hero Title
**Current:**
- Text: From universal content (e.g., "About Inteligencia Digital Marketing")
- Font size: 5xl on mobile, 6xl on desktop (48px/60px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom
- Text alignment: Center

**New:**

### Hero Subtitle
**Current:**
- Text: Multi-line subtitle from universal content
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom
- Max width: 768px (3xl)
- Centered with auto margins
- Preserves line breaks (whitespace-pre-line)

**New:**

---

## Founder Story Section
*Two-column layout introducing Laurie Meiring*

### Story Container
**Current:**
- Background: White
- Padding: 80px top and bottom
- Layout: 1 column on mobile, 2 columns on desktop
- Gap: 48px between columns
- Items aligned center

**New:**

### Story Content (Left Column)
**Current:**
- Animation: Slides in from left (-50px) on scroll
- Duration: 0.8s
- Viewport trigger: Once only

**New:**

#### Founder Name/Title
**Current:**
- Title: From universal content (e.g., "Meet Laurie Meiring")
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 8px bottom

**New:**

#### Founder Subtitle
**Current:**
- Text: Professional title (if available)
- Font size: xl (20px)
- Color: Gray-700
- Font weight: Medium (500)
- Margin: 8px bottom

**New:**

#### Founder Tagline
**Current:**
- Text: Personal tagline (if available)
- Font size: lg (18px)
- Color: Gray-600
- Font style: Italic
- Margin: 24px bottom

**New:**

#### Founder Description
**Current:**
- Font size: lg (18px)
- Color: Gray-700
- Margin: 24px bottom
- Line height: Normal

**New:**

#### Extended Story
**Current:**
- Font size: lg (18px)
- Color: Gray-700
- Margin: 24px bottom
- Continues the founder's story

**New:**

#### Approach Text
**Current:**
- Font size: lg (18px)
- Color: Gray-700
- Margin: 32px bottom
- Preserves line breaks (whitespace-pre-line)

**New:**

#### Certifications Section
**Current:**
- Header: "Degrees and Qualifications"
- Header font size: xl (20px)
- Header font weight: Semibold (600)
- Header color: Gray-900
- List spacing: 4px between items

**New:**

##### Individual Certifications
**Current:**
- Bullet style: "•" in gray-500
- Bullet margin: 8px right
- Text color: Gray-600
- Font size: Base (16px)

**New:**

### Founder Image (Right Column)
**Current:**
- Animation: Slides in from right (50px) on scroll
- Duration: 0.8s
- Viewport trigger: Once only

**New:**

#### Image Container
**Current:**
- Border radius: 2xl (16px)
- Overflow: Hidden
- Shadow: 2xl (large drop shadow)
- Position: Relative

**New:**

#### Founder Photo
**Current:**
- Source: From universal content
- Alt text: "Laurie Meiring, Founder of Inteligencia"
- Width: Full width
- Height: Auto
- Object fit: Cover

**New:**

#### Image Overlay
**Current:**
- Gradient: Black with 30% opacity at bottom, transparent at top
- Position: Absolute overlay on image

**New:**

---

## Company Values Section
*8 value cards in a grid layout*

### Values Container
**Current:**
- Background: Gray-50
- Padding: 80px top and bottom

**New:**

### Values Header
**Current:**
- Animation: Fade up from 20px on scroll
- Duration: 0.6s
- Viewport trigger: Once only
- Text alignment: Center
- Margin: 64px bottom

**New:**

#### Values Title
**Current:**
- Text: From universal content (e.g., "Our Core Values")
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom

**New:**

#### Values Subtitle
**Current:**
- Font size: xl (20px)
- Color: Gray-600
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Values Grid (First Row)
*First 4 values displayed in top row*

**Current:**
- Layout: 1 column on mobile, 2 on tablet, 4 on desktop
- Gap: 32px between cards

**New:**

### Values Grid (Second Row)
*Remaining 4 values in bottom row*

**Current:**
- Same layout as first row
- Margin: 32px top

**New:**

### Value Card (Individual)
**Current:**
- Background: White
- Border radius: xl (12px)
- Padding: 32px
- Shadow: lg (large drop shadow)
- Hover: Shadow increases to xl
- Transition: Shadow changes
- Text alignment: Center
- Animation: Fade up with stagger (0.1s delay per card)

**New:**

#### Value Icon
**Current:**
- Display: Flex justify center
- Margin: 16px bottom
- Icon handling: Text (4xl) for emojis, HTML for SVGs
- SVG size: 48px x 48px (w-12 h-12)
- SVG color: Primary

**New:**

#### Value Title
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 16px bottom

**New:**

#### Value Description
**Current:**
- Color: Gray-600
- Font size: Base (16px)
- Line height: Normal

**New:**

---

## Team Section (Admin Controlled)
*Only visible when admin settings enable it*

### Team Visibility Control
**Current:**
- Controlled by: adminSettings.showStaffSection
- Hidden by default
- Can be toggled via admin panel

**New:**

### Team Container
**Current:**
- Background: White
- Padding: 80px top and bottom
- Only renders if showStaffSection is true

**New:**

### Team Header
**Current:**
- Animation: Fade up from 20px on scroll
- Duration: 0.6s
- Viewport trigger: Once only
- Text alignment: Center
- Margin: 64px bottom

**New:**

#### Team Title
**Current:**
- Text: From universal content (e.g., "Meet Our Team")
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom

**New:**

#### Team Subtitle
**Current:**
- Font size: xl (20px)
- Color: Gray-600
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Team Grid
**Current:**
- Layout: 1 column on mobile, 2 on tablet, 3 on desktop
- Gap: 32px between cards

**New:**

### Team Member Card
**Current:**
- Background: Gray-50
- Border radius: xl (12px)
- Overflow: Hidden
- Shadow: lg (large drop shadow)
- Hover: Shadow increases to xl
- Transition: Shadow changes
- Animation: Fade up with stagger (0.1s delay per member)

**New:**

#### Member Photo Container
**Current:**
- Aspect ratio: Square (1:1)
- Overflow: Hidden

**New:**

#### Member Photo
**Current:**
- Width: Full
- Height: Full
- Object fit: Cover
- Hover: Scale 105%
- Transition: Transform 0.3s duration

**New:**

#### Member Info Container
**Current:**
- Padding: 24px

**New:**

#### Member Name
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 8px bottom

**New:**

#### Member Title
**Current:**
- Color: Primary
- Font weight: Medium (500)
- Margin: 16px bottom

**New:**

#### Member Bio
**Current:**
- Color: Gray-600
- Font size: sm (14px)
- Margin: 16px bottom

**New:**

#### Member Certifications (If Available)
**Current:**
- Header: "Certifications" (sm, semibold, gray-900, 8px bottom margin)
- Layout: Flex wrap with 8px gaps

**New:**

##### Certification Badge
**Current:**
- Background: Primary with 10% opacity
- Text color: Primary
- Font size: xs (12px)
- Padding: 4px horizontal, 2px vertical
- Border radius: Full (pill shape)

**New:**

---

## Call to Action Section
*Final CTA before footer*

### CTA Container
**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Text color: White
- Padding: 80px top and bottom
- Text alignment: Center

**New:**

### CTA Content
**Current:**
- Animation: Fade up from 20px on scroll
- Duration: 0.6s
- Viewport trigger: Once only

**New:**

#### CTA Title
**Current:**
- Text: From universal content
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### CTA Subtitle
**Current:**
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### CTA Buttons
**Current:**
- Layout: Flex column on mobile, row on desktop
- Gap: 16px between buttons
- Justify: Center

**New:**

#### Primary CTA Button
**Current:**
- Background: Gradient from pink-500 to rose-500
- Hover: From pink-600 to rose-600
- Text color: White
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Bold (700)
- Font size: lg (18px)
- Transition: All colors and transform
- Transform: Scale 105% on hover
- Text: From universal content (primary button)

**New:**

#### Secondary CTA Button
**Current:**
- Border: 2px solid white
- Text color: White
- Hover background: White
- Hover text color: Gray-900
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Bold (700)
- Font size: lg (18px)
- Transition: Colors
- Text: From universal content (secondary button)

**New:**

---

## Footer
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Responsive Behavior Notes

### Mobile (Under 640px)
- Two-column founder section becomes single column
- Values grid shows 1 column
- Team grid shows 1 column
- CTA buttons stack vertically
- Text sizes reduce appropriately

### Tablet (640px - 1024px)
- Founder section maintains 2 columns
- Values show 2 columns
- Team shows 2 columns
- Some text sizes between mobile and desktop

### Desktop (1024px+)
- Full layouts display properly
- Values show 4 columns (with 2 rows)
- Team shows 3 columns
- All hover effects active
- CTA buttons show horizontally

## Animation Timing
- Section animations trigger once on scroll into view
- Stagger effects use 0.1s delays between items
- Hover transitions are 0.3s duration
- Image scale effects are smooth and subtle
- All animations use Framer Motion library

## Content Source Notes
- All text content comes from universal-content.ts
- Team section visibility controlled by admin settings
- Founder image path configurable in universal content
- Values icons can be text (emojis) or HTML (SVGs)
- Certifications are arrays that can be empty