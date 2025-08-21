# Navigation & Layout Styles Inventory

This document catalogs all styling elements for navigation, header, and footer components.

## Industry Navbar

### Navbar Container
**Location:** Fixed top navigation bar  
**Current Style:**
- Position: fixed top-0 left-0 right-0
- Z-Index: 50
- Background: white/95 with backdrop-blur-sm
- Box Shadow: lg
- Transition: all duration-300
- Animation: initial y: -100, animate y: 0, duration: 0.6s

**New Style:**
[Leave blank for client to fill in]

### Navbar Inner Container
**Location:** Content wrapper inside navbar  
**Current Style:**
- Max Width: 7xl (80rem)
- Margin: 0 auto
- Padding: px-4 sm:px-6 lg:px-8 (1rem, 1.5rem, 2rem)
- Height: 20 lg:24 (5rem / 6rem)
- Display: flex items-center justify-between
- Padding Y: 2 (0.5rem)

**New Style:**
[Leave blank for client to fill in]

### Logo Container
**Location:** Left side of navbar  
**Current Style:**
- Display: flex items-center
- Gap: 3 (0.75rem)
- Hover: scale 1.05 (Framer Motion)

**New Style:**
[Leave blank for client to fill in]

### Logo Image
**Location:** Logo in navbar  
**Current Style:**
- Image: "/LM_inteligencia/Inteligencia-logo-new.png"
- Height: 10 lg:12 (2.5rem / 3rem)
- Object Fit: contain
- Alt: "Inteligencia Digital Marketing"

**New Style:**
[Leave blank for client to fill in]

