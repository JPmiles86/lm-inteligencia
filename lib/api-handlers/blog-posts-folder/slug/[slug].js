import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogPosts } from '../../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

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
      const { slug } = req.query;

      if (!slug) {
        return res.status(400).json({ success: false, error: 'Slug is required' });
      }

      // Get post by slug
      const rawPosts = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      if (rawPosts.length === 0) {
        return res.status(404).json({ success: false, error: 'Blog post not found' });
      }

      const post = rawPosts[0];

      // Transform post to match expected frontend format
      const transformedPost = {
        ...post,
        author: {
          name: post.authorName || 'Laurie Meiring',
          title: post.authorTitle || 'Founder & Marketing Strategist', 
          image: post.authorImage || '/images/team/Laurie Meiring/laurie ai face 1x1.jpg'
        },
        tags: Array.isArray(post.tags) ? post.tags : []
      };

      res.status(200).json({
        success: true,
        data: transformedPost
      });

    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}