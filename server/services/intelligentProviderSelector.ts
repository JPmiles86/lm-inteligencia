import { eq } from 'drizzle-orm';
import { db } from '../../api/index.js';
import { providerSettings } from '../../src/db/schema.js';
import { decrypt } from '../utils/encryption.js';
import { ProviderError } from '../middleware/error.middleware.js';

// Enhanced provider capabilities with cost and token info
interface ProviderCapability {
  text: boolean;
  image: boolean;
  research: boolean;
  multimodal: boolean;
  maxTokens: number;
  costPer1kTokens: number;
}

// Task requirements interface
interface TaskRequirements {
  capability: 'text' | 'image' | 'research' | 'multimodal';
  minTokens?: number;
  maxCost?: number;
  preferredModels?: string[];
  requiresOnline?: boolean; // For research tasks
}

// Provider health tracking interface
interface ProviderHealth {
  provider: string;
  isHealthy: boolean;
  lastCheck: Date;
  failureCount: number;
  averageLatency: number;
  successRate: number;
}

// Enhanced provider config
interface EnhancedProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
  config: any;
  fallbackChain: string[];
  health: ProviderHealth;
}

export class IntelligentProviderSelector {
  private providerHealth: Map<string, ProviderHealth> = new Map();
  private readonly healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  private healthMonitoringActive = false;
  
  // Provider capabilities matrix with updated 2025 models
  private readonly capabilities: Record<string, ProviderCapability> = {
    openai: {
      text: true,
      image: true,
      research: true,
      multimodal: true,
      maxTokens: 128000,
      costPer1kTokens: 0.03
    },
    anthropic: {
      text: true,
      image: false,
      research: true,
      multimodal: false,
      maxTokens: 200000,
      costPer1kTokens: 0.025
    },
    google: {
      text: true,
      image: true,
      research: true,
      multimodal: true,
      maxTokens: 1000000,
      costPer1kTokens: 0.02
    },
    perplexity: {
      text: true,
      image: false,
      research: true,
      multimodal: false,
      maxTokens: 128000,
      costPer1kTokens: 0.015
    }
  };
  
  // Task-specific fallback chains as specified in the assignment
  private readonly fallbackChains: Record<string, string[]> = {
    research: ['perplexity', 'anthropic', 'google', 'openai'],
    writing: ['anthropic', 'openai', 'google'],
    image: ['google', 'openai'],
    creative: ['openai', 'anthropic', 'google'],
    analysis: ['anthropic', 'google', 'openai'],
    multimodal: ['google', 'openai'],
    ideation: ['openai', 'anthropic', 'google'],
    default: ['anthropic', 'openai', 'google', 'perplexity']
  };
  
  constructor() {
    // Start health monitoring automatically
    this.startHealthMonitoring();
  }
  
