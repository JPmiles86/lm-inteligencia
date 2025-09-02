import { eq } from 'drizzle-orm';
import { db } from '../../api/index';
import { providerSettings } from '../../src/db/schema';
import { decrypt } from '../utils/encryption';
import { ProviderError } from '../middleware/error.middleware';

// Provider capabilities mapping
interface ProviderCapabilities {
  text: boolean;
  image: boolean;
  research: boolean;
  multimodal: boolean;
}

const PROVIDER_CAPABILITIES: Record<string, ProviderCapabilities> = {
  openai: { text: true, image: true, research: true, multimodal: true },
  anthropic: { text: true, image: false, research: true, multimodal: false },
  google: { text: true, image: true, research: true, multimodal: true },
  perplexity: { text: true, image: false, research: true, multimodal: false }
};

// Task-specific fallback chains (ordered by preference)
const FALLBACK_CHAINS: Record<string, string[]> = {
  research: ['perplexity', 'anthropic', 'google', 'openai'],
  writing: ['anthropic', 'openai', 'google'],
  image: ['google', 'openai'],
  ideation: ['openai', 'anthropic', 'google'],
  analysis: ['anthropic', 'openai', 'google'],
  creative: ['openai', 'anthropic', 'google'],
  multimodal: ['openai', 'google'],
  default: ['anthropic', 'openai', 'google', 'perplexity']
};

// Provider configuration interface
export interface ProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
  settings: any;
  active: boolean;
  testSuccess: boolean;
}

// Generation request interface
export interface GenerationRequest {
  taskType: string;
  preferredProvider?: string;
  requiredCapabilities?: string[];
  excludeProviders?: string[];
  model?: string;
}

/**
 * Selects the best available provider for a given task
 */
