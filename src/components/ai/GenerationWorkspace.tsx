// Generation Workspace - Main working area for AI content generation
// Includes content editor, generation controls, tree navigation, and metadata panel

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAIStore } from '../../store/aiStore';
import { aiGenerationService } from '../../services/ai/AIGenerationService';
import { ContentEditor } from './components/ContentEditor';
import { GenerationTree } from './components/GenerationTree';
import { MetadataPanel } from './components/MetadataPanel';
import { GenerationControls } from './components/GenerationControls';
import { StreamingDisplay } from './components/StreamingDisplay';
import { 
  FileText, 
  Eye,
  Edit, 
  Split, 
  Layers,
  // Play, // Unused - preserved for future use
  // Pause, // Unused - preserved for future use
  // Square, // Unused - preserved for future use
  // RefreshCw, // Unused - preserved for future use
  Save,
  Download,
  // Share, // Unused - preserved for future use
  // Zap, // Unused - preserved for future use
  // Brain, // Unused - preserved for future use
  Loader2,
  AlertCircle,
  Circle, // Check icon alternative
} from 'lucide-react';

interface GenerationWorkspaceProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  activeVertical?: string;
}

export const GenerationWorkspace: React.FC<GenerationWorkspaceProps> = ({
  user: _user, // Preserved for future use
  activeVertical = 'hospitality',
}) => {
  const {
    // State
    // currentGeneration, // Unused - preserved for future use
    mode,
    loading,
    streaming,
    activeNodeId,
    generationTree,
    selectedContext,
    activeProvider,
    activeModel,
    
    // Actions
    setCurrentGeneration,
    addGenerationNode,
    updateGenerationNode,
    setActiveNode,
    setLoading,
    setStreaming,
    addNotification,
    addError,
    updateAnalytics,
    updateProviderUsage,
  } = useAIStore();

  // Local state
  const [workspaceView, setWorkspaceView] = useState<'editor' | 'preview' | 'split'>('editor');
  const [generationInput, setGenerationInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const [autoSave, /* setAutoSave */] = useState(true); // setAutoSave preserved for future use
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

  // Refs
  const streamingRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current active node
  const activeNode = activeNodeId ? generationTree[activeNodeId] : null;

  // Handle input change with auto-save
  const handleInputChange = useCallback((value: string) => {
    setGenerationInput(value);
    setSaveStatus('unsaved');

    if (autoSave) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(value);
      }, 2000);
    }
  }, [autoSave]);

  // Auto-save functionality
  const handleAutoSave = useCallback(async (content: string) => {
    setSaveStatus('saving');
    
    try {
      // Save to localStorage for now (in a real app, save to backend)
      localStorage.setItem('ai-generation-draft', JSON.stringify({
        content,
        timestamp: new Date().toISOString(),
        activeVertical,
        provider: activeProvider,
        model: activeModel,
      }));

      setSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [activeVertical, activeProvider, activeModel]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('ai-generation-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setGenerationInput(parsed.content || '');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, []);

  // Handle content generation
  const handleGenerate = useCallback(async () => {
    if (!generationInput.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Input',
        message: 'Please enter a topic or prompt to generate content.',
        duration: 3000,
      });
      return;
    }

    const generationConfig = {
      mode: mode as any,
      vertical: activeVertical as any,
      task: mode === 'quick' ? 'blog' : 'structured',
      prompt: generationInput,
      context: selectedContext,
      provider: activeProvider as any,
      model: activeModel,
      outputCount: 1,
    };

    if (mode === 'quick') {
      // Direct generation
      setLoading(true);
      try {
        const response = await aiGenerationService.generateContent(generationConfig);
        
        if (response.success && response.data) {
          setCurrentGeneration(response.data);
          addGenerationNode(response.data);
          setActiveNode(response.data.id);
          
          // Update analytics
          updateAnalytics({
            tokens: response.tokensUsed,
            cost: response.cost,
            generations: 1,
          });

          updateProviderUsage(activeProvider, response.tokensUsed || 0, response.cost || 0);

          addNotification({
            type: 'success',
            title: 'Generation Complete',
            message: `Created ${response.data.type} in ${(response.durationMs || 0) / 1000}s`,
            duration: 4000,
          });

          // Clear input after successful generation
          setGenerationInput('');
          setSaveStatus('saved');
        } else {
          addError(response.error || 'Generation failed');
          addNotification({
            type: 'error',
            title: 'Generation Failed',
            message: response.error || 'Unknown error occurred',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Generation error:', error);
        addError(error instanceof Error ? error.message : 'Network error');
      } finally {
        setLoading(false);
      }
    } else {
      // Streaming generation
      handleStreamGenerate(generationConfig);
    }
  }, [
    generationInput,
    mode,
    activeVertical,
    selectedContext,
    activeProvider,
    activeModel,
    setLoading,
    setCurrentGeneration,
    addGenerationNode,
    setActiveNode,
    updateAnalytics,
    updateProviderUsage,
    addNotification,
    addError,
  ]);

  // Handle streaming generation
  const handleStreamGenerate = useCallback(async (config: any) => {
    setStreaming(true);
    setStreamingContent('');
    streamingRef.current = '';

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const streamGenerator = aiGenerationService.streamGeneration(config);
      
      for await (const chunk of streamGenerator) {
        if (chunk.type === 'error') {
          throw new Error('Streaming error');
        }

        if (chunk.type === 'content') {
          streamingRef.current += chunk.chunk;
          setStreamingContent(streamingRef.current);
        }

        if (chunk.type === 'complete') {
          // Create generation node from streaming result
          const newNode = {
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'blog' as const,
            mode: config.mode,
            content: streamingRef.current,
            children: [],
            selected: false,
            visible: true,
            deleted: false,
            vertical: config.vertical,
            provider: config.provider,
            model: config.model,
            contextData: config.context,
            tokensInput: chunk.tokensUsed || 0,
            tokensOutput: 0,
            cost: chunk.cost || 0,
            status: 'completed' as const,
            createdAt: new Date(),
          };

          setCurrentGeneration(newNode);
          addGenerationNode(newNode);
          setActiveNode(newNode.id);

          // Update analytics
          updateAnalytics({
            tokens: chunk.tokensUsed,
            cost: chunk.cost,
            generations: 1,
          });

          updateProviderUsage(config.provider, chunk.tokensUsed || 0, chunk.cost || 0);

          addNotification({
            type: 'success',
            title: 'Streaming Complete',
            message: 'Content generation finished successfully',
            duration: 4000,
          });

          break;
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      addError(error instanceof Error ? error.message : 'Streaming failed');
      
      addNotification({
        type: 'error',
        title: 'Streaming Failed',
        message: 'Content generation was interrupted',
        duration: 5000,
      });
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }, [
    setStreaming,
    setCurrentGeneration,
    addGenerationNode,
    setActiveNode,
    updateAnalytics,
    updateProviderUsage,
    addNotification,
    addError,
  ]);

  // Handle generation cancel
  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStreaming(false);
    setLoading(false);
    
    addNotification({
      type: 'info',
      title: 'Generation Cancelled',
      message: 'Content generation was stopped',
      duration: 3000,
    });
  }, [setStreaming, setLoading, addNotification]);

  // Handle manual save
  const handleSave = useCallback(async () => {
    await handleAutoSave(generationInput);
  }, [generationInput, handleAutoSave]);

  // Handle export
  const handleExport = useCallback(() => {
    const content = activeNode?.content || streamingContent || generationInput;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-content-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Content Exported',
      message: 'File downloaded successfully',
      duration: 3000,
    });
  }, [activeNode, streamingContent, generationInput, addNotification]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            if (!loading && !streaming) {
              handleGenerate();
            }
            break;
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'e':
            event.preventDefault();
            handleExport();
            break;
          case '1':
            event.preventDefault();
            setWorkspaceView('editor');
            break;
          case '2':
            event.preventDefault();
            setWorkspaceView('preview');
            break;
          case '3':
            event.preventDefault();
            setWorkspaceView('split');
            break;
        }
      }

      if (event.key === 'Escape') {
        if (streaming) {
          handleCancelGeneration();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, handleSave, handleExport, handleCancelGeneration, loading, streaming]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Workspace Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generation Workspace
          </h2>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['editor', 'preview', 'split'] as const).map((view) => {
              const icons = {
                editor: Edit,
                preview: Eye, 
                split: Split,
              };
              const IconComponent = icons[view];
              
              return (
                <button
                  key={view}
                  onClick={() => setWorkspaceView(view)}
                  className={`p-1.5 rounded transition-colors ${
                    workspaceView === view
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={`${view} view`}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Save Status */}
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            {saveStatus === 'saved' && <Circle className="h-4 w-4 text-green-500" />}
            {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveStatus === 'unsaved' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
            {saveStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            <span className="hidden sm:inline">
              {saveStatus === 'saved' ? 'Saved' : 
               saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'unsaved' ? 'Unsaved' : 'Error'}
            </span>
          </div>

          {/* Actions */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Save (Cmd+S)"
          >
            <Save className="h-4 w-4" />
          </button>

          <button
            onClick={handleExport}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Export (Cmd+E)"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg transition-colors ${
              showMetadata
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle metadata panel"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Content */}
      <div className="flex flex-1 min-h-0">
        {/* Generation Tree Sidebar (desktop only) */}
        <div className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-700">
          <GenerationTree />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Generation Controls */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <GenerationControls
              value={generationInput}
              onChange={handleInputChange}
              onGenerate={handleGenerate}
              onCancel={handleCancelGeneration}
              loading={loading}
              streaming={streaming}
            />
          </div>

          {/* Editor/Preview Area */}
          <div className="flex-1 overflow-hidden">
            {workspaceView === 'editor' && (
              <div className="h-full">
                {streaming ? (
                  <StreamingDisplay content={streamingContent} />
                ) : (
                  <ContentEditor
                    content={activeNode?.content || ''}
                    onChange={(content) => {
                      if (activeNode) {
                        updateGenerationNode(activeNode.id, { content });
                      }
                    }}
                    mode={mode}
                    readOnly={!activeNode}
                  />
                )}
              </div>
            )}

            {workspaceView === 'preview' && (
              <div className="h-full p-4 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  {activeNode?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: activeNode.content }} />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content to preview. Generate or select content to see it here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {workspaceView === 'split' && (
              <div className="flex h-full">
                <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                  {streaming ? (
                    <StreamingDisplay content={streamingContent} />
                  ) : (
                    <ContentEditor
                      content={activeNode?.content || ''}
                      onChange={(content) => {
                        if (activeNode) {
                          updateGenerationNode(activeNode.id, { content });
                        }
                      }}
                      mode={mode}
                      readOnly={!activeNode}
                    />
                  )}
                </div>
                <div className="w-1/2 p-4 overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none">
                    {activeNode?.content || streamingContent ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: activeNode?.content || streamingContent 
                      }} />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Panel */}
        {showMetadata && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700">
            <MetadataPanel node={activeNode} />
          </div>
        )}
      </div>

      {/* Mobile Generation Tree (bottom sheet) */}
      <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
        <GenerationTree mobile />
      </div>
    </div>
  );
};