# Agent-3C: Google (Gemini) Service Integration Specialist
**Priority:** 🟡 HIGH
**Duration:** 12 hours
**Dependencies:** Can work in parallel with other Phase 3 agents
**Created:** 2025-08-31

## 🚨 CRITICAL MD RULE
**ALL WORK MUST BE DOCUMENTED IN .MD FILES**
- Create `/docs/agent-reports/AGENT-3C-PROGRESS.md` IMMEDIATELY
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

## 🌐 OFFICIAL DOCUMENTATION
**CHECK LATEST GOOGLE AI DOCS:**
```bash
# Use WebFetch to get latest API information
WebFetch: https://ai.google.dev/gemini-api/docs
WebFetch: https://ai.google.dev/gemini-api/docs/get-started/node
WebFetch: https://ai.google.dev/gemini-api/docs/api-overview
WebFetch: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
```

## 🎯 MISSION
Implement complete Google AI (Gemini) service integration using API keys from the database. Must support Gemini Pro text generation, Gemini Pro Vision for multimodal, and Imagen for image generation.

## 📋 CONTEXT
- **Provider Settings:** Keys stored encrypted in database by Agent-2A
- **Fallback System:** Google is primary for image generation, secondary for text
- **Capabilities:** Text, image generation, multimodal, research
- **Models:** Gemini 1.5 Pro, Gemini 1.5 Flash, Imagen 3

## ✅ SUCCESS CRITERIA
1. Google AI service connects using database API keys
2. Gemini Pro text generation working
3. Imagen/Gemini image generation functional
4. Multimodal capabilities (text + image input)
5. Support for 1M+ token context window
6. NO new TypeScript errors introduced
7. All work documented in .md files
8. Check official docs for latest API changes

## 🔧 SPECIFIC TASKS

### 1. Create Progress Tracking File (FIRST TASK - 5 minutes)

**File:** `/docs/agent-reports/AGENT-3C-PROGRESS.md`
```markdown
# Agent-3C: Google (Gemini) Service Integration Progress

## Assignment
Implement Google AI (Gemini) service integration with database-stored API keys

## Status: IN PROGRESS
Started: [timestamp]

## TypeScript Baseline
Initial errors: [count from npm run type-check]

## Official Docs Checked
- [ ] Gemini API Overview
- [ ] Node.js SDK Documentation
- [ ] Model Reference
- [ ] Image Generation API

## Files Created/Modified
- [ ] /src/services/ai/providers/GoogleAIService.ts
- [ ] /src/services/ai/providers/GoogleImageService.ts
- [ ] /api/services/providers/google.ts
- [ ] /__tests__/integration/services/google.test.ts

## Progress Log
[timestamp] - Started work, checking TypeScript baseline
[timestamp] - Checking official Google AI documentation
[timestamp] - Creating Google AI service class
[Update continuously...]

## Issues Found
- [List any issues]

## TypeScript Errors
- Before: X errors
- After: Y errors
- New errors introduced: MUST BE 0
```

### 2. Check Official Documentation (30 minutes)

**IMPORTANT: Check latest API info before implementing**
```typescript
// Use WebFetch to get current API documentation
// Check for:
// - Latest SDK version
// - API endpoint changes
// - New model names
// - Authentication methods
// - Rate limits
// - Pricing updates
```

### 3. Create Google AI Service Class (3 hours)

