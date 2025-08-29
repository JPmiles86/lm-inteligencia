// Simple test endpoint to verify database connection
import { Pool } from 'pg';

export default async function handler(req, res) {
  console.log('[TEST-DB] Starting test...');
  console.log('[TEST-DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('[TEST-DB] NODE_ENV:', process.env.NODE_ENV);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    console.log('[TEST-DB] Attempting database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as time');
    console.log('[TEST-DB] Database connected, time:', result.rows[0].time);
    
    // Test style_guides table
    const guidesResult = await pool.query('SELECT COUNT(*) as count FROM style_guides');
    console.log('[TEST-DB] Style guides count:', guidesResult.rows[0].count);
    
    // Get sample guide
    const sampleResult = await pool.query('SELECT id, type, name FROM style_guides LIMIT 1');
    console.log('[TEST-DB] Sample guide:', sampleResult.rows[0]);
    
    await pool.end();
    
    return res.status(200).json({
      success: true,
      database: 'connected',
      time: result.rows[0].time,
      styleGuidesCount: guidesResult.rows[0].count,
      sampleGuide: sampleResult.rows[0],
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  } catch (error) {
    console.error('[TEST-DB] Error:', error.message);
    console.error('[TEST-DB] Stack:', error.stack);
    
    await pool.end();
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  }
}