import { NextApiRequest, NextApiResponse } from 'next';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blogPosts } from '../../../../src/db/schema';
import { eq, count } from 'drizzle-orm';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const totalResult = await db.select({ count: count() }).from(blogPosts);
      const publishedResult = await db.select({ count: count() })
        .from(blogPosts)
        .where(eq(blogPosts.published, true));
      const draftResult = await db.select({ count: count() })
        .from(blogPosts)
        .where(eq(blogPosts.published, false));

      // Get unique categories count
      const categoriesResult = await db.select({ category: blogPosts.category })
        .from(blogPosts)
        .groupBy(blogPosts.category);

      const stats = {
        totalPosts: totalResult[0].count,
        publishedPosts: publishedResult[0].count,
        draftPosts: draftResult[0].count,
        totalViews: 0, // Not tracked in current schema
        categories: categoriesResult.length
      };

      res.status(200).json(stats);

    } catch (error) {
      console.error('Error fetching blog stats:', error);
      res.status(500).json({ error: 'Failed to fetch blog stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}