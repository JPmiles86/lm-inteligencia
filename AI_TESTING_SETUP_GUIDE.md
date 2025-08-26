# AI Content Generation System - Setup & Testing Guide

## 🚨 Current Status
The system has been built but needs critical dependencies and fixes before it can run.

## Step 1: Fix Package Dependencies

### Remove problematic package
```bash
# Edit package.json and remove this line from devDependencies:
"bc": "^1.0.0",
```

### Install AI Provider SDKs
```bash
npm install openai @anthropic-ai/sdk @google/generative-ai
```

### Verify installation
```bash
npm list openai @anthropic-ai/sdk @google/generative-ai
```

## Step 2: Setup Environment Variables

Create a `.env.local` file with your API keys:

```env
# AI Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
PERPLEXITY_API_KEY=pplx-...

# Database (use existing)
DATABASE_URL=your-existing-database-url

# For testing (optional test keys)
TEST_OPENAI_API_KEY=sk-...
TEST_ANTHROPIC_API_KEY=sk-ant-...
TEST_GOOGLE_API_KEY=...
TEST_PERPLEXITY_API_KEY=pplx-...
```

## Step 3: Fix TypeScript Errors

The main TypeScript errors are in `/src/components/admin/BlogAnalytics.tsx`. These need to be fixed:
- Missing properties on BlogStats type (categoryCounts, tagCounts, featuredPosts)
- Type mismatches in BlogEditor and BlogList

Run to check progress:
```bash
npm run type-check
```

## Step 4: Database Setup

```bash
# Run migrations to add AI tables
npm run db:migrate

# Seed initial AI data (style guides, verticals)
npm run ai:seed

# Test database connection
npm run ai:test
```

## Step 5: Testing Without API Keys

You CAN test many features without API keys:

### Unit Tests (No API keys needed)
```bash
# These test internal logic, mocked responses
npm run test:unit
```

### Integration Tests with Mocks
```bash
# Uses mocked API responses
npm run test:integration
```

### What requires real API keys:
- Live provider integration tests
- End-to-end generation workflows
- Performance testing with real APIs
- Cost tracking validation

## Step 6: Progressive Testing Approach

### Phase 1: Test Without Keys
1. **Database Layer**
   ```bash
   npm run ai:test
   ```

2. **Frontend Components**
   ```bash
   npm run dev
   # Navigate to /admin/ai to see UI
   ```

3. **API Endpoints (with mocks)**
   ```bash
   npm run test:api
   ```

### Phase 2: Test With Keys (When Ready)
1. **Provider Health Checks**
   ```bash
   # After adding keys to .env.local
   curl http://localhost:3000/api/ai/providers/health
   ```

2. **Simple Generation Test**
   ```bash
   curl -X POST http://localhost:3000/api/ai/generate \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Write a test blog post",
       "provider": "openai",
       "model": "gpt-4o-mini"
     }'
   ```

3. **Full E2E Tests**
   ```bash
   npm run test:e2e
   ```

## Step 7: Quick Fixes Needed

### High Priority (Blocking)
1. Remove `bc` package from package.json
2. Install AI provider SDKs
3. Fix BlogAnalytics TypeScript errors

### Medium Priority (Functional)
4. Add .env.local with at least one API key
5. Run database migrations
6. Fix remaining TypeScript errors

### Low Priority (Polish)
7. Fix ESLint warnings
8. Optimize bundle size
9. Add rate limiting config

## Testing Strategy by Component

### Can Test Now (No API Keys):
- ✅ Database schema and migrations
- ✅ Repository pattern CRUD operations
- ✅ Frontend UI components and navigation
- ✅ State management and context building
- ✅ Generation tree visualization
- ✅ Style guide management UI
- ✅ Mocked API responses

### Needs API Keys:
- ❌ Real AI generation (OpenAI, Anthropic, etc.)
- ❌ Image generation (DALL-E, Imagen)
- ❌ Web search (Perplexity)
- ❌ Cost tracking accuracy
- ❌ Provider fallback mechanisms
- ❌ Rate limit handling

## Recommended Testing Order

1. **Fix dependencies** (5 min)
2. **Run build to verify** (1 min)
   ```bash
   npm run build
   ```

3. **Start dev server** (No API keys needed)
   ```bash
   npm run dev
   ```

4. **Explore UI at** http://localhost:5173/admin/ai

5. **Add one API key** (OpenAI recommended for start)

6. **Test basic generation**

7. **Add remaining keys progressively**

## Common Issues & Solutions

### Issue: "Cannot find module 'openai'"
**Solution**: Run `npm install openai @anthropic-ai/sdk @google/generative-ai`

### Issue: TypeScript errors in build
**Solution**: The app will still run. Fix BlogAnalytics.tsx for clean build.

### Issue: "API key not found"
**Solution**: Add keys to .env.local, restart dev server

### Issue: Database connection failed
**Solution**: Check DATABASE_URL in .env.local matches your existing setup

## What's Actually Working Now

Even without fixes, you can:
1. View the complete UI structure
2. Navigate through all AI components
3. See the generation workflow design
4. Explore style guide interfaces
5. Test database migrations

## Next Steps After Setup

1. **Start with OpenAI only** - Most stable, well-documented
2. **Test simple generation** - Single blog post
3. **Add Anthropic** - For comparison
4. **Test multi-provider** - Fallback mechanisms
5. **Add Google/Perplexity** - Advanced features

## Support & Debugging

### Check System Health
```bash
# Database connection
npm run ai:test

# TypeScript status
npm run type-check

# Build status
npm run build
```

### View Logs
- Browser console for frontend errors
- Terminal for API errors
- Network tab for API calls

### Quick Validation
```bash
# This should work even now:
npm run dev
# Navigate to http://localhost:5173/admin/ai
```

---

## Summary

The system is **structurally complete** but needs:
1. **Critical**: AI provider packages installed
2. **Important**: TypeScript errors fixed
3. **Required for testing**: At least one API key

You can explore the UI and test many features without API keys. Start with the UI exploration, then add keys progressively as needed.