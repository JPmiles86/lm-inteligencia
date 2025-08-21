# Navigation & Footer Style Documentation

This document covers the global navigation bar and footer that appear consistently across all pages. These elements provide site-wide navigation and branding.

---

## Navigation Bar (Global)
*Fixed header navigation appearing on all pages*

### Navigation Container
**Current:**
- Position: Fixed, top-0, left-0, right-0
- Z-index: 50 (above all content)
- Animation: Slide down from -100px on page load (0.6s duration)
- Background: White with 95% opacity + backdrop blur
- Shadow: Drop shadow beneath navbar
- Transition: All properties, 0.3s duration

**New:**

### Navigation Inner Container
**Current:**
- Max width: 1280px (7xl)
- Centered with auto margins
- Padding: 16px on mobile, 24px on tablet, 32px on desktop

**New:**

### Navigation Layout
**Current:**
- Layout: Flex items center, justify between
- Height: 80px on mobile, 96px on desktop (h-20 lg:h-24)
- Padding: 8px vertical

**New:**

### Logo and Brand Section
**Current:**
- Layout: Flex items center

**New:**

#### Brand Link
**Current:**
- Element: Link to homepage or industry page
- Group class for hover effects
- URL: "/" for main, "/{industry}" for specific industries

**New:**

##### Logo Image
**Current:**
- Source: "/LM_inteligencia/Inteligencia-logo-new.png"
- Alt text: "Inteligencia Digital Marketing"
- Height: 40px on mobile, 48px on desktop (h-10 lg:h-12)
- Object fit: Contain
- Hover: Scale 105% (whileHover)

**New:**

##### Brand Text
**Current:**
- Text: "Inteligencia"
- Font size: 2xl (24px)
- Font weight: Medium (500)
- Color: Primary
- Font family: Inherit
- Gap: 12px from logo

**New:**

#### Industry Dropdown (Hidden)
*Currently hidden for single vertical launch*

**Current:**
- Container class: "relative industry-dropdown-container hidden"
- Button: Hidden with "hidden" class
- Dropdown: Conditional render set to false
- Contains industry switching logic for future use

**New:**

### Desktop Navigation Menu
**Current:**
- Container: "hidden lg:flex items-center space-x-8"
- Only visible on desktop (lg:flex)
- Spacing: 32px between items (space-x-8)

**New:**

#### Navigation Links
**Current:**
- Font weight: Medium (500)
- Transition: Colors
- Hover color: Primary
- Base color: Gray-700

**New:**

##### Services Link
**Current:**
- Text: From universal content navigation.mainMenu.services
- URL: "/{industry}/services" or "/services"
- Behavior: Always navigates to services page

**New:**

##### About Link
**Current:**
- Text: From universal content navigation.mainMenu.about  
- URL: "/{industry}/about" or "/about"
- Behavior: Always navigates to about page

**New:**

##### Case Studies Link
**Current:**
- Text: From universal content navigation.mainMenu.caseStudies
- URL: "/{industry}/case-studies" or "/case-studies"
- Behavior: Always navigates to case studies page

**New:**

##### Blog Link (Conditional)
**Current:**
- Text: From universal content navigation.mainMenu.blog
- URL: "/{industry}/blog" or "/blog"
- Visibility: Only shows when adminSettings.showBlog is true
- Behavior: Always navigates to blog page

**New:**

##### Contact Link
**Current:**
- Text: From universal content navigation.mainMenu.contact
- Behavior: Scroll to section on seamless page, navigate to contact page on subpages
- Conditional logic based on isSeamlessPage

**New:**

#### Get Started Button
**Current:**
- Display: inline-block
- Padding: 32px horizontal, 12px vertical (px-8 py-3)
- Text color: White
- Border radius: lg (8px)
- Font weight: Medium (500)
- Transition: All properties, 0.3s duration
- Hover: Scale 105%
- Transform: Applied on hover
- Background: Secondary
- Hover background: Secondary with 90% opacity
- Text: From universal content navigation.buttons.getStarted

**New:**

### Mobile Menu Button
**Current:**
- Visibility: Hidden on desktop (lg:hidden)
- Padding: 8px
- Border radius: md (6px)
- Transition: Colors
- Text color: Gray-700
- Hover color: Gray-900

**New:**

