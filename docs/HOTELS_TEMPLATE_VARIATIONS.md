# Hotels Template Variations Documentation

## Overview
This document outlines three distinct hard-coded template variations for the Hotels vertical of the Inteligencia website. Each template maintains the futuristic AI theme while offering unique approaches to content presentation and user engagement.

## Design System
- **Color Palette**:
  - Primary: #0f5bfb (Electric Blue)
  - Secondary: #f12d8f (Neon Magenta) 
  - Accent: #ffa424 (Bright Orange)
  - Dark: #1f1d32 (Deep Navy)
  - Purple: #760b85 (Futuristic Purple)
  - Background: #f4c8e0 (Soft Pink Background)
- **Typography**: Montserrat for headings, Poppins for body text
- **Logo**: Floating animation effect
- **Interactions**: Subtle hover effects, smooth transitions (300ms)

## Template Variations

### Template A - "The Storyteller"
**File**: `HotelsTemplateA.jsx`
**Focus**: Narrative and emotional connection
**Key Features**:
- Hero section with compelling hospitality narrative
- Story section with immersive content about transforming guest experiences
- Stats section with animated counters
- Services grid with hover reveal descriptions
- Video CTA section with background video
- Trust section with testimonials carousel

**Unique Aspects**:
- Emphasis on storytelling through copy
- Warm, inviting tone while maintaining futuristic design
- Progressive reveal of content as user scrolls
- Testimonials feature real guest feedback metrics

### Template B - "The Data-Driven"
**File**: `HotelsTemplateB.jsx`
**Focus**: Metrics, ROI, and analytics
**Key Features**:
- Hero with live animated statistics
- Real-time stats dashboard section
- Services with ROI indicators
- Benefits section with data visualizations
- Video CTA with performance metrics overlay
- Results section with case study highlights

**Unique Aspects**:
- Heavy emphasis on numbers and data
- Interactive data visualizations
- ROI calculator elements
- Performance tracking displays
- Chart animations on scroll

### Template C - "The Visual Journey"
**File**: `HotelsTemplateC.jsx`
**Focus**: Visual engagement and interactivity
**Key Features**:
- Visual story with parallax scrolling
- Interactive services showcase with hover animations
- Benefits section with animated icons
- Video CTA with immersive overlay effects
- Visual case studies gallery

**Unique Aspects**:
- Parallax effects throughout
- Image-heavy design with overlay text
- Interactive service cards that expand on hover
- Smooth scroll-triggered animations
- Gallery-style layout for case studies

## Common Elements Across All Templates

### Floating Logo Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
}
```

### Video CTA Section
- Same background video across all templates
- Semi-transparent overlay with gradient
- Centered CTA text and button
- Responsive video implementation

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 1024px
- Touch-friendly interactions
- Optimized loading for mobile devices

## Implementation Notes

1. **Component Structure**: Each template is a self-contained component with its own CSS file
2. **State Management**: Uses React hooks for interactive elements
3. **Performance**: Lazy loading for images, optimized animations
4. **Accessibility**: ARIA labels, keyboard navigation support
5. **Browser Support**: Modern browsers with CSS Grid and Flexbox

## Future Considerations

These hard-coded templates will eventually be adapted to use the config system. Key areas for configuration:
- Hero text and CTAs
- Service offerings
- Statistics and metrics
- Testimonial content
- Brand colors (while maintaining futuristic theme)

## Implementation Details

### Files Created
1. `src/components/hotels/HotelsTemplateA.jsx` - The Storyteller component
2. `src/components/hotels/HotelsTemplateA.css` - The Storyteller styles
3. `src/components/hotels/HotelsTemplateB.jsx` - The Data-Driven component
4. `src/components/hotels/HotelsTemplateB.css` - The Data-Driven styles
5. `src/components/hotels/HotelsTemplateC.jsx` - The Visual Journey component
6. `src/components/hotels/HotelsTemplateC.css` - The Visual Journey styles

### Key Features Implemented

#### Template A - The Storyteller
- Animated counter statistics on scroll
- Testimonial carousel with auto-rotation
- Service cards with hover effects
- Fade-in sections on scroll
- Gradient text effects throughout

#### Template B - The Data-Driven
- Live stats ticker in hero section
- Canvas-based data visualizations (revenue chart, occupancy bars, channel donut)
- ROI calculator in video CTA section
- Service cards with ROI metrics
- Results section with measurable outcomes

#### Template C - The Visual Journey
- Parallax scrolling effects on hero and story sections
- Interactive service showcase with expandable details
- Animated benefit cards with unique animations
- Floating elements in video section
- Visual case studies gallery with hover effects

### Usage Instructions

To use these templates in your application:

```jsx
import HotelsTemplateA from './components/hotels/HotelsTemplateA';
import HotelsTemplateB from './components/hotels/HotelsTemplateB';
import HotelsTemplateC from './components/hotels/HotelsTemplateC';

// Use in your routing or page component
<Route path="/hotels-a" element={<HotelsTemplateA />} />
<Route path="/hotels-b" element={<HotelsTemplateB />} />
<Route path="/hotels-c" element={<HotelsTemplateC />} />
```

### Video Implementation Note

All templates reference a video file at `/videos/hotel-cta-video.mp4`. You'll need to:
1. Add this video file to your public/videos directory
2. Or update the video source path in each template

### Image Placeholders

Template C references several placeholder images that need to be added:
- `/images/hotel-luxury-suite.jpg`
- `/images/hotel-data-dashboard.jpg`
- `/images/hotel-happy-guests.jpg`
- `/images/service-*.jpg` (6 service images)
- `/images/case-study-*.jpg` (6 case study images)

### Customization Points

Each template can be easily customized by modifying:
1. Color variables in CSS files
2. Content arrays in component files (services, testimonials, benefits, etc.)
3. Animation timings and effects
4. Section order and structure

## Testing Checklist

- [ ] Desktop responsiveness (1920px, 1440px, 1024px)
- [ ] Tablet responsiveness (768px)
- [ ] Mobile responsiveness (375px, 414px)
- [ ] Animation performance
- [ ] Video loading and playback
- [ ] Hover states and interactions
- [ ] Cross-browser compatibility
- [ ] Accessibility compliance
- [ ] Data visualization rendering (Template B)
- [ ] Parallax performance (Template C)
- [ ] Carousel functionality (Template A)