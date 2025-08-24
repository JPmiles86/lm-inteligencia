// Quill Rich Text Editor Component - Alternative to TinyMCE
import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogService } from '../../../services/blogService';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your content here...',
  onImageUpload
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // Add click handler for images to allow resizing
  React.useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.ql-editor')) {
        const currentWidth = target.style.width || 'auto';
        const sizes = ['auto', '300px', '450px', '600px', '100%'];
        const currentIndex = sizes.indexOf(currentWidth);
        const nextIndex = (currentIndex + 1) % sizes.length;
        target.style.width = sizes[nextIndex];
        target.style.maxWidth = sizes[nextIndex] === '100%' ? '100%' : sizes[nextIndex];
        
        // Show size indicator
        const indicator = document.createElement('div');
        indicator.textContent = `Size: ${sizes[nextIndex]}`;
        indicator.style.cssText = `
          position: fixed;
          top: 80px;
          right: 20px;
          background: #9333ea;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          z-index: 1000;
        `;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 1500);
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => document.removeEventListener('click', handleImageClick);
  }, []);

  // Sticky toolbar implementation
  React.useEffect(() => {
    const handleStickyToolbar = () => {
      const toolbar = document.querySelector('.ql-toolbar') as HTMLElement;
      const editor = document.querySelector('.ql-editor') as HTMLElement;
      const adminHeader = document.querySelector('header') as HTMLElement;
      
      if (!toolbar || !editor) return;
      
      // Get admin header height (typically 72-80px with py-4)
      const headerHeight = adminHeader ? adminHeader.offsetHeight : 72;
      
      // Get the original position of the toolbar
      const toolbarRect = toolbar.getBoundingClientRect();
      const editorRect = editor.getBoundingClientRect();
      
      // Check if we need to make it sticky - account for admin header
      if (window.scrollY > 0 && editorRect.top < headerHeight && editorRect.bottom > (headerHeight + 100)) {
        toolbar.style.position = 'fixed';
        toolbar.style.top = `${headerHeight}px`; // Position below admin header
        toolbar.style.left = `${toolbarRect.left}px`;
        toolbar.style.width = `${toolbarRect.width}px`;
        toolbar.style.zIndex = '30'; // Below admin header z-40
        toolbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        
        // Add padding to prevent content jump
        const placeholder = document.getElementById('toolbar-placeholder');
        if (!placeholder) {
          const div = document.createElement('div');
          div.id = 'toolbar-placeholder';
          div.style.height = `${toolbar.offsetHeight}px`;
          toolbar.parentElement?.insertBefore(div, toolbar);
        }
      } else {
        toolbar.style.position = '';
        toolbar.style.top = '';
        toolbar.style.left = '';
        toolbar.style.width = '';
        toolbar.style.boxShadow = '';
        
        // Remove placeholder
        const placeholder = document.getElementById('toolbar-placeholder');
        if (placeholder) {
          placeholder.remove();
        }
      }
    };
    
    // Initial check
    setTimeout(handleStickyToolbar, 100);
    
    // Add scroll listener
    window.addEventListener('scroll', handleStickyToolbar);
    window.addEventListener('resize', handleStickyToolbar);
    
    return () => {
      window.removeEventListener('scroll', handleStickyToolbar);
      window.removeEventListener('resize', handleStickyToolbar);
      // Clean up placeholder on unmount
      const placeholder = document.getElementById('toolbar-placeholder');
      if (placeholder) {
        placeholder.remove();
      }
    };
  }, []);

  // Custom image handler for uploading to GCS
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        // Basic file validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('File size too large. Maximum size is 10MB.');
        }
        
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed.');
        }

        // Show loading state
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection();
        if (!range) return;

        // Insert temporary placeholder
        quill.insertText(range.index, 'Uploading image...', 'user');

        // Upload using the provided upload function or fallback to service
        const imageUrl = onImageUpload 
          ? await onImageUpload(file)
          : await blogService.uploadQuillImage(file);
        
        // Remove placeholder text
        quill.deleteText(range.index, 'Uploading image...'.length);
        
        // Insert the uploaded image
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');
        quill.setSelection(range.index + 1, 0);

      } catch (error) {
        console.error('Image upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        alert(errorMessage);
        
        // Remove placeholder text on error
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          if (range) {
            quill.deleteText(range.index, 'Uploading image...'.length);
          }
        }
      }
    };
  };

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        
        ['clean'] // remove formatting button
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false // Preserve formatting when pasting
    }
  }), []);

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div className="quill-editor-wrapper">
      <style>{`
        .quill-editor-wrapper .ql-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px;
          min-height: 400px;
        }
        
        .quill-editor-wrapper .ql-editor {
          min-height: 400px;
          line-height: 1.6;
        }
        
        .quill-editor-wrapper {
          position: relative;
        }
        
        /* Enhanced sticky toolbar styles */
        .quill-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: rgb(255 255 255 / var(--tw-bg-opacity, 1));
          border-color: #e5e7eb;
          border-bottom: 1px solid #ccc;
          transition: box-shadow 0.2s ease;
        }
        
        /* When toolbar becomes fixed via JS */
        .quill-editor-wrapper .ql-toolbar[style*="position: fixed"] {
          border-radius: 0;
          border-bottom: 2px solid #e5e7eb;
        }
        
        #toolbar-placeholder {
          display: block;
        }
        
        .quill-editor-wrapper .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #e5e7eb;
        }
        
        .quill-editor-wrapper .ql-editor p {
          margin-bottom: 1em;
        }
        
        .quill-editor-wrapper .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        
        .quill-editor-wrapper .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        
        .quill-editor-wrapper .ql-editor h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        
        .quill-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #9333ea;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }
        
        .quill-editor-wrapper .ql-editor pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .quill-editor-wrapper .ql-editor img {
          max-width: 600px;
          width: auto;
          height: auto;
          display: block;
          margin: 1em auto;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s;
        }
        
        .quill-editor-wrapper .ql-editor img:hover {
          border-color: #9333ea;
        }
        
        /* Responsive image sizes */
        @media (max-width: 768px) {
          .quill-editor-wrapper .ql-editor img {
            max-width: 100%;
          }
        }
        
        /* Custom purple/pink theme for toolbar buttons */
        .quill-editor-wrapper .ql-toolbar button:hover,
        .quill-editor-wrapper .ql-toolbar button.ql-active,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label.ql-active {
          color: #9333ea;
        }
        
        .quill-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .quill-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #9333ea;
        }
        
        .quill-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .quill-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #9333ea;
        }
        
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};