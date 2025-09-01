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
  type: 'hero' | 'section' | 'footer' | 'illustration' | 'infographic';
  characterIds: string[];
  styleReferenceIds: string[];
  generatedImages: GeneratedImage[];
  generated: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  data?: string; // Base64 image data for Gemini images
  mimeType?: string; // Image format (image/png, image/jpeg, etc.)
  provider: string;
  model: string;
  prompt: string;
  caption?: string; // Generated caption for the image
  placement?: string; // Where in content this image should be placed
  style?: string; // Style used for generation (photorealistic, illustration, etc.)
  selected: boolean;
  createdAt: string;
  cost: number;
  metadata?: {
    vertical?: string;
    imageType?: string;
    aspectRatio?: string;
    quality?: string;
    generatedFromBlog?: boolean;
    index?: number;
    [key: string]: any;
  };
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

export interface PreviousBlog {
  id: string;
  title: string;
  vertical: string;
  publishedDate: string;
  excerpt: string;
  category: string;
  tags: string[];
  author?: string;
  content?: string;
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

export interface BrainstormingIdea {
  id: string;
  title: string;
  angle: string;
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedWordCount: number;
  isFavorited: boolean;
  createdAt: string;
  score: number;
  metadata?: {
    generatedFromTopic: string;
    generationIndex: number;
    fallback?: boolean;
  };
}

export interface BrainstormingSession {
  id: string;
  topic: string;
  config: {
    count: number;
    vertical: string;
    tone: string;
    contentTypes: string[];
    customContext: string;
  };
  ideas: BrainstormingIdea[];
  favoriteIds: string[];
  selectedIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  estimatedMinutes?: number;
  optional?: boolean;
  data?: any; // Step-specific data storage
}

export interface StructuredWorkflowState {
  id: string;
  sessionId: string;
  steps: WorkflowStep[];
  currentStepId: string;
  isActive: boolean;
  startedAt: string;
  completedAt?: string;
  totalEstimatedMinutes: number;
  
  // Step data
  stepData: {
    ideation?: {
      selectedIdea?: any;
      topic: string;
    };
    title?: {
      selectedTitles: any[];
      topic: string;
      context: string;
    };
    synopsis?: {
      selectedSynopses: any[];
      topic: string;
      title: string;
      context: string;
    };
    outline?: {
      selectedOutlines: any[];
      topic: string;
      title: string;
      synopsis: string;
      targetWordCount: number;
    };
    content?: {
      finalContent?: string;
      generationConfig?: any;
    };
  };
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
  previousBlogs: PreviousBlog[]; // Blog posts from the existing system
  
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
  
  // Modal state management
  modals: {
    context: boolean;
    styleGuide: boolean;
    multiVertical: boolean;
    socialMedia: boolean;
    ideation: boolean;
    imageGeneration: boolean;
    contentPlanning: boolean;
  };
  modalHistory: string[];  // Track modal navigation history
  
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
  
  // Brainstorming state
  brainstormingSessions: Record<string, BrainstormingSession>;
  activeBrainstormingSession: string | null;
  brainstormingLoading: boolean;
  
  // Structured workflow state
  structuredWorkflows: Record<string, StructuredWorkflowState>;
  activeWorkflow: string | null;
  workflowLoading: boolean;
  
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
  setPreviousBlogs: (blogs: PreviousBlog[]) => void;
  
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
  
  // Actions - Modal Management
  openModal: (modalName: keyof AIStore['modals']) => void;
  closeModal: (modalName: keyof AIStore['modals']) => void;
  closeAllModals: () => void;
  toggleModal: (modalName: keyof AIStore['modals']) => void;
  pushModalHistory: (modalName: string) => void;
  popModalHistory: () => string | undefined;
  
  // Actions - Multi-vertical
  setMultiVerticalConfig: (config: Partial<AIStore['multiVerticalConfig']>) => void;
  
  // Actions - Image Generation
  addToImageQueue: (promptId: string) => void;
  removeFromImageQueue: (promptId: string) => void;
  setGeneratingImages: (generating: boolean) => void;
  addGeneratedImages: (nodeId: string, images: GeneratedImage[]) => void;
  updateGeneratedImage: (nodeId: string, imageId: string, updates: Partial<GeneratedImage>) => void;
  removeGeneratedImage: (nodeId: string, imageId: string) => void;
  
  // Actions - Analytics
  updateAnalytics: (data: { tokens?: number; cost?: number; generations?: number }) => void;
  resetAnalytics: () => void;
  
