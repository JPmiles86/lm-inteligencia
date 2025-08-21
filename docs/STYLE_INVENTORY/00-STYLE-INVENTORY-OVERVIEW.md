# Style Inventory Overview

This directory contains a comprehensive catalog of ALL styling elements used across the Inteligencia Digital Marketing website. These documents make it easy for clients to specify changes to any visual element.

## Documentation Files

### [01-HOMEPAGE-STYLES.md](./01-HOMEPAGE-STYLES.md)
Complete inventory of homepage styling including:
- **Landing Area:** Logo, titles, industry selector, animations
- **Hero Section:** Main content area after industry selection
- **Video Background Section:** Full-screen video styling
- **Services Section:** Service cards, hover states, CTA buttons
- **Contact Section:** Homepage contact area styling

### [02-NAVIGATION-STYLES.md](./02-NAVIGATION-STYLES.md)
Navigation and layout components:
- **Navbar:** Desktop and mobile navigation styling
- **Footer:** Site-wide footer with links and branding
- **Loading States:** Spinners and loading indicators
- **Error Pages:** 404 and error state styling

### [03-BUTTONS-AND-LINKS.md](./03-BUTTONS-AND-LINKS.md)
All interactive elements:
- **Primary Buttons:** Main CTA buttons across the site
- **Secondary Buttons:** Outline and alternative buttons
- **Text Links:** Navigation and content links
- **Interactive States:** Hover, focus, and active states

### [04-TYPOGRAPHY.md](./04-TYPOGRAPHY.md)
Text styling and fonts:
- **Font Families:** Poppins, Inter, and system fallbacks
- **Headings:** H1-H4 styling across different contexts
- **Body Text:** Paragraph and content text styles
- **Special Text:** Quotes, stats, labels, and unique treatments

### [05-PAGE-SECTIONS.md](./05-PAGE-SECTIONS.md)
Major page sections and layouts:
- **Services Page:** Service listings and detail views
- **About Page:** Company story and team sections
- **Case Studies Page:** Portfolio and case study displays
- **Contact Page:** Forms and contact information
- **Shared Sections:** Testimonials and common elements

### [06-COLORS-AND-GRADIENTS.md](./06-COLORS-AND-GRADIENTS.md)
Complete color palette and effects:
- **Brand Colors:** Primary (#371657), Secondary (#f04a9b), Accent (#176ab2)
- **Text Colors:** Complete gray scale hierarchy
- **Background Colors:** White, gray, and dark backgrounds
- **Gradients:** All gradient definitions with exact values
- **Special Effects:** Overlays, shadows, and status colors

## How to Use This Documentation

### For Clients
1. **Browse by Section:** Find the element you want to change in the appropriate file
2. **Reference Current Styles:** Each element shows exact current values
3. **Specify Changes:** Fill in the "New Style" sections with your desired changes
4. **Include Specifics:** Provide hex codes, pixel values, or exact descriptions

### For Developers
1. **Locate Elements:** Use this as a reference to find styling locations in code
2. **Understand Structure:** See how styles are organized and related
3. **Make Changes:** Use the documented values to update styles consistently
4. **Maintain Consistency:** Follow established patterns when adding new elements

## Key Style Information

### Color Scheme
- **Primary:** #371657 (Deep Purple)
- **Secondary:** #f04a9b (Vibrant Pink) 
- **Accent:** #176ab2 (Professional Blue)
- **Text Hierarchy:** Black → Gray-900 → Gray-700 → Gray-600 → Gray-500

### Fonts
- **Headings:** Poppins, sans-serif (weights 300-700)
- **Body Text:** Inter, system-ui, sans-serif (weights 300-700)
- **Monospace:** JetBrains Mono (for technical content)

### Spacing Scale
- **4:** 1rem (16px)
- **8:** 2rem (32px)
- **12:** 3rem (48px)
- **16:** 4rem (64px)
- **20:** 5rem (80px)
- **24:** 6rem (96px)
- **32:** 8rem (128px)

### Border Radius Scale
- **lg:** 0.5rem (8px) - Most buttons
- **xl:** 0.75rem (12px) - Large buttons
- **2xl:** 1rem (16px) - Cards and containers
- **3xl:** 1.5rem (24px) - Large containers

### Responsive Breakpoints
- **sm:** 640px (mobile landscape)
- **md:** 768px (tablet)
- **lg:** 1024px (desktop)
- **xl:** 1280px (large desktop)

### Animation Timing
- **Fast:** 0.15s (150ms)
- **Standard:** 0.3s (300ms) - Most transitions
- **Slow:** 0.6s (600ms) - Page transitions
- **Ease:** ease-in-out (standard easing)

## Implementation Notes

### CSS Architecture
- **Tailwind CSS:** Utility-first framework for consistent styling
- **CSS Variables:** Brand colors defined as custom properties
- **Framer Motion:** Animation library for smooth transitions
- **Responsive Design:** Mobile-first approach with progressive enhancement

### File Locations
- **Tailwind Config:** `/tailwind.config.js`
- **Style Config:** `/src/config/style-config.ts`
- **Global Styles:** `/src/styles/globals.css`
- **Components:** `/src/components/` (various subdirectories)

### Style System
- **Design Tokens:** Consistent spacing, colors, and typography
- **Component-Based:** Reusable styled components
- **Theme Support:** Industry-specific color variations available
- **Accessibility:** WCAG-compliant color contrasts and interactions

## Making Changes

### Small Changes
- Update individual component styles
- Modify CSS variables for global color changes
- Adjust spacing using Tailwind classes

### Large Changes
- Update style-config.ts for theme changes
- Modify tailwind.config.js for new design tokens
- Consider impact on all components using shared styles

### Testing Changes
- Check responsive behavior on all screen sizes
- Verify accessibility with contrast checkers
- Test hover and focus states on all interactive elements
- Ensure consistency across all pages and sections

## Contact for Changes

When requesting style changes, please:
1. Reference the specific section and element name from these documents
2. Provide exact values (hex colors, pixel sizes, font weights)
3. Include context about where the change should apply
4. Consider responsive behavior and different screen sizes
5. Specify if changes should affect similar elements site-wide

This documentation ensures that all style changes can be implemented accurately and consistently across the entire website.