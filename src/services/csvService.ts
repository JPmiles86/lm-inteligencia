// CSV Import and Content Management Service

import Papa from 'papaparse';
import type { IndustryConfig, IndustryType } from '../types/Industry';
import type { CSVRow, CSVImportResult } from '../types/Content';

export class CSVService {
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
   * Transform CSV data into industry-specific configurations
   */
  static transformCSVToIndustryConfigs(csvData: CSVRow[]): Record<IndustryType, Partial<IndustryConfig>> {
    const configs: Record<string, Partial<IndustryConfig>> = {};
    const industries: IndustryType[] = ['hospitality', 'foodservice', 'healthcare', 'athletics'];
    
    // Initialize configurations for each industry
    industries.forEach(industry => {
      configs[industry] = {
        content: {
          hero: {
            title: '',
            subtitle: '',
            backgroundType: 'image' as const,
            backgroundSrc: '',
            ctaText: '',
            ctaLink: ''
          },
          services: [],
          team: [],
          testimonials: [],
          pricing: { plans: [] },
          contact: {
            title: '',
            subtitle: '',
            email: '',
            phone: ''
          }
        }
      };
    });

    // Group CSV rows by section
    const sectionGroups = this.groupBySection(csvData);

    // Transform each section
    Object.entries(sectionGroups).forEach(([section, rows]) => {
      switch (section) {
        case 'hero':
          this.transformHeroSection(rows, configs);
          break;
        case 'services':
          this.transformServicesSection(rows, configs);
          break;
        case 'team':
          this.transformTeamSection(rows, configs);
          break;
        case 'testimonials':
          this.transformTestimonialsSection(rows, configs);
          break;
        case 'pricing':
          this.transformPricingSection(rows, configs);
          break;
        case 'contact':
          this.transformContactSection(rows, configs);
          break;
      }
    });

    return configs as Record<IndustryType, Partial<IndustryConfig>>;
  }

  /**
   * Group CSV rows by section
   */
  private static groupBySection(csvData: CSVRow[]): Record<string, CSVRow[]> {
    return csvData.reduce((groups, row) => {
      const section = row.section;
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(row);
      return groups;
    }, {} as Record<string, CSVRow[]>);
  }

