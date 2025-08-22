// Blog Editor Component - Multi-editor support for creating and editing blog posts

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { blogService, BlogFormData } from '../../../services/blogService';
import { BlogPost } from '../../../data/blogData';
import { RichTextEditor } from './RichTextEditor';
import { ImageUploader } from '../ImageUploader';

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({
  post,
  onSave,
  onCancel
}) => {
  const editorRef = useRef<any>(null);
  const [editorType, setEditorType] = useState<'rich' | 'block'>('rich');
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
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
  const [showSwitchConfirmation, setShowSwitchConfirmation] = useState(false);
  const [pendingEditorType, setPendingEditorType] = useState<'rich' | 'block'>('rich');

  const categories = blogService.getCategories();
  const isEditing = !!post;

  // Load post data when editing
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        featuredImage: post.featuredImage,
        featured: post.featured,
        publishedDate: post.publishedDate || new Date().toISOString().split('T')[0] as string,
        author: post.author,
        readTime: post.readTime
      });
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

  const handleEditorSwitch = (newEditorType: 'rich' | 'block') => {
    if (newEditorType === editorType) return;
    
    // If there's content, show confirmation dialog
    if (formData.content.trim()) {
      setPendingEditorType(newEditorType);
      setShowSwitchConfirmation(true);
    } else {
      // No content to lose, switch immediately
      setEditorType(newEditorType);
    }
  };

  const confirmEditorSwitch = () => {
    // Auto-save current content before switching
    if (formData.title && formData.content) {
      const autoSaveData = {
        ...formData,
        editorType: editorType,
        autoSavedAt: new Date().toISOString()
      };
      localStorage.setItem(`blog_editor_backup_${editorType}`, JSON.stringify(autoSaveData));
    }
    
    // Switch to new editor type
    setEditorType(pendingEditorType);
    setShowSwitchConfirmation(false);
  };

  const cancelEditorSwitch = () => {
    setShowSwitchConfirmation(false);
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

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
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
      
      <div className="whitespace-pre-wrap">
        {formData.content}
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

  const renderEditor = () => (
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

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        {editorType === 'rich' ? (
          <div>
            <div className={`border rounded-lg overflow-hidden ${errors.content ? 'border-red-300' : 'border-gray-300'}`}>
              <Editor
                apiKey="no-api-key" // In production, use your TinyMCE API key
                onInit={(evt, editor) => editorRef.current = editor}
                value={formData.content}
                onEditorChange={(content) => handleInputChange('content', content)}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'wordcount', 'emoticons', 'template',
                    'codesample', 'quickbars'
                  ],
                  toolbar: [
                    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
                    'alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist checklist',
                    'forecolor backcolor | link image media table | emoticons charmap | code preview fullscreen'
                  ].join(' | '),
                  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                  quickbars_insert_toolbar: 'quickimage quicktable',
                  contextmenu: 'link image table',
                  skin: 'oxide',
                  content_css: 'default',
                  branding: false,
                  promotion: false,
                  placeholder: 'Start writing your blog post content here...',
                }}
              />
            </div>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              Rich text WYSIWYG editor with full formatting toolbar. Use the toolbar buttons to format your content like Microsoft Word.
            </p>
          </div>
        ) : (
          <div>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={20}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Write your blog post content here... You can use Markdown formatting."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              Block editor mode. Use the plus button to add blocks or type "/" for quick commands.
            </p>
          </div>
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
            Featured Image *
          </label>
          
          {/* Current featured image preview */}
          {formData.featuredImage && (
            <div className="mb-4">
              <img
                src={formData.featuredImage}
                alt="Featured image preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleInputChange('featuredImage', '')}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove featured image
              </button>
            </div>
          )}
          
          {/* Image uploader */}
          <div className={errors.featuredImage ? 'border border-red-300 rounded-lg p-4' : ''}>
            <ImageUploader
              onUploadComplete={(images) => {
                if (images.length > 0) {
                  handleInputChange('featuredImage', images[0].publicUrl);
                }
              }}
              onUploadError={(error) => {
                console.error('Featured image upload error:', error);
                alert('Failed to upload featured image: ' + error);
              }}
              maxFiles={1}
              allowMultiple={false}
              showPreview={false}
              className="mb-4"
            />
          </div>
          
          {/* Manual URL input as fallback */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Or enter image URL manually:
            </label>
            <input
              type="url"
              value={formData.featuredImage}
              onChange={(e) => handleInputChange('featuredImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              placeholder="https://example.com/image.jpg"
            />
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
            {/* Editor Type Selection */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleEditorSwitch('rich')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  editorType === 'rich'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rich Text
              </button>
              <button
                onClick={() => handleEditorSwitch('block')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  editorType === 'block'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Block Editor
              </button>
            </div>

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
            {isPreviewMode ? renderPreview() : (
              editorType === 'rich' ? (
                <RichTextEditor
                  post={post}
                  onSave={onSave}
                  onCancel={onCancel}
                />
              ) : renderEditor()
            )}
          </div>

          {/* Footer Actions */}
          {!isPreviewMode && (
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {isEditing ? 'Last updated: ' + new Date().toLocaleString() : 'Draft will be auto-saved'}
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

      {/* Editor Switch Confirmation Modal */}
      {showSwitchConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Switch Editor Type?</h3>
                <p className="text-sm text-gray-600">You have unsaved content</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Switching to the {pendingEditorType === 'rich' ? 'Rich Text' : 'Block'} editor will preserve your current content. 
              Your work will be automatically backed up before switching.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelEditorSwitch}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditorSwitch}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                Switch Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};