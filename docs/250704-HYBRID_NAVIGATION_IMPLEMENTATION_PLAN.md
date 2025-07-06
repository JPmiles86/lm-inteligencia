# Hybrid Navigation Implementation Plan
## Proper Solution for Inteligencia Navigation

### Project Scope
- **Working Directory**: `/Users/jpmiles/laurie-meiring-website/clients/laurie-inteligencia`
- **Important**: This is a subdirectory within a larger project. Do NOT modify anything outside this directory.

### Current Architecture Problems
1. Using `App.unified.tsx` which is a single-page app without proper routing
2. Navigation components expect multi-page routing but don't get it
3. Industry context is lost, causing `undefined` in URLs
4. Sub-pages (`/hotels/services`) exist but aren't reachable

### Proposed Solution: Hybrid Layout System

#### Core Concept
- Use React Router's nested routing with shared layouts
- Persistent header/logo area that never unmounts
- Seamless transitions for main content
- Proper navigation for sub-pages
- Industry context preserved throughout

#### Architecture Overview
```
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    
    <Route path="/:industry" element={<SharedIndustryLayout />}>
      <Route index element={<SeamlessIndustryPage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="case-studies" element={<CaseStudiesPage />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="blog" element={<BlogListingPage />} />
      <Route path="blog/:slug" element={<BlogPostPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Implementation Steps

#### Phase 1: Create SharedIndustryLayout Component
1. Create new component that contains persistent header
2. Use React Router's `Outlet` for child routes
3. Manage industry context and pass to all children
4. Handle animations for seamless experience

#### Phase 2: Update Routing Structure
1. Modify `App.tsx` to use nested routes
2. Remove dependency on `App.unified.tsx`
3. Update `main.tsx` to use proper App component

#### Phase 3: Fix Navigation Components
1. Update `IndustryNavbar` to work with new context
2. Fix all CTA links to use proper paths
3. Ensure industry switching maintains current page

#### Phase 4: Preserve Seamless Experience
1. Implement smooth transitions between pages
2. Keep logo/header visible during navigation
3. Add loading states for better UX

### Technical Details

#### SharedIndustryLayout Component Structure
```typescript
function SharedIndustryLayout() {
  const { industry } = useParams();
  const location = useLocation();
  const config = useIndustryConfig(industry);
  
  // Persistent header with logo and brand
  // Navigation bar
  // Outlet for child routes
  // Smooth transitions
}
```

#### Context Management
- Industry context available to all child components
- No more `undefined` in URLs
- Proper industry switching

#### Navigation Behavior
- On `/hotels`: Show seamless scrolling page
- On `/hotels/services`: Show services page below persistent header
- Industry switcher updates URL correctly

### Sub-Agent Task Breakdown

#### Sub-Agent 1: SharedIndustryLayout Creation
- Create the layout component
- Implement persistent header
- Add outlet for child routes
- Set up industry context

#### Sub-Agent 2: Routing Structure Update
- Modify App.tsx with nested routes
- Update main.tsx to use App.tsx
- Remove App.unified.tsx from build

#### Sub-Agent 3: Navigation Component Updates
- Fix IndustryNavbar for new context
- Update all navigation links
- Ensure proper industry switching

#### Sub-Agent 4: Testing & Polish
- Test all navigation paths
- Add smooth transitions
- Fix any edge cases
- Document the new system

### Expected Outcome
1. Landing page at `/` with 4 industry options
2. Click industry → `/hotels` with seamless experience
3. Logo/header stays visible when navigating
4. All sub-pages work: `/hotels/services`, `/hotels/pricing`, etc.
5. Industry context preserved everywhere
6. Clean, maintainable architecture

### Timeline
- Estimated completion: 2-3 hours with parallel sub-agents
- Each phase can be worked on simultaneously after Phase 1

### Documentation Requirements
- Each sub-agent must create detailed .md files
- Document all changes made
- Include code examples
- Note any issues encountered
- Provide clear handoff notes