### Brand Name
**Location:** Next to logo in navbar  
**Current Style:**
- Font Size: 2xl (1.5rem)
- Font Weight: medium (500)
- Color: primary (CSS variable - #371657)
- Font Family: inherit
- Text: "Inteligencia"

**New Style:**
[Leave blank for client to fill in]

### Desktop Navigation Menu
**Location:** Right side of navbar on desktop  
**Current Style:**
- Display: hidden lg:flex items-center
- Space: x-8 (2rem)

**New Style:**
[Leave blank for client to fill in]

### Navigation Links
**Location:** Desktop navigation menu items  
**Current Style:**
- Font Weight: medium (500)
- Color: gray-700
- Hover: text-primary color
- Transition: colors
- Links: Services, About, Case Studies, Blog (conditional), Contact

**New Style:**
[Leave blank for client to fill in]

### Primary CTA Button (Navbar)
**Location:** Rightmost button in desktop nav  
**Current Style:**
- Background: secondary (CSS variable - #f04a9b)
- Text Color: white
- Padding: px-8 py-3 (2rem horizontal, 0.75rem vertical)
- Border Radius: lg (0.5rem)
- Font Weight: medium (500)
- Hover: opacity-90
- Transform: hover:scale-105
- Transition: all duration-300
- Text: "Get Started" (from universal content)

**New Style:**
[Leave blank for client to fill in]

### Mobile Menu Button
**Location:** Right side of navbar on mobile  
**Current Style:**
- Display: lg:hidden
- Padding: 2 (0.5rem)
- Border Radius: md (0.375rem)
- Color: gray-700
- Hover: text-gray-900
- Transition: colors
- Icon Size: w-6 h-6 (1.5rem x 1.5rem)

**New Style:**
[Leave blank for client to fill in]

### Mobile Menu Dropdown
**Location:** Below navbar on mobile when opened  
**Current Style:**
- Display: lg:hidden
- Background: white/95 backdrop-blur-sm
- Border Top: border-gray-200
- Overflow: hidden
- Animation: initial opacity: 0 height: 0, animate opacity: 1 height: auto
- Transition: duration 0.3s

**New Style:**
[Leave blank for client to fill in]

### Mobile Menu Items
**Location:** Inside mobile dropdown  
**Current Style:**
- Padding: px-4 py-6 (1rem horizontal, 1.5rem vertical)
- Space: y-4 (1rem)
- Links: block w-full text-left py-2
- Color: gray-700
- Hover: text-primary
- Transition: colors

**New Style:**
[Leave blank for client to fill in]

### Mobile CTA Button
**Location:** Bottom of mobile menu  
**Current Style:**
- Display: block w-full
- Background: secondary (CSS variable - #f04a9b)
- Text Color: white
- Padding: px-8 py-3 (2rem horizontal, 0.75rem vertical)
- Border Radius: lg (0.5rem)
- Font Weight: medium (500)
- Text Alignment: center
- Hover: opacity-90
- Transform: hover:scale-105
- Transition: all duration-300

**New Style:**
[Leave blank for client to fill in]

### Navbar Spacer
**Location:** Below fixed navbar on subpages  
**Current Style:**
- Height: 20 lg:24 (5rem / 6rem)
- Only shown on non-seamless pages
- Background: transparent

**New Style:**
[Leave blank for client to fill in]

## Footer

### Footer Container
**Location:** Bottom of all pages  
**Current Style:**
- Background: black
- Text Color: white
- Padding: py-12 (3rem top/bottom)

**New Style:**
[Leave blank for client to fill in]

### Footer Grid Container
**Location:** Main content area of footer  
**Current Style:**
- Max Width: 7xl (80rem)
- Margin: 0 auto
- Padding: px-4 sm:px-6 lg:px-8 (1rem, 1.5rem, 2rem)
- Display: grid grid-cols-1 md:grid-cols-4
- Gap: 8 (2rem)

**New Style:**
[Leave blank for client to fill in]

### Footer Logo Section
**Location:** First column of footer  
**Current Style:**
- Display: flex items-center gap-2
- Margin Bottom: 4 (1rem)

**New Style:**
[Leave blank for client to fill in]

### Footer Logo
**Location:** Company info section of footer  
**Current Style:**
- Image: "/LM_inteligencia/Inteligencia-logo-new.png"
- Height: 8 (2rem)
- Object Fit: contain
- Alt: "Inteligencia"

**New Style:**
[Leave blank for client to fill in]

### Footer Brand Name
**Location:** Next to footer logo  
**Current Style:**
- Font Size: 2xl (1.5rem)
- Font Weight: bold (700)
- Color: white
- Text: "Inteligencia"

**New Style:**
[Leave blank for client to fill in]

### Footer Description
**Location:** Below footer logo section  
**Current Style:**
- Color: gray-400
- Margin Bottom: 4 (1rem)
- Text: "Smart marketing solutions that drive real results for [industry]"

**New Style:**
[Leave blank for client to fill in]

### Footer Section Headers
**Location:** Column headers in footer  
**Current Style:**
- Font Weight: bold (700)
- Margin Bottom: 4 (1rem)
- Color: white
- Headers: "Services", "Industries", "Contact"

**New Style:**
[Leave blank for client to fill in]

### Footer Links
**Location:** Under each section header  
**Current Style:**
- Color: gray-400
- Space: y-2 (0.5rem)
- Hover: text-white
- Transition: colors
- Display: block

**New Style:**
[Leave blank for client to fill in]

### Footer Services Links
**Location:** Services column  
**Current Style:**
- List of first 4 services from config
- Color: gray-400
- Hover: text-white
- Transition: colors

**New Style:**
[Leave blank for client to fill in]

### Footer Industries Links
**Location:** Industries column  
**Current Style:**
- All industry titles
- Only hospitality is linked (others show "Coming Soon")
- Active links: gray-400 hover:text-white
- Coming soon: gray-500 with small text "(Coming Soon)"

**New Style:**
[Leave blank for client to fill in]

### Footer Contact Info
**Location:** Contact column  
**Current Style:**
- Email: mailto link, gray-400 hover:text-white
- Phone: tel link, gray-400 hover:text-white
- "Get in Touch" link: white hover:opacity-80 with arrow "→"
- Space: y-2 (0.5rem)

**New Style:**
[Leave blank for client to fill in]

### Footer Copyright
**Location:** Bottom of footer  
**Current Style:**
- Border Top: border-gray-800
- Margin Top: 8 (2rem)
- Padding Top: 8 (2rem)
- Text Alignment: center
- Color: gray-400
- Text: "© 2025 Inteligencia. All rights reserved."

**New Style:**
[Leave blank for client to fill in]

## Loading Spinner

### Spinner Container
**Location:** Page loading states  
**Current Style:**
- Display: flex items-center justify-center
- Min Height: screen
- Padding Top: 20 (5rem) when not full screen

**New Style:**
[Leave blank for client to fill in]

### Spinner Element
**Location:** Loading indicator  
**Current Style:**
- Size: w-8 h-8 (2rem x 2rem)
- Border: 4px solid gray-200
- Border Top: 4px solid primary color
- Border Radius: full (circle)
- Animation: spin

**New Style:**
[Leave blank for client to fill in]

## Error Page

### Error Container
**Location:** 404 and error states  
**Current Style:**
- Min Height: screen
- Padding Top: 20 (5rem)
- Max Width: 7xl (80rem)
- Margin: 0 auto
- Padding: px-4 py-16 (1rem horizontal, 4rem vertical)
- Text Alignment: center

**New Style:**
[Leave blank for client to fill in]

### Error Title
**Location:** Error page header  
**Current Style:**
- Font Size: 4xl (2.25rem)
- Font Weight: bold (700)
- Margin Bottom: 4 (1rem)
- Color: #1f1d32 (dark blue-gray)

**New Style:**
[Leave blank for client to fill in]

### Error Description
**Location:** Below error title  
**Current Style:**
- Font Size: xl (1.25rem)
- Color: gray-600
- Margin Bottom: 8 (2rem)

**New Style:**
[Leave blank for client to fill in]

### Error CTA Button
**Location:** Error page call-to-action  
**Current Style:**
- Display: inline-block
- Background: blue-600
- Text Color: white
- Padding: px-6 py-3 (1.5rem horizontal, 0.75rem vertical)
- Border Radius: lg (0.5rem)
- Hover: bg-blue-700
- Transition: colors

**New Style:**
[Leave blank for client to fill in]

## Notes

- The navbar appears/disappears based on scroll position on homepage
- Mobile menu uses Framer Motion for smooth animations
- All hover states use CSS transitions for smooth effects
- Footer adapts content based on industry configuration
- Navigation behavior differs between homepage (scroll to sections) and subpages (navigate to pages)
- Industry dropdown is currently hidden for single-vertical launch