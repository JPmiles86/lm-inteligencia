// Unit tests for AI Repository - Database operations and business logic
import { beforeEach, afterEach, describe, it, expect, jest } from '@jest/globals';
import { AIRepository } from '../../../src/repositories/aiRepository';
import * as schema from '../../../src/db/schema';
import { db } from '../../../src/db';

// Mock the database
jest.mock('../../../src/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock Drizzle ORM functions
jest.mock('drizzle-orm', () => ({
  desc: jest.fn(),
  eq: jest.fn(),
  and: jest.fn(),
  isNull: jest.fn(),
  inArray: jest.fn(),
  sql: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  count: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('AIRepository', () => {
  let aiRepository: AIRepository;
  
  // Mock implementations
  const mockFrom = jest.fn();
  const mockWhere = jest.fn();
  const mockValues = jest.fn();
  const mockReturning = jest.fn();
  const mockSet = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();

  beforeEach(() => {
    aiRepository = new AIRepository();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock chain
    mockDb.insert.mockReturnValue({
      values: mockValues.mockReturnValue({
        returning: mockReturning,
      }),
    } as unknown);
    
    mockDb.select.mockReturnValue({
      from: mockFrom.mockReturnValue({
        where: mockWhere.mockReturnValue({
          orderBy: mockOrderBy.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      }),
    } as unknown);
    
    mockDb.update.mockReturnValue({
      set: mockSet.mockReturnValue({
        where: mockWhere.mockReturnValue({
          returning: mockReturning,
        }),
      }),
    } as unknown);
    
    mockDb.delete.mockReturnValue({
      where: mockWhere,
    } as unknown);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Style Guides Management', () => {
    const mockStyleGuide = {
      id: 'style-guide-1',
      type: 'brand' as const,
      name: 'Test Brand Guide',
      content: 'Professional, authoritative tone...',
      active: true,
      isDefault: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('createStyleGuide', () => {
      it('should create a new style guide successfully', async () => {
        const newStyleGuide = {
          type: 'brand' as const,
          name: 'New Brand Guide',
          content: 'Professional writing style...',
        };

        mockReturning.mockResolvedValueOnce([mockStyleGuide]);

        const result = await aiRepository.createStyleGuide(newStyleGuide);

        expect(mockDb.insert).toHaveBeenCalledWith(schema.styleGuides);
        expect(mockValues).toHaveBeenCalledWith(newStyleGuide);
        expect(mockReturning).toHaveBeenCalled();
        expect(result).toEqual(mockStyleGuide);
      });

      it('should handle database insertion errors', async () => {
        const newStyleGuide = {
          type: 'brand' as const,
          name: 'Invalid Guide',
          content: '',
        };

        mockReturning.mockRejectedValueOnce(new Error('Database constraint violation'));

        await expect(aiRepository.createStyleGuide(newStyleGuide))
          .rejects.toThrow('Database constraint violation');
      });
    });

    describe('getStyleGuides', () => {
      const mockStyleGuides = [mockStyleGuide, { ...mockStyleGuide, id: 'style-guide-2' }];

      it('should retrieve all style guides without filters', async () => {
        mockOrderBy.mockResolvedValueOnce(mockStyleGuides);

        const result = await aiRepository.getStyleGuides();

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockFrom).toHaveBeenCalledWith(schema.styleGuides);
        expect(mockWhere).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(mockStyleGuides);
      });

      it('should filter by type when specified', async () => {
        mockOrderBy.mockResolvedValueOnce([mockStyleGuide]);

        const result = await aiRepository.getStyleGuides({ type: 'brand' });

        expect(mockWhere).toHaveBeenCalled();
        expect(result).toEqual([mockStyleGuide]);
      });

      it('should filter by vertical when specified', async () => {
        mockOrderBy.mockResolvedValueOnce([mockStyleGuide]);

        const result = await aiRepository.getStyleGuides({ 
          type: 'vertical', 
          vertical: 'hospitality' 
        });

        expect(mockWhere).toHaveBeenCalled();
        expect(result).toEqual([mockStyleGuide]);
      });

      it('should filter active guides only', async () => {
        mockOrderBy.mockResolvedValueOnce([mockStyleGuide]);

        const result = await aiRepository.getStyleGuides({ activeOnly: true });

        expect(mockWhere).toHaveBeenCalled();
        expect(result).toEqual([mockStyleGuide]);
      });
    });

    describe('updateStyleGuide', () => {
      it('should update a style guide successfully', async () => {
        const updates = { name: 'Updated Guide Name', active: false };
        const updatedGuide = { ...mockStyleGuide, ...updates };

        mockReturning.mockResolvedValueOnce([updatedGuide]);

        const result = await aiRepository.updateStyleGuide('style-guide-1', updates);

        expect(mockDb.update).toHaveBeenCalledWith(schema.styleGuides);
        expect(mockSet).toHaveBeenCalledWith({
          ...updates,
          updatedAt: expect.any(Date),
        });
        expect(result).toEqual(updatedGuide);
      });

      it('should return null if style guide not found', async () => {
        mockReturning.mockResolvedValueOnce([]);

        const result = await aiRepository.updateStyleGuide('nonexistent-id', {});

        expect(result).toBeNull();
      });
    });

    describe('setActiveStyleGuides', () => {
      it('should activate selected guides and deactivate others', async () => {
        const guideIds = ['guide-1', 'guide-2'];

        mockSet.mockResolvedValueOnce(undefined);

        await aiRepository.setActiveStyleGuides(guideIds);

        expect(mockDb.update).toHaveBeenCalledTimes(2);
        expect(mockSet).toHaveBeenCalledWith({ active: false });
        expect(mockSet).toHaveBeenCalledWith({ active: true });
      });

      it('should only deactivate all when empty array provided', async () => {
        await aiRepository.setActiveStyleGuides([]);

        expect(mockDb.update).toHaveBeenCalledTimes(1);
        expect(mockSet).toHaveBeenCalledWith({ active: false });
      });
    });
  });

  describe('Generation Nodes Management', () => {
    const mockGenerationNode = {
      id: 'node-1',
      type: 'blog' as const,
      content: 'Generated blog content...',
      parentId: 'parent-node-1',
      rootId: 'root-node-1',
      selected: true,
      visible: true,
      deleted: false,
      vertical: 'hospitality' as const,
      provider: 'anthropic' as const,
      model: 'claude-3-sonnet-20240229',
      prompt: 'Write a blog about...',
      tokensInput: 150,
      tokensOutput: 800,
      cost: 0.025,
      status: 'completed' as const,
      createdAt: new Date(),
    };

    describe('createGenerationNode', () => {
      it('should create a new generation node successfully', async () => {
        const newNode = {
          type: 'blog' as const,
          content: 'New blog content',
          provider: 'anthropic' as const,
          model: 'claude-3-sonnet-20240229',
        };

        mockReturning.mockResolvedValueOnce([mockGenerationNode]);

        const result = await aiRepository.createGenerationNode(newNode);

        expect(mockDb.insert).toHaveBeenCalledWith(schema.generationNodes);
        expect(mockValues).toHaveBeenCalledWith(newNode);
        expect(result).toEqual(mockGenerationNode);
      });
    });

    describe('getGenerationNode', () => {
      const mockChildren = [
        { ...mockGenerationNode, id: 'child-1', parentId: 'node-1' },
        { ...mockGenerationNode, id: 'child-2', parentId: 'node-1' },
      ];
      
      const mockParent = { ...mockGenerationNode, id: 'parent-node-1' };
      const mockAlternatives = [
        { ...mockGenerationNode, id: 'alt-1' },
      ];

      it('should retrieve generation node with all relationships', async () => {
        // Mock the main node query
        mockWhere.mockResolvedValueOnce([mockGenerationNode]);
        
        // Mock children query
        mockOrderBy.mockResolvedValueOnce(mockChildren);
        
        // Mock parent query  
        mockWhere.mockResolvedValueOnce([mockParent]);
        
        // Mock alternatives query
        mockOrderBy.mockResolvedValueOnce(mockAlternatives);
        
        // Mock image prompts query
        mockOrderBy.mockResolvedValueOnce([]);

        const result = await aiRepository.getGenerationNode('node-1');

        expect(result).toBeDefined();
        expect(result?.id).toBe('node-1');
        expect(result?.children).toEqual(mockChildren);
        expect(result?.parent).toEqual(mockParent);
        expect(result?.alternatives).toEqual(mockAlternatives);
      });

      it('should return null if node not found', async () => {
        mockWhere.mockResolvedValueOnce([]);

        const result = await aiRepository.getGenerationNode('nonexistent-id');

        expect(result).toBeNull();
      });

      it('should handle node without parent', async () => {
        const rootNode = { ...mockGenerationNode, parentId: null };
        mockWhere.mockResolvedValueOnce([rootNode]);
        mockOrderBy.mockResolvedValueOnce([]); // children
        mockOrderBy.mockResolvedValueOnce([]); // alternatives
        mockOrderBy.mockResolvedValueOnce([]); // image prompts

        const result = await aiRepository.getGenerationNode('root-node');

        expect(result?.parent).toBeUndefined();
        expect(result?.alternatives).toEqual([]);
      });
    });

    describe('updateGenerationNode', () => {
      it('should update generation node successfully', async () => {
        const updates = { selected: true, cost: 0.030 };
        const updatedNode = { ...mockGenerationNode, ...updates };

        mockReturning.mockResolvedValueOnce([updatedNode]);

        const result = await aiRepository.updateGenerationNode('node-1', updates);

        expect(mockDb.update).toHaveBeenCalledWith(schema.generationNodes);
        expect(mockSet).toHaveBeenCalledWith(updates);
        expect(result).toEqual(updatedNode);
      });
    });

    describe('setSelectedNode', () => {
      it('should set selected node and deselect others in tree', async () => {
        await aiRepository.setSelectedNode('node-1', 'root-1');

        expect(mockDb.update).toHaveBeenCalledTimes(2);
        expect(mockSet).toHaveBeenCalledWith({ selected: false });
        expect(mockSet).toHaveBeenCalledWith({ selected: true });
      });
    });

    describe('softDeleteGenerationNode', () => {
      it('should mark node as deleted without removing from database', async () => {
        await aiRepository.softDeleteGenerationNode('node-1');

        expect(mockDb.update).toHaveBeenCalledWith(schema.generationNodes);
        expect(mockSet).toHaveBeenCalledWith({ deleted: true });
      });
    });
  });

  describe('Provider Settings Management', () => {
    const mockProviderSettings = {
      id: 'provider-1',
      provider: 'anthropic' as const,
      apiKeyEncrypted: 'encrypted-key-123',
      defaultModel: 'claude-3-sonnet-20240229',
      fallbackModel: 'claude-3-haiku-20240307',
      monthlyLimit: 100.00,
      currentUsage: 25.50,
      active: true,
      testSuccess: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('createProviderSettings', () => {
      it('should create provider settings successfully', async () => {
        const newSettings = {
          provider: 'openai' as const,
          apiKeyEncrypted: 'encrypted-openai-key',
          defaultModel: 'gpt-4',
        };

        mockReturning.mockResolvedValueOnce([mockProviderSettings]);

        const result = await aiRepository.createProviderSettings(newSettings);

        expect(mockDb.insert).toHaveBeenCalledWith(schema.providerSettings);
        expect(mockValues).toHaveBeenCalledWith(newSettings);
        expect(result).toEqual(mockProviderSettings);
      });
    });

    describe('getProviderSettings', () => {
      it('should retrieve all provider settings', async () => {
        const mockSettings = [mockProviderSettings];
        mockOrderBy.mockResolvedValueOnce(mockSettings);

        const result = await aiRepository.getProviderSettings();

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockFrom).toHaveBeenCalledWith(schema.providerSettings);
        expect(result).toEqual(mockSettings);
      });

      it('should filter by provider when specified', async () => {
        mockOrderBy.mockResolvedValueOnce([mockProviderSettings]);

        const result = await aiRepository.getProviderSettings('anthropic');

        expect(mockWhere).toHaveBeenCalled();
        expect(result).toEqual([mockProviderSettings]);
      });
    });

    describe('incrementProviderUsage', () => {
      it('should increment provider usage cost', async () => {
        const cost = 0.025;

        await aiRepository.incrementProviderUsage('anthropic', cost);

        expect(mockDb.update).toHaveBeenCalledWith(schema.providerSettings);
        expect(mockSet).toHaveBeenCalledWith({
          currentUsage: expect.anything(), // SQL expression
          updatedAt: expect.any(Date),
        });
      });
    });

    describe('resetMonthlyUsage', () => {
      it('should reset usage for all providers', async () => {
        await aiRepository.resetMonthlyUsage();

        expect(mockDb.update).toHaveBeenCalledWith(schema.providerSettings);
        expect(mockSet).toHaveBeenCalledWith({
          currentUsage: '0',
          lastResetDate: expect.any(Date),
        });
      });
    });
  });

  describe('Analytics and Logging', () => {
    describe('logUsage', () => {
      it('should log usage data successfully', async () => {
        const usageData = {
          provider: 'anthropic' as const,
          model: 'claude-3-sonnet-20240229',
          taskType: 'blog_generation',
          tokensInput: 150,
          tokensOutput: 800,
          cost: 0.025,
          success: true,
        };

        const mockLog = { id: 'log-1', ...usageData, createdAt: new Date() };
        mockReturning.mockResolvedValueOnce([mockLog]);

        const result = await aiRepository.logUsage(usageData);

        expect(mockDb.insert).toHaveBeenCalledWith(schema.usageLogs);
        expect(mockValues).toHaveBeenCalledWith(usageData);
        expect(result).toEqual(mockLog);
      });
    });

    describe('getUsageStats', () => {
      it('should calculate usage statistics for specified timeframe', async () => {
        const mockStats = {
          totalGenerations: 150,
          successfulGenerations: 145,
          totalCost: '12.50',
          averageDuration: 2500,
        };

        mockWhere.mockResolvedValueOnce([mockStats]);

        const result = await aiRepository.getUsageStats('week');

        expect(result).toEqual({
          totalGenerations: 150,
          totalCost: '12.50',
          averageDuration: 2500,
          successRate: 96.67,
        });
      });

      it('should handle zero generations correctly', async () => {
        const mockStats = {
          totalGenerations: 0,
          successfulGenerations: 0,
          totalCost: '0',
          averageDuration: 0,
        };

        mockWhere.mockResolvedValueOnce([mockStats]);

        const result = await aiRepository.getUsageStats('day');

        expect(result.successRate).toBe(0);
      });
    });
  });

  describe('Cleanup and Maintenance', () => {
    describe('cleanupOldLogs', () => {
      it('should delete logs older than specified days', async () => {
        const mockResult = { rowCount: 25 };
        mockWhere.mockResolvedValueOnce(mockResult);

        const result = await aiRepository.cleanupOldLogs(30);

        expect(mockDb.delete).toHaveBeenCalledWith(schema.usageLogs);
        expect(result).toBe(25);
      });

      it('should use default of 30 days when not specified', async () => {
        const mockResult = { rowCount: 10 };
        mockWhere.mockResolvedValueOnce(mockResult);

        const result = await aiRepository.cleanupOldLogs();

        expect(result).toBe(10);
      });
    });

    describe('getGenerationCount', () => {
      it('should return count of non-deleted generations', async () => {
        mockWhere.mockResolvedValueOnce([{ count: 42 }]);

        const result = await aiRepository.getGenerationCount();

        expect(mockDb.select).toHaveBeenCalled();
        expect(result).toBe(42);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockReturning.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(aiRepository.createStyleGuide({
        type: 'brand',
        name: 'Test Guide',
        content: 'Content',
      })).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid foreign key constraints', async () => {
      mockReturning.mockRejectedValueOnce(new Error('Foreign key constraint violation'));

      await expect(aiRepository.createGenerationNode({
        type: 'blog',
        parentId: 'nonexistent-parent',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      })).rejects.toThrow('Foreign key constraint violation');
    });

    it('should handle unique constraint violations', async () => {
      mockReturning.mockRejectedValueOnce(new Error('Unique constraint violation'));

      await expect(aiRepository.createProviderSettings({
        provider: 'anthropic',
        apiKeyEncrypted: 'key',
      })).rejects.toThrow('Unique constraint violation');
    });
  });

  describe('Data Validation', () => {
    it('should create style guide with minimum required fields', async () => {
      const minimalGuide = {
        type: 'brand' as const,
        name: 'Minimal Guide',
        content: 'Basic content',
      };

      mockReturning.mockResolvedValueOnce([{ ...minimalGuide, id: 'guide-1' }]);

      const result = await aiRepository.createStyleGuide(minimalGuide);

      expect(result.type).toBe('brand');
      expect(result.name).toBe('Minimal Guide');
    });

    it('should handle complex generation node structures', async () => {
      const complexNode = {
        type: 'blog' as const,
        content: 'Complex blog content with nested structures',
        structuredContent: {
          sections: [
            { title: 'Introduction', content: 'Intro text' },
            { title: 'Main Content', content: 'Main text' },
          ],
        },
        contextData: {
          styleGuides: ['guide-1', 'guide-2'],
          previousBlogs: ['blog-1', 'blog-2'],
        },
        provider: 'anthropic' as const,
        model: 'claude-3-sonnet-20240229',
      };

      mockReturning.mockResolvedValueOnce([{ ...complexNode, id: 'complex-node' }]);

      const result = await aiRepository.createGenerationNode(complexNode);

      expect(result.structuredContent).toBeDefined();
      expect(result.contextData).toBeDefined();
    });
  });
});