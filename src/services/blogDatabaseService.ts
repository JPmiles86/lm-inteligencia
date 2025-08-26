// Blog Database Service - Handles all database operations for blog posts
// Replaces localStorage-based blog service with PostgreSQL database operations

import { db } from '../db/index.js';
import { blogPosts, BlogPost, NewBlogPost } from '../db/schema.js';
import { eq, desc, asc, like, and, or, sql, count } from 'drizzle-orm';

export interface BlogPostFilters {
  category?: string;
  featured?: boolean;
  published?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface BlogPostsResult {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogPostCreateData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  featured?: boolean;
  published?: boolean;
  publishedDate?: string;
  authorName: string;
  authorTitle?: string;
  authorImage?: string;
  readTime?: number;
  editorType?: 'rich' | 'block';
  // New scheduling and SEO fields
  status?: 'draft' | 'scheduled' | 'published';
  scheduledPublishDate?: Date;
  timezone?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
}

export interface BlogPostUpdateData extends Partial<BlogPostCreateData> {
  id: number;
}

class BlogDatabaseService {
  /**
   * Get all published blog posts with filtering, searching, and pagination
   */
  async getAllPublishedPosts(
    filters: BlogPostFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<BlogPostsResult> {
    try {
      const conditions = [];
      
      // Always filter for published posts only
      conditions.push(eq(blogPosts.published, true));
      
      // Apply filters
      if (filters.category && filters.category !== 'All') {
        conditions.push(eq(blogPosts.category, filters.category));
      }
      
      if (filters.featured !== undefined) {
        conditions.push(eq(blogPosts.featured, filters.featured));
      }
      
      if (filters.search) {
        const searchTerm = `%${filters.search.toLowerCase()}%`;
        conditions.push(
          or(
            like(sql`LOWER(${blogPosts.title})`, searchTerm),
            like(sql`LOWER(${blogPosts.excerpt})`, searchTerm),
            like(sql`LOWER(${blogPosts.content})`, searchTerm),
            like(sql`LOWER(${blogPosts.authorName})`, searchTerm)
          )
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        // Use JSON operations to check if any of the filter tags exist in the post tags
        const tagConditions = filters.tags.map(tag => 
          sql`${blogPosts.tags} @> ${JSON.stringify([tag])}`
        );
        conditions.push(or(...tagConditions));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(blogPosts)
        .where(whereClause);
      
      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / pagination.limit);
      const offset = (pagination.page - 1) * pagination.limit;
      
      // Get posts with pagination
      const posts = await db
        .select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(desc(blogPosts.publishedDate), desc(blogPosts.createdAt))
        .limit(pagination.limit)
        .offset(offset);
      
      return {
        posts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching published posts:', error);
      throw new Error('Failed to fetch published blog posts');
    }
  }

  /**
   * Get all blog posts (including drafts) for admin use
   */
  async getAllPosts(
    filters: BlogPostFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<BlogPostsResult> {
    try {
      const conditions = [];
      
      // Apply filters (don't filter by published status for admin)
      if (filters.category && filters.category !== 'All') {
        conditions.push(eq(blogPosts.category, filters.category));
      }
      
      if (filters.featured !== undefined) {
        conditions.push(eq(blogPosts.featured, filters.featured));
      }
      
      if (filters.published !== undefined) {
        conditions.push(eq(blogPosts.published, filters.published));
      }
      
      if (filters.search) {
        const searchTerm = `%${filters.search.toLowerCase()}%`;
        conditions.push(
          or(
            like(sql`LOWER(${blogPosts.title})`, searchTerm),
            like(sql`LOWER(${blogPosts.excerpt})`, searchTerm),
            like(sql`LOWER(${blogPosts.content})`, searchTerm),
            like(sql`LOWER(${blogPosts.authorName})`, searchTerm)
          )
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const tagConditions = filters.tags.map(tag => 
          sql`${blogPosts.tags} @> ${JSON.stringify([tag])}`
        );
        conditions.push(or(...tagConditions));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(blogPosts)
        .where(whereClause);
      
      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / pagination.limit);
      const offset = (pagination.page - 1) * pagination.limit;
      
      // Get posts with pagination
      const posts = await db
        .select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(desc(blogPosts.updatedAt), desc(blogPosts.createdAt))
        .limit(pagination.limit)
        .offset(offset);
      
      return {
        posts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching all posts:', error);
      throw new Error('Failed to fetch blog posts');
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getPostById(id: number): Promise<BlogPost | null> {
    try {
      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      throw new Error('Failed to fetch blog post');
    }
  }

  /**
   * Get a single published blog post by slug
   */
  async getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const result = await db
        .select()
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.slug, slug),
            eq(blogPosts.published, true)
          )
        )
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      throw new Error('Failed to fetch blog post');
    }
  }

  /**
   * Get a single blog post by slug (admin - includes drafts)
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      throw new Error('Failed to fetch blog post');
    }
  }

  /**
   * Create a new blog post
   */
  async createPost(data: BlogPostCreateData): Promise<BlogPost> {
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = this.generateSlug(data.title);
      }

      // Calculate read time if not provided
      if (!data.readTime) {
        data.readTime = this.calculateReadTime(data.content);
      }

      // Set published date if publishing
      if (data.published && !data.publishedDate) {
        data.publishedDate = new Date().toISOString().split('T')[0];
      }

      const newPost: NewBlogPost = {
        title: data.title,
        slug: await this.ensureUniqueSlug(data.slug || this.generateSlug(data.title)),
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage || null,
        category: data.category,
        tags: data.tags || [],
        featured: data.featured || false,
        published: data.published || false,
        publishedDate: data.publishedDate || null,
        authorName: data.authorName,
        authorTitle: data.authorTitle || null,
        authorImage: data.authorImage || null,
        readTime: data.readTime
      };

      const result = await db
        .insert(blogPosts)
        .values(newPost)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create blog post');
    }
  }

  /**
   * Update an existing blog post
   */
  async updatePost(id: number, data: Partial<BlogPostCreateData>): Promise<BlogPost | null> {
    try {
      // Generate slug if title changed
      if (data.title && data.slug) {
        data.slug = await this.ensureUniqueSlug(data.slug, id);
      }

      // Calculate read time if content changed
      if (data.content && !data.readTime) {
        data.readTime = this.calculateReadTime(data.content);
      }

      // Set published date if publishing for the first time
      if (data.published === true) {
        const existingPost = await this.getPostById(id);
        if (existingPost && !existingPost.published && !data.publishedDate) {
          data.publishedDate = new Date().toISOString().split('T')[0];
        }
      }

      // Remove undefined values
      const updateData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key as keyof BlogPostCreateData] = value;
        }
        return acc;
      }, {} as any);

