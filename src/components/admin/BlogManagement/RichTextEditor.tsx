// Rich Text Editor Component - TinyMCE-based WYSIWYG editor for blog posts

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Eye, 
  Calendar,
  Tag,
  Settings,
  AlertCircle,
  X
} from 'lucide-react';
import { blogService } from '../../../services/blogService';
import { BlogPost } from '../../../data/blogData';
import { ImageUploadModal } from './ImageUploadModal';
import { ScheduleModal } from './ScheduleModal';
import { 
  sanitizeHtml, 
  calculateReadTime, 
  generateSlug,
  generateExcerpt,
  countWords,
  countCharacters 
} from '../../../utils/editorHelpers';
import { 
  estimateStorageUsage
} from '../../../utils/imageCompression';

export interface RichTextFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML content from TinyMCE
  editorType: 'rich';
  featuredImage: string;
  images: string[]; // Array of base64 images
  author: {
    name: string;
    title: string;
    image: string;
  };
  status: 'draft' | 'published' | 'scheduled';
  publishDate: Date;
  scheduledDate?: Date;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  readTime: number;
}

interface RichTextEditorProps {
  post?: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  post,
  onSave,
  onCancel
}) => {
  const editorRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState<RichTextFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    editorType: 'rich',
    featuredImage: '',
    images: [],
    author: {
      name: 'Laurie Meiring',
      title: 'Founder & Digital Marketing Strategist',
      image: '/images/team/laurie-meiring.jpg'
    },
    status: 'draft',
    publishDate: new Date(),
    category: 'Digital Marketing Tips',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    featured: false,
    readTime: 5
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMetaPanel, setShowMetaPanel] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [storageUsage] = useState(estimateStorageUsage());

  const [categories, setCategories] = useState<string[]>([
    'Hospitality Marketing',
    'Tech & AI Marketing', 
    'Content Strategy',
    'Social Media',
    'Email Marketing',
    'SEO & SEM'
  ]);
  const isEditing = !!post;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await blogService.getCategories();
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load post data when editing
  useEffect(() => {
    if (post && post.content) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        editorType: 'rich',
        featuredImage: post.featuredImage,
        images: [], // Initialize empty, will be populated from content
        author: post.author,
        status: post.publishedDate ? 'published' : 'draft',
        publishDate: post.publishedDate ? new Date(post.publishedDate) : new Date(),
        category: post.category,
        tags: Array.isArray(post.tags) ? post.tags : [],
        metaTitle: post.title,
        metaDescription: post.excerpt,
        featured: post.featured,
        readTime: post.readTime
      });
      
      updateWordCount(post.content);
    }
  }, [post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  // Auto-generate meta title if empty
  useEffect(() => {
    if (formData.title && !formData.metaTitle) {
      setFormData(prev => ({ ...prev, metaTitle: formData.title }));
    }
  }, [formData.title, formData.metaTitle]);

  // Update word and character count
  const updateWordCount = useCallback((content: string) => {
    setWordCount(countWords(content));
    setCharCount(countCharacters(content));
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (formData.title && formData.content) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData]);

  const handleAutoSave = async () => {
    if (!formData.title || !formData.content) return;

    try {
      // Auto-save as draft
      const autoSaveData = {
        ...formData,
        status: 'draft' as const,
        excerpt: formData.excerpt || generateExcerpt(formData.content),
        readTime: calculateReadTime(formData.content)
      };

      // Save to localStorage with a special auto-save key
      localStorage.setItem('blog_auto_save', JSON.stringify({
        ...autoSaveData,
        autoSavedAt: new Date().toISOString()
      }));

      setLastSaved(new Date());
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  };

  const handleInputChange = <K extends keyof RichTextFormData>(
    field: K, 
    value: RichTextFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEditorChange = (content: string) => {
    const sanitizedContent = sanitizeHtml(content);
    setFormData(prev => ({ ...prev, content: sanitizedContent }));
    updateWordCount(sanitizedContent);
    
    // Auto-generate excerpt if empty
    if (!formData.excerpt && sanitizedContent) {
      const autoExcerpt = generateExcerpt(sanitizedContent);
      setFormData(prev => ({ ...prev, excerpt: autoExcerpt }));
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

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.metaTitle.trim()) {
      newErrors.metaTitle = 'Meta title is required';
    }

    if (!formData.metaDescription.trim()) {
      newErrors.metaDescription = 'Meta description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled') => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const blogPostData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || generateExcerpt(formData.content),
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        featuredImage: formData.featuredImage,
        featured: formData.featured,
        publishedDate: status === 'published' ? (formData.publishDate.toISOString().split('T')[0] || '') : '',
        author: formData.author,
        readTime: calculateReadTime(formData.content)
      };

      let savedPost: BlogPost;

      if (isEditing && post) {
        savedPost = blogService.updatePost(post.id, blogPostData, status === 'draft') as BlogPost;
      } else {
        savedPost = blogService.createPost(blogPostData, status === 'draft');
      }

      // Clear auto-save data
      localStorage.removeItem('blog_auto_save');
      
      onSave(savedPost);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => (
    <div className="max-w-4xl mx-auto prose prose-lg">
      {formData.featuredImage && (
        <div className="mb-8">
          <img
            src={formData.featuredImage}
            alt={formData.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="mb-6">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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
        <span>{formData.publishDate.toLocaleDateString()}</span>
        <span>•</span>
        <span>{calculateReadTime(formData.content)} min read</span>
      </div>
      
      {formData.excerpt && (
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {formData.excerpt}
        </p>
      )}
      
      <div 
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: formData.content }} 
      />
      
      <div className="flex flex-wrap gap-2 mt-8">
        {(formData.tags || []).map((tag) => (
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

  const tinyMCEConfig = {
    height: 500,
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
    setup: (editor: any) => {
      editorRef.current = editor;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600 mt-2">Rich Text Editor</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMetaPanel(!showMetaPanel)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={16} />
              SEO
            </button>
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <Eye size={16} />
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

        {/* Storage Usage Warning */}
        {storageUsage.percentage > 80 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={16} />
              <span className="font-medium">Storage Warning</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              LocalStorage is {storageUsage.percentage.toFixed(1)}% full. Consider removing unused images.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                {!isPreviewMode ? (
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter post title..."
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <Editor
                          apiKey="no-api-key" // In production, use your TinyMCE API key
                          value={formData.content}
                          onEditorChange={handleEditorChange}
                          init={tinyMCEConfig}
                        />
                      </div>
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                      )}
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Words: {wordCount} | Characters: {charCount}</span>
                        {lastSaved && (
                          <span>Auto-saved: {lastSaved.toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  renderPreview()
                )}
              </div>

              {/* Footer Actions */}
              {!isPreviewMode && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Read time: {calculateReadTime(formData.content)} minutes
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Draft'}
                      </button>
                      
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Calendar size={16} />
                        Schedule
                      </button>
                      
                      <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Publishing...' : (isEditing ? 'Update' : 'Publish')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
              
              <div className="space-y-4">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featuredImage}
                    onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Featured Post */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Post</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Tag size={16} />
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={12} />
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

            {/* Excerpt */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Excerpt</h3>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={4}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                placeholder="Brief description of the post..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/300 characters
              </div>
            </div>
          </div>
        </div>

        {/* SEO Meta Panel */}
        {showMetaPanel && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title *
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  maxLength={60}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    errors.metaTitle ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 characters
                </div>
                {errors.metaTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description *
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  maxLength={160}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg text-sm resize-none ${
                    errors.metaDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </div>
                {errors.metaDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ImageUploadModal
          isOpen={showImageUploadModal}
          onClose={() => setShowImageUploadModal(false)}
          onUpload={(images) => {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...images]
            }));
          }}
        />

        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(date, status) => {
            if (status === 'scheduled') {
              setFormData(prev => ({
                ...prev,
                status: 'scheduled',
                scheduledDate: date
              }));
              handleSave('scheduled');
            } else {
              handleSave('published');
            }
          }}
          currentDate={formData.publishDate}
          currentStatus={formData.status}
        />
      </div>
    </div>
  );
};