/**
 * Provider Configuration Validation Schemas
 * Validates AI provider settings and API keys
 */

import { z } from 'zod';

// Provider types
export const ProviderTypeEnum = z.enum(['openai', 'anthropic', 'google', 'perplexity']);

// Model capabilities
export const ModelCapabilitiesSchema = z.object({
  text: z.boolean().default(true),
  image: z.boolean().default(false),
  code: z.boolean().default(false),
  function_calling: z.boolean().default(false),
  streaming: z.boolean().default(true),
  embeddings: z.boolean().default(false),
});

// Model pricing
export const ModelPricingSchema = z.object({
  input: z.number()
    .min(0)
    .max(1000)
    .describe('Cost per 1K input tokens in USD'),
  
  output: z.number()
    .min(0)
    .max(1000)
    .describe('Cost per 1K output tokens in USD'),
  
  image: z.number()
    .min(0)
    .max(100)
    .optional()
    .describe('Cost per image generation in USD'),
});

// Model configuration
export const ModelConfigSchema = z.object({
  id: z.string()
    .min(1)
    .max(100),
  
  name: z.string()
    .min(1)
    .max(100),
  
  contextWindow: z.number()
    .min(1000)
    .max(2000000)
    .describe('Maximum context length in tokens'),
  
  maxOutput: z.number()
    .min(100)
    .max(150000)
    .optional()
    .describe('Maximum output tokens'),
  
  capabilities: ModelCapabilitiesSchema,
  
  pricing: ModelPricingSchema,
  
  isDeprecated: z.boolean().default(false),
  
  releaseDate: z.string()
    .datetime()
    .optional(),
});

// API key validation patterns
const API_KEY_PATTERNS = {
  openai: /^sk-[a-zA-Z0-9]{48,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9]{40,}$/,
  google: /^[a-zA-Z0-9\-_]{39}$/,
  perplexity: /^pplx-[a-zA-Z0-9]{48,}$/,
};

// Custom API key validator
export const APIKeySchema = z.string()
  .min(20, 'API key too short')
  .max(200, 'API key too long')
  .refine((key) => {
    // Basic validation - actual pattern matching done per provider
    return key.trim().length > 0;
  }, 'Invalid API key format');

// Provider configuration schema
export const ProviderConfigSchema = z.object({
  // Basic info
  provider: ProviderTypeEnum,
  
  name: z.string()
    .min(1)
    .max(100),
  
  description: z.string()
    .max(500)
    .optional(),
  
  // API configuration
  apiKey: APIKeySchema,
  
  baseUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .describe('Custom API endpoint'),
  
  apiVersion: z.string()
    .max(20)
    .optional(),
  
  // Organization/Project settings
  organizationId: z.string()
    .max(100)
    .optional(),
  
  projectId: z.string()
    .max(100)
    .optional(),
  
  // Models
  models: z.array(ModelConfigSchema)
    .min(1, 'At least one model required'),
  
  defaultModel: z.string()
    .optional(),
  
  // Rate limiting
  rateLimits: z.object({
    requestsPerMinute: z.number()
      .min(1)
      .max(10000)
      .default(60),
    
    requestsPerDay: z.number()
      .min(1)
      .max(1000000)
      .optional(),
    
    tokensPerMinute: z.number()
      .min(1000)
      .max(10000000)
      .optional(),
    
    tokensPerDay: z.number()
      .min(1000)
      .max(100000000)
      .optional(),
  }).optional(),
  
  // Usage tracking
  usageLimits: z.object({
    monthlyBudget: z.number()
      .min(0)
      .max(100000)
      .optional()
      .describe('Monthly spending limit in USD'),
    
    dailyBudget: z.number()
      .min(0)
      .max(10000)
      .optional()
      .describe('Daily spending limit in USD'),
    
    alertThreshold: z.number()
      .min(0)
      .max(100)
      .default(80)
      .describe('Alert when usage reaches this percentage'),
  }).optional(),
  
  // Status
  enabled: z.boolean().default(true),
  
  isPrimary: z.boolean().default(false),
  
  // Testing
  lastTested: z.string()
    .datetime()
    .optional(),
  
  testSuccess: z.boolean()
    .optional(),
  
  testMessage: z.string()
    .max(500)
    .optional(),
  
  // Metadata
  createdAt: z.string()
    .datetime()
    .optional(),
  
  updatedAt: z.string()
    .datetime()
    .optional(),
});

// Provider test request schema
export const ProviderTestSchema = z.object({
  provider: ProviderTypeEnum,
  
  apiKey: APIKeySchema,
  
  model: z.string()
    .optional(),
  
  testPrompt: z.string()
    .max(100)
    .default('Hello, please respond with "test successful"'),
});

// Provider usage schema
export const ProviderUsageSchema = z.object({
  provider: ProviderTypeEnum,
  
  period: z.enum(['hour', 'day', 'week', 'month']),
  
  metrics: z.object({
    requests: z.number().min(0),
    tokens: z.number().min(0),
    cost: z.number().min(0),
    errors: z.number().min(0),
    avgLatency: z.number().min(0), // in milliseconds
  }),
  
  topModels: z.array(z.object({
    model: z.string(),
    requests: z.number(),
    tokens: z.number(),
    cost: z.number(),
  })).optional(),
  
  timestamp: z.string().datetime(),
});

// Fallback configuration schema
export const FallbackConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  strategy: z.enum(['priority', 'round-robin', 'least-cost', 'fastest'])
    .default('priority'),
  
  providers: z.array(z.object({
    provider: ProviderTypeEnum,
    priority: z.number().min(1).max(10),
    conditions: z.object({
      maxErrors: z.number().default(3),
      cooldownMinutes: z.number().default(5),
      costMultiplier: z.number().default(1),
    }).optional(),
  }))
    .min(2, 'At least 2 providers required for fallback'),
  
  retryAttempts: z.number()
    .min(1)
    .max(5)
    .default(3),
  
  retryDelay: z.number()
    .min(100)
    .max(10000)
    .default(1000)
    .describe('Delay between retries in milliseconds'),
});

// Health check schema
export const ProviderHealthSchema = z.object({
  provider: ProviderTypeEnum,
  
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  
  lastCheck: z.string().datetime(),
  
  metrics: z.object({
    uptime: z.number().min(0).max(100), // percentage
    avgLatency: z.number().min(0), // milliseconds
    errorRate: z.number().min(0).max(100), // percentage
    successRate: z.number().min(0).max(100), // percentage
  }),
  
  recentErrors: z.array(z.object({
    timestamp: z.string().datetime(),
    error: z.string(),
    model: z.string().optional(),
  }))
    .max(10)
    .optional(),
});

// Type exports
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type ProviderTest = z.infer<typeof ProviderTestSchema>;
export type ProviderUsage = z.infer<typeof ProviderUsageSchema>;
export type FallbackConfig = z.infer<typeof FallbackConfigSchema>;
export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;
export type ModelCapabilities = z.infer<typeof ModelCapabilitiesSchema>;
export type ModelPricing = z.infer<typeof ModelPricingSchema>;