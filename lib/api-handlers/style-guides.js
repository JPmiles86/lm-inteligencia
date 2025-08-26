// Style Guide Management API Endpoints
// Handles CRUD operations for style guides, versions, and activation

import { StyleGuideService } from '../../src/services/ai/StyleGuideService.js';

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
        return await handleGetGuides(req, res);
      case 'POST':
        return await handleCreateGuide(req, res);
      case 'PUT':
        return await handleUpdateGuide(req, res);
      case 'DELETE':
        return await handleDeleteGuide(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Style Guide API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function handleGetGuides(req, res) {
  const { action, type, vertical, guideId } = req.query;

  switch (action) {
    case 'list':
      // Get style guides with filters
      const guides = await styleGuideService.getStyleGuides({
        type,
        vertical,
        activeOnly: req.query.activeOnly === 'true'
      });
      return res.json({
        success: true,
        data: guides
      });

    case 'active':
      // Get all active style guides
      const activeGuides = await styleGuideService.getActiveGuides({ vertical });
      return res.json({
        success: true,
        data: activeGuides
      });

    case 'detail':
      // Get specific guide with versions
      if (!guideId) {
        return res.status(400).json({ error: 'Guide ID required' });
      }
      const guideWithVersions = await styleGuideService.getGuideWithVersions(guideId);
      return res.json({
        success: true,
        data: guideWithVersions
      });

    case 'context-string':
      // Get combined context string from active guides
      const contextString = await styleGuideService.getActiveGuidesContextString({
        vertical,
        types: req.query.types ? req.query.types.split(',') : undefined
      });
      return res.json({
        success: true,
        data: { contextString, tokenCount: contextString.length / 4 } // Rough token estimate
      });

    case 'types':
      // Get available style guide types and counts
      const typeCounts = await styleGuideService.getTypeCounts();
      return res.json({
        success: true,
        data: typeCounts
      });

    default:
      return res.json({
        success: true,
        data: await styleGuideService.getStyleGuides({ type, vertical })
      });
  }
}

async function handleCreateGuide(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'from-blogs':
      // Create guide from existing blogs
      const { blogIds, type, name, vertical, description } = req.body;
      const guideFromBlogs = await styleGuideService.createGuideFromBlogs({
        blogIds,
        type,
        name,
        vertical,
        description
      });
      return res.status(201).json({
        success: true,
        data: guideFromBlogs
      });

    case 'from-conversation':
      // Create guide from conversation/chat
      const { messages, type: convType, name: convName, vertical: convVertical } = req.body;
      const guideFromConv = await styleGuideService.createGuideFromConversation({
        messages,
        type: convType,
        name: convName,
        vertical: convVertical
      });
      return res.status(201).json({
        success: true,
        data: guideFromConv
      });

    case 'from-scratch':
      // Create guide from scratch with user input
      const newGuide = await styleGuideService.createGuide(req.body);
      return res.status(201).json({
        success: true,
        data: newGuide
      });

    case 'activate-set':
      // Activate a set of guides
      const { guideIds } = req.body;
      await styleGuideService.setActiveGuides(guideIds);
      return res.json({
        success: true,
        message: 'Style guides activated successfully'
      });

    default:
      // Default create guide
      const guide = await styleGuideService.createGuide(req.body);
      return res.status(201).json({
        success: true,
        data: guide
      });
  }
}

async function handleUpdateGuide(req, res) {
  const { guideId } = req.query;
  const { action } = req.body;
  
  if (!guideId) {
    return res.status(400).json({ error: 'Guide ID required' });
  }

  switch (action) {
    case 'activate':
      // Activate single guide
      await styleGuideService.activateGuide(guideId);
      return res.json({
        success: true,
        message: 'Style guide activated'
      });

    case 'deactivate':
      // Deactivate single guide
      await styleGuideService.deactivateGuide(guideId);
      return res.json({
        success: true,
        message: 'Style guide deactivated'
      });

    case 'create-version':
      // Create new version of guide
      const { changes, changeSummary } = req.body;
      const newVersion = await styleGuideService.createGuideVersion(guideId, {
        changes,
        changeSummary
      });
      return res.json({
        success: true,
        data: newVersion
      });

    default:
      // Default update
      const updatedGuide = await styleGuideService.updateGuide(guideId, req.body);
      return res.json({
        success: true,
        data: updatedGuide
      });
  }
}

async function handleDeleteGuide(req, res) {
  const { guideId } = req.query;
  const { soft = true } = req.query;
  
  if (!guideId) {
    return res.status(400).json({ error: 'Guide ID required' });
  }

  if (soft === 'false') {
    await styleGuideService.hardDeleteGuide(guideId);
  } else {
    await styleGuideService.softDeleteGuide(guideId);
  }
  
  return res.json({
    success: true,
    message: 'Style guide deleted successfully'
  });
}