  // Actions - Generation lifecycle
  startGeneration: (nodeId: string) => void;
  completeGeneration: (nodeId: string, success: boolean, errorMessage?: string) => void;
  
  // Actions - Brainstorming
  createBrainstormingSession: (session: BrainstormingSession) => void;
  updateBrainstormingSession: (sessionId: string, updates: Partial<BrainstormingSession>) => void;
  deleteBrainstormingSession: (sessionId: string) => void;
  setActiveBrainstormingSession: (sessionId: string | null) => void;
  setBrainstormingLoading: (loading: boolean) => void;
  addBrainstormingIdea: (sessionId: string, idea: BrainstormingIdea) => void;
  updateBrainstormingIdea: (sessionId: string, ideaId: string, updates: Partial<BrainstormingIdea>) => void;
  deleteBrainstormingIdea: (sessionId: string, ideaId: string) => void;
  toggleBrainstormingFavorite: (sessionId: string, ideaId: string) => void;
  selectBrainstormingIdeas: (sessionId: string, ideaIds: string[]) => void;
  
  // Actions - Structured Workflow
  createWorkflow: (workflow: StructuredWorkflowState) => void;
  updateWorkflow: (workflowId: string, updates: Partial<StructuredWorkflowState>) => void;
  deleteWorkflow: (workflowId: string) => void;
  setActiveWorkflow: (workflowId: string | null) => void;
  setWorkflowLoading: (loading: boolean) => void;
  updateWorkflowStep: (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  updateWorkflowStepData: (workflowId: string, stepId: string, data: any) => void;
  navigateToStep: (workflowId: string, stepId: string) => void;
  completeWorkflowStep: (workflowId: string, stepId: string) => void;
  resetWorkflow: (workflowId: string) => void;
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
        
        modals: {
          context: false,
          styleGuide: false,
          multiVertical: false,
          socialMedia: false,
          ideation: false,
          imageGeneration: false,
          contentPlanning: false,
        },
        modalHistory: [],
        
        multiVerticalConfig: defaultMultiVerticalConfig,
        
        imageGenerationQueue: [],
        generatingImages: false,
        
        tokensUsed: 0,
        totalCost: 0,
        generationCount: 0,
        successRate: 100,
        
        brainstormingSessions: {},
        activeBrainstormingSession: null,
        brainstormingLoading: false,
        
        structuredWorkflows: {},
        activeWorkflow: null,
        workflowLoading: false,
        
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
        
        // Actions - Modal Management
        openModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: true },
            modalHistory: [...state.modalHistory, modalName],
          })),
        
        closeModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: false },
          })),
        
        closeAllModals: () =>
          set((state) => ({
            modals: {
              context: false,
              styleGuide: false,
              multiVertical: false,
              socialMedia: false,
              ideation: false,
              imageGeneration: false,
              contentPlanning: false,
            },
            modalHistory: [],
          })),
        
        toggleModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: !state.modals[modalName] },
            modalHistory: state.modals[modalName] 
              ? state.modalHistory 
              : [...state.modalHistory, modalName],
          })),
        
        pushModalHistory: (modalName) =>
          set((state) => ({
            modalHistory: [...state.modalHistory, modalName],
          })),
        
        popModalHistory: () => {
          const history = get().modalHistory;
          if (history.length > 0) {
            set({ modalHistory: history.slice(0, -1) });
            return history[history.length - 1];
          }
          return undefined;
        },
        
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

        addGeneratedImages: (nodeId, images) =>
          set((state) => {
            const node = state.generationTree[nodeId];
            if (!node) return state;
            
            const existingImagePrompts = node.structuredContent?.imagePrompts || [];
            const newImagePrompts = images.map((image, index) => ({
              id: image.id,
              originalText: image.caption || image.prompt,
              finalText: image.caption || image.prompt,
              position: index,
              type: (image.placement as any) || 'section',
              characterIds: [],
              styleReferenceIds: [],
              generatedImages: [image],
              generated: true
            }));
            
            return {
              generationTree: {
                ...state.generationTree,
                [nodeId]: {
                  ...node,
                  structuredContent: {
                    ...node.structuredContent,
                    imagePrompts: [...existingImagePrompts, ...newImagePrompts]
                  }
                }
              }
            };
          }),

        updateGeneratedImage: (nodeId, imageId, updates) =>
          set((state) => {
            const node = state.generationTree[nodeId];
            if (!node?.structuredContent?.imagePrompts) return state;
            
            const updatedImagePrompts = node.structuredContent.imagePrompts.map(prompt => ({
              ...prompt,
              generatedImages: prompt.generatedImages.map(image =>
                image.id === imageId ? { ...image, ...updates } : image
              )
            }));
            
            return {
              generationTree: {
                ...state.generationTree,
                [nodeId]: {
                  ...node,
                  structuredContent: {
                    ...node.structuredContent,
                    imagePrompts: updatedImagePrompts
                  }
                }
              }
            };
          }),

        removeGeneratedImage: (nodeId, imageId) =>
          set((state) => {
            const node = state.generationTree[nodeId];
            if (!node?.structuredContent?.imagePrompts) return state;
            
            const updatedImagePrompts = node.structuredContent.imagePrompts.map(prompt => ({
              ...prompt,
              generatedImages: prompt.generatedImages.filter(image => image.id !== imageId)
            })).filter(prompt => prompt.generatedImages.length > 0);
            
            return {
              generationTree: {
                ...state.generationTree,
                [nodeId]: {
                  ...node,
                  structuredContent: {
                    ...node.structuredContent,
                    imagePrompts: updatedImagePrompts
                  }
                }
              }
            };
          }),
        
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
        
        // Actions - Brainstorming
        createBrainstormingSession: (session) =>
          set((state) => ({
            brainstormingSessions: {
              ...state.brainstormingSessions,
              [session.id]: session,
            },
          })),

        updateBrainstormingSession: (sessionId, updates) =>
          set((state) => ({
            brainstormingSessions: {
              ...state.brainstormingSessions,
              [sessionId]: {
                ...state.brainstormingSessions[sessionId],
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          })),

        deleteBrainstormingSession: (sessionId) =>
          set((state) => {
            const newSessions = { ...state.brainstormingSessions };
            delete newSessions[sessionId];
            return {
              brainstormingSessions: newSessions,
              activeBrainstormingSession: state.activeBrainstormingSession === sessionId ? null : state.activeBrainstormingSession,
            };
          }),

        setActiveBrainstormingSession: (sessionId) =>
          set({ activeBrainstormingSession: sessionId }),

        setBrainstormingLoading: (loading) =>
          set({ brainstormingLoading: loading }),

        addBrainstormingIdea: (sessionId, idea) =>
          set((state) => {
            const session = state.brainstormingSessions[sessionId];
            if (!session) return state;
            
            return {
              brainstormingSessions: {
                ...state.brainstormingSessions,
                [sessionId]: {
                  ...session,
                  ideas: [...session.ideas, idea],
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          }),

        updateBrainstormingIdea: (sessionId, ideaId, updates) =>
          set((state) => {
            const session = state.brainstormingSessions[sessionId];
            if (!session) return state;
            
            return {
              brainstormingSessions: {
                ...state.brainstormingSessions,
                [sessionId]: {
                  ...session,
                  ideas: session.ideas.map(idea =>
                    idea.id === ideaId ? { ...idea, ...updates } : idea
                  ),
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          }),

        deleteBrainstormingIdea: (sessionId, ideaId) =>
          set((state) => {
            const session = state.brainstormingSessions[sessionId];
            if (!session) return state;
            
            return {
              brainstormingSessions: {
                ...state.brainstormingSessions,
                [sessionId]: {
                  ...session,
                  ideas: session.ideas.filter(idea => idea.id !== ideaId),
                  favoriteIds: session.favoriteIds.filter(id => id !== ideaId),
                  selectedIds: session.selectedIds.filter(id => id !== ideaId),
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          }),

        toggleBrainstormingFavorite: (sessionId, ideaId) =>
          set((state) => {
            const session = state.brainstormingSessions[sessionId];
            if (!session) return state;
            
            const isFavorited = session.favoriteIds.includes(ideaId);
            const newFavoriteIds = isFavorited
              ? session.favoriteIds.filter(id => id !== ideaId)
              : [...session.favoriteIds, ideaId];
            
            return {
              brainstormingSessions: {
                ...state.brainstormingSessions,
                [sessionId]: {
                  ...session,
                  ideas: session.ideas.map(idea =>
                    idea.id === ideaId ? { ...idea, isFavorited: !isFavorited } : idea
                  ),
                  favoriteIds: newFavoriteIds,
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          }),

        selectBrainstormingIdeas: (sessionId, ideaIds) =>
          set((state) => {
            const session = state.brainstormingSessions[sessionId];
            if (!session) return state;
            
            return {
              brainstormingSessions: {
                ...state.brainstormingSessions,
                [sessionId]: {
                  ...session,
                  selectedIds: ideaIds,
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          }),

        // Actions - Structured Workflow
        createWorkflow: (workflow) =>
          set((state) => ({
            structuredWorkflows: {
              ...state.structuredWorkflows,
              [workflow.id]: workflow,
            },
          })),

        updateWorkflow: (workflowId, updates) =>
          set((state) => {
            const workflow = state.structuredWorkflows[workflowId];
            if (!workflow) return state;
            
            return {
              structuredWorkflows: {
                ...state.structuredWorkflows,
                [workflowId]: { ...workflow, ...updates },
              },
            };
          }),

        deleteWorkflow: (workflowId) =>
          set((state) => {
            const newWorkflows = { ...state.structuredWorkflows };
            delete newWorkflows[workflowId];
            return {
              structuredWorkflows: newWorkflows,
              activeWorkflow: state.activeWorkflow === workflowId ? null : state.activeWorkflow,
            };
          }),

        setActiveWorkflow: (workflowId) => set({ activeWorkflow: workflowId }),

        setWorkflowLoading: (loading) => set({ workflowLoading: loading }),

        updateWorkflowStep: (workflowId, stepId, updates) =>
          set((state) => {
            const workflow = state.structuredWorkflows[workflowId];
            if (!workflow) return state;
            
            return {
              structuredWorkflows: {
                ...state.structuredWorkflows,
                [workflowId]: {
                  ...workflow,
                  steps: workflow.steps.map(step =>
                    step.id === stepId ? { ...step, ...updates } : step
                  ),
                },
              },
            };
          }),

        updateWorkflowStepData: (workflowId, stepId, data) =>
          set((state) => {
            const workflow = state.structuredWorkflows[workflowId];
            if (!workflow) return state;
            
            return {
              structuredWorkflows: {
                ...state.structuredWorkflows,
                [workflowId]: {
                  ...workflow,
                  stepData: {
                    ...workflow.stepData,
                    [stepId]: { ...workflow.stepData[stepId as keyof typeof workflow.stepData], ...data },
                  },
                },
              },
            };
          }),

        navigateToStep: (workflowId, stepId) =>
          set((state) => {
            const workflow = state.structuredWorkflows[workflowId];
            if (!workflow) return state;
            
            // Update current step and mark new step as current
            const updatedSteps = workflow.steps.map(step => ({
              ...step,
              status: step.id === stepId ? 'current' as const : 
                      step.status === 'current' ? 'pending' as const : 
                      step.status
            }));
            
            return {
              structuredWorkflows: {
                ...state.structuredWorkflows,
                [workflowId]: {
                  ...workflow,
                  currentStepId: stepId,
                  steps: updatedSteps,
                },
              },
            };
          }),

        completeWorkflowStep: (workflowId, stepId) =>
          set((state) => {
            const workflow = state.structuredWorkflows[workflowId];
            if (!workflow) return state;
            
            const stepIndex = workflow.steps.findIndex(step => step.id === stepId);
            const nextStep = workflow.steps[stepIndex + 1];
            
            const updatedSteps = workflow.steps.map((step, index) => ({
              ...step,
              status: step.id === stepId ? 'completed' as const :
                      nextStep && step.id === nextStep.id ? 'current' as const :
                      step.status
            }));
            
            return {
              structuredWorkflows: {
                ...state.structuredWorkflows,
                [workflowId]: {
                  ...workflow,
                  currentStepId: nextStep ? nextStep.id : stepId,
                  steps: updatedSteps,
                  completedAt: !nextStep ? new Date().toISOString() : workflow.completedAt,
                },
              },
            };
          }),

        resetWorkflow: (workflowId) =>
          set((state) => {
            const workflow = state.structuredWorkflows[workflowId];
            if (!workflow) return state;
            
            const resetSteps = workflow.steps.map((step, index) => ({
              ...step,
              status: index === 0 ? 'current' as const : 'pending' as const,
              data: undefined,
            }));
            
            return {
              structuredWorkflows: {
                ...state.structuredWorkflows,
                [workflowId]: {
                  ...workflow,
                  currentStepId: workflow.steps[0]?.id || '',
                  steps: resetSteps,
                  stepData: {},
                  completedAt: undefined,
                },
              },
            };
          }),
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
          brainstormingSessions: state.brainstormingSessions,
          activeBrainstormingSession: state.activeBrainstormingSession,
          structuredWorkflows: state.structuredWorkflows,
          activeWorkflow: state.activeWorkflow,
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