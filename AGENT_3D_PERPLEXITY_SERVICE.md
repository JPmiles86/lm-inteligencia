# Agent-3D: Perplexity Service Integration Specialist
**Priority:** 🟡 HIGH
**Duration:** 10 hours
**Dependencies:** Can work in parallel with other Phase 3 agents
**Created:** 2025-08-31

## 🚨 CRITICAL MD RULE
**ALL WORK MUST BE DOCUMENTED IN .MD FILES**
- Create `/docs/agent-reports/AGENT-3D-PROGRESS.md` IMMEDIATELY
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
**CHECK LATEST PERPLEXITY API DOCS:**
```bash
# Use WebFetch to get latest API information
WebFetch: https://docs.perplexity.ai/docs/getting-started
WebFetch: https://docs.perplexity.ai/reference/post_chat_completions
WebFetch: https://docs.perplexity.ai/docs/model-cards
```

## 🎯 MISSION
Implement complete Perplexity AI service integration using API keys from the database. Perplexity specializes in research with real-time web search capabilities. It's the PRIMARY provider for research tasks.

## 📋 CONTEXT
- **Provider Settings:** Keys stored encrypted in database by Agent-2A
- **Fallback System:** Perplexity is PRIMARY for research tasks
- **Capabilities:** Text generation with live web search, research, citations
- **Models:** Sonar (online), Codellama, Mistral, Llama models
- **Special Feature:** Real-time web search with source citations

## ✅ SUCCESS CRITERIA
1. Perplexity service connects using database API keys
2. Sonar models working for online research
3. Real-time web search integrated
4. Source citation extraction working
5. Research summarization functional
6. NO new TypeScript errors introduced
7. All work documented in .md files
8. Check official docs for latest API changes

## 🔧 SPECIFIC TASKS

### 1. Create Progress Tracking File (FIRST TASK - 5 minutes)

**File:** `/docs/agent-reports/AGENT-3D-PROGRESS.md`
```markdown
# Agent-3D: Perplexity Service Integration Progress

## Assignment
Implement Perplexity AI service integration with database-stored API keys

## Status: IN PROGRESS
Started: [timestamp]

## TypeScript Baseline
Initial errors: [count from npm run type-check]

## Official Docs Checked
- [ ] Getting Started Guide
- [ ] API Reference
- [ ] Model Cards
- [ ] Rate Limits

## Files Created/Modified
- [ ] /src/services/ai/providers/PerplexityService.ts
- [ ] /api/services/providers/perplexity.ts
- [ ] /__tests__/integration/services/perplexity.test.ts

## Progress Log
[timestamp] - Started work, checking TypeScript baseline
[timestamp] - Checking official Perplexity documentation
[timestamp] - Creating Perplexity service class
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
// Use WebFetch to verify:
// - Current API endpoints
// - Available models (Sonar versions)
// - Authentication headers
// - Rate limits
// - Response formats
// - Citation formats
```

### 3. Create Perplexity Service Class (4 hours)

