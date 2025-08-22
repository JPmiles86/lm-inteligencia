#!/usr/bin/env node

// Test Migration Script - Dry run without actual GCS upload or database insertion
// Analyzes blog data and simulates migration process

import { blogPosts } from '../data/blogData.js';
import ContentProcessor from './contentProcessor.js';
import { MigrationLogger } from './migrationUtils.js';

interface TestMigrationResult {
  postId: number;
  title: string;
  extractedImages: string[];
  processedPost: any;
  validation: any;
}

class TestMigration {
  private logger: MigrationLogger;
  private contentProcessor: ContentProcessor;
  private results: TestMigrationResult[] = [];

  constructor() {
    this.logger = new MigrationLogger('./test-migration-logs');
    this.contentProcessor = new ContentProcessor();
  }

  async run(): Promise<void> {
    try {
      await this.initialize();
      await this.analyzePosts();
      await this.generateReport();
      
      console.log('\n🎉 Test migration completed successfully!');
      
    } catch (error) {
      await this.logger.log(`💥 Test migration failed: ${error}`, 'ERROR');
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    console.log('🔬 Initializing test migration...\n');
    await this.logger.init();
    await this.logger.log('🧪 Starting test migration analysis', 'INFO');
  }

  private async analyzePosts(): Promise<void> {
    await this.logger.log('📊 Analyzing blog posts...', 'INFO');

    const totalPosts = blogPosts.length;
    let totalImages = 0;
    const categories = new Set<string>();
    const authors = new Set<string>();

    for (const [index, sourcePost] of blogPosts.entries()) {
      console.log(`\n📝 Analyzing post ${index + 1}/${totalPosts}: "${sourcePost.title}"`);
      
      // Extract images
      const extractedImages = this.extractAllImages(sourcePost);
      totalImages += extractedImages.length;

      // Transform post
      const processedPost = this.contentProcessor.transformBlogPost(sourcePost);
      
      // Validate post
      const validation = this.contentProcessor.validateBlogPost(processedPost);

      // Track categories and authors
      categories.add(sourcePost.category);
      authors.add(sourcePost.author.name);

      // Store result
      this.results.push({
        postId: sourcePost.id,
        title: sourcePost.title,
        extractedImages,
        processedPost,
        validation
      });

      await this.logger.log(`✅ Analyzed: "${sourcePost.title}" - ${extractedImages.length} images`, 'SUCCESS');
    }

    // Log summary
    await this.logger.log(`📝 Total posts analyzed: ${totalPosts}`, 'INFO');
    await this.logger.log(`🖼️ Total images found: ${totalImages}`, 'INFO');
    await this.logger.log(`📁 Unique categories: ${categories.size}`, 'INFO');
    await this.logger.log(`👥 Unique authors: ${authors.size}`, 'INFO');

    // Log categories
    await this.logger.log(`Categories: ${Array.from(categories).join(', ')}`, 'INFO');
    
    // Log authors
    await this.logger.log(`Authors: ${Array.from(authors).join(', ')}`, 'INFO');
  }

  private extractAllImages(post: any): string[] {
    const images = new Set<string>();
    
    // Featured image
    if (post.featuredImage) {
      images.add(post.featuredImage);
    }
    
    // Author image
    if (post.author?.image) {
      images.add(post.author.image);
    }
    
    // Content images
    const content = post.content || '';
    
    // Markdown images
    const markdownRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = markdownRegex.exec(content)) !== null) {
      images.add(match[1]);
    }
    
