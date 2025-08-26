// AI Content Generation API Endpoints
// Handles all content generation requests with provider abstraction

import { GenerationService } from '../../src/services/ai/GenerationService.js';
import { ProviderService } from '../../src/services/ai/ProviderService.js';
import { ContextService } from '../../src/services/ai/ContextService.js';
import { TreeService } from '../../src/services/ai/TreeService.js';
import { AnalyticsService } from '../../src/services/ai/AnalyticsService.js';

const generationService = new GenerationService();
const contextService = new ContextService();
const treeService = new TreeService();
const analyticsService = new AnalyticsService();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      task,
      mode = 'direct',
      vertical = 'all',
      verticalMode = 'parallel',
      prompt,
      context,
      provider = 'anthropic',
      model,
      outputCount = 1,
      stream = false,
      parentNodeId,
      rootNodeId
    } = req.body;

    // Validate required fields
    if (!task || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: task and prompt are required' 
      });
    }

    // Build context for generation
    const generationContext = await contextService.buildContext(context);
    
    // Set up streaming if requested
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }

    const generationConfig = {
      task,
      mode,
      vertical,
      verticalMode,
      prompt,
      context: generationContext,
      provider,
      model,
      outputCount,
      parentNodeId,
      rootNodeId
    };

    // Handle different generation modes
    let result;
    switch (mode) {
      case 'structured':
        result = await generationService.structuredGeneration(generationConfig, stream ? res : null);
        break;
        
      case 'direct':
        result = await generationService.directGeneration(generationConfig, stream ? res : null);
        break;
        
      case 'multi_vertical':
        result = await generationService.multiVerticalGeneration(generationConfig, stream ? res : null);
        break;
        
      case 'batch':
        result = await generationService.batchGeneration(generationConfig, stream ? res : null);
        break;
        
      case 'edit_existing':
        result = await generationService.editExisting(generationConfig, stream ? res : null);
        break;
        
      default:
        throw new Error(`Unsupported generation mode: ${mode}`);
    }

    // Log analytics
    await analyticsService.logGeneration({
      task,
      mode,
      vertical,
      provider,
      model,
      success: true,
      tokensUsed: result.usage?.totalTokens || 0,
      cost: result.usage?.cost || 0,
      latencyMs: result.timing?.totalMs || 0
    });

    if (stream) {
      // End the stream
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(200).json({
        success: true,
        data: result,
        usage: result.usage,
        timing: result.timing
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    
    // Log failed generation
    await analyticsService.logGeneration({
      task: req.body.task,
      mode: req.body.mode || 'direct',
      vertical: req.body.vertical || 'all',
      provider: req.body.provider || 'anthropic',
      model: req.body.model,
      success: false,
      error: error.message
    }).catch(console.error);

    if (req.body.stream) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ 
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}