# Agent-1B: Backend API Server Restoration
**Priority:** 🔴 CRITICAL
**Duration:** 12 hours
**Dependencies:** Can work in parallel with Agent-1A
**Created:** 2025-08-31

## 🎯 MISSION
Create and configure the missing backend API server (`api/server.ts`) to establish database connectivity and API endpoints for the AI blog system.

## 📋 CONTEXT
- **Issue:** API server file missing, causing backend failure
- **Stack:** Express + TypeScript + Drizzle ORM
- **Database:** PostgreSQL on Railway
- **Requirement:** Real API connections (no mock data)

## ✅ SUCCESS CRITERIA
1. API server starts with `npm run dev:api`
2. Database connection established
3. Health check endpoint returns 200
4. CORS properly configured
5. Basic AI endpoints responding

## 🔧 SPECIFIC TASKS

### 1. Create Server Infrastructure (2 hours)

#### Create `/api/server.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
```

### 2. Set Up API Route Structure (2 hours)

Create modular route structure:
```
/api/
  ├── routes/
  │   ├── ai.routes.ts
  │   ├── blog.routes.ts
  │   ├── provider.routes.ts
  │   └── image.routes.ts
  ├── middleware/
  │   ├── error.middleware.ts
  │   └── validation.middleware.ts
  └── server.ts
```

### 3. Implement Provider Management Endpoints (3 hours)

#### `/api/routes/provider.routes.ts`
```typescript
import { Router } from 'express';
import { db } from '../server';
import { providerSettings } from '../../src/db/schema';
import { encrypt, decrypt } from '../utils/encryption';

const router = Router();

// Get available providers
router.get('/providers', async (req, res) => {
  try {
    const providers = await db.select().from(providerSettings);
    // Don't send encrypted keys to frontend
    const safeProviders = providers.map(p => ({
      ...p,
      apiKeyEncrypted: undefined,
      encryptionSalt: undefined,
      hasKey: !!p.apiKeyEncrypted
    }));
    res.json(safeProviders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Add/Update provider API key
router.post('/providers/:provider', async (req, res) => {
  const { provider } = req.params;
  const { apiKey } = req.body;
  
  // Encrypt and store API key
  // Implementation here
});

// Test provider connection
router.post('/providers/:provider/test', async (req, res) => {
  // Test API key validity
});
```

### 4. Implement AI Generation Endpoints (3 hours)

#### `/api/routes/ai.routes.ts`
```typescript
import { Router } from 'express';
import { selectProvider } from '../services/providerSelector';

const router = Router();

// Generate blog content
router.post('/generate/blog', async (req, res) => {
  try {
    const { prompt, context, preferredProvider } = req.body;
    
    // Select provider based on availability and preference
    const provider = await selectProvider('writing', preferredProvider);
    
    // Generate content using selected provider
    const result = await provider.generateBlog(prompt, context);
    
    res.json({
      content: result.content,
      provider: provider.name,
      model: provider.model
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate images
router.post('/generate/image', async (req, res) => {
  const { prompt, preferredProvider } = req.body;
  
  // Only OpenAI and Google support images
  const provider = await selectProvider('image', preferredProvider);
  
  if (!provider) {
    return res.status(400).json({ 
      error: 'No image generation provider available' 
    });
  }
  
  // Generate image
});
```

### 5. Create Provider Selection Service (2 hours)

#### `/api/services/providerSelector.ts`
```typescript
interface ProviderCapabilities {
  text: boolean;
  image: boolean;
  research: boolean;
}

const PROVIDER_CAPABILITIES = {
  openai: { text: true, image: true, research: true },
  anthropic: { text: true, image: false, research: true },
  google: { text: true, image: true, research: true },
  perplexity: { text: true, image: false, research: true }
};

const FALLBACK_CHAINS = {
  research: ['perplexity', 'anthropic', 'google', 'openai'],
  writing: ['anthropic', 'openai', 'google'],
  image: ['google', 'openai'],
  ideation: ['openai', 'anthropic', 'google']
};

export async function selectProvider(
  taskType: string, 
  preferred?: string
): Promise<Provider> {
  // Get available providers from database
  const availableProviders = await getAvailableProviders();
  
  // Check preferred provider first
  if (preferred && availableProviders[preferred]) {
    return availableProviders[preferred];
  }
  
  // Use fallback chain
  const chain = FALLBACK_CHAINS[taskType] || FALLBACK_CHAINS.writing;
  
  for (const providerName of chain) {
    if (availableProviders[providerName]) {
      return availableProviders[providerName];
    }
  }
  
  throw new Error(`No provider available for ${taskType}`);
}
```

### 6. Add Error Handling Middleware (1 hour)

#### `/api/middleware/error.middleware.ts`
```typescript
export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

### 7. Database Connection Testing (1 hour)

Create test script to verify connection:
```typescript
// /api/utils/testDb.ts
async function testDatabaseConnection() {
  try {
    const result = await db.select().from(providerSettings).limit(1);
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
```

## 📝 REQUIRED DELIVERABLES

### 1. Create Implementation Report
**File:** `/docs/agent-reports/AGENT-1B-API-SERVER.md`
- Document all endpoints created
- List any issues encountered
- Note configuration requirements

### 2. Create API Documentation
**File:** `/docs/API_DOCUMENTATION.md`
- List all endpoints with request/response examples
- Document provider fallback logic
- Include error codes

### 3. Update Master Progress Log
Add completion status and any blocking issues found

## 🔍 TESTING REQUIREMENTS

1. **Server Start Test:**
```bash
npm run dev:api
# Should start without errors
```

2. **Health Check:**
```bash
curl http://localhost:3001/api/health
# Should return {"status":"healthy"}
```

3. **Database Connection:**
```bash
npm run db:test
# Should connect successfully
```

4. **Provider Endpoints:**
- Test GET /api/providers
- Test POST /api/providers/openai
- Test provider selection logic

## ⚠️ IMPORTANT NOTES

1. **Environment Variables:** Check `.env` for:
   - DATABASE_URL (Railway PostgreSQL)
   - CLIENT_URL (Vite dev server)
   - PORT (API server port)

2. **CORS Configuration:** Must allow Vite dev server (usually localhost:5173)

3. **Database Schema:** Use existing Drizzle schema from `/src/db/schema.ts`

4. **No Mock Data:** All endpoints must connect to real services

5. **Error Handling:** Every endpoint needs try-catch with proper error responses

## 🚫 DO NOT

1. Use mock data or fallbacks to fake data
2. Hardcode API keys in code
3. Send encrypted keys to frontend
4. Skip error handling
5. Use Prisma (project uses Drizzle)

## 💡 DEBUGGING TIPS

If server won't start:
- Check DATABASE_URL is correct
- Verify all dependencies installed
- Check for port conflicts
- Look for TypeScript errors

If database won't connect:
- Test connection string separately
- Check Railway database is running
- Verify credentials
- Check network connectivity

---

*Report completion to `/docs/agent-reports/` and update `/MASTER_PROGRESS_LOG.md`*