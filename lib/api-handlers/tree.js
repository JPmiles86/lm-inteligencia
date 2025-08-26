// Generation Tree API Endpoints
// Handles tree navigation, branching, merging, and cleanup operations

import { TreeService } from '../../src/services/ai/TreeService.js';

const treeService = new TreeService();

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
        return await handleGetTree(req, res);
      case 'POST':
        return await handleCreateNode(req, res);
      case 'PUT':
        return await handleUpdateNode(req, res);
      case 'DELETE':
        return await handleDeleteNode(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tree API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function handleGetTree(req, res) {
  const { action, nodeId, rootId } = req.query;

  switch (action) {
    case 'full-tree':
      // Get complete tree structure
      if (!rootId) {
        return res.status(400).json({ error: 'Root ID required' });
      }
      const fullTree = await treeService.getFullTree(rootId);
      return res.json({
        success: true,
        data: fullTree
      });

    case 'node':
      // Get specific node with children and parent
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID required' });
      }
      const node = await treeService.getNodeWithRelations(nodeId);
      return res.json({
        success: true,
        data: node
      });

    case 'children':
      // Get direct children of a node
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID required' });
      }
      const children = await treeService.getChildren(nodeId);
      return res.json({
        success: true,
        data: children
      });

    case 'path':
      // Get path from root to node
      if (!nodeId || !rootId) {
        return res.status(400).json({ error: 'Node ID and Root ID required' });
      }
      const path = await treeService.getPathToNode(rootId, nodeId);
      return res.json({
        success: true,
        data: path
      });

    case 'alternatives':
      // Get alternative nodes at same level
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID required' });
      }
      const alternatives = await treeService.getAlternatives(nodeId);
      return res.json({
        success: true,
        data: alternatives
      });

    case 'selected-path':
      // Get currently selected path in tree
      if (!rootId) {
        return res.status(400).json({ error: 'Root ID required' });
      }
      const selectedPath = await treeService.getSelectedPath(rootId);
      return res.json({
        success: true,
        data: selectedPath
      });

    case 'stats':
      // Get tree statistics
      if (!rootId) {
        return res.status(400).json({ error: 'Root ID required' });
      }
      const stats = await treeService.getTreeStats(rootId);
      return res.json({
        success: true,
        data: stats
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleCreateNode(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'branch':
      // Create a branch from existing node
      const { sourceNodeId, newContent, type } = req.body;
      const branch = await treeService.createBranch(sourceNodeId, {
        content: newContent,
        type
      });
      return res.status(201).json({
        success: true,
        data: branch
      });

    case 'alternative':
      // Create alternative at same level
      const { parentId, content, type: altType } = req.body;
      const alternative = await treeService.createAlternative(parentId, {
        content,
        type: altType
      });
      return res.status(201).json({
        success: true,
        data: alternative
      });

    case 'continuation':
      // Continue from selected node
      const { continueFromId, newNodeData } = req.body;
      const continuation = await treeService.createContinuation(continueFromId, newNodeData);
      return res.status(201).json({
        success: true,
        data: continuation
      });

    default:
      // Default create node
      const newNode = await treeService.createNode(req.body);
      return res.status(201).json({
        success: true,
        data: newNode
      });
  }
}

async function handleUpdateNode(req, res) {
  const { nodeId } = req.query;
  const { action } = req.body;
  
  if (!nodeId) {
    return res.status(400).json({ error: 'Node ID required' });
  }

  switch (action) {
    case 'select':
      // Select this node in the tree
      const { rootId } = req.body;
      await treeService.selectNode(nodeId, rootId);
      return res.json({
        success: true,
        message: 'Node selected successfully'
      });

    case 'toggle-visibility':
      // Toggle node visibility
      await treeService.toggleVisibility(nodeId);
      return res.json({
        success: true,
        message: 'Node visibility toggled'
      });

    case 'merge':
      // Merge with another node
      const { targetNodeId, mergeStrategy = 'replace' } = req.body;
      const mergedNode = await treeService.mergeNodes(nodeId, targetNodeId, mergeStrategy);
      return res.json({
        success: true,
        data: mergedNode
      });

    case 'move':
      // Move node to different parent
      const { newParentId } = req.body;
      await treeService.moveNode(nodeId, newParentId);
      return res.json({
        success: true,
        message: 'Node moved successfully'
      });

    case 'publish':
      // Publish node content to blog
      const publishResult = await treeService.publishToBlog(nodeId);
      return res.json({
        success: true,
        data: publishResult
      });

    default:
      // Default update
      const updatedNode = await treeService.updateNode(nodeId, req.body);
      return res.json({
        success: true,
        data: updatedNode
      });
  }
}

async function handleDeleteNode(req, res) {
  const { nodeId } = req.query;
  const { action = 'soft', cascade = false } = req.query;
  
  if (!nodeId) {
    return res.status(400).json({ error: 'Node ID required' });
  }

  switch (action) {
    case 'soft':
      // Soft delete (mark as deleted)
      await treeService.softDeleteNode(nodeId, cascade === 'true');
      return res.json({
        success: true,
        message: 'Node soft deleted successfully'
      });

    case 'hard':
      // Hard delete (permanent removal)
      await treeService.hardDeleteNode(nodeId, cascade === 'true');
      return res.json({
        success: true,
        message: 'Node permanently deleted'
      });

    case 'cleanup':
      // Cleanup tree (remove unused branches)
      const { rootId } = req.query;
      if (!rootId) {
        return res.status(400).json({ error: 'Root ID required for cleanup' });
      }
      const cleanupResult = await treeService.cleanupTree(rootId);
      return res.json({
        success: true,
        data: cleanupResult
      });

    case 'prune':
      // Prune tree (remove unselected alternatives)
      const { rootId: pruneRootId, keepAlternatives = 1 } = req.query;
      if (!pruneRootId) {
        return res.status(400).json({ error: 'Root ID required for pruning' });
      }
      const pruneResult = await treeService.pruneTree(pruneRootId, parseInt(keepAlternatives));
      return res.json({
        success: true,
        data: pruneResult
      });

    default:
      return res.status(400).json({ error: 'Invalid delete action' });
  }
}