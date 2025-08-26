// AI Content Generation Store - Central state management with Zustand
// This store manages all AI-related state including generation trees, context, and providers

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export interface GenerationNode {
  id: string;
  type: 'idea' | 'title' | 'synopsis' | 'outline' | 'blog' | 'social' | 'image_prompt' | 'analysis';
  mode: 'structured' | 'direct' | 'batch' | 'multi_vertical' | 'edit_existing';
  content: string | null;
  structuredContent?: {
    title?: string;
    synopsis?: string;
    outline?: string[];
    tags?: string[];
    metadata?: Record<string, unknown>;
    imagePrompts?: ImagePrompt[];
  };
  parentId?: string;
  rootId?: string;
  children: string[];
  selected: boolean;
  visible: boolean;
  deleted: boolean;
  vertical?: string;
  provider: string;
  model: string;
  prompt?: string;
  contextData?: ContextData;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  durationMs?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  errorMessage?: string;
  publishedBlogId?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ImagePrompt {
  id: string;
  originalText: string;
  editedText?: string;
  finalText?: string;
  position: number;
  type: 'hero' | 'section' | 'footer';
  characterIds: string[];
  styleReferenceIds: string[];
  generatedImages: GeneratedImage[];
  generated: boolean;
}

export interface GeneratedImage {
  url: string;
  provider: string;
  model: string;
  prompt: string;
  selected: boolean;
  createdAt: string;
  cost: number;
}

export interface ContextData {
  styleGuideIds?: string[];
  referenceBlogIds?: string[];
  referenceImageIds?: string[];
  customContext?: string;
  includeElements?: {
    titles?: boolean;
    synopsis?: boolean;
    content?: boolean;
    tags?: boolean;
    metadata?: boolean;
    images?: boolean;
  };
}

export interface StyleGuide {
  id: string;
  type: 'brand' | 'vertical' | 'writing_style' | 'persona';
  name: string;
  vertical?: string;
  content: string;
  description?: string;
  version: number;
  parentId?: string;
  active: boolean;
  isDefault: boolean;
  perspective?: string;
  voiceCharacteristics: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider {
  name: 'openai' | 'anthropic' | 'google' | 'perplexity';
  apiKey?: string;
  models: Model[];
  defaultModel?: string;
  usageLimit?: number;
  currentUsage: number;
  active: boolean;
}

export interface Model {
  id: string;
  name: string;
  contextWindow: number;
  maxOutput?: number;
  pricing: {
    input: number;
    output: number;
  };
  bestFor: string[];
  features: string[];
}

export interface GenerationConfig {
  mode: 'structured' | 'direct' | 'batch' | 'multi_vertical' | 'edit_existing';
  vertical: 'all' | 'hospitality' | 'healthcare' | 'tech' | 'athletics';
  verticalMode?: 'parallel' | 'sequential' | 'adaptive';
  task: string;
  prompt: string;
  context: ContextSelection;
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  model: string;
  outputCount?: number;
}

export interface ContextSelection {
  styleGuides: {
    brand?: boolean;
    vertical?: string[];
    writingStyle?: string[];
    persona?: string[];
  };
  previousContent: {
    mode: 'none' | 'all' | 'vertical' | 'selected';
    verticalFilter?: string;
    items?: string[];
    includeElements: {
      titles: boolean;
      synopsis: boolean;
      content: boolean;
      tags: boolean;
      metadata: boolean;
      images: boolean;
    };
  };
  referenceImages: {
    style?: string[];
    logo?: string[];
    persona?: string[];
  };
  additionalContext?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

// Main store interface
interface AIStore {
  // Generation state
  currentGeneration: GenerationNode | null;
  generationTree: Record<string, GenerationNode>;
  activeNodeId: string | null;
  
  // Context state
  selectedContext: ContextSelection;
  styleGuides: StyleGuide[];
  previousBlogs: unknown[]; // Blog posts from the existing system
  
  // Provider state
  providers: Record<string, Provider>;
  activeProvider: string;
  activeModel: string;
  
  // UI state
  mode: 'quick' | 'structured' | 'edit';
  loading: boolean;
  streaming: boolean;
  errors: string[];
  notifications: Notification[];
  
  // Multi-vertical state
  multiVerticalConfig: {
    verticals: string[];
    strategy: 'parallel' | 'sequential' | 'hybrid';
    shareIntro: boolean;
    customizations: Record<string, unknown>;
  };
  
  // Image generation state
  imageGenerationQueue: string[];
  generatingImages: boolean;
  
  // Analytics state
  tokensUsed: number;
  totalCost: number;
  generationCount: number;
  successRate: number;
  
  // Actions - Generation
  setCurrentGeneration: (generation: GenerationNode | null) => void;
  addGenerationNode: (node: GenerationNode) => void;
  updateGenerationNode: (id: string, updates: Partial<GenerationNode>) => void;
  deleteGenerationNode: (id: string) => void;
  setActiveNode: (id: string | null) => void;
  createBranch: (parentId: string, content: string) => void;
  
  // Actions - Context
  updateContext: (context: Partial<ContextSelection>) => void;
  setStyleGuides: (guides: StyleGuide[]) => void;
  setPreviousBlogs: (blogs: unknown[]) => void;
  
  // Actions - Providers
  setProviders: (providers: Record<string, Provider>) => void;
  setActiveProvider: (provider: string) => void;
  setActiveModel: (model: string) => void;
  updateProviderUsage: (provider: string, tokens: number, cost: number) => void;
  
  // Actions - UI
  setMode: (mode: 'quick' | 'structured' | 'edit') => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  
  // Actions - Multi-vertical
  setMultiVerticalConfig: (config: Partial<AIStore['multiVerticalConfig']>) => void;
  
  // Actions - Image Generation
  addToImageQueue: (promptId: string) => void;
  removeFromImageQueue: (promptId: string) => void;
  setGeneratingImages: (generating: boolean) => void;
  
  // Actions - Analytics
  updateAnalytics: (data: { tokens?: number; cost?: number; generations?: number }) => void;
  resetAnalytics: () => void;
  
  // Actions - Generation lifecycle
  startGeneration: (nodeId: string) => void;
  completeGeneration: (nodeId: string, success: boolean, errorMessage?: string) => void;
}

// Default context selection
const defaultContextSelection: ContextSelection = {
  styleGuides: {
    brand: true,
    vertical: [],
    writingStyle: [],
    persona: [],
  },
  previousContent: {
    mode: 'none',
    includeElements: {
      titles: true,
      synopsis: true,
      content: false,
      tags: true,
      metadata: false,
      images: false,
    },
  },
  referenceImages: {
    style: [],
    logo: [],
    persona: [],
  },
  additionalContext: '',
};

// Default multi-vertical config
const defaultMultiVerticalConfig = {
  verticals: [],
  strategy: 'parallel' as const,
  shareIntro: false,
  customizations: {},
};

// Create the store
export const useAIStore = create<AIStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        currentGeneration: null,
        generationTree: {},
        activeNodeId: null,
        
        selectedContext: defaultContextSelection,
        styleGuides: [],
        previousBlogs: [],
        
        providers: {},
        activeProvider: 'openai',
        activeModel: 'gpt-4o',
        
        mode: 'quick',
        loading: false,
        streaming: false,
        errors: [],
        notifications: [],
        
        multiVerticalConfig: defaultMultiVerticalConfig,
        
        imageGenerationQueue: [],
        generatingImages: false,
        
        tokensUsed: 0,
        totalCost: 0,
        generationCount: 0,
        successRate: 100,
        
        // Actions - Generation
        setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
        
        addGenerationNode: (node) =>
          set((state) => ({
            generationTree: {
              ...state.generationTree,
              [node.id]: node,
            },
          })),
        
        updateGenerationNode: (id, updates) =>
          set((state) => ({
            generationTree: {
              ...state.generationTree,
              [id]: { ...state.generationTree[id], ...updates },
            },
          })),
        
        deleteGenerationNode: (id) =>
          set((state) => {
            const newTree = { ...state.generationTree };
            if (newTree[id]) {
              newTree[id] = { ...newTree[id], deleted: true };
            }
            return { generationTree: newTree };
          }),
        
        setActiveNode: (id) => set({ activeNodeId: id }),
        
        createBranch: (parentId, content) => {
          const parent = get().generationTree[parentId];
          if (!parent) return;
          
          const newNode: GenerationNode = {
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'blog',
            mode: parent.mode,
            content,
            parentId,
            rootId: parent.rootId || parentId,
            children: [],
            selected: false,
            visible: true,
            deleted: false,
            vertical: parent.vertical,
            provider: parent.provider,
            model: parent.model,
            contextData: parent.contextData,
            tokensInput: 0,
            tokensOutput: 0,
            cost: 0,
            status: 'pending',
            createdAt: new Date(),
          };
          
          set((state) => ({
            generationTree: {
              ...state.generationTree,
              [newNode.id]: newNode,
              [parentId]: {
                ...state.generationTree[parentId],
                children: [...state.generationTree[parentId].children, newNode.id],
              },
            },
          }));
        },
        
        // Actions - Context
        updateContext: (context) =>
          set((state) => ({
            selectedContext: { ...state.selectedContext, ...context },
          })),
        
        setStyleGuides: (guides) => set({ styleGuides: guides }),
        
        setPreviousBlogs: (blogs) => set({ previousBlogs: blogs }),
        
        // Actions - Providers
        setProviders: (providers) => set({ providers }),
        
        setActiveProvider: (provider) => set({ activeProvider: provider }),
        
        setActiveModel: (model) => set({ activeModel: model }),
        
        updateProviderUsage: (provider, tokens, cost) =>
          set((state) => ({
            providers: {
              ...state.providers,
              [provider]: {
                ...state.providers[provider],
                currentUsage: state.providers[provider].currentUsage + cost,
              },
            },
            tokensUsed: state.tokensUsed + tokens,
            totalCost: state.totalCost + cost,
          })),
        
        // Actions - UI
        setMode: (mode) => set({ mode }),
        
        setLoading: (loading) => set({ loading }),
        
        setStreaming: (streaming) => set({ streaming }),
        
        addError: (error) =>
          set((state) => ({
            errors: [...state.errors, error],
          })),
        
        clearErrors: () => set({ errors: [] }),
        
        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date(),
              },
            ],
          })),
        
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        
        // Actions - Multi-vertical
        setMultiVerticalConfig: (config) =>
          set((state) => ({
            multiVerticalConfig: { ...state.multiVerticalConfig, ...config },
          })),
        
        // Actions - Image Generation
        addToImageQueue: (promptId) =>
          set((state) => ({
            imageGenerationQueue: [...state.imageGenerationQueue, promptId],
          })),
        
        removeFromImageQueue: (promptId) =>
          set((state) => ({
            imageGenerationQueue: state.imageGenerationQueue.filter((id) => id !== promptId),
          })),
        
        setGeneratingImages: (generating) => set({ generatingImages: generating }),
        
        // Actions - Analytics
        updateAnalytics: (data) =>
          set((state) => ({
            tokensUsed: state.tokensUsed + (data.tokens || 0),
            totalCost: state.totalCost + (data.cost || 0),
            generationCount: state.generationCount + (data.generations || 0),
          })),
        
        resetAnalytics: () =>
          set({
            tokensUsed: 0,
            totalCost: 0,
            generationCount: 0,
            successRate: 100,
          }),
        
        // Actions - Generation lifecycle
        startGeneration: (nodeId) =>
          set((state) => ({
            generationTree: {
              ...state.generationTree,
              [nodeId]: {
                ...state.generationTree[nodeId],
                status: 'processing',
              },
            },
          })),
          
        completeGeneration: (nodeId, success, errorMessage) =>
          set((state) => ({
            generationTree: {
              ...state.generationTree,
              [nodeId]: {
                ...state.generationTree[nodeId],
                status: success ? 'completed' : 'failed',
                errorMessage,
                completedAt: new Date(),
              },
            },
          })),
      }),
      {
        name: 'ai-content-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Persist only essential state, not UI state
          selectedContext: state.selectedContext,
          styleGuides: state.styleGuides,
          activeProvider: state.activeProvider,
          activeModel: state.activeModel,
          multiVerticalConfig: state.multiVerticalConfig,
          tokensUsed: state.tokensUsed,
          totalCost: state.totalCost,
          generationCount: state.generationCount,
        }),
      }
    )
  )
);

// Selectors for derived state
export const selectGenerationTree = (state: AIStore) => state.generationTree;
export const selectActiveNode = (state: AIStore) => 
  state.activeNodeId ? state.generationTree[state.activeNodeId] : null;
export const selectRootNodes = (state: AIStore) => 
  Object.values(state.generationTree).filter(node => !node.parentId && !node.deleted);
export const selectNodeChildren = (state: AIStore, nodeId: string) =>
  Object.values(state.generationTree).filter(node => node.parentId === nodeId && !node.deleted);

// Helper functions
export const generateNodeId = () => 
  `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const generateNotificationId = () => 
  `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;