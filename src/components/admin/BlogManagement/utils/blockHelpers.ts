// Block Editor Helper Functions

import { Block, BlockType, BlockData, BlockSettings } from '../types';

// Generate unique block IDs
export const generateBlockId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new block with default settings
export const createBlock = (
  type: BlockType, 
  data: Partial<BlockData> = {},
  settings: Partial<BlockSettings> = {}
): Block => {
  return {
    id: generateBlockId(),
    type,
    data: { ...getDefaultBlockData(type), ...data },
    settings: { ...getDefaultBlockSettings(), ...settings }
  };
};

// Get default data for each block type
export const getDefaultBlockData = (type: BlockType): BlockData => {
  switch (type) {
    case 'paragraph':
      return { text: '' };
    case 'heading':
      return { text: '', level: 2 };
    case 'image':
      return { url: '', alt: '', caption: '' };
    case 'list':
      return { items: [''], ordered: false };
    case 'quote':
      return { quote: '', cite: '' };
    case 'code':
      return { code: '', language: 'javascript' };
    case 'gallery':
      return { images: [], layout: 'grid', columns: 3 };
    case 'embed':
      return { embedUrl: '', embedType: 'youtube' };
    case 'columns':
      return { columnCount: 2, columnContent: [[], []] };
    case 'spacer':
      return { spacerSize: 'medium', dividerStyle: 'none' };
    case 'button':
      return { buttonText: 'Click me', buttonUrl: '', buttonStyle: 'primary' };
    case 'table':
      return { 
        rows: [['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']], 
        headers: ['Header 1', 'Header 2'],
        hasHeader: true 
      };
    case 'callout':
      return { calloutType: 'info', title: 'Important', text: '' };
    default:
      return {};
  }
};

// Get default settings for all blocks
export const getDefaultBlockSettings = (): BlockSettings => {
  return {
    className: '',
    anchor: '',
    alignment: 'left',
    backgroundColor: '',
    textColor: '',
    fontSize: 'normal',
    marginTop: 0,
    marginBottom: 16,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0
  };
};

// Clone a block with a new ID
export const cloneBlock = (block: Block): Block => {
  return {
    ...block,
    id: generateBlockId(),
    data: { ...block.data },
    settings: { ...block.settings }
  };
};

// Convert blocks to HTML for rendering
export const blocksToHtml = (blocks: Block[]): string => {
  return blocks.map(blockToHtml).join('\n');
};