    // HTML images
    const htmlRegex = /<img[^>]+src=['""]([^'""]+)['""][^>]*>/g;
    while ((match = htmlRegex.exec(content)) !== null) {
      images.add(match[1]);
    }
    
    return Array.from(images);
  }

  private async generateReport(): Promise<void> {
    await this.logger.log('\n📋 Generating test migration report...', 'INFO');

    const totalPosts = this.results.length;
    const totalImages = this.results.reduce((sum, result) => sum + result.extractedImages.length, 0);
    const validPosts = this.results.filter(r => r.validation.isValid).length;
    const invalidPosts = totalPosts - validPosts;

    // Image analysis
    const imagesByType = this.analyzeImageTypes();
    const validationErrors = this.results
      .filter(r => !r.validation.isValid)
      .map(r => ({ post: r.title, errors: r.validation.errors }));

    const report = `
╔══════════════════════════════════════════════════════════════════════╗
║                        TEST MIGRATION REPORT                        ║
╚══════════════════════════════════════════════════════════════════════╝

📊 BLOG POSTS ANALYSIS
   Total Posts: ${totalPosts}
   Valid Posts: ${validPosts}
   Invalid Posts: ${invalidPosts}
   Success Rate: ${((validPosts / totalPosts) * 100).toFixed(1)}%

🖼️ IMAGES ANALYSIS
   Total Images: ${totalImages}
   Featured Images: ${imagesByType.featured}
   Author Images: ${imagesByType.author}
   Content Images: ${imagesByType.content}
   
   Image Sources:
   - Unsplash: ${imagesByType.unsplash}
   - Picsum: ${imagesByType.picsum}
   - Other: ${imagesByType.other}

📝 POST BREAKDOWN
${this.results.map((result, index) => `
   ${index + 1}. "${result.title}"
      - Images: ${result.extractedImages.length}
      - Valid: ${result.validation.isValid ? '✅' : '❌'}
      - Category: ${result.processedPost.category}
      - Tags: ${result.processedPost.tags.join(', ')}
      - Author: ${result.processedPost.authorName}
      - Read Time: ${result.processedPost.readTime} min
      ${!result.validation.isValid ? `- Errors: ${result.validation.errors.join(', ')}` : ''}`).join('')}

${invalidPosts > 0 ? `
🚨 VALIDATION ERRORS
${validationErrors.map(error => `   "${error.post}": ${error.errors.join(', ')}`).join('\n')}
` : '✅ All posts passed validation!'}

🔧 MIGRATION PLAN
   1. Download ${totalImages} images from external sources
   2. Upload images to Google Cloud Storage
   3. Update ${totalPosts} posts with new image URLs
   4. Insert posts into PostgreSQL database
   5. Validate data integrity

📋 ESTIMATED MIGRATION TIME
   Image Downloads: ~${Math.ceil(totalImages * 2)} seconds
   GCS Uploads: ~${Math.ceil(totalImages * 3)} seconds
   Database Inserts: ~${Math.ceil(totalPosts * 1)} seconds
   Total Estimated: ~${Math.ceil((totalImages * 5 + totalPosts) / 60)} minutes

🎯 READY FOR MIGRATION
   ${invalidPosts === 0 ? '🟢 All systems ready - migration can proceed' : '🟡 Fix validation errors before proceeding'}
`;

    console.log(report);
    await this.logger.log('📊 Test migration analysis completed', 'SUCCESS');
  }

  private analyzeImageTypes(): any {
    const analysis = {
      featured: 0,
      author: 0,
      content: 0,
      unsplash: 0,
      picsum: 0,
      other: 0
    };

    for (const result of this.results) {
      for (const imageUrl of result.extractedImages) {
        // Count by usage type
        if (imageUrl === result.processedPost.featuredImage) {
          analysis.featured++;
        } else if (imageUrl === result.processedPost.authorImage) {
          analysis.author++;
        } else {
          analysis.content++;
        }

        // Count by source
        if (imageUrl.includes('unsplash.com')) {
          analysis.unsplash++;
        } else if (imageUrl.includes('picsum.photos')) {
          analysis.picsum++;
        } else {
          analysis.other++;
        }
      }
    }

    return analysis;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const testMigration = new TestMigration();
  
  testMigration.run()
    .then(() => {
      console.log('\n🏆 Test migration analysis completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test migration failed:', error);
      process.exit(1);
    });
}

export default TestMigration;