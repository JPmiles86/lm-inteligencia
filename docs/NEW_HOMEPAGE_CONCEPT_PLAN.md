# New Inteligencia Homepage Concept Plan

## Overview
This is a sophisticated, immersive entry experience that creates anticipation and guides users into specialized verticals. The static homepage acts as a gateway, forcing users to make an intentional choice about their industry focus.

## Why This Approach Works

### 1. **Forced Focus**
- Eliminates decision paralysis by presenting only 4 clear choices
- Creates a "choose your adventure" feeling
- Ensures users enter the site with a specific context in mind

### 2. **Brand Immersion**
- The staged fade-in creates anticipation
- Logo animation on selection adds interactivity
- Smooth transitions maintain the futuristic, intelligent feel

### 3. **Technical Elegance**
- Clean URL structure with subdomains
- SEO benefits from industry-specific domains
- Better analytics tracking per vertical

## Technical Architecture

### URL Structure
```
Static Homepage: inteligencia.com
Verticals:
- hotels.inteligencia.com
- athletics.inteligencia.com
- retail.inteligencia.com
- healthcare.inteligencia.com
```

### Development Approach
For local development, we can use:
- Routing: /hotels, /athletics, etc.
- URL rewriting in production to handle subdomains
- Environment variables to switch between local/production URLs

## Animation Sequence

### Homepage Load
1. **0-0.5s**: Logo fades in
2. **0.8-1.3s**: "Inteligencia" fades in
3. **1.5-2s**: "Digital Marketing" fades in
4. **2.2-3.5s**: Four verticals fade in sequentially (0.3s between each)

### Vertical Selection
1. **Click Event**: 
   - Other verticals fade out (0.3s)
   - Logo begins floating animation
   - Selected vertical text animates to center (0.8s)
   - Scroll arrow fades in (0.5s)
   - URL changes to subdomain

### Logo Floating Animation
```css
/* Subtle floating effect */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
}
```

## Content Strategy for Vertical Pages

### Above the Fold (Visible on Load)
- Animated logo (already floating)
- "Inteligencia Digital Marketing"
- Vertical name (e.g., "Hotels")
- Subtle scroll indicator

### Section 1: Value Proposition
**Purpose**: Immediate industry-specific value
**Content Structure**:
```
[Headline] Transform Your [Industry] with AI-Powered Marketing
[Subhead] Data-driven strategies that understand your unique challenges
[3 Key Benefits - Icon + Short Text]
```

### Section 2: Industry Insights
**Purpose**: Demonstrate expertise
**Options**:
1. **Stats Grid**: 3-4 impressive industry statistics
2. **Challenge/Solution**: Common problems → Our approach
3. **Case Highlight**: One sentence success story

### Section 3: Services Showcase
**Purpose**: What we actually do
**Layout Options**:
1. **Card Grid**: 6 services in 2x3 or 3x2 grid
2. **Accordion**: Expandable service descriptions
3. **Timeline**: Service journey visualization

### Section 4: Video CTA Section
**Purpose**: Emotional connection + Call to action
**Structure**:
- Background video (muted, looping)
- Overlay with semi-transparent gradient
- Headline: "Ready to Revolutionize Your [Industry] Marketing?"
- CTA Button: "Start Your Transformation"

### Section 5: Trust Builders
**Purpose**: Credibility
**Options**:
1. Testimonials carousel
2. Logo parade of technologies used
3. Certifications/Awards

## Three Layout Variations for Hotels Vertical

### Version A: "The Storyteller"
- Hero: Minimal with strong typography
- Section flow: Story → Stats → Services → Video CTA → Trust
- Emphasis on narrative and emotional connection

### Version B: "The Data-Driven"
- Hero: Includes live metrics or animated numbers
- Section flow: Stats → Services → Benefits → Video CTA → Results
- Emphasis on ROI and measurable outcomes

### Version C: "The Visual Journey"
- Hero: Incorporates subtle parallax effects
- Section flow: Visual story → Interactive services → Benefits → Video CTA
- Emphasis on visual engagement and interactivity

## Implementation Phases

### Phase 1: Static Homepage
- Create non-scrollable container
- Implement fade-in sequence
- Add vertical selection logic
- Basic routing setup

### Phase 2: Transition Animations
- Logo floating animation
- Text repositioning
- Smooth page transitions
- URL management

### Phase 3: Vertical Landing Pages
- Create reusable template
- Implement 3 layout variations
- Add video background section
- Mobile responsiveness

### Phase 4: Polish
- Fine-tune animations
- Add micro-interactions
- Performance optimization
- Cross-browser testing

## Next Steps

1. **Immediate**: Update project documentation
2. **Design**: Create wireframes for 3 layout options
3. **Development**: Build static homepage first
4. **Testing**: Get client feedback on layout variations
5. **Refinement**: Choose final layout and apply to all verticals

## Resolved Design Decisions

1. **Direct Subdomain Access**: When someone goes directly to hotels.inteligencia.com:
   - Logo is already animating (floating effect)
   - "Hotels" text is centered (as if animation completed)
   - Scroll indicator is visible
   - User can immediately scroll down for content

2. **Navigation Between Verticals**:
   - Logo click → returns to static homepage
   - Header includes dropdown for switching industries
   - Switching industries navigates to new subdomain (e.g., retail.inteligencia.com)

3. **Mobile Experience**: 
   - Identical to desktop experience
   - Static homepage → click vertical → animation → scroll enabled
   - Maintains brand consistency across devices

## Key Implementation Notes

- **Config-Driven**: Site uses industry config files for content
- **One Template**: Single template serves all verticals with different configs
- **Minimal Aesthetic**: Super slick, futuristic, modern, clean
- **User Clarity**: Consider adding "Choose Your Industry" hint on static page

This approach creates a premium, thoughtful experience that positions Inteligencia as a sophisticated, industry-focused agency. The forced choice architecture ensures users are engaged and ready to explore industry-specific content.