#### Mobile Menu Icon
**Current:**
- Size: 24px x 24px (w-6 h-6)
- Fill: None
- Stroke: Current color
- ViewBox: 0 0 24 24
- Icon: Hamburger (3 lines) when closed, X when open
- Conditional rendering based on isMobileMenuOpen

**New:**

### Mobile Menu Panel
**Current:**
- Visibility: Hidden on desktop (lg:hidden)
- Animation: Fade and height animation (0.3s duration)
- Background: White with 95% opacity + backdrop blur
- Border top: Gray-200, 1px
- Overflow: Hidden

**New:**

#### Mobile Menu Content
**Current:**
- Padding: 16px horizontal, 24px vertical
- Spacing: 16px between items (space-y-4)

**New:**

#### Mobile Menu Links
**Current:**
- Display: Block
- Width: Full
- Text alignment: Left
- Padding: 8px vertical
- Transition: Colors
- Hover color: Primary
- Base color: Gray-700
- Click handler: Closes mobile menu

**New:**

#### Mobile Get Started Button
**Current:**
- Display: Block
- Width: Full
- Padding: 32px horizontal, 12px vertical
- Text color: White
- Border radius: lg (8px)
- Font weight: Medium (500)
- Transition: All properties, 0.3s duration
- Transform: Scale 105% on hover
- Background: Secondary
- Hover: Opacity 90%
- Text alignment: Center

**New:**

### Navigation Spacer
**Current:**
- Only on non-seamless pages
- Height: 80px on mobile, 96px on desktop (h-20 lg:h-24)
- Purpose: Prevents content from hiding behind fixed navbar

**New:**

---

## Footer (Global)
*Site-wide footer with links and company information*

### Footer Container
**Current:**
- Background: Black
- Text color: White
- Padding: 48px top and bottom

**New:**

### Footer Content Grid
**Current:**
- Max width: 1280px (7xl)
- Centered with auto margins
- Padding: 16px on mobile, 24px on tablet, 32px on desktop
- Layout: 1 column on mobile, 4 columns on desktop
- Gap: 32px between sections

**New:**

### Company Information Column
**Current:**
- Column 1 of footer grid

**New:**

#### Company Brand Name
**Current:**
- Text: "Inteligencia"
- Font size: 2xl (24px)
- Font weight: Bold (700)
- Margin: 16px bottom

**New:**

#### Company Description
**Current:**
- Text: Industry-specific tagline (e.g., "Specialized marketing solutions for hospitality.")
- Color: Gray-400
- Margin: 16px bottom

**New:**

### Services Column
**Current:**
- Column 2 of footer grid

**New:**

#### Services Header
**Current:**
- Text: "Services"
- Font weight: Bold (700)
- Margin: 16px bottom

**New:**

#### Services List
**Current:**
- Layout: List with 8px spacing (space-y-2)
- Color: Gray-400
- Content: First 4 services from config
- Items: Plain text (no links)

**New:**

### Industries Column
**Current:**
- Column 3 of footer grid

**New:**

#### Industries Header
**Current:**
- Text: "Industries"
- Font weight: Bold (700)
- Margin: 16px bottom

**New:**

#### Industries List
**Current:**
- Layout: List with 8px spacing (space-y-2)
- Color: Gray-400
- Items: "Hotels & Hospitality", "Restaurants & Food Service", "Healthcare", "Sports & Recreation"
- Content: Static list (no links)

**New:**

### Contact Column
**Current:**
- Column 4 of footer grid

**New:**

#### Contact Header
**Current:**
- Text: "Contact"
- Font weight: Bold (700)
- Margin: 16px bottom

**New:**

#### Contact Information
**Current:**
- Layout: Container with 8px spacing (space-y-2)
- Color: Gray-400

**New:**

##### Contact Email
**Current:**
- Text: Email from config (if available)
- Display: Plain text (no mailto link)

**New:**

##### Contact Phone
**Current:**
- Text: Phone from config (if available)
- Display: Plain text (no tel link)

**New:**

### Footer Bottom Section
**Current:**
- Border top: Gray-800, 1px
- Margin: 32px top
- Padding: 32px top
- Text alignment: Center
- Color: Gray-400

**New:**

#### Copyright Notice
**Current:**
- Text: "© 2025 Inteligencia. All rights reserved."
- Format: Current year dynamically determined

