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