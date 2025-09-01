import { Request, Response } from 'express';
import { imageGenerationPipeline } from '../../src/services/ai/ImageGenerationPipeline';
import { imageRepository } from '../../src/services/database/ImageRepository';
import { ImagePrompt } from '../../src/services/ai/ImagePromptExtractor';

export class ImagePipelineAPIHandler {
  /**
   * Generate batch images from prompts
   */
  async generateBatchImages(req: Request, res: Response) {
    const { prompts, blogPostId, config } = req.body;
    
    try {
      // Validate input
      if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid prompts array'
        });
      }
      
      // Validate prompt structure
      const validPrompts = prompts.every((p: any) => 
        p.id && p.originalPrompt && typeof p.position === 'number'
      );
      
      if (!validPrompts) {
        return res.status(400).json({
          success: false,
          error: 'Invalid prompt structure. Each prompt must have id, originalPrompt, and position'
        });
      }
      
      const pipeline = imageGenerationPipeline;
      
      // Process prompts with progress tracking
      const results = await pipeline.processPrompts(
        prompts as ImagePrompt[],
        blogPostId,
        (completed, total) => {
          // Could send SSE updates here in the future
          console.log(`Image generation progress: ${completed}/${total}`);
        }
      );
      
      // Retry failed if configured
      const finalResults = config?.retryFailed
        ? await pipeline.retryFailed(results, blogPostId)
        : results;
      
      // Calculate summary statistics
      const successful = finalResults.filter(r => r.success);
      const failed = finalResults.filter(r => !r.success);
      const totalCost = finalResults.reduce((sum, r) => sum + (r.cost || 0), 0);
      const avgTime = finalResults.length > 0 
        ? finalResults.reduce((sum, r) => sum + (r.generationTime || 0), 0) / finalResults.length
        : 0;
      
      res.json({
        success: true,
        results: finalResults,
        summary: {
          total: finalResults.length,
          successful: successful.length,
          failed: failed.length,
          totalCost,
          averageTime: avgTime,
          successRate: (successful.length / finalResults.length) * 100
        }
      });
    } catch (error) {
      console.error('Batch image generation failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Get images for a specific blog post
   */
  async getImagesForBlog(req: Request, res: Response) {
    const { blogPostId } = req.params;
    
    try {
      if (!blogPostId || isNaN(parseInt(blogPostId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid blog post ID'
        });
      }
      
      const images = await imageRepository.getImagesForBlogPost(
        parseInt(blogPostId)
      );
      
      res.json({
        success: true,
        images,
        count: images.length
      });
    } catch (error) {
      console.error('Failed to get images:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Get image by prompt ID
   */
  async getImageByPromptId(req: Request, res: Response) {
    const { promptId } = req.params;
    
    try {
      if (!promptId) {
        return res.status(400).json({
          success: false,
          error: 'Prompt ID is required'
        });
      }
      
      const image = await imageRepository.getImageByPromptId(promptId);
      
      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      res.json({
        success: true,
        image
      });
    } catch (error) {
      console.error('Failed to get image:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Update image metadata
   */
  async updateImageMetadata(req: Request, res: Response) {
    const { promptId } = req.params;
    const updates = req.body;
    
    try {
      if (!promptId) {
        return res.status(400).json({
          success: false,
          error: 'Prompt ID is required'
        });
      }
      
      // Validate allowed updates
      const allowedFields = ['altText', 'caption', 'qualityScore', 'status'];
      const updateData: any = {};
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          updateData[key] = value;
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid update fields provided'
        });
      }
      
      await imageRepository.updateImage(promptId, updateData);
      
      res.json({
        success: true,
        message: 'Image updated successfully'
      });
    } catch (error) {
      console.error('Failed to update image:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Delete image
   */
  async deleteImage(req: Request, res: Response) {
    const { promptId } = req.params;
    
    try {
      if (!promptId) {
        return res.status(400).json({
          success: false,
          error: 'Prompt ID is required'
        });
      }
      
      await imageRepository.deleteImage(promptId);
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Get generation statistics
   */
  async getGenerationStats(req: Request, res: Response) {
    const { days = '30' } = req.query;
    
    try {
      const daysNumber = parseInt(days as string);
      if (isNaN(daysNumber) || daysNumber < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid days parameter'
        });
      }
      
      const stats = await imageRepository.getGenerationStats(daysNumber);
      const storageStats = await imageRepository.getStorageStats();
      const performanceMetrics = await imageRepository.getPerformanceMetrics(7);
      
      res.json({
        success: true,
        stats: {
          generation: stats,
          storage: storageStats,
          performance: performanceMetrics
        },
        period: `${daysNumber} days`
      });
    } catch (error) {
      console.error('Failed to get stats:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Get recent images with pagination
   */
  async getRecentImages(req: Request, res: Response) {
    const { limit = '50', offset = '0' } = req.query;
    
    try {
      const limitNumber = parseInt(limit as string);
      const offsetNumber = parseInt(offset as string);
      
      if (isNaN(limitNumber) || isNaN(offsetNumber) || limitNumber < 1 || offsetNumber < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters'
        });
      }
      
      const images = await imageRepository.getRecentImages(limitNumber, offsetNumber);
      
      res.json({
        success: true,
        images,
        pagination: {
          limit: limitNumber,
          offset: offsetNumber,
          count: images.length
        }
      });
    } catch (error) {
      console.error('Failed to get recent images:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Search images by prompt text
   */
  async searchImages(req: Request, res: Response) {
    const { q, limit = '20' } = req.query;
    
    try {
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter must be at least 2 characters long'
        });
      }
      
      const limitNumber = parseInt(limit as string);
      if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
      }
      
      const images = await imageRepository.searchImages(q.trim(), limitNumber);
      
      res.json({
        success: true,
        images,
        query: q.trim(),
        count: images.length
      });
    } catch (error) {
      console.error('Failed to search images:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Clean up orphaned images
   */
  async cleanupOrphaned(req: Request, res: Response) {
    try {
      const cleanedCount = await imageRepository.cleanupOrphanedImages();
      
      res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} orphaned images`,
        count: cleanedCount
      });
    } catch (error) {
      console.error('Failed to cleanup orphaned images:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  /**
   * Get cost analysis
   */
  async getCostAnalysis(req: Request, res: Response) {
    const { days = '30' } = req.query;
    
    try {
      const daysNumber = parseInt(days as string);
      if (isNaN(daysNumber) || daysNumber < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid days parameter'
        });
      }
      
      const costAnalysis = await imageRepository.getCostAnalysis(daysNumber);
      
      res.json({
        success: true,
        analysis: costAnalysis,
        period: `${daysNumber} days`
      });
    } catch (error) {
      console.error('Failed to get cost analysis:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}

export const imagePipelineAPIHandler = new ImagePipelineAPIHandler();