// SEO Fields Component - SEO metadata management for blog posts

import React, { useState } from 'react';
import { SEOFields } from '../../../data/blogData';

interface SEOFieldsProps {
  seoData: SEOFields;
  onSeoDataChange: (seoData: SEOFields) => void;
  errors?: Record<string, string>;
}

export const SEOFieldsComponent: React.FC<SEOFieldsProps> = ({
  seoData,
  onSeoDataChange,
  errors = {}
}) => {
  const [keywordInput, setKeywordInput] = useState('');

  const handleFieldChange = (field: keyof SEOFields, value: string) => {
    onSeoDataChange({
      ...seoData,
      [field]: value || undefined
    });
  };

  const handleKeywordsChange = (keywords: string[]) => {
    onSeoDataChange({
      ...seoData,
      keywords
    });
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords?.includes(keywordInput.trim())) {
      const newKeywords = [...(seoData.keywords || []), keywordInput.trim()];
      handleKeywordsChange(newKeywords);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const newKeywords = (seoData.keywords || []).filter(keyword => keyword !== keywordToRemove);
    handleKeywordsChange(newKeywords);
  };

  const getCharacterCount = (text: string | undefined, max: number) => {
    const count = text?.length || 0;
    const isOverLimit = count > max;
    return (
      <span className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
        {count}/{max} characters
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          SEO Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Optimize your blog post for search engines and social media sharing
        </p>
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <div className="space-y-1">
          <input
            type="text"
            value={seoData.metaTitle || ''}
            onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.metaTitle ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Custom title for search engines (leave empty to use post title)"
            maxLength={60}
          />
          <div className="flex justify-between items-center">
            {getCharacterCount(seoData.metaTitle, 60)}
            {errors.metaTitle && (
              <p className="text-sm text-red-600">{errors.metaTitle}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ideal length: 50-60 characters. This appears as the clickable headline in search results.
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <div className="space-y-1">
          <textarea
            value={seoData.metaDescription || ''}
            onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
            rows={3}
            maxLength={160}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
              errors.metaDescription ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Brief description that appears in search results (leave empty to use excerpt)"
          />
          <div className="flex justify-between items-center">
            {getCharacterCount(seoData.metaDescription, 160)}
            {errors.metaDescription && (
              <p className="text-sm text-red-600">{errors.metaDescription}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ideal length: 150-160 characters. This appears below the title in search results.
        </p>
      </div>

      {/* SEO Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SEO Keywords
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add an SEO keyword..."
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {seoData.keywords && seoData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {seoData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {errors.keywords && (
            <p className="text-sm text-red-600">{errors.keywords}</p>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Focus on 3-5 relevant keywords that accurately describe your content.
        </p>
      </div>

      {/* Open Graph Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social Media Image (Open Graph)
        </label>
        <input
          type="url"
          value={seoData.ogImage || ''}
          onChange={(e) => handleFieldChange('ogImage', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            errors.ogImage ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="URL for social media preview image (leave empty to use featured image)"
        />
        {errors.ogImage && (
          <p className="mt-1 text-sm text-red-600">{errors.ogImage}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Recommended size: 1200×630px. This image appears when your post is shared on social media.
        </p>
        
        {/* Image Preview */}
        {seoData.ogImage && (
          <div className="mt-3">
            <img
              src={seoData.ogImage}
              alt="Open Graph preview"
              className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Canonical URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Canonical URL
        </label>
        <input
          type="url"
          value={seoData.canonicalUrl || ''}
          onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            errors.canonicalUrl ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Canonical URL (leave empty to use post URL)"
        />
        {errors.canonicalUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.canonicalUrl}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Use this if this content is published elsewhere or if you want to specify the preferred URL for search engines.
        </p>
      </div>

      {/* SEO Preview */}
      {(seoData.metaTitle || seoData.metaDescription) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Search Engine Preview
          </h4>
          <div className="space-y-1">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {seoData.metaTitle || 'Your Post Title'}
            </div>
            <div className="text-green-700 text-sm">
              https://inteligencia.com/blog/your-post-slug
            </div>
            <div className="text-gray-600 text-sm">
              {seoData.metaDescription || 'Your post excerpt will appear here...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};