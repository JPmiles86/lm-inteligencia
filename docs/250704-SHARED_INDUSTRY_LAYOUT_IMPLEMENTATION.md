# SharedIndustryLayout Implementation

## Overview
The `SharedIndustryLayout` component is the cornerstone of the hybrid navigation system for Inteligencia. It provides a persistent header with branding and navigation that remains visible across all industry sub-pages while supporting smooth transitions between routes.

## What Was Built

### Core Component: SharedIndustryLayout
**Location**: `/src/components/layout/SharedIndustryLayout.tsx`

This component serves as the layout wrapper for all industry-specific routes and provides:

1. **Persistent Header Section**
   - Logo that stays visible on all pages
   - Brand name "inteligencia" with industry suffix
   - Industry-specific tagline
   - Smooth animations on load

2. **Dual Navigation System**
   - Fixed navbar that appears on scroll (similar to UnifiedInteligenciaApp)
   - Static navigation bar in the header for sub-pages
   - Both use the existing IndustryNavbar component

3. **Industry Context Provider**
   - Provides industry configuration to all child components
   - Accessible via `useIndustryContext()` hook
   - Shares: industry type, config object, and industry key

4. **Route Outlet**
   - Uses React Router's `Outlet` for rendering child routes
   - Smooth page transitions with Framer Motion
   - Animation on route changes

5. **Persistent Footer**
   - Always visible footer with company info
   - Industry-specific service links
   - Quick navigation links
   - Contact information

## How It Works

### Industry Detection
1. Extracts industry from URL params (e.g., `/hotels`, `/restaurants`)
2. Maps URL key to IndustryType using `IndustryMapping`
3. Redirects to home if invalid industry is detected

### Configuration Loading
1. Uses `useIndustryConfig` hook with the detected industry
2. Shows loading spinner while fetching config
3. Displays error state with home button if config fails

### Navigation Behavior
1. **Scroll-triggered Navbar**: Appears when user scrolls down 100px
2. **Static Navigation**: Always visible in header for sub-pages
3. **Smooth Transitions**: 300ms fade animations between pages

### Context Management
```typescript
interface IndustryContextType {
  industry: IndustryType;
  config: IndustryConfig;
  industryKey: string;
}
```

Child components can access this via:
```typescript
const { industry, config, industryKey } = useIndustryContext();
```

## Key Features

### 1. Responsive Design
- Mobile-first approach
- Collapsible navigation on small screens
- Optimized spacing and typography

### 2. Animation System
- Logo subtle hover effect
- Header fade-in on load
- Page transition animations
- Navbar slide-in effect

### 3. Industry Theming
- Uses industry's primary color for accents
- Industry-specific taglines
- Branded navigation elements

### 4. Error Handling
- Loading states during config fetch
- Error display with recovery option
- Invalid route protection

## Integration Notes for Other Agents

### 1. Route Structure
This layout expects to be used with nested routes:
```jsx
<Route path="/:industry" element={<SharedIndustryLayout />}>
  <Route index element={<SeamlessIndustryPage />} />
  <Route path="services" element={<ServicesPage />} />
  <Route path="about" element={<AboutPage />} />
  // ... other sub-routes
</Route>
```

### 2. Using Industry Context
Child components can access industry data:
```jsx
import { useIndustryContext } from '../layout/SharedIndustryLayout';

function MyComponent() {
  const { industry, config, industryKey } = useIndustryContext();
  // Use industry data
}
```

### 3. Navigation Patterns
- The layout handles the persistent elements
- Child components should focus on their specific content
- Navigation is handled by IndustryNavbar component

### 4. Styling Considerations
- Header has a fixed height that child components should account for
- Use `pt-20` or similar padding to avoid content hiding under header
- Footer is always at the bottom of the page

## Industry Configuration

The component supports these industries:
- `hospitality` (hotels)
- `foodservice` (restaurants)  
- `healthcare` (healthcare)
- `athletics` (sports)

Each has:
- Custom tagline
- Display name
- Primary color theming
- Specific service listings

## State Management

### Local State
- `showNavbar`: Controls scroll-triggered navbar visibility
- `isTransitioning`: Manages page transition animations

### Context State
- Industry configuration shared with all children
- No prop drilling needed for industry data

## Dependencies
- React Router for routing
- Framer Motion for animations
- Industry configuration system
- Existing IndustryNavbar component

## Next Steps for Integration

1. **Update App.tsx** to use this layout in route structure
2. **Ensure child pages** are wrapped properly to receive context
3. **Test navigation** between seamless page and sub-pages
4. **Verify industry switching** maintains proper state

## Important Notes

1. The component preserves the visual design from UnifiedInteligenciaApp but in a more compact form
2. It reuses the existing IndustryNavbar component for consistency
3. The dual navigation system ensures smooth UX for both seamless and traditional pages
4. All industry-specific data flows through context, preventing prop drilling