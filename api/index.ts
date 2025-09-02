/**
 * Single API Entry Point for Vercel
 * Consolidates all routes to reduce serverless function count
 */

import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Import all route modules
import aiRoutes from '../server/routes/ai.routes';
import blogRoutes from '../server/routes/blog.routes';
import generationRoutes from '../server/routes/generation.routes';
import imageRoutes from '../server/routes/image.routes';
import providerRoutes from '../server/routes/provider.routes';

// Initialize PostgreSQL database
export let db: any;
try {
  const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/lm_inteligencia';
  const sql = postgres(connectionString, {
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    max: 1, // Serverless functions should use single connections
    idle_timeout: 20,
    connect_timeout: 10
  });
  db = drizzle(sql);
} catch (error) {
  console.error('Database initialization error:', error);
  // Continue without database for now
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDb: !!db,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

// Mount all routes under /api
app.use('/api/ai', aiRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/providers', providerRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Export for Vercel
export default app;