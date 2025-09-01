import { selectProvider, getProviderCapabilities, getFallbackChain, validateProviderConfig } from '@api/services/providerSelector';

// Mock the database and encryption utilities
jest.mock('../../../api/server', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../../../api/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('mock-decrypted-key')
}));

jest.mock('../../../api/middleware/error.middleware', () => ({
  ProviderError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ProviderError';
    }
  }
}));

describe('Provider Selection Service', () => {
  describe('getProviderCapabilities', () => {
    it('should return capabilities for OpenAI', () => {
      const capabilities = getProviderCapabilities('openai');
      expect(capabilities).toEqual({
        text: true,
        image: true,
        research: true,
        multimodal: true
      });
    });

    it('should return capabilities for Anthropic', () => {
      const capabilities = getProviderCapabilities('anthropic');
      expect(capabilities).toEqual({
        text: true,
        image: false,
        research: true,
        multimodal: false
      });
    });

    it('should return null for unknown provider', () => {
      const capabilities = getProviderCapabilities('unknown');
      expect(capabilities).toBeNull();
    });
  });

  describe('getFallbackChain', () => {
    it('should return correct fallback chain for research tasks', () => {
      const chain = getFallbackChain('research');
      expect(chain).toEqual(['perplexity', 'anthropic', 'google', 'openai']);
    });

    it('should return correct fallback chain for writing tasks', () => {
      const chain = getFallbackChain('writing');
      expect(chain).toEqual(['anthropic', 'openai', 'google']);
    });

    it('should return default fallback chain for unknown tasks', () => {
      const chain = getFallbackChain('unknown');
      expect(chain).toEqual(['anthropic', 'openai', 'google', 'perplexity']);
    });
  });

  describe('selectProvider', () => {
    const mockDb = require('../../../api/server').db;

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock database response with active providers
      mockDb.from.mockResolvedValue([
        {
          provider: 'openai',
          active: true,
          apiKeyEncrypted: 'encrypted-openai-key',
          encryptionSalt: 'salt',
          defaultModel: 'gpt-4o',
          testSuccess: true
        },
        {
          provider: 'anthropic',
          active: true,
          apiKeyEncrypted: 'encrypted-anthropic-key',
          encryptionSalt: 'salt',
          defaultModel: 'claude-3-5-sonnet-20241022',
          testSuccess: true
        },
        {
          provider: 'google',
          active: false, // Inactive provider
          apiKeyEncrypted: 'encrypted-google-key',
          encryptionSalt: 'salt',
          defaultModel: 'gemini-1.5-pro-latest'
        }
      ]);
    });

    it('should select preferred provider when available and meets requirements', async () => {
      const provider = await selectProvider('writing', 'anthropic');
      
      expect(provider.provider).toBe('anthropic');
      expect(provider.model).toBe('claude-3-5-sonnet-20241022');
      expect(provider.apiKey).toBe('mock-decrypted-key');
    });

    it('should fallback to next provider when preferred is not available', async () => {
      const provider = await selectProvider('writing', 'google'); // Google is inactive
      
      // Should fallback to anthropic (first in writing chain)
      expect(provider.provider).toBe('anthropic');
    });

    it('should use fallback chain when no preferred provider specified', async () => {
      const provider = await selectProvider('research');
      
      // Research chain starts with perplexity, but it's not in our mock data
      // Should fallback to anthropic (next in research chain)
      expect(provider.provider).toBe('anthropic');
    });

    it('should respect excluded providers', async () => {
      const provider = await selectProvider('writing', undefined, [], ['anthropic']);
      
      // Should select openai since anthropic is excluded
      expect(provider.provider).toBe('openai');
    });

    it('should check required capabilities', async () => {
      // Request image capability - should select openai (anthropic doesn't have image)
      const provider = await selectProvider('writing', 'anthropic', ['image']);
      
      expect(provider.provider).toBe('openai'); // Anthropic doesn't support image
    });

    it('should throw error when no suitable provider available', async () => {
      // Mock empty database response
      mockDb.from.mockResolvedValueOnce([]);
      
      await expect(selectProvider('writing')).rejects.toThrow('No suitable provider available');
    });

    it('should skip providers that failed their last test', async () => {
      // Mock provider with failed test
      mockDb.from.mockResolvedValueOnce([
        {
          provider: 'openai',
          active: true,
          apiKeyEncrypted: 'encrypted-key',
          encryptionSalt: 'salt',
          defaultModel: 'gpt-4o',
          testSuccess: false, // Failed test
          lastTested: new Date()
        }
      ]);
      
      await expect(selectProvider('writing')).rejects.toThrow('No suitable provider available');
    });
  });

  describe('validateProviderConfig', () => {
    const mockDb = require('../../../api/server').db;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true for valid provider configuration', async () => {
      mockDb.from.mockResolvedValueOnce([
        {
          provider: 'openai',
          active: true,
          apiKeyEncrypted: 'encrypted-key',
          encryptionSalt: 'salt',
          defaultModel: 'gpt-4o',
          testSuccess: true
        }
      ]);

      const isValid = await validateProviderConfig('openai');
      expect(isValid).toBe(true);
    });

    it('should return false for inactive provider', async () => {
      mockDb.from.mockResolvedValueOnce([
        {
          provider: 'openai',
          active: false, // Inactive
          apiKeyEncrypted: 'encrypted-key',
          encryptionSalt: 'salt',
          defaultModel: 'gpt-4o'
        }
      ]);

      const isValid = await validateProviderConfig('openai');
      expect(isValid).toBe(false);
    });

    it('should return false for provider without API key', async () => {
      mockDb.from.mockResolvedValueOnce([
        {
          provider: 'openai',
          active: true,
          apiKeyEncrypted: null, // No API key
          defaultModel: 'gpt-4o'
        }
      ]);

      const isValid = await validateProviderConfig('openai');
      expect(isValid).toBe(false);
    });

    it('should return false for non-existent provider', async () => {
      mockDb.from.mockResolvedValueOnce([]);

      const isValid = await validateProviderConfig('nonexistent');
      expect(isValid).toBe(false);
    });
  });
});