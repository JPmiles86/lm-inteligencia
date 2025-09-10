/**
 * Generation Routes
 * Secure API endpoints for AI generation
 */

import { Router, Request, Response } from 'express';
import { aiService } from '../services/ai.service.js';
import { encryptionService } from '../services/encryption.service.js';
import { db } from '../../api/index.js';
import { providerSettings } from '../../src/db/schema.js';
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
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(providerSettings)
        .set({
          apiKeyEncrypted: encryptedKey,
          updatedAt: new Date(),
        })
        .where(eq(providerSettings.provider, provider));
    } else {
      // Insert new
      await db.insert(providerSettings).values({
        provider: provider as any,
        apiKeyEncrypted: encryptedKey,
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
      id: providerSettings.id,
      provider: providerSettings.provider,
      active: providerSettings.active,
      defaultModel: providerSettings.defaultModel,
      taskDefaults: providerSettings.taskDefaults,
      createdAt: providerSettings.createdAt,
      updatedAt: providerSettings.updatedAt,
    }).from(providerSettings);

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