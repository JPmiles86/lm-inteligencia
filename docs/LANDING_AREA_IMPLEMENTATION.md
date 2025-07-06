# Landing Area Implementation

## Date: 2025-01-04
## Agent: Agent 2

## Component Overview

The LandingArea component is the main entry point for the Inteligencia website. It manages the initial industry selection experience with seamless transitions between states.

## Component Structure

```
src/components/LandingArea/
├── LandingArea.tsx    # Main component
└── index.ts           # Clean export
```

## State Management

The component uses Zustand store (`navigationStore`) for global state:
- `selectedIndustry`: The chosen industry (hospitality, foodservice, healthcare, athletics)
- `landingAreaState`: Component state ('undecided' | 'decided' | 'hidden')

## Component States

### 1. Undecided State
- Shows all four industry options with hover effects
- Industries displayed horizontally with 80px gap
- Each option is clickable and shows hover color on label

### 2. Decided State  
- Selected industry centers and scales up
- Other options fade out smoothly
- Logo starts floating animation
- Scroll arrow appears with bounce
- After 2 seconds of no interaction: "Scroll to explore" hint appears

## Key Features

### Seamless Transitions
- NO disappear/reappear when industry is selected
- Smooth fade-out of unselected options
- Selected option animates to center position
- Gap between items reduces from 80px to 10px

### Logo Animation
- Static in undecided state
- Floating animation (up/down) in decided state
- 3-second loop with easeInOut timing

### Scroll Hint System
- Tracks user interaction (mouse, click, scroll, keyboard)
- Shows "Scroll to explore" after 2 seconds of inactivity
- Hint disappears on any interaction
- Arrow has continuous bounce animation

### URL Management
- Updates URL when industry selected:
  - hospitality → /hotels
  - foodservice → /restaurants
  - healthcare → /dental
  - athletics → /sports
- Uses `window.history.pushState` for no-reload navigation

## Animation Details

### Industry Selection Animation
```typescript
// Centering animation for selected industry
position: 'absolute',
left: '50%', 
transform: 'translateX(-50%) scale(1.1)'
```

### Logo Floating Animation
```typescript
y: landingAreaState === 'decided' ? [0, -10, 0] : 0
transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
```

### Scroll Arrow Entrance
```typescript
initial: { opacity: 0, y: -20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5 }
```

## Integration Notes

### With UnifiedInteligenciaApp
The LandingArea component should replace the current header section in UnifiedInteligenciaApp.tsx. The parent component should:
1. Check `landingAreaState` from Zustand
2. Show LandingArea when state is 'undecided' or 'decided'
3. Hide LandingArea when state is 'hidden' (after scrolling)

### Props
- `onScrollToContent`: Optional callback for scroll arrow click

### Zustand Integration
```typescript
const { 
  selectedIndustry, 
  landingAreaState,
  setSelectedIndustry,
  setLandingAreaState 
} = useNavigationStore();
```

## Responsive Considerations
- Uses relative units and flexbox for mobile compatibility
- Logo scales appropriately
- Industry options stack on smaller screens (via flex-wrap if needed)

## Future Enhancements
1. Add transition to 'hidden' state when scrolling past landing area
2. Add keyboard navigation for industry selection
3. Add analytics tracking for industry selection
4. Consider adding subtle background animations

## Testing Checklist
- [ ] Industry selection works smoothly
- [ ] No flicker or disappear/reappear during transition
- [ ] Logo floating animation starts after selection
- [ ] Scroll arrow appears with bounce
- [ ] Scroll hint appears after 2 seconds
- [ ] URL updates correctly
- [ ] Zustand state updates properly
- [ ] Mobile responsive behavior