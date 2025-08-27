// Consolidated AI API - All handlers in one file for Vercel compatibility
import { StyleGuideService } from '../src/services/ai/StyleGuideService.js';
import { ProviderService } from '../src/services/ai/ProviderService.js';
import { AnalyticsService } from '../src/services/ai/AnalyticsService.js';
import { ContextService } from '../src/services/ai/ContextService.js';
import { GenerationService } from '../src/services/ai/GenerationService.js';
import { TreeNodeService } from '../src/services/ai/TreeNodeService.js';
import { ImageGenerationService } from '../src/services/ai/ImageGenerationService.js';

// Initialize services
const styleGuideService = new StyleGuideService();
const providerService = new ProviderService();
const analyticsService = new AnalyticsService();
const contextService = new ContextService();
const generationService = new GenerationService();
const treeNodeService = new TreeNodeService();
const imageGenerationService = new ImageGenerationService();

export default async function handler(req, res) {
  const { method, query, body, url } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse the URL path to determine action
    // URL format: /api/ai/[action]/[subpath]
    const pathParts = url.split('/').filter(Boolean);
    // pathParts = ['api', 'ai', 'style-guides'] or ['api', 'ai', 'context', 'build']
    
    let action = query.action; // First check query param for backward compatibility
    
    if (!action && pathParts.length > 2) {
      // Extract action from path
      if (pathParts[2] === 'context' && pathParts[3] === 'build') {
        action = 'context-build';
      } else if (pathParts[2] === 'tree' && pathParts[3]) {
        // Handle tree operations with IDs in path
        query.nodeId = pathParts[3];
        action = 'tree';
      } else {
        action = pathParts[2]; // 'style-guides', 'providers', etc.
      }
    }
    
    // Route to appropriate handler based on action
    switch (action) {
      case 'generate':
        return await handleGenerate(req, res);
      case 'providers':
        return await handleProviders(req, res);
      case 'context':
      case 'context-build':
        return await handleContext(req, res);
      case 'style-guides':
        return await handleStyleGuides(req, res);
      case 'tree':
        return await handleTree(req, res);
      case 'analytics':
        return await handleAnalytics(req, res);
      case 'images':
        return await handleImages(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action: ' + action });
    }
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// STYLE GUIDES HANDLER
async function handleStyleGuides(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { action: subAction, type, vertical, guideId } = req.query;
        
        // If no subAction, default to listing guides
        if (!subAction) {
          const guides = await styleGuideService.getStyleGuides({
            type,
            vertical,
            activeOnly: req.query.activeOnly === 'true'
          });
          return res.json({ success: true, guides }); // Note: return as 'guides' not 'data'
        }
        
        switch (subAction) {
          case 'list':
            const guidesList = await styleGuideService.getStyleGuides({
              type,
              vertical,
              activeOnly: req.query.activeOnly === 'true'
            });
            return res.json({ success: true, data: guidesList });

          case 'active':
            const activeGuides = await styleGuideService.getActiveGuides({ vertical });
            return res.json({ success: true, data: activeGuides });

          case 'detail':
            if (!guideId) {
              return res.status(400).json({ error: 'Guide ID required' });
            }
            const guideWithVersions = await styleGuideService.getGuideWithVersions(guideId);
            return res.json({ success: true, data: guideWithVersions });

          case 'context-string':
            const contextString = await styleGuideService.getActiveGuidesContextString({
              vertical,
              types: req.query.types ? req.query.types.split(',') : undefined
            });
            return res.json({
              success: true,
              data: { contextString, tokenCount: contextString.length / 4 }
            });

          case 'types':
            const typeCounts = await styleGuideService.getTypeCounts();
            return res.json({ success: true, data: typeCounts });

          default:
            return res.json({
              success: true,
              data: await styleGuideService.getStyleGuides({ type, vertical })
            });
        }

      case 'POST':
        const { action: postAction } = req.body;
        
        switch (postAction) {
          case 'from-blogs':
            const { blogIds, type, name, vertical, description } = req.body;
            const guideFromBlogs = await styleGuideService.createGuideFromBlogs({
              blogIds, type, name, vertical, description
            });
            return res.status(201).json({ success: true, data: guideFromBlogs });

          case 'from-conversation':
            const { messages, type: convType, name: convName, vertical: convVertical } = req.body;
            const guideFromConv = await styleGuideService.createGuideFromConversation({
              messages, type: convType, name: convName, vertical: convVertical
            });
            return res.status(201).json({ success: true, data: guideFromConv });

          case 'activate-set':
            const { guideIds } = req.body;
            await styleGuideService.setActiveGuides(guideIds);
            return res.json({ success: true, message: 'Style guides activated successfully' });

          default:
            const guide = await styleGuideService.createGuide(req.body);
            return res.status(201).json({ success: true, data: guide });
        }

      case 'PUT':
        const { guideId: updateGuideId } = req.query;
        const { action: putAction } = req.body;
        
        if (!updateGuideId) {
          return res.status(400).json({ error: 'Guide ID required' });
        }

        switch (putAction) {
          case 'activate':
            await styleGuideService.activateGuide(updateGuideId);
            return res.json({ success: true, message: 'Style guide activated' });

          case 'deactivate':
            await styleGuideService.deactivateGuide(updateGuideId);
            return res.json({ success: true, message: 'Style guide deactivated' });

          case 'create-version':
            const { changes, changeSummary } = req.body;
            const newVersion = await styleGuideService.createGuideVersion(updateGuideId, {
              changes, changeSummary
            });
            return res.json({ success: true, data: newVersion });

          default:
            const updatedGuide = await styleGuideService.updateGuide(updateGuideId, req.body);
            return res.json({ success: true, data: updatedGuide });
        }

      case 'DELETE':
        const { guideId: deleteGuideId } = req.query;
        const { soft = true } = req.query;
        
        if (!deleteGuideId) {
          return res.status(400).json({ error: 'Guide ID required' });
        }

        if (soft === 'false') {
          await styleGuideService.hardDeleteGuide(deleteGuideId);
        } else {
          await styleGuideService.softDeleteGuide(deleteGuideId);
        }
        
        return res.json({ success: true, message: 'Style guide deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Style Guide API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// PROVIDERS HANDLER
async function handleProviders(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { action: subAction, provider } = req.query;
        
        switch (subAction) {
          case 'list':
            const providers = await providerService.getProviders();
            const safeProviders = providers.map(p => ({
              ...p,
              apiKeyEncrypted: undefined,
              apiKey: p.apiKeyEncrypted ? '[CONFIGURED]' : '[NOT CONFIGURED]'
            }));
            return res.json({ success: true, data: safeProviders });

          case 'models':
            if (!provider) {
              return res.status(400).json({ error: 'Provider required' });
            }
            const models = await providerService.getAvailableModels(provider);
            return res.json({ success: true, data: models });

          case 'usage':
            const { timeframe = 'month' } = req.query;
            const usage = await analyticsService.getProviderUsage({ provider, timeframe });
            return res.json({ success: true, data: usage });

          case 'health':
            if (!provider) {
              return res.status(400).json({ error: 'Provider required' });
            }
            const health = await providerService.checkProviderHealth(provider);
            return res.json({ success: true, data: health });

          case 'task-defaults':
            const taskDefaults = await providerService.getTaskDefaults();
            return res.json({ success: true, data: taskDefaults });

          default:
            const allProviders = await providerService.getProviders();
            return res.json({ success: true, data: allProviders });
        }

      case 'POST':
        const { action: postAction } = req.body;
        
        switch (postAction) {
          case 'test':
            const { provider: testProvider } = req.body;
            const testResult = await providerService.testConnection(testProvider);
            return res.json({ success: true, data: testResult });

          case 'set-default':
            const { provider: defaultProvider, taskType } = req.body;
            await providerService.setDefaultProvider(defaultProvider, taskType);
            return res.json({ success: true, message: 'Default provider set' });

          default:
            const newProvider = await providerService.saveProvider(req.body);
            return res.status(201).json({ success: true, data: newProvider });
        }

      case 'PUT':
        const { providerId } = req.query;
        if (!providerId) {
          return res.status(400).json({ error: 'Provider ID required' });
        }
        const updatedProvider = await providerService.updateProvider(providerId, req.body);
        return res.json({ success: true, data: updatedProvider });

      case 'DELETE':
        const { providerId: deleteProviderId } = req.query;
        if (!deleteProviderId) {
          return res.status(400).json({ error: 'Provider ID required' });
        }
        await providerService.removeProvider(deleteProviderId);
        return res.json({ success: true, message: 'Provider removed' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Provider API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// CONTEXT HANDLER
async function handleContext(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { action: subAction, vertical } = req.query;
        
        switch (subAction) {
          case 'sections':
            const sections = await contextService.getAvailableSections({ vertical });
            return res.json({ success: true, data: sections });

          case 'preview':
            const { sections: selectedSections } = req.query;
            const preview = await contextService.buildContextPreview({
              sections: selectedSections ? selectedSections.split(',') : [],
              vertical
            });
            return res.json({ success: true, data: preview });

          case 'templates':
            const templates = await contextService.getTemplates({ vertical });
            return res.json({ success: true, data: templates });

          default:
            return res.json({ success: true, data: await contextService.getAvailableSections() });
        }

      case 'POST':
        const { action: postAction } = req.body;
        
        // Handle both /api/ai/context/build and /api/ai?action=context-build
        if (postAction === 'build' || !postAction) {
          const { sections, vertical: buildVertical, customContext } = req.body;
          const context = await contextService.buildContext({
            sections,
            vertical: buildVertical,
            customContext
          });
          return res.json({ success: true, context }); // Note: return as 'context' not 'data'
        }
        
        switch (postAction) {
          case 'save-template':
            const { name, sections: templateSections, vertical: templateVertical } = req.body;
            const template = await contextService.saveContextTemplate({
              name,
              sections: templateSections,
              vertical: templateVertical
            });
            return res.status(201).json({ success: true, data: template });

          case 'calculate-tokens':
            const { text } = req.body;
            const tokenCount = await contextService.calculateTokens(text);
            return res.json({ success: true, data: { tokens: tokenCount } });

          default:
            // Default to build context for backward compatibility
            const defaultContext = await contextService.buildContext(req.body);
            return res.json({ success: true, context: defaultContext });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Context API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GENERATION HANDLER
async function handleGenerate(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action: subAction } = req.body;
    
    // Default to content generation if no subAction specified
    if (!subAction || subAction === 'content') {
      const { prompt, context, provider, model, temperature, maxTokens } = req.body;
      const content = await generationService.generateContent({
        prompt,
        context,
        provider,
        model,
        temperature,
        maxTokens
      });
      
      // Track usage
      await analyticsService.trackGeneration({
        provider,
        model,
        tokensUsed: content.usage?.totalTokens,
        generationType: 'content'
      });
      
      return res.json({ 
        success: true, 
        generation: content.generation, // Note: return as 'generation'
        tokensUsed: content.usage?.totalTokens,
        cost: content.cost,
        durationMs: content.durationMs
      });
    }
    
    switch (subAction) {
      case 'variations':
        const { baseContent, count = 3, variationType } = req.body;
        const variations = await generationService.generateVariations({
          baseContent,
          count,
          variationType
        });
        return res.json({ success: true, data: variations });

      case 'seo':
        const { content: seoContent, targetKeywords } = req.body;
        const seoData = await generationService.generateSEOMetadata({
          content: seoContent,
          targetKeywords
        });
        return res.json({ success: true, data: seoData });

      case 'enhance':
        const { content: enhanceContent, enhancements } = req.body;
        const enhanced = await generationService.enhanceContent({
          content: enhanceContent,
          enhancements
        });
        return res.json({ success: true, data: enhanced });

      default:
        return res.status(400).json({ error: 'Invalid generation action' });
    }
  } catch (error) {
    console.error('Generation API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// TREE HANDLER
async function handleTree(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { nodeId, depth = 1 } = req.query;
        
        if (nodeId) {
          const node = await treeNodeService.getNode(nodeId, { depth });
          return res.json({ success: true, tree: [node] }); // Return as array for compatibility
        } else {
          const rootNodes = await treeNodeService.getRootNodes();
          return res.json({ success: true, data: rootNodes });
        }

      case 'POST':
        // Handle branch creation
        if (req.url.includes('/branch')) {
          const { parentId, modifications, context } = req.body;
          const branch = await treeNodeService.createBranch({
            parentId,
            modifications,
            context
          });
          return res.status(201).json({ 
            success: true, 
            data: branch.generation,
            tokensUsed: branch.tokensUsed,
            cost: branch.cost,
            durationMs: branch.durationMs
          });
        }
        
        // Regular node creation
        const { parentId, title, content, metadata } = req.body;
        const newNode = await treeNodeService.createNode({
          parentId,
          title,
          content,
          metadata
        });
        return res.status(201).json({ success: true, data: newNode });

      case 'PUT':
        const { nodeId: updateNodeId } = req.query;
        if (!updateNodeId) {
          return res.status(400).json({ error: 'Node ID required' });
        }
        const updatedNode = await treeNodeService.updateNode(updateNodeId, req.body);
        return res.json({ success: true, data: updatedNode });

      case 'DELETE':
        // Handle both /api/ai/tree/node/[id] and query param
        let deleteNodeId = req.query.nodeId;
        if (!deleteNodeId && req.url.includes('/node/')) {
          const parts = req.url.split('/');
          deleteNodeId = parts[parts.length - 1];
        }
        
        if (!deleteNodeId) {
          return res.status(400).json({ error: 'Node ID required' });
        }
        
        await treeNodeService.deleteNode(deleteNodeId);
        return res.json({ success: true, message: 'Node deleted' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tree API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ANALYTICS HANDLER
async function handleAnalytics(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { metric, timeframe = 'week', provider, vertical } = req.query;
    
    switch (metric) {
      case 'generation-stats':
        const stats = await analyticsService.getGenerationStats({
          timeframe,
          provider,
          vertical
        });
        return res.json({ success: true, data: stats });

      case 'provider-usage':
        const usage = await analyticsService.getProviderUsage({
          provider,
          timeframe
        });
        return res.json({ success: true, data: usage });

      case 'content-performance':
        const performance = await analyticsService.getContentPerformance({
          timeframe,
          vertical
        });
        return res.json({ success: true, data: performance });

      case 'cost-analysis':
        const costs = await analyticsService.getCostAnalysis({
          timeframe,
          provider
        });
        return res.json({ success: true, data: costs });

      default:
        const overview = await analyticsService.getAnalyticsOverview({
          timeframe
        });
        return res.json({ success: true, data: overview });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// IMAGES HANDLER
async function handleImages(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { imageId } = req.query;
        
        if (imageId) {
          const image = await imageGenerationService.getImage(imageId);
          return res.json({ success: true, data: image });
        } else {
          const images = await imageGenerationService.getRecentImages();
          return res.json({ success: true, data: images });
        }

      case 'POST':
        const { prompt, style, size, provider: imageProvider } = req.body;
        const generatedImage = await imageGenerationService.generateImage({
          prompt,
          style,
          size,
          provider: imageProvider
        });
        
        // Track usage
        await analyticsService.trackGeneration({
          provider: imageProvider,
          generationType: 'image'
        });
        
        return res.status(201).json({ success: true, data: generatedImage });

      case 'DELETE':
        const { imageId: deleteImageId } = req.query;
        if (!deleteImageId) {
          return res.status(400).json({ error: 'Image ID required' });
        }
        await imageGenerationService.deleteImage(deleteImageId);
        return res.json({ success: true, message: 'Image deleted' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Images API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}