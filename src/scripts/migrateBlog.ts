#!/usr/bin/env node

// Main Blog Migration Script
// Migrates existing blog posts from /src/data/blogData.ts to PostgreSQL database
// Downloads and uploads all images to Google Cloud Storage

import { blogPosts } from '../data/blogData.js';
import { blogDatabaseService } from '../services/blogDatabaseService.js';
import ImageProcessor from './imageProcessor.js';
import ContentProcessor from './contentProcessor.js';
import { 
  MigrationLogger, 
  BackupManager, 
  ProgressTracker, 
  validateEnvironment,
  formatDuration 
} from './migrationUtils.js';

interface MigrationResult {
  success: boolean;
  postId?: number;
  originalPostId: number;
  imageResults: any[];
  error?: string;
}

class BlogMigration {
  private logger: MigrationLogger;
  private backupManager: BackupManager;
  private progressTracker: ProgressTracker;
  private imageProcessor: ImageProcessor;
  private contentProcessor: ContentProcessor;
  private results: MigrationResult[] = [];
  private backupFile: string = '';

  constructor() {
    this.logger = new MigrationLogger();
    this.backupManager = new BackupManager();
    this.progressTracker = new ProgressTracker();
    this.imageProcessor = new ImageProcessor();
    this.contentProcessor = new ContentProcessor();
  }

