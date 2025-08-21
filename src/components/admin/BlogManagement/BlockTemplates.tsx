// Block Templates Component - Pre-designed block combinations

import React, { useState, useRef, useEffect } from 'react';
import { Block, BlockTemplate } from './types';
import { createBlock } from './utils/blockHelpers';

interface BlockTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTemplate: (blocks: Block[]) => void;
  position?: { x: number; y: number };
}

const TEMPLATES: BlockTemplate[] = [
  {
    id: 'blog-intro',
    name: 'Blog Post Intro',
    description: 'Heading + featured image + intro paragraph',
    category: 'Blog',
    blocks: [
      createBlock('heading', { text: 'Your Blog Post Title', level: 1 }),
      createBlock('image', { url: '', alt: 'Featured image', caption: 'Add your featured image here' }),
      createBlock('paragraph', { text: 'Write an engaging introduction to your blog post that hooks the reader and sets up what they can expect to learn.' })
    ],
    preview: '📰'
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Two-column layout with image and details',
    category: 'Marketing',
    blocks: [
      createBlock('heading', { text: 'Product Name', level: 2 }),
      createBlock('columns', { 
        columnCount: 2, 
        columnContent: [
          [createBlock('image', { url: '', alt: 'Product image' })],
          [
            createBlock('paragraph', { text: 'Product description goes here. Highlight the key features and benefits.' }),
            createBlock('button', { buttonText: 'Learn More', buttonUrl: '#', buttonStyle: 'primary' })
          ]
        ]
      })
    ],
    preview: '🛍️'
  },
  {
    id: 'faq-section',
    name: 'FAQ Section',
    description: 'Frequently asked questions with callout boxes',
    category: 'Support',
    blocks: [
      createBlock('heading', { text: 'Frequently Asked Questions', level: 2 }),
      createBlock('callout', { 
        calloutType: 'info', 
        title: 'Question 1: How do I get started?',
        text: 'Answer: Start by creating an account and following our quick setup guide.'
      }),
      createBlock('callout', { 
        calloutType: 'info', 
        title: 'Question 2: What are the pricing plans?',
        text: 'Answer: We offer several pricing tiers to fit different needs and budgets.'
      }),
      createBlock('callout', { 
        calloutType: 'info', 
        title: 'Question 3: How can I contact support?',
        text: 'Answer: You can reach our support team via email, chat, or phone during business hours.'
      })
    ],
    preview: '❓'
  },
  {
    id: 'contact-section',
    name: 'Contact Section',
    description: 'Contact information with call-to-action',
    category: 'Business',
    blocks: [
      createBlock('heading', { text: 'Get in Touch', level: 2 }),
      createBlock('paragraph', { text: 'Ready to take the next step? We\'d love to hear from you and discuss how we can help.' }),
      createBlock('columns', {
        columnCount: 2,
        columnContent: [
          [
            createBlock('paragraph', { text: '📧 hello@company.com' }),
            createBlock('paragraph', { text: '📞 (555) 123-4567' }),
            createBlock('paragraph', { text: '📍 123 Business St, City, State' })
          ],
          [
            createBlock('button', { buttonText: 'Schedule a Call', buttonUrl: '#', buttonStyle: 'primary' }),
            createBlock('button', { buttonText: 'Send Email', buttonUrl: 'mailto:hello@company.com', buttonStyle: 'outline' })
          ]
        ]
      })
    ],
    preview: '📞'
  },
  {
    id: 'testimonial-section',
    name: 'Testimonial Section',
    description: 'Customer testimonials with quotes',
    category: 'Marketing',
    blocks: [
      createBlock('heading', { text: 'What Our Customers Say', level: 2 }),
      createBlock('quote', { 
        quote: 'This product completely transformed how we work. The results exceeded our expectations!',
        cite: 'Jane Smith, CEO of Company Inc.'
      }),
      createBlock('quote', { 
        quote: 'Outstanding support and incredible features. Highly recommended for any business.',
        cite: 'John Doe, Marketing Director'
      }),
      createBlock('spacer', { spacerSize: 'medium', dividerStyle: 'dots' })
    ],
    preview: '💬'
  },
  {
    id: 'feature-comparison',
    name: 'Feature Comparison',
    description: 'Table comparing features or plans',
    category: 'Marketing',
    blocks: [
      createBlock('heading', { text: 'Compare Our Plans', level: 2 }),
      createBlock('table', {
        headers: ['Feature', 'Basic', 'Pro', 'Enterprise'],
        hasHeader: true,
        rows: [
          ['Users', '5', '25', 'Unlimited'],
          ['Storage', '10GB', '100GB', '1TB'],
          ['Support', 'Email', 'Email + Chat', 'Priority'],
          ['Price', '$9/mo', '$29/mo', '$99/mo']
        ]
      }),
      createBlock('paragraph', { text: 'All plans include our core features and 30-day money-back guarantee.' })
    ],
    preview: '📊'
  },
  {
    id: 'step-by-step-guide',
    name: 'Step-by-Step Guide',
    description: 'Numbered steps with explanations',
    category: 'Tutorial',
    blocks: [
      createBlock('heading', { text: 'How to Get Started', level: 2 }),
      createBlock('callout', {
        calloutType: 'info',
        title: 'Step 1: Setup',
        text: 'Begin by creating your account and completing the initial setup process.'
      }),
      createBlock('callout', {
        calloutType: 'info',
        title: 'Step 2: Configuration',
        text: 'Configure your preferences and connect any necessary integrations.'
      }),
      createBlock('callout', {
        calloutType: 'info',
        title: 'Step 3: Launch',
        text: 'You\'re ready to go! Start using the platform and explore all features.'
      }),
      createBlock('button', { buttonText: 'Start Now', buttonUrl: '#', buttonStyle: 'primary' })
    ],
    preview: '🚀'
  },
  {
    id: 'gallery-showcase',
    name: 'Gallery Showcase',
    description: 'Image gallery with description',
    category: 'Media',
    blocks: [
      createBlock('heading', { text: 'Project Gallery', level: 2 }),
      createBlock('paragraph', { text: 'Take a look at some of our recent work and creative projects.' }),
      createBlock('gallery', {
        images: [],
        layout: 'grid',
        columns: 3
      }),
      createBlock('spacer', { spacerSize: 'medium', dividerStyle: 'solid' })
    ],
    preview: '🖼️'
  }
];

