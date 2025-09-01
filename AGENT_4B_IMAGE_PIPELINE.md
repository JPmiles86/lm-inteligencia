# Agent-4B: Image Generation & Storage Pipeline Specialist
**Priority:** 🔴 CRITICAL
**Duration:** 14 hours
**Dependencies:** Agent-4A should complete prompt extraction first
**Created:** 2025-08-31

## 🚨 CRITICAL MD RULE
**ALL WORK MUST BE DOCUMENTED IN .MD FILES**
- Create `/docs/agent-reports/AGENT-4B-PROGRESS.md` IMMEDIATELY
- Update it CONTINUOUSLY as you work
- Document EVERY file created/modified
- Record ALL TypeScript errors found/fixed
- This ensures crash recovery and agent handoff

## ⚠️ TYPESCRIPT COMPLIANCE
**MONITOR TypeScript errors constantly:**
```bash
# Run before starting work
npm run type-check > initial-ts-errors.log

# Run after EVERY file change
npm run type-check

# Run before marking complete
npm run type-check > final-ts-errors.log
```
**DO NOT introduce new TypeScript errors!**

## 🎯 MISSION
Implement the complete image generation and storage pipeline that takes extracted prompts, generates images using available AI providers, stores them in a database/storage service, and embeds them back into blog content.

## 📋 CONTEXT
- **User Requirement:** Automated image generation and insertion into blogs
- **Current State:** AI providers (OpenAI, Google) can generate images
- **Agent-4A Output:** Prompt extraction and enhancement system
- **Goal:** Complete pipeline from prompts to stored images in blogs

## ✅ SUCCESS CRITERIA
1. Batch image generation from multiple prompts
2. Image upload to storage service (local/cloud)
3. Save image URLs and metadata to database
4. Link images to specific blog posts
5. Replace prompts with actual images in content
6. Handle generation failures gracefully
7. NO new TypeScript errors introduced
8. All work documented in .md files

## 🔧 SPECIFIC TASKS

### 1. Create Progress Tracking File (FIRST TASK - 5 minutes)

**File:** `/docs/agent-reports/AGENT-4B-PROGRESS.md`
```markdown
# Agent-4B: Image Generation & Storage Pipeline Progress

## Assignment
Implement complete image generation and storage pipeline

## Status: IN PROGRESS
Started: [timestamp]

## TypeScript Baseline
Initial errors: [count from npm run type-check]

## Files Created/Modified
- [ ] /src/services/ai/ImageGenerationPipeline.ts
- [ ] /src/services/storage/ImageStorageService.ts
- [ ] /src/services/database/ImageRepository.ts
- [ ] /src/components/ai/ImageGenerationStatus.tsx
- [ ] /api/services/imagePipelineService.ts
- [ ] /src/db/migrations/add-images-table.sql
- [ ] /__tests__/integration/services/imagePipeline.test.ts

## Progress Log
[timestamp] - Started work, checking TypeScript baseline
[timestamp] - Creating image generation pipeline
[Update continuously...]

## Issues Found
- [List any issues]

## TypeScript Errors
- Before: X errors
- After: Y errors
- New errors introduced: MUST BE 0
```

### 2. Create Database Schema for Images (1 hour)

**File:** `/src/db/migrations/add-images-table.sql`
```sql
-- Create images table for storing generated images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  prompt_id VARCHAR(255) NOT NULL,
  original_prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  thumbnail_url TEXT,
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  format VARCHAR(20),
  file_size INTEGER,
  
  -- Generation metadata
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100),
  generation_time INTEGER, -- milliseconds
  generation_cost DECIMAL(10, 6),
  
  -- Status and quality
  status VARCHAR(50) DEFAULT 'generated',
  quality_score DECIMAL(3, 2),
  alt_text TEXT,
  caption TEXT,
  
  -- Position in content
  position_in_content INTEGER,
  section_title VARCHAR(255),
  importance VARCHAR(20), -- primary, secondary, decorative
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_images_blog_post ON generated_images(blog_post_id);
CREATE INDEX idx_images_prompt_id ON generated_images(prompt_id);
CREATE INDEX idx_images_status ON generated_images(status);
CREATE INDEX idx_images_provider ON generated_images(provider);
```

