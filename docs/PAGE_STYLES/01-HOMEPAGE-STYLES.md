# Homepage Style Documentation

This document follows the visual flow of the homepage from top to bottom, exactly as a visitor experiences it. Use this guide while viewing the website to make specific style changes.

## Navigation Bar (Fixed at Top)
*Always visible at the top of the page*

### Navigation Container
**Current:** 
- Position: Fixed top-0 (always at top)
- Background: White with 95% opacity + blur effect
- Height: 80px on mobile, 96px on desktop
- Shadow: Drop shadow underneath
- Z-index: 50 (above all content)

**New:** 

### Logo Section
**Current:**
- Logo image: "/LM_inteligencia/Inteligencia-logo-new.png"
- Logo size: 40px height (mobile), 48px height (desktop)
- Brand text: "Inteligencia" in primary color (#371657)
- Font: Default system font, 2xl size, medium weight
- Hover effect: Scales to 105%

**New:**

### Navigation Menu (Desktop)
**Current:**
- Links: Services, About, Case Studies, Contact
- Font: Medium weight, gray-700 color
- Hover: Changes to primary color (#371657)
- Spacing: 32px between items

**New:**

### Get Started Button
**Current:**
- Background: Secondary color (#f04a9b)
- Text: White
- Padding: 32px horizontal, 12px vertical
- Border radius: lg (8px)
- Hover: Opacity 90%, scale 105%

**New:**

### Mobile Menu Button
**Current:**
- Shows hamburger icon on screens under 1024px
- Size: 24px x 24px
- Color: Gray-700

**New:**

---

## Landing Area / Industry Selection
*The first screen visitors see - full height section*

### Landing Container
**Current:**
- Height: Full screen (100vh)
- Background: White/transparent
- Layout: Centered content vertically and horizontally
- Padding: 32px on sides

**New:**

### Logo (Large Version)
**Current:**
- Image: Same as navbar logo but larger
- Size: 400px width, auto height
- Position: Center top of landing area
- Margin: 64px bottom
- Animation: Floating up/down when industry selected

**New:**

### Main Heading "inteligencia"
**Current:**
- Font: Poppins, sans-serif
- Size: 6xl (60px)
- Weight: 400 (normal)
- Color: Primary (#371657)
- Letter spacing: -0.02em
- Margin: 16px bottom

**New:**

### Subtitle "digital marketing"
**Current:**
- Font: Poppins, sans-serif
- Size: 2xl (24px)  
- Weight: 300 (light)
- Color: Primary (#371657)
- Margin: 48px bottom

**New:**

### Tagline Text
**Current:**
- Text: "intelligent marketing solutions that drive real results"
- Font: Poppins, sans-serif
- Size: xl (20px)
- Weight: 300 (light)
- Color: #666 (gray)
- Max width: 672px (2xl)
- Margin: 96px bottom, auto centered

**New:**

### Industry Selection Cards
*Four cards in a horizontal row*

**Current:**
- Layout: 4 cards in a row with 80px gaps
- Card hover: Scale 102%, text color changes to pink (#f04a9b)
- Animation: When selected, other cards fade out and selected card centers

**New:**

#### Card 1: Hospitality & Lifestyle
**Current:**
- Title: "hospitality & lifestyle" (2xl, light weight, primary color)
- Subtitle: "hotels • restaurants • travel & tourism" (sm, gray)
- Padding: 16px
- Border radius: lg (8px)

**New:**

#### Card 2: Health & Wellness  
**Current:**
- Title: "health & wellness" (2xl, light weight, primary color)
- Subtitle: "dentistry • health clinics • retreats • fitness" (sm, gray)
- Padding: 16px
- Border radius: lg (8px)

**New:**

#### Card 3: Tech & AI
**Current:**
- Title: "tech & AI" (2xl, light weight, primary color)
- Subtitle: "SaaS • AI startups • martech • platforms" (sm, gray)
- Padding: 16px
- Border radius: lg (8px)

**New:**

#### Card 4: Sport & Media
**Current:**
- Title: "sport & media" (2xl, light weight, primary color)
- Subtitle: "pickleball • events • tournaments • media" (sm, gray)
- Padding: 16px
- Border radius: lg (8px)

**New:**

### Scroll Indicator (When Industry Selected)
**Current:**
- Position: Absolute bottom, 48px from bottom
- Icon: ChevronDown, 40px size, gray (#666)
- Animation: Bouncing animation
- Text: "Scroll to explore" (appears after 2 seconds)
- Font: Poppins, sm size

**New:**

---

## Hero Section
*Appears after industry selection, full screen section*

### Hero Container
**Current:**
- Background: White (minimal background mode)
- Height: Full viewport (100vh minimum)
- Layout: Flex, centered content
- Padding: None (handled by inner content)

**New:**

### Hero Title
**Current:**
- Font size: 5xl on mobile, 6xl on tablet, 7xl on desktop (48px/60px/72px)
- Font weight: Bold (700)
- Color: Gray-900 (almost black)
- Letter spacing: -0.02em
- Line height: Tight
- Margin: 32px bottom

**New:**

### Hero Subtitle  
**Current:**
- Font size: xl on mobile, 2xl on tablet, 3xl on desktop (20px/24px/30px)
- Color: Gray-600
- Max width: 896px (4xl)
- Centered with auto margins
- Margin: 48px bottom
- Line height: Relaxed

**New:**

### Hero CTA Button
**Current:**
- Background: Secondary color (#f04a9b)
- Text: White
- Padding: 40px horizontal, 20px vertical
- Font size: lg (18px)
- Font weight: Semibold (600)
- Border radius: lg (8px)
- Shadow: Medium drop shadow
- Hover: Opacity 90%, scale 102%

**New:**

### Stats Section
*Three stat cards in a row below the CTA*

**Current:**
- Layout: 1 column on mobile, 3 columns on desktop
- Gap: 32px between cards
- Max width: 896px (4xl), centered

**New:**

#### Stat Numbers
**Current:**
- Font size: 3xl on mobile, 4xl on tablet, 5xl on desktop
- Font weight: Bold (700)
- Color: Blue (#0f5bfb) when minimal background
- Animation: Animated counter from 0 to target number

**New:**

#### Stat Labels
**Current:**
- Font size: lg (18px)
- Color: Gray-600
- Positioned below numbers

**New:**

---

## Video Background Section
*Full-screen video section*

### Video Container
**Current:**
- Height: 85vh (85% of viewport height)
- Background: Black
- Position: Relative
- Overflow: Hidden
- Gradient placeholder: From gray-900 to gray-800 to gray-900

**New:**

### Loading Indicator
*Shows while video is loading*

**Current:**
- Size: 64px x 64px (4rem)
- Border: 4px solid white with 20% opacity
- Border top: White with 60% opacity
- Animation: Spinning
- Position: Center of video area

**New:**

### Video Player (Embedded Vimeo)
**Current:**
- Position: Absolute, centered with transform
- Width: 100vw (full viewport width)
- Height: 56.25vw (maintains 16:9 aspect ratio)
- Minimum height: 100vh
- Minimum width: 177.77vh (16:9 aspect ratio)
- No border
- Opacity transition: 0.5s duration

**New:**

---

## Services Section
*Main services showcase section*

### Section Container
**Current:**
- Padding: 128px top and bottom (py-32)
- Background: Gray-50 (light gray)
- Section ID: "services"

**New:**

### Section Header
**Current:**
- Text alignment: Center
- Margin: 96px bottom (mb-24)

**New:**

### Section Title
**Current:**
- Text: "Marketing That Moves The Metrics That Matter"
- Font size: 5xl on mobile, 6xl on desktop (48px/60px)
- Font weight: Bold (700)
- Color: Black (#000)
- Letter spacing: -0.02em
- Margin: 32px bottom
- Line break after "Moves The"

**New:**

### Section Subtitle
**Current:**
- Font size: xl (20px)
- Color: Gray-600
- Max width: 768px (3xl)
- Centered with auto margins
- Line height: Relaxed

**New:**

### Service Cards (Mobile Layout)
*On mobile and tablet, services show as individual cards*

**Current:**
- Background: White
- Border radius: 2xl (16px)
- Shadow: Large drop shadow
- Overflow: Hidden
- Spacing: 32px between cards (space-y-8)

**New:**

#### Service Card Image
**Current:**
- Height: 256px (h-64)
- Width: Full width
- Object fit: Cover
- Position: Top of each card

**New:**

#### Service Card Content
**Current:**
- Padding: 32px all around (p-8)

**New:**

#### Service Icon (In Card)
**Current:**
- Padding: 12px (p-3)
- Border radius: xl (12px)
- Background: Pink with 6% opacity (rgba(240, 74, 155, 0.06))
- Icon size: 48px x 48px (w-12 h-12)

**New:**

#### Service Title (In Card)
**Current:**
- Font size: 2xl on mobile (24px), xl on desktop list (20px)
- Font weight: Bold on mobile (700), semibold on desktop (600)
- Color: Black (#000)
- Margin: 8px bottom (mb-2)

**New:**

#### Service Key Benefit
**Current:**
- Color: Gray-600
- Font size: Base on mobile (16px), sm on desktop (14px)

**New:**

#### Service Description
**Current:**
- Color: Gray-600
- Margin: 24px bottom (mb-6)
- Line height: Relaxed
- Font size: lg on detail panel (18px)

**New:**

#### Service Features List
**Current:**
- Spacing: 12px between items on mobile, 16px on desktop
- Check icon: 20px x 20px, secondary color
- Feature text: Gray-700

**New:**

### Desktop Service Detail Panel
*Right side panel on desktop view*

**Current:**
- Background: White
- Border radius: 2xl (16px)
- Shadow: Large drop shadow
- Padding: 40px (p-10)
- Position: Sticky, 32px from top

**New:**

### Service Learn More Links
**Current:**
- Color: Secondary (#f04a9b)
- Font weight: Semibold (600)
- Hover: Opacity 80%
- Text: "Learn More →"

**New:**

### Services CTA Section
*Bottom call-to-action area in services*

**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Border radius: 3xl (24px)
- Padding: 48px (p-12)
- Max width: 896px (4xl)
- Margin: 96px top, auto centered

**New:**

#### Services CTA Title
**Current:**
- Text: "Ready to Get Started?"
- Font size: 3xl (30px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### Services CTA Description
**Current:**
- Color: Gray-300
- Margin: 40px bottom
- Font size: lg (18px)

**New:**

#### Services CTA Button
**Current:**
- Background: Gradient from pink-500 to rose-500
- Hover: From pink-600 to rose-600
- Text: White
- Padding: 40px horizontal, 16px vertical
- Border radius: xl (12px)
- Font weight: Medium (500)
- Transform: Scale 102% on hover
- Text: "Schedule Free Consultation"

**New:**

---

## Contact Section
*Final homepage section before footer*

### Contact Container
**Current:**
- Section ID: "contact"
- Padding: 80px top and bottom (py-20)
- Background: Gray-50
- Text alignment: Center

**New:**

### Contact Title
**Current:**
- Text: "Ready to Transform Your [Industry] Marketing?"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Margin: 32px bottom
- Color: Primary (CSS variable)

**New:**

### Contact Description
**Current:**
- Font size: xl (20px)
- Color: Gray-600
- Margin: 32px bottom
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Contact Buttons Container
**Current:**
- Display: Flex column on mobile, row on desktop
- Gap: 16px between buttons
- Justify: Center

**New:**

#### Primary Contact Button
**Current:**
- Background: Secondary (CSS variable - #f04a9b)
- Text: White
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Semibold (600)
- Hover: Opacity 90%, scale 105%
- Text: "Schedule Free Consultation"

**New:**

#### Secondary Contact Button
**Current:**
- Border: 2px solid secondary color
- Text color: Secondary color
- Background: Transparent
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Semibold (600)
- Hover: Background secondary, text white, scale 105%
- Text: "View Our Services"

**New:**

---

## Footer
*Site-wide footer section*

### Footer Container
**Current:**
- Background: Black
- Text: White
- Padding: 48px top and bottom

**New:**

### Footer Content Grid
**Current:**
- Layout: 1 column on mobile, 4 columns on desktop
- Gap: 32px between sections

**New:**

#### Company Info Column
**Current:**
- Brand name: "Inteligencia" (2xl, bold)
- Description: Industry-specific tagline
- Text color: Gray-400

**New:**

#### Services Column
**Current:**
- Header: "Services" (bold, white)
- List: First 4 services from config
- Text color: Gray-400

**New:**

#### Industries Column
**Current:**
- Header: "Industries" (bold, white)  
- List: "Hotels & Hospitality", "Restaurants & Food Service", "Healthcare", "Sports & Recreation"
- Text color: Gray-400

**New:**

#### Contact Column
**Current:**
- Header: "Contact" (bold, white)
- Email and phone from config
- Text color: Gray-400

**New:**

### Footer Bottom
**Current:**
- Border top: Gray-800
- Margin: 32px top, 32px bottom padding
- Text: Center aligned, gray-400
- Copyright: "© 2025 Inteligencia. All rights reserved."

**New:**

---

## Responsive Behavior Notes

### Mobile (Under 640px)
- Navigation collapses to hamburger menu
- Industry cards may stack vertically
- Service cards show full width
- Text sizes reduce appropriately

### Tablet (640px - 1024px)  
- Partial navigation collapse
- Industry cards maintain horizontal layout
- Service detail panel may hide

### Desktop (1024px+)
- Full navigation visible
- Service detail panel shows on right
- All hover effects active
- Maximum content widths apply

## Animation Notes
- All sections use Framer Motion for smooth transitions
- Scroll-triggered animations reveal content as user scrolls
- Hover states provide immediate feedback
- Industry selection triggers complex layout animations
- Video section includes loading states and smooth video integration

## Brand Colors Reference
- **Primary:** #371657 (Deep Purple)
- **Secondary:** #f04a9b (Vibrant Pink)  
- **Accent:** #176ab2 (Professional Blue)
- **Gray Scale:** Black → #111827 → #374151 → #6b7280 → #9ca3af → #d1d5db