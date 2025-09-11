// Image Upload Modal - Handle image uploads with drag & drop and compression

import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, AlertCircle, Check } from 'lucide-react';
import { 
  compressImage, 
  validateImageFile, 
  estimateStorageUsage
} from '../../../utils/imageCompression.js';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (images: string[]) => void;
  maxImages?: number;
}

interface UploadedImage {
  id: string;
  base64: string;
  name: string;
  size: number;
  compressedSize: number;
  width: number;
  height: number;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  maxImages = 10
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (uploadedImages.length + files.length > maxImages) {
      setErrors([`Maximum ${maxImages} images allowed`]);
      return;
    }

    setUploading(true);
    setErrors([]);

    const newImages: UploadedImage[] = [];
    const newErrors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          newErrors.push(`${file.name}: ${validation.error}`);
          continue;
        }

        // Check storage space
        const storageUsage = estimateStorageUsage();
        if (storageUsage.percentage > 90) {
          newErrors.push('Storage is nearly full. Please remove some images first.');
          break;
        }

        const compressed = await compressImage(file, 1200, 0.8);
        
        newImages.push({
          id: Date.now().toString() + Math.random(),
          base64: compressed.base64,
          name: file.name,
          size: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          width: compressed.width,
          height: compressed.height
        });
      } catch (error) {
        console.error('Error processing image:', error);
        newErrors.push(`Failed to process ${file.name}`);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpload = () => {
    if (uploadedImages.length === 0) {
      setErrors(['Please select at least one image']);
      return;
    }

    const imageBase64s = uploadedImages.map(img => img.base64);
    onUpload(imageBase64s);
    onClose();
    
    // Reset state
    setUploadedImages([]);
    setErrors([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = uploadedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const storageUsage = estimateStorageUsage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Images</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload and manage images for your blog post
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Storage Warning */}
        {storageUsage.percentage > 70 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={16} />
              <span className="font-medium">Storage Warning</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              LocalStorage is {storageUsage.percentage.toFixed(1)}% full 
              ({formatFileSize(storageUsage.used)}/{formatFileSize(storageUsage.total)})
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop images here, or click to select
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Supports JPG, PNG, GIF, WebP (max 10MB each)
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Processing...' : 'Select Images'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle size={16} />
                <span className="font-medium">Upload Errors</span>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Uploaded Images ({uploadedImages.length})
                </h3>
                <div className="text-sm text-gray-600">
                  Total size: {formatFileSize(totalSize)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  >
                    <div className="relative">
                      <img
                        src={image.base64}
                        alt={image.name}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-900 truncate" title={image.name}>
                        {image.name}
                      </p>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        <div>{image.width} × {image.height}px</div>
                        <div>
                          {formatFileSize(image.size)} → {formatFileSize(image.compressedSize)}
                          {image.compressedSize < image.size && (
                            <span className="text-green-600 ml-1">
                              ({Math.round((1 - image.compressedSize / image.size) * 100)}% saved)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {uploadedImages.length} image(s) selected
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleUpload}
                disabled={uploadedImages.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Check size={16} />
                Upload Images
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};