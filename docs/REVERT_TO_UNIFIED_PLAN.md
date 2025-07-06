# Revert to Unified App Plan
## Step-by-Step Implementation

### Phase 1: Revert and Prepare

#### Step 1: Switch back to Unified App
1. In `main.tsx`, change import back to `App.unified.tsx`
2. Keep the new page components we created (they're still useful)
3. Remove SharedIndustryLayout (wrong approach)

#### Step 2: Set up Zustand
1. Install zustand: `npm install zustand`
2. Create store for:
   - selectedIndustry
   - landingAreaState ('undecided' | 'decided' | 'hidden')
   - scrollPosition
   - showNavbar

### Phase 2: Create Landing Area Component

#### LandingArea Component Structure
```typescript
<LandingArea>
  {state === 'undecided' ? (
    <UndecidedState onSelectIndustry={...} />
  ) : (
    <DecidedState industry={industry} onScrollStart={...} />
  )}
</LandingArea>
```

#### Key Features:
1. Seamless transition between states
2. Logo animation (static → floating)
3. Scroll hint after 2 seconds
4. Arrow animation

### Phase 3: Enhance Unified App

#### Route Handling
```typescript
// Detect route type
const isHomepage = pathname === '/' || pathname === `/${industry}`;
const isSubpage = pathname.includes('/services') || pathname.includes('/about') etc;

// Render accordingly
if (isHomepage) {
  return <HomepageExperience />;
} else if (isSubpage) {
  return <SubpageExperience />;
}
```

### Phase 4: Navigation Behavior
1. Homepage: Navbar appears only after scrolling past landing area
2. Subpages: Navbar always visible
3. Industry context preserved across all pages

### Sub-Agent Tasks

#### Agent 1: Revert and Setup
- Switch to App.unified.tsx
- Set up Zustand store
- Remove SharedIndustryLayout
- Document changes

#### Agent 2: Landing Area Component
- Create LandingArea with both states
- Implement seamless transitions
- Add animations and scroll detection
- No disappear/reappear on industry selection

#### Agent 3: Enhance Unified App
- Add sub-route handling
- Implement conditional rendering
- Fix navigation behavior
- Preserve industry context

#### Agent 4: Testing
- Test all navigation scenarios
- Verify seamless transitions
- Check mobile responsiveness
- Document any issues

### Important Notes for Agents:
1. DO NOT break the seamless transition
2. Landing area ONLY on homepage routes
3. Work only in `/Users/jpmiles/laurie-meiring-website/clients/laurie-inteligencia`
4. Create .md files for all documentation
5. Test thoroughly before completing