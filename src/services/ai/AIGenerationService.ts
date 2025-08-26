// AI Generation Service - Interface layer for AI content generation APIs
// Handles communication with backend AI services and real-time streaming

import { GenerationConfig, GenerationNode, ContextSelection, StyleGuide, ImagePrompt } from '../../store/aiStore';

export interface StreamingResponse {
  chunk: string;
  type: 'content' | 'metadata' | 'complete' | 'error';
  tokensUsed?: number;
  cost?: number;
}

export interface GenerationResponse {
  success: boolean;
  data?: GenerationNode;
  error?: string;
  tokensUsed?: number;
  cost?: number;
  durationMs?: number;
}

export interface StyleGuideResponse {
  success: boolean;
  data?: StyleGuide[];
  error?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  data?: {
    url: string;
    prompt: string;
    cost: number;
  }[];
  error?: string;
}

class AIGenerationService {
  private baseUrl = '/api/ai';
  private abortControllers = new Map<string, AbortController>();

  // =====================
  // GENERATION METHODS
  // =====================

  /**
   * Start a new AI content generation
   */
  async generateContent(config: GenerationConfig): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Generation failed',
        };
      }

      return {
        success: true,
        data: data.generation,
        tokensUsed: data.tokensUsed,
        cost: data.cost,
        durationMs: data.durationMs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Start streaming content generation
   */
  async *streamGeneration(config: GenerationConfig): AsyncGenerator<StreamingResponse, void, unknown> {
    const abortController = new AbortController();
    const generationId = `gen_${Date.now()}`;
    this.abortControllers.set(generationId, abortController);

    try {
      const response = await fetch(`${this.baseUrl}/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
        signal: abortController.signal,
      });

      if (!response.ok) {
        yield {
          chunk: '',
          type: 'error',
        };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield {
          chunk: '',
          type: 'error',
        };
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield {
                chunk: data.content || '',
                type: data.type || 'content',
                tokensUsed: data.tokensUsed,
                cost: data.cost,
              };
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        yield {
          chunk: '',
          type: 'error',
        };
      }
    } finally {
      this.abortControllers.delete(generationId);
    }
  }

  /**
   * Cancel an ongoing generation
   */
  cancelGeneration(generationId: string): boolean {
    const controller = this.abortControllers.get(generationId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(generationId);
      return true;
    }
    return false;
  }

  /**
   * Generate multiple vertical variations
   */
  async generateMultiVertical(
    baseContent: string,
    verticals: string[],
    strategy: 'parallel' | 'sequential' | 'hybrid',
    context: ContextSelection
  ): Promise<GenerationResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/generate/multi-vertical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseContent,
          verticals,
          strategy,
          context,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return [{
          success: false,
          error: data.error || 'Multi-vertical generation failed',
        }];
      }

      return data.results || [];
    } catch (error) {
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }];
    }
  }

  // =====================
  // TREE MANAGEMENT
  // =====================

  /**
   * Get generation tree for a root node
   */
  async getGenerationTree(rootId: string): Promise<{ success: boolean; data?: GenerationNode[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tree/${rootId}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch generation tree',
        };
      }

      return {
        success: true,
        data: data.tree,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Delete a generation node
   */
  async deleteNode(nodeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tree/node/${nodeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to delete node',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Create a branch from existing node
   */
  async createBranch(
    parentId: string,
    modifications: string,
    context: ContextSelection
  ): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tree/branch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId,
          modifications,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create branch',
        };
      }

      return {
        success: true,
        data: data.node,
        tokensUsed: data.tokensUsed,
        cost: data.cost,
        durationMs: data.durationMs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // =====================
  // CONTEXT MANAGEMENT
  // =====================

  /**
   * Build context from selection
   */
  async buildContext(selection: ContextSelection): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/context/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selection),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to build context',
        };
      }

      return {
        success: true,
        data: data.context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // =====================
  // STYLE GUIDE MANAGEMENT
  // =====================

  /**
   * Get all available style guides
   */
  async getStyleGuides(): Promise<StyleGuideResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/style-guides`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch style guides',
        };
      }

      return {
        success: true,
        data: data.guides,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Create a new style guide
   */
  async createStyleGuide(
    guide: Omit<StyleGuide, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; data?: StyleGuide; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/style-guides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guide),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create style guide',
        };
      }

      return {
        success: true,
        data: data.guide,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update existing style guide
   */
  async updateStyleGuide(
    id: string,
    updates: Partial<StyleGuide>
  ): Promise<{ success: boolean; data?: StyleGuide; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/style-guides/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update style guide',
        };
      }

      return {
        success: true,
        data: data.guide,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Delete style guide
   */
  async deleteStyleGuide(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/style-guides/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to delete style guide',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // =====================
  // IMAGE GENERATION
  // =====================

  /**
   * Generate images from prompts
   */
  async generateImages(
    prompts: ImagePrompt[],
    provider: 'openai' | 'google' = 'openai',
    options: {
      size?: string;
      quality?: 'standard' | 'hd';
      style?: string;
      count?: number;
    } = {}
  ): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompts: prompts.map(p => ({
            id: p.id,
            text: p.finalText || p.editedText || p.originalText,
            type: p.type,
          })),
          provider,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Image generation failed',
        };
      }

      return {
        success: true,
        data: data.images,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // =====================
  // PROVIDER MANAGEMENT
  // =====================

  /**
   * Get available providers and models
   */
  async getProviders(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/providers`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch providers',
        };
      }

      return {
        success: true,
        data: data.providers,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Test provider connection
   */
  async testProvider(provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/providers/${provider}/test`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Provider test failed',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // =====================
  // ANALYTICS
  // =====================

  /**
   * Get generation analytics
   */
  async getAnalytics(
    dateRange: { start: Date; end: Date }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const params = new URLSearchParams({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      });

      const response = await fetch(`${this.baseUrl}/analytics?${params}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch analytics',
        };
      }

      return {
        success: true,
        data: data.analytics,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

// Export singleton instance
export const aiGenerationService = new AIGenerationService();