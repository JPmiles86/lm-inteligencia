// Consolidated AI API - All handlers in one file for Vercel compatibility
console.log('[AI API] Starting imports...');

let StyleGuideService, ProviderService, AnalyticsService, ContextService, GenerationService, TreeNodeService, ImageGenerationService;
let styleGuideService, providerService, analyticsService, contextService, generationService, treeNodeService, imageGenerationService;

try {
  console.log('[AI API] Importing services...');
  
  // Import working StyleGuideService
  const module1 = await import('../src/services/ai/StyleGuideService.js');
  StyleGuideService = module1.StyleGuideService;
  
  // Import simplified ProviderService
  const module2 = await import('../src/services/ai/ProviderServiceSimple.js');
  ProviderService = module2.ProviderService;
  
  // Try to import real GenerationService, fallback to stub if it fails
  try {
    const genModule = await import('../src/services/ai/GenerationServiceReal.js');
    GenerationService = genModule.GenerationService;
    console.log('[AI API] Using real GenerationService');
  } catch (genError) {
    console.log('[AI API] Failed to load real GenerationService, using stub:', genError.message);
    const stubs = await import('../src/services/ai/StubServices.js');
    GenerationService = stubs.GenerationService;
  }
  
  // Import stub services for the rest
  const stubs = await import('../src/services/ai/StubServices.js');
  AnalyticsService = stubs.AnalyticsService;
  ContextService = stubs.ContextService;
  TreeNodeService = stubs.TreeNodeService;
  ImageGenerationService = stubs.ImageGenerationService;
  
  console.log('[AI API] All services imported successfully');
} catch (error) {
  console.error('[AI API] Failed to import services:', error.message);
  console.error('[AI API] Stack:', error.stack);
}

// Initialize services with error handling
try {
  console.log('[AI API] Initializing services...');
  if (StyleGuideService) {
    styleGuideService = new StyleGuideService();
    console.log('[AI API] StyleGuideService initialized');
  }
  if (ProviderService) providerService = new ProviderService();
  if (AnalyticsService) analyticsService = new AnalyticsService();
  if (ContextService) contextService = new ContextService();
  if (GenerationService) generationService = new GenerationService();
  if (TreeNodeService) treeNodeService = new TreeNodeService();
  if (ImageGenerationService) imageGenerationService = new ImageGenerationService();
  console.log('[AI API] All services initialized');
} catch (error) {
  console.error('[AI API] Failed to initialize services:', error.message);
}

