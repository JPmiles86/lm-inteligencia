# Agent-3A: OpenAI Service Integration Specialist
**Priority:** 🔴 CRITICAL
**Duration:** 12 hours
**Dependencies:** Phase 2 complete (Provider Settings, Fallback System)
**Created:** 2025-08-31

## 🚨 CRITICAL MD RULE
**ALL WORK MUST BE DOCUMENTED IN .MD FILES**
- Create `/docs/agent-reports/AGENT-3A-PROGRESS.md` IMMEDIATELY
- Update it CONTINUOUSLY as you work
- Document EVERY file created/modified
- Record ALL TypeScript errors found/fixed
- This ensures crash recovery and agent handoff

## ⚠️ TYPESCRIPT COMPLIANCE
**MONITOR TypeScript errors constantly:**
```bash
# Run before starting work
npm run type-check > initial-ts-errors.log

# Run after EVERY file change
npm run type-check

# Run before marking complete
npm run type-check > final-ts-errors.log
```
**DO NOT introduce new TypeScript errors!**

## 🎯 MISSION
Implement complete OpenAI service integration using API keys from the database (NOT env vars). Must support GPT-4 text generation, DALL-E 3 image generation, and embeddings for research.

## 📋 CONTEXT
- **Provider Settings:** Created by Agent-2A, keys stored encrypted in database
- **Fallback System:** Created by Agent-2B, this service will be part of fallback chains
- **Current State:** Basic provider selection exists, need actual OpenAI implementation
- **Database:** Keys in `providerSettings` table, encrypted

## ✅ SUCCESS CRITERIA
1. OpenAI service connects using database API keys
2. GPT-4 text generation working
3. DALL-E 3 image generation functional
4. Embeddings API for research tasks
5. Streaming responses supported
6. Comprehensive error handling
7. NO new TypeScript errors introduced
8. All work documented in .md files

## 🔧 SPECIFIC TASKS

### 1. Create Progress Tracking File (FIRST TASK - 5 minutes)

**File:** `/docs/agent-reports/AGENT-3A-PROGRESS.md`
```markdown
# Agent-3A: OpenAI Service Integration Progress

## Assignment
Implement OpenAI service integration with database-stored API keys

## Status: IN PROGRESS
Started: [timestamp]

## TypeScript Baseline
Initial errors: [count from npm run type-check]

## Files Created/Modified
- [ ] /src/services/ai/providers/OpenAIService.ts
- [ ] /src/services/ai/providers/OpenAIImageService.ts
- [ ] /src/services/ai/providers/OpenAIEmbeddingService.ts
- [ ] /api/services/providers/openai.ts

## Progress Log
[timestamp] - Started work, checking TypeScript baseline
[timestamp] - Creating OpenAI service class
[Update continuously...]

## Issues Found
- [List any issues]

## TypeScript Errors
- Before: X errors
- After: Y errors
- New errors introduced: MUST BE 0
```

### 2. Create OpenAI Service Class (3 hours)

