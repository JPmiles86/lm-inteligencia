// Image Generation and Management API Endpoints
// Handles image generation, prompt parsing, character consistency

import { ImageService } from '../../src/services/ai/ImageService.js';
import { CharacterService } from '../../src/services/ai/CharacterService.js';

const imageService = new ImageService();
const characterService = new CharacterService();

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
        return await handleGetImages(req, res);
      case 'POST':
        return await handleGenerateImage(req, res);
      case 'PUT':
        return await handleUpdateImage(req, res);
      case 'DELETE':
        return await handleDeleteImage(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Image API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function handleGetImages(req, res) {
  const { action, nodeId, characterId } = req.query;

  switch (action) {
    case 'parse-prompts':
      // Parse image prompts from content
      const { content } = req.query;
      if (!content) {
        return res.status(400).json({ error: 'Content required' });
      }
      const prompts = await imageService.parseImagePrompts(content);
      return res.json({
        success: true,
        data: prompts
      });

    case 'node-prompts':
      // Get image prompts for a generation node
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID required' });
      }
      const nodePrompts = await imageService.getNodeImagePrompts(nodeId);
      return res.json({
        success: true,
        data: nodePrompts
      });

    case 'generated-images':
      // Get generated images for a node or prompt
      const { promptId } = req.query;
      const generatedImages = await imageService.getGeneratedImages({
        nodeId,
        promptId
      });
      return res.json({
        success: true,
        data: generatedImages
      });

    case 'characters':
      // Get available characters
      const characters = await characterService.getCharacters();
      return res.json({
        success: true,
        data: characters
      });

    case 'character':
      // Get specific character details
      if (!characterId) {
        return res.status(400).json({ error: 'Character ID required' });
      }
      const character = await characterService.getCharacter(characterId);
      return res.json({
        success: true,
        data: character
      });

    case 'reference-images':
      // Get reference images
      const { type, tags } = req.query;
      const referenceImages = await imageService.getReferenceImages({
        type,
        tags: tags ? tags.split(',') : undefined
      });
      return res.json({
        success: true,
        data: referenceImages
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleGenerateImage(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'single':
      // Generate single image
      const { 
        prompt, 
        provider = 'openai',
        model,
        size = '1024x1024',
        quality = 'standard',
        style,
        characterIds = [],
        referenceImages = []
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt required' });
      }

      const singleImage = await imageService.generateImage({
        prompt,
        provider,
        model,
        size,
        quality,
        style,
        characterIds,
        referenceImages
      });

      return res.json({
        success: true,
        data: singleImage
      });

    case 'batch':
      // Generate multiple images from prompts
      const { prompts, batchConfig } = req.body;
      if (!prompts || !Array.isArray(prompts)) {
        return res.status(400).json({ error: 'Prompts array required' });
      }

      const batchImages = await imageService.generateBatch(prompts, batchConfig);
      return res.json({
        success: true,
        data: batchImages
      });

    case 'from-node':
      // Generate images for all prompts in a generation node
      const { nodeId: generateNodeId, config } = req.body;
      if (!generateNodeId) {
        return res.status(400).json({ error: 'Node ID required' });
      }

      const nodeImages = await imageService.generateFromNode(generateNodeId, config);
      return res.json({
        success: true,
        data: nodeImages
      });

    case 'with-character':
      // Generate image with character consistency
      const { 
        basePrompt, 
        characterId: genCharacterId, 
        provider: charProvider = 'openai' 
      } = req.body;
      
      if (!basePrompt || !genCharacterId) {
        return res.status(400).json({ 
          error: 'Base prompt and character ID required' 
        });
      }

      const characterImage = await imageService.generateWithCharacter(
        basePrompt, 
        genCharacterId, 
        charProvider
      );
      
      return res.json({
        success: true,
        data: characterImage
      });

    case 'enhance-prompt':
      // Enhance image prompt with style and references
      const { 
        originalPrompt, 
        styleReferences, 
        brandAssets, 
        enhancementType = 'comprehensive'
      } = req.body;

      if (!originalPrompt) {
        return res.status(400).json({ error: 'Original prompt required' });
      }

      const enhancedPrompt = await imageService.enhancePrompt({
        originalPrompt,
        styleReferences,
        brandAssets,
        enhancementType
      });

      return res.json({
        success: true,
        data: { enhancedPrompt }
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleUpdateImage(req, res) {
  const { promptId } = req.query;
  const { action } = req.body;
  
  switch (action) {
    case 'edit-prompt':
      // Edit an image prompt
      if (!promptId) {
        return res.status(400).json({ error: 'Prompt ID required' });
      }
      
      const { newPrompt, position } = req.body;
      const updatedPrompt = await imageService.updatePrompt(promptId, {
        prompt: newPrompt,
        position
      });
      
      return res.json({
        success: true,
        data: updatedPrompt
      });

    case 'regenerate':
      // Regenerate image from existing prompt
      if (!promptId) {
        return res.status(400).json({ error: 'Prompt ID required' });
      }
      
      const { config: regenConfig } = req.body;
      const regeneratedImage = await imageService.regenerateImage(promptId, regenConfig);
      
      return res.json({
        success: true,
        data: regeneratedImage
      });

    case 'add-character':
      // Add character to existing prompt
      if (!promptId) {
        return res.status(400).json({ error: 'Prompt ID required' });
      }
      
      const { characterId: addCharacterId } = req.body;
      const updatedWithCharacter = await imageService.addCharacterToPrompt(
        promptId, 
        addCharacterId
      );
      
      return res.json({
        success: true,
        data: updatedWithCharacter
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleDeleteImage(req, res) {
  const { promptId, imageId } = req.query;
  
  if (imageId) {
    // Delete specific generated image
    await imageService.deleteGeneratedImage(imageId);
    return res.json({
      success: true,
      message: 'Generated image deleted successfully'
    });
  }
  
  if (promptId) {
    // Delete image prompt and all generated images
    await imageService.deleteImagePrompt(promptId);
    return res.json({
      success: true,
      message: 'Image prompt and generated images deleted successfully'
    });
  }
  
  return res.status(400).json({ 
    error: 'Either prompt ID or image ID required' 
  });
}