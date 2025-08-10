# Frontend Changes Needed for Enhanced Landing Pages

## Overview
The landing pages have been redesigned with ultra-short hero sections (4-10 words) optimized for video backgrounds, plus expanded homepage sections that tell the complete story using progressive disclosure.

## Key Changes Made

### 1. Hero Section Updates
All hero sections now have:
- **Ultra-short titles** (4-5 words max)
- **Brief subtitles** (5-9 words)
- **Short CTAs** (2-3 words)

Examples:
- Hospitality: "Direct Bookings. More Profit."
- Tech: "Growth Without the Guesswork"
- Healthcare: "More Patients. Total Privacy."
- Sports: "Pack Events. Keep Sponsors."

### 2. New Homepage Sections Structure

I've added a new `homepageSections` array to each vertical's content. The front-end needs to:

1. **Update the type definitions** in `/types/Industry.ts` to include:
```typescript
interface HomepageSection {
  id: string;
  type: 'value-expansion' | 'social-proof' | 'process' | 'interactive';
  headline: string;
  content?: any; // Varies by section type
  stats?: string[];
  featuredTestimonial?: {
    quote: string;
    author: string;
    company: string;
  };
  steps?: Array<{
    title: string;
    description: string;
  }>;
  description?: string;
  ctaText?: string;
}
```

2. **Create new components** for each section type:
   - `ValueExpansionSection` - Points with visual comparisons
   - `SocialProofSection` - Stats bars and featured testimonial
   - `ProcessSection` - Timeline/step visualization (client priority!)
   - `InteractiveSection` - Calculators and tools

## Implementation Priorities

### Phase 1 - Critical Updates
1. Fix TypeScript errors by updating type definitions
2. Update hero section styling for video backgrounds:
   - Larger, bolder typography
   - High contrast text (white/light on darkened video)
   - 35% video darkening overlay
   - Scroll indicator at bottom

### Phase 2 - Homepage Sections
1. Build components for new section types
2. Implement timeline visualization for process sections
3. Add smooth scroll animations between sections

### Phase 3 - Enhancements
1. ROI calculators for interactive sections
2. Neural network animations
3. Data flow visualizations

## Video Background Requirements
- Maximum 10 seconds loop
- Muted by default
- Compressed for fast loading
- Mobile fallback to static image
- Performance: Lazy load below-fold content

## Mobile Considerations
- Hero text scales down but remains readable
- Stack homepage sections vertically
- Simplified animations on mobile
- Touch-friendly interactive elements

## Color Usage by Vertical
Each vertical should subtly incorporate its primary color:
- Hospitality: Electric Blue (#0f5bfb)
- Tech: Futuristic Purple (#760b85)  
- Healthcare: Electric Blue (#0f5bfb)
- Sports: Neon Magenta (#f12d8f)

## Timeline Visualization (Client Priority)
The client specifically wants timeline features. Implement for:
- Process sections showing customer journey
- Service delivery timelines
- Growth progression visualizations

## Next Steps
1. Update TypeScript types to fix current errors
2. Create homepage section components
3. Update page layouts to render new sections
4. Implement video hero optimizations
5. Add timeline visualizations

## Notes
- All content is now in `industry-configs.ts`
- Keep progressive disclosure in mind - hook with hero, expand below
- Maintain fast performance with lazy loading
- Ensure accessibility with proper contrast ratios