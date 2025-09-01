import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../server';
import { providerSettings } from '../../src/db/schema';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error.middleware';
import { encrypt, decrypt } from '../utils/encryption';
import { intelligentProviderSelector } from '../services/intelligentProviderSelector';
import { usageTracker } from '../services/usageTracker';

const router = Router();

// Get all provider settings (without exposing API keys)
router.get('/', asyncHandler(async (req, res) => {
  try {
    const providers = await db.select().from(providerSettings);
    
    // Transform data to not expose encrypted keys
    const safeProviders = providers.map(provider => ({
      ...provider,
      apiKeyEncrypted: undefined,
      encryptionSalt: undefined,
      hasApiKey: !!provider.apiKeyEncrypted,
      isConfigured: !!provider.apiKeyEncrypted && provider.active
    }));

    res.json({
      providers: safeProviders,
      count: safeProviders.length
    });
  } catch (error) {
    throw new Error(`Failed to fetch providers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get specific provider settings
router.get('/:provider', asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  if (!['openai', 'anthropic', 'google', 'perplexity'].includes(provider)) {
    throw new ValidationError('Invalid provider name');
  }

  try {
    const result = await db.select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider as any))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Provider '${provider}' not found`);
    }

    const providerData = result[0];
    const safeProvider = {
      ...providerData,
      apiKeyEncrypted: undefined,
      encryptionSalt: undefined,
      hasApiKey: !!providerData.apiKeyEncrypted,
      isConfigured: !!providerData.apiKeyEncrypted && providerData.active
    };

    res.json(safeProvider);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to fetch provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Add or update provider API key
router.post('/:provider', asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { apiKey, settings = {} } = req.body;
  
  if (!['openai', 'anthropic', 'google', 'perplexity'].includes(provider)) {
    throw new ValidationError('Invalid provider name');
  }

  if (!apiKey || typeof apiKey !== 'string') {
    throw new ValidationError('API key is required and must be a string');
  }

  try {
    // Encrypt the API key
    const { encrypted, salt } = await encrypt(apiKey);

    // Define default models for each provider
    const defaultModels = {
      openai: {
        defaultModel: 'gpt-4o',
        fallbackModel: 'gpt-4o-mini',
        taskDefaults: {
          writing: { model: 'gpt-4o' },
          research: { model: 'gpt-4o' },
          ideation: { model: 'gpt-4o' },
          image: { model: 'dall-e-3' }
        }
      },
      anthropic: {
        defaultModel: 'claude-3-5-sonnet-20241022',
        fallbackModel: 'claude-3-5-haiku-20241022',
        taskDefaults: {
          writing: { model: 'claude-3-5-sonnet-20241022' },
          research: { model: 'claude-3-5-sonnet-20241022' },
          ideation: { model: 'claude-3-5-sonnet-20241022' }
        }
      },
      google: {
        defaultModel: 'gemini-1.5-pro-latest',
        fallbackModel: 'gemini-1.5-flash-latest',
        taskDefaults: {
          writing: { model: 'gemini-1.5-pro-latest' },
          research: { model: 'gemini-1.5-pro-latest' },
          ideation: { model: 'gemini-1.5-pro-latest' },
          image: { model: 'imagen-3.0-generate-001' }
        }
      },
      perplexity: {
        defaultModel: 'llama-3.1-sonar-large-128k-online',
        fallbackModel: 'llama-3.1-sonar-small-128k-online',
        taskDefaults: {
          research: { model: 'llama-3.1-sonar-large-128k-online' },
          writing: { model: 'llama-3.1-sonar-large-128k-chat' }
        }
      }
    };

    const providerDefaults = defaultModels[provider as keyof typeof defaultModels];

    // Check if provider exists
    const existingProvider = await db.select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider as any))
      .limit(1);

    const providerData = {
      provider: provider as any,
      apiKeyEncrypted: encrypted,
      encryptionSalt: salt,
      defaultModel: providerDefaults.defaultModel,
      fallbackModel: providerDefaults.fallbackModel,
      taskDefaults: providerDefaults.taskDefaults,
      settings: {
        temperature: 0.7,
        maxTokens: 4000,
        ...settings
      },
      active: true,
      updatedAt: new Date()
    };

    let result;
    if (existingProvider.length > 0) {
      // Update existing provider
      result = await db.update(providerSettings)
        .set(providerData)
        .where(eq(providerSettings.provider, provider as any))
        .returning();
    } else {
      // Insert new provider
      result = await db.insert(providerSettings)
        .values({
          ...providerData,
          createdAt: new Date()
        })
        .returning();
    }

    const savedProvider = result[0];
    const safeProvider = {
      ...savedProvider,
      apiKeyEncrypted: undefined,
      encryptionSalt: undefined,
      hasApiKey: true,
      isConfigured: true
    };

    res.json({
      message: existingProvider.length > 0 ? 'Provider updated successfully' : 'Provider added successfully',
      provider: safeProvider
    });
  } catch (error) {
    throw new Error(`Failed to save provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Test provider connection
router.post('/:provider/test', asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  if (!['openai', 'anthropic', 'google', 'perplexity'].includes(provider)) {
    throw new ValidationError('Invalid provider name');
  }

  try {
    // Get provider settings from database
    const result = await db.select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider as any))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Provider '${provider}' not configured`);
    }

    const providerData = result[0];
    if (!providerData.apiKeyEncrypted) {
      throw new ValidationError('Provider API key not configured');
    }

    // Decrypt the API key
    const apiKey = await decrypt(providerData.apiKeyEncrypted, providerData.encryptionSalt!);

    // Test the provider connection
    const testResult = await testProviderConnection(provider as any, apiKey, providerData.defaultModel);

    // Update test status in database
    await db.update(providerSettings)
      .set({
        lastTested: new Date(),
        testSuccess: testResult.success,
        updatedAt: new Date()
      })
      .where(eq(providerSettings.provider, provider as any));

    res.json({
      provider,
      success: testResult.success,
      message: testResult.message,
      model: testResult.model,
      responseTime: testResult.responseTime,
      testedAt: new Date().toISOString()
    });
  } catch (error) {
    // Update test failure in database
    try {
      await db.update(providerSettings)
        .set({
          lastTested: new Date(),
          testSuccess: false,
          updatedAt: new Date()
        })
        .where(eq(providerSettings.provider, provider as any));
    } catch (dbError) {
      console.error('Failed to update test status:', dbError);
    }

    throw error;
  }
}));