**File:** `/src/services/ai/providers/OpenAIService.ts`
```typescript
import OpenAI from 'openai';
import { db } from '@/db';
import { providerSettings } from '@/db/schema';
import { decrypt } from '@/api/utils/encryption';
import { eq } from 'drizzle-orm';

export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'openai'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('OpenAI API key not configured');
      }
      
      // Decrypt API key
      this.apiKey = decrypt(
        settings[0].apiKeyEncrypted,
        settings[0].encryptionSalt
      );
      
      // Initialize OpenAI client
      this.client = new OpenAI({
        apiKey: this.apiKey
      });
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'openai'));
        
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: OpenAIConfig = {}
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: OpenAIConfig = {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const completion = await this.client.chat.completions.create({
        model: finalConfig.model!,
        messages: [{ role: 'user', content: prompt }],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        top_p: finalConfig.topP,
        frequency_penalty: finalConfig.frequencyPenalty,
        presence_penalty: finalConfig.presencePenalty,
        stream: false
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI text generation failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: OpenAIConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) await this.initialize();
    
    const streamConfig = { ...config, stream: true };
    
    try {
      const stream = await this.client.chat.completions.create({
        model: config.model || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000,
        stream: true
      });
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('OpenAI streaming failed:', error);
      throw error;
    }
  }
  
  async generateBlog(
    topic: string,
    context: {
      brand?: string;
      vertical?: string;
      persona?: string;
      writingStyle?: string;
    }
  ): Promise<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    imagePrompts: string[];
  }> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const userPrompt = `
      Write a comprehensive blog post about: ${topic}
      
      Include:
      1. An engaging title
      2. A compelling excerpt (2-3 sentences)
      3. The full blog content with proper formatting
      4. 5-7 relevant tags
      5. 3-4 image prompts marked as [IMAGE_PROMPT: description]
      
      Format the response as JSON with keys: title, content, excerpt, tags, imagePrompts
    `;
    
    try {
      const response = await this.generateText(userPrompt, {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 6000
      });
      
      // Parse JSON response
      const result = JSON.parse(response);
      
      // Extract image prompts from content
      const imagePrompts = this.extractImagePrompts(result.content);
      
      return {
        ...result,
        imagePrompts
      };
    } catch (error) {
      console.error('Blog generation failed:', error);
      throw error;
    }
  }
  
  private buildSystemPrompt(context: any): string {
    let prompt = 'You are a professional content writer.';
    
    if (context.brand) {
      prompt += ` Write in the voice of ${context.brand}.`;
    }
    if (context.vertical) {
      prompt += ` Focus on ${context.vertical} industry topics.`;
    }
    if (context.persona) {
      prompt += ` Target audience: ${context.persona}.`;
    }
    if (context.writingStyle) {
      prompt += ` Writing style: ${context.writingStyle}.`;
    }
    
    return prompt;
  }
  
  private extractImagePrompts(content: string): string[] {
    const regex = /\[IMAGE_PROMPT:\s*([^\]]+)\]/g;
    const prompts: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      prompts.push(match[1].trim());
    }
    
    return prompts;
  }
  
  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) await this.initialize();
      
      // Test with minimal API call
      const response = await this.client.models.list();
      return !!response.data.length;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
```

### 3. Create Image Generation Service (2 hours)

**File:** `/src/services/ai/providers/OpenAIImageService.ts`
```typescript
import OpenAI from 'openai';
import { openAIService } from './OpenAIService';

export interface ImageGenerationConfig {
  model?: 'dall-e-3' | 'dall-e-2';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export class OpenAIImageService {
  private client: OpenAI | null = null;
  
  async initialize(): Promise<void> {
    // Use the main OpenAI service for initialization
    await openAIService.initialize();
    this.client = (openAIService as any).client;
  }
  
  async generateImage(
    prompt: string,
    config: ImageGenerationConfig = {}
  ): Promise<string[]> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: ImageGenerationConfig = {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      n: 1
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const response = await this.client.images.generate({
        model: finalConfig.model!,
        prompt: this.enhancePrompt(prompt),
        n: finalConfig.n,
        size: finalConfig.size,
        quality: finalConfig.quality,
        style: finalConfig.style
      });
      
      return response.data.map(img => img.url!);
    } catch (error) {
      console.error('OpenAI image generation failed:', error);
      throw error;
    }
  }
  
  async generateBlogImages(
    prompts: string[],
    config?: ImageGenerationConfig
  ): Promise<Array<{ prompt: string; url: string }>> {
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const urls = await this.generateImage(prompt, config);
        results.push({
          prompt,
          url: urls[0]
        });
      } catch (error) {
        console.error(`Failed to generate image for prompt: ${prompt}`, error);
        // Continue with other images even if one fails
        results.push({
          prompt,
          url: ''
        });
      }
    }
    
    return results;
  }
  
  private enhancePrompt(prompt: string): string {
    // Add quality enhancers to the prompt
    const enhancers = [
      'high quality',
      'professional',
      'detailed',
      '4k resolution'
    ];
    
    // Only add if not already present
    let enhanced = prompt;
    for (const enhancer of enhancers) {
      if (!prompt.toLowerCase().includes(enhancer)) {
        enhanced = `${enhanced}, ${enhancer}`;
        break;
      }
    }
    
    return enhanced;
  }
  
  async editImage(
    imageUrl: string,
    prompt: string,
    maskUrl?: string
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client.images.edit({
        image: imageUrl,
        prompt,
        mask: maskUrl,
        n: 1,
        size: '1024x1024'
      });
      
      return response.data[0].url!;
    } catch (error) {
      console.error('OpenAI image edit failed:', error);
      throw error;
    }
  }
  
  async createVariations(
    imageUrl: string,
    n: number = 2
  ): Promise<string[]> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client.images.createVariation({
        image: imageUrl,
        n,
        size: '1024x1024'
      });
      
      return response.data.map(img => img.url!);
    } catch (error) {
      console.error('OpenAI image variation failed:', error);
      throw error;
    }
  }
}

export const openAIImageService = new OpenAIImageService();
```

