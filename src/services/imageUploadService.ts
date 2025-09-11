import { imageConfig } from '../config/api-config.js';

export interface UploadedImage {
  fileName: string;
  publicUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  timeout?: number;
}

class ImageUploadService {
  /**
   * Upload a single image file
   */
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadedImage> {
    const { onProgress, timeout = 30000 } = options;

    // Validate file
    this.validateFile(file);

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set timeout
      xhr.timeout = timeout;

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress({
            fileName: file.name,
            progress,
            status: 'uploading'
          });
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              onProgress?.({
                fileName: file.name,
                progress: 100,
                status: 'completed'
              });
              resolve(response.data);
            } else {
              const error = response.error || 'Upload failed';
              onProgress?.({
                fileName: file.name,
                progress: 0,
                status: 'error',
                error
              });
              reject(new Error(error));
            }
          } catch (parseError) {
            const error = 'Invalid response from server';
            onProgress?.({
              fileName: file.name,
              progress: 0,
              status: 'error',
              error
            });
            reject(new Error(error));
          }
        } else {
          let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`;
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.error || errorMessage;
          } catch {
            // Use default error message
          }
          
          onProgress?.({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMessage
          });
          reject(new Error(errorMessage));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = 'Network error occurred';
        onProgress?.({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error
        });
        reject(new Error(error));
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        const error = 'Upload timeout - please try again';
        onProgress?.({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error
        });
        reject(new Error(error));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        const error = 'Upload cancelled';
        onProgress?.({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error
        });
        reject(new Error(error));
      });

      // Start upload
      xhr.open('POST', `${imageConfig.uploadUrl}/image`);
      xhr.send(formData);
    });
  }

  /**
   * Upload multiple image files
   */
  async uploadImages(files: File[], options: UploadOptions = {}): Promise<UploadedImage[]> {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadImage(file, options)
    );

    const results = await Promise.allSettled(uploadPromises);
    
    const successfulUploads: UploadedImage[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulUploads.push(result.value);
      } else {
        errors.push(`${files[index].name}: ${result.reason.message}`);
      }
    });

    if (errors.length > 0 && successfulUploads.length === 0) {
      throw new Error(errors.join(', '));
    }

    return successfulUploads;
  }

  /**
   * Upload image for Quill editor (simplified response format)
   */
  async uploadQuillImage(file: File, options: UploadOptions = {}): Promise<string> {
    // Validate file
    this.validateFile(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${imageConfig.uploadUrl}/quill-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.url) {
        return result.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(fileName: string): Promise<void> {
    try {
      const response = await fetch(`${imageConfig.uploadUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete image');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Validate a file before upload
   */
  validateFile(file: File): void {
    // Check file type
    if (!imageConfig.allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type: ${file.type}. Only ${imageConfig.allowedTypes.join(', ')} files are allowed.`
      );
    }

    // Check file size
    if (file.size > imageConfig.maxSize) {
      const maxSizeMB = imageConfig.maxSize / (1024 * 1024);
      const fileSizeMB = file.size / (1024 * 1024);
      throw new Error(
        `File size too large: ${fileSizeMB.toFixed(2)}MB. Maximum size is ${maxSizeMB}MB.`
      );
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file is not an image.');
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if the upload service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${imageConfig.uploadUrl.replace('/upload', '')}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;