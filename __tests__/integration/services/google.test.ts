import { googleAIService } from '../../../src/services/ai/providers/GoogleAIService';
import { googleImageService } from '../../../src/services/ai/providers/GoogleImageService';
import { googleAPIHandler } from '../../../api/services/providers/google';
import { db } from '../../../src/db';
import { providerSettings } from '../../../src/db/schema';
import { encrypt } from '../../../api/utils/encryption';
import { Request, Response } from 'express';

// Mock environment for testing
const TEST_API_KEY = 'test-google-api-key-12345';

describe('Google AI Service Integration', () => {
  let mockProviderSettings: any;
  
  beforeAll(async () => {
    // Setup test provider settings
    const encrypted = await encrypt(TEST_API_KEY);
    mockProviderSettings = {
      provider: 'google',
      apiKeyEncrypted: encrypted.encrypted,
      encryptionSalt: encrypted.salt,
      defaultModel: 'gemini-2.5-flash',
      taskDefaults: {},
      monthlyLimit: '100.00',
      currentUsage: '0.00',
      isActive: true,
      lastTested: new Date(),
      testSuccess: true
    };
    
    // Insert test settings
    await db.insert(providerSettings).values(mockProviderSettings).onConflictDoUpdate({
      target: [providerSettings.provider],
      set: mockProviderSettings
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(providerSettings).where(
      // @ts-ignore
      providerSettings.provider.eq('google')
    );
  });

  describe('GoogleAIService', () => {
    describe('Initialization', () => {
      it('should initialize with database API key', async () => {
        await expect(googleAIService.initialize()).resolves.not.toThrow();
      });

      it('should throw error when no API key is configured', async () => {
        // Temporarily remove the provider settings
        await db.delete(providerSettings).where(
          // @ts-ignore
          providerSettings.provider.eq('google')
        );

        await expect(googleAIService.initialize()).rejects.toThrow('Google AI API key not configured');

        // Restore settings
        await db.insert(providerSettings).values(mockProviderSettings);
      });
    });

    describe('Text Generation', () => {
      beforeEach(async () => {
        await googleAIService.initialize();
      });

      it('should generate text with default config', async () => {
        // Mock the Google AI client
        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => 'This is a test response from Gemini.'
          }
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const result = await googleAIService.generateText('Write a haiku about TypeScript');
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(mockGenerateContent).toHaveBeenCalled();
      });

      it('should generate text with custom config', async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => 'Custom configured response.'
          }
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const result = await googleAIService.generateText('Test prompt', {
          model: 'gemini-2.5-pro',
          temperature: 0.9,
          maxOutputTokens: 1000
        });
        
        expect(result).toBe('Custom configured response.');
        expect(mockGenerateContent).toHaveBeenCalled();
      });

      it('should handle streaming responses', async () => {
        const mockChunks = [
          { text: () => 'First chunk' },
          { text: () => 'Second chunk' },
          { text: () => 'Third chunk' }
        ];

        const mockStream = {
          stream: (async function* () {
            for (const chunk of mockChunks) {
              yield chunk;
            }
          })()
        };

        const mockGenerateContentStream = jest.fn().mockResolvedValue(mockStream);

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContentStream: mockGenerateContentStream
          })
        };

        const chunks: string[] = [];
        await googleAIService.generateStream(
          'Count to 3',
          {},
          (chunk) => chunks.push(chunk)
        );
        
        expect(chunks).toEqual(['First chunk', 'Second chunk', 'Third chunk']);
      });
    });

    describe('Multimodal Generation', () => {
      it('should generate text from images and text', async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => 'This image shows a beautiful sunset.'
          }
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const result = await googleAIService.generateWithImages(
          'What is in this image?',
          [{ data: 'base64_encoded_image_data', mimeType: 'image/jpeg' }]
        );
        
        expect(result).toBe('This image shows a beautiful sunset.');
        expect(mockGenerateContent).toHaveBeenCalledWith([
          { text: 'What is in this image?' },
          { inlineData: { mimeType: 'image/jpeg', data: 'base64_encoded_image_data' } }
        ]);
      });
    });

    describe('Blog Generation', () => {
      it('should generate structured blog content', async () => {
        const mockBlogResponse = JSON.stringify({
          title: 'The Future of AI: A Comprehensive Guide',
          content: '## Introduction\n\nArtificial Intelligence is transforming our world...\n\n## The Current State\n\n...',
          excerpt: 'Explore how AI is reshaping industries and what the future holds for artificial intelligence technology.',
          tags: ['AI', 'Technology', 'Future', 'Innovation'],
          imagePrompts: ['Futuristic AI robot in a modern office', 'Data visualization charts and graphs']
        });

        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => mockBlogResponse
          }
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const blog = await googleAIService.generateBlog('The Future of AI', {
          brand: 'TechCorp',
          vertical: 'tech',
          targetLength: 2000
        });
        
        expect(blog).toHaveProperty('title');
        expect(blog).toHaveProperty('content');
        expect(blog).toHaveProperty('excerpt');
        expect(blog).toHaveProperty('tags');
        expect(blog).toHaveProperty('imagePrompts');
        expect(Array.isArray(blog.tags)).toBe(true);
        expect(Array.isArray(blog.imagePrompts)).toBe(true);
      });
    });

    describe('Token Counting', () => {
      it('should count tokens accurately', async () => {
        const mockCountTokens = jest.fn().mockResolvedValue({
          totalTokens: 15
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            countTokens: mockCountTokens
          })
        };

        const tokens = await googleAIService.countTokens('This is a test sentence with multiple words.');
        
        expect(tokens).toBe(15);
        expect(mockCountTokens).toHaveBeenCalled();
      });
    });

    describe('Embedding', () => {
      it('should generate text embeddings', async () => {
        const mockEmbedContent = jest.fn().mockResolvedValue({
          embedding: {
            values: [0.1, 0.2, 0.3, 0.4, 0.5]
          }
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            embedContent: mockEmbedContent
          })
        };

        const embedding = await googleAIService.embedText('Sample text for embedding');
        
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding.length).toBeGreaterThan(0);
        expect(typeof embedding[0]).toBe('number');
      });
    });

    describe('Connection Test', () => {
      it('should test connection successfully', async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => 'test'
          }
        });

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const isConnected = await googleAIService.testConnection();
        expect(isConnected).toBe(true);
      });

      it('should handle connection failures', async () => {
        const mockGenerateContent = jest.fn().mockRejectedValue(new Error('Connection failed'));

        // @ts-ignore
        googleAIService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const isConnected = await googleAIService.testConnection();
        expect(isConnected).toBe(false);
      });
    });
  });

  describe('GoogleImageService', () => {
    beforeEach(async () => {
      await googleImageService.initialize();
    });

    describe('Image Analysis', () => {
      it('should analyze images successfully', async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => 'This image shows a beautiful landscape with mountains and trees.'
          }
        });

        // @ts-ignore
        googleImageService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const analysis = await googleImageService.analyzeImage(
          'base64_image_data',
          'image/jpeg',
          'Describe this image in detail'
        );
        
        expect(analysis).toBeDefined();
        expect(typeof analysis).toBe('string');
        expect(mockGenerateContent).toHaveBeenCalled();
      });
    });

    describe('Image Generation', () => {
      it('should generate images with default config', async () => {
        const images = await googleImageService.generateImage('A beautiful sunset over the ocean');
        
        expect(Array.isArray(images)).toBe(true);
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveProperty('url');
        expect(images[0]).toHaveProperty('prompt');
        expect(images[0]).toHaveProperty('model');
        expect(images[0]).toHaveProperty('dimensions');
        expect(images[0]).toHaveProperty('timestamp');
      });

      it('should generate multiple images', async () => {
        const images = await googleImageService.generateImage(
          'A cute cat playing with a ball',
          { numImages: 3 }
        );
        
        expect(images.length).toBe(3);
        images.forEach(image => {
          expect(image).toHaveProperty('url');
          expect(image).toHaveProperty('timestamp');
        });
      });
    });

    describe('Blog Image Generation', () => {
      it('should generate images for blog content', async () => {
        const mockAnalysisResponse = JSON.stringify([
          {
            prompt: 'Professional business meeting in modern office',
            style: 'photographic',
            mood: 'professional',
            elements: ['people', 'meeting room', 'presentation']
          },
          {
            prompt: 'Technology visualization with charts and graphs',
            style: 'infographic',
            mood: 'informative',
            elements: ['data', 'charts', 'technology']
          }
        ]);

        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => mockAnalysisResponse
          }
        });

        // @ts-ignore
        googleImageService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const images = await googleImageService.generateBlogImages(
          'The Future of Remote Work',
          'Content about remote work trends and technology...',
          2
        );
        
        expect(Array.isArray(images)).toBe(true);
        expect(images.length).toBe(2);
      });
    });

    describe('Connection Test', () => {
      it('should test image service connection', async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
          response: {
            text: () => 'Test image analysis response'
          }
        });

        // @ts-ignore
        googleImageService.client = {
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent
          })
        };

        const isConnected = await googleImageService.testConnection();
        expect(isConnected).toBe(true);
      });
    });
  });

  describe('Google API Handler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonSpy: jest.Mock;
    let statusSpy: jest.Mock;

    beforeEach(() => {
      jsonSpy = jest.fn();
      statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
      
      mockRes = {
        json: jsonSpy,
        status: statusSpy,
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      mockReq = {
        body: {}
      };
    });

    describe('Text Generation API', () => {
      it('should handle text generation requests', async () => {
        mockReq.body = { prompt: 'Test prompt' };

        // Mock the service
        const originalGenerateText = googleAIService.generateText;
        const originalCountTokens = googleAIService.countTokens;
        
        googleAIService.generateText = jest.fn().mockResolvedValue('Generated response');
        googleAIService.countTokens = jest.fn().mockResolvedValue(50);

        await googleAPIHandler.handleTextGeneration(mockReq as Request, mockRes as Response);

        expect(jsonSpy).toHaveBeenCalledWith({
          success: true,
          content: 'Generated response',
          provider: 'google',
          model: 'gemini-2.5-flash',
          tokens: 50
        });

        // Restore original methods
        googleAIService.generateText = originalGenerateText;
        googleAIService.countTokens = originalCountTokens;
      });

      it('should handle text generation errors', async () => {
        mockReq.body = { prompt: 'Test prompt' };

        const originalGenerateText = googleAIService.generateText;
        googleAIService.generateText = jest.fn().mockRejectedValue(new Error('Generation failed'));

        await googleAPIHandler.handleTextGeneration(mockReq as Request, mockRes as Response);

        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({
          success: false,
          error: 'Generation failed'
        });

        googleAIService.generateText = originalGenerateText;
      });
    });

    describe('Blog Generation API', () => {
      it('should handle blog generation requests', async () => {
        mockReq.body = { 
          topic: 'AI Technology',
          context: { brand: 'TechCorp', vertical: 'tech' }
        };

        const mockBlog = {
          title: 'AI Technology: The Future is Now',
          content: 'Comprehensive blog content...',
          excerpt: 'AI is transforming everything...',
          tags: ['AI', 'Technology'],
          imagePrompts: ['AI robot', 'Technology visualization']
        };

        const originalGenerateBlog = googleAIService.generateBlog;
        const originalCountTokens = googleAIService.countTokens;
        
        googleAIService.generateBlog = jest.fn().mockResolvedValue(mockBlog);
        googleAIService.countTokens = jest.fn().mockResolvedValue(500);

        await googleAPIHandler.handleBlogGeneration(mockReq as Request, mockRes as Response);

        expect(jsonSpy).toHaveBeenCalledWith({
          success: true,
          blog: mockBlog,
          provider: 'google'
        });

        googleAIService.generateBlog = originalGenerateBlog;
        googleAIService.countTokens = originalCountTokens;
      });
    });

    describe('Image Generation API', () => {
      it('should handle image generation requests', async () => {
        mockReq.body = { prompt: 'A beautiful landscape' };

        const mockImages = [{
          url: 'data:image/png;base64,test_image_data',
          prompt: 'A beautiful landscape',
          model: 'gemini-2.5-flash-image',
          dimensions: { width: 1024, height: 1024 },
          timestamp: new Date()
        }];

        const originalGenerateImage = googleImageService.generateImage;
        googleImageService.generateImage = jest.fn().mockResolvedValue(mockImages);

        await googleAPIHandler.handleImageGeneration(mockReq as Request, mockRes as Response);

        expect(jsonSpy).toHaveBeenCalledWith({
          success: true,
          images: mockImages,
          provider: 'google'
        });

        googleImageService.generateImage = originalGenerateImage;
      });
    });

    describe('Connection Test API', () => {
      it('should handle connection test requests', async () => {
        const originalTestConnection = googleAIService.testConnection;
        googleAIService.testConnection = jest.fn().mockResolvedValue(true);

        await googleAPIHandler.handleConnectionTest(mockReq as Request, mockRes as Response);

        expect(jsonSpy).toHaveBeenCalledWith({
          success: true,
          connected: true,
          provider: 'google',
          timestamp: expect.any(String)
        });

        googleAIService.testConnection = originalTestConnection;
      });
    });
  });
});

describe('Google AI Integration Error Handling', () => {
  it('should handle initialization errors gracefully', async () => {
    // Test with missing provider settings
    await db.delete(providerSettings).where(
      // @ts-ignore
      providerSettings.provider.eq('google')
    );

    await expect(googleAIService.initialize()).rejects.toThrow();
  });

  it('should handle API key decryption errors', async () => {
    // Insert invalid encrypted data
    const invalidSettings = {
      provider: 'google',
      apiKeyEncrypted: 'invalid_encrypted_data',
      encryptionSalt: 'invalid_salt',
      defaultModel: 'gemini-2.5-flash',
      isActive: true
    };

    await db.insert(providerSettings).values(invalidSettings).onConflictDoUpdate({
      target: [providerSettings.provider],
      set: invalidSettings
    });

    await expect(googleAIService.initialize()).rejects.toThrow();
  });
});