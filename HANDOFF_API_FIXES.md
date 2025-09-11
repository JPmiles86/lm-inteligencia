# API Fixes Handoff Document

## Current Situation
The client needs to stay within Vercel's free tier limit of 12 serverless functions. Currently experiencing API failures due to ES module import issues.

## Problem Summary
1. **Vercel Limit**: Only 12 serverless functions allowed on free tier
2. **Current Setup**: Using `api/index.ts` as single entry point with Express to consolidate all routes
3. **Issue**: Complex import chains from Express → server/routes → services are failing with ES module errors
4. **Catch-22**: 
   - Server-side needs `.js` extensions for ES modules
   - Client-side (Vite/React) breaks with `.js` extensions
   - Can't fix one without breaking the other

## What's Working
- ✅ `/api/vertical-visibility` - Standalone endpoint with inline schema
- ✅ `/api/test-simple` - Basic test endpoint (newly created)
- ✅ `/api/brainstorm-simple` - Simplified brainstorm endpoint (needs OPENAI_API_KEY)

## What's NOT Working
- ❌ `/api/health` - Express app route
- ❌ `/api/ai/providers` - Express app route
- ❌ `/api/ai/style-guides` - Express app route
- ❌ `/api/ai/analytics` - Express app route
- ❌ `/api/ai/brainstorm` - Express app route

## Test Page
Access at: `https://hospitality.inteligenciadm.com/api-test.html`
- Shows real-time status of all API endpoints
- Displays actual error messages
- Color-coded results (green=success, red=error)

## API Keys
Need to check for OpenAI API key in:
1. **Vercel Environment Variables**: Dashboard → Settings → Environment Variables
2. **Database**: Check `provider_settings` table via Railway
3. **Code**: Was previously in `api/brainstorm.ts` (now deleted)

## Files Modified Today
- `api/test-simple.ts` - New simple test endpoint
- `api/brainstorm-simple.ts` - New simplified brainstorm endpoint
- `public/api-test.html` - API testing dashboard
- `vercel.json` - Routing configuration
- Multiple import fixes in server files

## Recommended Solution
Since we need to stay within 12 functions, options are:

### Option 1: Fix Express App (Recommended)
- Keep single `api/index.ts` entry point
- Fix the import issues by using webpack/esbuild to bundle server code
- This maintains the 1-function limit

### Option 2: Create Minimal Standalone Endpoints
- Create 10-11 standalone endpoints (staying under 12)
- Each endpoint self-contained with minimal imports
- Similar to how `vertical-visibility.ts` works

### Option 3: Hybrid Approach
- Keep some critical endpoints standalone (brainstorm, providers)
- Bundle others through Express app
- Stay under 12 total

## Immediate Next Steps
1. Check if OPENAI_API_KEY exists in Vercel env vars
2. Test `/api/test-simple` endpoint once deployed
3. If test endpoint works, decide on solution approach
4. Update client code to use working endpoints

## Important Context
- Client is frustrated with circular issues (understandably)
- Build takes ~2 mins to deploy on Vercel
- Test page at `/api-test.html` helps debug without F12
- Server files in `server/` directory
- API files in `api/` directory
- Client-side code in `src/`

## Current Blockers
1. ES module import format incompatibility between server/client
2. Vercel 12-function limit on free tier
3. Complex Express app not working in serverless environment

## Background Processes Running
- Bash process 3e8f87: npm run dev:api (likely failing)
- Bash process 1378ba: npx vercel dev --listen 3000

Kill these with: `KillBash` tool if needed.