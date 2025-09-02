import { Router, Request, Response } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../../api/index';
import { referenceImages, characters, imagePrompts } from '../../src/db/schema';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error.middleware';
import { selectProvider } from '../services/providerSelector';
import { generateWithProvider } from '../services/aiGenerationService';

const router = Router();

// Get all reference images
router.get('/reference', asyncHandler(async (req: Request, res: Response) => {
  const { type, vertical, limit = 50 } = req.query;

  try {
    let query = db.select().from(referenceImages);

    // Apply filters
    const conditions = [];
    if (type) {
      conditions.push(eq(referenceImages.type, type as any));
    }
    if (vertical) {
      conditions.push(eq(referenceImages.vertical, vertical as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => a && b));
    }

    const images = await query
      .orderBy(desc(referenceImages.lastUsed), desc(referenceImages.createdAt))
      .limit(Math.min(100, parseInt(limit as string)));

    res.json({
      images,
      count: images.length,
      filters: { type, vertical }
    });
  } catch (error) {
    throw new Error(`Failed to fetch reference images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get reference image by ID
router.get('/reference/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const image = await db.select()
      .from(referenceImages)
      .where(eq(referenceImages.id, id))
      .limit(1);

    if (image.length === 0) {
      throw new NotFoundError(`Reference image with ID ${id} not found`);
    }

    res.json(image[0]);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to fetch reference image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get all characters
router.get('/characters', asyncHandler(async (req: Request, res: Response) => {
  const { active = true, limit = 50 } = req.query;

  try {
    let query = db.select().from(characters);

    if (active !== 'false') {
      query = query.where(eq(characters.active, true));
    }

    const characterList = await query
      .orderBy(desc(characters.lastUsed), desc(characters.createdAt))
      .limit(Math.min(100, parseInt(limit as string)));

    res.json({
      characters: characterList,
      count: characterList.length
    });
  } catch (error) {
    throw new Error(`Failed to fetch characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get character by ID
router.get('/characters/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const character = await db.select()
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);

    if (character.length === 0) {
      throw new NotFoundError(`Character with ID ${id} not found`);
    }

    // Get reference images for this character
    if (character[0].referenceImageIds && character[0].referenceImageIds.length > 0) {
      // Note: This would require a more complex query with JSON operations
      // For now, we'll return the character without expanded reference images
    }

    res.json(character[0]);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error(`Failed to fetch character: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Generate image using AI
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const {
    prompt,
    count = 1,
    size = '1024x1024',
    quality = 'standard',
    style,
    preferredProvider,
    model,
    characterIds = [],
    styleReferenceIds = [],
    settings = {}
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Prompt is required and must be a string');
  }

  if (count > 4) {
    throw new ValidationError('Cannot generate more than 4 images at once');
  }

  try {
    // Select provider with image generation capability
    const providerConfig = await selectProvider(
      'image',
      preferredProvider,
      ['image'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    // Enhance prompt with character and style references
    let enhancedPrompt = prompt;

    // Add character descriptions if provided
    if (characterIds.length > 0) {
      const characterData = await db.select()
        .from(characters)
        .where(eq(characters.active, true));

      const selectedCharacters = characterData.filter(char => 
        characterIds.includes(char.id)
      );

      if (selectedCharacters.length > 0) {
        enhancedPrompt += '\n\nCharacter descriptions:\n';
        selectedCharacters.forEach(char => {
          enhancedPrompt += `- ${char.name}: ${char.physicalDescription || char.description}\n`;
        });
      }
    }

    // Add style references if provided
    if (styleReferenceIds.length > 0) {
      const styleImages = await db.select()
        .from(referenceImages)
        .where(eq(referenceImages.type, 'style'));

      const selectedStyles = styleImages.filter(img => 
        styleReferenceIds.includes(img.id)
      );

      if (selectedStyles.length > 0) {
        enhancedPrompt += '\n\nStyle references:\n';
        selectedStyles.forEach(style => {
          enhancedPrompt += `- ${style.name}: ${style.description || 'Style reference'}\n`;
        });
      }
    }

    const startTime = Date.now();

    // Generate images
    const results = await generateWithProvider(providerConfig, {
      type: 'image',
      prompt: enhancedPrompt,
      count,
      size,
      quality,
      style,
      settings: {
        ...providerConfig.settings,
        ...settings
      }
    });

    const responseTime = Date.now() - startTime;

    // Update usage counts for characters and style references
    if (characterIds.length > 0) {
      for (const characterId of characterIds) {
        await db.update(characters)
          .set({
            usageCount: characters.usageCount + 1,
            lastUsed: new Date()
          })
          .where(eq(characters.id, characterId));
      }
    }

    if (styleReferenceIds.length > 0) {
      for (const styleId of styleReferenceIds) {
        await db.update(referenceImages)
          .set({
            usageCount: referenceImages.usageCount + 1,
            lastUsed: new Date()
          })
          .where(eq(referenceImages.id, styleId));
      }
    }

    res.json({
      success: true,
      images: results,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        enhancedPrompt: enhancedPrompt,
        originalPrompt: prompt,
        responseTime,
        imageCount: results.length,
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0),
        characterIds,
        styleReferenceIds
      }
    });
  } catch (error) {
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Enhance image prompt with character consistency
router.post('/enhance-prompt', asyncHandler(async (req: Request, res: Response) => {
  const {
    prompt,
    characterIds = [],
    styleReferenceIds = [],
    enhancementType = 'detailed'
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Prompt is required and must be a string');
  }

  try {
    let enhancedPrompt = prompt;
    const enhancements = [];

    // Add character details
    if (characterIds.length > 0) {
      const characterData = await db.select()
        .from(characters)
        .where(eq(characters.active, true));

      const selectedCharacters = characterData.filter(char => 
        characterIds.includes(char.id)
      );

      for (const character of selectedCharacters) {
        const characterDesc = character.physicalDescription || character.description;
        if (characterDesc) {
          enhancedPrompt += `\n\n${character.name}: ${characterDesc}`;
          enhancements.push(`Added character: ${character.name}`);
        }
      }
    }

    // Add style references
    if (styleReferenceIds.length > 0) {
      const styleImages = await db.select()
        .from(referenceImages)
        .where(eq(referenceImages.type, 'style'));

      const selectedStyles = styleImages.filter(img => 
        styleReferenceIds.includes(img.id)
      );

      for (const style of selectedStyles) {
        if (style.description) {
          enhancedPrompt += `\n\nStyle: ${style.description}`;
          enhancements.push(`Added style: ${style.name}`);
        }
      }
    }

    // Add enhancement based on type
    switch (enhancementType) {
      case 'detailed':
        enhancedPrompt += '\n\nPlease create a highly detailed, professional quality image with excellent composition and lighting.';
        break;
      case 'artistic':
        enhancedPrompt += '\n\nCreate this as an artistic interpretation with creative flair and visual impact.';
        break;
      case 'photorealistic':
        enhancedPrompt += '\n\nGenerate a photorealistic image with natural lighting and authentic details.';
        break;
    }

    res.json({
      originalPrompt: prompt,
      enhancedPrompt,
      enhancements,
      characterIds,
      styleReferenceIds,
      enhancementType
    });
  } catch (error) {
    throw new Error(`Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get image generation history
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  const { 
    generationNodeId,
    limit = 20,
    includePrompts = true 
  } = req.query;

  try {
    let query = db.select().from(imagePrompts);

    if (generationNodeId) {
      query = query.where(eq(imagePrompts.generationNodeId, generationNodeId as string));
    }

    const history = await query
      .orderBy(desc(imagePrompts.createdAt))
      .limit(Math.min(100, parseInt(limit as string)));

    // Filter out sensitive data if needed
    const filteredHistory = history.map(item => ({
      ...item,
      // Include or exclude prompts based on request
      originalText: includePrompts === 'true' ? item.originalText : undefined,
      editedText: includePrompts === 'true' ? item.editedText : undefined,
      finalText: includePrompts === 'true' ? item.finalText : undefined
    }));

    res.json({
      history: filteredHistory,
      count: filteredHistory.length,
      hasPrompts: includePrompts === 'true'
    });
  } catch (error) {
    throw new Error(`Failed to fetch image history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get image generation statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    // This would typically involve more complex queries
    // For now, return basic statistics
    const [
      totalReferences,
      totalCharacters,
      totalPrompts,
      recentGenerations
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(referenceImages),
      db.select({ count: sql`count(*)` }).from(characters).where(eq(characters.active, true)),
      db.select({ count: sql`count(*)` }).from(imagePrompts),
      db.select()
        .from(imagePrompts)
        .orderBy(desc(imagePrompts.createdAt))
        .limit(5)
    ]);

    res.json({
      statistics: {
        totalReferenceImages: totalReferences[0]?.count || 0,
        activeCharacters: totalCharacters[0]?.count || 0,
        totalImagePrompts: totalPrompts[0]?.count || 0
      },
      recentGenerations: recentGenerations.map(gen => ({
        id: gen.id,
        type: gen.type,
        generated: gen.generated,
        createdAt: gen.createdAt
      }))
    });
  } catch (error) {
    throw new Error(`Failed to fetch image statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

export default router;