// Block Editor Types and Interfaces

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'list'
  | 'quote'
  | 'code'
  | 'gallery'
  | 'embed'
  | 'columns'
  | 'spacer'
  | 'button'
  | 'table'
  | 'callout';

export interface BlockData {
  // Paragraph block data
  text?: string;
  
  // Heading block data
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // Image block data
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  
  // List block data
  items?: string[];
  ordered?: boolean;
  
  // Quote block data
  quote?: string;
  cite?: string;
  
  // Code block data
  code?: string;
  language?: string;
  
  // Gallery block data
  images?: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'carousel' | 'masonry';
  columns?: number;
  
  // Embed block data
  embedUrl?: string;
  embedType?: 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'codepen' | 'custom';
  embedCode?: string;
  
  // Columns block data
  columnCount?: number;
  columnContent?: Block[][];
  
  // Button block data
  buttonText?: string;
  buttonUrl?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  
  // Table block data
  rows?: string[][];
  headers?: string[];
  hasHeader?: boolean;
  
  // Callout block data
  calloutType?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  
  // Spacer block data
  spacerSize?: 'small' | 'medium' | 'large' | 'xlarge';
  dividerStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'stars' | 'dots';
}

export interface BlockSettings {
  className?: string;
  anchor?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  fontSize?: 'small' | 'normal' | 'large' | 'huge';
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
  settings: BlockSettings;
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  blocks: Block[];
  preview?: string;
}

export interface BlockEditorState {
  blocks: Block[];
  selectedBlockId?: string | undefined;
  isInserterOpen: boolean;
  isSettingsPanelOpen: boolean;
  isSlashCommandsOpen: boolean;
  slashCommandsPosition: { x: number; y: number };
  slashCommandsQuery: string;
  isTemplatesOpen: boolean;
  history: Block[][];
  historyIndex: number;
}