**Update Drizzle Schema:** `/src/db/schema.ts`
```typescript
export const generatedImages = pgTable('generated_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  blogPostId: integer('blog_post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  promptId: varchar('prompt_id', { length: 255 }).notNull(),
  originalPrompt: text('original_prompt').notNull(),
  enhancedPrompt: text('enhanced_prompt'),
  imageUrl: text('image_url').notNull(),
  storagePath: text('storage_path'),
  thumbnailUrl: text('thumbnail_url'),
  
  // Image metadata
  width: integer('width'),
  height: integer('height'),
  format: varchar('format', { length: 20 }),
  fileSize: integer('file_size'),
  
  // Generation metadata
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }),
  generationTime: integer('generation_time'),
  generationCost: decimal('generation_cost', { precision: 10, scale: 6 }),
  
  // Status and quality
  status: varchar('status', { length: 50 }).default('generated'),
  qualityScore: decimal('quality_score', { precision: 3, scale: 2 }),
  altText: text('alt_text'),
  caption: text('caption'),
  
  // Position in content
  positionInContent: integer('position_in_content'),
  sectionTitle: varchar('section_title', { length: 255 }),
  importance: varchar('importance', { length: 20 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### 3. Create Image Storage Service (2 hours)

**File:** `/src/services/storage/ImageStorageService.ts`
```typescript
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export interface StorageConfig {
  type: 'local' | 'cloudinary' | 's3' | 'vercel-blob';
  localPath?: string;
  cloudConfig?: any;
}

export interface StoredImage {
  url: string;
  thumbnailUrl?: string;
  storagePath: string;
  width: number;
  height: number;
  format: string;
  fileSize: number;
}

export class ImageStorageService {
  private config: StorageConfig;
  
  constructor(config?: StorageConfig) {
    this.config = config || {
      type: 'local',
      localPath: path.join(process.cwd(), 'public', 'generated-images')
    };
  }
  
  /**
   * Store image from URL
   */
  async storeImageFromUrl(
    imageUrl: string,
    metadata: {
      blogPostId?: number;
      promptId: string;
    }
  ): Promise<StoredImage> {
    try {
      // Download image
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Process and optimize image
      const processedImage = await this.processImage(imageBuffer);
      
      // Generate unique filename
      const filename = this.generateFilename(metadata.promptId);
      
      // Store based on configuration
      let storedImage: StoredImage;
      
      switch (this.config.type) {
        case 'local':
          storedImage = await this.storeLocal(processedImage, filename);
          break;
        case 'cloudinary':
          storedImage = await this.storeCloudinary(processedImage, filename);
          break;
        case 's3':
          storedImage = await this.storeS3(processedImage, filename);
          break;
        case 'vercel-blob':
          storedImage = await this.storeVercelBlob(processedImage, filename);
          break;
        default:
          storedImage = await this.storeLocal(processedImage, filename);
      }
      
      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(processedImage.buffer);
      const thumbnailStored = await this.storeThumbnail(thumbnail, filename);
      
      return {
        ...storedImage,
        thumbnailUrl: thumbnailStored.url
      };
    } catch (error) {
      console.error('Image storage failed:', error);
      throw error;
    }
  }
  
  /**
   * Store image from base64
   */
  async storeImageFromBase64(
    base64Data: string,
    metadata: {
      blogPostId?: number;
      promptId: string;
    }
  ): Promise<StoredImage> {
    const buffer = Buffer.from(base64Data, 'base64');
    const processedImage = await this.processImage(buffer);
    const filename = this.generateFilename(metadata.promptId);
    
    return this.storeLocal(processedImage, filename);
  }
  
