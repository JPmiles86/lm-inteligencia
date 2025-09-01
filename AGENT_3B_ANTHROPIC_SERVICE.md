# Agent-3B: Anthropic Service Integration Specialist
**Priority:** 🟡 HIGH
**Duration:** 10 hours
**Dependencies:** Can work in parallel with other Phase 3 agents
**Created:** 2025-08-31

## 🚨 CRITICAL MD RULE
**ALL WORK MUST BE DOCUMENTED IN .MD FILES**
- Create `/docs/agent-reports/AGENT-3B-PROGRESS.md` IMMEDIATELY
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
Implement complete Anthropic (Claude) service integration using API keys from the database. Must support Claude 3 Opus/Sonnet for text generation with long-context handling. Note: Anthropic does NOT support image generation.

## 📋 CONTEXT
- **Provider Settings:** Keys stored encrypted in database by Agent-2A
- **Fallback System:** This is the PRIMARY provider for writing tasks
- **Capabilities:** Text generation and research ONLY (no images)
- **Models:** Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

## ✅ SUCCESS CRITERIA
1. Anthropic service connects using database API keys
2. Claude 3 models working for text generation
3. Long-context handling (200k tokens)
4. Writing-optimized prompts
5. Handle no-image-generation gracefully
6. NO new TypeScript errors introduced
7. All work documented in .md files

## 🔧 SPECIFIC TASKS

### 1. Create Progress Tracking File (FIRST TASK - 5 minutes)

**File:** `/docs/agent-reports/AGENT-3B-PROGRESS.md`
```markdown
# Agent-3B: Anthropic Service Integration Progress

## Assignment
Implement Anthropic (Claude) service integration with database-stored API keys

## Status: IN PROGRESS
Started: [timestamp]

## TypeScript Baseline
Initial errors: [count from npm run type-check]

## Files Created/Modified
- [ ] /src/services/ai/providers/AnthropicService.ts
- [ ] /api/services/providers/anthropic.ts
- [ ] /__tests__/integration/services/anthropic.test.ts

## Progress Log
[timestamp] - Started work, checking TypeScript baseline
[timestamp] - Creating Anthropic service class
[Update continuously...]

## Issues Found
- [List any issues]

## TypeScript Errors
- Before: X errors
- After: Y errors
- New errors introduced: MUST BE 0
```

### 2. Create Anthropic Service Class (4 hours)

**File:** `/src/services/ai/providers/AnthropicService.ts`
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/db';
import { providerSettings } from '@/db/schema';
import { decrypt } from '@/api/utils/encryption';
import { eq } from 'drizzle-orm';

export interface AnthropicConfig {
  model?: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  system?: string;
}