  /**
   * Intelligently select the best provider for a given task
   */
  async selectProvider(
    taskType: string,
    requirements: TaskRequirements,
    preferredProvider?: string
  ): Promise<EnhancedProviderConfig> {
    try {
      const availableProviders = await this.getAvailableProviders();
      const capableProviders = this.filterByCapability(availableProviders, requirements);
      
      // Check preferred provider first
      if (preferredProvider && this.isProviderSuitable(preferredProvider, requirements, capableProviders)) {
        const health = this.providerHealth.get(preferredProvider);
        if (health?.isHealthy !== false) {
          return this.prepareProvider(preferredProvider, taskType, capableProviders);
        }
      }
      
      // Use fallback chain for task type
      const chain = this.fallbackChains[taskType] || this.fallbackChains.default;
      
      for (const providerName of chain) {
        if (this.isProviderSuitable(providerName, requirements, capableProviders)) {
          const health = this.providerHealth.get(providerName);
          
          // Skip unhealthy providers unless no alternatives exist
          if (health && !health.isHealthy && capableProviders.length > 1) {
            continue;
          }
          
          return this.prepareProvider(providerName, taskType, capableProviders);
        }
      }
      
      throw new ProviderError(`No suitable provider available for ${taskType}`);
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(`Provider selection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get available providers from database
   */
  private async getAvailableProviders(): Promise<string[]> {
    try {
      const providers = await db.select().from(providerSettings);
      
      return providers
        .filter((p: any) => p.active && p.apiKeyEncrypted && p.testSuccess !== false)
        .map((p: any) => p.provider);
    } catch (error) {
      throw new Error(`Failed to get available providers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Filter providers by capability requirements
   */
  private filterByCapability(
    providers: string[],
    requirements: TaskRequirements
  ): string[] {
    return providers.filter(provider => {
      const cap = this.capabilities[provider];
      if (!cap) return false;
      
      // Check capability match
      if (!cap[requirements.capability]) return false;
      
      // Check token requirements
      if (requirements.minTokens && cap.maxTokens < requirements.minTokens) {
        return false;
      }
      
      // Check cost requirements
      if (requirements.maxCost && cap.costPer1kTokens > requirements.maxCost) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Check if provider is suitable for requirements
   */
  private isProviderSuitable(
    provider: string,
    requirements: TaskRequirements,
    capableProviders: string[]
  ): boolean {
    return capableProviders.includes(provider);
  }
  
  /**
   * Prepare provider configuration with fallback chain
   */
  private async prepareProvider(
    provider: string, 
    taskType: string, 
    availableProviders: string[]
  ): Promise<EnhancedProviderConfig> {
    const models = this.getModelsForTask(provider, taskType);
    const config = this.getConfigForTask(provider, taskType);
    const chain = this.getFallbackChainFrom(provider, taskType, availableProviders);
    const health = this.providerHealth.get(provider) || this.createDefaultHealth(provider);
    
    // Get decrypted API key
    const providerData = await db.select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider as any))
      .limit(1);
    
    if (!providerData[0]) {
      throw new ProviderError(`Provider ${provider} not found in database`);
    }
    
    const apiKey = await decrypt(providerData[0].apiKeyEncrypted!, providerData[0].encryptionSalt!);
    
    return {
      provider,
      apiKey,
      model: models[0],
      config,
      fallbackChain: chain,
      health
    };
  }
  
  /**
   * Get optimal models for provider and task
   */
  private getModelsForTask(provider: string, taskType: string): string[] {
    const modelMap: Record<string, Record<string, string[]>> = {
      openai: {
        writing: ['gpt-4o', 'gpt-4-turbo'],
        creative: ['gpt-4o', 'gpt-4-turbo'],
        image: ['dall-e-3', 'dall-e-2'],
        research: ['gpt-4o'],
        analysis: ['gpt-4o'],
        multimodal: ['gpt-4o'],
        ideation: ['gpt-4o']
      },
      anthropic: {
        writing: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
        creative: ['claude-3-5-sonnet-20241022'],
        research: ['claude-3-5-sonnet-20241022'],
        analysis: ['claude-3-5-sonnet-20241022'],
        ideation: ['claude-3-5-sonnet-20241022']
      },
      google: {
        writing: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
        creative: ['gemini-1.5-pro-latest'],
        image: ['imagen-3.0-generate-001'],
        research: ['gemini-1.5-pro-latest'],
        analysis: ['gemini-1.5-pro-latest'],
        multimodal: ['gemini-1.5-pro-latest'],
        ideation: ['gemini-1.5-pro-latest']
      },
      perplexity: {
        research: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
        writing: ['llama-3.1-sonar-large-128k-chat'],
        analysis: ['llama-3.1-sonar-large-128k-online']
      }
    };
    
    const providerModels = modelMap[provider];
    if (!providerModels) return [];
    
    return providerModels[taskType] || providerModels.writing || [];
  }
  
  /**
   * Get task-optimized configuration
   */
  private getConfigForTask(provider: string, taskType: string): any {
    const baseConfig = {
      temperature: 0.7,
      maxTokens: 4000
    };
    
    const taskConfigs: Record<string, { temperature: number; maxTokens: number }> = {
      writing: { temperature: 0.7, maxTokens: 4000 },
      creative: { temperature: 0.9, maxTokens: 4000 },
      research: { temperature: 0.3, maxTokens: 8000 },
      analysis: { temperature: 0.2, maxTokens: 4000 },
      ideation: { temperature: 0.8, maxTokens: 3000 },
      image: { temperature: 0.7, maxTokens: 1000 }
    };
    
    return { ...baseConfig, ...(taskConfigs[taskType] || {}) };
  }
  
  /**
   * Get remaining fallback chain from current provider
   */
  private getFallbackChainFrom(provider: string, taskType: string, availableProviders: string[]): string[] {
    const chain = this.fallbackChains[taskType] || this.fallbackChains.default;
    const index = chain.indexOf(provider);
    const remainingChain = index >= 0 ? chain.slice(index + 1) : chain;
    
    // Filter to only include available providers
    return remainingChain.filter((p: string) => availableProviders.includes(p));
  }
  
  /**
   * Create default health status for new providers
   */
  private createDefaultHealth(provider: string): ProviderHealth {
    return {
      provider,
      isHealthy: true,
      lastCheck: new Date(),
      failureCount: 0,
      averageLatency: 0,
      successRate: 1.0
    };
  }
  
  /**
   * Start health monitoring system
   */
  private startHealthMonitoring() {
    if (this.healthMonitoringActive) return;
    
    this.healthMonitoringActive = true;
    setInterval(() => {
      this.checkProvidersHealth().catch(error => {
        console.error('Health monitoring error:', error);
      });
    }, this.healthCheckInterval);
    
    // Run initial health check
    setTimeout(() => {
      this.checkProvidersHealth().catch(error => {
        console.error('Initial health check failed:', error);
      });
    }, 1000);
  }
  
  /**
   * Check health of all providers
   */
  private async checkProvidersHealth() {
    try {
      const providers = await this.getAvailableProviders();
      
      for (const provider of providers) {
        const health = await this.checkProviderHealth(provider);
        this.providerHealth.set(provider, health);
      }
    } catch (error) {
      console.error('Failed to check providers health:', error);
    }
  }
  
  /**
   * Check individual provider health
   */
  private async checkProviderHealth(provider: string): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/providers/${provider}/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        timeoutPromise
      ]);
      
      const latency = Date.now() - startTime;
      const existing = this.providerHealth.get(provider);
      const isHealthy = response.ok;
      
      return {
        provider,
        isHealthy,
        lastCheck: new Date(),
        failureCount: isHealthy ? 0 : (existing?.failureCount || 0) + 1,
        averageLatency: existing 
          ? (existing.averageLatency * 0.9 + latency * 0.1)
          : latency,
        successRate: existing
          ? (isHealthy ? existing.successRate * 0.9 + 1 * 0.1 : existing.successRate * 0.9)
          : isHealthy ? 1 : 0
      };
    } catch (error) {
      const existing = this.providerHealth.get(provider);
      
      return {
        provider,
        isHealthy: false,
        lastCheck: new Date(),
        failureCount: (existing?.failureCount || 0) + 1,
        averageLatency: existing?.averageLatency || 0,
        successRate: existing ? existing.successRate * 0.9 : 0
      };
    }
  }
  
