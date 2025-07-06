// Content management types

export interface ContentSection {
  id: string;
  tenantId: string;
  industry: string;
  sectionType: 'hero' | 'services' | 'team' | 'testimonials' | 'pricing' | 'contact';
  content: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSVRow {
  section: string;
  field: string;
  content_type: string;
  hotels_content: string;
  restaurants_content: string;
  dental_content: string;
  sports_content: string;
  description: string;
  image_description: string;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  errors: Array<{
    row: number;
    field: string;
    error: string;
  }>;
}

export interface ContentTemplate {
  id: string;
  templateName: string;
  industry?: string;
  sectionType: string;
  templateData: Record<string, unknown>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedImage {
  id: string;
  tenantId: string;
  industry?: string;
  prompt: string;
  imageUrl: string;
  openaiImageId?: string;
  usageContext?: string;
  createdAt: Date;
}