**File:** `/src/services/ai/providers/GoogleAIService.ts`
```typescript
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { db } from '@/db';
import { providerSettings } from '@/db/schema';
import { decrypt } from '@/api/utils/encryption';
import { eq } from 'drizzle-orm';

export interface GoogleAIConfig {
  model?: 'gemini-1.5-pro-latest' | 'gemini-1.5-flash-latest' | 'gemini-pro' | 'gemini-pro-vision';
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  stopSequences?: string[];
}

export class GoogleAIService {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'google'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('Google AI API key not configured');
      }
      
      // Decrypt API key
      this.apiKey = decrypt(
        settings[0].apiKeyEncrypted,
        settings[0].encryptionSalt
      );
      
      // Initialize Google AI client
      this.client = new GoogleGenerativeAI(this.apiKey);
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'google'));
        
    } catch (error) {
      console.error('Failed to initialize Google AI service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: GoogleAIConfig = {}
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: GoogleAIConfig = {
      model: 'gemini-1.5-pro-latest',
      temperature: 0.7,
      maxOutputTokens: 8192,
      topP: 0.95,
      topK: 40,
      candidateCount: 1
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: finalConfig.model!,
        generationConfig: {
          temperature: finalConfig.temperature,
          maxOutputTokens: finalConfig.maxOutputTokens,
          topP: finalConfig.topP,
          topK: finalConfig.topK,
          candidateCount: finalConfig.candidateCount,
          stopSequences: finalConfig.stopSequences
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ]
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Google AI text generation failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: GoogleAIConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: config.model || 'gemini-1.5-pro-latest',
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxOutputTokens || 8192
        }
      });
      
      const result = await model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          onChunk(chunkText);
        }
      }
    } catch (error) {
      console.error('Google AI streaming failed:', error);
      throw error;
    }
  }
  
  async generateWithImages(
    prompt: string,
    images: Array<{ data: string; mimeType: string }>,
    config?: GoogleAIConfig
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-1.5-pro-latest' // Pro supports multimodal
      });
      
      const parts = [
        { text: prompt },
        ...images.map(img => ({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        }))
      ];
      
      const result = await model.generateContent(parts);
      return result.response.text();
    } catch (error) {
      console.error('Google AI multimodal generation failed:', error);
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
    const systemContext = this.buildSystemContext(context);
    
    const prompt = `${systemContext}

Write a comprehensive blog post about: ${topic}

Requirements:
1. Create an SEO-optimized title (60-70 characters)
2. Write a compelling excerpt (150-160 characters)
3. Produce detailed content (1500-2000 words) with proper structure
4. Include H2 and H3 headings for organization
5. Generate 5-7 relevant tags
6. Insert 3-4 image prompts in format [IMAGE_PROMPT: detailed description]

The content should be:
- Informative and well-researched
- Engaging and conversational
- SEO-optimized with natural keyword usage
- Properly formatted with sections

Return as JSON with keys: title, excerpt, content, tags, imagePrompts`;
    
    try {
      const response = await this.generateText(prompt, {
        model: 'gemini-1.5-pro-latest',
        temperature: 0.7,
        maxOutputTokens: 10000 // Gemini supports large outputs
      });
      
      // Parse JSON response
      const result = JSON.parse(response);
      
      // Extract image prompts if embedded in content
      if (!result.imagePrompts || result.imagePrompts.length === 0) {
        result.imagePrompts = this.extractImagePrompts(result.content);
      }
      
      return result;
    } catch (error) {
      console.error('Blog generation failed:', error);
      throw error;
    }
  }
  
  async chat(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    config?: GoogleAIConfig
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: config?.model || 'gemini-1.5-pro-latest'
      });
      
      const chat = model.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: config?.temperature || 0.7,
          maxOutputTokens: config?.maxOutputTokens || 8192
        }
      });
      
      const result = await chat.sendMessage(messages[messages.length - 1].content);
      return result.response.text();
    } catch (error) {
      console.error('Google AI chat failed:', error);
      throw error;
    }
  }
  
  async countTokens(text: string, model?: string): Promise<number> {
    if (!this.client) await this.initialize();
    
    try {
      const genModel = this.client.getGenerativeModel({ 
        model: model || 'gemini-1.5-pro-latest'
      });
      
      const result = await genModel.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      console.error('Token counting failed:', error);
      throw error;
    }
  }
  
  async embedText(text: string): Promise<number[]> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: 'embedding-001'
      });
      
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Google AI embedding failed:', error);
      throw error;
    }
  }
  
  private buildSystemContext(context: any): string {
    let prompt = 'You are an expert content writer using Google Gemini AI.';
    
    if (context.brand) {
      prompt += ` You are writing for ${context.brand}.`;
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
      
      // Test with minimal generation
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-1.5-flash-latest'
      });
      
      const result = await model.generateContent('Say "test"');
      return !!result.response.text();
    } catch (error) {
      console.error('Google AI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleAIService = new GoogleAIService();
```

### 4. Create Image Generation Service (2 hours)

