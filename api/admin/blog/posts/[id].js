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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const postId = parseInt(id);

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, error: 'Invalid post ID' });
  }

  // GET - Fetch single post
  if (req.method === 'GET') {
    try {
      const posts = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.id, postId))
        .limit(1);

      if (posts.length === 0) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      const post = posts[0];
      
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
      console.error('Error fetching post:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch post' });
    }
  }

  // PUT - Update post
  else if (req.method === 'PUT') {
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
        readTime
      } = req.body;

      // Update the post
      const updatedPosts = await db.update(blogPosts)
        .set({
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
          updatedAt: new Date()
        })
        .where(eq(blogPosts.id, postId))
        .returning();

      if (updatedPosts.length === 0) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      const updatedPost = updatedPosts[0];
      
      // Transform post to match expected frontend format
      const transformedPost = {
        ...updatedPost,
        author: {
          name: updatedPost.authorName || 'Laurie Meiring',
          title: updatedPost.authorTitle || 'Founder & Marketing Strategist',
          image: updatedPost.authorImage || '/images/team/Laurie Meiring/laurie ai face 1x1.jpg'
        },
        tags: Array.isArray(updatedPost.tags) ? updatedPost.tags : []
      };

      res.status(200).json({
        success: true,
        data: transformedPost
      });

    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ success: false, error: 'Failed to update post' });
    }
  }

  // DELETE - Delete post
  else if (req.method === 'DELETE') {
    try {
      const deletedPosts = await db.delete(blogPosts)
        .where(eq(blogPosts.id, postId))
        .returning();

      if (deletedPosts.length === 0) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}