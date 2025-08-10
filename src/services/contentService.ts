// Content Management Service

import type { IndustryConfig, IndustryType } from '../types/Industry';
import type { ContentSection } from '../types/Content';

export class ContentService {

  /**
   * Get industry configuration from server or localStorage
   */
  static async getIndustryConfig(tenantId: string, industry: IndustryType): Promise<IndustryConfig | null> {
    try {
      // For now, use localStorage as a cache
      // Later will be replaced with actual API calls
      const cached = this.getCachedConfig(tenantId, industry);
      if (cached) {
        return cached;
      }

      // TODO: Implement API call to server
      // const response = await fetch(`${this.baseUrl}${endpoints.contentByIndustry(industry)}`, {
      //   headers: { 'X-Tenant-ID': tenantId }
      // });
      // return await response.json();

      return null;
    } catch (error) {
      // Error: Failed to get industry config
      return null;
    }
  }

  /**
   * Update industry configuration
   */
  static async updateIndustryConfig(
    tenantId: string, 
    industry: IndustryType, 
    config: Partial<IndustryConfig>
  ): Promise<void> {
    // Store in localStorage for now
    this.setCachedConfig(tenantId, industry, config);

    // TODO: Implement API call to server
    // await fetch(`${this.baseUrl}${endpoints.updateIndustryConfig}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Tenant-ID': tenantId
    //   },
    //   body: JSON.stringify({ industry, config })
    // });

    // Successfully updated config
  }

  /**
   * Import content from CSV data
   */
  static async importFromCSV(
    tenantId: string, 
    configs: Record<IndustryType, Partial<IndustryConfig>>
  ): Promise<void> {
    // Update each industry configuration
    const industries: IndustryType[] = ['hospitality', 'healthcare', 'tech', 'athletics'];
    
    for (const industry of industries) {
      if (configs[industry]) {
        await this.updateIndustryConfig(tenantId, industry, configs[industry]);
      }
    }

    // Log import activity
    this.logImportActivity(tenantId, Object.keys(configs).length);
  }

  /**
   * Get content section by type
   */
  static async getContentSection(
    tenantId: string, 
    industry: IndustryType, 
    sectionType: string
  ): Promise<ContentSection | null> {
    try {
      const config = await this.getIndustryConfig(tenantId, industry);
      if (!config || !config.content) return null;

      const sectionContent = (config.content as Record<string, unknown>)[sectionType];
      if (!sectionContent) return null;

      return {
        id: `${tenantId}-${industry}-${sectionType}`,
        tenantId,
        industry,
        sectionType: sectionType as ContentSection['sectionType'],
        content: sectionContent as Record<string, unknown>,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      // Error: Failed to get content section
      return null;
    }
  }

  /**
   * Update content section
   */
  static async updateContentSection(
    tenantId: string,
    industry: IndustryType,
    sectionType: string,
    content: Record<string, unknown>
  ): Promise<void> {
    const currentConfig = await this.getIndustryConfig(tenantId, industry);
    if (!currentConfig) return;

    const updatedConfig = {
      ...currentConfig,
      content: {
        ...currentConfig.content,
        [sectionType]: content
      }
    };

    await this.updateIndustryConfig(tenantId, industry, updatedConfig);
  }

  /**
   * Get cached configuration from localStorage
   */
  private static getCachedConfig(tenantId: string, industry: IndustryType): IndustryConfig | null {
    try {
      const key = `inteligencia_config_${tenantId}_${industry}`;
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  /**
   * Cache configuration in localStorage
   */
  private static setCachedConfig(
    tenantId: string, 
    industry: IndustryType, 
    config: Partial<IndustryConfig>
  ): void {
    try {
      const key = `inteligencia_config_${tenantId}_${industry}`;
      const existing = this.getCachedConfig(tenantId, industry);
      const merged = existing ? { ...existing, ...config } : config;
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (error) {
      // Error: Failed to cache config
    }
  }

  /**
   * Clear cached configurations
   */
  static clearCache(tenantId: string): void {
    try {
      const industries: IndustryType[] = ['hospitality', 'healthcare', 'tech', 'athletics', 'main'];
      industries.forEach(industry => {
        const key = `inteligencia_config_${tenantId}_${industry}`;
        localStorage.removeItem(key);
      });
    } catch (error) {
      // Error: Failed to clear cache
    }
  }

  /**
   * Log import activity for analytics
   */
  private static logImportActivity(tenantId: string, industriesCount: number): void {
    try {
      const activity = {
        tenantId,
        action: 'csv_import',
        industriesCount,
        timestamp: new Date().toISOString()
      };

      // Store activity log in localStorage for now
      const logs = JSON.parse(localStorage.getItem('inteligencia_activity_logs') || '[]');
      logs.push(activity);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('inteligencia_activity_logs', JSON.stringify(logs));
    } catch (error) {
      // Error: Failed to log activity
    }
  }

  /**
   * Get activity logs for admin dashboard
   */
  static getActivityLogs(tenantId: string): Array<{
    tenantId: string;
    action: string;
    industriesCount?: number;
    timestamp: string;
  }> {
    try {
      const logs = JSON.parse(localStorage.getItem('inteligencia_activity_logs') || '[]');
      return logs.filter((log: { tenantId: string; action: string; industriesCount?: number; timestamp: string }) => log.tenantId === tenantId);
    } catch {
      return [];
    }
  }

  /**
   * Export all configurations to JSON
   */
  static async exportAllConfigs(tenantId: string): Promise<Record<IndustryType, IndustryConfig | null>> {
    const industries: IndustryType[] = ['hospitality', 'healthcare', 'tech', 'athletics', 'main'];
    const configs: Partial<Record<IndustryType, IndustryConfig | null>> = {};

    for (const industry of industries) {
      configs[industry] = await this.getIndustryConfig(tenantId, industry);
    }

    return configs as Record<IndustryType, IndustryConfig | null>;
  }

  /**
   * Validate content structure
   */
  static validateContent(content: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation rules
    if (typeof content !== 'object' || content === null) {
      errors.push('Content must be an object');
      return { valid: false, errors };
    }

    // Add more validation rules as needed
    // For example, check required fields, data types, etc.

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate content preview
   */
  static generatePreview(config: Partial<IndustryConfig>): string {
    try {
      const preview = {
        title: config.content?.hero?.title || 'Untitled',
        industry: config.industry || 'Unknown',
        servicesCount: config.content?.services?.length || 0,
        teamCount: config.content?.team?.length || 0,
        testimonialsCount: config.content?.testimonials?.length || 0
      };

      return `${preview.title} (${preview.industry}) - ${preview.servicesCount} services, ${preview.teamCount} team members, ${preview.testimonialsCount} testimonials`;
    } catch {
      return 'Preview not available';
    }
  }
}