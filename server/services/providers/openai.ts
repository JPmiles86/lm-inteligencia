import { Request, Response } from 'express';
import { openAIService } from '../../../src/services/ai/providers/OpenAIService.js';
import { openAIImageService } from '../../../src/services/ai/providers/OpenAIImageService.js';
import { openAIEmbeddingService } from '../../../src/services/ai/providers/OpenAIEmbeddingService.js';

// Define usage tracking interface to match existing system
interface UsageRecord {
  provider: string;
  task: string;
  tokensUsed: number;
  cost: number;
  duration: number;
  success: boolean;
  timestamp: Date;
  model: string;
  errorMessage?: string;
}

// Mock usage tracker for now - will be replaced with actual implementation
class MockUsageTracker {
  async trackUsage(record: UsageRecord): Promise<void> {
    console.log('Usage tracked:', record);
  }
}

const usageTracker = new MockUsageTracker();

export class OpenAIAPIHandler {
  async handleTextGeneration(req: Request, res: Response) {
    const { prompt, config, stream = false } = req.body;
    const startTime = Date.now();
    
    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        await openAIService.generateStream(
          prompt,
          config,
          (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        );
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const result = await openAIService.generateText(prompt, config);
        
        // Track usage
        await usageTracker.trackUsage({
          provider: 'openai',
          task: 'text-generation',
          tokensUsed: result.length / 4, // Rough estimate
          cost: (result.length / 4) * 0.00003, // GPT-4 pricing
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: config?.model || 'gpt-4-turbo-preview'
        });
        
        res.json({ 
          success: true, 
          content: result,
          provider: 'openai',
          model: config?.model || 'gpt-4-turbo-preview'
        });
      }
    } catch (error) {
      console.error('OpenAI text generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'openai',
        task: 'text-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'gpt-4-turbo-preview',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleImageGeneration(req: Request, res: Response) {
    const { prompt, config } = req.body;
    const startTime = Date.now();
    
    try {
      const urls = await openAIImageService.generateImage(prompt, config);
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'openai',
        task: 'image-generation',
        tokensUsed: 0,
        cost: config?.quality === 'hd' ? 0.08 : 0.04, // DALL-E 3 pricing
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: config?.model || 'dall-e-3'
      });
      
      res.json({ 
        success: true, 
        urls,
        provider: 'openai',
        model: config?.model || 'dall-e-3'
      });
    } catch (error) {
      console.error('OpenAI image generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'openai',
        task: 'image-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'dall-e-3',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleBlogGeneration(req: Request, res: Response) {
    const { topic, context } = req.body;
    const startTime = Date.now();
    
    try {
      const blog = await openAIService.generateBlog(topic, context);
      
      // Generate images for the blog if prompts exist
      let images: Array<{ prompt: string; url: string }> = [];
      if (blog.imagePrompts.length > 0) {
        images = await openAIImageService.generateBlogImages(
          blog.imagePrompts
        );
      }
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'openai',
        task: 'blog-generation',
        tokensUsed: blog.content.length / 4,
        cost: (blog.content.length / 4) * 0.00003 + (blog.imagePrompts.length * 0.04),
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'gpt-4-turbo-preview'
      });
      
      res.json({ 
        success: true, 
        blog: { ...blog, images },
        provider: 'openai'
      });
    } catch (error) {
      console.error('OpenAI blog generation error:', error);
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleEmbedding(req: Request, res: Response) {
    const { text, texts, model } = req.body;
    
    try {
      if (texts) {
        const embeddings = await openAIEmbeddingService.createBatchEmbeddings(
          texts,
          model
        );
        res.json({ success: true, embeddings });
      } else if (text) {
        const embedding = await openAIEmbeddingService.createEmbedding(
          text,
          model
        );
        res.json({ success: true, embedding });
      } else {
        res.status(400).json({ 
          success: false, 
          error: 'Either text or texts must be provided' 
        });
      }
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleConnectionTest(req: Request, res: Response) {
    try {
      const isConnected = await openAIService.testConnection();
      res.json({ 
        success: true, 
        connected: isConnected,
        provider: 'openai'
      });
    } catch (error) {
      console.error('OpenAI connection test error:', error);
      res.status(500).json({ 
        success: false, 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const openAIAPIHandler = new OpenAIAPIHandler();