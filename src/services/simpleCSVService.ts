// Simplified CSV Service that avoids TypeScript strict checking issues

import Papa from 'papaparse';
import type { CSVRow, CSVImportResult } from '../types/Content';

type IndustryConfigData = Record<string, Record<string, string>>;

export class SimpleCSVService {
  /**
   * Parse CSV file into structured data
   */
  static async parseCSV(file: File): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing failed: ${results.errors[0]?.message || 'Unknown error'}`));
          } else {
            resolve(results.data as CSVRow[]);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Validate CSV structure
   */
  static validateCSVStructure(csvData: CSVRow[]): CSVImportResult {
    const errors: Array<{ row: number; field: string; error: string }> = [];
    const requiredColumns = ['section', 'field', 'content_type', 'hotels_content', 'restaurants_content', 'dental_content', 'sports_content'];
    
    if (csvData.length === 0) {
      return {
        success: false,
        totalRows: 0,
        processedRows: 0,
        errors: [{ row: 0, field: 'general', error: 'CSV file is empty' }]
      };
    }
    
    const firstRow = csvData[0];
    if (!firstRow) {
      return {
        success: false,
        totalRows: 0,
        processedRows: 0,
        errors: [{ row: 0, field: 'general', error: 'No data found in CSV' }]
      };
    }
    
    // Check if all required columns exist
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        totalRows: csvData.length,
        processedRows: 0,
        errors: [{ row: 0, field: 'structure', error: `Missing columns: ${missingColumns.join(', ')}` }]
      };
    }
    
    // Validate each row
    csvData.forEach((row, index) => {
      if (!row.section || !row.field) {
        errors.push({
          row: index + 1,
          field: 'section/field',
          error: 'Section and field are required'
        });
      }
    });
    
    return {
      success: errors.length === 0,
      totalRows: csvData.length,
      processedRows: csvData.length - errors.length,
      errors
    };
  }

  /**
   * Transform CSV data into a simple object structure
   */
  static transformCSVToConfigs(csvData: CSVRow[]): Record<string, IndustryConfigData> {
    const configs: Record<string, IndustryConfigData> = {
      hospitality: {},
      foodservice: {},
      healthcare: {},
      athletics: {}
    };

    // Group by section
    const sections: Record<string, CSVRow[]> = {};
    csvData.forEach(row => {
      if (!sections[row.section]) {
        sections[row.section] = [];
      }
      sections[row.section]?.push(row);
    });

    // Process each section for each industry
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      const industryConfig = configs[industry];
      if (!industryConfig) return;

      Object.keys(sections).forEach(sectionName => {
        industryConfig[sectionName] = {};
        
        sections[sectionName]?.forEach(row => {
          if (industryConfig[sectionName]) {
            industryConfig[sectionName][row.field] = row[industryColumn] || '';
          }
        });
      });
    });

    return configs;
  }

  /**
   * Get the appropriate CSV column name for an industry
   */
  private static getIndustryColumn(industry: string): keyof CSVRow {
    const mapping: Record<string, keyof CSVRow> = {
      hospitality: 'hotels_content',
      foodservice: 'restaurants_content',
      healthcare: 'dental_content',
      athletics: 'sports_content'
    };
    
    return mapping[industry] || 'hotels_content';
  }
}