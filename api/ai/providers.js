// Provider Management API Endpoints
// Handles provider configuration, testing, and usage tracking

import { ProviderService } from '../../src/services/ai/ProviderService.js';
import { AnalyticsService } from '../../src/services/ai/AnalyticsService.js';

const providerService = new ProviderService();
const analyticsService = new AnalyticsService();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetProviders(req, res);
      case 'POST':
        return await handleCreateProvider(req, res);
      case 'PUT':
        return await handleUpdateProvider(req, res);
      case 'DELETE':
        return await handleDeleteProvider(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Provider API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function handleGetProviders(req, res) {
  const { action, provider } = req.query;

  switch (action) {
    case 'list':
      // Get all configured providers
      const providers = await providerService.getProviders();
      // Don't return API keys in the response
      const safeProviders = providers.map(p => ({
        ...p,
        apiKeyEncrypted: undefined,
        apiKey: p.apiKeyEncrypted ? '[CONFIGURED]' : '[NOT CONFIGURED]'
      }));
      return res.json({
        success: true,
        data: safeProviders
      });

    case 'models':
      // Get available models for a provider
      if (!provider) {
        return res.status(400).json({ error: 'Provider required' });
      }
      const models = await providerService.getAvailableModels(provider);
      return res.json({
        success: true,
        data: models
      });

    case 'usage':
      // Get usage statistics for providers
      const { timeframe = 'month' } = req.query;
      const usage = await analyticsService.getProviderUsage({
        provider,
        timeframe
      });
      return res.json({
        success: true,
        data: usage
      });

    case 'health':
      // Check provider health/connectivity
      if (!provider) {
        return res.status(400).json({ error: 'Provider required' });
      }
      const health = await providerService.checkProviderHealth(provider);
      return res.json({
        success: true,
        data: health
      });

    case 'task-defaults':
      // Get task-specific provider defaults
      const taskDefaults = await providerService.getTaskDefaults();
      return res.json({
        success: true,
        data: taskDefaults
      });

    case 'cost-estimate':
      // Estimate cost for a generation
      const { tokens, model } = req.query;
      if (!provider || !tokens || !model) {
        return res.status(400).json({ 
          error: 'Provider, tokens, and model required' 
        });
      }
      const cost = await providerService.estimateCost(
        parseInt(tokens), 
        provider, 
        model
      );
      return res.json({
        success: true,
        data: { estimatedCost: cost }
      });

    default:
      return res.json({
        success: true,
        data: await providerService.getProviders()
      });
  }
}

async function handleCreateProvider(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'test-connection':
      // Test provider connection before saving
      const { provider, apiKey, model } = req.body;
      const testResult = await providerService.testConnection(provider, apiKey, model);
      return res.json({
        success: true,
        data: testResult
      });

    case 'configure':
      // Configure new provider
      const providerConfig = await providerService.configureProvider(req.body);
      return res.status(201).json({
        success: true,
        data: {
          ...providerConfig,
          apiKeyEncrypted: undefined,
          apiKey: '[CONFIGURED]'
        }
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleUpdateProvider(req, res) {
  const { provider } = req.query;
  const { action } = req.body;
  
  if (!provider) {
    return res.status(400).json({ error: 'Provider required' });
  }

  switch (action) {
    case 'api-key':
      // Update API key
      const { apiKey } = req.body;
      await providerService.updateApiKey(provider, apiKey);
      return res.json({
        success: true,
        message: 'API key updated successfully'
      });

    case 'models':
      // Update available models
      const { models } = req.body;
      await providerService.updateModels(provider, models);
      return res.json({
        success: true,
        message: 'Models updated successfully'
      });

    case 'task-defaults':
      // Update task-specific defaults
      const { taskDefaults } = req.body;
      await providerService.updateTaskDefaults(provider, taskDefaults);
      return res.json({
        success: true,
        message: 'Task defaults updated successfully'
      });

    case 'limits':
      // Update usage limits
      const { monthlyLimit, dailyLimit } = req.body;
      await providerService.updateLimits(provider, { monthlyLimit, dailyLimit });
      return res.json({
        success: true,
        message: 'Limits updated successfully'
      });

    default:
      // Default update
      const updatedProvider = await providerService.updateProvider(provider, req.body);
      return res.json({
        success: true,
        data: {
          ...updatedProvider,
          apiKeyEncrypted: undefined,
          apiKey: '[CONFIGURED]'
        }
      });
  }
}

async function handleDeleteProvider(req, res) {
  const { provider } = req.query;
  
  if (!provider) {
    return res.status(400).json({ error: 'Provider required' });
  }

  await providerService.deleteProvider(provider);
  
  return res.json({
    success: true,
    message: 'Provider configuration deleted successfully'
  });
}