// Unit tests for GenerationService - Core AI generation orchestration
import { beforeEach, afterEach, describe, it, expect, jest } from '@jest/globals';
import { GenerationService } from '../../../../src/services/ai/GenerationService.js';
import { ProviderService } from '../../../../src/services/ai/ProviderService.js';
import { TreeService } from '../../../../src/services/ai/TreeService.js';
import { aiRepository } from '../../../../src/repositories/aiRepository.js';

// Mock dependencies
jest.mock('../../../../src/services/ai/ProviderService.js');
jest.mock('../../../../src/services/ai/TreeService.js');
jest.mock('../../../../src/repositories/aiRepository.js', () => ({
  aiRepository: {
    createGenerationNode: jest.fn(),
  },
}));

const mockProviderService = ProviderService as jest.MockedClass<typeof ProviderService>;
const mockTreeService = TreeService as jest.MockedClass<typeof TreeService>;
const mockAiRepository = aiRepository as jest.Mocked<typeof aiRepository>;

describe('GenerationService', () => {
  let generationService: GenerationService;
  let mockProviderInstance: jest.Mocked<ProviderService>;
  let mockTreeInstance: jest.Mocked<TreeService>;

  beforeEach(() => {
    // Setup mock instances
    mockProviderInstance = {
      generate: jest.fn(),
      selectProviderForTask: jest.fn(),
    } as unknown;

    mockTreeInstance = {
      createNode: jest.fn(),
      updateNode: jest.fn(),
    } as unknown;

    // Mock constructor calls
    mockProviderService.mockImplementation(() => mockProviderInstance);
    mockTreeService.mockImplementation(() => mockTreeInstance);

    generationService = new GenerationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Main Generation Orchestrator', () => {
    const baseConfig = {
      task: 'blog_writing_complete',
      prompt: 'Write about AI in healthcare',
      vertical: 'healthcare',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
    };

    describe('generate', () => {
      it('should route to direct generation by default', async () => {
        const mockResult = {
          mode: 'direct',
          results: [{
            nodeId: 'node-1',
            content: 'Generated content',
            usage: { totalTokens: 100, cost: 0.005 },
          }],
          usage: { totalTokens: 100, cost: 0.005 },
        };

        // Mock the directGeneration method
        jest.spyOn(generationService, 'directGeneration').mockResolvedValueOnce(mockResult);

        await generationService.generate(baseConfig);

        expect(generationService.directGeneration).toHaveBeenCalledWith(baseConfig, null);
        expect(result.mode).toBe('direct');
        expect(result.timing).toBeDefined();
        expect(result.timing.totalMs).toBeGreaterThan(0);
      });

      it('should route to structured generation when specified', async () => {
        const config = { ...baseConfig, mode: 'structured' };
        const mockResult = {
          mode: 'structured',
          workflow: { steps: ['idea', 'title', 'blog'] },
          results: {},
        };

        jest.spyOn(generationService, 'structuredGeneration').mockResolvedValueOnce(mockResult);

        const result = await generationService.generate(config);

        expect(generationService.structuredGeneration).toHaveBeenCalledWith(config, null);
        expect(result.mode).toBe('structured');
      });

      it('should handle unsupported generation modes', async () => {
        const config = { ...baseConfig, mode: 'unsupported_mode' as unknown };

        await expect(generationService.generate(config))
          .rejects.toThrow('Unsupported generation mode: unsupported_mode');
      });

      it('should handle generation errors gracefully', async () => {
        jest.spyOn(generationService, 'directGeneration')
          .mockRejectedValueOnce(new Error('Provider API error'));

        await expect(generationService.generate(baseConfig))
          .rejects.toThrow('Generation failed: Provider API error');
      });
    });
  });

  describe('Direct Generation', () => {
    beforeEach(() => {
      mockProviderInstance.generate.mockResolvedValue({
        content: 'Generated blog content about AI in healthcare...',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: {
          inputTokens: 150,
          outputTokens: 800,
          totalTokens: 950,
          cost: 0.025,
        },
      });

      mockAiRepository.createGenerationNode.mockResolvedValue({
        id: 'node-123',
        type: 'blog',
        content: 'Generated blog content...',
        createdAt: new Date(),
      } as unknown);
    });

    it('should generate single output by default', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about AI in healthcare',
        vertical: 'healthcare',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      const result = await generationService.directGeneration(config);

      expect(result.mode).toBe('direct');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        nodeId: 'node-123',
        content: 'Generated blog content about AI in healthcare...',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: {
          inputTokens: 150,
          outputTokens: 800,
          totalTokens: 950,
          cost: 0.025,
        },
        index: 0,
      });
      expect(result.selectedIndex).toBe(0);
    });

    it('should generate multiple outputs when requested', async () => {
      const config = {
        task: 'title_generation',
        prompt: 'Generate titles for AI healthcare blog',
        vertical: 'healthcare',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        outputCount: 3,
      };

      mockAiRepository.createGenerationNode
        .mockResolvedValueOnce({ id: 'node-1', type: 'title' } as unknown)
        .mockResolvedValueOnce({ id: 'node-2', type: 'title' } as unknown)
        .mockResolvedValueOnce({ id: 'node-3', type: 'title' } as unknown);

      const result = await generationService.directGeneration(config);

      expect(result.results).toHaveLength(3);
      expect(mockProviderInstance.generate).toHaveBeenCalledTimes(3);
      expect(mockAiRepository.createGenerationNode).toHaveBeenCalledTimes(3);
      
      // First output should be selected
      expect(result.results[0].index).toBe(0);
      expect(result.results[1].index).toBe(1);
      expect(result.results[2].index).toBe(2);
    });

    it('should vary temperature for alternative outputs', async () => {
      const config = {
        task: 'idea_generation',
        prompt: 'Generate blog ideas',
        vertical: 'tech',
        provider: 'openai',
        model: 'gpt-4',
        outputCount: 2,
      };

      await generationService.directGeneration(config);

      expect(mockProviderInstance.generate).toHaveBeenNthCalledWith(1, {
        task: 'idea_generation',
        prompt: 'Generate blog ideas',
        provider: 'openai',
        model: 'gpt-4',
        options: {
          vertical: 'tech',
          context: undefined,
          temperature: undefined, // First call uses default
        },
      });

      expect(mockProviderInstance.generate).toHaveBeenNthCalledWith(2, {
        task: 'idea_generation',
        prompt: 'Generate blog ideas',
        provider: 'openai',
        model: 'gpt-4',
        options: {
          vertical: 'tech',
          context: undefined,
          temperature: 0.9, // Second call varies temperature
        },
      });
    });

    it('should handle stream response updates', async () => {
      const mockStreamResponse = {
        write: jest.fn(),
      };

      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about AI',
        vertical: 'tech',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        outputCount: 2,
      };

      await generationService.directGeneration(config, mockStreamResponse);

      // Should send generation start event
      expect(mockStreamResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('generation_start')
      );

      // Should send output start/complete events for each output
      expect(mockStreamResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('output_start')
      );
      expect(mockStreamResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('output_complete')
      );
    });
  });

  describe('Multi-Vertical Generation', () => {
    beforeEach(() => {
      mockProviderInstance.generate.mockResolvedValue({
        content: 'Generated content for vertical...',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: { totalTokens: 500, cost: 0.015 },
      });

      mockAiRepository.createGenerationNode.mockImplementation(async (data) => ({
        id: `node-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date(),
      }));
    });

    it('should generate for all verticals in parallel mode', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about digital transformation',
        vertical: 'all',
        verticalMode: 'parallel',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      const result = await generationService.multiVerticalGeneration(config);

      expect(result.mode).toBe('multi_vertical');
      expect(result.verticalMode).toBe('parallel');
      expect(result.targetVerticals).toEqual(['hospitality', 'healthcare', 'tech', 'athletics']);
      
      // Should have results for all verticals
      expect(Object.keys(result.results)).toHaveLength(4);
      expect(result.results.hospitality).toBeDefined();
      expect(result.results.healthcare).toBeDefined();
      expect(result.results.tech).toBeDefined();
      expect(result.results.athletics).toBeDefined();
    });

    it('should generate for specific verticals only', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about customer service',
        vertical: ['hospitality', 'healthcare'],
        verticalMode: 'parallel',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      const result = await generationService.multiVerticalGeneration(config);

      expect(result.targetVerticals).toEqual(['hospitality', 'healthcare']);
      expect(Object.keys(result.results)).toHaveLength(2);
      expect(result.results.hospitality).toBeDefined();
      expect(result.results.healthcare).toBeDefined();
      expect(result.results.tech).toBeUndefined();
    });

    it('should handle sequential generation mode', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about innovation',
        vertical: ['tech', 'healthcare'],
        verticalMode: 'sequential',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      // Mock generateForVertical and adaptContentForVertical
      jest.spyOn(generationService, 'generateForVertical').mockResolvedValueOnce({
        nodeId: 'node-tech',
        content: 'Tech innovation content...',
        vertical: 'tech',
        usage: { totalTokens: 500, cost: 0.015 },
      } as unknown);

      jest.spyOn(generationService, 'adaptContentForVertical').mockResolvedValueOnce({
        nodeId: 'node-healthcare',
        content: 'Healthcare innovation content...',
        vertical: 'healthcare',
        adaptedFrom: 'tech',
        usage: { totalTokens: 450, cost: 0.012 },
      } as unknown);

      const result = await generationService.multiVerticalGeneration(config);

      expect(result.verticalMode).toBe('sequential');
      expect(generationService.generateForVertical).toHaveBeenCalledTimes(1);
      expect(generationService.adaptContentForVertical).toHaveBeenCalledTimes(1);
      
      expect(result.results.tech).toBeDefined();
      expect(result.results.healthcare).toBeDefined();
      expect(result.results.healthcare.adaptedFrom).toBe('tech');
    });

    it('should handle adaptive generation mode', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about customer experience',
        vertical: ['hospitality', 'healthcare', 'tech'],
        verticalMode: 'adaptive',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      jest.spyOn(generationService, 'generateForVertical')
        .mockResolvedValueOnce({
          nodeId: 'node-hospitality',
          content: 'Hospitality CX content...',
          vertical: 'hospitality',
          usage: { totalTokens: 500, cost: 0.015 },
        } as unknown)
        .mockResolvedValueOnce({
          nodeId: 'node-healthcare',
          content: 'Healthcare CX content...',
          vertical: 'healthcare',
          usage: { totalTokens: 480, cost: 0.014 },
        } as unknown)
        .mockResolvedValueOnce({
          nodeId: 'node-tech',
          content: 'Tech CX content...',
          vertical: 'tech',
          usage: { totalTokens: 520, cost: 0.016 },
        } as unknown);

      const result = await generationService.multiVerticalGeneration(config);

      expect(result.verticalMode).toBe('adaptive');
      expect(generationService.generateForVertical).toHaveBeenCalledTimes(3);

      // Each call should have access to previous content
      const secondCall = (generationService.generateForVertical as jest.Mock).mock.calls[1][0];
      expect(secondCall.context.previousContent).toBe('Hospitality CX content...');

      const thirdCall = (generationService.generateForVertical as jest.Mock).mock.calls[2][0];
      expect(thirdCall.context.previousContent).toBe('Healthcare CX content...');
    });

    it('should handle provider failures gracefully in parallel mode', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write about industry trends',
        vertical: ['hospitality', 'healthcare'],
        verticalMode: 'parallel',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      // Mock one success and one failure
      jest.spyOn(generationService, 'generateForVertical')
        .mockResolvedValueOnce({
          nodeId: 'node-hospitality',
          content: 'Hospitality trends...',
          vertical: 'hospitality',
          usage: { totalTokens: 500, cost: 0.015 },
        } as unknown)
        .mockRejectedValueOnce(new Error('Provider rate limit exceeded'));

      const result = await generationService.multiVerticalGeneration(config);

      expect(result.results.hospitality).toBeDefined();
      expect(result.results.hospitality.content).toBe('Hospitality trends...');
      expect(result.results.healthcare.error).toBe('Provider rate limit exceeded');
    });
  });

  describe('Structured Generation', () => {
    beforeEach(() => {
      mockProviderInstance.selectProviderForTask.mockResolvedValue({
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      });

      mockProviderInstance.generate.mockResolvedValue({
        content: 'Generated step content...',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: { totalTokens: 300, cost: 0.008 },
      });

      mockAiRepository.createGenerationNode.mockImplementation(async (data) => ({
        id: `node-${data.type}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date(),
      }));
    });

    it('should execute complete blog workflow', async () => {
      const config = {
        task: 'blog_complete',
        prompt: 'AI in customer service',
        vertical: 'hospitality',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        context: { styleGuides: ['professional'] },
      };

      jest.spyOn(generationService, 'generateStep').mockImplementation(async ({ step }) => ({
        nodeId: `node-${step}`,
        content: `Generated ${step} content...`,
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: { totalTokens: 200, cost: 0.005 },
      }));

      const result = await generationService.structuredGeneration(config);

      expect(result.mode).toBe('structured');
      expect(result.workflow.steps).toEqual(['idea', 'title', 'synopsis', 'outline', 'blog']);
      expect(Object.keys(result.results)).toHaveLength(5);
      
      expect(result.results.idea).toBeDefined();
      expect(result.results.title).toBeDefined();
      expect(result.results.blog).toBeDefined();
    });

    it('should skip optional steps when configured', async () => {
      const config = {
        task: 'blog_complete',
        prompt: 'Digital transformation',
        vertical: 'tech',
        skipSteps: ['synopsis', 'outline'],
      };

      jest.spyOn(generationService, 'generateStep').mockImplementation(async ({ step }) => ({
        nodeId: `node-${step}`,
        content: `Generated ${step} content...`,
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: { totalTokens: 200, cost: 0.005 },
      }));

      const result = await generationService.structuredGeneration(config);

      expect(result.results.synopsis).toBeUndefined();
      expect(result.results.outline).toBeUndefined();
      expect(result.results.idea).toBeDefined();
      expect(result.results.title).toBeDefined();
      expect(result.results.blog).toBeDefined();
    });

    it('should send streaming updates for each step', async () => {
      const mockStreamResponse = {
        write: jest.fn(),
      };

      const config = {
        task: 'blog_complete',
        prompt: 'Marketing trends',
        vertical: 'hospitality',
      };

      jest.spyOn(generationService, 'generateStep').mockResolvedValue({
        nodeId: 'node-test',
        content: 'Test content',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: { totalTokens: 100, cost: 0.003 },
      });

      await generationService.structuredGeneration(config, mockStreamResponse);

      // Should send step start and complete events
      expect(mockStreamResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('step_start')
      );
      expect(mockStreamResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('step_complete')
      );
    });
  });

  describe('Batch Generation', () => {
    it('should process multiple prompts', async () => {
      const config = {
        prompts: [
          'Write about AI in healthcare',
          'Write about AI in finance',
          'Write about AI in education',
        ],
        task: 'blog_writing_complete',
        vertical: 'tech',
        provider: 'openai',
        model: 'gpt-4',
      };

      jest.spyOn(generationService, 'directGeneration').mockImplementation(async ({ prompt }) => ({
        mode: 'direct',
        task: 'blog_writing_complete',
        results: [{
          nodeId: `node-${prompt.split(' ')[2]}`,
          content: `Generated content about ${prompt}`,
          usage: { totalTokens: 400, cost: 0.01 },
          index: 0,
        }],
        selectedIndex: 0,
        usage: { totalTokens: 400, cost: 0.01 },
      }));

      const result = await generationService.batchGeneration(config);

      expect(result.mode).toBe('batch');
      expect(result.results).toHaveLength(3);
      expect(generationService.directGeneration).toHaveBeenCalledTimes(3);
      
      // Results should be sorted by index
      expect(result.results[0].index).toBe(0);
      expect(result.results[1].index).toBe(1);
      expect(result.results[2].index).toBe(2);
    });

    it('should handle individual prompt failures', async () => {
      const config = {
        prompts: ['Success prompt', 'Failure prompt'],
        task: 'blog_writing_complete',
        vertical: 'tech',
      };

      jest.spyOn(generationService, 'directGeneration')
        .mockResolvedValueOnce({
          mode: 'direct',
          results: [{ nodeId: 'node-success', content: 'Success', index: 0 }],
        } as unknown)
        .mockRejectedValueOnce(new Error('Generation failed'));

      const result = await generationService.batchGeneration(config);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].result).toBeDefined();
      expect(result.results[1].error).toBe('Generation failed');
    });

    it('should require array of prompts', async () => {
      const config = {
        prompts: 'Single prompt string',
        task: 'blog_writing_complete',
      };

      await expect(generationService.batchGeneration(config as unknown))
        .rejects.toThrow('Batch generation requires an array of prompts');
    });
  });

  describe('Edit Existing Content', () => {
    beforeEach(() => {
      mockProviderInstance.generate.mockResolvedValue({
        content: 'Edited content with improvements...',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: { totalTokens: 500, cost: 0.012 },
      });

      mockAiRepository.createGenerationNode.mockResolvedValue({
        id: 'edited-node-123',
        type: 'blog',
        content: 'Edited content...',
        createdAt: new Date(),
      } as unknown);
    });

    it('should edit existing content with instructions', async () => {
      const config = {
        existingContent: 'Original blog content about AI...',
        editInstructions: 'Make it more technical and add code examples',
        vertical: 'tech',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };

      const result = await generationService.editExisting(config);

      expect(result.mode).toBe('edit_existing');
      expect(result.originalContent).toBe(config.existingContent);
      expect(result.editedContent).toBe('Edited content with improvements...');
      expect(result.instructions).toBe(config.editInstructions);
      expect(result.nodeId).toBe('edited-node-123');

      expect(mockProviderInstance.generate).toHaveBeenCalledWith({
        task: 'blog_editing',
        prompt: expect.stringContaining('Make it more technical'),
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        options: {
          vertical: 'tech',
          context: undefined,
          systemInstruction: expect.stringContaining('expert editor'),
        },
      });
    });

    it('should require both existing content and instructions', async () => {
      await expect(generationService.editExisting({
        existingContent: 'Some content',
      })).rejects.toThrow('Editing requires existing content and edit instructions');

      await expect(generationService.editExisting({
        editInstructions: 'Some instructions',
      })).rejects.toThrow('Editing requires existing content and edit instructions');
    });
  });

  describe('Helper Methods', () => {
    describe('createGenerationNode', () => {
      it('should create node with proper data transformation', async () => {
        const nodeData = {
          type: 'blog',
          content: 'Test content',
          mode: 'direct',
          vertical: 'hospitality',
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          cost: '0.025',
        };

        mockAiRepository.createGenerationNode.mockResolvedValueOnce({
          id: 'new-node-123',
          ...nodeData,
        } as unknown);

        await generationService.createGenerationNode(nodeData);

        expect(mockAiRepository.createGenerationNode).toHaveBeenCalledWith({
          type: 'blog',
          content: 'Test content',
          mode: 'direct',
          vertical: 'hospitality',
          parentId: null,
          rootId: null,
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          prompt: undefined,
          context: undefined,
          tokensUsed: 0,
          cost: 0.025, // Should be parsed as float
          selected: false,
          visible: true,
        });
      });
    });

    describe('aggregateUsage', () => {
      it('should aggregate usage from array of results', () => {
        const results = [
          { usage: { inputTokens: 100, outputTokens: 200, totalTokens: 300, cost: 0.01 } },
          { usage: { inputTokens: 150, outputTokens: 250, totalTokens: 400, cost: 0.015 } },
          { usage: { inputTokens: 80, outputTokens: 180, totalTokens: 260, cost: 0.008 } },
        ];

        const aggregated = generationService.aggregateUsage(results);

        expect(aggregated).toEqual({
          inputTokens: 330,
          outputTokens: 630,
          totalTokens: 960,
          cost: 0.033,
        });
      });

      it('should handle results without usage data', () => {
        const results = [
          { usage: { totalTokens: 100, cost: 0.01 } },
          {}, // No usage
          { usage: { totalTokens: 200, cost: 0.02 } },
        ];

        const aggregated = generationService.aggregateUsage(results);

        expect(aggregated.totalTokens).toBe(300);
        expect(aggregated.cost).toBe(0.03);
      });

      it('should return single usage object when not array', () => {
        const singleResult = {
          usage: { totalTokens: 500, cost: 0.025 },
        };

        const result = generationService.aggregateUsage(singleResult);

        expect(result).toEqual(singleResult.usage);
      });
    });

    describe('workflow and mapping helpers', () => {
      it('should return correct structured workflow', () => {
        const blogWorkflow = generationService.getStructuredWorkflow('blog_complete');
        expect(blogWorkflow.steps).toEqual(['idea', 'title', 'synopsis', 'outline', 'blog']);
        
        const researchWorkflow = generationService.getStructuredWorkflow('blog_with_research');
        expect(researchWorkflow.steps).toEqual(['idea', 'research', 'title', 'synopsis', 'outline', 'blog']);
      });

      it('should map steps to appropriate tasks', () => {
        expect(generationService.mapStepToTask('idea')).toBe('idea_generation');
        expect(generationService.mapStepToTask('title')).toBe('title_generation');
        expect(generationService.mapStepToTask('blog')).toBe('blog_writing_complete');
      });

      it('should map tasks to node types', () => {
        expect(generationService.mapTaskToNodeType('blog_writing_complete')).toBe('blog');
        expect(generationService.mapTaskToNodeType('idea_generation')).toBe('idea');
        expect(generationService.mapTaskToNodeType('title_generation')).toBe('title');
      });

      it('should determine step complexity', () => {
        expect(generationService.getStepComplexity('blog')).toBe('high');
        expect(generationService.getStepComplexity('title')).toBe('low');
        expect(generationService.getStepComplexity('outline')).toBe('medium');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle provider service failures', async () => {
      mockProviderInstance.generate.mockRejectedValueOnce(new Error('API rate limit'));

      await expect(generationService.directGeneration({
        task: 'blog_writing_complete',
        prompt: 'Test prompt',
        provider: 'anthropic',
      })).rejects.toThrow();
    });

    it('should handle database creation failures', async () => {
      mockProviderInstance.generate.mockResolvedValueOnce({
        content: 'Generated content',
        usage: { totalTokens: 100, cost: 0.005 },
      });

      mockAiRepository.createGenerationNode.mockRejectedValueOnce(
        new Error('Database constraint violation')
      );

      await expect(generationService.directGeneration({
        task: 'blog_writing_complete',
        prompt: 'Test prompt',
        provider: 'anthropic',
      })).rejects.toThrow('Database constraint violation');
    });

    it('should handle empty or invalid configurations', async () => {
      await expect(generationService.batchGeneration({
        prompts: [],
        task: 'blog_writing_complete',
      })).resolves.toEqual({
        mode: 'batch',
        results: [],
        usage: {},
      });
    });
  });
});