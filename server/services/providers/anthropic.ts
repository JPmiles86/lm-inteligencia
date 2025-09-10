import { Request, Response } from 'express';
import { anthropicService } from '../../../src/services/ai/providers/AnthropicService.js';
import { usageTracker } from '../usageTracker.js';

export class AnthropicAPIHandler {
  async handleTextGeneration(req: Request, res: Response) {
    const { prompt, config, stream = false } = req.body;
    const startTime = Date.now();
    
    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        await anthropicService.generateStream(
          prompt,
          config,
          (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        );
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const result = await anthropicService.generateText(prompt, config);
        
        // Track usage
        await usageTracker.trackUsage({
          provider: 'anthropic',
          task: 'text-generation',
          tokensUsed: result.length / 4, // Rough estimate
          cost: (result.length / 4) * 0.000025, // Claude pricing estimate
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: config?.model || 'claude-3-sonnet-20240229'
        });
        
        res.json({ 
          success: true, 
          content: result,
          provider: 'anthropic',
          model: config?.model || 'claude-3-sonnet-20240229'
        });
      }
    } catch (error) {
      console.error('Anthropic text generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'text-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'claude-3-sonnet-20240229',
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
      const blog = await anthropicService.generateBlog(topic, context);
      
      // Note: Anthropic doesn't support image generation
      // Image prompts are included for another service to handle
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'blog-generation',
        tokensUsed: blog.content.length / 4,
        cost: (blog.content.length / 4) * 0.000075, // Claude Opus pricing for blog generation
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'claude-3-opus-20240229'
      });
      
      res.json({ 
        success: true, 
        blog,
        provider: 'anthropic',
        note: 'Image prompts included but images must be generated with OpenAI or Google'
      });
    } catch (error) {
      console.error('Anthropic blog generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'blog-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'claude-3-opus-20240229',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleWritingImprovement(req: Request, res: Response) {
    const { text, improvementType } = req.body;
    const startTime = Date.now();
    
    try {
      const improved = await anthropicService.improveWriting(
        text,
        improvementType
      );
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'writing-improvement',
        tokensUsed: Math.max(text.length, improved.length) / 4,
        cost: (Math.max(text.length, improved.length) / 4) * 0.000025,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'claude-3-sonnet-20240229'
      });
      
      res.json({ 
        success: true, 
        originalText: text,
        improvedText: improved,
        improvementType,
        provider: 'anthropic'
      });
    } catch (error) {
      console.error('Anthropic writing improvement error:', error);
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'writing-improvement',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'claude-3-sonnet-20240229',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleContentAnalysis(req: Request, res: Response) {
    const { content } = req.body;
    const startTime = Date.now();
    
    try {
      const analysis = await anthropicService.analyzeContent(content);
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'content-analysis',
        tokensUsed: content.length / 4,
        cost: (content.length / 4) * 0.00001, // Haiku pricing for analysis
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307'
      });
      
      res.json({ 
        success: true, 
        analysis,
        contentLength: content.length,
        provider: 'anthropic'
      });
    } catch (error) {
      console.error('Anthropic content analysis error:', error);
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'content-analysis',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleLongFormGeneration(req: Request, res: Response) {
    const { topic, sections, wordsPerSection } = req.body;
    const startTime = Date.now();
    
    try {
      const content = await anthropicService.generateLongFormContent(
        topic,
        sections,
        wordsPerSection
      );
      
      // Calculate total words for usage tracking
      const totalWords = content.sections.reduce(
        (sum, s) => sum + s.content.split(' ').length,
        0
      );
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'long-form-generation',
        tokensUsed: totalWords * 1.3, // Words to tokens estimate
        cost: (totalWords * 1.3) * 0.000075, // Opus pricing for long-form
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'claude-3-opus-20240229'
      });
      
      res.json({ 
        success: true, 
        content,
        metadata: {
          totalWords,
          sectionCount: sections.length,
          estimatedReadTime: Math.ceil(totalWords / 200)
        },
        provider: 'anthropic'
      });
    } catch (error) {
      console.error('Anthropic long-form generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'long-form-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'claude-3-opus-20240229',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleConstitutionalGeneration(req: Request, res: Response) {
    const { prompt, constitution, config } = req.body;
    const startTime = Date.now();
    
    try {
      const result = await anthropicService.generateWithConstitution(
        prompt,
        constitution,
        config
      );
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'constitutional-generation',
        tokensUsed: result.length / 4,
        cost: (result.length / 4) * 0.000025,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: config?.model || 'claude-3-sonnet-20240229'
      });
      
      res.json({ 
        success: true, 
        content: result,
        constitution,
        provider: 'anthropic',
        model: config?.model || 'claude-3-sonnet-20240229'
      });
    } catch (error) {
      console.error('Anthropic constitutional generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'constitutional-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'claude-3-sonnet-20240229',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async handleConnectionTest(req: Request, res: Response) {
    try {
      const isConnected = await anthropicService.testConnection();
      res.json({ 
        success: true, 
        connected: isConnected,
        provider: 'anthropic',
        capabilities: {
          textGeneration: true,
          imageGeneration: false,
          streamingResponse: true,
          longContext: true,
          constitutionalAI: true
        }
      });
    } catch (error) {
      console.error('Anthropic connection test error:', error);
      res.status(500).json({ 
        success: false, 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'anthropic'
      });
    }
  }
}

export const anthropicAPIHandler = new AnthropicAPIHandler();