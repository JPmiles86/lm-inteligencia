// Google Cloud Storage Utility for Frontend
// Handles image upload to GCS via API endpoints

export interface GCSUploadResponse {
  fileName: string;
  publicUrl: string;
  success: boolean;
  error?: string;
}

export interface GCSConfig {
  bucketName: string;
  cdnBaseUrl: string;
  maxFileSize: number; // in bytes
  allowedTypes: string[];
}

// Configuration with sensible defaults
const GCS_CONFIG: GCSConfig = {
  bucketName: 'laurie-blog-media', // This should match environment variable
  cdnBaseUrl: 'https://storage.googleapis.com/laurie-blog-media', // Direct GCS CDN URL
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
};

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!GCS_CONFIG.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${GCS_CONFIG.allowedTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > GCS_CONFIG.maxFileSize) {
    const maxSizeMB = GCS_CONFIG.maxFileSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB.`
    };
  }

  return { isValid: true };
}

/**
 * Upload image to Google Cloud Storage via API
 */
export async function uploadImageToGCS(file: File): Promise<GCSUploadResponse> {
  try {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return {
        fileName: '',
        publicUrl: '',
        success: false,
        error: validation.error
      };
    }

    // Convert file to base64 for upload
    const base64 = await fileToBase64(file);
    
    // API base URL
    const apiBaseUrl = import.meta.env.NODE_ENV === 'production' 
      ? '/api' 
      : (import.meta.env.VITE_API_BASE_URL || '/api');

    // Upload to GCS via API
    const response = await fetch(`${apiBaseUrl}/upload/gcs-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth headers if available
        ...(localStorage.getItem('admin_token') && {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        })
      },
      body: JSON.stringify({
        image: base64,
        filename: file.name,
        mimetype: file.type
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      fileName: result.fileName || '',
      publicUrl: result.publicUrl || result.url || '',
      success: true
    };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    return {
      fileName: '',
      publicUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Upload image for Quill editor specifically
 */
export async function uploadQuillImageToGCS(file: File): Promise<string> {
  const result = await uploadImageToGCS(file);
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.publicUrl;
}

/**
 * Delete image from Google Cloud Storage
 */
export async function deleteImageFromGCS(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const apiBaseUrl = import.meta.env.NODE_ENV === 'production' 
      ? '/api' 
      : (import.meta.env.VITE_API_BASE_URL || '/api');

    const response = await fetch(`${apiBaseUrl}/upload/gcs-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('admin_token') && {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        })
      },
      body: JSON.stringify({ fileName })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Extract filename from GCS URL
 */
export function extractFileNameFromGCSUrl(url: string): string | null {
  try {
    // Handle different GCS URL formats
    const patterns = [
      /https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)$/,
      /https:\/\/[^\.]+\.storage\.googleapis\.com\/(.+)$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
}

/**
 * Check if URL is a GCS URL
 */
export function isGCSUrl(url: string): boolean {
  return url.includes('storage.googleapis.com') || url.includes('.storage.googleapis.com');
}

/**
 * Generate optimized GCS URL with parameters
 */
export function getOptimizedGCSUrl(url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}): string {
  if (!isGCSUrl(url)) {
    return url;
  }
  
  // Note: For advanced image optimization, you'd typically use Cloud CDN
  // or a service like Imagekit.io in front of GCS
  // For now, we'll return the original URL
  return url;
}

/**
 * Migrate base64 image to GCS
 * Useful for migration scripts
 */
export async function migrateBase64ToGCS(base64Data: string, originalFileName?: string): Promise<GCSUploadResponse> {
  try {
    // Convert base64 to File object
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Generate filename if not provided
    const fileName = originalFileName || `migrated-${Date.now()}.${getExtensionFromBase64(base64Data)}`;
    
    const file = new File([blob], fileName, { type: blob.type });
    
    return await uploadImageToGCS(file);
  } catch (error) {
    console.error('Error migrating base64 to GCS:', error);
    return {
      fileName: '',
      publicUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    };
  }
}

/**
 * Extract file extension from base64 data URL
 */
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

// Performance monitoring helper
export function createGCSPerformanceMonitor() {
  const metrics = {
    uploadTimes: [] as number[],
    uploadSizes: [] as number[],
    successRate: 0,
    totalUploads: 0,
    successfulUploads: 0
  };

  return {
    recordUpload: (startTime: number, endTime: number, fileSize: number, success: boolean) => {
      metrics.uploadTimes.push(endTime - startTime);
      metrics.uploadSizes.push(fileSize);
      metrics.totalUploads++;
      if (success) metrics.successfulUploads++;
      metrics.successRate = (metrics.successfulUploads / metrics.totalUploads) * 100;
    },
    
    getStats: () => ({
      averageUploadTime: metrics.uploadTimes.reduce((a, b) => a + b, 0) / metrics.uploadTimes.length || 0,
      averageFileSize: metrics.uploadSizes.reduce((a, b) => a + b, 0) / metrics.uploadSizes.length || 0,
      successRate: metrics.successRate,
      totalUploads: metrics.totalUploads
    })
  };
}

export default {
  uploadImageToGCS,
  uploadQuillImageToGCS,
  deleteImageFromGCS,
  validateImageFile,
  extractFileNameFromGCSUrl,
  isGCSUrl,
  getOptimizedGCSUrl,
  migrateBase64ToGCS,
  createGCSPerformanceMonitor,
  config: GCS_CONFIG
};