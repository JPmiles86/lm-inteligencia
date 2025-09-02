/**
 * Generation Routes
 * Secure API endpoints for AI generation
 */

import { Router, Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { encryptionService } from '../services/encryption.service';
import { db } from '../server';
import { providerSettings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Generate text content
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, provider, model, maxTokens, temperature, type } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
      });
    }

    const response = await aiService.generate({
      prompt,
      provider,
      model,
      maxTokens,
      temperature,
      type,
    });

    res.json(response);
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Generation failed',
    });
  }
});

/**
 * Generate image
 */
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, size = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
      });
    }

    const response = await aiService.generateImageWithOpenAI(prompt, size);
    res.json(response);
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation failed',
    });
  }
});

/**
 * Store a provider's API key (encrypted)
 */
router.post('/providers/configure', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, models, settings } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Provider and API key are required',
      });
    }

    // Validate key format
    if (!encryptionService.validateKeyFormat(provider, apiKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key format',
      });
    }

    // Encrypt the API key
    const encryptedKey = encryptionService.encrypt(apiKey);

    // Check if provider exists
    const existing = await db
      .select()
      .from(providers)
      .where(eq(providers.name, provider))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(providers)
        .set({
          apiKey: encryptedKey,
          models: models || existing[0].models,
          settings: settings || existing[0].settings,
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(providers.name, provider));
    } else {
      // Insert new
      await db.insert(providers).values({
        name: provider,
        apiKey: encryptedKey,
        models: models || [],
        settings: settings || {},
        active: true,
      });
    }

    res.json({
      success: true,
      message: `Provider ${provider} configured successfully`,
    });
  } catch (error: any) {
    console.error('Provider configuration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to configure provider',
    });
  }
});

/**
 * Test a provider's API key
 */
router.post('/providers/test', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider is required',
      });
    }

    const isValid = await aiService.testProvider(provider);

    res.json({
      success: true,
      isValid,
      message: isValid 
        ? `${provider} is working correctly` 
        : `${provider} test failed`,
    });
  } catch (error: any) {
    console.error('Provider test error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Test failed',
    });
  }
});

/**
 * Get configured providers (without exposing keys)
 */
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const result = await db.select({
      id: providers.id,
      name: providers.name,
      active: providers.active,
      models: providers.models,
      settings: providers.settings,
      createdAt: providers.createdAt,
      updatedAt: providers.updatedAt,
    }).from(providers);

    res.json({
      success: true,
      providers: result,
    });
  } catch (error: any) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get providers',
    });
  }
});

export default router;