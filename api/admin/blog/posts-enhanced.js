import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogPosts, blogRevisions } from '../../../src/db/schema.js';
import { eq, and, desc, asc, like, or, count, sql } from 'drizzle-orm';

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

// Helper function to save a revision
async function saveRevision(postId, data, changeType = 'manual') {
  try {
    // Get the latest revision number
    const latestRevision = await db.select({ revisionNumber: blogRevisions.revisionNumber })
      .from(blogRevisions)
      .where(eq(blogRevisions.postId, postId))
      .orderBy(desc(blogRevisions.revisionNumber))
      .limit(1);
    
    const nextRevisionNumber = latestRevision.length > 0 ? latestRevision[0].revisionNumber + 1 : 1;
    
    // Create revision
    await db.insert(blogRevisions).values({
      postId,
      revisionNumber: nextRevisionNumber,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      metaData: {
        seo: data.seo,
        scheduling: {
          scheduledPublishDate: data.scheduledPublishDate,
          timezone: data.timezone
        }
      },
      changeType,
      changeSummary: data.changeSummary || `${changeType} save`,
      authorName: data.authorName || 'System',
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error saving revision:', error);
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - Fetch posts with enhanced filtering
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '10',
        category,
        status,
        published,
        search,
        sortBy = 'publishedDate',
        sortOrder = 'desc',
        includeScheduled = 'false'
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Build where conditions
      const conditions = [];
      
      if (category) {
        conditions.push(eq(blogPosts.category, category));
      }
      
      if (status) {
        conditions.push(eq(blogPosts.status, status));
      } else if (published !== undefined) {
        conditions.push(eq(blogPosts.published, published === 'true'));
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

      // Include scheduled posts that should be published
      if (includeScheduled === 'true') {
        conditions.push(
          or(
            eq(blogPosts.status, 'published'),
            and(
              eq(blogPosts.status, 'scheduled'),
              sql`${blogPosts.scheduledPublishDate} <= NOW()`
            )
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get posts with pagination
      const rawPosts = await db.select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(sortOrder === 'desc' ? desc(blogPosts[sortBy]) : asc(blogPosts[sortBy]))
        .limit(limitNum)
        .offset((pageNum - 1) * limitNum);

      // Get revision counts for each post
      const postIds = rawPosts.map(p => p.id);
      const revisionCounts = await db.select({
        postId: blogRevisions.postId,
        count: count()
      })
        .from(blogRevisions)
        .where(sql`${blogRevisions.postId} = ANY(${postIds})`)
        .groupBy(blogRevisions.postId);

      const revisionCountMap = Object.fromEntries(
        revisionCounts.map(r => [r.postId, r.count])
      );

      // Transform posts to include enhanced fields
      const posts = rawPosts.map(post => ({
        ...post,
        author: {
          name: post.authorName || 'Laurie Meiring',
          title: post.authorTitle || 'Founder & Marketing Strategist',
          image: post.authorImage || '/images/team/Laurie Meiring/laurie ai face 1x1.jpg'
        },
        tags: Array.isArray(post.tags) ? post.tags : [],
        seo: {
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          keywords: post.keywords || [],
          ogImage: post.ogImage,
          canonicalUrl: post.canonicalUrl
        },
        scheduling: {
          scheduledPublishDate: post.scheduledPublishDate,
          timezone: post.timezone,
          status: post.status
        },
        revisionCount: revisionCountMap[post.id] || 0,
        hasDraft: !!post.draftContent
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
  // POST - Create new post with enhanced fields
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
        status,
        scheduledPublishDate,
        timezone,
        seo,
        author,
        readTime,
        saveAsRevision = true
      } = req.body;

      // Determine status based on scheduling
      let postStatus = status || 'draft';
      if (scheduledPublishDate && new Date(scheduledPublishDate) > new Date()) {
        postStatus = 'scheduled';
      } else if (published) {
        postStatus = 'published';
      }

      // Create the new post with enhanced fields
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
          published: published !== undefined ? published : false,
          publishedDate: publishedAt || (published ? new Date().toISOString() : null),
          status: postStatus,
          scheduledPublishDate: scheduledPublishDate ? new Date(scheduledPublishDate) : null,
          timezone: timezone || 'America/New_York',
          // SEO fields
          metaTitle: seo?.metaTitle,
          metaDescription: seo?.metaDescription,
          keywords: seo?.keywords || [],
          ogImage: seo?.ogImage,
          canonicalUrl: seo?.canonicalUrl,
          // Author fields
          authorName: author?.name || 'Laurie Meiring',
          authorTitle: author?.title || 'Founder & Marketing Strategist',
          authorImage: author?.image || '/images/team/Laurie Meiring/laurie ai face 1x1.jpg',
          readTime: readTime || 5,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      const newPost = newPosts[0];
      
      // Save initial revision if requested
      if (saveAsRevision) {
        await saveRevision(newPost.id, {
          title,
          content,
          excerpt,
          seo,
          scheduledPublishDate,
          timezone,
          authorName: author?.name
        }, 'manual');
      }
      
      // Transform post to match expected frontend format
      const transformedPost = {
        ...newPost,
        author: {
          name: newPost.authorName,
          title: newPost.authorTitle,
          image: newPost.authorImage
        },
        seo: {
          metaTitle: newPost.metaTitle,
          metaDescription: newPost.metaDescription,
          keywords: newPost.keywords || [],
          ogImage: newPost.ogImage,
          canonicalUrl: newPost.canonicalUrl
        },
        scheduling: {
          scheduledPublishDate: newPost.scheduledPublishDate,
          timezone: newPost.timezone,
          status: newPost.status
        },
        tags: Array.isArray(newPost.tags) ? newPost.tags : []
      };

      res.status(201).json({
        success: true,
        data: transformedPost
      });

    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ success: false, error: 'Failed to create blog post' });
    }
  }
  // PUT - Update post with enhanced fields
  else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
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
        status,
        scheduledPublishDate,
        timezone,
        seo,
        author,
        readTime,
        draftContent,
        autosave = false,
        saveAsRevision = true
      } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Post ID is required' });
      }

      // Get current post for revision
      const currentPost = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(id))).limit(1);
      if (!currentPost.length) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Determine status based on scheduling
      let postStatus = status || currentPost[0].status;
      if (scheduledPublishDate && new Date(scheduledPublishDate) > new Date()) {
        postStatus = 'scheduled';
      } else if (published) {
        postStatus = 'published';
      }

      // Prepare update values
      const updateValues = {
        updatedAt: new Date()
      };

      // Handle autosave
      if (autosave) {
        updateValues.draftContent = content;
        updateValues.lastAutosave = new Date();
        updateValues.autosaveVersion = sql`${blogPosts.autosaveVersion} + 1`;
      } else {
        // Regular save - update all fields
        Object.assign(updateValues, {
          title,
          slug,
          excerpt,
          content,
          featuredImage,
          category,
          tags: tags || [],
          featured: featured !== undefined ? featured : currentPost[0].featured,
          published: published !== undefined ? published : currentPost[0].published,
          publishedDate: publishedAt || currentPost[0].publishedDate,
          status: postStatus,
          scheduledPublishDate: scheduledPublishDate ? new Date(scheduledPublishDate) : currentPost[0].scheduledPublishDate,
          timezone: timezone || currentPost[0].timezone,
          // SEO fields
          metaTitle: seo?.metaTitle,
          metaDescription: seo?.metaDescription,
          keywords: seo?.keywords || [],
          ogImage: seo?.ogImage,
          canonicalUrl: seo?.canonicalUrl,
          // Author fields
          authorName: author?.name || currentPost[0].authorName,
          authorTitle: author?.title || currentPost[0].authorTitle,
          authorImage: author?.image || currentPost[0].authorImage,
          readTime: readTime || currentPost[0].readTime,
          // Clear draft on full save
          draftContent: null
        });

        // Save revision if requested and not autosave
        if (saveAsRevision) {
          await saveRevision(parseInt(id), {
            title: title || currentPost[0].title,
            content: content || currentPost[0].content,
            excerpt: excerpt || currentPost[0].excerpt,
            seo,
            scheduledPublishDate,
            timezone,
            authorName: author?.name || currentPost[0].authorName,
            changeSummary: published ? 'Published post' : 'Updated post'
          }, published ? 'publish' : 'manual');
        }
      }

      // Update the post
      const updatedPosts = await db.update(blogPosts)
        .set(updateValues)
        .where(eq(blogPosts.id, parseInt(id)))
        .returning();

      const updatedPost = updatedPosts[0];

      // Transform post to match expected frontend format
      const transformedPost = {
        ...updatedPost,
        author: {
          name: updatedPost.authorName,
          title: updatedPost.authorTitle,
          image: updatedPost.authorImage
        },
        seo: {
          metaTitle: updatedPost.metaTitle,
          metaDescription: updatedPost.metaDescription,
          keywords: updatedPost.keywords || [],
          ogImage: updatedPost.ogImage,
          canonicalUrl: updatedPost.canonicalUrl
        },
        scheduling: {
          scheduledPublishDate: updatedPost.scheduledPublishDate,
          timezone: updatedPost.timezone,
          status: updatedPost.status
        },
        tags: Array.isArray(updatedPost.tags) ? updatedPost.tags : []
      };

      res.status(200).json({
        success: true,
        data: transformedPost
      });

    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ success: false, error: 'Failed to update blog post' });
    }
  }
  // DELETE - Delete post
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Post ID is required' });
      }

      // Delete post (revisions will be cascade deleted)
      await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ success: false, error: 'Failed to delete blog post' });
    }
  }
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}