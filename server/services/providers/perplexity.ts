import { Request, Response } from 'express';
import { perplexityService } from '../../../src/services/ai/providers/PerplexityService.js';

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

// Perplexity pricing estimates (per 1K tokens)
const PERPLEXITY_PRICING = {
  'sonar': { input: 0.000005, output: 0.000005 },
  'sonar-reasoning': { input: 0.00001, output: 0.00001 },
  'sonar-deep-research': { input: 0.00002, output: 0.00002 },
  'llama-3.1-sonar-small-128k-online': { input: 0.000005, output: 0.000005 },
  'llama-3.1-sonar-large-128k-online': { input: 0.00001, output: 0.00001 },
  'llama-3.1-sonar-huge-128k-online': { input: 0.00002, output: 0.00002 },
  'llama-3.1-8b-instruct': { input: 0.000002, output: 0.000002 },
  'llama-3.1-70b-instruct': { input: 0.000008, output: 0.000008 }
};

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = PERPLEXITY_PRICING[model as keyof typeof PERPLEXITY_PRICING] || PERPLEXITY_PRICING['sonar'];
  return (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;
}

export class PerplexityAPIHandler {
  async handleTextGeneration(req: Request, res: Response) {
    const { prompt, config, stream = false } = req.body;
    const startTime = Date.now();
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a string'
      });
    }
    
    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        await perplexityService.generateStream(
          prompt,
          config,
          (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        );
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const result = await perplexityService.generateText(prompt, config);
        const modelUsed = config?.model || 'llama-3.1-sonar-large-128k-online';
        
        // Calculate cost if usage data is available
        let cost = 0;
        if (result.usage) {
          cost = calculateCost(
            modelUsed,
            result.usage.promptTokens,
            result.usage.completionTokens
          );
        }
        
        // Track usage
        await usageTracker.trackUsage({
          provider: 'perplexity',
          task: 'text-generation',
          tokensUsed: result.usage?.totalTokens || (result.content.length / 4),
          cost,
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: modelUsed
        });
        
        res.json({ 
          success: true, 
          content: result.content,
          citations: result.citations,
          images: result.images,
          relatedQuestions: result.relatedQuestions,
          usage: result.usage,
          provider: 'perplexity',
          model: modelUsed
        });
      }
    } catch (error: any) {
      console.error('Perplexity text generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'text-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'llama-3.1-sonar-large-128k-online',
        errorMessage: error.message
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Text generation failed'
      });
    }
  }
  
  async handleResearch(req: Request, res: Response) {
    const { topic, options = {} } = req.body;
    const startTime = Date.now();
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a string'
      });
    }
    
    try {
      const research = await perplexityService.research(topic, options);
      
      // Calculate cost based on usage
      let cost = 0;
      if (research.usage) {
        const modelUsed = options.depth === 'quick' ? 'sonar' : 
                         options.depth === 'deep' ? 'sonar-deep-research' : 'sonar-reasoning';
        cost = calculateCost(
          modelUsed,
          research.usage.promptTokens,
          research.usage.completionTokens
        );
      }
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'research',
        tokensUsed: research.usage?.totalTokens || (research.summary.length / 4),
        cost,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: options.depth === 'quick' ? 'sonar' : 
               options.depth === 'deep' ? 'sonar-deep-research' : 'sonar-reasoning'
      });
      
      res.json({ 
        success: true, 
        research,
        provider: 'perplexity'
      });
    } catch (error: any) {
      console.error('Perplexity research error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'research',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: options.depth === 'quick' ? 'sonar' : 
               options.depth === 'deep' ? 'sonar-deep-research' : 'sonar-reasoning',
        errorMessage: error.message
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Research failed'
      });
    }
  }
  
  async handleFactCheck(req: Request, res: Response) {
    const { statement } = req.body;
    const startTime = Date.now();
    
    if (!statement || typeof statement !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Statement is required and must be a string'
      });
    }
    
    try {
      const result = await perplexityService.factCheck(statement);
      
      // Calculate cost based on usage
      let cost = 0;
      if (result.usage) {
        cost = calculateCost(
          'sonar-reasoning',
          result.usage.promptTokens,
          result.usage.completionTokens
        );
      }
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'fact-check',
        tokensUsed: result.usage?.totalTokens || (result.explanation.length / 4),
        cost,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'sonar-reasoning'
      });
      
      res.json({ 
        success: true, 
        verdict: result.verdict,
        explanation: result.explanation,
        sources: result.sources,
        confidence: result.confidence,
        usage: result.usage,
        provider: 'perplexity'
      });
    } catch (error: any) {
      console.error('Perplexity fact check error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'fact-check',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'sonar-reasoning',
        errorMessage: error.message
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Fact check failed'
      });
    }
  }
  
  async handleBlogGeneration(req: Request, res: Response) {
    const { topic, context = {} } = req.body;
    const startTime = Date.now();
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a string'
      });
    }
    
    try {
      const blog = await perplexityService.generateBlogWithResearch(
        topic,
        context
      );
      
      // Calculate cost based on usage (this involves multiple API calls)
      let cost = 0;
      if (blog.usage) {
        cost = calculateCost(
          'llama-3.1-sonar-large-128k-online',
          blog.usage.promptTokens,
          blog.usage.completionTokens
        );
      }
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'blog-generation',
        tokensUsed: blog.usage?.totalTokens || (blog.content.length / 4),
        cost,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'llama-3.1-sonar-large-128k-online'
      });
      
      res.json({ 
        success: true, 
        blog,
        provider: 'perplexity'
      });
    } catch (error: any) {
      console.error('Perplexity blog generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'blog-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'llama-3.1-sonar-large-128k-online',
        errorMessage: error.message
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Blog generation failed'
      });
    }
  }
  
  async handleComparison(req: Request, res: Response) {
    const { items } = req.body;
    const startTime = Date.now();
    
    if (!items || !Array.isArray(items) || items.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Items array with at least 2 items is required'
      });
    }
    
    try {
      const comparison = await perplexityService.compareInformation(items);
      
      // Calculate cost based on usage
      let cost = 0;
      if (comparison.usage) {
        cost = calculateCost(
          'sonar-reasoning',
          comparison.usage.promptTokens,
          comparison.usage.completionTokens
        );
      }
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'comparison',
        tokensUsed: comparison.usage?.totalTokens || (comparison.comparison.length / 4),
        cost,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'sonar-reasoning'
      });
      
      res.json({ 
        success: true, 
        comparison,
        provider: 'perplexity'
      });
    } catch (error: any) {
      console.error('Perplexity comparison error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'comparison',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'sonar-reasoning',
        errorMessage: error.message
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Comparison failed'
      });
    }
  }

  async handleConnectionTest(req: Request, res: Response) {
    const startTime = Date.now();
    
    try {
      const isConnected = await perplexityService.testConnection();
      
      if (isConnected) {
        await usageTracker.trackUsage({
          provider: 'perplexity',
          task: 'connection-test',
          tokensUsed: 10, // Minimal test tokens
          cost: 0.00001, // Minimal cost
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: 'sonar'
        });

        res.json({
          success: true,
          connected: true,
          provider: 'perplexity',
          message: 'Connection successful'
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error: any) {
      console.error('Perplexity connection test error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'connection-test',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: 'sonar',
        errorMessage: error.message
      });
      
      res.status(500).json({
        success: false,
        connected: false,
        error: error.message || 'Connection test failed'
      });
    }
  }

  async handleGetModels(req: Request, res: Response) {
    try {
      const models = [
        {
          id: 'sonar',
          name: 'Sonar',
          description: 'Lightweight, cost-effective search model with grounding',
          contextWindow: 128000,
          online: true,
          bestFor: ['quick searches', 'basic research', 'factual queries']
        },
        {
          id: 'sonar-reasoning',
          name: 'Sonar Reasoning',
          description: 'Fast, real-time reasoning model for problem-solving with search',
          contextWindow: 128000,
          online: true,
          bestFor: ['analysis', 'reasoning', 'fact-checking', 'comparisons']
        },
        {
          id: 'sonar-deep-research',
          name: 'Sonar Deep Research',
          description: 'Expert-level research model for exhaustive searches and comprehensive reports',
          contextWindow: 128000,
          online: true,
          bestFor: ['deep research', 'comprehensive analysis', 'detailed reports']
        },
        {
          id: 'llama-3.1-sonar-small-128k-online',
          name: 'Llama 3.1 Sonar Small (Online)',
          description: 'Small Llama model with online search capabilities',
          contextWindow: 128000,
          online: true,
          bestFor: ['cost-effective searches', 'simple queries']
        },
        {
          id: 'llama-3.1-sonar-large-128k-online',
          name: 'Llama 3.1 Sonar Large (Online)',
          description: 'Large Llama model with online search capabilities',
          contextWindow: 128000,
          online: true,
          bestFor: ['detailed research', 'complex queries', 'content generation']
        },
        {
          id: 'llama-3.1-sonar-huge-128k-online',
          name: 'Llama 3.1 Sonar Huge (Online)',
          description: 'Largest Llama model with online search capabilities',
          contextWindow: 128000,
          online: true,
          bestFor: ['most complex research', 'comprehensive analysis', 'expert-level content']
        },
        {
          id: 'llama-3.1-8b-instruct',
          name: 'Llama 3.1 8B Instruct',
          description: 'Instruction-tuned 8B parameter model (offline)',
          contextWindow: 128000,
          online: false,
          bestFor: ['general conversations', 'creative writing', 'offline tasks']
        },
        {
          id: 'llama-3.1-70b-instruct',
          name: 'Llama 3.1 70B Instruct',
          description: 'Instruction-tuned 70B parameter model (offline)',
          contextWindow: 128000,
          online: false,
          bestFor: ['complex reasoning', 'detailed responses', 'advanced analysis']
        }
      ];

      res.json({
        success: true,
        models,
        provider: 'perplexity'
      });
    } catch (error: any) {
      console.error('Error fetching Perplexity models:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch models'
      });
    }
  }
}

export const perplexityAPIHandler = new PerplexityAPIHandler();