// Delete provider configuration
router.delete('/:provider', asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  if (!['openai', 'anthropic', 'google', 'perplexity'].includes(provider)) {
    throw new ValidationError('Invalid provider name');
  }

  try {
    const result = await db.delete(providerSettings)
      .where(eq(providerSettings.provider, provider as any))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError(`Provider '${provider}' not found`);
    }

    res.json({
      message: 'Provider configuration deleted successfully',
      provider: result[0].provider
    });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to delete provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Test provider connection function
async function testProviderConnection(provider: string, apiKey: string, model: string) {
  const startTime = Date.now();
  
  try {
    switch (provider) {
      case 'openai':
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });
        const openaiResponse = await openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: 'Test connection. Please respond with "OK".' }],
          max_tokens: 10
        });
        return {
          success: true,
          message: 'Connection successful',
          model,
          responseTime: Date.now() - startTime,
          response: openaiResponse.choices[0]?.message?.content
        };

      case 'anthropic':
        const { Anthropic } = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });
        const anthropicResponse = await anthropic.messages.create({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test connection. Please respond with "OK".' }]
        });
        return {
          success: true,
          message: 'Connection successful',
          model,
          responseTime: Date.now() - startTime,
          response: anthropicResponse.content[0]?.type === 'text' ? anthropicResponse.content[0].text : ''
        };

      case 'google':
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const google = new GoogleGenerativeAI(apiKey);
        const googleModel = google.getGenerativeModel({ model: model || 'gemini-1.5-pro-latest' });
        const googleResponse = await googleModel.generateContent('Test connection. Please respond with "OK".');
        return {
          success: true,
          message: 'Connection successful',
          model,
          responseTime: Date.now() - startTime,
          response: googleResponse.response.text()
        };

      case 'perplexity':
        // Perplexity uses OpenAI-compatible API
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Test connection. Please respond with "OK".' }],
            max_tokens: 10
          })
        });

        if (!perplexityResponse.ok) {
          throw new Error(`HTTP ${perplexityResponse.status}: ${perplexityResponse.statusText}`);
        }

        const perplexityData = await perplexityResponse.json();
        return {
          success: true,
          message: 'Connection successful',
          model,
          responseTime: Date.now() - startTime,
          response: perplexityData.choices[0]?.message?.content
        };

      default:
        throw new Error('Unsupported provider');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      model,
      responseTime: Date.now() - startTime
    };
  }
}

// ================================
// INTELLIGENT FALLBACK SYSTEM ROUTES
// ================================