  /**
   * Get current health status of all providers
   */
  public getHealthStatus(): Record<string, ProviderHealth> {
    const healthStatus: Record<string, ProviderHealth> = {};
    for (const [provider, health] of this.providerHealth) {
      healthStatus[provider] = health;
    }
    return healthStatus;
  }
  
  /**
   * Get provider capabilities
   */
  public getCapabilities(): Record<string, ProviderCapability> {
    return { ...this.capabilities };
  }
  
  /**
   * Get fallback chains
   */
  public getFallbackChains(): Record<string, string[]> {
    return { ...this.fallbackChains };
  }
  
  /**
   * Manually update provider health (for external usage tracking)
   */
  public updateProviderHealth(provider: string, success: boolean, latency: number) {
    const existing = this.providerHealth.get(provider) || this.createDefaultHealth(provider);
    
    const updated: ProviderHealth = {
      ...existing,
      isHealthy: success,
      lastCheck: new Date(),
      failureCount: success ? Math.max(0, existing.failureCount - 1) : existing.failureCount + 1,
      averageLatency: existing.averageLatency * 0.9 + latency * 0.1,
      successRate: existing.successRate * 0.9 + (success ? 1 : 0) * 0.1
    };
    
    this.providerHealth.set(provider, updated);
  }
}

// Export singleton instance
export const intelligentProviderSelector = new IntelligentProviderSelector();