// Convert single block to HTML
export const blockToHtml = (block: Block): string => {
  const { type, data, settings } = block;
  
  // Build CSS styles from settings
  const styles: string[] = [];
  if (settings.backgroundColor) styles.push(`background-color: ${settings.backgroundColor}`);
  if (settings.textColor) styles.push(`color: ${settings.textColor}`);
  if (settings.marginTop) styles.push(`margin-top: ${settings.marginTop}px`);
  if (settings.marginBottom) styles.push(`margin-bottom: ${settings.marginBottom}px`);
  if (settings.paddingTop || settings.paddingBottom || settings.paddingLeft || settings.paddingRight) {
    const padding = `${settings.paddingTop || 0}px ${settings.paddingRight || 0}px ${settings.paddingBottom || 0}px ${settings.paddingLeft || 0}px`;
    styles.push(`padding: ${padding}`);
  }
  
  const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
  const classAttr = settings.className ? ` class="${settings.className}"` : '';
  const anchorAttr = settings.anchor ? ` id="${settings.anchor}"` : '';
  const alignmentClass = settings.alignment !== 'left' ? ` text-${settings.alignment}` : '';
  
  switch (type) {
    case 'paragraph':
      return `<p${classAttr}${styleAttr}${anchorAttr} class="mb-4${alignmentClass}">${data.text || ''}</p>`;
    
    case 'heading':
      const level = data.level || 2;
      return `<h${level}${classAttr}${styleAttr}${anchorAttr} class="font-bold mb-4${alignmentClass}">${data.text || ''}</h${level}>`;
    
    case 'image':
      const imgTag = `<img src="${data.url}" alt="${data.alt || ''}" class="max-w-full h-auto" />`;
      const caption = data.caption ? `<figcaption class="text-sm text-gray-600 mt-2 italic">${data.caption}</figcaption>` : '';
      return `<figure${classAttr}${styleAttr}${anchorAttr} class="mb-4${alignmentClass}">${imgTag}${caption}</figure>`;
    
    case 'list':
      const listTag = data.ordered ? 'ol' : 'ul';
      const listClass = data.ordered ? 'list-decimal' : 'list-disc';
      const items = (data.items || []).map(item => `<li>${item}</li>`).join('');
      return `<${listTag}${classAttr}${styleAttr}${anchorAttr} class="${listClass} ml-6 mb-4">${items}</${listTag}>`;
    
    case 'quote':
      const cite = data.cite ? `<cite class="block text-sm text-gray-600 mt-2">— ${data.cite}</cite>` : '';
      return `<blockquote${classAttr}${styleAttr}${anchorAttr} class="border-l-4 border-blue-500 pl-4 italic mb-4">${data.quote || ''}${cite}</blockquote>`;
    
    case 'code':
      return `<pre${classAttr}${styleAttr}${anchorAttr} class="bg-gray-100 p-4 rounded mb-4 overflow-x-auto"><code class="language-${data.language || 'javascript'}">${data.code || ''}</code></pre>`;
    
    case 'gallery':
      const images = (data.images || []).map(img => 
        `<div class="gallery-item">
          <img src="${img.url}" alt="${img.alt}" class="w-full h-auto" />
          ${img.caption ? `<p class="text-sm text-gray-600 mt-1">${img.caption}</p>` : ''}
        </div>`
      ).join('');
      return `<div${classAttr}${styleAttr}${anchorAttr} class="gallery grid grid-cols-${data.columns || 3} gap-4 mb-4">${images}</div>`;
    
    case 'embed':
      if (data.embedCode) {
        return `<div${classAttr}${styleAttr}${anchorAttr} class="embed-container mb-4">${data.embedCode}</div>`;
      }
      return `<div${classAttr}${styleAttr}${anchorAttr} class="embed-container mb-4"><p>Embed: ${data.embedUrl}</p></div>`;
    
    case 'button':
      return `<div${classAttr}${styleAttr}${anchorAttr} class="mb-4${alignmentClass}">
        <a href="${data.buttonUrl || '#'}" class="inline-block px-6 py-3 rounded font-medium ${getButtonClasses(data.buttonStyle || 'primary')}">${data.buttonText || 'Button'}</a>
      </div>`;
    
    case 'table':
      const headers = data.hasHeader && data.headers ? 
        `<thead><tr>${data.headers.map(h => `<th class="border px-4 py-2 font-bold">${h}</th>`).join('')}</tr></thead>` : '';
      const rows = (data.rows || []).map(row => 
        `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
      ).join('');
      return `<table${classAttr}${styleAttr}${anchorAttr} class="w-full border-collapse mb-4">${headers}<tbody>${rows}</tbody></table>`;
    
    case 'callout':
      const calloutClasses = getCalloutClasses(data.calloutType || 'info');
      return `<div${classAttr}${styleAttr}${anchorAttr} class="${calloutClasses} p-4 rounded mb-4">
        ${data.title ? `<h4 class="font-bold mb-2">${data.title}</h4>` : ''}
        <p>${data.text || ''}</p>
      </div>`;
    
    case 'spacer':
      return `<div${classAttr}${styleAttr}${anchorAttr} class="spacer mb-8"></div>`;
    
    case 'columns':
      const columnContent = (data.columnContent || []).map(columnBlocks => 
        `<div class="column">${blocksToHtml(columnBlocks)}</div>`
      ).join('');
      return `<div${classAttr}${styleAttr}${anchorAttr} class="columns grid grid-cols-${data.columnCount || 2} gap-6 mb-4">${columnContent}</div>`;
    
    default:
      return `<div${classAttr}${styleAttr}${anchorAttr} class="mb-4">Unknown block type: ${type}</div>`;
  }
};

// Helper function to get button CSS classes
const getButtonClasses = (style: string): string => {
  switch (style) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700';
    case 'secondary':
      return 'bg-gray-600 text-white hover:bg-gray-700';
    case 'outline':
      return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700';
  }
};

// Helper function to get callout CSS classes
const getCalloutClasses = (type: string): string => {
  switch (type) {
    case 'info':
      return 'bg-blue-50 border border-blue-200 text-blue-800';
    case 'warning':
      return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
    case 'error':
      return 'bg-red-50 border border-red-200 text-red-800';
    case 'success':
      return 'bg-green-50 border border-green-200 text-green-800';
    default:
      return 'bg-blue-50 border border-blue-200 text-blue-800';
  }
};

// Convert HTML back to blocks (for import functionality)
export const htmlToBlocks = (html: string): Block[] => {
  // This is a simplified implementation - in a real app you'd want a proper HTML parser
  const blocks: Block[] = [];
  
  // Split by common block elements and create basic blocks
  const paragraphs = html.split(/(?:<\/p>|<\/h[1-6]>|<\/blockquote>|<\/pre>)/);
  
  paragraphs.forEach(section => {
    if (section.trim()) {
      if (section.includes('<h1>')) {
        blocks.push(createBlock('heading', { text: section.replace(/<\/?[^>]+(>|$)/g, ''), level: 1 }));
      } else if (section.includes('<h2>')) {
        blocks.push(createBlock('heading', { text: section.replace(/<\/?[^>]+(>|$)/g, ''), level: 2 }));
      } else if (section.includes('<p>')) {
        blocks.push(createBlock('paragraph', { text: section.replace(/<\/?[^>]+(>|$)/g, '') }));
      } else if (section.includes('<blockquote>')) {
        blocks.push(createBlock('quote', { quote: section.replace(/<\/?[^>]+(>|$)/g, '') }));
      } else if (section.includes('<pre>') || section.includes('<code>')) {
        blocks.push(createBlock('code', { code: section.replace(/<\/?[^>]+(>|$)/g, '') }));
      }
    }
  });
  
  return blocks;
};