  /**
   * Run the complete migration process
   */
  async run(): Promise<void> {
    try {
      await this.initialize();
      await this.executeMigration();
      await this.validateMigration();
      await this.generateFinalReport();
      
      console.log('\n🎉 Blog migration completed successfully!');
      
    } catch (error) {
      await this.logger.log(`💥 Migration failed: ${error}`, 'ERROR');
      throw error;
      
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Initialize migration environment and dependencies
   */
  private async initialize(): Promise<void> {
    console.log('🚀 Initializing blog migration...\n');
    
    // Initialize logging
    await this.logger.init();
    await this.logger.log('🔧 Starting blog migration initialization', 'INFO');

    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      throw new Error(`Environment validation failed:\n${envValidation.errors.join('\n')}`);
    }
    await this.logger.log('✅ Environment validation passed', 'SUCCESS');

    // Initialize components
    await this.backupManager.init();
    await this.imageProcessor.initialize();
    
    // Create backup of original data
    this.backupFile = await this.backupManager.createBackup(blogPosts);
    await this.logger.log(`📦 Original data backed up to: ${this.backupFile}`, 'SUCCESS');

    // Set up progress tracking
    this.progressTracker.setTotalSteps(5); // Init, Process, Migrate, Validate, Report
    this.progressTracker.setCurrentStep('Initialization', 100);
    this.progressTracker.completeStep();

    // Analyze data
    await this.analyzeSourceData();
    
    await this.logger.log('🎯 Initialization completed successfully', 'SUCCESS');
  }

  /**
   * Analyze source data and log statistics
   */
  private async analyzeSourceData(): Promise<void> {
    await this.logger.log('📊 Analyzing source blog data...', 'INFO');

    const totalPosts = blogPosts.length;
    let totalImages = 0;
    let totalContentLength = 0;
    const categories = new Set<string>();
    const authors = new Set<string>();

    for (const post of blogPosts) {
      // Count images
      const imageUrls = this.imageProcessor.extractImageUrls(post.content, post.featuredImage);
      if (post.author.image) imageUrls.push(post.author.image);
      totalImages += imageUrls.length;

      // Track content length
      totalContentLength += post.content.length;

      // Track categories and authors
      categories.add(post.category);
      authors.add(post.author.name);
    }

    // Update tracking
    this.logger.updateStats({
      totalPosts,
      totalImages
    });
    this.imageProcessor.setTotalImages(totalImages);

    await this.logger.log(`📝 Found ${totalPosts} blog posts to migrate`, 'INFO');
    await this.logger.log(`🖼️  Found ${totalImages} images to process`, 'INFO');
    await this.logger.log(`📁 Found ${categories.size} unique categories`, 'INFO');
    await this.logger.log(`👥 Found ${authors.size} unique authors`, 'INFO');
    await this.logger.log(`📏 Total content length: ${Math.round(totalContentLength / 1024)}KB`, 'INFO');
  }

  /**
   * Execute the main migration process
   */
  private async executeMigration(): Promise<void> {
    this.progressTracker.setCurrentStep('Processing and migrating posts', 0);
    await this.logger.log('🔄 Starting blog post migration...', 'INFO');

    const totalPosts = blogPosts.length;
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const [index, sourcePost] of blogPosts.entries()) {
      try {
        await this.logger.log(`\n📝 Processing post ${index + 1}/${totalPosts}: "${sourcePost.title}"`, 'INFO');
        
        // Transform post data
        const processedPost = this.contentProcessor.transformBlogPost(sourcePost);
        
        // Validate post data
        const validation = this.contentProcessor.validateBlogPost(processedPost);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Process images
        const imageResults = await this.imageProcessor.processPostImages(
          processedPost.content,
          processedPost.featuredImage,
          processedPost.authorImage,
          processedPost.slug
        );

        // Update post with new image URLs
        const finalPost = {
          ...processedPost,
          content: imageResults.updatedContent,
          featuredImage: imageResults.updatedFeaturedImage,
          authorImage: imageResults.updatedAuthorImage
        };

        // Insert into database
        await this.logger.log(`💾 Inserting post into database...`, 'INFO');
        const dbResult = await blogDatabaseService.createPost(finalPost);

        // Record success
        this.results.push({
          success: true,
          postId: dbResult.id,
          originalPostId: sourcePost.id,
          imageResults: imageResults.processedImages
        });

        successCount++;
        await this.logger.log(`✅ Successfully migrated: "${sourcePost.title}" (DB ID: ${dbResult.id})`, 'SUCCESS');

      } catch (error) {
        // Record failure
        this.results.push({
          success: false,
          originalPostId: sourcePost.id,
          imageResults: [],
          error: error instanceof Error ? error.message : String(error)
        });

        failedCount++;
        this.logger.logError({
          type: 'post',
          postId: sourcePost.id,
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date()
        });
      }

      processedCount++;
      
      // Update progress
      const progress = Math.round((processedCount / totalPosts) * 100);
      this.progressTracker.setCurrentStep(`Processing posts (${processedCount}/${totalPosts})`, progress);
      
      // Update stats
      this.logger.updateStats({
        processedPosts: processedCount,
        successfulMigrations: successCount,
        failedMigrations: failedCount,
        processedImages: this.imageProcessor.getProgress().processedImages,
        successfulImageUploads: this.imageProcessor.getProgress().successfulUploads,
        failedImageUploads: this.imageProcessor.getProgress().failedUploads
      });

      // Brief pause to avoid overwhelming services
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.progressTracker.completeStep();
    
    await this.logger.log(`\n📊 Migration processing completed:`, 'INFO');
    await this.logger.log(`✅ Successful: ${successCount}`, 'SUCCESS');
    if (failedCount > 0) {
      await this.logger.log(`❌ Failed: ${failedCount}`, 'ERROR');
    }
  }

  /**
   * Validate the migrated data
   */
  private async validateMigration(): Promise<void> {
    this.progressTracker.setCurrentStep('Validating migrated data', 0);
    await this.logger.log('\n🔍 Validating migrated data...', 'INFO');

    try {
      // Get migrated posts from database
      const dbPosts = await blogDatabaseService.getAllPosts({}, { page: 1, limit: 100 });
      
      // Check post count
      const expectedCount = this.results.filter(r => r.success).length;
      const actualCount = dbPosts.posts.length;
      
      if (actualCount >= expectedCount) {
        await this.logger.log(`✅ Post count validation passed: ${actualCount} posts in database`, 'SUCCESS');
      } else {
        this.logger.logWarning(`Post count mismatch: expected at least ${expectedCount}, found ${actualCount}`);
      }

      // Validate specific posts
      let validatedPosts = 0;
      for (const result of this.results) {
        if (result.success && result.postId) {
          const dbPost = await blogDatabaseService.getPostById(result.postId);
          if (dbPost) {
            validatedPosts++;
            
            // Check if images are accessible
            if (dbPost.featuredImage) {
              try {
                const response = await fetch(dbPost.featuredImage, { method: 'HEAD' });
                if (!response.ok) {
                  this.logger.logWarning(`Featured image not accessible for post ${dbPost.id}: ${dbPost.featuredImage}`);
                }
              } catch (error) {
                this.logger.logWarning(`Failed to check featured image for post ${dbPost.id}: ${error}`);
              }
            }
          } else {
            this.logger.logWarning(`Post ${result.postId} not found in database`);
          }
        }
        
        this.progressTracker.setCurrentStep('Validating posts', Math.round((validatedPosts / this.results.length) * 100));
      }

      await this.logger.log(`✅ Validated ${validatedPosts} posts successfully`, 'SUCCESS');
      this.progressTracker.completeStep();

    } catch (error) {
      this.logger.logError({
        type: 'validation',
        message: `Validation failed: ${error}`,
        timestamp: new Date()
      });
    }
  }

  /**
   * Generate final migration report
   */
  private async generateFinalReport(): Promise<void> {
    this.progressTracker.setCurrentStep('Generating final report', 0);
    await this.logger.log('\n📋 Generating final migration report...', 'INFO');

    // Update backup with migration results
    await this.backupManager.updateBackup(this.backupFile, {
      migratedPostIds: this.results.filter(r => r.success && r.postId).map(r => r.postId!),
      imageMapping: this.results.reduce((acc, result) => {
        result.imageResults.forEach(img => {
          if (img.success) {
            acc[img.originalUrl] = img.newUrl;
          }
        });
        return acc;
      }, {} as Record<string, string>)
    });

    // Generate comprehensive report
    const migrationReport = await this.logger.generateReport();
    const imageReport = this.imageProcessor.generateReport();
    
    const combinedReport = `
${migrationReport}

${imageReport}

🔄 ROLLBACK INFORMATION
   Backup File: ${this.backupFile}
   Migrated Post IDs: ${this.results.filter(r => r.success && r.postId).map(r => r.postId).join(', ')}

📋 NEXT STEPS
   1. Update blog service to use database instead of static data
   2. Test blog functionality with migrated data
   3. Update admin interface if needed
   4. Remove dependency on /src/data/blogData.ts
   5. Monitor image loading and performance

🏁 MIGRATION COMPLETED SUCCESSFULLY!
`;

    console.log(combinedReport);
    
    this.progressTracker.setCurrentStep('Report generation complete', 100);
    this.progressTracker.completeStep();
  }

  /**
   * Clean up temporary resources
   */
  private async cleanup(): Promise<void> {
    this.progressTracker.setCurrentStep('Cleaning up', 0);
    await this.logger.log('🧹 Cleaning up temporary resources...', 'INFO');
    
    try {
      await this.imageProcessor.cleanup();
      await this.logger.log('✅ Cleanup completed successfully', 'SUCCESS');
    } catch (error) {
      await this.logger.log(`⚠️ Warning: Cleanup failed: ${error}`, 'WARN');
    }
    
    this.progressTracker.setCurrentStep('Cleanup complete', 100);
    this.progressTracker.completeStep();
  }

  /**
   * Get migration summary
   */
  getMigrationSummary(): any {
    const stats = this.logger.getStats();
    const imageProgress = this.imageProcessor.getProgress();
    
    return {
      posts: {
        total: stats.totalPosts,
        successful: stats.successfulMigrations,
        failed: stats.failedMigrations
      },
      images: {
        total: stats.totalImages,
        successful: stats.successfulImageUploads,
        failed: stats.failedImageUploads
      },
      duration: stats.endTime ? stats.endTime.getTime() - stats.startTime.getTime() : 0,
      errors: stats.errors.length,
      warnings: stats.warnings.length
    };
  }
}

// Export for use as module
export default BlogMigration;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new BlogMigration();
  
  migration.run()
    .then(() => {
      console.log('\n🏆 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}