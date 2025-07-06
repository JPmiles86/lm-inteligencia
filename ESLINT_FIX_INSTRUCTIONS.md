# ESLint Fix Instructions - Production Ready Code

## CRITICAL PRINCIPLES
1. **NO SHORTCUTS** - Every fix must be a proper, robust solution
2. **UNDERSTAND BEFORE FIXING** - Analyze what the code does and why
3. **PROPER TYPING** - Replace all `any` types with accurate interfaces
4. **PRESERVE FUNCTIONALITY** - Never break existing features
5. **PRODUCTION QUALITY** - Code must be maintainable and scalable
6. **DOCUMENT EVERYTHING** - Explain your reasoning for each fix

## Error Categories to Fix

### 1. TypeScript `any` Types (@typescript-eslint/no-explicit-any)
**NEVER use `any` as a fix. Instead:**
- Define proper interfaces for all data structures
- Use generic types where appropriate
- Create type unions for multiple possible types
- Use `unknown` with type guards if type is truly dynamic
- Research the actual shape of the data being used

**Example of WRONG approach:**
```typescript
// BAD - Don't do this
const handleChange = (e: any) => { ... }
```

**Example of CORRECT approach:**
```typescript
// GOOD - Proper typing
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }
```

### 2. Unused Variables (@typescript-eslint/no-unused-vars)
**Before removing:**
- Check if the variable is part of a destructuring pattern
- Verify it's not used in comments or string templates
- Ensure it's not a placeholder for future functionality
- If it's a function parameter, check if it's required by an interface

**Solutions:**
- Remove if truly unused
- Prefix with underscore if intentionally unused (e.g., `_unusedParam`)
- Use it if it should be used but was forgotten

### 3. React Hooks Violations
**Common issues:**
- Conditional hook calls
- Missing dependencies
- Unnecessary dependencies

**Proper fixes:**
- Move hooks to top level of component
- Include all dependencies or use callback/memo patterns
- Remove truly unnecessary dependencies

### 4. React Refresh Warnings
**Issue:** Mixing component exports with non-component exports

**Solutions:**
- Move contexts to separate files
- Move constants/utilities to separate files
- Keep only React components in component files

### 5. require() Statements
**Replace with ES6 imports:**
```typescript
// BAD
const config = require('./config');

// GOOD
import config from './config';
```

## Investigation Process for Each Error

1. **Read the entire file** to understand context
2. **Trace data flow** to understand types
3. **Check related files** for interfaces/types
4. **Test the current functionality** mentally
5. **Implement the proper fix**
6. **Verify fix doesn't break anything**

## Type Definition Strategy

### For Event Handlers
```typescript
// Input events
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
onClick: (e: React.MouseEvent<HTMLButtonElement>) => void

// Select events
onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void

// Textarea events
onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
```

### For API Responses
1. Check the actual API response shape
2. Define comprehensive interfaces
3. Use type guards for runtime safety

### For Component Props
1. Define explicit interfaces
2. Use `React.FC<Props>` or define return type
3. Export prop types for reuse

## Documentation Requirements

For each fix, document in `ESLINT_FIX_NOTES.md`:
1. What the error was
2. Why it occurred
3. What investigation you did
4. What the proper fix is
5. Why this fix is correct
6. Any potential impacts

## Testing Each Fix

After each fix:
1. Ensure the component/function still works as intended
2. Check for TypeScript errors: `npm run type-check`
3. Check for ESLint errors: `npm run lint`
4. Consider edge cases
5. Verify no functionality was lost

## Priority Order

1. **React Hooks violations** - Can break React
2. **Unused variables in critical files** - Clean up code
3. **require() statements** - Modernize imports
4. **any types in admin components** - Type safety for data
5. **any types in other components** - Complete type safety
6. **React Refresh warnings** - Better code organization

## Remember

- Take time to understand each piece of code
- Research proper types (check React types, library documentation)
- Create reusable type definitions
- Think about future maintainability
- Never compromise on quality for speed