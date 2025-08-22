// Image Processing Utilities for Blog Migration
// Handles downloading images from external sources and uploading to GCS

import fs from 'fs/promises';
import path from 'path';
import { uploadImageToGCS } from '../services/gcsService.js';
// Using native fetch (Node.js 18+)
import crypto from 'crypto';

export interface ImageProcessingResult {
  originalUrl: string;
  newUrl: string;
  fileName: string;
  type: 'featured' | 'content' | 'author';
  success: boolean;
  error?: string;
}

export interface MigrationProgress {
  totalImages: number;
  processedImages: number;
  successfulUploads: number;
  failedUploads: number;
  errors: string[];
  startTime: Date;
  currentOperation: string;
}

export class ImageProcessor {
  private progress: MigrationProgress;
  private tempDir: string;

  constructor() {
    this.progress = {
      totalImages: 0,
      processedImages: 0,
      successfulUploads: 0,
      failedUploads: 0,
      errors: [],
      startTime: new Date(),
      currentOperation: 'Initializing'
    };
    this.tempDir = path.join(process.cwd(), 'temp-migration');
  }

  /**
   * Initialize temporary directory for downloads
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log(`✅ Temporary directory created: ${this.tempDir}`);
    } catch (error) {
      throw new Error(`Failed to create temporary directory: ${error}`);
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
      console.log('✅ Temporary files cleaned up');
    } catch (error) {
      console.warn(`Warning: Failed to clean up temporary files: ${error}`);
    }
  }

  /**
   * Extract all image URLs from blog content
   */
  extractImageUrls(content: string, featuredImage?: string): string[] {
    const urls = new Set<string>();
    
    // Add featured image if provided
    if (featuredImage) {
      urls.add(featuredImage);
    }

    // Extract images from markdown content
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(content)) !== null) {
      urls.add(match[1]);
    }

    // Extract images from HTML content
    const htmlImageRegex = /<img[^>]+src=['""]([^'""]+)['""][^>]*>/g;
    while ((match = htmlImageRegex.exec(content)) !== null) {
      urls.add(match[1]);
    }

    return Array.from(urls);
  }

  /**
   * Download image from URL
   */
  async downloadImage(url: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    try {
      console.log(`📥 Downloading: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogMigrationBot/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Determine file extension from URL or content type
      let extension = 'jpg';
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('png')) extension = 'png';
      else if (contentType.includes('webp')) extension = 'webp';
      else if (contentType.includes('gif')) extension = 'gif';
      else if (url.includes('.png')) extension = 'png';
      else if (url.includes('.webp')) extension = 'webp';
      else if (url.includes('.gif')) extension = 'gif';

      // Generate unique filename
      const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
      const timestamp = Date.now();
      const filename = `${timestamp}-${hash}.${extension}`;

      return {
        buffer,
        filename,
        mimeType: contentType || 'image/jpeg'
      };
    } catch (error) {
      throw new Error(`Failed to download ${url}: ${error}`);
    }
  }

  /**
   * Process a single image: download and upload to GCS
   */
  async processImage(
    url: string, 
    type: 'featured' | 'content' | 'author',
    slug?: string,
    index?: number
  ): Promise<ImageProcessingResult> {
    const result: ImageProcessingResult = {
      originalUrl: url,
      newUrl: '',
      fileName: '',
      type,
      success: false
    };

    try {
      this.progress.currentOperation = `Processing ${type} image: ${url}`;
      
      // Download image
      const { buffer, filename, mimeType } = await this.downloadImage(url);
      
      // Generate GCS path based on type
      let gcsPath: string;
      switch (type) {
        case 'featured':
          gcsPath = `blog/featured/${slug}-${filename}`;
          break;
        case 'content':
          gcsPath = `blog/content/${slug}-${index || 0}-${filename}`;
          break;
        case 'author':
          gcsPath = `authors/${filename}`;
          break;
        default:
          gcsPath = `blog/misc/${filename}`;
      }

      // Upload to GCS
      console.log(`☁️ Uploading to GCS: ${gcsPath}`);
      const uploadResult = await uploadImageToGCS(buffer, gcsPath, mimeType);
      
      result.newUrl = uploadResult.publicUrl;
      result.fileName = uploadResult.fileName;
      result.success = true;
      
      this.progress.successfulUploads++;
      console.log(`✅ Successfully processed: ${url} → ${result.newUrl}`);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      result.success = false;
      this.progress.failedUploads++;
      this.progress.errors.push(`${url}: ${result.error}`);
      console.error(`❌ Failed to process ${url}: ${result.error}`);
    }

    this.progress.processedImages++;
    return result;
  }

  /**
   * Process all images for a blog post
   */
  async processPostImages(
    content: string,
    featuredImage: string | undefined,
    authorImage: string | undefined,
    slug: string
  ): Promise<{
    updatedContent: string;
    updatedFeaturedImage?: string;
    updatedAuthorImage?: string;
    processedImages: ImageProcessingResult[];
  }> {
    const processedImages: ImageProcessingResult[] = [];
    let updatedContent = content;
    let updatedFeaturedImage = featuredImage;
    let updatedAuthorImage = authorImage;

    // Process featured image
    if (featuredImage) {
      const result = await this.processImage(featuredImage, 'featured', slug);
      processedImages.push(result);
      if (result.success) {
        updatedFeaturedImage = result.newUrl;
      }
    }

    // Process author image
    if (authorImage) {
      const result = await this.processImage(authorImage, 'author');
      processedImages.push(result);
      if (result.success) {
        updatedAuthorImage = result.newUrl;
      }
    }

    // Process content images
    const contentImages = this.extractImageUrls(content);
    let contentImageIndex = 0;
    
    for (const imageUrl of contentImages) {
      // Skip if it's the featured or author image (already processed)
      if (imageUrl === featuredImage || imageUrl === authorImage) {
        continue;
      }

      const result = await this.processImage(imageUrl, 'content', slug, contentImageIndex);
      processedImages.push(result);
      
      if (result.success) {
        // Replace the URL in content
        updatedContent = updatedContent.replace(
          new RegExp(this.escapeRegExp(imageUrl), 'g'),
          result.newUrl
        );
      }
      
      contentImageIndex++;
    }

    return {
      updatedContent,
      updatedFeaturedImage,
      updatedAuthorImage,
      processedImages
    };
  }

  /**
   * Get current migration progress
   */
  getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  /**
   * Set total images count for progress tracking
   */
  setTotalImages(count: number): void {
    this.progress.totalImages = count;
  }

  /**
   * Generate migration report
   */
  generateReport(): string {
    const duration = Date.now() - this.progress.startTime.getTime();
    const successRate = this.progress.totalImages > 0 
      ? (this.progress.successfulUploads / this.progress.totalImages * 100).toFixed(1)
      : '0';

    return `
📊 IMAGE MIGRATION REPORT
========================
🕒 Duration: ${Math.round(duration / 1000)}s
📁 Total Images: ${this.progress.totalImages}
✅ Successful: ${this.progress.successfulUploads}
❌ Failed: ${this.progress.failedUploads}
📈 Success Rate: ${successRate}%

${this.progress.errors.length > 0 ? `
🐛 ERRORS:
${this.progress.errors.map(error => `  - ${error}`).join('\n')}
` : '✅ No errors encountered!'}
`;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default ImageProcessor;