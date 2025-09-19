/**
 * Single API Entry Point for Vercel
 * Consolidates all routes to reduce serverless function count
 */

import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

// Import all route modules
import aiRoutes from '../server/routes/ai.routes.js';
import blogRoutes from '../server/routes/blog.routes.js';
import generationRoutes from '../server/routes/generation.routes.js';
import imageRoutes from '../server/routes/image.routes.js';
import providerRoutes from '../server/routes/provider.routes.js';

// Initialize PostgreSQL database
export let db: any;
const initDatabase = () => {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('DATABASE_URL environment variable is not set');
      return null;
    }

    console.log('Initializing database connection...', {
      hasUrl: !!connectionString,
      isProduction: process.env.NODE_ENV === 'production',
      urlPrefix: connectionString?.substring(0, 20)
    });

    const sql = postgres(connectionString, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      max: 1, // Serverless functions should use single connections
      idle_timeout: 20,
      connect_timeout: 10
    });

    const database = drizzle(sql);
    console.log('Database initialized successfully');
    return database;
  } catch (error) {
    console.error('Database initialization error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
    return null;
  }
};

db = initDatabase();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'not_initialized';
  let dbError = null;

  if (db) {
    try {
      // Try a simple query to test the connection
      await db.execute(sql`SELECT 1`);
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: {
      initialized: !!db,
      status: dbStatus,
      error: dbError,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      urlConfigured: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : null
    }
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