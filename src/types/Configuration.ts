// Configuration management types

export interface ClientSite {
  id: string;
  tenantId: string;
  siteName: string;
  primaryDomain: string;
  industries: string[];
  config: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformAnalytics {
  id: string;
  tenantId: string;
  industry?: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  timestamp: Date;
}

export interface APIConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface EnvironmentConfig {
  development: {
    apiUrl: string;
    imageUploadUrl: string;
    debug: boolean;
  };
  production: {
    apiUrl: string;
    imageUploadUrl: string;
    debug: boolean;
  };
}

// Re-export from Industry.ts to avoid circular dependencies
import type { IndustryConfig } from './Industry';
export type { IndustryConfig };

export interface ConfigManager {
  getIndustryConfig(industry: string): Promise<IndustryConfig>;
  updateIndustryConfig(industry: string, config: Partial<IndustryConfig>): Promise<void>;
  mergeConfigs(base: IndustryConfig, override: Partial<IndustryConfig>): IndustryConfig;
}