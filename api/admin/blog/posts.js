import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogPosts } from '../../../src/db/schema.js';
import { eq, and, desc, asc, like, or, count } from 'drizzle-orm';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

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
        conditions.push(eq(blogPosts.category, category));
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
      const rawPosts = await db.select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(sortOrder === 'desc' ? desc(blogPosts.publishedDate) : asc(blogPosts.publishedDate))
        .limit(limitNum)
        .offset((pageNum - 1) * limitNum);

      // Transform posts to match expected frontend format
      const posts = rawPosts.map(post => ({
        ...post,
        author: {
          name: post.authorName || 'Laurie Meiring',
          title: post.authorTitle || 'Founder & Marketing Strategist',
          image: post.authorImage || '/images/team/Laurie Meiring/laurie ai face 1x1.jpg'
        },
        tags: Array.isArray(post.tags) ? post.tags : []
      }));

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
  } 
  // POST - Create new post
  else if (req.method === 'POST') {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        category,
        tags,
        featured,
        published,
        publishedAt,
        authorName,
        authorTitle,
        authorImage,
        readTime,
        editorType,
        blocks
      } = req.body;

      // Create the new post
      const newPosts = await db.insert(blogPosts)
        .values({
          title,
          slug,
          excerpt,
          content,
          featuredImage,
          category,
          tags: tags || [],
          featured: featured || false,
          published: published !== undefined ? published : true,
          publishedDate: publishedAt || new Date().toISOString(),
          authorName,
          authorTitle,
          authorImage,
          readTime: readTime || 5,
          editorType: editorType || 'rich',
          blocks: blocks || [],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      const newPost = newPosts[0];
      
      // Transform post to match expected frontend format
      const transformedPost = {
        ...newPost,
        author: {
          name: newPost.authorName || 'Laurie Meiring',
          title: newPost.authorTitle || 'Founder & Marketing Strategist',
          image: newPost.authorImage || '/images/team/Laurie Meiring/laurie ai face 1x1.jpg'
        },
        tags: Array.isArray(newPost.tags) ? newPost.tags : []
      };

      res.status(201).json({
        success: true,
        data: transformedPost
      });

    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ success: false, error: 'Failed to create post' });
    }
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}