### 4. Create Embeddings Service for Research (2 hours)

**File:** `/src/services/ai/providers/OpenAIEmbeddingService.ts`
```typescript
import OpenAI from 'openai';
import { openAIService } from './OpenAIService';

export class OpenAIEmbeddingService {
  private client: OpenAI | null = null;
  
  async initialize(): Promise<void> {
    await openAIService.initialize();
    this.client = (openAIService as any).client;
  }
  
  async createEmbedding(
    text: string,
    model: string = 'text-embedding-3-small'
  ): Promise<number[]> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client.embeddings.create({
        model,
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding creation failed:', error);
      throw error;
    }
  }
  
  async createBatchEmbeddings(
    texts: string[],
    model: string = 'text-embedding-3-small'
  ): Promise<number[][]> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client.embeddings.create({
        model,
        input: texts
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('OpenAI batch embedding failed:', error);
      throw error;
    }
  }
  
  async semanticSearch(
    query: string,
    documents: Array<{ id: string; text: string }>,
    topK: number = 5
  ): Promise<Array<{ id: string; text: string; score: number }>> {
    // Get query embedding
    const queryEmbedding = await this.createEmbedding(query);
    
    // Get document embeddings
    const docTexts = documents.map(d => d.text);
    const docEmbeddings = await this.createBatchEmbeddings(docTexts);
    
    // Calculate cosine similarity
    const results = documents.map((doc, idx) => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, docEmbeddings[idx])
    }));
    
    // Sort by similarity and return top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  async generateResearchSummary(
    topic: string,
    sources: string[]
  ): Promise<{
    summary: string;
    keyPoints: string[];
    relatedTopics: string[];
  }> {
    const prompt = `
      Research Topic: ${topic}
      
      Sources:
      ${sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}
      
      Please provide:
      1. A comprehensive summary (200-300 words)
      2. 5-7 key points
      3. 3-5 related topics for further research
      
      Format as JSON with keys: summary, keyPoints, relatedTopics
    `;
    
    try {
      const response = await openAIService.generateText(prompt, {
        model: 'gpt-4-turbo-preview',
        temperature: 0.3, // Lower temperature for factual content
        maxTokens: 2000
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Research summary generation failed:', error);
      throw error;
    }
  }
}

export const openAIEmbeddingService = new OpenAIEmbeddingService();
```

### 5. Create API Integration Endpoints (2 hours)

**File:** `/api/services/providers/openai.ts`
```typescript
import { Request, Response } from 'express';
import { openAIService } from '@/services/ai/providers/OpenAIService';
import { openAIImageService } from '@/services/ai/providers/OpenAIImageService';
import { openAIEmbeddingService } from '@/services/ai/providers/OpenAIEmbeddingService';
import { usageTracker } from '../usageTracker';

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
        model: config?.model || 'gpt-4-turbo-preview'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
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
        model: config?.model || 'dall-e-3'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleBlogGeneration(req: Request, res: Response) {
    const { topic, context } = req.body;
    const startTime = Date.now();
    
    try {
      const blog = await openAIService.generateBlog(topic, context);
      
      // Generate images for the blog if prompts exist
      if (blog.imagePrompts.length > 0) {
        const images = await openAIImageService.generateBlogImages(
          blog.imagePrompts
        );
        blog['images'] = images;
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
        blog,
        provider: 'openai'
      });
    } catch (error) {
      console.error('OpenAI blog generation error:', error);
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
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
        error: error.message 
      });
    }
  }
}

export const openAIAPIHandler = new OpenAIAPIHandler();
```

