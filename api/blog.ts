/**
 * Standalone blog API endpoint
 * Handles blog CRUD operations
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, and } from 'drizzle-orm';
import { pgTable, serial, varchar, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';

// Inline blog posts schema to avoid import issues
const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: varchar('featured_image', { length: 500 }),
  category: varchar('category', { length: 100 }).notNull(),
  tags: json('tags').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  published: boolean('published').default(false),
  publishedDate: varchar('published_date', { length: 50 }),
  status: varchar('status', { length: 20 }).default('draft'),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: varchar('meta_description', { length: 260 }),
  keywords: json('keywords').$type<string[]>().default([]),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorTitle: varchar('author_title', { length: 150 }),
  authorImage: varchar('author_image', { length: 500 }),
  readTime: integer('read_time').default(5),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let sql: any;
  let db: any;

  try {
    // Initialize database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not configured');
    }

    sql = postgres(connectionString, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    db = drizzle(sql);

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET': {
        // Parse query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const published = url.searchParams.get('published') === 'true';
        const featured = url.searchParams.get('featured') === 'true';
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        // Build query conditions
        const conditions = [];
        if (published) {
          conditions.push(eq(blogPosts.published, true));
        }
        if (featured) {
          conditions.push(eq(blogPosts.featured, true));
        }
        if (category) {
          conditions.push(eq(blogPosts.category, category));
        }

        // Execute query
        let query = db.select().from(blogPosts);
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        const posts = await query.orderBy(desc(blogPosts.createdAt)).limit(limit);

        await sql.end();
        return res.status(200).json(posts);
      }

      case 'POST': {
        // Create new blog post
        const newPost = req.body;
        
        // Generate slug if not provided
        if (!newPost.slug && newPost.title) {
          newPost.slug = newPost.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        const [created] = await db.insert(blogPosts).values(newPost).returning();
        
        await sql.end();
        return res.status(201).json(created);
      }

      case 'PUT': {
        // Update blog post
        const { id, ...updates } = req.body;
        if (!id) {
          await sql.end();
          return res.status(400).json({ error: 'Post ID is required' });
        }

        updates.updatedAt = new Date();
        const [updated] = await db
          .update(blogPosts)
          .set(updates)
          .where(eq(blogPosts.id, id))
          .returning();

        await sql.end();
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        // Delete blog post
        const { id } = req.query;
        if (!id) {
          await sql.end();
          return res.status(400).json({ error: 'Post ID is required' });
        }

        await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
        
        await sql.end();
        return res.status(200).json({ success: true });
      }

      default:
        await sql.end();
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Blog API error:', error);
    
    // Close database connection on error
    if (sql) {
      try {
        await sql.end();
      } catch {}
    }

    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}