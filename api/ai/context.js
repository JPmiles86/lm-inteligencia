// Context Management API Endpoints
// Handles context building, templates, and context selection

import { ContextService } from '../../src/services/ai/ContextService.js';
import { StyleGuideService } from '../../src/services/ai/StyleGuideService.js';

const contextService = new ContextService();
const styleGuideService = new StyleGuideService();

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
        return await handleGetContext(req, res);
      case 'POST':
        return await handleCreateContext(req, res);
      case 'PUT':
        return await handleUpdateContext(req, res);
      case 'DELETE':
        return await handleDeleteContext(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Context API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function handleGetContext(req, res) {
  const { action, vertical, templateId } = req.query;

  switch (action) {
    case 'build':
      // Build context from selection criteria
      const contextSelection = req.query.context ? JSON.parse(req.query.context) : {};
      const builtContext = await contextService.buildContext(contextSelection);
      return res.json({
        success: true,
        data: builtContext,
        tokenCount: builtContext.tokenCount
      });

    case 'templates':
      // Get available context templates
      const templates = await contextService.getTemplates({ vertical });
      return res.json({
        success: true,
        data: templates
      });

    case 'template':
      // Get specific template
      if (!templateId) {
        return res.status(400).json({ error: 'Template ID required' });
      }
      const template = await contextService.getTemplate(templateId);
      return res.json({
        success: true,
        data: template
      });

    case 'active-guides':
      // Get active style guides
      const activeGuides = await styleGuideService.getActiveGuides({ vertical });
      return res.json({
        success: true,
        data: activeGuides
      });

    case 'previous-content':
      // Get previous content for context selection
      const { verticalFilter, limit = 20 } = req.query;
      const previousContent = await contextService.getPreviousContent({
        vertical: verticalFilter,
        limit: parseInt(limit)
      });
      return res.json({
        success: true,
        data: previousContent
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleCreateContext(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'template':
      // Create new context template
      const { name, vertical, config, description } = req.body;
      const template = await contextService.createTemplate({
        name,
        vertical,
        config,
        description
      });
      return res.status(201).json({
        success: true,
        data: template
      });

    case 'build':
      // Build context from selection
      const builtContext = await contextService.buildContext(req.body.context);
      return res.json({
        success: true,
        data: builtContext
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleUpdateContext(req, res) {
  const { templateId } = req.query;
  
  if (!templateId) {
    return res.status(400).json({ error: 'Template ID required' });
  }

  const updatedTemplate = await contextService.updateTemplate(templateId, req.body);
  
  return res.json({
    success: true,
    data: updatedTemplate
  });
}

async function handleDeleteContext(req, res) {
  const { templateId } = req.query;
  
  if (!templateId) {
    return res.status(400).json({ error: 'Template ID required' });
  }

  await contextService.deleteTemplate(templateId);
  
  return res.json({
    success: true,
    message: 'Template deleted successfully'
  });
}