export class AnthropicService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'anthropic'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('Anthropic API key not configured');
      }
      
      // Decrypt API key
      this.apiKey = decrypt(
        settings[0].apiKeyEncrypted,
        settings[0].encryptionSalt
      );
      
      // Initialize Anthropic client
      this.client = new Anthropic({
        apiKey: this.apiKey
      });
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'anthropic'));
        
    } catch (error) {
      console.error('Failed to initialize Anthropic service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: AnthropicConfig = {}
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: AnthropicConfig = {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const message = await this.client.messages.create({
        model: finalConfig.model!,
        max_tokens: finalConfig.maxTokens!,
        temperature: finalConfig.temperature,
        top_p: finalConfig.topP,
        top_k: finalConfig.topK,
        system: finalConfig.system,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      // Extract text from response
      const content = message.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      
      return '';
    } catch (error) {
      console.error('Anthropic text generation failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: AnthropicConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) await this.initialize();
    
    try {
      const stream = await this.client.messages.create({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
        system: config.system,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      });
      
      for await (const messageStreamEvent of stream) {
        if (messageStreamEvent.type === 'content_block_delta') {
          if (messageStreamEvent.delta.type === 'text_delta') {
            onChunk(messageStreamEvent.delta.text);
          }
        }
      }
    } catch (error) {
      console.error('Anthropic streaming failed:', error);
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
      Write a comprehensive, high-quality blog post about: ${topic}
      
      Requirements:
      1. Create an engaging, SEO-optimized title
      2. Write a compelling excerpt (2-3 sentences) that hooks readers
      3. Produce detailed, well-structured content (1500-2000 words)
      4. Include proper formatting with headers, paragraphs, and lists
      5. Generate 5-7 relevant tags for categorization
      6. Insert 3-4 descriptive image prompts in the format [IMAGE_PROMPT: detailed description]
      
      The content should be:
      - Informative and valuable to readers
      - Well-researched and authoritative
      - Engaging and easy to read
      - Properly structured with clear sections
      
      Format your response as valid JSON with these keys:
      {
        "title": "...",
        "excerpt": "...",
        "content": "...",
        "tags": ["tag1", "tag2", ...],
        "imagePrompts": ["prompt1", "prompt2", ...]
      }
    `;
    
    try {
      const response = await this.generateText(userPrompt, {
        model: 'claude-3-opus-20240229', // Use Opus for best quality
        temperature: 0.7,
        maxTokens: 8000,
        system: systemPrompt
      });
      
      // Parse JSON response
      const result = JSON.parse(response);
      
      // Extract image prompts from content if not provided separately
      if (!result.imagePrompts || result.imagePrompts.length === 0) {
        result.imagePrompts = this.extractImagePrompts(result.content);
      }
      
      return result;
    } catch (error) {
      console.error('Blog generation failed:', error);
      throw error;
    }
  }
  
  async improveWriting(
    text: string,
    improvementType: 'clarity' | 'engagement' | 'seo' | 'grammar' | 'tone'
  ): Promise<string> {
    const prompts = {
      clarity: 'Improve the clarity and readability of this text while maintaining its meaning:',
      engagement: 'Make this text more engaging and compelling for readers:',
      seo: 'Optimize this text for search engines while keeping it natural:',
      grammar: 'Fix any grammar, spelling, or punctuation errors in this text:',
      tone: 'Adjust the tone of this text to be more professional and authoritative:'
    };
    
    const prompt = `${prompts[improvementType]}
    
    Original text:
    ${text}
    
    Provide only the improved version without any explanation.`;
    
    return this.generateText(prompt, {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.3, // Lower temperature for editing tasks
      maxTokens: Math.min(text.length * 2, 4000)
    });
  }
  
  async analyzeContent(
    content: string
  ): Promise<{
    readabilityScore: number;
    seoScore: number;
    suggestions: string[];
    keywords: string[];
    estimatedReadTime: number;
  }> {
    const prompt = `Analyze the following blog content and provide:
    1. Readability score (0-100)
    2. SEO score (0-100)
    3. 3-5 improvement suggestions
    4. 5-10 relevant keywords
    5. Estimated read time in minutes
    
    Content:
    ${content}
    
    Format as JSON with keys: readabilityScore, seoScore, suggestions, keywords, estimatedReadTime`;
    
    try {
      const response = await this.generateText(prompt, {
        model: 'claude-3-haiku-20240307', // Use Haiku for analysis tasks
        temperature: 0.2,
        maxTokens: 1000
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Content analysis failed:', error);
      throw error;
    }
  }
  
  async generateLongFormContent(
    topic: string,
    sections: string[],
    wordsPerSection: number = 500
  ): Promise<{
    title: string;
    sections: Array<{
      heading: string;
      content: string;
    }>;
    conclusion: string;
  }> {
    // Claude excels at long-form content with its 200k context window
    const prompt = `Create a comprehensive long-form article about: ${topic}
    
    Structure:
    ${sections.map((s, i) => `${i + 1}. ${s} (approximately ${wordsPerSection} words)`).join('\n')}
    
    Requirements:
    - Each section should be detailed and informative
    - Include examples, data, and expert insights where relevant
    - Maintain consistency in tone and style throughout
    - End with a compelling conclusion
    
    Format as JSON with keys: title, sections (array of {heading, content}), conclusion`;
    
    try {
      const response = await this.generateText(prompt, {
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        maxTokens: 100000, // Claude can handle very long outputs
        system: 'You are an expert content writer specializing in creating comprehensive, well-researched articles.'
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Long-form content generation failed:', error);
      throw error;
    }
  }
  
  private buildSystemPrompt(context: any): string {
    let prompt = 'You are Claude, an expert content writer known for creating high-quality, engaging, and informative content.';
    
    if (context.brand) {
      prompt += ` You are writing on behalf of ${context.brand}, maintaining their voice and values.`;
    }
    if (context.vertical) {
      prompt += ` You specialize in ${context.vertical} industry content.`;
    }
    if (context.persona) {
      prompt += ` Your target audience is: ${context.persona}.`;
    }
    if (context.writingStyle) {
      prompt += ` Writing style: ${context.writingStyle}.`;
    }
    
    prompt += ' Always prioritize accuracy, clarity, and value for the reader.';
    
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
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi'
          }
        ]
      });
      
      return !!response.content.length;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }
  
  // Anthropic-specific feature: Constitutional AI
  async generateWithConstitution(
    prompt: string,
    constitution: string[],
    config?: AnthropicConfig
  ): Promise<string> {
    const systemPrompt = `You must follow these principles:
    ${constitution.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}
    
    Apply these principles to all your responses.`;
    
    return this.generateText(prompt, {
      ...config,
      system: systemPrompt
    });
  }
}

// Export singleton instance
export const anthropicService = new AnthropicService();
```

### 3. Create API Integration Endpoints (2 hours)

**File:** `/api/services/providers/anthropic.ts`
```typescript
import { Request, Response } from 'express';
import { anthropicService } from '@/services/ai/providers/AnthropicService';
import { usageTracker } from '../usageTracker';

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
          cost: (result.length / 4) * 0.000025, // Claude pricing
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
        model: config?.model || 'claude-3-sonnet-20240229'
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
      const blog = await anthropicService.generateBlog(topic, context);
      
      // Note: Anthropic doesn't support image generation
      // Image prompts are included for another service to handle
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'blog-generation',
        tokensUsed: blog.content.length / 4,
        cost: (blog.content.length / 4) * 0.000025,
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
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleWritingImprovement(req: Request, res: Response) {
    const { text, improvementType } = req.body;
    
    try {
      const improved = await anthropicService.improveWriting(
        text,
        improvementType
      );
      
      res.json({ 
        success: true, 
        improvedText: improved,
        provider: 'anthropic'
      });
    } catch (error) {
      console.error('Anthropic writing improvement error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleContentAnalysis(req: Request, res: Response) {
    const { content } = req.body;
    
    try {
      const analysis = await anthropicService.analyzeContent(content);
      
      res.json({ 
        success: true, 
        analysis,
        provider: 'anthropic'
      });
    } catch (error) {
      console.error('Anthropic content analysis error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
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
      
      // Track usage
      const totalWords = content.sections.reduce(
        (sum, s) => sum + s.content.split(' ').length,
        0
      );
      
      await usageTracker.trackUsage({
        provider: 'anthropic',
        task: 'long-form-generation',
        tokensUsed: totalWords * 1.3, // Words to tokens estimate
        cost: (totalWords * 1.3) * 0.000025,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'claude-3-opus-20240229'
      });
      
      res.json({ 
        success: true, 
        content,
        provider: 'anthropic'
      });
    } catch (error) {
      console.error('Anthropic long-form generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

export const anthropicAPIHandler = new AnthropicAPIHandler();
```

### 4. Add Routes to API Server (1 hour)

**Update:** `/api/routes/ai.routes.ts`
Add these routes:
```typescript
// Anthropic specific routes
router.post('/anthropic/text', anthropicAPIHandler.handleTextGeneration);
router.post('/anthropic/blog', anthropicAPIHandler.handleBlogGeneration);
router.post('/anthropic/improve', anthropicAPIHandler.handleWritingImprovement);
router.post('/anthropic/analyze', anthropicAPIHandler.handleContentAnalysis);
router.post('/anthropic/long-form', anthropicAPIHandler.handleLongFormGeneration);
```

### 5. Create Integration Tests (2 hours)

**File:** `/__tests__/integration/services/anthropic.test.ts`
```typescript
import { anthropicService } from '@/services/ai/providers/AnthropicService';

describe('Anthropic Service Integration', () => {
  describe('Text Generation', () => {
    it('should generate text with Claude', async () => {
      const result = await anthropicService.generateText(
        'Write a haiku about TypeScript'
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
    
    it('should handle streaming responses', async () => {
      const chunks: string[] = [];
      
      await anthropicService.generateStream(
        'Count to 5',
        {},
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toContain('5');
    });
  });
  
  describe('Blog Generation', () => {
    it('should generate complete blog with image prompts', async () => {
      const blog = await anthropicService.generateBlog(
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
  
  describe('Writing Improvement', () => {
    it('should improve text clarity', async () => {
      const original = 'This is text that could be more clear.';
      const improved = await anthropicService.improveWriting(
        original,
        'clarity'
      );
      
      expect(improved).toBeDefined();
      expect(improved).not.toBe(original);
    });
  });
  
  describe('Content Analysis', () => {
    it('should analyze content and provide scores', async () => {
      const analysis = await anthropicService.analyzeContent(
        'Sample blog content for analysis...'
      );
      
      expect(analysis.readabilityScore).toBeDefined();
      expect(analysis.seoScore).toBeDefined();
      expect(analysis.suggestions).toBeInstanceOf(Array);
      expect(analysis.keywords).toBeInstanceOf(Array);
    });
  });
});
```

## 📝 REQUIRED DELIVERABLES

### 1. Progress Report (UPDATE CONTINUOUSLY)
**File:** `/docs/agent-reports/AGENT-3B-PROGRESS.md`
- Document every file created
- Track TypeScript errors before/after
- List any issues encountered
- Record all test results

### 2. Implementation Report (AT COMPLETION)
**File:** `/docs/agent-reports/AGENT-3B-IMPLEMENTATION.md`
- Summary of what was implemented
- API endpoints created
- Services available
- Integration points
- Note: Anthropic limitations (no image generation)

### 3. Update Master Progress Log
Add to `/MASTER_PROGRESS_LOG.md` when complete

## 🔍 TESTING REQUIREMENTS

1. **TypeScript Compliance:**
```bash
npm run type-check  # MUST show same or fewer errors than baseline
```

2. **Service Tests:**
```bash
npm test -- anthropic.test.ts
```

3. **API Tests:**
```bash
# Test each endpoint
curl -X POST http://localhost:4000/api/anthropic/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello Claude"}'
```

## ⚠️ CRITICAL REMINDERS

1. **MD Rule:** Document EVERYTHING in .md files
2. **TypeScript:** NO new errors allowed
3. **Database Keys:** Use providerSettings table, NOT env vars
4. **No Images:** Anthropic doesn't support image generation
5. **Progress Updates:** Update progress file every 30 minutes

## 🚫 DO NOT

1. Try to implement image generation (not supported)
2. Use API keys from environment variables
3. Introduce TypeScript errors
4. Skip error handling
5. Forget to document in .md files

---

**REMEMBER: All work must be documented in .md files for crash recovery and agent handoff!**