**New:**

---

## Blog-Specific Footer
*Special footer variation used on blog post pages*

### Blog Footer Structure
**Current:**
- Same basic structure as global footer
- Modified content in columns 2-4
- Company column remains the same

**New:**

#### Blog Quick Links Column
**Current:**
- Header: "Quick Links"
- Links: Home, Services, About, Case Studies
- All links use industry-specific paths
- Hover: Color changes to white
- Transition: Colors

**New:**

#### Blog Column
**Current:**
- Header: "Blog"
- Links: All Articles, Marketing Tips, Industry Insights, Case Studies
- All links redirect to blog listing page
- Color: Gray-400, hover white

**New:**

#### Blog Contact Column
**Current:**
- Header: "Contact"
- Email: "laurie@inteligenciadm.com"
- Phone: "+506 6200 2747"
- Get Started button: Primary background, white text, hover opacity 90%

**New:**

---

## Navigation State Management

### Mobile Menu State
**Current:**
- State: isMobileMenuOpen (boolean)
- Toggle: onClick handler on mobile menu button
- Close triggers: Navigation link clicks, outside clicks

**New:**

### Industry Dropdown State (Hidden)
**Current:**
- State: isIndustryDropdownOpen (boolean)
- Currently disabled for single vertical launch
- Click outside handler implemented but unused

**New:**

### Navigation Context
**Current:**
- Uses IndustryContext when available
- Falls back to props when context unavailable
- Determines industry-specific paths and names

**New:**

---

## Responsive Behavior

### Mobile (Under 1024px)
**Current:**
- Desktop menu hidden (lg:hidden reversed)
- Mobile menu button visible
- Mobile menu panel can open/close
- Logo and brand stack closer together

**New:**

### Desktop (1024px and up)
**Current:**
- Mobile menu hidden (lg:flex on desktop menu)
- Mobile menu button hidden
- Full navigation menu visible
- All hover effects active

**New:**

---

## Animation Details

### Page Load Animation
**Current:**
- Navbar slides down from -100px
- Duration: 0.6s
- Timing: Runs on initial page load

**New:**

### Mobile Menu Animation
**Current:**
- Opacity fade: 0 to 1 (or reverse)
- Height animation: 0 to auto (or reverse)
- Duration: 0.3s
- Trigger: Mobile menu button click

**New:**

### Hover Animations
**Current:**
- Logo scale: 105% on hover
- Navigation links: Color transitions
- Get Started button: Scale 105% + color changes
- All transitions: 0.3s duration

**New:**

---

## Content Sources

### Universal Content
**Current:**
- Navigation text from: universal-content.ts
- Menu items: navigation.mainMenu object
- Button text: navigation.buttons object

**New:**

### Dynamic Content
**Current:**
- Industry names: From IndustryNames type
- Service lists: From industry configuration
- Contact info: From industry configuration
- URLs: Industry-specific path generation

**New:**

### Admin Settings
**Current:**
- Blog visibility: Controlled by adminSettings.showBlog
- Other sections: Currently all visible by default

**New:**

---

## URL Generation Logic

### Industry Path Detection
**Current:**
- Subdomain detection for hosted environments
- Path-based routing for development
- Fallback to main path when industry unclear

**New:**

### Link Generation Patterns
**Current:**
- Homepage: "/" or "/{industry}"
- Services: "/services" or "/{industry}/services"
- About: "/about" or "/{industry}/about"
- Case Studies: "/case-studies" or "/{industry}/case-studies"
- Contact: "/contact" or "/{industry}/contact"
- Blog: "/blog" or "/{industry}/blog" (if enabled)

**New:**

### Seamless Page Behavior
**Current:**
- Contact link scrolls to section instead of navigating
- Other links navigate to full pages
- Detection based on current route and industry path

**New:**

---

## Accessibility Notes

### Keyboard Navigation
**Current:**
- All links and buttons focusable
- Focus states visible with ring styling
- Mobile menu keyboard accessible

**New:**

### Screen Reader Support
**Current:**
- Logo has descriptive alt text
- Button text clearly describes action
- Mobile menu button indicates open/closed state

**New:**

### Color Contrast
**Current:**
- Text meets WCAG guidelines against backgrounds
- Hover states maintain sufficient contrast
- Primary color provides adequate contrast

**New:**