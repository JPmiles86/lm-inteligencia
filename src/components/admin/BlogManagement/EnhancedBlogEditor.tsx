// Enhanced Blog Editor Component - Supports both Rich Text and Block editors

import React, { useState, useEffect } from 'react';
import { blogService, BlogFormData } from '../../../services/blogService';
import { BlogPost } from '../../../data/blogData';
import { BlockEditor } from './BlockEditor';
import { QuillEditor } from './QuillEditor';
import { Block } from './types';
import { createBlock, htmlToBlocks } from './utils/blockHelpers';
import { markdownToHtml, isMarkdown } from '../../../utils/markdownToHtml';

interface EnhancedBlogEditorProps {
  post?: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export const EnhancedBlogEditor: React.FC<EnhancedBlogEditorProps> = ({
  post,
  onSave,
  onCancel
}) => {
  const [editorType, setEditorType] = useState<'rich' | 'block'>('block');
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    blocks: [createBlock('paragraph')],
    editorType: 'block',
    category: 'Digital Marketing Tips',
    tags: [],
    featuredImage: '',
    featured: false,
    publishedDate: new Date().toISOString().split('T')[0] as string,
    author: {
      name: 'Laurie Meiring',
      title: 'Founder & Digital Marketing Strategist',
      image: '/images/team/laurie-meiring.jpg'
    },
    readTime: 5
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const categories = blogService.getCategories();
  const isEditing = !!post;

  // Load post data when editing
  useEffect(() => {
    if (post) {
      // Convert markdown content to HTML if needed
      let processedContent = post.content;
      if (isMarkdown(post.content)) {
        processedContent = markdownToHtml(post.content);
      }

      const initialBlocks = post.blocks && post.blocks.length > 0
        ? post.blocks as Block[]
        : processedContent 
          ? htmlToBlocks(processedContent)
          : [createBlock('paragraph')];

      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: processedContent,
        blocks: initialBlocks,
        editorType: post.editorType || 'rich',
        category: post.category,
        tags: post.tags,
        featuredImage: post.featuredImage,
        featured: post.featured,
        publishedDate: post.publishedDate || new Date().toISOString().split('T')[0] as string,
        author: post.author,
        readTime: post.readTime
      });
      
      setEditorType(post.editorType || 'rich');
    }
  }, [post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const handleInputChange = (field: keyof BlogFormData, value: BlogFormData[keyof BlogFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlocksChange = (blocks: Block[]) => {
    setFormData(prev => ({ 
      ...prev, 
      blocks,
      content: '' // Clear rich text content when using blocks
    }));
  };

  const handleEditorTypeChange = (newType: 'rich' | 'block') => {
    // Preserve content when switching editors
    if (newType !== editorType) {
      let preservedContent = formData.content;
      let preservedBlocks = formData.blocks || [createBlock('paragraph')];

      // If switching from block to rich, convert blocks to HTML
      if (editorType === 'block' && newType === 'rich' && formData.blocks) {
        // Convert blocks to simple HTML for rich text editor
        preservedContent = formData.blocks.map(block => {
          if (block.type === 'paragraph') return `<p>${block.data.text || ''}</p>`;
          if (block.type === 'heading') return `<h${block.data.level || 2}>${block.data.text || ''}</h${block.data.level || 2}>`;
          if (block.type === 'image') return `<img src="${block.data.url || ''}" alt="${block.data.alt || ''}" />`;
          if (block.type === 'quote') return `<blockquote>${block.data.quote || ''}</blockquote>`;
          return '';
        }).join('\n');
      }
      
      // If switching from rich to block, convert HTML to blocks
      if (editorType === 'rich' && newType === 'block' && formData.content) {
        preservedBlocks = htmlToBlocks(formData.content);
      }

      setEditorType(newType);
      setFormData(prev => ({ 
        ...prev, 
        editorType: newType,
        content: preservedContent,
        blocks: preservedBlocks
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = 'Excerpt must be 200 characters or less';
    }

    // Validate content based on editor type
    if (editorType === 'rich') {
      if (!formData.content.trim()) {
        newErrors.content = 'Content is required';
      }
    } else {
      // For block editor, check if there's at least one non-empty block
      const hasContent = formData.blocks && formData.blocks.some(block => {
        if (block.type === 'paragraph' && block.data.text?.trim()) return true;
        if (block.type === 'heading' && block.data.text?.trim()) return true;
        if (block.type === 'image' && block.data.url?.trim()) return true;
        if (block.type === 'list' && block.data.items?.some(item => item.trim())) return true;
        if (block.type === 'quote' && block.data.quote?.trim()) return true;
        if (block.type === 'callout' && (block.data.title?.trim() || block.data.text?.trim())) return true;
        return false;
      });
      
      if (!hasContent) {
        newErrors.content = 'Please add some content blocks';
      }
    }

    if (!formData.featuredImage.trim()) {
      newErrors.featuredImage = 'Featured image URL is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      let savedPost: BlogPost;

      if (isEditing && post) {
        savedPost = blogService.updatePost(post.id, formData, isDraft) as BlogPost;
      } else {
        savedPost = blogService.createPost(formData, isDraft);
      }

      onSave(savedPost);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => (
    <div className="prose prose-lg max-w-none">
      <div className="mb-8">
        <img
          src={formData.featuredImage}
          alt={formData.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      
      <div className="mb-6">
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          {formData.category}
        </span>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {formData.title}
      </h1>
      
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <img
            src={formData.author.image}
            alt={formData.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-medium">{formData.author.name}</div>
            <div className="text-xs">{formData.author.title}</div>
          </div>
        </div>
        <span>•</span>
        <span>{formData.publishedDate}</span>
        <span>•</span>
        <span>{formData.readTime} min read</span>
      </div>
      
      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
        {formData.excerpt}
      </p>
      
      <div className="prose prose-lg max-w-none">
        {editorType === 'rich' ? (
          <div dangerouslySetInnerHTML={{ __html: formData.content }} />
        ) : (
          formData.blocks ? 
            <div dangerouslySetInnerHTML={{ __html: formData.blocks.map(block => 
              // Simple preview rendering
              block.type === 'paragraph' ? `<p>${block.data.text || ''}</p>` :
              block.type === 'heading' ? `<h${block.data.level || 2}>${block.data.text || ''}</h${block.data.level || 2}>` :
              block.type === 'image' ? `<img src="${block.data.url || ''}" alt="${block.data.alt || ''}" class="max-w-full h-auto" />` :
              ''
            ).join('') }} /> : 
            <p className="text-gray-500 italic">No content</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-8">
        {formData.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  const renderMetaFields = () => (
    <div className="space-y-8">
      {/* Title and Slug */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter post title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.slug ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="post-slug"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt * ({formData.excerpt.length}/200)
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          rows={3}
          maxLength={200}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
            errors.excerpt ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Brief description of the post..."
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
        )}
      </div>

      {/* Category and Featured Image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image URL *
          </label>
          <div className="space-y-2">
            <input
              type="url"
              value={formData.featuredImage}
              onChange={(e) => handleInputChange('featuredImage', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.featuredImage ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            <div className="text-center">
              <span className="text-sm text-gray-500">or</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const imageUrl = await handleImageUpload(file);
                      handleInputChange('featuredImage', imageUrl);
                    } catch (error) {
                      alert('Failed to upload image');
                    }
                  }
                }}
                className="hidden"
                id="featured-image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="featured-image-upload"
                className={`cursor-pointer flex flex-col items-center justify-center text-sm text-gray-600 hover:text-gray-800 ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Click to upload featured image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                  </>
                )}
              </label>
            </div>
          </div>
          {errors.featuredImage && (
            <p className="mt-1 text-sm text-red-600">{errors.featuredImage}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags *
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {errors.tags && (
            <p className="text-sm text-red-600">{errors.tags}</p>
          )}
        </div>
      </div>

      {/* Publish Date and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date
          </label>
          <input
            type="date"
            value={formData.publishedDate}
            onChange={(e) => handleInputChange('publishedDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-6 pt-8">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Featured Post</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="space-y-8">
      {/* Editor Type Selector */}
      <div className="border-b border-gray-200 pb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Editor Type
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => handleEditorTypeChange('block')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              editorType === 'block'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🧱 Block Editor
          </button>
          <button
            onClick={() => handleEditorTypeChange('rich')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              editorType === 'rich'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Rich Text Editor
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {editorType === 'block' 
            ? 'Use the modern block-based editor for rich, structured content'
            : 'Use the traditional rich text editor for simple text content'
          }
        </p>
      </div>

      {/* Meta fields */}
      {renderMetaFields()}

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        
        {editorType === 'block' ? (
          <div className={`border rounded-lg ${errors.content ? 'border-red-300' : 'border-gray-300'}`}>
            <BlockEditor
              initialBlocks={formData.blocks || [createBlock('paragraph')]}
              onChange={handleBlocksChange}
              className="min-h-[400px]"
            />
          </div>
        ) : (
          <div className={`${errors.content ? 'ring-2 ring-red-300' : ''} rounded-lg`}>
            <QuillEditor
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Start writing your blog post content here..."
            />
          </div>
        )}
        
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        
        {editorType === 'rich' && (
          <p className="mt-2 text-sm text-gray-600">
            WYSIWYG Rich Text Editor with full formatting toolbar. Use the toolbar buttons to format your content like Microsoft Word.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Update your blog post' : 'Write and publish a new blog post'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-8">
            {isPreviewMode ? renderPreview() : renderEditor()}
          </div>

          {/* Footer Actions */}
          {!isPreviewMode && (
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {isEditing ? 'Last updated: ' + new Date().toLocaleString() : 'Draft will be auto-saved'}
                  <br />
                  <span className="text-xs">
                    Using: {editorType === 'block' ? 'Block Editor' : 'Rich Text Editor'}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Publishing...' : (isEditing ? 'Update Post' : 'Publish Post')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};