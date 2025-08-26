// Tree Service - Manages generation tree structure and navigation
// Handles node relationships, selection, and tree operations

import { aiRepository } from '../../repositories/aiRepository.js';

export class TreeService {
  constructor() {
    this.treeCache = new Map();
    this.maxCacheSize = 50;
  }

  // ================================
  // TREE CREATION & MANAGEMENT
  // ================================

  async createTree(rootNodeData) {
    try {
      const rootNode = await aiRepository.createGenerationNode({
        ...rootNodeData,
        parentId: null,
        rootId: null,
        selected: true,
        visible: true
      });

      // Set rootId to itself for the root node
      await aiRepository.updateGenerationNode(rootNode.id, { rootId: rootNode.id });
      
      return {
        ...rootNode,
        rootId: rootNode.id
      };
    } catch (error) {
      console.error('Error creating tree:', error);
      throw new Error(`Failed to create generation tree: ${error.message}`);
    }
  }

  async addNode(nodeData) {
    try {
      const node = await aiRepository.createGenerationNode(nodeData);
      
      // Invalidate cache for this tree
      if (node.rootId) {
        this.treeCache.delete(node.rootId);
      }
      
      return node;
    } catch (error) {
      console.error('Error adding node:', error);
      throw new Error(`Failed to add node: ${error.message}`);
    }
  }

  // ================================
  // TREE RETRIEVAL & NAVIGATION
  // ================================

  async getTree(rootId, useCache = true) {
    if (useCache && this.treeCache.has(rootId)) {
      return this.treeCache.get(rootId);
    }

    try {
      const nodes = await aiRepository.getGenerationTree(rootId);
      const tree = this.buildTreeStructure(nodes);
      
      if (useCache) {
        this.cacheTree(rootId, tree);
      }
      
      return tree;
    } catch (error) {
      console.error('Error getting tree:', error);
      throw new Error(`Failed to get generation tree: ${error.message}`);
    }
  }

