# Unified Architecture Guide

## Overview

The Inteligencia website uses a **unified single-page architecture** that provides seamless transitions between industries while maintaining a persistent header. This approach delivers a premium, app-like experience without traditional page navigation.

## Key Principles

### 1. Single Component Architecture
- The entire application is rendered by `UnifiedInteligenciaApp.tsx`
- No React Router navigation between industries
- All transitions happen within the same component

### 2. URL Management Without Navigation
- URLs update using `window.history.pushState()`
- Direct URL access is handled on component mount
- Browser back/forward buttons work seamlessly

### 3. Seamless Transitions
- Industry selection animates smoothly
- Header elements persist during transitions
- Content loads below the fold for smooth scrolling

## Architecture Components

### UnifiedInteligenciaApp.tsx
The main orchestrator component that:
- Manages the application phases (selection → transitioning → industry)
- Handles URL synchronization
- Controls animations and content loading
- Manages navbar visibility on scroll

### Key Features:
1. **Phase Management**
   - `selection`: Initial state with industry options
   - `transitioning`: Animation phase when industry is selected
   - `industry`: Content display phase

2. **URL Handling**
   ```typescript
   // Direct URL access detection
   const pathToIndustryMap: Record<string, IndustryType> = {
     '/hotels': 'hospitality',
     '/restaurants': 'foodservice',
     '/dental': 'healthcare',
     '/sports': 'athletics'
   };
   ```

3. **Content Loading**
   - Hero, Services, Testimonials, and Contact sections
   - Lazy-loaded based on industry selection
   - Smooth scroll transitions between sections

### Navbar.tsx
Modified for single-page architecture:
- No React Router Links
- Smooth scroll to sections
- Industry switcher triggers full reset

## Implementation Details

### URL Management Strategy

1. **Initial Load**
   ```typescript
   // Check URL on mount
   const path = window.location.pathname;
   const industry = pathToIndustryMap[path];
   if (industry) {
     // Load industry content directly
   }
   ```

2. **Industry Selection**
   ```typescript
   // Update URL without navigation
   window.history.pushState({}, '', pathMap[industry]);
   ```

3. **Browser Navigation**
   ```typescript
   // Handle back/forward buttons
   window.addEventListener('popstate', handlePopState);
   ```

### Animation Flow

1. **Selection Phase**
   - Industries displayed horizontally
   - Hover effects on each option
   - Click triggers transition

2. **Transition Phase**
   - Non-selected industries fade out
   - Selected industry centers and scales
   - 1.5 second animation duration

3. **Industry Phase**
   - Scroll arrow appears
   - Content loads below fold
   - Navbar appears on scroll

### Content Structure

```
Header (Persistent)
├── Logo (floating animation in industry view)
├── "inteligencia" text
├── "digital marketing" text
├── Tagline
└── Industry selector/display

Content (Scrollable)
├── HeroSection
├── ServicesSection
├── TestimonialsSection
├── VideoCTASection
└── ContactSection (with form)
```

## Important Warnings

### DO NOT:
1. **Add React Router navigation** between industries
2. **Break the single-component architecture**
3. **Use traditional page transitions**
4. **Create separate pages for industries**
5. **Modify URL handling to use React Router**

### DO:
1. **Maintain seamless transitions**
2. **Use `window.history.pushState()` for URLs**
3. **Keep all industry content in one component**
4. **Preserve animation timing**
5. **Test direct URL access**

## Adding New Features

### Adding a New Section
1. Create component in `src/components/sections/`
2. Import in `UnifiedInteligenciaApp.tsx`
3. Add section with unique ID for scrolling
4. Update navbar if needed

### Adding a New Industry
1. Update `industries` array in component
2. Add to `pathToIndustryMap`
3. Add to `pathMap` in `handleIndustryClick`
4. Update `industryHoverColors`

### Modifying Animations
- Selection to transition: 1.5s duration
- Content fade-in: 0.5s delay after phase change
- Navbar appearance: 0.3s duration
- Keep timings synchronized

## Testing Checklist

- [ ] Direct URL access works for all industries
- [ ] Browser back/forward navigation works
- [ ] Animations are smooth and synchronized
- [ ] Navbar appears/disappears correctly
- [ ] Industry switching from navbar works
- [ ] Mobile responsiveness maintained
- [ ] Content loads without flicker
- [ ] Scroll positions reset appropriately

## Common Issues and Solutions

### Issue: Content flickers on load
**Solution**: Ensure `showContent` state has proper delay

### Issue: URL doesn't update
**Solution**: Check `window.history.pushState()` calls

### Issue: Direct access shows blank page
**Solution**: Verify initial URL detection in `useEffect`

### Issue: Navbar doesn't appear
**Solution**: Check scroll event listener and `headerRef`

## Future Considerations

1. **Performance**: Monitor bundle size as content grows
2. **SEO**: Consider SSR/SSG for better indexing
3. **Analytics**: Track virtual pageviews for industries
4. **Accessibility**: Ensure keyboard navigation works

## Conclusion

This unified architecture provides a premium user experience with seamless transitions. The key is maintaining the single-component structure while properly managing state, URLs, and animations. Any modifications should preserve this architecture's integrity.