import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogPosts } from '../../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const {
        published = 'true',
        category,
        limit = '10'
      } = req.query;

      const limitNum = parseInt(limit);

      // Build where conditions
      const conditions = [];
      
      // Only show published posts for public API
      if (published === 'true') {
        conditions.push(eq(blogPosts.published, true));
      }
      
      if (category && category !== 'All') {
        conditions.push(eq(blogPosts.category, category));
      }

      // Build where clause
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get posts
      const posts = await db.select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(desc(blogPosts.publishedDate))
        .limit(limitNum);

      res.status(200).json({
        success: true,
        data: posts
      });

    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch blog posts' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}