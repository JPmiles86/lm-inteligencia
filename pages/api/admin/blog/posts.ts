import { NextApiRequest, NextApiResponse } from 'next';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blogPosts } from '../../../../src/db/schema';
import { eq, and, desc, asc, like, or, count } from 'drizzle-orm';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '10',
        category,
        published,
        search,
        sortBy = 'publishedDate',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      // Build where conditions
      const conditions = [];
      
      if (published !== undefined) {
        if (published === 'true') {
          conditions.push(eq(blogPosts.published, true));
        } else if (published === 'false') {
          conditions.push(eq(blogPosts.published, false));
        }
      }
      
      if (category && category !== 'All') {
        conditions.push(eq(blogPosts.category, category as string));
      }
      
      if (search) {
        conditions.push(
          or(
            like(blogPosts.title, `%${search}%`),
            like(blogPosts.excerpt, `%${search}%`),
            like(blogPosts.content, `%${search}%`)
          )
        );
      }

      // Build where clause
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get posts with pagination
      const posts = await db.select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(sortOrder === 'desc' ? desc(blogPosts.publishedDate) : asc(blogPosts.publishedDate))
        .limit(limitNum)
        .offset((pageNum - 1) * limitNum);

      // Get total count
      const totalResult = await db.select({ count: count() })
        .from(blogPosts)
        .where(whereClause);

      const totalCount = totalResult[0].count;
      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        data: posts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNext: pageNum < totalPages,
          hasPrevious: pageNum > 1
        }
      });

    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch blog posts' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}