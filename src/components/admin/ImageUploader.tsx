import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import imageUploadService, { UploadedImage, UploadProgress } from '../../services/imageUploadService';


interface ImageUploaderProps {
  onUploadComplete?: (images: UploadedImage[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  showPreview?: boolean;
  allowMultiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  className = '',
  showPreview = true,
  allowMultiple = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatFileSize = imageUploadService.formatFileSize;

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!isOnline) {
      const error = 'No internet connection. Please check your network and try again.';
      setErrors([error]);
      onUploadError?.(error);
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    // Validate all files first
    for (const file of fileArray) {
      try {
        imageUploadService.validateFile(file);
        validFiles.push(file);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Invalid file';
        newErrors.push(`${file.name}: ${errorMessage}`);
      }
    }

    // Check file count limit
    if (uploadedImages.length + validFiles.length > maxFiles) {
      newErrors.push(`Cannot upload more than ${maxFiles} files in total.`);
      setErrors(newErrors);
      onUploadError?.(newErrors.join(', '));
      return;
    }

    if (validFiles.length === 0) {
      setErrors(newErrors);
      onUploadError?.(newErrors.join(', '));
      return;
    }

    setErrors(newErrors);
    setIsUploading(true);

    // Upload files with progress tracking
    const uploadPromises = validFiles.map(async (file) => {
      try {
        return await imageUploadService.uploadImage(file, {
          onProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setErrors(prev => [...prev, `${file.name}: ${errorMessage}`]);
        
        // Remove from progress tracking
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
        
        throw error;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<UploadedImage> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        setUploadedImages(prev => [...prev, ...successfulUploads]);
        onUploadComplete?.(successfulUploads);
      }

      const failedUploads = results.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0 && successfulUploads.length === 0) {
        onUploadError?.(newErrors.join(', '));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      // Clear progress after a short delay to show completion
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
    }
  }, [uploadedImages.length, maxFiles, onUploadComplete, onUploadError, isOnline]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={allowMultiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop images here or click to upload
        </p>
        <p className="text-sm text-gray-500">
          Supports JPEG, PNG, WebP, and GIF files up to {formatFileSize(imageConfig.maxSize)}
        </p>
        {allowMultiple && (
          <p className="text-xs text-gray-400 mt-1">
            Maximum {maxFiles} files
          </p>
        )}
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h4 className="font-medium text-red-800">No Internet Connection</h4>
              <p className="text-sm text-red-600 mt-1">
                Please check your network connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-700">Uploading...</h4>
            {isOnline && <Wifi className="h-4 w-4 text-green-500" />}
          </div>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">{fileName}</span>
                <div className="flex items-center gap-2">
                  {progress.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {progress.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-sm ${
                    progress.status === 'error' ? 'text-red-500' : 
                    progress.status === 'completed' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {progress.status === 'error' ? 'Failed' : 
                     progress.status === 'completed' ? 'Complete' : `${progress.progress}%`}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.status === 'error' ? 'bg-red-500' :
                    progress.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              {progress.error && (
                <p className="text-xs text-red-600 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-red-800">Upload Errors</h4>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.publicUrl}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="mt-2 text-xs text-gray-600">
                  <p className="truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className="text-gray-400">
                    {formatFileSize(image.size)}
                  </p>
                </div>
                <div className="flex items-center mt-1 text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Uploaded</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;