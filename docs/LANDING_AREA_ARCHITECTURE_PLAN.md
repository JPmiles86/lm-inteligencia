# Landing Area Architecture Plan
## Fixing the Inteligencia Navigation System

### Core Concept: "Landing Area"
The landing area is the full-screen section that appears at the top of:
1. Main site (`/`) - Shows 4 verticals (undecided state)
2. Industry homepages (`/hotels`) - Shows 1 vertical + scroll (decided state)

**Key Rule**: Landing area NEVER appears on sub-pages (`/hotels/services`)

### Architecture Overview

#### 1. Route Structure
```
/ (LandingArea - undecided state)
├── /hotels (LandingArea - decided state + scrollable content)
│   ├── /services (No landing area, just navbar)
│   ├── /case-studies (No landing area, just navbar)
│   ├── /about (No landing area, just navbar)
│   └── /contact (No landing area, just navbar)
└── [Same for restaurants, healthcare, sports]
```

#### 2. Component Strategy

**Option A: Enhanced Unified App (Recommended)**
- Keep the unified app approach for seamless transitions
- Add proper sub-route handling
- Use state to track landing area visibility

**Option B: Conditional Layouts**
- Different layouts for different page types
- More complex but cleaner separation

### Recommended Approach: Enhanced Unified App

#### 1. State Management
Use Zustand or Context to track:
- Current industry
- Landing area state (undecided/decided/hidden)
- Scroll position
- Navigation visibility

#### 2. Component Structure
```
UnifiedApp
├── LandingArea (handles both states)
│   ├── UndecidedState (4 verticals)
│   └── DecidedState (1 vertical + scroll)
├── ScrollableContent (homepage sections)
└── SubPages (services, about, etc.)
```

#### 3. Navigation Logic
- On `/`: Show LandingArea (undecided), no navbar
- On `/hotels`: Show LandingArea (decided) + content, navbar appears on scroll
- On `/hotels/services`: No landing area, navbar always visible

### Implementation Plan

#### Phase 1: Fix Landing Area
1. Create proper LandingArea component with both states
2. Implement seamless transition (no disappear/reappear)
3. Add floating logo animation
4. Add scroll detection for navbar appearance

#### Phase 2: Fix Routing
1. Update unified app to handle sub-routes
2. Conditional rendering based on route type
3. Preserve industry context

#### Phase 3: Content Management
1. Move all hardcoded text to configs
2. Review and simplify content (less is more)
3. Align pricing/services with client spec

#### Phase 4: Polish
1. Smooth animations
2. Scroll hints after 2 seconds
3. Mobile responsiveness
4. Performance optimization

### Sub-Agent Task Breakdown

**Agent 1: Landing Area Component**
- Build the landing area with both states
- Implement seamless transitions
- Add scroll detection

**Agent 2: Routing Enhancement**
- Update unified app for sub-routes
- Implement conditional rendering
- Fix navigation behavior

**Agent 3: Content Migration**
- Move hardcoded text to configs
- Simplify and reduce text
- Align with client specifications

**Agent 4: Testing & Polish**
- Test all scenarios
- Fix edge cases
- Optimize performance

### Key Technical Decisions

1. **Keep Unified App**: Better for seamless transitions
2. **Use Zustand**: Clean state management for complex interactions
3. **Route-based Rendering**: Different components for different route types
4. **Config-driven Content**: All text from industry-configs.ts

### Success Criteria
- Seamless transition when selecting vertical
- No navbar until scroll on homepage
- Sub-pages show navbar only
- All content from configs
- Minimal, clean design
- Matches client specifications