export async function selectProvider(
  taskType: string,
  preferredProvider?: string,
  requiredCapabilities: string[] = [],
  excludeProviders: string[] = []
): Promise<ProviderConfig> {
  try {
    // Get all active providers from database
    const availableProviders = await getAvailableProviders();
    
    // Filter out excluded providers
    const filteredProviders: Record<string, any> = Object.entries(availableProviders)
      .filter(([name]) => !excludeProviders.includes(name))
      .reduce((acc, [name, config]) => ({ ...acc, [name]: config }), {} as Record<string, any>);

    // Check if preferred provider is available and meets requirements
    if (preferredProvider && filteredProviders[preferredProvider]) {
      const provider = filteredProviders[preferredProvider];
      if (meetsRequirements(preferredProvider, requiredCapabilities)) {
        return {
          ...provider,
          model: provider.model || getDefaultModelForTask(preferredProvider, taskType)
        };
      } else {
        console.warn(`Preferred provider ${preferredProvider} doesn't meet requirements for ${taskType}`);
      }
    }

    // Use fallback chain for task type
    const fallbackChain = FALLBACK_CHAINS[taskType] || FALLBACK_CHAINS.default;
    
    for (const providerName of fallbackChain) {
      if (filteredProviders[providerName] && meetsRequirements(providerName, requiredCapabilities)) {
        const provider = filteredProviders[providerName];
        return {
          ...(provider as any),
          model: (provider as any).model || getDefaultModelForTask(providerName, taskType)
        };
      }
    }

    // If no provider in fallback chain works, try any available provider
    for (const [providerName, provider] of Object.entries(filteredProviders)) {
      if (meetsRequirements(providerName, requiredCapabilities)) {
        return {
          ...(provider as any),
          model: (provider as any).model || getDefaultModelForTask(providerName, taskType)
        };
      }
    }

    throw new ProviderError(`No suitable provider available for task: ${taskType}`);
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(`Provider selection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all available and active providers from the database
 */
async function getAvailableProviders(): Promise<Record<string, ProviderConfig>> {
  try {
    const providers = await db.select().from(providerSettings);
    const availableProviders: Record<string, ProviderConfig> = {};

    for (const provider of providers) {
      // Skip inactive providers or those without API keys
      if (!provider.active || !provider.apiKeyEncrypted) {
        continue;
      }

      // Skip providers that failed their last test (if tested)
      if (provider.lastTested && provider.testSuccess === false) {
        console.warn(`Skipping provider ${provider.provider} due to failed test`);
        continue;
      }

      try {
        // Decrypt API key
        const apiKey = await decrypt(provider.apiKeyEncrypted, provider.encryptionSalt!);
        
        availableProviders[provider.provider] = {
          provider: provider.provider,
          apiKey,
          model: provider.defaultModel || '',
          settings: provider.settings || {},
          active: provider.active,
          testSuccess: provider.testSuccess ?? true
        };
      } catch (error) {
        console.error(`Failed to decrypt API key for provider ${provider.provider}:`, error);
      }
    }

    return availableProviders;
  } catch (error) {
    throw new Error(`Failed to get available providers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if a provider meets the required capabilities
 */
function meetsRequirements(providerName: string, requiredCapabilities: string[]): boolean {
  const capabilities = PROVIDER_CAPABILITIES[providerName];
  if (!capabilities) return false;

  return requiredCapabilities.every(capability => {
    switch (capability) {
      case 'text':
        return capabilities.text;
      case 'image':
        return capabilities.image;
      case 'research':
        return capabilities.research;
      case 'multimodal':
        return capabilities.multimodal;
      default:
        return true; // Unknown capabilities are assumed to be supported
    }
  });
}

/**
 * Gets the default model for a provider based on task type
 */
function getDefaultModelForTask(providerName: string, taskType: string): string {
  const taskModelMap: Record<string, Record<string, string>> = {
    openai: {
      research: 'gpt-4o',
      writing: 'gpt-4o',
      creative: 'gpt-4o',
      ideation: 'gpt-4o',
      analysis: 'gpt-4o',
      image: 'dall-e-3',
      default: 'gpt-4o'
    },
    anthropic: {
      research: 'claude-3-5-sonnet-20241022',
      writing: 'claude-3-5-sonnet-20241022',
      creative: 'claude-3-5-sonnet-20241022',
      ideation: 'claude-3-5-sonnet-20241022',
      analysis: 'claude-3-5-sonnet-20241022',
      default: 'claude-3-5-sonnet-20241022'
    },
    google: {
      research: 'gemini-1.5-pro-latest',
      writing: 'gemini-1.5-pro-latest',
      creative: 'gemini-1.5-pro-latest',
      ideation: 'gemini-1.5-pro-latest',
      analysis: 'gemini-1.5-pro-latest',
      image: 'imagen-3.0-generate-001',
      default: 'gemini-1.5-pro-latest'
    },
    perplexity: {
      research: 'llama-3.1-sonar-large-128k-online',
      writing: 'llama-3.1-sonar-large-128k-chat',
      default: 'llama-3.1-sonar-large-128k-online'
    }
  };

  const providerModels = taskModelMap[providerName];
  if (!providerModels) return '';

  return providerModels[taskType] || providerModels.default || '';
}

/**
 * Gets provider capabilities for a given provider
 */
export function getProviderCapabilities(providerName: string): ProviderCapabilities | null {
  return PROVIDER_CAPABILITIES[providerName] || null;
}

/**
 * Lists all supported providers with their capabilities
 */
export function listSupportedProviders(): Record<string, ProviderCapabilities> {
  return { ...PROVIDER_CAPABILITIES };
}

/**
 * Gets the fallback chain for a specific task type
 */
export function getFallbackChain(taskType: string): string[] {
  return [...(FALLBACK_CHAINS[taskType] || FALLBACK_CHAINS.default)];
}

/**
 * Validates if a provider configuration is complete and valid
 */
export async function validateProviderConfig(providerName: string): Promise<boolean> {
  try {
    const providers = await getAvailableProviders();
    const provider = providers[providerName];
    
    if (!provider) return false;
    if (!provider.active) return false;
    if (!provider.apiKey) return false;
    if (!provider.model) return false;

    // Additional validation could include testing the API key
    return true;
  } catch (error) {
    console.error(`Provider validation failed for ${providerName}:`, error);
    return false;
  }
}

/**
 * Gets usage statistics for providers
 */
export async function getProviderUsageStats(): Promise<Record<string, any>> {
  // This would typically pull from usage logs or analytics tables
  // For now, return basic info about configured providers
  try {
    const providers = await getAvailableProviders();
    const stats: Record<string, any> = {};

    for (const [name, config] of Object.entries(providers)) {
      stats[name] = {
        active: config.active,
        configured: !!config.apiKey,
        model: config.model,
        capabilities: PROVIDER_CAPABILITIES[name] || {}
      };
    }

    return stats;
  } catch (error) {
    console.error('Failed to get provider usage stats:', error);
    return {};
  }
}

/**
 * Updates provider settings dynamically
 */
export async function updateProviderSettings(
  providerName: string, 
  settings: any
): Promise<boolean> {
  try {
    await db.update(providerSettings)
      .set({
        settings,
        updatedAt: new Date()
      })
      .where(eq(providerSettings.provider, providerName as any));
    
    return true;
  } catch (error) {
    console.error(`Failed to update provider settings for ${providerName}:`, error);
    return false;
  }
}