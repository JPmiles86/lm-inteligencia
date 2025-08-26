// Content Editor - Rich text editor with AI assistance for content generation
// Integrates with Quill editor and provides formatting tools

import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { 
  // Bold, // Unused - preserved for future use
  // Italic, // Unused - preserved for future use
  // List, // Unused - preserved for future use
  // ListOrdered, // Unused - preserved for future use
  // Link, // Unused - preserved for future use
  // Image, // Unused - preserved for future use
  // Quote, // Unused - preserved for future use
  // AlignLeft, // Unused - preserved for future use
  // AlignCenter, // Unused - preserved for future use
  // AlignRight, // Unused - preserved for future use
  // Undo, // Unused - preserved for future use
  // Redo, // Unused - preserved for future use
  Eye,
  Edit,
  Zap,
  FileText,
} from 'lucide-react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  mode: 'quick' | 'structured' | 'edit';
  readOnly?: boolean;
  placeholder?: string;
  height?: number;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  mode,
  readOnly = false,
  placeholder = 'Start writing your content here...',
  height = 400,
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const quillRef = useRef<ReactQuill>(null);

  // Update local content when prop changes
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // Calculate word count and reading time
  useEffect(() => {
    const text = editorContent.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Average reading speed
  }, [editorContent]);

  // Handle content change
  const handleChange = (value: string) => {
    setEditorContent(value);
    onChange(value);
  };

  // Quill modules configuration
  const modules = {
    toolbar: readOnly ? false : {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // Get placeholder based on mode
  const getPlaceholder = () => {
    switch (mode) {
      case 'quick':
        return 'Generated content will appear here. Use the input above to create new content.';
      case 'structured':
        return 'Start with ideas, then generate titles, synopsis, and full content step by step.';
      case 'edit':
        return 'Paste existing content here to improve it with AI assistance.';
      default:
        return placeholder;
    }
  };

  // AI assistance suggestions (mock data)
  const aiSuggestions = [
    'Make this more engaging',
    'Add more detail',
    'Simplify the language',
    'Add a call-to-action',
    'Improve SEO keywords',
    'Make it more conversational',
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Editor Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                showPreview
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showPreview ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            {/* AI Assistance */}
            <div className="relative">
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors">
                <Zap className="h-4 w-4" />
                <span>AI Assist</span>
              </button>
              
              {/* AI Suggestions Dropdown (would be shown on hover/click) */}
              <div className="hidden absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Improvements
                  </h4>
                  <div className="space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{wordCount} words</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {showPreview ? (
          // Preview Mode
          <div 
            className="h-full p-4 overflow-y-auto prose dark:prose-invert max-w-none"
            style={{ minHeight: height }}
          >
            {editorContent ? (
              <div dangerouslySetInnerHTML={{ __html: editorContent }} />
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content to preview</p>
                <p className="text-sm">Start writing to see the preview</p>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="h-full">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={editorContent}
              onChange={handleChange}
              readOnly={readOnly}
              modules={modules}
              formats={formats}
              placeholder={getPlaceholder()}
              style={{ height: height - 50 }} // Account for toolbar height
            />
          </div>
        )}

        {/* Empty State */}
        {!editorContent && !showPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">
                {mode === 'quick' ? 'Ready for Generation' : 
                 mode === 'structured' ? 'Structured Creation Mode' : 
                 'Content Editor'}
              </p>
              <p className="text-sm max-w-md">
                {getPlaceholder()}
              </p>
              
              {mode === 'edit' && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium">Pro Tips:</p>
                  <div className="text-xs space-y-1">
                    <p>• Paste existing content to improve it</p>
                    <p>• Use AI Assist for quick enhancements</p>
                    <p>• Toggle preview to see formatted output</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with additional controls */}
      {!readOnly && (
        <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span>Mode: {mode}</span>
            {editorContent && (
              <>
                <span>•</span>
                <span>Last edited: {new Date().toLocaleTimeString()}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              Cmd+S
            </kbd>
            <span>to save</span>
          </div>
        </div>
      )}

      {/* Custom Quill Styles */}
      <style>{`
        .ql-editor {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ql-editor.ql-blank::before {
          font-style: italic;
          opacity: 0.6;
        }
        
        .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dark .ql-toolbar {
          border-bottom-color: #374151;
        }
        
        .ql-container {
          border: none;
          font-size: inherit;
        }
        
        .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        
        .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        
        .ql-editor h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        
        .ql-editor p {
          margin: 0.75em 0;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }
        
        .dark .ql-editor blockquote {
          border-left-color: #60a5fa;
        }
      `}</style>
    </div>
  );
};