import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogPosts, blogRevisions } from '../../../src/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - Fetch revisions for a post
  if (req.method === 'GET') {
    try {
      const { postId, revisionId } = req.query;

      if (!postId) {
        return res.status(400).json({ success: false, error: 'Post ID is required' });
      }

      // Get specific revision
      if (revisionId) {
        const revision = await db.select()
          .from(blogRevisions)
          .where(
            and(
              eq(blogRevisions.postId, parseInt(postId)),
              eq(blogRevisions.id, parseInt(revisionId))
            )
          )
          .limit(1);

        if (!revision.length) {
          return res.status(404).json({ success: false, error: 'Revision not found' });
        }

        return res.status(200).json({
          success: true,
          data: revision[0]
        });
      }

      // Get all revisions for a post
      const revisions = await db.select()
        .from(blogRevisions)
        .where(eq(blogRevisions.postId, parseInt(postId)))
        .orderBy(desc(blogRevisions.createdAt));

      res.status(200).json({
        success: true,
        data: revisions
      });

    } catch (error) {
      console.error('Error fetching revisions:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch revisions' });
    }
  }
  // POST - Restore a revision
  else if (req.method === 'POST') {
    try {
      const { postId, revisionId } = req.body;

      if (!postId || !revisionId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Post ID and Revision ID are required' 
        });
      }

      // Get the revision
      const revision = await db.select()
        .from(blogRevisions)
        .where(
          and(
            eq(blogRevisions.postId, parseInt(postId)),
            eq(blogRevisions.id, parseInt(revisionId))
          )
        )
        .limit(1);

      if (!revision.length) {
        return res.status(404).json({ success: false, error: 'Revision not found' });
      }

      const revisionData = revision[0];

      // Update the post with revision content
      const updatedPosts = await db.update(blogPosts)
        .set({
          title: revisionData.title,
          content: revisionData.content,
          excerpt: revisionData.excerpt,
          metaTitle: revisionData.metaData?.seo?.metaTitle,
          metaDescription: revisionData.metaData?.seo?.metaDescription,
          keywords: revisionData.metaData?.seo?.keywords || [],
          scheduledPublishDate: revisionData.metaData?.scheduling?.scheduledPublishDate 
            ? new Date(revisionData.metaData.scheduling.scheduledPublishDate) 
            : undefined,
          timezone: revisionData.metaData?.scheduling?.timezone,
          updatedAt: new Date()
        })
        .where(eq(blogPosts.id, parseInt(postId)))
        .returning();

      if (!updatedPosts.length) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Create a new revision for the restore action
      const latestRevision = await db.select({ revisionNumber: blogRevisions.revisionNumber })
        .from(blogRevisions)
        .where(eq(blogRevisions.postId, parseInt(postId)))
        .orderBy(desc(blogRevisions.revisionNumber))
        .limit(1);
      
      const nextRevisionNumber = latestRevision.length > 0 
        ? latestRevision[0].revisionNumber + 1 
        : 1;

      await db.insert(blogRevisions).values({
        postId: parseInt(postId),
        revisionNumber: nextRevisionNumber,
        title: revisionData.title,
        content: revisionData.content,
        excerpt: revisionData.excerpt,
        metaData: revisionData.metaData,
        changeType: 'manual',
        changeSummary: `Restored from revision #${revisionData.revisionNumber}`,
        authorName: 'System',
        createdAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Revision restored successfully',
        data: updatedPosts[0]
      });

    } catch (error) {
      console.error('Error restoring revision:', error);
      res.status(500).json({ success: false, error: 'Failed to restore revision' });
    }
  }
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}