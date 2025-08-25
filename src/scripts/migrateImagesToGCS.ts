// Migration script to convert existing base64 images to Google Cloud Storage
// This script will scan existing blog posts and migrate base64 images to GCS

import { blogService } from '../services/blogService';
import { uploadImageToGCS } from '../services/gcsService';

interface MigrationReport {
  totalPosts: number;
  totalImages: number;
  successfulMigrations: number;
  failedMigrations: number;
  skippedImages: number;
  errors: string[];
  migratedImages: Array<{
    postId: number;
    postTitle: string;
    oldUrl: string;
    newUrl: string;
    fileName: string;
  }>;
}

// Helper function to check if URL is base64
function isBase64Image(url: string): boolean {
  return url.startsWith('data:image/');
}

// Helper function to extract images from HTML content
function extractImagesFromContent(content: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (isBase64Image(src)) {
      images.push(src);
    }
  }
  
  return images;
}

// Convert base64 to File object
async function base64ToFile(base64: string, filename: string): Promise<File> {
  const response = await fetch(base64);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

// Extract file extension from base64 data URL
function getExtensionFromBase64(base64: string): string {
  const mimeType = base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return extensions[mimeType] || 'jpg';
}

// Main migration function
export async function migrateImagesToGCS(dryRun: boolean = true): Promise<MigrationReport> {
  const report: MigrationReport = {
    totalPosts: 0,
    totalImages: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    skippedImages: 0,
    errors: [],
    migratedImages: []
  };

  console.log(`🚀 Starting image migration to GCS ${dryRun ? '(DRY RUN)' : '(LIVE)'}`);

  try {
    // Check GCS configuration
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('GCS not configured. Please set GCS_PROJECT_ID, GCS_BUCKET_NAME, and GOOGLE_APPLICATION_CREDENTIALS environment variables.');
    }

    // Get all blog posts
    console.log('📖 Fetching all blog posts...');
    const postsResponse = await blogService.getAllPosts({ limit: 1000 }); // Get all posts
    const posts = postsResponse.posts;
    
    report.totalPosts = posts.length;
    console.log(`Found ${posts.length} blog posts to analyze`);

    // Process each post
    for (const post of posts) {
      console.log(`\n📝 Processing post: "${post.title}" (ID: ${post.id})`);
      
      let updatedContent = post.content;
      let updatedFeaturedImage = post.featuredImage;
      let hasChanges = false;

      // Check featured image
      if (post.featuredImage && isBase64Image(post.featuredImage)) {
        console.log('  🖼️  Found base64 featured image');
        report.totalImages++;

        if (!dryRun) {
          try {
            const extension = getExtensionFromBase64(post.featuredImage);
            const filename = `featured-${post.id}-${Date.now()}.${extension}`;
            const file = await base64ToFile(post.featuredImage, filename);
            
            // Convert base64 to buffer for GCS upload
            const base64Data = post.featuredImage.replace(/^data:image\/[a-z]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            const result = await uploadImageToGCS(buffer, filename, file.type);
            
            updatedFeaturedImage = result.publicUrl;
            hasChanges = true;
            report.successfulMigrations++;
            
            report.migratedImages.push({
              postId: post.id,
              postTitle: post.title,
              oldUrl: post.featuredImage.substring(0, 50) + '...',
              newUrl: result.publicUrl,
              fileName: result.fileName
            });
            
            console.log(`    ✅ Migrated featured image to: ${result.publicUrl}`);
          } catch (error) {
            console.error(`    ❌ Failed to migrate featured image:`, error);
            report.failedMigrations++;
            report.errors.push(`Post ${post.id}: Featured image migration failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          console.log('    🔍 Would migrate featured image (dry run)');
          report.successfulMigrations++; // Count as would-be success for dry run
        }
      }

      // Check content images
      const contentImages = extractImagesFromContent(post.content);
      if (contentImages.length > 0) {
        console.log(`  📷 Found ${contentImages.length} base64 images in content`);
        report.totalImages += contentImages.length;

        for (let i = 0; i < contentImages.length; i++) {
          const imageUrl = contentImages[i];
          
          if (!dryRun) {
            try {
              const extension = getExtensionFromBase64(imageUrl);
              const filename = `content-${post.id}-${i}-${Date.now()}.${extension}`;
              const file = await base64ToFile(imageUrl, filename);
              
              // Convert base64 to buffer for GCS upload
              const base64Data = imageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              
              const result = await uploadImageToGCS(buffer, filename, file.type);
              
              // Replace the image URL in content
              updatedContent = updatedContent.replace(imageUrl, result.publicUrl);
              hasChanges = true;
              report.successfulMigrations++;
              
              report.migratedImages.push({
                postId: post.id,
                postTitle: post.title,
                oldUrl: imageUrl.substring(0, 50) + '...',
                newUrl: result.publicUrl,
                fileName: result.fileName
              });
              
              console.log(`    ✅ Migrated content image ${i + 1} to: ${result.publicUrl}`);
            } catch (error) {
              console.error(`    ❌ Failed to migrate content image ${i + 1}:`, error);
              report.failedMigrations++;
              report.errors.push(`Post ${post.id}: Content image ${i + 1} migration failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          } else {
            console.log(`    🔍 Would migrate content image ${i + 1} (dry run)`);
            report.successfulMigrations++; // Count as would-be success for dry run
          }
        }
      }

      // Update the post if changes were made
      if (hasChanges && !dryRun) {
        try {
          console.log('  💾 Updating post with new image URLs...');
          await blogService.updatePost(post.id, {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: updatedContent,
            category: post.category,
            tags: post.tags || [],
            featuredImage: updatedFeaturedImage,
            featured: post.featured,
            publishedDate: post.publishedDate || new Date().toISOString().split('T')[0],
            author: post.author,
            readTime: post.readTime || 5
          });
          console.log('    ✅ Post updated successfully');
        } catch (error) {
          console.error('    ❌ Failed to update post:', error);
          report.errors.push(`Post ${post.id}: Failed to update post after migration - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    report.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }

  // Print summary
  console.log('\n📊 MIGRATION SUMMARY');
  console.log('====================');
  console.log(`Total posts analyzed: ${report.totalPosts}`);
  console.log(`Total images found: ${report.totalImages}`);
  console.log(`Successful migrations: ${report.successfulMigrations}`);
  console.log(`Failed migrations: ${report.failedMigrations}`);
  console.log(`Success rate: ${report.totalImages > 0 ? ((report.successfulMigrations / report.totalImages) * 100).toFixed(1) : 0}%`);
  
  if (report.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    report.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (report.migratedImages.length > 0 && !dryRun) {
    console.log('\n✅ MIGRATED IMAGES:');
    report.migratedImages.forEach(img => {
      console.log(`  - Post ${img.postId} (${img.postTitle}): ${img.fileName} -> ${img.newUrl}`);
    });
  }
  
  if (dryRun) {
    console.log('\n🔍 This was a dry run. No actual changes were made.');
    console.log('Run with dryRun=false to perform the actual migration.');
  }

  return report;
}

// CLI interface when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run');
  const live = process.argv.includes('--live');
  
  if (!dryRun && !live) {
    console.log('Usage: tsx migrateImagesToGCS.ts [--dry-run|--live]');
    console.log('  --dry-run: Analyze what would be migrated without making changes');
    console.log('  --live: Perform the actual migration');
    process.exit(1);
  }
  
  migrateImagesToGCS(dryRun)
    .then((report) => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export default migrateImagesToGCS;