import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { imageGenerationPipeline } from '../../../src/services/ai/ImageGenerationPipeline';
import { imageStorageService } from '../../../src/services/storage/ImageStorageService';
import { imageRepository } from '../../../src/services/database/ImageRepository';
import { ImagePrompt } from '../../../src/services/ai/ImagePromptExtractor';

// Mock dependencies
jest.mock('../../../src/services/storage/ImageStorageService');
jest.mock('../../../src/services/database/ImageRepository');
jest.mock('../../../src/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe('Image Generation Pipeline Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/providers')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            {
              provider: 'google',
              hasKey: true,
              active: true,
              capabilities: { image: true }
            },
            {
              provider: 'openai',
              hasKey: true,
              active: true,
              capabilities: { image: true }
            }
          ])
        });
      }
      
      if (url.includes('/image')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            urls: ['https://example.com/generated-image.jpg'],
            model: 'test-model'
          })
        });
      }
      
      return Promise.resolve({
        json: () => Promise.resolve({ success: false, error: 'Not found' })
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Pipeline Processing', () => {
    it('should process multiple prompts successfully', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'test_1',
          originalPrompt: 'A beautiful sunset over mountains',
          position: 0,
          lineNumber: 1,
          context: 'Test context for first image',
          suggestedSize: '1024x1024',
          suggestedStyle: 'photorealistic'
        },
        {
          id: 'test_2',
          originalPrompt: 'Modern city skyline at night',
          position: 100,
          lineNumber: 5,
          context: 'Test context for second image',
          suggestedSize: '1792x1024',
          suggestedStyle: 'photorealistic'
        }
      ];

      // Mock storage service
      (imageStorageService.storeImageFromUrl as jest.Mock).mockResolvedValue({
        url: '/generated-images/test.jpg',
        thumbnailUrl: '/generated-images/test_thumb.jpg',
        storagePath: '/path/to/test.jpg',
        width: 1024,
        height: 1024,
        format: 'jpg',
        fileSize: 150000
      });

      const results = await imageGenerationPipeline.processPrompts(prompts);

      expect(results).toHaveLength(2);
      expect(results[0].promptId).toBe('test_1');
      expect(results[1].promptId).toBe('test_2');
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      
      // Verify storage service was called
      expect(imageStorageService.storeImageFromUrl).toHaveBeenCalledTimes(2);
    });

    it('should handle failed generations gracefully', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'fail_test',
          originalPrompt: '', // Empty prompt should trigger failure
          position: 0,
          lineNumber: 1,
          context: 'Test context'
        }
      ];

      // Mock API failure
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/providers')) {
          return Promise.resolve({
            json: () => Promise.resolve([{
              provider: 'google',
              hasKey: true,
              active: true,
              capabilities: { image: true }
            }])
          });
        }
        
        if (url.includes('/image')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: false,
              error: 'Invalid prompt'
            })
          });
        }
        
        return Promise.resolve({
          json: () => Promise.resolve({ success: false, error: 'Not found' })
        });
      });

      const results = await imageGenerationPipeline.processPrompts(prompts);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
      expect(results[0].promptId).toBe('fail_test');
    });

    it('should retry failed generations when requested', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'retry_test',
          originalPrompt: 'Test image',
          position: 0,
          lineNumber: 1,
          context: 'Test'
        }
      ];

      // First call fails, second succeeds
      let callCount = 0;
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/providers')) {
          return Promise.resolve({
            json: () => Promise.resolve([{
              provider: 'google',
              hasKey: true,
              active: true,
              capabilities: { image: true }
            }])
          });
        }
        
        if (url.includes('/image')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              json: () => Promise.resolve({
                success: false,
                error: 'Temporary failure'
              })
            });
          } else {
            return Promise.resolve({
              json: () => Promise.resolve({
                success: true,
                urls: ['https://example.com/retry-success.jpg'],
                model: 'test-model'
              })
            });
          }
        }
        
        return Promise.resolve({
          json: () => Promise.resolve({ success: false, error: 'Not found' })
        });
      });

      (imageStorageService.storeImageFromUrl as jest.Mock).mockResolvedValue({
        url: '/generated-images/retry.jpg',
        storagePath: '/path/to/retry.jpg',
        width: 1024,
        height: 1024,
        format: 'jpg',
        fileSize: 100000
      });

      // Initial generation
      const initialResults = await imageGenerationPipeline.processPrompts(prompts);
      expect(initialResults[0].success).toBe(false);

      // Retry failed
      const finalResults = await imageGenerationPipeline.retryFailed(initialResults);
      expect(finalResults[0].success).toBe(true);
    });

    it('should handle progress callbacks', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'progress_1',
          originalPrompt: 'First image',
          position: 0,
          lineNumber: 1,
          context: 'Context 1'
        },
        {
          id: 'progress_2',
          originalPrompt: 'Second image',
          position: 50,
          lineNumber: 3,
          context: 'Context 2'
        }
      ];

      (imageStorageService.storeImageFromUrl as jest.Mock).mockResolvedValue({
        url: '/generated-images/progress.jpg',
        storagePath: '/path/to/progress.jpg',
        width: 1024,
        height: 1024,
        format: 'jpg',
        fileSize: 100000
      });

      const progressUpdates: Array<{ completed: number; total: number }> = [];
      
      await imageGenerationPipeline.processPrompts(
        prompts,
        undefined,
        (completed, total) => {
          progressUpdates.push({ completed, total });
        }
      );

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toEqual({
        completed: 2,
        total: 2
      });
    });
  });

  describe('Image Storage', () => {
    it('should store image from URL with metadata', async () => {
      const testUrl = 'https://example.com/test-image.jpg';
      const mockBuffer = Buffer.from('fake image data');

      // Mock fetch for image download
      const mockImageFetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockBuffer.buffer)
      });
      
      (global as any).fetch = mockImageFetch;

      // Mock sharp processing
      const mockSharp = {
        metadata: jest.fn().mockResolvedValue({
          width: 1024,
          height: 1024,
          format: 'jpeg'
        }),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockBuffer),
        resize: jest.fn().mockReturnThis()
      };

      jest.doMock('sharp', () => jest.fn(() => mockSharp));

      const stored = await imageStorageService.storeImageFromUrl(testUrl, {
        promptId: 'storage_test'
      });

      expect(stored.url).toBeDefined();
      expect(stored.width).toBeDefined();
      expect(stored.height).toBeDefined();
    });

    it('should handle storage failures gracefully', async () => {
      const testUrl = 'https://example.com/invalid-image.jpg';

      // Mock failed image download
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(
        imageStorageService.storeImageFromUrl(testUrl, {
          promptId: 'fail_test'
        })
      ).rejects.toThrow();
    });
  });

  describe('Database Operations', () => {
    it('should retrieve images for blog post', async () => {
      const mockImages = [
        {
          id: '1',
          blogPostId: 123,
          promptId: 'test_1',
          originalPrompt: 'Test prompt',
          imageUrl: '/images/test.jpg'
        }
      ];

      (imageRepository.getImagesForBlogPost as jest.Mock).mockResolvedValue(mockImages);

      const images = await imageRepository.getImagesForBlogPost(123);

      expect(images).toEqual(mockImages);
      expect(imageRepository.getImagesForBlogPost).toHaveBeenCalledWith(123);
    });

    it('should get generation statistics', async () => {
      const mockStats = [
        {
          provider: 'google',
          count: 10,
          totalCost: 0.20,
          avgTime: 5000,
          avgQuality: 4.5
        }
      ];

      (imageRepository.getGenerationStats as jest.Mock).mockResolvedValue(mockStats);

      const stats = await imageRepository.getGenerationStats(30);

      expect(stats).toEqual(mockStats);
      expect(imageRepository.getGenerationStats).toHaveBeenCalledWith(30);
    });

    it('should clean up orphaned images', async () => {
      (imageRepository.cleanupOrphanedImages as jest.Mock).mockResolvedValue(5);

      const cleanedCount = await imageRepository.cleanupOrphanedImages();

      expect(cleanedCount).toBe(5);
    });

    it('should search images by prompt text', async () => {
      const mockImages = [
        {
          id: '1',
          originalPrompt: 'Beautiful sunset',
          altText: 'Sunset over mountains'
        }
      ];

      (imageRepository.searchImages as jest.Mock).mockResolvedValue(mockImages);

      const results = await imageRepository.searchImages('sunset');

      expect(results).toEqual(mockImages);
      expect(imageRepository.searchImages).toHaveBeenCalledWith('sunset');
    });
  });

  describe('Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'network_fail',
          originalPrompt: 'Test prompt',
          position: 0,
          lineNumber: 1,
          context: 'Test'
        }
      ];

      // Mock network failure
      mockFetch.mockRejectedValue(new Error('Network error'));

      const results = await imageGenerationPipeline.processPrompts(prompts);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('error');
    });

    it('should handle invalid provider responses', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'invalid_response',
          originalPrompt: 'Test prompt',
          position: 0,
          lineNumber: 1,
          context: 'Test'
        }
      ];

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/providers')) {
          return Promise.resolve({
            json: () => Promise.resolve([{
              provider: 'google',
              hasKey: true,
              active: true,
              capabilities: { image: true }
            }])
          });
        }
        
        if (url.includes('/image')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: true,
              urls: [] // Empty URLs array
            })
          });
        }
        
        return Promise.resolve({
          json: () => Promise.resolve({ success: false })
        });
      });

      const results = await imageGenerationPipeline.processPrompts(prompts);

      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respect concurrent processing limits', async () => {
      const prompts: ImagePrompt[] = Array.from({ length: 10 }, (_, i) => ({
        id: `perf_${i}`,
        originalPrompt: `Test prompt ${i}`,
        position: i * 10,
        lineNumber: i + 1,
        context: `Context ${i}`
      }));

      let concurrentCount = 0;
      let maxConcurrent = 0;

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/providers')) {
          return Promise.resolve({
            json: () => Promise.resolve([{
              provider: 'google',
              hasKey: true,
              active: true,
              capabilities: { image: true }
            }])
          });
        }
        
        if (url.includes('/image')) {
          concurrentCount++;
          maxConcurrent = Math.max(maxConcurrent, concurrentCount);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          
          concurrentCount--;
          
          return Promise.resolve({
            json: () => Promise.resolve({
              success: true,
              urls: [`https://example.com/perf-${Date.now()}.jpg`],
              model: 'test-model'
            })
          });
        }
        
        return Promise.resolve({
          json: () => Promise.resolve({ success: false })
        });
      });

      (imageStorageService.storeImageFromUrl as jest.Mock).mockResolvedValue({
        url: '/generated-images/perf.jpg',
        storagePath: '/path/to/perf.jpg',
        width: 1024,
        height: 1024,
        format: 'jpg',
        fileSize: 100000
      });

      await imageGenerationPipeline.processPrompts(prompts);

      // Default max concurrent is 3
      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });
});