const CATEGORIES = ['All', 'Blog', 'Marketing', 'Business', 'Support', 'Tutorial', 'Media'];

export const BlockTemplates: React.FC<BlockTemplatesProps> = ({
  isOpen,
  onClose,
  onInsertTemplate,
  position = { x: 0, y: 0 }
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<BlockTemplate | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter templates by category
  const filteredTemplates = TEMPLATES.filter(template => 
    selectedCategory === 'All' || template.category === selectedCategory
  );

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleInsertTemplate = (template: BlockTemplate) => {
    // Clone blocks to avoid reference issues
    const clonedBlocks = template.blocks.map(block => ({
      ...block,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      data: { ...block.data },
      settings: { ...block.settings }
    }));
    
    onInsertTemplate(clonedBlocks);
    onClose();
  };

  const handleTemplateSelect = (template: BlockTemplate) => {
    setSelectedTemplate(template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl border max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Block Templates</h3>
              <p className="text-gray-600 mt-1">Choose from pre-designed block combinations</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 border-r bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
            <div className="space-y-1">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto">
            {selectedTemplate ? (
              /* Template Preview */
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ← Back
                  </button>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedTemplate.preview} {selectedTemplate.name}
                    </h4>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {selectedTemplate.blocks.map((block, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border">
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                      </div>
                      <div className="text-sm text-gray-700">
                        {block.type === 'heading' && block.data.text}
                        {block.type === 'paragraph' && (
                          <span className="line-clamp-2">{block.data.text}</span>
                        )}
                        {block.type === 'image' && (
                          <span className="italic">Image: {block.data.alt || 'Untitled'}</span>
                        )}
                        {block.type === 'button' && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {block.data.buttonText}
                          </span>
                        )}
                        {block.type === 'callout' && (
                          <span>{block.data.title}</span>
                        )}
                        {block.type === 'quote' && (
                          <span className="italic">"{block.data.quote}"</span>
                        )}
                        {block.type === 'table' && (
                          <span>Table ({block.data.rows?.length || 0} rows)</span>
                        )}
                        {block.type === 'columns' && (
                          <span>{block.data.columnCount} columns</span>
                        )}
                        {block.type === 'gallery' && (
                          <span>Gallery ({block.data.images?.length || 0} images)</span>
                        )}
                        {block.type === 'spacer' && (
                          <span>Spacer ({block.data.spacerSize})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleInsertTemplate(selectedTemplate)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Insert Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Back to Templates
                  </button>
                </div>
              </div>
            ) : (
              /* Templates List */
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{template.preview}</div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center">
                        {template.blocks.length} blocks • {template.category}
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertTemplate(template);
                          }}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Insert
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-lg">No templates found</p>
                    <p className="text-sm">Try selecting a different category</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};