**File:** `/src/services/ai/providers/PerplexityService.ts`
```typescript
import { db } from '@/db';
import { providerSettings } from '@/db/schema';
import { decrypt } from '@/api/utils/encryption';
import { eq } from 'drizzle-orm';

export interface PerplexityConfig {
  model?: 'llama-3.1-sonar-small-128k-online' | 
          'llama-3.1-sonar-large-128k-online' | 
          'llama-3.1-sonar-huge-128k-online' |
          'llama-3.1-8b-instruct' |
          'llama-3.1-70b-instruct';
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  returnCitations?: boolean;
  returnImages?: boolean;
  searchDomainFilter?: string[];
  searchRecencyFilter?: 'month' | 'week' | 'day' | 'hour';
}

interface Citation {
  url: string;
  title: string;
  snippet: string;
  index: number;
}

export class PerplexityService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.perplexity.ai';
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'perplexity'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('Perplexity API key not configured');
      }
      
      // Decrypt API key
      this.apiKey = decrypt(
        settings[0].apiKeyEncrypted,
        settings[0].encryptionSalt
      );
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'perplexity'));
        
    } catch (error) {
      console.error('Failed to initialize Perplexity service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: PerplexityConfig = {}
  ): Promise<{
    content: string;
    citations?: Citation[];
    images?: string[];
  }> {
    if (!this.apiKey) await this.initialize();
    
    const defaultConfig: PerplexityConfig = {
      model: 'llama-3.1-sonar-large-128k-online',
      temperature: 0.2, // Lower for factual research
      maxTokens: 4000,
      topP: 0.9,
      returnCitations: true,
      returnImages: false
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: finalConfig.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant with access to current web information. Always provide accurate, well-sourced information.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: finalConfig.temperature,
          max_tokens: finalConfig.maxTokens,
          top_p: finalConfig.topP,
          top_k: finalConfig.topK,
          presence_penalty: finalConfig.presencePenalty,
          frequency_penalty: finalConfig.frequencyPenalty,
          return_citations: finalConfig.returnCitations,
          return_images: finalConfig.returnImages,
          search_domain_filter: finalConfig.searchDomainFilter,
          search_recency_filter: finalConfig.searchRecencyFilter
        })
      });
      
      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        citations: data.citations,
        images: data.images
      };
    } catch (error) {
      console.error('Perplexity text generation failed:', error);
      throw error;
    }
  }
  
  async research(
    topic: string,
    options: {
      depth?: 'quick' | 'standard' | 'deep';
      sources?: number;
      recency?: 'hour' | 'day' | 'week' | 'month';
      domains?: string[];
    } = {}
  ): Promise<{
    summary: string;
    keyPoints: string[];
    sources: Citation[];
    relatedTopics: string[];
  }> {
    const depthPrompts = {
      quick: 'Provide a brief overview',
      standard: 'Provide a comprehensive summary',
      deep: 'Provide an in-depth analysis with multiple perspectives'
    };
    
    const prompt = `${depthPrompts[options.depth || 'standard']} about: ${topic}
    
    Include:
    1. A well-researched summary
    2. 5-7 key points
    3. Related topics for further research
    4. Cite all sources
    
    Focus on the most recent and authoritative information available.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'llama-3.1-sonar-large-128k-online',
        temperature: 0.2,
        maxTokens: 6000,
        returnCitations: true,
        searchRecencyFilter: options.recency,
        searchDomainFilter: options.domains
      });
      
      // Parse structured response
      const keyPoints = this.extractKeyPoints(result.content);
      const relatedTopics = this.extractRelatedTopics(result.content);
      
      return {
        summary: result.content,
        keyPoints,
        sources: result.citations || [],
        relatedTopics
      };
    } catch (error) {
      console.error('Research failed:', error);
      throw error;
    }
  }
  
  async factCheck(
    statement: string
  ): Promise<{
    verdict: 'true' | 'false' | 'partially-true' | 'unverifiable';
    explanation: string;
    sources: Citation[];
  }> {
    const prompt = `Fact-check this statement: "${statement}"
    
    Provide:
    1. A clear verdict (true/false/partially-true/unverifiable)
    2. Detailed explanation with evidence
    3. Reliable sources
    
    Be objective and cite authoritative sources.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'llama-3.1-sonar-large-128k-online',
        temperature: 0.1, // Very low for factual accuracy
        returnCitations: true
      });
      
      const verdict = this.extractVerdict(result.content);
      
      return {
        verdict,
        explanation: result.content,
        sources: result.citations || []
      };
    } catch (error) {
      console.error('Fact check failed:', error);
      throw error;
    }
  }
  
  async generateBlogWithResearch(
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
    sources: Citation[];
  }> {
    // First, research the topic
    const research = await this.research(topic, {
      depth: 'deep',
      recency: 'month'
    });
    
    // Then generate blog content with research
    const prompt = `Write a comprehensive, well-researched blog post about: ${topic}
    
    Use this research:
    ${research.summary}
    
    Key Points to cover:
    ${research.keyPoints.join('\n')}
    
    Context:
    ${context.brand ? `Brand: ${context.brand}` : ''}
    ${context.vertical ? `Industry: ${context.vertical}` : ''}
    ${context.persona ? `Target audience: ${context.persona}` : ''}
    ${context.writingStyle ? `Style: ${context.writingStyle}` : ''}
    
    Requirements:
    1. SEO-optimized title
    2. Compelling excerpt
    3. 1500-2000 words of engaging content
    4. Include citations naturally in the text
    5. 5-7 relevant tags
    6. 3-4 image prompts as [IMAGE_PROMPT: description]
    
    Format as JSON with keys: title, excerpt, content, tags, imagePrompts`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'llama-3.1-sonar-large-128k-online',
        temperature: 0.7,
        maxTokens: 8000,
        returnCitations: true
      });
      
      const blog = JSON.parse(result.content);
      
      // Add sources from research
      blog.sources = result.citations || research.sources;
      
      // Extract image prompts if not provided
      if (!blog.imagePrompts || blog.imagePrompts.length === 0) {
        blog.imagePrompts = this.extractImagePrompts(blog.content);
      }
      
      return blog;
    } catch (error) {
      console.error('Blog generation with research failed:', error);
      throw error;
    }
  }
  
  async compareInformation(
    items: string[]
  ): Promise<{
    comparison: string;
    differences: string[];
    similarities: string[];
    recommendation: string;
    sources: Citation[];
  }> {
    const prompt = `Compare and contrast: ${items.join(' vs ')}
    
    Provide:
    1. Detailed comparison
    2. Key differences
    3. Key similarities
    4. Recommendation based on use cases
    
    Use current, factual information with sources.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'llama-3.1-sonar-large-128k-online',
        temperature: 0.3,
        returnCitations: true
      });
      
      return {
        comparison: result.content,
        differences: this.extractListItems(result.content, 'differences'),
        similarities: this.extractListItems(result.content, 'similarities'),
        recommendation: this.extractRecommendation(result.content),
        sources: result.citations || []
      };
    } catch (error) {
      console.error('Comparison failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: PerplexityConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.apiKey) await this.initialize();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          temperature: config.temperature || 0.2,
          max_tokens: config.maxTokens || 4000
        })
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Perplexity streaming failed:', error);
      throw error;
    }
  }
  
  private extractKeyPoints(content: string): string[] {
    // Extract bullet points or numbered lists
    const regex = /(?:^|\n)[\*\-\•\d]+\.?\s+(.+)/gm;
    const points: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null && points.length < 7) {
      points.push(match[1].trim());
    }
    
    return points;
  }
  
  private extractRelatedTopics(content: string): string[] {
    // Look for related topics section
    const regex = /related.*?topics?:?\s*([\s\S]*?)(?:\n\n|$)/i;
    const match = content.match(regex);
    
    if (match) {
      return this.extractKeyPoints(match[1]);
    }
    
    return [];
  }
  
  private extractVerdict(content: string): 'true' | 'false' | 'partially-true' | 'unverifiable' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('true') && !lowerContent.includes('partially')) {
      return 'true';
    } else if (lowerContent.includes('false')) {
      return 'false';
    } else if (lowerContent.includes('partially') || lowerContent.includes('partly')) {
      return 'partially-true';
    } else {
      return 'unverifiable';
    }
  }
  
  private extractListItems(content: string, section: string): string[] {
    const regex = new RegExp(`${section}:?\\s*([\\s\\S]*?)(?:\\n\\n|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      return this.extractKeyPoints(match[1]);
    }
    
    return [];
  }
  
  private extractRecommendation(content: string): string {
    const regex = /recommend(?:ation)?:?\s*([\s\S]*?)(?:\n\n|$)/i;
    const match = content.match(regex);
    
    return match ? match[1].trim() : '';
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
      if (!this.apiKey) await this.initialize();
      
      // Test with minimal API call
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: 'Test'
            }
          ],
          max_tokens: 10
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Perplexity connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const perplexityService = new PerplexityService();
```

### 4. Create API Integration Endpoints (2 hours)

**File:** `/api/services/providers/perplexity.ts`
```typescript
import { Request, Response } from 'express';
import { perplexityService } from '@/services/ai/providers/PerplexityService';
import { usageTracker } from '../usageTracker';

export class PerplexityAPIHandler {
  async handleTextGeneration(req: Request, res: Response) {
    const { prompt, config, stream = false } = req.body;
    const startTime = Date.now();
    
    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
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
        
        // Track usage
        await usageTracker.trackUsage({
          provider: 'perplexity',
          task: 'text-generation',
          tokensUsed: result.content.length / 4,
          cost: (result.content.length / 4) * 0.000015,
          duration: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
          model: config?.model || 'llama-3.1-sonar-large-128k-online'
        });
        
        res.json({ 
          success: true, 
          ...result,
          provider: 'perplexity',
          model: config?.model || 'llama-3.1-sonar-large-128k-online'
        });
      }
    } catch (error) {
      console.error('Perplexity text generation error:', error);
      
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'text-generation',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
        model: config?.model || 'llama-3.1-sonar-large-128k-online'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleResearch(req: Request, res: Response) {
    const { topic, options } = req.body;
    const startTime = Date.now();
    
    try {
      const research = await perplexityService.research(topic, options);
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'research',
        tokensUsed: research.summary.length / 4,
        cost: (research.summary.length / 4) * 0.000015,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
        model: 'llama-3.1-sonar-large-128k-online'
      });
      
      res.json({ 
        success: true, 
        research,
        provider: 'perplexity'
      });
    } catch (error) {
      console.error('Perplexity research error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleFactCheck(req: Request, res: Response) {
    const { statement } = req.body;
    
    try {
      const result = await perplexityService.factCheck(statement);
      
      res.json({ 
        success: true, 
        ...result,
        provider: 'perplexity'
      });
    } catch (error) {
      console.error('Perplexity fact check error:', error);
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
      const blog = await perplexityService.generateBlogWithResearch(
        topic,
        context
      );
      
      // Track usage
      await usageTracker.trackUsage({
        provider: 'perplexity',
        task: 'blog-generation',
        tokensUsed: blog.content.length / 4,
        cost: (blog.content.length / 4) * 0.000015,
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
    } catch (error) {
      console.error('Perplexity blog generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  async handleComparison(req: Request, res: Response) {
    const { items } = req.body;
    
    try {
      const comparison = await perplexityService.compareInformation(items);
      
      res.json({ 
        success: true, 
        comparison,
        provider: 'perplexity'
      });
    } catch (error) {
      console.error('Perplexity comparison error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

export const perplexityAPIHandler = new PerplexityAPIHandler();
```

### 5. Add Routes to API Server (1 hour)

**Update:** `/api/routes/ai.routes.ts`
Add these routes:
```typescript
// Perplexity specific routes
router.post('/perplexity/text', perplexityAPIHandler.handleTextGeneration);
router.post('/perplexity/research', perplexityAPIHandler.handleResearch);
router.post('/perplexity/fact-check', perplexityAPIHandler.handleFactCheck);
router.post('/perplexity/blog', perplexityAPIHandler.handleBlogGeneration);
router.post('/perplexity/compare', perplexityAPIHandler.handleComparison);
```

### 6. Create Integration Tests (2 hours)

**File:** `/__tests__/integration/services/perplexity.test.ts`
```typescript
import { perplexityService } from '@/services/ai/providers/PerplexityService';

describe('Perplexity Service Integration', () => {
  describe('Text Generation', () => {
    it('should generate text with online search', async () => {
      const result = await perplexityService.generateText(
        'What are the latest developments in TypeScript?'
      );
      
      expect(result.content).toBeDefined();
      expect(result.citations).toBeInstanceOf(Array);
    });
    
    it('should handle streaming responses', async () => {
      const chunks: string[] = [];
      
      await perplexityService.generateStream(
        'Latest news in AI',
        {},
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
  
  describe('Research', () => {
    it('should conduct deep research with sources', async () => {
      const research = await perplexityService.research(
        'Future of web development',
        { depth: 'deep' }
      );
      
      expect(research.summary).toBeDefined();
      expect(research.keyPoints).toBeInstanceOf(Array);
      expect(research.sources).toBeInstanceOf(Array);
      expect(research.sources.length).toBeGreaterThan(0);
    });
  });
  
  describe('Fact Checking', () => {
    it('should fact-check statements with sources', async () => {
      const result = await perplexityService.factCheck(
        'TypeScript was created by Microsoft'
      );
      
      expect(result.verdict).toBeDefined();
      expect(['true', 'false', 'partially-true', 'unverifiable'])
        .toContain(result.verdict);
      expect(result.sources).toBeInstanceOf(Array);
    });
  });
  
  describe('Blog Generation', () => {
    it('should generate blog with research and citations', async () => {
      const blog = await perplexityService.generateBlogWithResearch(
        'AI in Healthcare',
        { vertical: 'healthcare' }
      );
      
      expect(blog.title).toBeDefined();
      expect(blog.content).toBeDefined();
      expect(blog.sources).toBeInstanceOf(Array);
      expect(blog.sources.length).toBeGreaterThan(0);
    });
  });
});
```

## 📝 REQUIRED DELIVERABLES

### 1. Progress Report (UPDATE CONTINUOUSLY)
**File:** `/docs/agent-reports/AGENT-3D-PROGRESS.md`
- Document every file created
- Track TypeScript errors before/after
- Note API documentation findings
- Record all test results

### 2. Implementation Report (AT COMPLETION)
**File:** `/docs/agent-reports/AGENT-3D-IMPLEMENTATION.md`
- Summary of what was implemented
- API endpoints created
- Research capabilities available
- Citation handling details

### 3. Update Master Progress Log
Add to `/MASTER_PROGRESS_LOG.md` when complete

## 🔍 TESTING REQUIREMENTS

1. **TypeScript Compliance:**
```bash
npm run type-check  # MUST show same or fewer errors than baseline
```

2. **Service Tests:**
```bash
npm test -- perplexity.test.ts
```

3. **API Tests:**
```bash
# Test research endpoint
curl -X POST http://localhost:4000/api/perplexity/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "Latest AI developments"}'
```

## ⚠️ CRITICAL REMINDERS

1. **MD Rule:** Document EVERYTHING in .md files
2. **Check Docs:** Verify latest Perplexity API information
3. **TypeScript:** NO new errors allowed
4. **Database Keys:** Use providerSettings table, NOT env vars
5. **Research Focus:** Perplexity excels at real-time research
6. **Progress Updates:** Update progress file every 30 minutes

## 🚫 DO NOT

1. Use outdated API endpoints
2. Skip checking official documentation
3. Try to implement image generation (not supported)
4. Use API keys from environment variables
5. Introduce TypeScript errors
6. Forget to document in .md files

## 💡 IMPORTANT NOTES

### Real-Time Search
- Perplexity has access to current web information
- Citations are included in responses
- Excellent for fact-checking and research

### Model Selection
- Sonar models have online search capability
- Use larger models for complex research
- Smaller models for quick lookups

### Rate Limits
- Check official docs for current limits
- Implement proper retry logic
- Track usage to avoid hitting limits

---

**REMEMBER: Check official docs and document everything in .md files!**