  buildTreeStructure(nodes) {
    if (!nodes || nodes.length === 0) return null;

    const nodeMap = new Map();
    let rootNode = null;

    // Create node map
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        ...node,
        children: []
      });
      
      if (!node.parentId) {
        rootNode = nodeMap.get(node.id);
      }
    });

    // Build parent-child relationships
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        const child = nodeMap.get(node.id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    });

    // Sort children by creation time
    const sortChildren = (node) => {
      if (node.children.length > 0) {
        node.children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        node.children.forEach(sortChildren);
      }
    };

    if (rootNode) {
      sortChildren(rootNode);
    }

    return rootNode;
  }

  async getNodePath(nodeId) {
    try {
      const node = await aiRepository.getGenerationNode(nodeId);
      if (!node) return [];

      const path = [];
      let currentNode = node;

      while (currentNode) {
        path.unshift(currentNode);
        
        if (currentNode.parentId) {
          currentNode = await aiRepository.getGenerationNode(currentNode.parentId);
        } else {
          break;
        }
      }

      return path;
    } catch (error) {
      console.error('Error getting node path:', error);
      throw new Error(`Failed to get node path: ${error.message}`);
    }
  }

  async getNodeChildren(nodeId) {
    try {
      return await aiRepository.getNodeChildren(nodeId);
    } catch (error) {
      console.error('Error getting node children:', error);
      throw new Error(`Failed to get node children: ${error.message}`);
    }
  }

  async getNodeSiblings(nodeId) {
    try {
      const node = await aiRepository.getGenerationNode(nodeId);
      if (!node || !node.parentId) return [];

      const siblings = await aiRepository.getNodeChildren(node.parentId);
      return siblings.filter(sibling => sibling.id !== nodeId);
    } catch (error) {
      console.error('Error getting node siblings:', error);
      throw new Error(`Failed to get node siblings: ${error.message}`);
    }
  }

  // ================================
  // NODE SELECTION & VISIBILITY
  // ================================

  async selectNode(nodeId, deselectSiblings = true) {
    try {
      const node = await aiRepository.getGenerationNode(nodeId);
      if (!node) {
        throw new Error('Node not found');
      }

      // Deselect siblings if requested
      if (deselectSiblings && node.parentId) {
        const siblings = await aiRepository.getNodeChildren(node.parentId);
        await Promise.all(
          siblings
            .filter(sibling => sibling.id !== nodeId && sibling.selected)
            .map(sibling => aiRepository.updateGenerationNode(sibling.id, { selected: false }))
        );
      }

      // Select the target node
      await aiRepository.updateGenerationNode(nodeId, { selected: true });
      
      // Invalidate cache
      if (node.rootId) {
        this.treeCache.delete(node.rootId);
      }

      return await aiRepository.getGenerationNode(nodeId);
    } catch (error) {
      console.error('Error selecting node:', error);
      throw new Error(`Failed to select node: ${error.message}`);
    }
  }

  async toggleNodeVisibility(nodeId) {
    try {
      const node = await aiRepository.getGenerationNode(nodeId);
      if (!node) {
        throw new Error('Node not found');
      }

      const newVisibility = !node.visible;
      await aiRepository.updateGenerationNode(nodeId, { visible: newVisibility });
      
      // If hiding a node, also hide its descendants
      if (!newVisibility) {
        await this.setDescendantsVisibility(nodeId, false);
      }

      // Invalidate cache
      if (node.rootId) {
        this.treeCache.delete(node.rootId);
      }

      return newVisibility;
    } catch (error) {
      console.error('Error toggling node visibility:', error);
      throw new Error(`Failed to toggle node visibility: ${error.message}`);
    }
  }

  async setDescendantsVisibility(nodeId, visible) {
    try {
      const children = await aiRepository.getNodeChildren(nodeId);
      
      for (const child of children) {
        await aiRepository.updateGenerationNode(child.id, { visible });
        await this.setDescendantsVisibility(child.id, visible);
      }
    } catch (error) {
      console.error('Error setting descendants visibility:', error);
    }
  }

  async deleteNode(nodeId, deleteChildren = false) {
    try {
      const node = await aiRepository.getGenerationNode(nodeId);
      if (!node) {
        throw new Error('Node not found');
      }

      if (deleteChildren) {
        // Recursively delete children
        const children = await aiRepository.getNodeChildren(nodeId);
        for (const child of children) {
          await this.deleteNode(child.id, true);
        }
      } else {
        // Reparent children to this node's parent
        const children = await aiRepository.getNodeChildren(nodeId);
        if (children.length > 0) {
          await Promise.all(
            children.map(child => 
              aiRepository.updateGenerationNode(child.id, { parentId: node.parentId })
            )
          );
        }
      }

      // Soft delete the node
      await aiRepository.updateGenerationNode(nodeId, { deleted: true, visible: false });
      
      // Invalidate cache
      if (node.rootId) {
        this.treeCache.delete(node.rootId);
      }

      return true;
    } catch (error) {
      console.error('Error deleting node:', error);
      throw new Error(`Failed to delete node: ${error.message}`);
    }
  }

  // ================================
  // TREE STATISTICS & ANALYSIS
  // ================================

  async getTreeStats(rootId) {
    try {
      const tree = await this.getTree(rootId, false);
      if (!tree) return null;

      const stats = {
        totalNodes: 0,
        nodesByType: {},
        nodesByProvider: {},
        totalCost: 0,
        totalTokens: 0,
        selectedPath: [],
        depth: 0,
        createdAt: tree.createdAt,
        lastUpdated: null
      };

      this.analyzeTreeNode(tree, stats, 0);
      
      // Get selected path
      stats.selectedPath = await this.getSelectedPath(rootId);

      return stats;
    } catch (error) {
      console.error('Error getting tree stats:', error);
      throw new Error(`Failed to get tree stats: ${error.message}`);
    }
  }

  analyzeTreeNode(node, stats, depth) {
    if (!node || node.deleted) return;

    stats.totalNodes++;
    stats.depth = Math.max(stats.depth, depth);

    // Count by type
    stats.nodesByType[node.type] = (stats.nodesByType[node.type] || 0) + 1;

    // Count by provider
    if (node.provider) {
      stats.nodesByProvider[node.provider] = (stats.nodesByProvider[node.provider] || 0) + 1;
    }

    // Accumulate costs and tokens
    stats.totalCost += node.cost || 0;
    stats.totalTokens += node.tokensUsed || 0;

    // Track latest update
    if (node.createdAt) {
      const nodeDate = new Date(node.createdAt);
      if (!stats.lastUpdated || nodeDate > stats.lastUpdated) {
        stats.lastUpdated = nodeDate;
      }
    }

    // Recurse to children
    if (node.children) {
      node.children.forEach(child => this.analyzeTreeNode(child, stats, depth + 1));
    }
  }

  async getSelectedPath(rootId) {
    try {
      const tree = await this.getTree(rootId);
      if (!tree) return [];

      const path = [];
      this.findSelectedPath(tree, path);
      return path;
    } catch (error) {
      console.error('Error getting selected path:', error);
      return [];
    }
  }

  findSelectedPath(node, path) {
    if (!node || node.deleted) return false;

    path.push({
      id: node.id,
      type: node.type,
      content: node.content ? node.content.substring(0, 100) + '...' : '',
      selected: node.selected
    });

    if (node.selected) {
      // Check if any children are selected
      if (node.children) {
        for (const child of node.children) {
          if (this.findSelectedPath(child, path)) {
            return true;
          }
        }
      }
      return true;
    }

    // If this node isn't selected, remove it from path
    path.pop();
    return false;
  }

  // ================================
  // TREE OPERATIONS
  // ================================

  async cloneNode(nodeId, includeChildren = false) {
    try {
      const originalNode = await aiRepository.getGenerationNode(nodeId);
      if (!originalNode) {
        throw new Error('Node not found');
      }

      const clonedData = {
        type: originalNode.type,
        content: originalNode.content,
        mode: originalNode.mode,
        vertical: originalNode.vertical,
        parentId: originalNode.parentId,
        rootId: originalNode.rootId,
        provider: originalNode.provider,
        model: originalNode.model,
        prompt: originalNode.prompt,
        context: originalNode.context,
        tokensUsed: originalNode.tokensUsed,
        cost: originalNode.cost,
        selected: false,
        visible: true
      };

      const clonedNode = await this.addNode(clonedData);

      // Clone children if requested
      if (includeChildren) {
        const children = await aiRepository.getNodeChildren(nodeId);
        for (const child of children) {
          await this.cloneSubtree(child.id, clonedNode.id);
        }
      }

      return clonedNode;
    } catch (error) {
      console.error('Error cloning node:', error);
      throw new Error(`Failed to clone node: ${error.message}`);
    }
  }

  async cloneSubtree(nodeId, newParentId) {
    const originalNode = await aiRepository.getGenerationNode(nodeId);
    if (!originalNode) return null;

    const clonedData = {
      ...originalNode,
      id: undefined,
      parentId: newParentId,
      selected: false,
      visible: true,
      createdAt: undefined
    };

    const clonedNode = await this.addNode(clonedData);

    // Clone children
    const children = await aiRepository.getNodeChildren(nodeId);
    for (const child of children) {
      await this.cloneSubtree(child.id, clonedNode.id);
    }

    return clonedNode;
  }

  async moveNode(nodeId, newParentId) {
    try {
      const node = await aiRepository.getGenerationNode(nodeId);
      if (!node) {
        throw new Error('Node not found');
      }

      // Validate the move (prevent cycles)
      if (newParentId) {
        const path = await this.getNodePath(newParentId);
        if (path.some(pathNode => pathNode.id === nodeId)) {
          throw new Error('Cannot move node to its own descendant');
        }
      }

      await aiRepository.updateGenerationNode(nodeId, { parentId: newParentId });
      
      // Invalidate cache
      if (node.rootId) {
        this.treeCache.delete(node.rootId);
      }

      return await aiRepository.getGenerationNode(nodeId);
    } catch (error) {
      console.error('Error moving node:', error);
      throw new Error(`Failed to move node: ${error.message}`);
    }
  }

  // ================================
  // CACHING
  // ================================

  cacheTree(rootId, tree) {
    if (this.treeCache.size >= this.maxCacheSize) {
      const oldestKey = this.treeCache.keys().next().value;
      this.treeCache.delete(oldestKey);
    }
    
    this.treeCache.set(rootId, {
      tree,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.treeCache.clear();
  }

  // ================================
  // EXPORT & IMPORT
  // ================================

  async exportTree(rootId, format = 'json') {
    try {
      const tree = await this.getTree(rootId, false);
      const stats = await this.getTreeStats(rootId);

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        tree,
        stats,
        format
      };

      switch (format) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        case 'markdown':
          return this.treeToMarkdown(tree, stats);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting tree:', error);
      throw new Error(`Failed to export tree: ${error.message}`);
    }
  }

  treeToMarkdown(tree, stats) {
    let markdown = `# Generation Tree\n\n`;
    markdown += `**Stats:** ${stats.totalNodes} nodes, ${stats.totalTokens} tokens, $${stats.totalCost.toFixed(4)} cost\n\n`;
    markdown += `**Created:** ${tree.createdAt}\n\n`;
    markdown += `---\n\n`;
    
    this.nodeToMarkdown(tree, markdown, 0);
    
    return markdown;
  }

  nodeToMarkdown(node, markdown, depth) {
    const indent = '  '.repeat(depth);
    const selectedMark = node.selected ? ' ✓' : '';
    const hiddenMark = !node.visible ? ' (hidden)' : '';
    
    markdown += `${indent}- **${node.type}**${selectedMark}${hiddenMark}\n`;
    
    if (node.content) {
      const preview = node.content.substring(0, 200) + (node.content.length > 200 ? '...' : '');
      markdown += `${indent}  ${preview}\n`;
    }
    
    if (node.provider) {
      markdown += `${indent}  *${node.provider}/${node.model}* - ${node.tokensUsed || 0} tokens\n`;
    }
    
    markdown += '\n';
    
    if (node.children) {
      node.children.forEach(child => this.nodeToMarkdown(child, markdown, depth + 1));
    }
  }
}