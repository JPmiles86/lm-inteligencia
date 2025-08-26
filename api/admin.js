// Consolidated Admin API
// Handles all admin blog operations

export default async function handler(req, res) {
  const { method, query, body } = req;
  const { action, id, postId, slug, operation } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Import necessary dependencies
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { blogPosts } = await import('../src/db/schema.js');
    const { eq, and, desc, asc, or, like, sql } = await import('drizzle-orm');

    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const db = drizzle(pool);

    // Route to appropriate action
    switch (action) {
      case 'posts': {
        if (method === 'GET') {
          // Get all posts with filtering and pagination
          const {
            page = '1',
            limit = '10',
            category,
            featured,
            published,
            search,
            tags,
            sortBy = 'publishedDate',
            sortOrder = 'desc'
          } = query;

          // Build query conditions
          const conditions = [];
          
          if (published !== undefined) {
            conditions.push(eq(blogPosts.published, published === 'true'));
          }
          if (category) {
            conditions.push(eq(blogPosts.category, category));
          }
          if (featured !== undefined) {
            conditions.push(eq(blogPosts.featured, featured === 'true'));
          }
          if (search) {
            conditions.push(
              or(
                like(blogPosts.title, `%${search}%`),
                like(blogPosts.excerpt, `%${search}%`)
              )
            );
          }

          // Execute query
          const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
          
          let queryBuilder = db.select().from(blogPosts);
          if (whereClause) {
            queryBuilder = queryBuilder.where(whereClause);
          }

          // Add sorting
          const sortColumn = sortBy === 'publishedAt' ? blogPosts.publishedDate : (blogPosts[sortBy] || blogPosts.publishedDate);
          if (sortOrder === 'desc') {
            queryBuilder = queryBuilder.orderBy(desc(sortColumn));
          } else {
            queryBuilder = queryBuilder.orderBy(asc(sortColumn));
          }

          // Add pagination
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);
          const offset = (pageNum - 1) * limitNum;
          
          queryBuilder = queryBuilder.limit(limitNum).offset(offset);
          
          const posts = await queryBuilder;

          // Get total count for pagination
          let countQuery = db.select({ count: sql`count(*)` }).from(blogPosts);
          if (whereClause) {
            countQuery = countQuery.where(whereClause);
          }
          const [countResult] = await countQuery;
          const totalItems = Number(countResult.count);

          await pool.end();

          return res.status(200).json({
            success: true,
            data: posts,
            pagination: {
              currentPage: pageNum,
              totalPages: Math.ceil(totalItems / limitNum),
              totalItems,
              itemsPerPage: limitNum
            }
          });
        } else if (method === 'POST') {
          // Create new post
          const [newPost] = await db.insert(blogPosts).values(body).returning();
          await pool.end();
          
          return res.status(201).json({
            success: true,
            data: newPost
          });
        }
        break;
      }

      case 'post': {
        if (!id) {
          await pool.end();
          return res.status(400).json({ error: 'Post ID is required' });
        }

        if (method === 'GET') {
          // Get single post by ID or slug
          let post;
          if (slug) {
            [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
          } else {
            [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(id))).limit(1);
          }
          
          await pool.end();

          if (!post) {
            return res.status(404).json({ error: 'Post not found' });
          }

          return res.status(200).json({
            success: true,
            data: post
          });
        } else if (method === 'PUT') {
          // Update post
          if (operation === 'publish') {
            // Publish/unpublish post
            const [updatedPost] = await db
              .update(blogPosts)
              .set({ 
                published: body.published !== false,
                publishedDate: body.published !== false ? new Date().toISOString() : null
              })
              .where(eq(blogPosts.id, parseInt(id)))
              .returning();
              
            await pool.end();
            
            return res.status(200).json({
              success: true,
              data: updatedPost,
              action: body.published !== false ? 'published' : 'unpublished'
            });
          } else if (operation === 'feature') {
            // Feature/unfeature post
            const [updatedPost] = await db
              .update(blogPosts)
              .set({ featured: body.featured !== false })
              .where(eq(blogPosts.id, parseInt(id)))
              .returning();
              
            await pool.end();
            
            return res.status(200).json({
              success: true,
              data: updatedPost,
              action: body.featured !== false ? 'featured' : 'unfeatured'
            });
          } else {
            // Regular update
            const [updatedPost] = await db
              .update(blogPosts)
              .set(body)
              .where(eq(blogPosts.id, parseInt(id)))
              .returning();
              
            await pool.end();
            
            return res.status(200).json({
              success: true,
              data: updatedPost
            });
          }
        } else if (method === 'DELETE') {
          // Delete post
          await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
          await pool.end();
          
          return res.status(204).end();
        }
        break;
      }

      case 'stats': {
        if (method === 'GET') {
          // Get blog statistics
          const [totalResult] = await db.select({ count: sql`count(*)` }).from(blogPosts);
          const [publishedResult] = await db
            .select({ count: sql`count(*)` })
            .from(blogPosts)
            .where(eq(blogPosts.published, true));
          const [draftResult] = await db
            .select({ count: sql`count(*)` })
            .from(blogPosts)
            .where(eq(blogPosts.published, false));
          const [featuredResult] = await db
            .select({ count: sql`count(*)` })
            .from(blogPosts)
            .where(eq(blogPosts.featured, true));

          // Get category counts
          const categoryResults = await db
            .select({
              category: blogPosts.category,
              count: sql`count(*)`
            })
            .from(blogPosts)
            .groupBy(blogPosts.category);

          const categoryCounts = {};
          categoryResults.forEach(row => {
            categoryCounts[row.category] = Number(row.count);
          });

          await pool.end();

          return res.status(200).json({
            success: true,
            data: {
              totalPosts: Number(totalResult.count),
              publishedPosts: Number(publishedResult.count),
              draftPosts: Number(draftResult.count),
              featuredPosts: Number(featuredResult.count),
              categoryCounts,
              scheduledPosts: 0, // TODO: Implement scheduled posts
              tagCounts: {}, // TODO: Implement tag counts
              monthlyPublications: {} // TODO: Implement monthly stats
            }
          });
        }
        break;
      }

      case 'categories': {
        if (method === 'GET') {
          // Get all unique categories
          const results = await db
            .selectDistinct({ category: blogPosts.category })
            .from(blogPosts)
            .where(sql`${blogPosts.category} IS NOT NULL`);
          
          await pool.end();

          const categories = results.map(r => r.category).filter(Boolean);
          
          return res.status(200).json({
            success: true,
            data: categories
          });
        }
        break;
      }

      case 'revisions': {
        // TODO: Implement revisions if needed
        await pool.end();
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      case 'enhanced': {
        // For now, just redirect to regular posts
        query.action = 'posts';
        return handler(req, res);
      }

      default:
        await pool.end();
        return res.status(400).json({ error: `Invalid action: ${action}` });
    }

    await pool.end();
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch blog posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}