import { Request, Response } from 'express';
import { googleAIService } from '../../../src/services/ai/providers/GoogleAIService.js';
import { googleImageService } from '../../../src/services/ai/providers/GoogleImageService.js';
import { usageTracker } from '../usageTracker.js';

export class GoogleAPIHandler {
  async handleTextGeneration(req: Request, res: Response) {
    const { prompt, config = {}, stream = false } = req.body;
    const startTime = Date.now();
    
    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        await googleAIService.generateStream(
          prompt,
          config,
          (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        );
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const result = await googleAIService.generateText(prompt, config);
        
        // Track usage
        const tokens = await googleAIService.countTokens(result);
        await usageTracker.trackUsage({
          provider: 'google',
          task: 'text-generation',
          tokensUsed: tokens,
          cost: this.calculateCost(tokens, config?.model || 'gemini-2.5-flash'),
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: config?.model || 'gemini-2.5-flash'
        });
        
        res.json({ 
          success: true, 
          content: result,
          provider: 'google',
          model: config?.model || 'gemini-2.5-flash',
          tokens
        });
      }
    } catch (error) {
      console.error('Google AI text generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'google',
        task: 'text-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'gemini-2.5-flash'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleMultimodal(req: Request, res: Response) {
    const { prompt, images, config = {} } = req.body;
    const startTime = Date.now();
    
    try {
      const result = await googleAIService.generateWithImages(
        prompt,
        images,
        config
      );
      
      // Track usage
      const tokens = await googleAIService.countTokens(result);
      await usageTracker.trackUsage({
        provider: 'google',
        task: 'multimodal',
        tokensUsed: tokens,
        cost: this.calculateCost(tokens, config?.model || 'gemini-2.5-flash'),
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: config?.model || 'gemini-2.5-flash'
      });
      
      res.json({ 
        success: true, 
        content: result,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google AI multimodal error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleChat(req: Request, res: Response) {
    const { messages, config = {} } = req.body;
    
    try {
      const result = await googleAIService.chat(messages, config);
      
      res.json({ 
        success: true, 
        response: result,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google AI chat error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleBlogGeneration(req: Request, res: Response) {
    const { topic, context = {} } = req.body;
    const startTime = Date.now();
    
    try {
      const blog = await googleAIService.generateBlog(topic, context);
      
      // Track usage
      const tokens = await googleAIService.countTokens(blog.content);
      await usageTracker.trackUsage({
        provider: 'google',
        task: 'blog-generation',
        tokensUsed: tokens,
        cost: this.calculateCost(tokens, 'gemini-2.5-pro'),
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'gemini-2.5-pro'
      });
      
      res.json({ 
        success: true, 
        blog,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google AI blog generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleImageGeneration(req: Request, res: Response) {
    const { prompt, config = {} } = req.body;
    const startTime = Date.now();
    
    try {
      const images = await googleImageService.generateImage(prompt, config);
      
      // Track usage for image generation
      await usageTracker.trackUsage({
        provider: 'google',
        task: 'image-generation',
        tokensUsed: 0, // Images don't use tokens
        cost: this.calculateImageCost(images.length, config?.model),
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: config?.model || 'gemini-2.5-flash-image'
      });
      
      res.json({ 
        success: true, 
        images,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google image generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleImageAnalysis(req: Request, res: Response) {
    const { imageData, mimeType, prompt } = req.body;
    
    try {
      const analysis = await googleImageService.analyzeImage(
        imageData,
        mimeType,
        prompt
      );
      
      res.json({ 
        success: true, 
        analysis,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google image analysis error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleBlogImageGeneration(req: Request, res: Response) {
    const { title, content, imageCount = 3 } = req.body;
    const startTime = Date.now();
    
    try {
      const images = await googleImageService.generateBlogImages(title, content, imageCount);
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'google',
        task: 'blog-image-generation',
        tokensUsed: 0,
        cost: this.calculateImageCost(images.length, 'gemini-2.5-flash-image'),
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'gemini-2.5-flash-image'
      });
      
      res.json({ 
        success: true, 
        images,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google blog image generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleImageVariations(req: Request, res: Response) {
    const { imageData, mimeType, variations = 3, style } = req.body;
    
    try {
      const images = await googleImageService.generateImageVariations(
        imageData,
        mimeType,
        variations,
        style
      );
      
      res.json({ 
        success: true, 
        images,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google image variations error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleTokenCount(req: Request, res: Response) {
    const { text, model } = req.body;
    
    try {
      const tokens = await googleAIService.countTokens(text, model);
      
      res.json({ 
        success: true, 
        tokens,
        provider: 'google'
      });
    } catch (error) {
      console.error('Token counting error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleEmbedding(req: Request, res: Response) {
    const { text } = req.body;
    
    try {
      const embedding = await googleAIService.embedText(text);
      
      res.json({ 
        success: true, 
        embedding,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google embedding error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleConnectionTest(req: Request, res: Response) {
    try {
      const isConnected = await googleAIService.testConnection();
      
      res.json({
        success: true,
        connected: isConnected,
        provider: 'google',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Google connection test error:', error);
      res.status(500).json({
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'google'
      });
    }
  }
  
  async handleUsageStats(req: Request, res: Response) {
    try {
      const stats = await googleAIService.getUsageStats();
      
      res.json({
        success: true,
        stats,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google usage stats error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  private calculateCost(tokens: number, model: string): number {
    // 2025 Gemini pricing (per 1K tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-2.5-pro': { input: 0.003, output: 0.012 },
      'gemini-2.5-flash': { input: 0.00075, output: 0.003 },
      'gemini-2.5-flash-lite': { input: 0.000375, output: 0.0015 },
      'gemini-1.5-pro': { input: 0.0025, output: 0.01 },
      'gemini-1.5-flash': { input: 0.0005, output: 0.0015 }
    };
    
    const modelPricing = pricing[model] || pricing['gemini-2.5-flash'];
    
    // Rough estimate: 70% input, 30% output
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);
    
    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
    
    return parseFloat((inputCost + outputCost).toFixed(6));
  }
  
  private calculateImageCost(imageCount: number, model?: string): number {
    // Image generation pricing
    const imagePricing: Record<string, number> = {
      'gemini-2.5-flash-image': 0.04, // per image
      'imagen-3': 0.04,
      'imagen-4.0-generate-001': 0.04,
      'imagen-4.0-ultra-generate-001': 0.06,
      'imagen-4.0-fast-generate-001': 0.02
    };
    
    const pricePerImage = imagePricing[model || 'gemini-2.5-flash-image'] || 0.04;
    return parseFloat((imageCount * pricePerImage).toFixed(2));
  }
}

// Export singleton instance
export const googleAPIHandler = new GoogleAPIHandler();