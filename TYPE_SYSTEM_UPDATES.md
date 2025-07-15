# Type System Updates Required

## Critical Type Changes

### 1. Update IndustryType in `src/types/Industry.ts`

```typescript
// CURRENT:
export type IndustryType = 'hospitality' | 'foodservice' | 'healthcare' | 'athletics' | 'main';

// UPDATE TO:
export type IndustryType = 'hospitality' | 'healthcare' | 'tech' | 'athletics' | 'main';
// Note: 'foodservice' is removed as it's merged into 'hospitality'
```

### 2. Update Industry Names

```typescript
// In src/types/Industry.ts
export const IndustryNames: Record<IndustryType, string> = {
  hospitality: 'Hospitality & Lifestyle',
  healthcare: 'Health & Wellness',
  tech: 'Tech, AI & Digital Innovation',
  athletics: 'Sport, Media & Events',
  main: 'All Industries'
};
```

### 3. Update Industry Colors (if needed)

```typescript
// In src/types/Industry.ts
export const IndustryColors: Record<IndustryType, { primary: string; secondary: string; accent: string }> = {
  hospitality: {
    primary: '#371657',
    secondary: '#f04a9b',
    accent: '#176ab2'
  },
  healthcare: {
    primary: '#371657',
    secondary: '#f04a9b',
    accent: '#176ab2'
  },
  tech: {
    primary: '#371657',
    secondary: '#f04a9b',
    accent: '#176ab2'
  },
  athletics: {
    primary: '#371657',
    secondary: '#f04a9b',
    accent: '#176ab2'
  },
  main: {
    primary: '#371657',
    secondary: '#f04a9b',
    accent: '#176ab2'
  }
};
```

### 4. Migration Considerations

#### Removed Type
- `foodservice` - This type is being removed and merged into `hospitality`

#### New Type
- `tech` - This is a completely new industry type

#### Type Safety
When removing `foodservice`, ensure all references are updated:
1. Search for all uses of 'foodservice' in the codebase
2. Replace with 'hospitality' where appropriate
3. Update any switch statements or conditionals
4. Check for any foodservice-specific logic that needs preservation

### 5. Configuration Updates

In `industry-configs.ts`, ensure:
1. Remove `foodservice` configuration
2. Update `hospitality` to include restaurant content
3. Add new `tech` configuration
4. Keep `main` configuration unchanged

### 6. Potential Breaking Changes

Areas that might break:
1. URL routing for `/restaurants` - needs redirect to `/hospitality`
2. Any hardcoded references to 'foodservice' type
3. Analytics or tracking using industry types
4. API calls or backend references (if any)

### 7. Testing Checklist

After type updates:
- [ ] TypeScript compiles without errors
- [ ] All pages load correctly
- [ ] Industry switching works
- [ ] Old URLs redirect properly
- [ ] Navigation shows correct industries
- [ ] No console errors in browser