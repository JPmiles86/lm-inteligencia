# Case Studies Page Style Documentation

This document follows the visual flow of the Case Studies page from top to bottom. This page showcases client success stories in an alternating timeline layout.

## Navigation Bar
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Hero Section
*Full-width gradient header with success statistics*

### Hero Container
**Current:**
- Background: Gradient from gray-900 through blue-900 to gray-900
- Overlay: Black with 20% opacity
- Text color: White
- Padding: 80px top and bottom
- Overflow: Hidden

**New:**

### Hero Title
**Current:**
- Text: "Client Success Stories"
- Font size: 5xl on mobile, 6xl on desktop (48px/60px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom
- Text alignment: Center

**New:**

### Hero Subtitle
**Current:**
- Text: "Real results from real businesses. See how Inteligencia transforms challenges into success stories."
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Success Statistics Grid
*Four stat cards showing key metrics*

**Current:**
- Layout: 2 columns on mobile, 4 columns on desktop
- Gap: 32px between cards
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

#### Stat Card (Individual)
**Current:**
- Text alignment: Center

**New:**

##### Stat Number
**Current:**
- Font size: 3xl (30px)
- Font weight: Bold (700)
- Color: Secondary (#f04a9b)
- Margin: 8px bottom

**New:**

##### Stat Label
**Current:**
- Color: Gray-300
- Font size: Base (16px)

**New:**

#### Stat Examples
**Current:**
- "4 Industries"
- "100+ Success Stories"
- "$2.8M Revenue Generated"
- "95% Client Retention"

**New:**

---

## Filter Controls Section
*Filter bar for industry and tag selection*

### Controls Container
**Current:**
- Background: Gray-50
- Padding: 32px top and bottom
- Border bottom: Gray-200, 1px

**New:**

### Controls Content
**Current:**
- Layout: Flex column on mobile, row on desktop
- Justify: Between on desktop, start on mobile
- Items aligned: Start on mobile, center on desktop
- Gap: 16px

**New:**

### Industry Filter
**Current:**
- Layout: Flex items center with 8px gap

**New:**

#### Filter Label
**Current:**
- Text: "Industry:"
- Font size: sm (14px)
- Font weight: Medium (500)
- Color: Gray-700
- Margin: 8px right

**New:**

#### Industry Dropdown
**Current:**
- Background: White
- Border: Gray-200, 1px
- Border radius: lg (8px)
- Padding: 16px horizontal, 8px vertical
- Font size: sm (14px)
- Focus: Ring-2 ring-primary, border transparent

**New:**

#### Dropdown Options
**Current:**
- Options: "All Industries", "Hotels & Hospitality", "Restaurants & Food Service", "Healthcare", "Sports & Recreation"

**New:**

### Active Tag Filters (When Present)
**Current:**
- Layout: Flex items center, wrap enabled
- Gap: 8px between items

**New:**

#### Filter Label
**Current:**
- Text: "Filters:"
- Font size: sm (14px)
- Font weight: Medium (500)
- Color: Gray-700

**New:**

#### Active Tag Badge
**Current:**
- Background: Primary
- Text color: White
- Padding: 12px horizontal, 4px vertical
- Border radius: Full (pill)
- Font size: sm (14px)
- Layout: Flex items center with 4px gap
- Cursor: Pointer
- Hover: Background primary with 90% opacity

**New:**

##### Tag Remove Icon
**Current:**
- Size: 12px x 12px (w-3 h-3)
- Stroke: Current color
- Path: X icon

**New:**

#### Clear All Button
**Current:**
- Text: "Clear all"
- Font size: sm (14px)
- Color: Gray-500
- Hover color: Gray-700

**New:**

---

## Case Studies Timeline Section
*Main content area with alternating case study cards*

### Timeline Container
**Current:**
- Background: White
- Padding: 80px top and bottom

**New:**

### Timeline Content
**Current:**
- Position: Relative
- Center line (desktop only): Absolute, left 50%, 4px wide, gray-300, full height

**New:**

### Case Study Entry
*Individual case study in timeline format*

**Current:**
- Layout: Flex column on mobile, row on desktop
- Items aligned: Center
- Margin: 64px bottom
- Alternating direction: Even index normal, odd index reverse on desktop
- Animation: Fade in from left/right (alternates), 0.6s duration, 0.2s stagger delay

**New:**

### Case Study Card Side
*Left side of each timeline entry (alternates)*

**Current:**
- Width: Full on mobile, 50% on desktop
- Padding: 32px right on even entries, 32px left on odd entries (desktop only)
- Margin: 32px bottom on mobile

**New:**

#### Case Study Card
**Current:**
- Background: White
- Border radius: 2xl (16px)
- Shadow: xl (extra large drop shadow)
- Overflow: Hidden

**New:**

##### Case Study Image
**Current:**
- Height: 192px (h-48)
- Width: Full
- Overflow: Hidden
- Object fit: Cover
- Alt text: Client name

**New:**

##### Card Content Container
**Current:**
- Padding: 24px on mobile, 32px on desktop

**New:**

##### Industry Badge and Duration
**Current:**
- Layout: Flex items center with 8px gap
- Margin: 16px bottom

**New:**

###### Industry Badge
**Current:**
- Background: Primary
- Text color: White
- Padding: 12px horizontal, 4px vertical
- Border radius: Full (pill)
- Font size: sm (14px)
- Font weight: Medium (500)

**New:**

###### Duration Label
**Current:**
- Text: "6 months"
- Font size: sm (14px)
- Color: Gray-500

**New:**

##### Client Name Title
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 16px bottom

**New:**

##### Challenge Section
**Current:**
- Margin: 16px bottom

**New:**

###### Challenge Header
**Current:**
- Text: "Challenge"
- Font weight: Semibold (600)
- Color: Gray-900
- Margin: 8px bottom

**New:**

###### Challenge Text
**Current:**
- Color: Gray-600
- Font size: sm (14px)

**New:**

##### Solution Section
**Current:**
- Margin: 16px bottom

**New:**

###### Solution Header
**Current:**
- Text: "Solution"
- Font weight: Semibold (600)
- Color: Gray-900
- Margin: 8px bottom

**New:**

###### Solution Text
**Current:**
- Color: Gray-600
- Font size: sm (14px)

**New:**

##### Results Grid
**Current:**
- Layout: 3 columns with 16px gaps
- Padding: 16px top
- Border top: Gray-200, 1px

**New:**

###### Individual Result
**Current:**
- Text alignment: Center

**New:**

####### Result Value
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Primary
- Margin: 4px bottom

**New:**

####### Result Metric
**Current:**
- Font size: xs (12px)
- Color: Gray-600

**New:**

##### Timeline Button
**Current:**
- Width: Full
- Margin: 16px top
- Background: Gray-100
- Hover background: Gray-200
- Text color: Gray-700
- Padding: 8px vertical, 16px horizontal
- Border radius: lg (8px)
- Transition: Colors
- Layout: Flex items center justify center with 8px gap

**New:**

###### Timeline Icon
**Current:**
- Size: 20px x 20px (w-5 h-5)
- Stroke: Current color
- Path: Clock icon

**New:**

###### Timeline Button Text
**Current:**
- Text: "View Journey Timeline"

**New:**

##### Tags Container
**Current:**
- Layout: Flex wrap with 8px gaps
- Padding: 16px top

**New:**

###### Individual Tag
**Current:**
- Font size: xs (12px)
- Background: Gray-100
- Text color: Gray-700
- Padding: 8px horizontal, 4px vertical
- Border radius: Full (pill)
- Cursor: Pointer
- Hover background: Gray-200
- Transition: Colors
- Click behavior: Toggles tag filter

**New:**

### Timeline Center Point (Desktop)
*Circular indicator on center line*

**Current:**
- Position: Absolute, left 50%, centered
- Size: 24px x 24px (w-6 h-6)
- Background: Primary
- Border radius: Full (circle)
- Border: 4px solid white
- Shadow: lg (large drop shadow)
- Hidden on mobile (lg:block)

**New:**

### Testimonial Side
*Right side of timeline entry (alternates)*

**Current:**
- Width: Full on mobile, 50% on desktop
- Padding: 32px left on even entries, 32px right on odd entries (desktop only)

**New:**

#### Testimonial Card
**Current:**
- Background: Gray-100
- Border radius: xl (12px)
- Padding: 24px

**New:**

##### Quote Text
**Current:**
- Color: Gray-700
- Font style: Italic
- Margin: 16px bottom
- Format: Wrapped in quotation marks

**New:**

##### Author Info
**Current:**
- Layout: Flex items center with 12px gap

**New:**

###### Author Avatar
**Current:**
- Size: 48px x 48px (w-12 h-12)
- Background: Primary
- Border radius: Full (circle)
- Layout: Flex items center justify center
- Text color: White
- Font weight: Bold (700)
- Content: Author initials

**New:**

###### Author Details Container
**Current:**
- Layout: Flex column

**New:**

####### Author Name
**Current:**
- Font weight: Semibold (600)
- Color: Gray-900

**New:**

####### Author Position
**Current:**
- Font size: sm (14px)
- Color: Gray-600

**New:**

---

## Call to Action Section
*Final CTA encouraging prospects to become clients*

### CTA Container
**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Text color: White
- Padding: 80px top and bottom
- Text alignment: Center

**New:**

### CTA Content
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only

**New:**

#### CTA Title
**Current:**
- Text: "Ready to Become Our Next Success Story?"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### CTA Subtitle
**Current:**
- Text: "Join the businesses that have transformed their marketing and achieved remarkable results with Inteligencia."
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
- Transition: All properties
- Transform: Scale 105% on hover
- Text: "Get Your Free Analysis"
- Link: "/contact"

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
- Text: "View Our Services"
- Link: "/services"

**New:**

---

## Timeline Modal
*Overlay modal showing detailed case study journey*

### Modal Visibility
**Current:**
- Triggered by: "View Journey Timeline" button clicks
- State: selectedTimeline (case study ID)
- Component: CaseStudyTimeline

**New:**

### Modal Props
**Current:**
- studyId: Selected case study ID
- clientName: Client name from case study data
- timeline: "6 months"
- points: Generated timeline data with 4 phases
- onClose: Function to clear selectedTimeline

**New:**

### Timeline Data Structure
**Current:**
- Phase 1: "Partnership Begins" (Day 1)
- Phase 2: "Implementation Phase" (Month 1)
- Phase 3: "First Results" (Month 3)
- Phase 4: "Full Results Achieved" (6 months)

**New:**

---

## Footer
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Responsive Behavior Notes

### Mobile (Under 640px)
- Timeline becomes single column layout
- Center line and timeline points hidden
- Case study cards full width
- Statistics grid shows 2 columns
- CTA buttons stack vertically

### Tablet (640px - 1024px)
- Timeline maintains alternating layout
- Some timeline visual elements may adjust
- Statistics may show 3-4 columns

### Desktop (1024px+)
- Full alternating timeline layout
- Center line and timeline points visible
- All hover effects active
- 4-column statistics grid
- CTA buttons horizontal

## Animation Details
- Case studies animate in with alternating slide directions
- Stagger effect with 0.2s delays between entries
- Timeline modal has overlay fade and slide animations
- Tag clicks provide immediate visual feedback
- Filter changes trigger re-renders with animations

## Interactive Features
- Industry filter dropdown affects visible case studies
- Tag badges are clickable filters that can be combined
- Timeline buttons open detailed journey modals
- Active filter badges can be individually removed
- "Clear all" removes all active tag filters

## Content Notes
- Case studies pulled from all industry configurations
- Filtering works across multiple criteria simultaneously
- Timeline data generated dynamically from case study results
- Images display with proper fallbacks if missing
- Author avatars show initials when no photo available