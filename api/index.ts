/**
 * Single API Entry Point for Vercel
 * Consolidates all routes to reduce serverless function count
 */

import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// Import all route modules
import aiRoutes from './routes/ai.routes';
import blogRoutes from './routes/blog.routes';
import generationRoutes from './routes/generation.routes';
import imageRoutes from './routes/image.routes';
import providerRoutes from './routes/provider.routes';

// Initialize database
const sqlite = new Database('lm.db');
export const db = drizzle(sqlite);

// Run migrations
migrate(db, { migrationsFolder: path.join(__dirname, '../src/db/migrations') });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
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