**File:** `/src/services/ai/providers/GoogleImageService.ts`
```typescript
// Note: Check latest docs for Imagen API availability
// May need to use Vertex AI or different endpoint

import { googleAIService } from './GoogleAIService';

export interface GoogleImageConfig {
  model?: 'imagen-3' | 'gemini-pro-vision';
  width?: number;
  height?: number;
  numImages?: number;
  guidanceScale?: number;
  negativePrompt?: string;
}

export class GoogleImageService {
  async generateImage(
    prompt: string,
    config: GoogleImageConfig = {}
  ): Promise<string[]> {
    // Check official docs for latest image generation API
    // This is a placeholder - actual implementation depends on current API
    
    try {
      // Option 1: Use Gemini to generate image descriptions
      // Then use another service for actual generation
      
      // Option 2: Use Vertex AI Imagen API if available
      
      // Option 3: Use image generation through Gemini if supported
      
      // For now, generate detailed image description
      const imageDescription = await googleAIService.generateText(
        `Create a detailed image description for: ${prompt}
         Include: composition, lighting, colors, style, mood, and specific details.`,
        { temperature: 0.8 }
      );
      
      // Return placeholder - actual implementation needs API access
      return [`Image would be generated from: ${imageDescription}`];
    } catch (error) {
      console.error('Google image generation failed:', error);
      throw error;
    }
  }
  
  async analyzeImage(
    imageData: string,
    mimeType: string,
    prompt: string = 'Describe this image in detail'
  ): Promise<string> {
    return googleAIService.generateWithImages(
      prompt,
      [{ data: imageData, mimeType }]
    );
  }
  
  async generateImageVariations(
    originalImage: string,
    mimeType: string,
    variations: number = 3
  ): Promise<string[]> {
    const prompts = [];
    
    for (let i = 0; i < variations; i++) {
      const variation = await googleAIService.generateWithImages(
        `Describe a creative variation of this image with different: 
         ${i === 0 ? 'colors and lighting' : ''}
         ${i === 1 ? 'composition and perspective' : ''}
         ${i === 2 ? 'style and mood' : ''}`,
        [{ data: originalImage, mimeType }]
      );
      prompts.push(variation);
    }
    
    return prompts;
  }
}

export const googleImageService = new GoogleImageService();
```

### 5. Create API Integration Endpoints (2 hours)

**File:** `/api/services/providers/google.ts`
```typescript
import { Request, Response } from 'express';
import { googleAIService } from '@/services/ai/providers/GoogleAIService';
import { googleImageService } from '@/services/ai/providers/GoogleImageService';
import { usageTracker } from '../usageTracker';

export class GoogleAPIHandler {
  async handleTextGeneration(req: Request, res: Response) {
    const { prompt, config, stream = false } = req.body;
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
          cost: tokens * 0.00002, // Gemini pricing
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: config?.model || 'gemini-1.5-pro-latest'
        });
        
        res.json({ 
          success: true, 
          content: result,
          provider: 'google',
          model: config?.model || 'gemini-1.5-pro-latest',
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
        model: config?.model || 'gemini-1.5-pro-latest'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleMultimodal(req: Request, res: Response) {
    const { prompt, images } = req.body;
    
    try {
      const result = await googleAIService.generateWithImages(
        prompt,
        images
      );
      
      res.json({ 
        success: true, 
        content: result,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google AI multimodal error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleChat(req: Request, res: Response) {
    const { messages, config } = req.body;
    
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
        error: error.message 
      });
    }
  }
  
  async handleBlogGeneration(req: Request, res: Response) {
    const { topic, context } = req.body;
    const startTime = Date.now();
    
    try {
      const blog = await googleAIService.generateBlog(topic, context);
      
      // Track usage
      const tokens = await googleAIService.countTokens(blog.content);
      await usageTracker.trackUsage({
        provider: 'google',
        task: 'blog-generation',
        tokensUsed: tokens,
        cost: tokens * 0.00002,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'gemini-1.5-pro-latest'
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
        error: error.message 
      });
    }
  }
  
  async handleImageGeneration(req: Request, res: Response) {
    const { prompt, config } = req.body;
    
    try {
      const urls = await googleImageService.generateImage(prompt, config);
      
      res.json({ 
        success: true, 
        urls,
        provider: 'google',
        note: 'Check Imagen API availability in your region'
      });
    } catch (error) {
      console.error('Google image generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
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
        error: error.message 
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
        error: error.message 
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
        error: error.message 
      });
    }
  }
}

export const googleAPIHandler = new GoogleAPIHandler();
```

