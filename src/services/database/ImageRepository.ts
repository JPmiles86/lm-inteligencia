import { db } from '@/db';
import { generatedImages, blogPosts } from '@/db/schema';
import { eq, and, desc, gte, isNull, sql } from 'drizzle-orm';

export class ImageRepository {
  /**
   * Get all images for a blog post
   */
  async getImagesForBlogPost(blogPostId: number) {
    return db.select()
      .from(generatedImages)
      .where(eq(generatedImages.blogPostId, blogPostId))
      .orderBy(generatedImages.positionInContent);
  }
  
  /**
   * Get image by prompt ID
   */
  async getImageByPromptId(promptId: string) {
    const results = await db.select()
      .from(generatedImages)
      .where(eq(generatedImages.promptId, promptId))
      .limit(1);
    
    return results[0];
  }
  
  /**
   * Get images by multiple prompt IDs
   */
  async getImagesByPromptIds(promptIds: string[]) {
    if (promptIds.length === 0) return [];
    
    return db.select()
      .from(generatedImages)
      .where(sql`${generatedImages.promptId} = ANY(${promptIds})`);
  }
  
  /**
   * Update image metadata
   */
  async updateImage(
    promptId: string,
    updates: {
      altText?: string;
      caption?: string;
      qualityScore?: string;
      status?: string;
    }
  ) {
    return db.update(generatedImages)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(generatedImages.promptId, promptId));
  }
  
  /**
   * Delete image
   */
  async deleteImage(promptId: string) {
    // Get image first to delete file
    const image = await this.getImageByPromptId(promptId);
    
    if (image) {
      // Delete from storage
      if (image.storagePath) {
        const { imageStorageService } = await import('../storage/ImageStorageService');
        await imageStorageService.deleteImage(image.storagePath);
      }
      
      // Delete from database
      await db.delete(generatedImages)
        .where(eq(generatedImages.promptId, promptId));
    }
  }
  
  /**
   * Delete all images for a blog post
   */
  async deleteImagesForBlogPost(blogPostId: number) {
    const images = await this.getImagesForBlogPost(blogPostId);
    
    // Delete files from storage
    const { imageStorageService } = await import('../storage/ImageStorageService');
    for (const image of images) {
      if (image.storagePath) {
        await imageStorageService.deleteImage(image.storagePath);
      }
    }
    
    // Delete from database
    await db.delete(generatedImages)
      .where(eq(generatedImages.blogPostId, blogPostId));
  }
  
  /**
   * Get generation statistics
   */
  async getGenerationStats(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const stats = await db.select({
      provider: generatedImages.provider,
      count: sql<number>`COUNT(*)::int`,
      totalCost: sql<number>`COALESCE(SUM(${generatedImages.generationCost}), 0)::float`,
      avgTime: sql<number>`COALESCE(AVG(${generatedImages.generationTime}), 0)::int`,
      avgQuality: sql<number>`COALESCE(AVG(${generatedImages.qualityScore}), 0)::float`
    })
    .from(generatedImages)
    .where(gte(generatedImages.createdAt, cutoffDate))
    .groupBy(generatedImages.provider);
    
    return stats;
  }
  
  /**
   * Get recent images with pagination
   */
  async getRecentImages(limit: number = 50, offset: number = 0) {
    return db.select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  /**
   * Search images by prompt text
   */
  async searchImages(query: string, limit: number = 20) {
    return db.select()
      .from(generatedImages)
      .where(
        sql`${generatedImages.originalPrompt} ILIKE ${'%' + query + '%'} OR 
            ${generatedImages.altText} ILIKE ${'%' + query + '%'}`
      )
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }
  
  /**
   * Get images by provider
   */
  async getImagesByProvider(provider: string, limit: number = 50) {
    return db.select()
      .from(generatedImages)
      .where(eq(generatedImages.provider, provider))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }
  
  /**
   * Get images by status
   */
  async getImagesByStatus(status: string, limit: number = 50) {
    return db.select()
      .from(generatedImages)
      .where(eq(generatedImages.status, status))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }
  
  /**
   * Clean up orphaned images (images without blog posts)
   */
  async cleanupOrphanedImages() {
    // Find images without blog posts
    const orphaned = await db.select({
      generatedImages
    })
      .from(generatedImages)
      .leftJoin(blogPosts, eq(generatedImages.blogPostId, blogPosts.id))
      .where(isNull(blogPosts.id));
    
    const { imageStorageService } = await import('../storage/ImageStorageService');
    
    for (const item of orphaned) {
      const image = item.generatedImages;
      if (image.storagePath) {
        await imageStorageService.deleteImage(image.storagePath);
      }
      await this.deleteImage(image.promptId);
    }
    
    return orphaned.length;
  }
  
  /**
   * Get storage usage statistics
   */
  async getStorageStats() {
    const stats = await db.select({
      totalImages: sql<number>`COUNT(*)::int`,
      totalSize: sql<number>`COALESCE(SUM(${generatedImages.fileSize}), 0)::bigint`,
      avgSize: sql<number>`COALESCE(AVG(${generatedImages.fileSize}), 0)::int`,
      uniqueFormats: sql<number>`COUNT(DISTINCT ${generatedImages.format})::int`
    })
    .from(generatedImages);
    
    return stats[0];
  }
  
  /**
   * Get cost analysis
   */
  async getCostAnalysis(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const dailyCosts = await db.select({
      date: sql<string>`DATE(${generatedImages.createdAt})`,
      cost: sql<number>`COALESCE(SUM(${generatedImages.generationCost}), 0)::float`,
      count: sql<number>`COUNT(*)::int`
    })
    .from(generatedImages)
    .where(gte(generatedImages.createdAt, cutoffDate))
    .groupBy(sql`DATE(${generatedImages.createdAt})`)
    .orderBy(sql`DATE(${generatedImages.createdAt})`);
    
    return dailyCosts;
  }
  
  /**
   * Bulk update image statuses
   */
  async bulkUpdateStatus(promptIds: string[], status: string) {
    if (promptIds.length === 0) return;
    
    await db.update(generatedImages)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(sql`${generatedImages.promptId} = ANY(${promptIds})`);
  }
  
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const metrics = await db.select({
      avgGenerationTime: sql<number>`COALESCE(AVG(${generatedImages.generationTime}), 0)::int`,
      minGenerationTime: sql<number>`COALESCE(MIN(${generatedImages.generationTime}), 0)::int`,
      maxGenerationTime: sql<number>`COALESCE(MAX(${generatedImages.generationTime}), 0)::int`,
      successRate: sql<number>`
        (COUNT(CASE WHEN ${generatedImages.status} = 'generated' THEN 1 END)::float / 
         COUNT(*)::float * 100)::float
      `,
      totalImages: sql<number>`COUNT(*)::int`
    })
    .from(generatedImages)
    .where(gte(generatedImages.createdAt, cutoffDate));
    
    return metrics[0];
  }
}

export const imageRepository = new ImageRepository();