      // Add updated timestamp
      updateData.updatedAt = new Date();

      const result = await db
        .update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update blog post');
    }
  }

  /**
   * Delete a blog post
   */
  async deletePost(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(blogPosts)
        .where(eq(blogPosts.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete blog post');
    }
  }

  /**
   * Toggle published status of a blog post
   */
  async togglePublished(id: number): Promise<BlogPost | null> {
    try {
      const existingPost = await this.getPostById(id);
      if (!existingPost) {
        return null;
      }

      const newPublishedStatus = !existingPost.published;
      const updateData: any = {
        published: newPublishedStatus,
        updatedAt: new Date()
      };

      // Set published date if publishing for the first time
      if (newPublishedStatus && !existingPost.publishedDate) {
        updateData.publishedDate = new Date().toISOString().split('T')[0];
      }

      const result = await db
        .update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error toggling published status:', error);
      throw new Error('Failed to update post status');
    }
  }

  /**
   * Toggle featured status of a blog post
   */
  async toggleFeatured(id: number): Promise<BlogPost | null> {
    try {
      const existingPost = await this.getPostById(id);
      if (!existingPost) {
        return null;
      }

      const result = await db
        .update(blogPosts)
        .set({
          featured: !existingPost.featured,
          updatedAt: new Date()
        })
        .where(eq(blogPosts.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw new Error('Failed to update featured status');
    }
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const result = await db
        .selectDistinct({ category: blogPosts.category })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(asc(blogPosts.category));

      return result.map(row => row.category);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    try {
      const result = await db
        .select({ tags: blogPosts.tags })
        .from(blogPosts)
        .where(eq(blogPosts.published, true));

      const allTags = new Set<string>();
      result.forEach(row => {
        if (Array.isArray(row.tags)) {
          row.tags.forEach(tag => allTags.add(tag));
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }

  /**
   * Get blog statistics
   */
  async getStats() {
    try {
      const [
        totalResult,
        publishedResult,
        draftResult,
        featuredResult,
        scheduledResult
      ] = await Promise.all([
        db.select({ count: count() }).from(blogPosts),
        db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.published, true)),
        db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.published, false)),
        db.select({ count: count() }).from(blogPosts).where(
          and(eq(blogPosts.published, true), eq(blogPosts.featured, true))
        ),
        db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'scheduled'))
      ]);

      // Get category counts for published posts
      const categoryResults = await db
        .select({ 
          category: blogPosts.category, 
          count: count() 
        })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .groupBy(blogPosts.category);

      const categoryCounts = categoryResults.reduce((acc, row) => {
        acc[row.category] = row.count;
        return acc;
      }, {} as Record<string, number>);

      // Get tag counts for published posts
      const publishedPosts = await db
        .select({ tags: blogPosts.tags })
        .from(blogPosts)
        .where(eq(blogPosts.published, true));

      const tagCounts: Record<string, number> = {};
      publishedPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (typeof tag === 'string') {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        }
      });

      // Get monthly publication counts
      const monthlyResults = await db
        .select({ 
          publishedDate: blogPosts.publishedDate,
          count: count() 
        })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .groupBy(blogPosts.publishedDate);

      const monthlyPublications: Record<string, number> = {};
      monthlyResults.forEach(row => {
        if (row.publishedDate) {
          // Extract year-month from published date
          const date = new Date(row.publishedDate);
          if (!isNaN(date.getTime())) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyPublications[yearMonth] = (monthlyPublications[yearMonth] || 0) + row.count;
          }
        }
      });

      return {
        totalPosts: totalResult[0]?.count || 0,
        publishedPosts: publishedResult[0]?.count || 0,
        draftPosts: draftResult[0]?.count || 0,
        scheduledPosts: scheduledResult[0]?.count || 0,
        featuredPosts: featuredResult[0]?.count || 0,
        categoryCounts,
        tagCounts,
        monthlyPublications
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Failed to fetch blog statistics');
    }
  }

  /**
   * Generate a URL-friendly slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Ensure slug is unique by checking database and appending number if needed
   */
  private async ensureUniqueSlug(slug: string, excludeId?: number): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const conditions = [eq(blogPosts.slug, uniqueSlug)];
      if (excludeId) {
        conditions.push(sql`${blogPosts.id} != ${excludeId}`);
      }

      const existingPost = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(...conditions))
        .limit(1);

      if (existingPost.length === 0) {
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  /**
   * Calculate estimated read time based on content
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
}

// Export singleton instance
export const blogDatabaseService = new BlogDatabaseService();
export default blogDatabaseService;