import { Router, Request, Response } from 'express';
import { eq, desc, asc, sql, and, or } from 'drizzle-orm';
import { db } from '../../api/index.js';
import { blogPosts, blogRevisions } from '../../src/db/schema.js';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error.middleware.js';

const router = Router();

// Middleware to check database connection
const checkDatabase = (req: Request, res: Response, next: Function) => {
  console.log('[Blog API] Database check:', {
    hasDb: !!db,
    dbType: typeof db,
    path: req.path,
    method: req.method
  });

  if (!db) {
    console.error('[Blog API] Database connection not available');
    return res.status(503).json({
      error: 'Database connection unavailable',
      message: 'The database service is currently unavailable. Please try again later.',
      details: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
  next();
};

// Apply database check to all routes
router.use(checkDatabase);

// Get all blog posts with filtering and pagination
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    category,
    tag,
    published,
    featured,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string))); // Max 100 items per page
  const offset = (pageNum - 1) * limitNum;

  try {
    console.log('[Blog API] Request received:', {
      query: req.query,
      path: req.path,
      method: req.method
    });

    // Build where conditions
    const conditions = [];

    if (published !== undefined) {
      conditions.push(eq(blogPosts.published, published === 'true'));
    }

    if (featured !== undefined) {
      conditions.push(eq(blogPosts.featured, featured === 'true'));
    }

    if (category) {
      conditions.push(eq(blogPosts.category, category as string));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          sql`${blogPosts.title} ILIKE ${searchTerm}`,
          sql`${blogPosts.content} ILIKE ${searchTerm}`,
          sql`${blogPosts.excerpt} ILIKE ${searchTerm}`
        )
      );
    }

    // Build order by
    const orderBy = sortOrder === 'asc' ? asc : desc;
    let sortColumn: any = blogPosts.createdAt; // default

    switch (sortBy) {
      case 'title':
        sortColumn = blogPosts.title;
        break;
      case 'publishedDate':
      case 'publishedAt': // Support both variations
        sortColumn = blogPosts.publishedDate;
        break;
      case 'updatedAt':
        sortColumn = blogPosts.updatedAt;
        break;
      case 'createdAt':
      default:
        sortColumn = blogPosts.createdAt;
        break;
    }

    // Get posts with count
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    console.log('[Blog API] Executing query with:', {
      sortBy,
      sortOrder,
      limit: limitNum,
      offset,
      conditionsCount: conditions.length
    });

    const [posts, countResult] = await Promise.all([
      db.select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(orderBy(sortColumn))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(whereClause)
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limitNum);

    // If tag filter is specified, filter posts by tags (JSON field)
    let filteredPosts = posts;
    if (tag) {
      filteredPosts = posts.filter((post: any) => {
        const tags = Array.isArray(post.tags) ? post.tags : [];
        return tags.includes(tag as string);
      });
    }

    res.json({
      posts: filteredPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        category,
        tag,
        published,
        featured,
        search,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('[Blog API] Error fetching posts:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query
    });
    throw new Error(`Failed to fetch blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get single blog post by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { includeRevisions = false } = req.query;

  if (!id || isNaN(parseInt(id))) {
    throw new ValidationError('Valid post ID is required');
  }

  try {
    const postQuery = db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .limit(1);

    const post = await postQuery;

    if (post.length === 0) {
      throw new NotFoundError(`Blog post with ID ${id} not found`);
    }

    let result: any = post[0];

    if (includeRevisions === 'true') {
      const revisions = await db.select()
        .from(blogRevisions)
        .where(eq(blogRevisions.postId, parseInt(id)))
        .orderBy(desc(blogRevisions.createdAt));

      result.revisions = revisions;
    }

    res.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get blog post by slug
router.get('/slug/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new ValidationError('Slug is required');
  }

  try {
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      throw new NotFoundError(`Blog post with slug '${slug}' not found`);
    }

    res.json(post[0]);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get blog categories
router.get('/meta/categories', asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await db.select({ 
      category: blogPosts.category,
      count: sql<number>`count(*)`
    })
      .from(blogPosts)
      .groupBy(blogPosts.category)
      .orderBy(desc(sql`count(*)`));

    res.json(categories);
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get all tags
router.get('/meta/tags', asyncHandler(async (req: Request, res: Response) => {
  try {
    const posts = await db.select({ tags: blogPosts.tags }).from(blogPosts);
    
    // Extract and count all tags
    const tagCounts: Record<string, number> = {};
    
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag: any) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by usage
    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.json(tags);
  } catch (error) {
    throw new Error(`Failed to fetch tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get blog statistics
router.get('/meta/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      featuredPosts,
      categories,
      recentPosts
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(blogPosts),
      db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.published, true)),
      db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.published, false)),
      db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.featured, true)),
      db.select({ 
        category: blogPosts.category,
        count: sql<number>`count(*)`
      }).from(blogPosts).groupBy(blogPosts.category),
      db.select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt))
        .limit(5)
    ]);

    res.json({
      totals: {
        total: totalPosts[0]?.count || 0,
        published: publishedPosts[0]?.count || 0,
        draft: draftPosts[0]?.count || 0,
        featured: featuredPosts[0]?.count || 0
      },
      categories: categories.map((cat: any) => ({
        name: cat.category,
        count: cat.count
      })),
      recent: recentPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        published: post.published,
        createdAt: post.createdAt
      }))
    });
  } catch (error) {
    throw new Error(`Failed to fetch blog statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Search blog posts
router.get('/search/:query', asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;
  const { limit = 10, category, published } = req.query;

  if (!query || query.length < 2) {
    throw new ValidationError('Search query must be at least 2 characters');
  }

  try {
    const searchTerm = `%${query}%`;
    const limitNum = Math.min(50, parseInt(limit as string) || 10);

    // Build conditions
    const conditions = [
      or(
        sql`${blogPosts.title} ILIKE ${searchTerm}`,
        sql`${blogPosts.content} ILIKE ${searchTerm}`,
        sql`${blogPosts.excerpt} ILIKE ${searchTerm}`,
        sql`${blogPosts.category} ILIKE ${searchTerm}`
      )
    ];

    if (category) {
      conditions.push(eq(blogPosts.category, category as string));
    }

    if (published !== undefined) {
      conditions.push(eq(blogPosts.published, published === 'true'));
    }

    const results = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      category: blogPosts.category,
      tags: blogPosts.tags,
      published: blogPosts.published,
      publishedDate: blogPosts.publishedDate,
      featuredImage: blogPosts.featuredImage,
      authorName: blogPosts.authorName,
      readTime: blogPosts.readTime,
      createdAt: blogPosts.createdAt
    })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limitNum);

    res.json({
      query,
      results,
      count: results.length,
      hasMore: results.length === limitNum
    });
  } catch (error) {
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get related posts
router.get('/:id/related', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  if (!id || isNaN(parseInt(id))) {
    throw new ValidationError('Valid post ID is required');
  }

  try {
    // Get the current post to find related posts
    const currentPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .limit(1);

    if (currentPost.length === 0) {
      throw new NotFoundError(`Blog post with ID ${id} not found`);
    }

    const post = currentPost[0];
    const limitNum = Math.min(10, parseInt(limit as string) || 5);

    // Find related posts by category and tags
    const conditions = [
      sql`${blogPosts.id} != ${parseInt(id)}`, // Exclude current post
      eq(blogPosts.published, true) // Only published posts
    ];

    // Prefer posts in same category
    if (post.category) {
      conditions.push(eq(blogPosts.category, post.category));
    }

    let relatedPosts = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      category: blogPosts.category,
      tags: blogPosts.tags,
      featuredImage: blogPosts.featuredImage,
      authorName: blogPosts.authorName,
      publishedDate: blogPosts.publishedDate,
      readTime: blogPosts.readTime
    })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedDate))
      .limit(limitNum);

    // If not enough posts, get more from other categories
    if (relatedPosts.length < limitNum) {
      const additionalPosts = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        category: blogPosts.category,
        tags: blogPosts.tags,
        featuredImage: blogPosts.featuredImage,
        authorName: blogPosts.authorName,
        publishedDate: blogPosts.publishedDate,
        readTime: blogPosts.readTime
      })
        .from(blogPosts)
        .where(and(
          sql`${blogPosts.id} != ${parseInt(id)}`,
          eq(blogPosts.published, true)
        ))
        .orderBy(desc(blogPosts.publishedDate))
        .limit(limitNum);

      // Merge and deduplicate
      const existingIds = new Set(relatedPosts.map((p: any) => p.id));
      const newPosts = additionalPosts.filter((p: any) => !existingIds.has(p.id));
      relatedPosts = [...relatedPosts, ...newPosts].slice(0, limitNum);
    }

    res.json({
      postId: parseInt(id),
      related: relatedPosts,
      count: relatedPosts.length
    });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to fetch related posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

export default router;