  /**
   * Transform hero section data
   */
  private static transformHeroSection(rows: CSVRow[], configs: Record<string, Partial<IndustryConfig>>): void {
    const heroData = this.rowsToObject(rows);
    
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      const config = configs[industry];
      if (!config || !config.content) return;
      
      config.content.hero = {
        title: heroData.main_title?.[industryColumn] || '',
        subtitle: heroData.subtitle?.[industryColumn] || '',
        backgroundType: (heroData.background_type?.[industryColumn] as 'image' | 'video') || 'image',
        backgroundSrc: heroData.background_src?.[industryColumn] || '',
        ctaText: heroData.cta_text?.[industryColumn] || '',
        ctaLink: heroData.cta_link?.[industryColumn] || '',
        stats: [
          {
            value: heroData.stat_1_value?.[industryColumn] || '',
            label: heroData.stat_1_label?.[industryColumn] || ''
          },
          {
            value: heroData.stat_2_value?.[industryColumn] || '',
            label: heroData.stat_2_label?.[industryColumn] || ''
          },
          {
            value: heroData.stat_3_value?.[industryColumn] || '',
            label: heroData.stat_3_label?.[industryColumn] || ''
          }
        ]
      };
    });
  }

  /**
   * Transform services section data
   */
  private static transformServicesSection(rows: CSVRow[], configs: Record<string, Partial<IndustryConfig>>): void {
    const servicesData = this.rowsToObject(rows);
    
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      if (!configs[industry].content) configs[industry].content = {};
      
      const services = [];
      
      // Extract services (assuming up to 6 services based on typical structure)
      for (let i = 1; i <= 6; i++) {
        const titleKey = `service_${i}_title`;
        const descKey = `service_${i}_description`;
        const resultsKey = `service_${i}_results`;
        
        if (servicesData[titleKey]?.[industryColumn]) {
          const features = [];
          
          // Extract features for this service
          for (let j = 1; j <= 8; j++) {
            const featureKey = `service_${i}_feature_${j}`;
            if (servicesData[featureKey]?.[industryColumn]) {
              features.push(servicesData[featureKey][industryColumn]);
            }
          }
          
          services.push({
            title: servicesData[titleKey][industryColumn],
            description: servicesData[descKey]?.[industryColumn] || '',
            features,
            icon: 'star', // Default icon, will be customized later
            results: servicesData[resultsKey]?.[industryColumn]
          });
        }
      }
      
      configs[industry].content!.services = services;
    });
  }

  /**
   * Transform team section data
   */
  private static transformTeamSection(rows: CSVRow[], configs: Record<string, Partial<IndustryConfig>>): void {
    const teamData = this.rowsToObject(rows);
    
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      if (!configs[industry].content) configs[industry].content = {};
      
      const team = [];
      
      // Extract team members
      for (let i = 1; i <= 10; i++) {
        const nameKey = `member_${i}_name`;
        const titleKey = `member_${i}_title`;
        const bioKey = `member_${i}_bio`;
        const imageKey = `member_${i}_image`;
        
        if (teamData[nameKey]?.[industryColumn]) {
          team.push({
            name: teamData[nameKey][industryColumn],
            title: teamData[titleKey]?.[industryColumn] || '',
            bio: teamData[bioKey]?.[industryColumn] || '',
            image: teamData[imageKey]?.[industryColumn] || '/images/team/placeholder.jpg'
          });
        }
      }
      
      configs[industry].content!.team = team;
    });
  }

  /**
   * Transform testimonials section data
   */
  private static transformTestimonialsSection(rows: CSVRow[], configs: Record<string, Partial<IndustryConfig>>): void {
    const testimonialsData = this.rowsToObject(rows);
    
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      if (!configs[industry].content) configs[industry].content = {};
      
      const testimonials = [];
      
      // Extract testimonials
      for (let i = 1; i <= 10; i++) {
        const quoteKey = `testimonial_${i}_quote`;
        const authorKey = `testimonial_${i}_author`;
        const positionKey = `testimonial_${i}_position`;
        const companyKey = `testimonial_${i}_company`;
        
        if (testimonialsData[quoteKey]?.[industryColumn]) {
          testimonials.push({
            quote: testimonialsData[quoteKey][industryColumn],
            author: testimonialsData[authorKey]?.[industryColumn] || '',
            position: testimonialsData[positionKey]?.[industryColumn] || '',
            company: testimonialsData[companyKey]?.[industryColumn] || ''
          });
        }
      }
      
      configs[industry].content!.testimonials = testimonials;
    });
  }

  /**
   * Transform pricing section data
   */
  private static transformPricingSection(rows: CSVRow[], configs: Record<string, Partial<IndustryConfig>>): void {
    const pricingData = this.rowsToObject(rows);
    
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      if (!configs[industry].content) configs[industry].content = {};
      
      const plans = [];
      
      // Extract pricing plans
      for (let i = 1; i <= 5; i++) {
        const nameKey = `plan_${i}_name`;
        const priceKey = `plan_${i}_price`;
        const durationKey = `plan_${i}_duration`;
        const ctaKey = `plan_${i}_cta_text`;
        
        if (pricingData[nameKey]?.[industryColumn]) {
          const features = [];
          
          // Extract features for this plan
          for (let j = 1; j <= 10; j++) {
            const featureKey = `plan_${i}_feature_${j}`;
            if (pricingData[featureKey]?.[industryColumn]) {
              features.push(pricingData[featureKey][industryColumn]);
            }
          }
          
          plans.push({
            name: pricingData[nameKey][industryColumn],
            price: pricingData[priceKey]?.[industryColumn] || '',
            duration: pricingData[durationKey]?.[industryColumn] || '',
            features,
            ctaText: pricingData[ctaKey]?.[industryColumn] || 'Get Started',
            ctaLink: '/contact'
          });
        }
      }
      
      configs[industry].content!.pricing = { plans };
    });
  }

  /**
   * Transform contact section data
   */
  private static transformContactSection(rows: CSVRow[], configs: Record<string, Partial<IndustryConfig>>): void {
    const contactData = this.rowsToObject(rows);
    
    Object.keys(configs).forEach(industry => {
      const industryColumn = this.getIndustryColumn(industry);
      if (!configs[industry].content) configs[industry].content = {};
      
      configs[industry].content!.contact = {
        title: contactData.title?.[industryColumn] || '',
        subtitle: contactData.subtitle?.[industryColumn] || '',
        email: contactData.email?.[industryColumn] || '',
        phone: contactData.phone?.[industryColumn] || ''
      };
    });
  }

  /**
   * Convert array of rows to object structure grouped by field
   */
  private static rowsToObject(rows: CSVRow[]): Record<string, CSVRow> {
    return rows.reduce((obj, row) => {
      obj[row.field] = row;
      return obj;
    }, {} as Record<string, CSVRow>);
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
    
    // Check if all required columns exist
    const firstRow = csvData[0];
    if (!firstRow) {
      return {
        success: false,
        totalRows: 0,
        processedRows: 0,
        errors: [{ row: 0, field: 'general', error: 'No data found in CSV' }]
      };
    }
    
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
   * Export current configuration to CSV format
   */
  static exportToCSV(): string {
    const rows: string[][] = [];
    
    // Add header
    rows.push([
      'section',
      'field', 
      'content_type',
      'hotels_content',
      'restaurants_content', 
      'dental_content',
      'sports_content',
      'description',
      'image_description'
    ]);
    
    // This would be a complex transformation back to CSV format
    // For now, returning a basic structure
    // TODO: Implement full export functionality
    
    return Papa.unparse(rows);
  }
}