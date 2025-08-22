// Quill Rich Text Editor Component - Alternative to TinyMCE
import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your content here...'
}) => {
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
      ]
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
        
        .quill-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
          border-color: #e5e7eb;
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
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em auto;
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