### 6. Add Routes to API Server (1 hour)

**Update:** `/api/routes/ai.routes.ts`
```typescript
import { Router } from 'express';
import { openAIAPIHandler } from '../services/providers/openai';

const router = Router();

// OpenAI specific routes
router.post('/openai/text', openAIAPIHandler.handleTextGeneration);
router.post('/openai/image', openAIAPIHandler.handleImageGeneration);
router.post('/openai/blog', openAIAPIHandler.handleBlogGeneration);
router.post('/openai/embedding', openAIAPIHandler.handleEmbedding);

// ... existing routes ...

export default router;
```

### 7. Create Integration Tests (2 hours)

**File:** `/__tests__/integration/services/openai.test.ts`
```typescript
import { openAIService } from '@/services/ai/providers/OpenAIService';
import { openAIImageService } from '@/services/ai/providers/OpenAIImageService';

describe('OpenAI Service Integration', () => {
  describe('Text Generation', () => {
    it('should generate text with GPT-4', async () => {
      const result = await openAIService.generateText(
        'Write a haiku about TypeScript'
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
    
    it('should handle streaming responses', async () => {
      const chunks: string[] = [];
      
      await openAIService.generateStream(
        'Count to 5',
        {},
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toContain('5');
    });
  });
  
  describe('Image Generation', () => {
    it('should generate images with DALL-E 3', async () => {
      const urls = await openAIImageService.generateImage(
        'A serene landscape with mountains'
      );
      
      expect(urls).toBeDefined();
      expect(urls.length).toBe(1);
      expect(urls[0]).toMatch(/^https:\/\//);
    });
  });
  
  describe('Blog Generation', () => {
    it('should generate complete blog with image prompts', async () => {
      const blog = await openAIService.generateBlog(
        'The Future of AI',
        { vertical: 'tech' }
      );
      
      expect(blog.title).toBeDefined();
      expect(blog.content).toBeDefined();
      expect(blog.excerpt).toBeDefined();
      expect(blog.tags).toBeInstanceOf(Array);
      expect(blog.imagePrompts).toBeInstanceOf(Array);
    });
  });
});
```

## 📝 REQUIRED DELIVERABLES

### 1. Progress Report (UPDATE CONTINUOUSLY)
**File:** `/docs/agent-reports/AGENT-3A-PROGRESS.md`
- Document every file created
- Track TypeScript errors before/after
- List any issues encountered
- Record all test results

### 2. Implementation Report (AT COMPLETION)
**File:** `/docs/agent-reports/AGENT-3A-IMPLEMENTATION.md`
- Summary of what was implemented
- API endpoints created
- Services available
- Integration points

### 3. Update Master Progress Log
Add to `/MASTER_PROGRESS_LOG.md` when complete

## 🔍 TESTING REQUIREMENTS

1. **TypeScript Compliance:**
```bash
npm run type-check  # MUST show same or fewer errors than baseline
```

2. **Service Tests:**
```bash
npm test -- openai.test.ts
```

3. **API Tests:**
```bash
# Test each endpoint
curl -X POST http://localhost:4000/api/openai/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

## ⚠️ CRITICAL REMINDERS

1. **MD Rule:** Document EVERYTHING in .md files
2. **TypeScript:** NO new errors allowed
3. **Database Keys:** Use providerSettings table, NOT env vars
4. **Error Handling:** Every function needs try-catch
5. **Progress Updates:** Update progress file every 30 minutes

## 🚫 DO NOT

1. Use API keys from environment variables
2. Introduce TypeScript errors
3. Skip error handling
4. Forget to document in .md files
5. Leave console.logs in production code

---

**REMEMBER: All work must be documented in .md files for crash recovery and agent handoff!**