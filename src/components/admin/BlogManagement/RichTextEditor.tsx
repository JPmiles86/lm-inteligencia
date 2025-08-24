// DEPRECATED: This TinyMCE-based Rich Text Editor has been removed
// Use EnhancedBlogEditor.tsx instead which uses Quill editor

import React from 'react';

interface RichTextEditorProps {
  [key: string]: any;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = (props) => {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-red-800 font-semibold text-lg mb-2">Component Deprecated</h3>
      <p className="text-red-700 mb-2">
        This TinyMCE-based Rich Text Editor has been removed.
      </p>
      <p className="text-red-700">
        Please use <strong>EnhancedBlogEditor</strong> instead, which uses the Quill editor.
      </p>
    </div>
  );
};

// Export interfaces that might still be used elsewhere
export interface RichTextFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  editorType: 'rich';
  featuredImage: string;
  images: string[];
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