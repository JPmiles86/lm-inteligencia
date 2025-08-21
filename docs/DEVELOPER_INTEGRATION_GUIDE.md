# Developer Integration Guide

This guide explains how to integrate the new styling and visibility configuration system into existing and new components.

## Quick Integration

### 1. Using Visibility Controls in Components

```tsx
import { useIsVisible, ConditionalSection } from '../hooks/useStyleConfig';
import { COMMON_SECTIONS } from '../config/content-visibility';

// Method 1: Hook-based approach
const MyComponent = () => {
  const isTeamVisible = useIsVisible(COMMON_SECTIONS.TEAM);
  
  return (
    <div>
      {isTeamVisible && (
        <section>
          <h2>Our Team</h2>
          {/* Team content */}
        </section>
      )}
    </div>
  );
};

// Method 2: Wrapper component approach
const MyComponent = () => {
  return (
    <div>
      <ConditionalSection sectionId={COMMON_SECTIONS.TEAM}>
        <section>
          <h2>Our Team</h2>
          {/* Team content */}
        </section>
      </ConditionalSection>
    </div>
  );
};

// Method 3: HOC approach
const TeamSection = withVisibility(() => (
  <section>
    <h2>Our Team</h2>
    {/* Team content */}
  </section>
), COMMON_SECTIONS.TEAM);
```

### 2. Using Style Configuration in Components

```tsx
import { useThemeColors, useStyleConfig } from '../hooks/useStyleConfig';

const StyledComponent = () => {
  const { colors, primaryColor, secondaryColor } = useThemeColors();
  const { currentTheme } = useStyleConfig();
  
  return (
    <div 
      style={{ 
        backgroundColor: primaryColor,
        color: colors.text.inverse 
      }}
      className="p-6 rounded-lg"
    >
      <h2 style={{ color: secondaryColor }}>
        Themed Content
      </h2>
      <p>This content uses the current theme: {currentTheme.name}</p>
    </div>
  );
};
```

### 3. Using CSS Variables (Recommended)

The system automatically injects CSS variables, so you can use them directly in your CSS:

```css
.my-component {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: 2px solid var(--color-accent);
}

.my-button {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
}

.my-card {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-background);
}
```

## Available CSS Variables

```css
/* Primary colors */
--color-primary
--color-secondary
--color-accent
--color-background
--color-surface

/* Text colors */
--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-inverse

/* Gradients */
--gradient-primary
--gradient-secondary

/* Status colors */
--color-success
--color-warning
--color-error
--color-info

/* Fonts */
--font-primary
--font-secondary
--font-mono
```

## Common Section IDs

Use these constants from `COMMON_SECTIONS`:

- `HERO` - Hero section
- `SERVICES` - Services preview
- `TESTIMONIALS` - Client testimonials
- `TEAM` - Team section
- `BLOG` - Blog listing
- `BLOG_NAV` - Blog navigation
- `CONTACT_FORM` - Contact form
- `PRICING` - Pricing section
- `CASE_STUDIES` - Case studies

## Integration Examples

### Existing Footer Component

```tsx
// Before
const Footer = ({ selectedIndustry }) => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Footer content */}
    </footer>
  );
};

// After - with visibility and theming
import { ConditionalSection } from '../hooks/useStyleConfig';

const Footer = ({ selectedIndustry }) => {
  return (
    <ConditionalSection sectionId="footer-main">
      <footer style={{ 
        backgroundColor: 'var(--color-text-primary)', 
        color: 'var(--color-text-inverse)' 
      }}>
        {/* Footer content */}
        
        <ConditionalSection sectionId="footer-social">
          <div className="social-links">
            {/* Social media links */}
          </div>
        </ConditionalSection>
        
        <ConditionalSection sectionId="footer-newsletter">
          <div className="newsletter-signup">
            {/* Newsletter form */}
          </div>
        </ConditionalSection>
      </footer>
    </ConditionalSection>
  );
};
```

### Service Cards with Theming

```tsx
const ServiceCard = ({ title, description, icon }) => {
  const { colors } = useThemeColors();
  
  return (
    <div 
      className="service-card p-6 rounded-xl border transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-background)',
        color: 'var(--color-text-primary)'
      }}
    >
      <div 
        className="icon-wrapper w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
    </div>
  );
};
```

## Best Practices

### 1. Use CSS Variables When Possible
```css
/* Good */
.button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Avoid - harder to theme */
.button {
  background-color: #371657;
  color: white;
}
```

### 2. Wrap Sections Appropriately
```tsx
// Good - wrap entire sections
<ConditionalSection sectionId="testimonials-section">
  <section className="testimonials">
    {/* All testimonial content */}
  </section>
</ConditionalSection>

// Avoid - wrapping individual items
{testimonials.map(testimonial => (
  <ConditionalSection sectionId="testimonials-section">
    <TestimonialCard {...testimonial} />
  </ConditionalSection>
))}
```

### 3. Provide Fallbacks
```tsx
<ConditionalSection 
  sectionId="team-section"
  fallback={<div className="text-center p-8">Team information coming soon</div>}
>
  <TeamSection />
</ConditionalSection>
```

### 4. Use Semantic Section IDs
```tsx
// Good - descriptive
const SECTION_IDS = {
  MAIN_HERO: 'hero-section',
  SERVICE_PREVIEW: 'services-preview',
  CLIENT_TESTIMONIALS: 'testimonials-section'
};

// Avoid - generic
const SECTION_IDS = {
  SECTION1: 'section1',
  SECTION2: 'section2'
};
```

## Testing Your Integration

1. **Visibility Testing**: Try toggling sections in the admin panel
2. **Theme Testing**: Switch between themes and check all components
3. **Color Override Testing**: Use custom colors and verify they apply
4. **Responsive Testing**: Check mobile/tablet views
5. **Performance Testing**: Ensure no significant performance impact

## Migration Checklist

For existing components:

- [ ] Replace hardcoded colors with CSS variables
- [ ] Wrap conditional sections with visibility controls
- [ ] Test with all available themes
- [ ] Verify mobile responsiveness
- [ ] Update any custom CSS to use new variables
- [ ] Test admin panel controls with your component

## Troubleshooting

### CSS Variables Not Applying
```tsx
// Ensure the style hook is initialized
const MyApp = () => {
  useStyleConfig(); // This applies the CSS variables
  return <YourApp />;
};
```

### Section Not Hiding
```tsx
// Check section ID spelling
const isVisible = useIsVisible('team-section'); // Correct
const isVisible = useIsVisible('team_section'); // Wrong - use hyphens
```

### Theme Colors Not Updating
```tsx
// Use CSS variables instead of JavaScript colors for auto-updates
// Good
<div style={{ color: 'var(--color-primary)' }} />

// Less ideal - won't auto-update
const { primaryColor } = useThemeColors();
<div style={{ color: primaryColor }} />
```