### 6. Add Routes to API Server (1 hour)

**Update:** `/api/routes/ai.routes.ts`
Add these routes:
```typescript
// Google AI specific routes
router.post('/google/text', googleAPIHandler.handleTextGeneration);
router.post('/google/multimodal', googleAPIHandler.handleMultimodal);
router.post('/google/chat', googleAPIHandler.handleChat);
router.post('/google/blog', googleAPIHandler.handleBlogGeneration);
router.post('/google/image', googleAPIHandler.handleImageGeneration);
router.post('/google/analyze-image', googleAPIHandler.handleImageAnalysis);
router.post('/google/tokens', googleAPIHandler.handleTokenCount);
router.post('/google/embedding', googleAPIHandler.handleEmbedding);
```

### 7. Create Integration Tests (2 hours)

**File:** `/__tests__/integration/services/google.test.ts`
```typescript
import { googleAIService } from '@/services/ai/providers/GoogleAIService';
import { googleImageService } from '@/services/ai/providers/GoogleImageService';

describe('Google AI Service Integration', () => {
  describe('Text Generation', () => {
    it('should generate text with Gemini', async () => {
      const result = await googleAIService.generateText(
        'Write a haiku about TypeScript'
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
    
    it('should handle streaming responses', async () => {
      const chunks: string[] = [];
      
      await googleAIService.generateStream(
        'Count to 5',
        {},
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
  
  describe('Multimodal', () => {
    it('should analyze images with text', async () => {
      const imageData = 'base64_encoded_image_data';
      const result = await googleAIService.generateWithImages(
        'What is in this image?',
        [{ data: imageData, mimeType: 'image/jpeg' }]
      );
      
      expect(result).toBeDefined();
    });
  });
  
  describe('Token Counting', () => {
    it('should count tokens accurately', async () => {
      const text = 'This is a test sentence.';
      const tokens = await googleAIService.countTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(10);
    });
  });
  
  describe('Blog Generation', () => {
    it('should generate complete blog with structure', async () => {
      const blog = await googleAIService.generateBlog(
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
**File:** `/docs/agent-reports/AGENT-3C-PROGRESS.md`
- Document every file created
- Track TypeScript errors before/after
- Note API documentation findings
- Record all test results

### 2. Implementation Report (AT COMPLETION)
**File:** `/docs/agent-reports/AGENT-3C-IMPLEMENTATION.md`
- Summary of what was implemented
- API endpoints created
- Services available
- Any limitations found in current API

### 3. Update Master Progress Log
Add to `/MASTER_PROGRESS_LOG.md` when complete

## 🔍 TESTING REQUIREMENTS

1. **TypeScript Compliance:**
```bash
npm run type-check  # MUST show same or fewer errors than baseline
```

2. **Service Tests:**
```bash
npm test -- google.test.ts
```

3. **API Tests:**
```bash
# Test each endpoint
curl -X POST http://localhost:4000/api/google/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello Gemini"}'
```

## ⚠️ CRITICAL REMINDERS

1. **MD Rule:** Document EVERYTHING in .md files
2. **Check Docs:** Verify latest API information
3. **TypeScript:** NO new errors allowed
4. **Database Keys:** Use providerSettings table, NOT env vars
5. **Progress Updates:** Update progress file every 30 minutes

## 🚫 DO NOT

1. Use outdated API endpoints
2. Skip checking official documentation
3. Use API keys from environment variables
4. Introduce TypeScript errors
5. Forget to document in .md files

## 💡 IMPORTANT NOTES

### API Availability
- Gemini API may have regional restrictions
- Imagen API access may require special approval
- Check Vertex AI as alternative for some features

### Multimodal Capabilities
- Gemini Pro Vision supports image input
- Can analyze images and generate text about them
- Useful for blog image caption generation

### Large Context Window
- Gemini 1.5 Pro supports 1M+ tokens
- Excellent for analyzing long documents
- Can process entire codebases

---

**REMEMBER: Check official docs and document everything in .md files!**