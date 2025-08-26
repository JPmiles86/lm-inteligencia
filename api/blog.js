// Consolidated Public Blog API
// Combines public blog endpoints into one serverless function

export default async function handler(req, res) {
  const { method, query } = req;
  const { slug } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // For now, directly implement the blog posts logic here
    if (method === 'GET') {
      const { Pool } = await import('pg');
      const { drizzle } = await import('drizzle-orm/node-postgres');
      const { blogPosts } = await import('../src/db/schema.js');
      const { eq, and, desc } = await import('drizzle-orm');

      // Create database connection
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      const db = drizzle(pool);

      if (slug) {
        // Get single post by slug
        const [post] = await db
          .select()
          .from(blogPosts)
          .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
          .limit(1);

        await pool.end();

        if (!post) {
          return res.status(404).json({ 
            success: false, 
            error: 'Blog post not found' 
          });
        }

        return res.status(200).json({ 
          success: true, 
          data: post 
        });
      } else {
        // Get all published posts
        const {
          published = 'true',
          category,
          limit = '10',
          page = '1',
          featured,
          sortBy = 'publishedAt',
          sortOrder = 'desc'
        } = query;

        // Build query conditions
        const conditions = [];
        if (published === 'true') {
          conditions.push(eq(blogPosts.published, true));
        }
        if (category) {
          conditions.push(eq(blogPosts.category, category));
        }
        if (featured === 'true') {
          conditions.push(eq(blogPosts.featured, true));
        }

        // Execute query
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        
        let queryBuilder = db.select().from(blogPosts);
        if (whereClause) {
          queryBuilder = queryBuilder.where(whereClause);
        }

        // Add sorting
        if (sortOrder === 'desc') {
          queryBuilder = queryBuilder.orderBy(desc(blogPosts[sortBy] || blogPosts.publishedAt));
        }

        // Add pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        queryBuilder = queryBuilder.limit(limitNum).offset(offset);
        
        const posts = await queryBuilder;

        // Get total count for pagination
        let countQuery = db.select({ count: blogPosts.id }).from(blogPosts);
        if (whereClause) {
          countQuery = countQuery.where(whereClause);
        }
        const countResult = await countQuery;
        const totalItems = countResult.length;

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
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}