import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.API_PORT || process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Middleware setup
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      server: 'running'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database status endpoint
app.get('/api/db/status', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version,
        NOW() as timestamp
    `);
    client.release();
    
    res.json({
      status: 'connected',
      ...result.rows[0]
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Import and use route handlers
import { errorHandler } from './middleware/error.middleware';
import generationRoutes from './routes/generation.routes';
// TODO: Implement these routes properly
// import providerRoutes from './routes/provider.routes';
// import blogRoutes from './routes/blog.routes';
// import imageRoutes from './routes/image.routes';

// Mount routes
app.use('/api/generation', generationRoutes);
// TODO: Add when implemented
// app.use('/api/providers', providerRoutes);
// app.use('/api/blogs', blogRoutes);
// app.use('/api/images', imageRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Server startup aborted due to database connection failure');
      process.exit(1);
    }

    app.listen(port, () => {
      console.log(`🚀 API server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
      console.log(`🗄️ Database status: http://localhost:${port}/api/db/status`);
      console.log(`🌐 CORS enabled for frontend URLs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();