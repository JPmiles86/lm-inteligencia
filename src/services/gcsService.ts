import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'laurie-blog-media';
const bucket = storage.bucket(bucketName);

/**
 * Upload a file to Google Cloud Storage
 * @param file - The file buffer to upload
 * @param originalName - Original name of the file
 * @param mimeType - MIME type of the file
 * @returns Promise<{fileName: string, publicUrl: string}>
 */
export async function uploadImageToGCS(
  file: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ fileName: string; publicUrl: string }> {
  try {
    // Generate secure filename
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileName = `images/${timestamp}-${randomString}.${fileExtension}`;

    // Create a file reference in the bucket
    const gcsFile = bucket.file(fileName);

    // Upload the file
    await gcsFile.save(file, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
      public: true, // Make the file publicly accessible
    });

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return {
      fileName,
      publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error(`Failed to upload image to Google Cloud Storage: ${error}`);
  }
}

/**
 * Delete a file from Google Cloud Storage
 * @param fileName - Name of the file to delete
 * @returns Promise<boolean>
 */
export async function deleteImageFromGCS(fileName: string): Promise<boolean> {
  try {
    const file = bucket.file(fileName);
    await file.delete();
    return true;
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    throw new Error(`Failed to delete image from Google Cloud Storage: ${error}`);
  }
}

/**
 * Generate a signed URL for uploading directly to GCS
 * @param fileName - Name of the file
 * @param contentType - MIME type of the file
 * @returns Promise<string>
 */
export async function generateSignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    };

    const [url] = await bucket.file(fileName).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed upload URL: ${error}`);
  }
}

/**
 * Check if a file exists in the bucket
 * @param fileName - Name of the file to check
 * @returns Promise<boolean>
 */
export async function fileExists(fileName: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(fileName).exists();
    return exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Get file metadata from GCS
 * @param fileName - Name of the file
 * @returns Promise<any>
 */
export async function getFileMetadata(fileName: string): Promise<any> {
  try {
    const [metadata] = await bucket.file(fileName).getMetadata();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error}`);
  }
}

/**
 * List all files in the bucket with optional prefix
 * @param prefix - Optional prefix to filter files
 * @returns Promise<string[]>
 */
export async function listFiles(prefix?: string): Promise<string[]> {
  try {
    const options = prefix ? { prefix } : {};
    const [files] = await bucket.getFiles(options);
    return files.map(file => file.name);
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error}`);
  }
}

/**
 * Generate public URL for a file
 * @param fileName - Name of the file
 * @returns string
 */
export function getPublicUrl(fileName: string): string {
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

/**
 * Validate image file type and size
 * @param file - File to validate
 * @param maxSizeBytes - Maximum file size in bytes (default: 10MB)
 * @returns Promise<{isValid: boolean, error?: string}>
 */
export function validateImageFile(
  file: Express.Multer.File,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB
): { isValid: boolean; error?: string } {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  // Check file type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.'
    };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${maxSizeBytes / (1024 * 1024)}MB.`
    };
  }

  return { isValid: true };
}

export default {
  uploadImageToGCS,
  deleteImageFromGCS,
  generateSignedUploadUrl,
  fileExists,
  getFileMetadata,
  listFiles,
  getPublicUrl,
  validateImageFile,
};