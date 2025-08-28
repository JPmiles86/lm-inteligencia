// Generation Tree - Interactive tree view for navigating generation history
// Shows hierarchical structure of AI generations with branching and navigation

import React, { useState } from 'react';
import { useAIStore, selectRootNodes, selectNodeChildren } from '../../../store/aiStore';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Lightbulb, 
  Image, 
  Share2,
  Hash,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface GenerationTreeProps {
  mobile?: boolean;
}

export const GenerationTree: React.FC<GenerationTreeProps> = ({
  mobile = false,
}) => {
  const {
    generationTree,
    activeNodeId,
    setActiveNode,
    createBranch,
    deleteGenerationNode,
    updateGenerationNode,
    addNotification,
  } = useAIStore();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [showMobileTree, setShowMobileTree] = useState(!mobile);

  // Get root nodes using selector
  const rootNodes = selectRootNodes({ generationTree } as any);

  // Toggle node expansion
  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Get node icon based on type
  const getNodeIcon = (type: string, status: string) => {
    const baseIcons = {
      idea: Lightbulb,
      title: Hash,
      synopsis: FileText,
      outline: Edit,
      blog: FileText,
      social: Share2,
      image_prompt: Image,
      analysis: Eye,
    };

    const IconComponent = baseIcons[type as keyof typeof baseIcons] || FileText;

    // Add status indicators
    if (status === 'processing') {
      return () => <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    } else if (status === 'failed') {
      return () => <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (status === 'completed') {
      return () => <IconComponent className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }

    return () => <IconComponent className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
  };

  // Get node color based on type and status
  const getNodeColor = (type: string, status: string, active: boolean) => {
    if (active) {
      return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100';
    }

    if (status === 'processing') {
      return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200';
    } else if (status === 'failed') {
      return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200';
    } else if (status === 'completed') {
      return 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600';
    }

    return 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600';
  };

  // Handle node selection
  const handleNodeClick = (nodeId: string) => {
    setActiveNode(nodeId);
    if (mobile) {
      setShowMobileTree(false);
    }
  };

  // Handle node actions
  const handleCreateBranch = (nodeId: string) => {
    const node = generationTree[nodeId];
    if (node) {
      createBranch(nodeId, node.content || '');
      addNotification({
        type: 'success',
        title: 'Branch Created',
        message: 'New branch created for editing',
        duration: 3000,
      });
    }
    setShowOptions(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    deleteGenerationNode(nodeId);
    addNotification({
      type: 'info',
      title: 'Node Deleted',
      message: 'Generation node moved to trash',
      duration: 3000,
    });
    setShowOptions(null);
  };

  const handleToggleVisibility = (nodeId: string) => {
    const node = generationTree[nodeId];
    if (node) {
      updateGenerationNode(nodeId, { visible: !node.visible });
    }
    setShowOptions(null);
  };

  // Render tree node
  const renderNode = (node: any, depth: number = 0) => {
    const children = selectNodeChildren({ generationTree } as any, node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = activeNodeId === node.id;
    const IconComponent = getNodeIcon(node.type, node.status);

    return (
      <div key={node.id} className="select-none">
        {/* Node Item */}
        <div
          className={`group flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${getNodeColor(
            node.type,
            node.status,
            isActive
          )}`}
          style={{ marginLeft: depth * 16 }}
          onClick={() => handleNodeClick(node.id)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleExpanded(node.id);
              }
            }}
            className="mr-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : (
              <div className="w-3 h-3" />
            )}
          </button>

          {/* Node Icon */}
          <div className="mr-2 flex-shrink-0">
            <IconComponent />
          </div>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {node.structuredContent?.title || 
                   (node.content?.slice(0, 50) + (node.content?.length > 50 ? '...' : '')) ||
                   `${node.type} generation`}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="capitalize">{node.type}</span>
                  <span>•</span>
                  <span>{new Date(node.createdAt).toLocaleDateString()}</span>
                  {node.tokensOutput > 0 && (
                    <>
                      <span>•</span>
                      <span>{node.tokensOutput} tokens</span>
                    </>
                  )}
                  {node.cost > 0 && (
                    <>
                      <span>•</span>
                      <span>${node.cost.toFixed(4)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Node Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(showOptions === node.id ? null : node.id);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Node Status Indicators */}
            <div className="flex items-center space-x-1 mt-1">
              {node.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {node.status === 'failed' && (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              {node.status === 'processing' && (
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              )}
              {!node.visible && (
                <EyeOff className="h-3 w-3 text-gray-400" />
              )}
              {node.selected && (
                <CheckCircle className="h-3 w-3 text-blue-500" />
              )}
            </div>

            {/* Node Options Menu */}
            {showOptions === node.id && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-1">
                  <button
                    onClick={() => handleCreateBranch(node.id)}
                    className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Create Branch
                  </button>
                  
                  <button
                    onClick={() => handleToggleVisibility(node.id)}
                    className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {node.visible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show
                      </>
                    )}
                  </button>
                  
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="w-full flex items-center px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="ml-2 mt-1 space-y-1">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Mobile header
  if (mobile) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowMobileTree(!showMobileTree)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Generation History
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {rootNodes.length}
            </span>
          </div>
          {showMobileTree ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        
        {showMobileTree && (
          <div className="p-3 pt-0 max-h-64 overflow-y-auto">
            {rootNodes.length > 0 ? (
              <div className="space-y-1">
                {rootNodes.map((node) => renderNode(node))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No generations yet</p>
                <p className="text-sm">Start creating content to see your generation tree</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Generation Tree
          </h3>
          {rootNodes.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {rootNodes.length}
            </span>
          )}
        </div>
        
        <button
          onClick={() => {
            // TODO: Add new generation
            addNotification({
              type: 'info',
              title: 'Coming Soon',
              message: 'Direct tree creation coming soon',
              duration: 3000,
            });
          }}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="New generation"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {rootNodes.length > 0 ? (
          <div className="space-y-1">
            {rootNodes.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Generations Yet</p>
              <p className="text-sm">
                Start creating content to see your generation history and navigate between versions
              </p>
              <div className="mt-4 text-xs">
                <p>💡 <strong>Pro Tip:</strong> Each generation creates a node in the tree</p>
                <p>You can branch, compare, and navigate between different versions</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            {Object.keys(generationTree).length} total nodes
          </span>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>Click to view</span>
          </div>
        </div>
      </div>

      {/* Click outside handler for options menu */}
      {showOptions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowOptions(null)}
        />
      )}
    </div>
  );
};