  /**
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  /**
   * Process and optimize image
   */
  private async processImage(buffer: Buffer): Promise<{
    buffer: Buffer;
    metadata: sharp.Metadata;
  }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Optimize based on format
    let optimized;
    if (metadata.format === 'png') {
      optimized = await image
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();
    } else if (metadata.format === 'webp') {
      optimized = await image
        .webp({ quality: 85 })
        .toBuffer();
    } else {
      // Default to JPEG
      optimized = await image
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    }
    
    return {
      buffer: optimized,
      metadata
    };
  }
  
  /**
   * Generate thumbnail
   */
  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toBuffer();
  }
  
  /**
   * Store image locally
   */
  private async storeLocal(
    image: { buffer: Buffer; metadata: sharp.Metadata },
    filename: string
  ): Promise<StoredImage> {
    const dir = this.config.localPath!;
    await fs.mkdir(dir, { recursive: true });
    
    const ext = image.metadata.format || 'jpg';
    const fullFilename = `${filename}.${ext}`;
    const filepath = path.join(dir, fullFilename);
    
    await fs.writeFile(filepath, image.buffer);
    
    return {
      url: `/generated-images/${fullFilename}`,
      storagePath: filepath,
      width: image.metadata.width!,
      height: image.metadata.height!,
      format: ext,
      fileSize: image.buffer.length
    };
  }
  
  /**
   * Store thumbnail
   */
  private async storeThumbnail(
    buffer: Buffer,
    baseFilename: string
  ): Promise<{ url: string }> {
    const dir = this.config.localPath!;
    const filename = `${baseFilename}_thumb.jpg`;
    const filepath = path.join(dir, filename);
    
    await fs.writeFile(filepath, buffer);
    
    return {
      url: `/generated-images/${filename}`
    };
  }
  
  /**
   * Store in Cloudinary
   */
  private async storeCloudinary(
    image: { buffer: Buffer; metadata: sharp.Metadata },
    filename: string
  ): Promise<StoredImage> {
    // Implement Cloudinary upload
    // This is a placeholder - actual implementation needs Cloudinary SDK
    throw new Error('Cloudinary storage not implemented yet');
  }
  
  /**
   * Store in S3
   */
  private async storeS3(
    image: { buffer: Buffer; metadata: sharp.Metadata },
    filename: string
  ): Promise<StoredImage> {
    // Implement S3 upload
    // This is a placeholder - actual implementation needs AWS SDK
    throw new Error('S3 storage not implemented yet');
  }
  
  /**
   * Store in Vercel Blob
   */
  private async storeVercelBlob(
    image: { buffer: Buffer; metadata: sharp.Metadata },
    filename: string
  ): Promise<StoredImage> {
    // Implement Vercel Blob storage
    // This is a placeholder - actual implementation needs Vercel SDK
    throw new Error('Vercel Blob storage not implemented yet');
  }
  
  /**
   * Generate unique filename
   */
  private generateFilename(promptId: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(promptId).digest('hex').substring(0, 8);
    return `img_${timestamp}_${hash}`;
  }
  
  /**
   * Delete image
   */
  async deleteImage(storagePath: string): Promise<void> {
    if (this.config.type === 'local') {
      try {
        await fs.unlink(storagePath);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
    // Implement for other storage types
  }
}

// Export singleton instance
export const imageStorageService = new ImageStorageService();
```

### 4. Create Image Generation Pipeline (3 hours)

**File:** `/src/services/ai/ImageGenerationPipeline.ts`
```typescript
import { ImagePrompt } from './ImagePromptExtractor';
import { imageStorageService, StoredImage } from '../storage/ImageStorageService';
import { db } from '@/db';
import { generatedImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface PipelineConfig {
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
  preferredProvider?: 'openai' | 'google';
  quality?: 'standard' | 'high';
  storageType?: 'local' | 'cloud';
}

export interface GenerationResult {
  promptId: string;
  success: boolean;
  imageUrl?: string;
  storedImage?: StoredImage;
  error?: string;
  provider?: string;
  model?: string;
  generationTime?: number;
  cost?: number;
}

export class ImageGenerationPipeline {
  private config: PipelineConfig;
  
  constructor(config?: PipelineConfig) {
    this.config = {
      maxConcurrent: 3,
      retryAttempts: 2,
      retryDelay: 1000,
      preferredProvider: 'google',
      quality: 'high',
      storageType: 'local',
      ...config
    };
  }
  
  /**
   * Process multiple image prompts
   */
  async processPrompts(
    prompts: ImagePrompt[],
    blogPostId?: number,
    onProgress?: (completed: number, total: number) => void
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    const batches = this.createBatches(prompts, this.config.maxConcurrent!);
    
    let completed = 0;
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(prompt => this.processSinglePrompt(prompt, blogPostId))
      );
      
      results.push(...batchResults);
      completed += batch.length;
      
      if (onProgress) {
        onProgress(completed, prompts.length);
      }
    }
    
    return results;
  }
  
  /**
   * Process single image prompt
   */
  async processSinglePrompt(
    prompt: ImagePrompt,
    blogPostId?: number
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // Generate image
      const generation = await this.generateImage(prompt);
      
      if (!generation.success || !generation.imageUrl) {
        throw new Error(generation.error || 'Image generation failed');
      }
      
      // Store image
      const storedImage = await imageStorageService.storeImageFromUrl(
        generation.imageUrl,
        {
          blogPostId,
          promptId: prompt.id
        }
      );
      
      // Save to database
      await this.saveToDatabase({
        blogPostId,
        promptId: prompt.id,
        originalPrompt: prompt.originalPrompt,
        enhancedPrompt: prompt.enhancedPrompt,
        imageUrl: storedImage.url,
        storagePath: storedImage.storagePath,
        thumbnailUrl: storedImage.thumbnailUrl,
        width: storedImage.width,
        height: storedImage.height,
        format: storedImage.format,
        fileSize: storedImage.fileSize,
        provider: generation.provider!,
        model: generation.model,
        generationTime: Date.now() - startTime,
        generationCost: generation.cost,
        altText: this.generateAltText(prompt),
        positionInContent: prompt.position,
        sectionTitle: prompt.metadata?.sectionTitle,
        importance: prompt.metadata?.importance
      });
      
      return {
        promptId: prompt.id,
        success: true,
        imageUrl: storedImage.url,
        storedImage,
        provider: generation.provider,
        model: generation.model,
        generationTime: Date.now() - startTime,
        cost: generation.cost
      };
    } catch (error) {
      console.error(`Failed to process prompt ${prompt.id}:`, error);
      
      return {
        promptId: prompt.id,
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate image using AI provider
   */
  private async generateImage(
    prompt: ImagePrompt
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    provider?: string;
    model?: string;
    cost?: number;
    error?: string;
  }> {
    const enhancedPrompt = prompt.enhancedPrompt || prompt.originalPrompt;
    
    // Try preferred provider first
    const providers = this.getProviderOrder();
    
    for (const provider of providers) {
      try {
        const result = await this.callProvider(provider, enhancedPrompt, prompt);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        continue; // Try next provider
      }
    }
    
    return {
      success: false,
      error: 'All providers failed'
    };
  }
  
  /**
   * Call specific provider for image generation
   */
  private async callProvider(
    provider: string,
    prompt: string,
    imagePrompt: ImagePrompt
  ): Promise<any> {
    const response = await fetch(`/api/${provider}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        config: {
          size: imagePrompt.suggestedSize,
          quality: this.config.quality,
          style: imagePrompt.suggestedStyle
        }
      })
    });
    
    const data = await response.json();
    
    if (!data.success || !data.urls?.length) {
      throw new Error(data.error || 'No image generated');
    }
    
    return {
      success: true,
      imageUrl: data.urls[0],
      provider,
      model: data.model,
      cost: this.estimateCost(provider)
    };
  }
  
  /**
   * Get provider order based on availability and preference
   */
  private async getProviderOrder(): Promise<string[]> {
    // Check available providers
    const response = await fetch('/api/providers');
    const providers = await response.json();
    
    const available = providers
      .filter(p => p.hasKey && p.active && p.capabilities?.image)
      .map(p => p.provider);
    
    // Sort by preference
    const preferred = this.config.preferredProvider;
    if (preferred && available.includes(preferred)) {
      return [preferred, ...available.filter(p => p !== preferred)];
    }
    
    return available;
  }
  
  /**
   * Save generated image to database
   */
  private async saveToDatabase(data: any): Promise<void> {
    try {
      await db.insert(generatedImages).values(data);
    } catch (error) {
      console.error('Failed to save image to database:', error);
    }
  }
  
  /**
   * Generate alt text for accessibility
   */
  private generateAltText(prompt: ImagePrompt): string {
    // Clean up the prompt for alt text
    let alt = prompt.originalPrompt;
    
    // Remove technical terms
    alt = alt.replace(/high quality|4k|8k|photorealistic|illustration/gi, '');
    
    // Clean up
    alt = alt.replace(/\s+/g, ' ').trim();
    
    // Ensure reasonable length
    if (alt.length > 125) {
      alt = alt.substring(0, 122) + '...';
    }
    
    return alt;
  }
  
  /**
   * Create batches for concurrent processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  /**
   * Estimate generation cost
   */
  private estimateCost(provider: string): number {
    const costs = {
      openai: 0.04, // DALL-E 3 standard
      google: 0.02, // Gemini estimate
    };
    
    return costs[provider] || 0.03;
  }
  
  /**
   * Retry failed generations
   */
  async retryFailed(
    results: GenerationResult[],
    blogPostId?: number
  ): Promise<GenerationResult[]> {
    const failed = results.filter(r => !r.success);
    const prompts = failed.map(f => ({ id: f.promptId } as ImagePrompt));
    
    if (prompts.length === 0) {
      return results;
    }
    
    console.log(`Retrying ${prompts.length} failed generations...`);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay!));
    
    const retryResults = await this.processPrompts(prompts, blogPostId);
    
    // Merge results
    return results.map(r => {
      if (!r.success) {
        const retry = retryResults.find(rr => rr.promptId === r.promptId);
        if (retry && retry.success) {
          return retry;
        }
      }
      return r;
    });
  }
}

// Export singleton instance
export const imageGenerationPipeline = new ImageGenerationPipeline();
```

### 5. Create Image Repository (2 hours)

**File:** `/src/services/database/ImageRepository.ts`
```typescript
import { db } from '@/db';
import { generatedImages, blogPosts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

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
   * Update image metadata
   */
  async updateImage(
    promptId: string,
    updates: {
      altText?: string;
      caption?: string;
      qualityScore?: number;
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
   * Get generation statistics
   */
  async getGenerationStats(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const stats = await db.select({
      provider: generatedImages.provider,
      count: sql`COUNT(*)`,
      totalCost: sql`SUM(generation_cost)`,
      avgTime: sql`AVG(generation_time)`,
      avgQuality: sql`AVG(quality_score)`
    })
    .from(generatedImages)
    .where(gte(generatedImages.createdAt, cutoffDate))
    .groupBy(generatedImages.provider);
    
    return stats;
  }
  
  /**
   * Clean up orphaned images
   */
  async cleanupOrphanedImages() {
    // Find images without blog posts
    const orphaned = await db.select()
      .from(generatedImages)
      .leftJoin(blogPosts, eq(generatedImages.blogPostId, blogPosts.id))
      .where(isNull(blogPosts.id));
    
    for (const image of orphaned) {
      await this.deleteImage(image.generatedImages.promptId);
    }
    
    return orphaned.length;
  }
}

export const imageRepository = new ImageRepository();
```

### 6. Create Status Component (2 hours)

**File:** `/src/components/ai/ImageGenerationStatus.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Image, RefreshCw } from 'lucide-react';
import { GenerationResult } from '@/services/ai/ImageGenerationPipeline';

interface ImageGenerationStatusProps {
  results: GenerationResult[];
  onRetry?: (failed: GenerationResult[]) => void;
  onComplete?: () => void;
}

export const ImageGenerationStatus: React.FC<ImageGenerationStatusProps> = ({
  results,
  onRetry,
  onComplete
}) => {
  const [isComplete, setIsComplete] = useState(false);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
  const avgTime = results.reduce((sum, r) => sum + (r.generationTime || 0), 0) / results.length;
  
  useEffect(() => {
    if (results.length > 0 && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [results]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Image Generation Status</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {successful.length}
          </div>
          <div className="text-sm text-gray-500">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {failed.length}
          </div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            ${totalCost.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Cost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(avgTime / 1000).toFixed(1)}s
          </div>
          <div className="text-sm text-gray-500">Avg Time</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{successful.length} / {results.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(successful.length / results.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Results List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div 
            key={result.promptId}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div className="flex items-center space-x-3">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">
                  Image #{index + 1}
                </div>
                <div className="text-sm text-gray-500">
                  {result.provider || 'Unknown'} • {(result.generationTime || 0) / 1000}s
                </div>
              </div>
            </div>
            
            {result.storedImage && (
              <img 
                src={result.storedImage.thumbnailUrl || result.storedImage.url}
                alt=""
                className="h-12 w-12 object-cover rounded"
              />
            )}
            
            {!result.success && (
              <div className="text-sm text-red-600">
                {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Retry Failed */}
      {failed.length > 0 && onRetry && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onRetry(failed)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Failed ({failed.length})</span>
          </button>
        </div>
      )}
    </div>
  );
};
```

### 7. Create API Service (1 hour)

**File:** `/api/services/imagePipelineService.ts`
```typescript
import { Request, Response } from 'express';
import { imageGenerationPipeline } from '@/services/ai/ImageGenerationPipeline';
import { imageRepository } from '@/services/database/ImageRepository';

export class ImagePipelineAPIHandler {
  async generateBatchImages(req: Request, res: Response) {
    const { prompts, blogPostId, config } = req.body;
    
    try {
      const pipeline = imageGenerationPipeline;
      
      // Process prompts
      const results = await pipeline.processPrompts(
        prompts,
        blogPostId,
        (completed, total) => {
          // Could send SSE updates here
          console.log(`Progress: ${completed}/${total}`);
        }
      );
      
      // Retry failed if configured
      const finalResults = config?.retryFailed
        ? await pipeline.retryFailed(results, blogPostId)
        : results;
      
      res.json({
        success: true,
        results: finalResults,
        summary: {
          total: finalResults.length,
          successful: finalResults.filter(r => r.success).length,
          failed: finalResults.filter(r => !r.success).length,
          totalCost: finalResults.reduce((sum, r) => sum + (r.cost || 0), 0)
        }
      });
    } catch (error) {
      console.error('Batch image generation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async getImagesForBlog(req: Request, res: Response) {
    const { blogPostId } = req.params;
    
    try {
      const images = await imageRepository.getImagesForBlogPost(
        parseInt(blogPostId)
      );
      
      res.json({
        success: true,
        images
      });
    } catch (error) {
      console.error('Failed to get images:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async updateImageMetadata(req: Request, res: Response) {
    const { promptId } = req.params;
    const updates = req.body;
    
    try {
      await imageRepository.updateImage(promptId, updates);
      
      res.json({
        success: true,
        message: 'Image updated successfully'
      });
    } catch (error) {
      console.error('Failed to update image:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async deleteImage(req: Request, res: Response) {
    const { promptId } = req.params;
    
    try {
      await imageRepository.deleteImage(promptId);
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async getGenerationStats(req: Request, res: Response) {
    const { days = 30 } = req.query;
    
    try {
      const stats = await imageRepository.getGenerationStats(
        parseInt(days as string)
      );
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Failed to get stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const imagePipelineAPIHandler = new ImagePipelineAPIHandler();
```

### 8. Create Integration Tests (1 hour)

**File:** `/__tests__/integration/services/imagePipeline.test.ts`
```typescript
import { imageGenerationPipeline } from '@/services/ai/ImageGenerationPipeline';
import { imageStorageService } from '@/services/storage/ImageStorageService';
import { ImagePrompt } from '@/services/ai/ImagePromptExtractor';

describe('Image Generation Pipeline', () => {
  describe('Pipeline Processing', () => {
    it('should process multiple prompts', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'test_1',
          originalPrompt: 'A beautiful sunset',
          position: 0,
          lineNumber: 1,
          context: 'Test context'
        },
        {
          id: 'test_2',
          originalPrompt: 'Mountain landscape',
          position: 100,
          lineNumber: 5,
          context: 'Test context'
        }
      ];
      
      const results = await imageGenerationPipeline.processPrompts(prompts);
      
      expect(results).toHaveLength(2);
      expect(results[0].promptId).toBe('test_1');
      expect(results[1].promptId).toBe('test_2');
    });
    
    it('should handle failed generations', async () => {
      const prompts: ImagePrompt[] = [
        {
          id: 'fail_test',
          originalPrompt: '', // Empty prompt should fail
          position: 0,
          lineNumber: 1,
          context: 'Test'
        }
      ];
      
      const results = await imageGenerationPipeline.processPrompts(prompts);
      
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });
  
  describe('Image Storage', () => {
    it('should store image from URL', async () => {
      const testUrl = 'https://via.placeholder.com/1024';
      
      const stored = await imageStorageService.storeImageFromUrl(testUrl, {
        promptId: 'storage_test'
      });
      
      expect(stored.url).toBeDefined();
      expect(stored.width).toBe(1024);
      expect(stored.height).toBe(1024);
    });
    
    it('should generate thumbnails', async () => {
      const testUrl = 'https://via.placeholder.com/1024';
      
      const stored = await imageStorageService.storeImageFromUrl(testUrl, {
        promptId: 'thumb_test'
      });
      
      expect(stored.thumbnailUrl).toBeDefined();
      expect(stored.thumbnailUrl).toContain('thumb');
    });
  });
});
```

## 📝 REQUIRED DELIVERABLES

### 1. Progress Report (UPDATE CONTINUOUSLY)
**File:** `/docs/agent-reports/AGENT-4B-PROGRESS.md`
- Document every file created
- Track TypeScript errors before/after
- List storage implementations
- Record pipeline test results

### 2. Implementation Report (AT COMPLETION)
**File:** `/docs/agent-reports/AGENT-4B-IMPLEMENTATION.md`
- Summary of pipeline implementation
- Storage options available
- Database schema created
- Integration points

### 3. Update Master Progress Log
Add to `/MASTER_PROGRESS_LOG.md` when complete

## 🔍 TESTING REQUIREMENTS

1. **TypeScript Compliance:**
```bash
npm run type-check  # MUST show same or fewer errors than baseline
```

2. **Integration Tests:**
```bash
npm test -- imagePipeline.test.ts
```

3. **Database Migration:**
```bash
npm run db:migrate
```

## ⚠️ CRITICAL REMINDERS

1. **MD Rule:** Document EVERYTHING in .md files
2. **TypeScript:** NO new errors allowed
3. **Storage:** Support both local and cloud storage
4. **Error Handling:** Handle generation failures gracefully
5. **Progress Updates:** Update progress file every 30 minutes

## 🚫 DO NOT

1. Store images without database records
2. Skip error handling for failed generations
3. Introduce TypeScript errors
4. Hardcode storage paths
5. Forget to document in .md files

---

**REMEMBER: All work must be documented in .md files for crash recovery and agent handoff!**