export default async function handler(req, res) {
  const { method, query, body, url } = req;
  
  console.log('[AI API] Request received:', {
    method,
    url,
    action: query.action,
    hasBody: !!body,
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse the URL path to determine action
    // URL format: /api/ai/[action]/[subpath]
    // Remove query string from URL first
    const cleanUrl = url.split('?')[0];
    const pathParts = cleanUrl.split('/').filter(Boolean);
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
    
    // If still no action and we have a path query param (from Vercel rewrite), use it
    if (!action && query.path) {
      const pathFromQuery = query.path.split('?')[0]; // Remove any query string
      action = pathFromQuery;
    }
    
    console.log('[AI API] Determined action:', action);
    
    // Route to appropriate handler based on action
    switch (action) {
      case 'generate':
        console.log('[AI API] Routing to handleGenerate');
        return await handleGenerate(req, res);
      case 'providers':
        console.log('[AI API] Routing to handleProviders');
        return await handleProviders(req, res);
      case 'context':
      case 'context-build':
        console.log('[AI API] Routing to handleContext');
        return await handleContext(req, res);
      case 'style-guides':
        console.log('[AI API] Routing to handleStyleGuides');
        return await handleStyleGuides(req, res);
      case 'tree':
        console.log('[AI API] Routing to handleTree');
        return await handleTree(req, res);
      case 'analytics':
        console.log('[AI API] Routing to handleAnalytics');
        return await handleAnalytics(req, res);
      case 'images':
        console.log('[AI API] Routing to handleImages');
        return await handleImages(req, res);
      case 'brainstorm':
        console.log('[AI API] Routing to handleBrainstorm');
        return await handleBrainstorm(req, res);
      default:
        console.log('[AI API] Invalid action:', action);
        return res.status(400).json({ error: 'Invalid action: ' + action });
    }
  } catch (error) {
    console.error('[AI API] Fatal error:', error.message);
    console.error('[AI API] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// STYLE GUIDES HANDLER
async function handleStyleGuides(req, res) {
  console.log('[handleStyleGuides] Starting with method:', req.method);
  console.log('[handleStyleGuides] StyleGuideService available:', !!styleGuideService);
  
  if (!styleGuideService) {
    console.error('[handleStyleGuides] StyleGuideService not initialized');
    return res.status(500).json({ error: 'StyleGuideService not available' });
  }
  
  try {
    switch (req.method) {
      case 'GET':
        const { action: subAction, type, vertical, guideId } = req.query;
        
        // If no subAction, default to listing guides
        if (!subAction) {
          console.log('[handleStyleGuides] No subAction, fetching all guides...');
          try {
            const guides = await styleGuideService.getStyleGuides({
              type,
              vertical,
              activeOnly: req.query.activeOnly === 'true'
            });
            console.log('[handleStyleGuides] Fetched guides count:', guides?.length);
            return res.json({ success: true, guides });
          } catch (dbError) {
            console.error('[handleStyleGuides] Database error:', dbError.message);
            throw dbError;
          }
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
      case 'PATCH':
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
      // Pass through all parameters from the request
      const content = await generationService.generateContent(req.body);
      
      // Check if generation was successful
      if (!content.success) {
        return res.status(500).json({
          success: false,
          error: content.error || 'Generation failed'
        });
      }
      
      // Track usage
      await analyticsService.trackGeneration({
        provider: req.body.provider || 'openai',
        model: req.body.model || 'gpt-4o',
        tokensUsed: content.tokensUsed,
        generationType: req.body.task || 'content'
      });
      
      return res.json({ 
        success: true, 
        generation: content.generation, // Note: return as 'generation'
        tokensUsed: content.tokensUsed,
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

// BRAINSTORMING HANDLER
async function handleBrainstorm(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const {
      action = 'generate-ideas',
      topic,
      count = 10,
      vertical = 'all',
      tone = 'professional',
      contentTypes = [],
      provider = 'openai',
      model = 'gpt-4o',
      customContext = ''
    } = req.body;

    console.log('[handleBrainstorm] Request:', {
      action,
      topic,
      count,
      vertical,
      tone,
      provider,
      model
    });

    // Validate required fields
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and cannot be empty'
      });
    }

    if (count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 50'
      });
    }

    if (action === 'generate-ideas') {
      const startTime = Date.now();

      // Build the brainstorming prompt
      const prompt = buildBrainstormingPrompt({
        topic,
        count,
        vertical,
        tone,
        contentTypes,
        customContext
      });

      // Generate ideas using the existing generation service
      const generationConfig = {
        mode: 'direct',
        task: 'brainstorming',
        prompt: prompt,
        provider: provider,
        model: model,
        vertical: vertical,
        context: {
          styleGuides: { brand: true },
          previousContent: { 
            mode: 'none',
            includeElements: {
              titles: false,
              synopsis: false,
              content: false,
              tags: false,
              metadata: false,
              images: false
            }
          },
          additionalContext: `Brainstorming session for topic: ${topic}`
        }
      };

      if (!generationService) {
        console.error('[handleBrainstorm] GenerationService not available');
        return res.status(500).json({
          success: false,
          error: 'Generation service not available'
        });
      }

      const result = await generationService.generateContent(generationConfig);
      
      if (!result.success) {
        console.error('[handleBrainstorm] Generation failed:', result.error);
        // Provide fallback ideas
        const fallbackIdeas = generateBrainstormingFallback(topic, count);
        
        return res.status(200).json({
          success: true,
          ideas: fallbackIdeas,
          tokensUsed: 0,
          cost: 0,
          durationMs: Date.now() - startTime,
          fallback: true,
          error: `Generation failed, provided fallback ideas: ${result.error}`,
          metadata: {
            topic,
            count: fallbackIdeas.length,
            requestedCount: count,
            vertical,
            tone,
            fallback: true,
            generatedAt: new Date().toISOString()
          }
        });
      }

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      // Parse the generated content into structured ideas
      const ideas = parseBrainstormingIdeas(result.generation, topic, count);

      console.log('[handleBrainstorm] Generated ideas count:', ideas.length);

      return res.json({
        success: true,
        ideas: ideas,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        durationMs: durationMs,
        metadata: {
          topic,
          count: ideas.length,
          requestedCount: count,
          vertical,
          tone,
          contentTypes,
          provider,
          model,
          generatedAt: new Date().toISOString()
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        error: `Unknown action: ${action}`
      });
    }

  } catch (error) {
    console.error('[handleBrainstorm] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper functions for brainstorming
function buildBrainstormingPrompt({ topic, count, vertical, tone, contentTypes, customContext }) {
  const verticalContext = vertical !== 'all' ? 
    `Focus specifically on the ${vertical} industry/vertical.` : 
    'Consider multiple industries and verticals where relevant.';
  
  const contentTypeContext = contentTypes.length > 0 ?
    `Prioritize these content types: ${contentTypes.join(', ')}.` :
    'Include a variety of content types (how-to guides, listicles, tutorials, comparisons, case studies, etc.).';

  const toneContext = `Maintain a ${tone} tone throughout.`;
  
  const customSection = customContext ? 
    `\nAdditional Context: ${customContext}` : '';

  return `
You are an expert content strategist and creative ideation specialist. Generate exactly ${count} unique, compelling blog post ideas about the topic: "${topic}".

Requirements:
- ${verticalContext}
- ${contentTypeContext}  
- ${toneContext}
- Each idea must be unique and offer a distinct angle or perspective
- Ideas should be specific enough to create actionable content
- Include SEO potential and audience appeal considerations
- Ensure ideas are practical and feasible to write

${customSection}

For each idea, provide:
1. Title: A compelling, specific headline (50-70 characters ideal for SEO)
2. Angle: The unique perspective or approach (1-2 sentences)
3. Description: Brief overview of what the content would cover (2-3 sentences)
4. Tags: 3-5 relevant tags for categorization
5. Difficulty: Content creation difficulty (Beginner/Intermediate/Advanced)
6. Estimated Word Count: Suggested length for the full article

Format your response as a JSON array where each idea is an object with the above properties. Ensure valid JSON syntax.

Example structure:
[
  {
    "title": "5 Proven Strategies That Transform Customer Service",
    "angle": "Focus on actionable, data-backed strategies with real examples",
    "description": "Explore five evidence-based approaches to customer service excellence, including communication techniques, technology integration, and staff training methodologies that demonstrably improve satisfaction scores.",
    "tags": ["customer-service", "strategy", "improvement", "business", "guide"],
    "difficulty": "Intermediate",
    "estimatedWordCount": 1500
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting. Generate exactly ${count} unique ideas for "${topic}".
  `.trim();
}

function parseBrainstormingIdeas(rawContent, topic, requestedCount) {
  try {
    let ideas = [];
    
    if (typeof rawContent === 'string') {
      const cleanContent = rawContent.trim();
      
      // Look for JSON array pattern
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          ideas = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('[handleBrainstorm] JSON parse failed, using fallback');
          ideas = generateBrainstormingFallback(topic, requestedCount);
        }
      } else {
        ideas = generateBrainstormingFallback(topic, requestedCount);
      }
    } else if (Array.isArray(rawContent)) {
      ideas = rawContent;
    } else {
      ideas = generateBrainstormingFallback(topic, requestedCount);
    }

    // Ensure we have an array
    if (!Array.isArray(ideas)) {
      ideas = [ideas];
    }

    // Format and validate each idea
    const formattedIdeas = ideas.map((idea, index) => {
      const id = `idea_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      
      return {
        id,
        title: (idea.title || `${topic} - Idea ${index + 1}`).substring(0, 100),
        angle: (idea.angle || 'Unique perspective on the topic').substring(0, 200),
        description: (idea.description || 'A comprehensive exploration of the topic').substring(0, 500),
        tags: Array.isArray(idea.tags) ? idea.tags.slice(0, 5) : ['general', 'content'],
        difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(idea.difficulty) ? idea.difficulty : 'Intermediate',
        estimatedWordCount: typeof idea.estimatedWordCount === 'number' && idea.estimatedWordCount > 0 ? 
          Math.min(5000, Math.max(500, idea.estimatedWordCount)) : 1200,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: 85,
        metadata: {
          generatedFromTopic: topic,
          generationIndex: index
        }
      };
    }).filter(idea => idea.title && idea.title.length > 0);

    // Ensure we have at least some ideas
    while (formattedIdeas.length < Math.min(requestedCount, 3)) {
      const fallbackIdea = generateSingleBrainstormingIdea(topic, formattedIdeas.length);
      formattedIdeas.push(fallbackIdea);
    }

    return formattedIdeas.slice(0, requestedCount);

  } catch (error) {
    console.error('[handleBrainstorm] Error parsing ideas:', error);
    return generateBrainstormingFallback(topic, requestedCount);
  }
}

function generateBrainstormingFallback(topic, count) {
  const fallbackTemplates = [
    {
      title: `Complete Guide to ${topic}`,
      angle: 'Comprehensive overview covering all essential aspects',
      tags: ['guide', 'comprehensive', 'basics']
    },
    {
      title: `Top 10 ${topic} Tips for Beginners`,
      angle: 'Beginner-friendly approach with practical, actionable advice',
      tags: ['tips', 'beginners', 'practical']
    },
    {
      title: `${topic}: Common Mistakes and How to Avoid Them`,
      angle: 'Problem-solving approach focusing on pitfalls and solutions',
      tags: ['mistakes', 'solutions', 'troubleshooting']
    },
    {
      title: `The Future of ${topic}: Trends and Predictions`,
      angle: 'Forward-looking analysis of industry developments',
      tags: ['trends', 'future', 'predictions']
    },
    {
      title: `${topic} Case Studies: Real Success Stories`,
      angle: 'Evidence-based approach using real-world examples',
      tags: ['case-studies', 'success', 'examples']
    }
  ];

  const ideas = [];
  
  for (let i = 0; i < Math.min(count, fallbackTemplates.length); i++) {
    const template = fallbackTemplates[i];
    const id = `fallback_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`;
    
    ideas.push({
      id,
      title: template.title,
      angle: template.angle,
      description: `An in-depth exploration of ${topic}. This post would provide valuable insights, practical advice, and actionable information for readers looking to understand or improve their knowledge of ${topic}.`,
      tags: template.tags,
      difficulty: 'Intermediate',
      estimatedWordCount: 1200 + (i * 300),
      isFavorited: false,
      createdAt: new Date().toISOString(),
      score: 70,
      metadata: {
        generatedFromTopic: topic,
        generationIndex: i,
        fallback: true
      }
    });
  }

  // Fill remaining slots if needed
  while (ideas.length < count) {
    const extraIdea = generateSingleBrainstormingIdea(topic, ideas.length);
    ideas.push(extraIdea);
  }

  return ideas;
}

function generateSingleBrainstormingIdea(topic, index) {
  const approaches = [
    'How to Master',
    'The Ultimate Guide to',
    'Best Practices for',
    '5 Ways to Improve Your',
    'Understanding',
    'Advanced Techniques in',
    'The Business of',
    'Troubleshooting'
  ];
  
  const approach = approaches[index % approaches.length];
  const id = `fallback_single_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
  
  return {
    id,
    title: `${approach} ${topic}`,
    angle: `${approach.toLowerCase()} approach with practical insights`,
    description: `A detailed exploration of ${topic} using a ${approach.toLowerCase()} methodology. This content would provide readers with actionable information and valuable insights.`,
    tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'guide', 'practical'],
    difficulty: 'Intermediate',
    estimatedWordCount: 1000 + (index * 200),
    isFavorited: false,
    createdAt: new Date().toISOString(),
    score: 65,
    metadata: {
      generatedFromTopic: topic,
      generationIndex: index,
      fallback: true
    }
  };
}