// Get provider health status
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const healthStatus = intelligentProviderSelector.getHealthStatus();
    res.json(healthStatus);
  } catch (error) {
    throw new Error(`Failed to get health status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get specific provider health
router.get('/:provider/health', asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  if (!['openai', 'anthropic', 'google', 'perplexity'].includes(provider)) {
    throw new ValidationError('Invalid provider name');
  }

  try {
    const healthStatus = intelligentProviderSelector.getHealthStatus();
    const providerHealth = healthStatus[provider];
    
    if (!providerHealth) {
      throw new NotFoundError(`Health data for provider '${provider}' not found`);
    }

    res.json(providerHealth);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to get provider health: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get usage statistics
router.get('/usage', asyncHandler(async (req, res) => {
  try {
    const { provider, days = '30' } = req.query;
    const daysParsed = parseInt(days as string, 10);
    
    if (isNaN(daysParsed) || daysParsed < 1 || daysParsed > 365) {
      throw new ValidationError('Days parameter must be between 1 and 365');
    }

    const stats = await usageTracker.getUsageStats(
      provider as string | undefined, 
      daysParsed
    );
    
    res.json(stats);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new Error(`Failed to get usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get monthly usage limits status
router.get('/monthly-usage', asyncHandler(async (req, res) => {
  try {
    const monthlyUsage = await usageTracker.getMonthlyUsage();
    res.json(monthlyUsage);
  } catch (error) {
    throw new Error(`Failed to get monthly usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get cost breakdown
router.get('/cost-breakdown', asyncHandler(async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysParsed = parseInt(days as string, 10);
    
    if (isNaN(daysParsed) || daysParsed < 1 || daysParsed > 365) {
      throw new ValidationError('Days parameter must be between 1 and 365');
    }

    const breakdown = await usageTracker.getCostBreakdown(daysParsed);
    res.json(breakdown);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new Error(`Failed to get cost breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get provider performance comparison
router.get('/performance-comparison', asyncHandler(async (req, res) => {
  try {
    const { days = '7' } = req.query;
    const daysParsed = parseInt(days as string, 10);
    
    if (isNaN(daysParsed) || daysParsed < 1 || daysParsed > 365) {
      throw new ValidationError('Days parameter must be between 1 and 365');
    }

    const comparison = await usageTracker.getProviderComparison(daysParsed);
    res.json(comparison);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new Error(`Failed to get performance comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get provider capabilities
router.get('/capabilities', asyncHandler(async (req, res) => {
  try {
    const capabilities = intelligentProviderSelector.getCapabilities();
    res.json(capabilities);
  } catch (error) {
    throw new Error(`Failed to get capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get fallback chains
router.get('/fallback-chains', asyncHandler(async (req, res) => {
  try {
    const chains = intelligentProviderSelector.getFallbackChains();
    res.json(chains);
  } catch (error) {
    throw new Error(`Failed to get fallback chains: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Intelligent provider selection endpoint
router.post('/select', asyncHandler(async (req, res) => {
  const { taskType, requirements, preferredProvider } = req.body;
  
  if (!taskType || typeof taskType !== 'string') {
    throw new ValidationError('Task type is required and must be a string');
  }

  if (!requirements || typeof requirements !== 'object') {
    throw new ValidationError('Requirements object is required');
  }

  try {
    const selectedProvider = await intelligentProviderSelector.selectProvider(
      taskType,
      requirements,
      preferredProvider
    );
    
    res.json({
      success: true,
      provider: selectedProvider.provider,
      model: selectedProvider.model,
      config: selectedProvider.config,
      fallbackChain: selectedProvider.fallbackChain,
      health: selectedProvider.health
    });
  } catch (error) {
    throw new Error(`Provider selection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Export usage data
router.get('/export-usage', asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    if (format !== 'json' && format !== 'csv') {
      throw new ValidationError('Format must be either "json" or "csv"');
    }

    const exportData = await usageTracker.exportUsageData(start, end, format as 'json' | 'csv');
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="usage-${startDate}-${endDate}.csv"`);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="usage-${startDate}-${endDate}.json"`);
    }
    
    res.send(exportData);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new Error(`Failed to export usage data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Reset monthly usage counters (admin only)
router.post('/reset-monthly', asyncHandler(async (req, res) => {
  try {
    await usageTracker.resetMonthlyCounters();
    
    res.json({
      success: true,
      message: 'Monthly usage counters reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(`Failed to reset monthly counters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Track usage manually (for testing purposes)
router.post('/track-usage', asyncHandler(async (req, res) => {
  const { provider, task, tokensUsed, cost, duration, success, model, errorMessage } = req.body;
  
  if (!provider || !task || typeof tokensUsed !== 'number' || typeof cost !== 'number') {
    throw new ValidationError('Provider, task, tokensUsed, and cost are required');
  }

  try {
    await usageTracker.trackUsage({
      provider,
      task,
      tokensUsed,
      cost,
      duration: duration || 0,
      success: success !== false,
      timestamp: new Date(),
      model: model || 'unknown',
      errorMessage
    });
    
    res.json({
      success: true,
      message: 'Usage tracked successfully'
    });
  } catch (error) {
    throw new Error(`Failed to track usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

export default router;