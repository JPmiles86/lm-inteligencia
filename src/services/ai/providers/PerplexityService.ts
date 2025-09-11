import { db } from '../../../db/index.js';
import { providerSettings } from '../../../db/schema.js';
// TODO: Frontend should not decrypt - get decrypted keys from backend API
// import { decrypt } from '../../../../api/utils/encryption';
import { eq } from 'drizzle-orm';

export interface PerplexityConfig {
  model?: 'sonar' | 
          'sonar-reasoning' | 
          'sonar-deep-research' |
          'llama-3.1-sonar-small-128k-online' |
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
  returnRelatedQuestions?: boolean;
  searchDomainFilter?: string[];
  searchRecencyFilter?: 'month' | 'week' | 'day' | 'hour';
  searchAfterDateFilter?: string; // MM/DD/YYYY format
  searchBeforeDateFilter?: string; // MM/DD/YYYY format
  webSearchOptions?: {
    latitude?: number;
    longitude?: number;
    countryCode?: string;
  };
}

interface Citation {
  title: string;
  url: string;
  date?: string;
  snippet?: string;
  index?: number;
}

interface SearchResult {
  title: string;
  url: string;
  date?: string;
  snippet?: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size?: number;
    citation_tokens?: number;
    num_search_queries?: number;
    reasoning_tokens?: number;
  };
  search_results?: SearchResult[];
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
      
      // TODO: Frontend should not decrypt - security issue
      // this.apiKey = decrypt(settings[0].apiKeyEncrypted, settings[0].encryptionSalt || '');
      this.apiKey = settings[0].apiKeyEncrypted || '';
      
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
    relatedQuestions?: string[];
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      searchQueries?: number;
    };
  }> {
    if (!this.apiKey) await this.initialize();
    
    const defaultConfig: PerplexityConfig = {
      model: 'llama-3.1-sonar-large-128k-online',
      temperature: 0.2, // Lower for factual research
      maxTokens: 4000,
      topP: 0.9,
      returnCitations: true,
      returnImages: false,
      returnRelatedQuestions: false
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const requestBody: any = {
        model: finalConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful research assistant with access to current web information. Always provide accurate, well-sourced information with proper citations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        top_p: finalConfig.topP,
        return_citations: finalConfig.returnCitations,
        return_images: finalConfig.returnImages,
        return_related_questions: finalConfig.returnRelatedQuestions
      };

      // Add optional parameters if provided
      if (finalConfig.topK) requestBody.top_k = finalConfig.topK;
      if (finalConfig.presencePenalty) requestBody.presence_penalty = finalConfig.presencePenalty;
      if (finalConfig.frequencyPenalty) requestBody.frequency_penalty = finalConfig.frequencyPenalty;
      if (finalConfig.searchDomainFilter) requestBody.search_domain_filter = finalConfig.searchDomainFilter;
      if (finalConfig.searchRecencyFilter) requestBody.search_recency_filter = finalConfig.searchRecencyFilter;
      if (finalConfig.searchAfterDateFilter) requestBody.search_after_date_filter = finalConfig.searchAfterDateFilter;
      if (finalConfig.searchBeforeDateFilter) requestBody.search_before_date_filter = finalConfig.searchBeforeDateFilter;
      if (finalConfig.webSearchOptions) requestBody.web_search_options = finalConfig.webSearchOptions;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }
      
      const data: PerplexityResponse = await response.json();
      
      const result: {
        content: string;
        citations?: Citation[];
        images?: string[];
        relatedQuestions?: string[];
        usage?: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
          searchQueries?: number;
        };
      } = {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
          searchQueries: data.usage.num_search_queries
        }
      };

      // Add citations if available
      if (data.search_results && data.search_results.length > 0) {
        result.citations = data.search_results.map((result, index) => ({
          title: result.title,
          url: result.url,
          date: result.date,
          snippet: result.snippet,
          index: index + 1
        }));
      }

      return result;
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
      location?: {
        latitude: number;
        longitude: number;
        countryCode: string;
      };
    } = {}
  ): Promise<{
    summary: string;
    keyPoints: string[];
    sources: Citation[];
    relatedTopics: string[];
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      searchQueries?: number;
    };
  }> {
    const depthPrompts = {
      quick: 'Provide a brief overview with key facts',
      standard: 'Provide a comprehensive summary with important details',
      deep: 'Provide an in-depth analysis with multiple perspectives, current trends, and implications'
    };
    
    const modelMap = {
      quick: 'sonar' as const,
      standard: 'sonar-reasoning' as const,
      deep: 'sonar-deep-research' as const
    };
    
    const prompt = `${depthPrompts[options.depth || 'standard']} about: ${topic}
    
    Please structure your response with:
    1. A comprehensive summary
    2. 5-7 key points (use bullet points)
    3. Related topics for further research (list at the end)
    
    Focus on the most recent and authoritative information available. Provide proper citations for all claims.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: modelMap[options.depth || 'standard'],
        temperature: 0.1, // Very low for factual accuracy
        maxTokens: options.depth === 'deep' ? 6000 : 4000,
        returnCitations: true,
        returnRelatedQuestions: true,
        searchRecencyFilter: options.recency,
        searchDomainFilter: options.domains,
        webSearchOptions: options.location
      });
      
      // Parse structured response
      const keyPoints = this.extractKeyPoints(result.content);
      const relatedTopics = this.extractRelatedTopics(result.content);
      
      return {
        summary: result.content,
        keyPoints,
        sources: result.citations || [],
        relatedTopics,
        usage: result.usage
      };
    } catch (error) {
      console.error('Perplexity research failed:', error);
      throw error;
    }
  }
  
  async factCheck(
    statement: string
  ): Promise<{
    verdict: 'true' | 'false' | 'partially-true' | 'unverifiable' | 'misleading';
    explanation: string;
    sources: Citation[];
    confidence: number;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      searchQueries?: number;
    };
  }> {
    const prompt = `Fact-check this statement: "${statement}"
    
    Please provide:
    1. A clear verdict: TRUE, FALSE, PARTIALLY TRUE, UNVERIFIABLE, or MISLEADING
    2. Detailed explanation with evidence from reliable sources
    3. Confidence level (0-100%)
    
    Be objective and cite authoritative, recent sources. Focus on verifiable facts.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'sonar-reasoning',
        temperature: 0.0, // Minimal creativity for factual accuracy
        returnCitations: true,
        searchRecencyFilter: 'month' // Recent information preferred
      });
      
      const verdict = this.extractVerdict(result.content);
      const confidence = this.extractConfidence(result.content);
      
      return {
        verdict,
        explanation: result.content,
        sources: result.citations || [],
        confidence,
        usage: result.usage
      };
    } catch (error) {
      console.error('Perplexity fact check failed:', error);
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
      targetLength?: 'short' | 'medium' | 'long';
    } = {}
  ): Promise<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    imagePrompts: string[];
    sources: Citation[];
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      searchQueries?: number;
    };
  }> {
    // First, research the topic comprehensively
    const research = await this.research(topic, {
      depth: 'deep',
      recency: 'week'
    });
    
    const lengthMap = {
      short: '800-1200 words',
      medium: '1500-2000 words',
      long: '2500-3500 words'
    };
    
    // Then generate blog content with research
    const prompt = `Write a comprehensive, well-researched blog post about: ${topic}

    Use this research as your foundation:
    ${research.summary}

    Key Points to incorporate:
    ${research.keyPoints.map(point => `• ${point}`).join('\n')}

    Context:
    ${context.brand ? `Brand: ${context.brand}` : ''}
    ${context.vertical ? `Industry: ${context.vertical}` : ''}
    ${context.persona ? `Target audience: ${context.persona}` : ''}
    ${context.writingStyle ? `Writing style: ${context.writingStyle}` : ''}
    
    Requirements:
    1. SEO-optimized title (60 characters or less)
    2. Compelling excerpt (150-160 characters)
    3. ${lengthMap[context.targetLength || 'medium']} of engaging, well-structured content
    4. Naturally integrate citations throughout the text
    5. 5-7 relevant SEO tags
    6. 3-4 image prompts formatted as [IMAGE_PROMPT: detailed description]
    
    Structure the content with proper headings, subheadings, and make it engaging for readers while maintaining accuracy.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'llama-3.1-sonar-large-128k-online',
        temperature: 0.7, // Higher creativity for engaging content
        maxTokens: 8000,
        returnCitations: true
      });
      
      // Extract structured elements
      const title = this.extractTitle(result.content);
      const excerpt = this.extractExcerpt(result.content);
      const tags = this.extractTags(result.content);
      const imagePrompts = this.extractImagePrompts(result.content);
      
      // Combine citations from research and blog generation
      const allSources = [
        ...research.sources,
        ...(result.citations || [])
      ];
      
      // Remove duplicates based on URL
      const uniqueSources = allSources.filter((source, index, array) => 
        array.findIndex(s => s.url === source.url) === index
      );
      
      const totalUsage = {
        promptTokens: (research.usage?.promptTokens || 0) + (result.usage?.promptTokens || 0),
        completionTokens: (research.usage?.completionTokens || 0) + (result.usage?.completionTokens || 0),
        totalTokens: (research.usage?.totalTokens || 0) + (result.usage?.totalTokens || 0),
        searchQueries: (research.usage?.searchQueries || 0) + (result.usage?.searchQueries || 0)
      };
      
      return {
        title: title || `Complete Guide to ${topic}`,
        content: result.content,
        excerpt: excerpt || `Discover the latest insights and expert analysis on ${topic} with comprehensive research and practical takeaways.`,
        tags: tags.length > 0 ? tags : [topic.toLowerCase().replace(/\s+/g, '-')],
        imagePrompts: imagePrompts.length > 0 ? imagePrompts : [`Professional illustration representing ${topic}`, `Infographic showing key statistics about ${topic}`, `Modern workspace scene related to ${topic}`],
        sources: uniqueSources,
        usage: totalUsage
      };
    } catch (error) {
      console.error('Perplexity blog generation with research failed:', error);
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
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      searchQueries?: number;
    };
  }> {
    const prompt = `Compare and contrast: ${items.join(' vs ')}
    
    Provide a comprehensive analysis including:
    1. Detailed comparison overview
    2. Key differences (list with bullet points)
    3. Key similarities (list with bullet points)  
    4. Recommendation based on different use cases
    
    Use current, factual information with proper citations from reliable sources.`;
    
    try {
      const result = await this.generateText(prompt, {
        model: 'sonar-reasoning',
        temperature: 0.3, // Balanced for analytical content
        returnCitations: true
      });
      
      return {
        comparison: result.content,
        differences: this.extractListItems(result.content, 'differences'),
        similarities: this.extractListItems(result.content, 'similarities'),
        recommendation: this.extractRecommendation(result.content),
        sources: result.citations || [],
        usage: result.usage
      };
    } catch (error) {
      console.error('Perplexity comparison failed:', error);
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
      const requestBody: any = {
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
      };

      // Add optional streaming parameters
      if (config.returnCitations) requestBody.return_citations = true;
      if (config.searchDomainFilter) requestBody.search_domain_filter = config.searchDomainFilter;
      if (config.searchRecencyFilter) requestBody.search_recency_filter = config.searchRecencyFilter;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Perplexity streaming failed:', error);
      throw error;
    }
  }
  
  // Helper methods for parsing structured responses
  private extractKeyPoints(content: string): string[] {
    const regex = /(?:^|\n)[\*\-\•\d]+\.?\s+(.+)/gm;
    const points: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null && points.length < 7) {
      const point = match[1].trim();
      if (point.length > 10) { // Filter out very short matches
        points.push(point);
      }
    }
    
    return points;
  }
  
  private extractRelatedTopics(content: string): string[] {
    const regex = /related.*?topics?:?\s*([\s\S]*?)(?:\n\n|$)/i;
    const match = content.match(regex);
    
    if (match) {
      return this.extractKeyPoints(match[1]).slice(0, 5);
    }
    
    return [];
  }
  
  private extractVerdict(content: string): 'true' | 'false' | 'partially-true' | 'unverifiable' | 'misleading' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('misleading')) {
      return 'misleading';
    } else if (lowerContent.includes('partially') || lowerContent.includes('partly')) {
      return 'partially-true';
    } else if (lowerContent.includes('true') && !lowerContent.includes('false')) {
      return 'true';
    } else if (lowerContent.includes('false')) {
      return 'false';
    } else {
      return 'unverifiable';
    }
  }

  private extractConfidence(content: string): number {
    const regex = /confidence.*?(\d+)%/i;
    const match = content.match(regex);
    
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Default confidence based on verdict keywords
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('certain') || lowerContent.includes('definitely')) {
      return 90;
    } else if (lowerContent.includes('likely') || lowerContent.includes('probably')) {
      return 75;
    } else if (lowerContent.includes('possible') || lowerContent.includes('might')) {
      return 50;
    } else {
      return 70; // Default moderate confidence
    }
  }
  
  private extractTitle(content: string): string | null {
    // Look for markdown headers or explicit title formatting
    const titleRegex = /^#\s+(.+)$|title:\s*(.+)$/im;
    const match = content.match(titleRegex);
    
    if (match) {
      return (match[1] || match[2]).trim();
    }
    
    return null;
  }
  
  private extractExcerpt(content: string): string | null {
    // Look for explicit excerpt or take first paragraph
    const excerptRegex = /excerpt:\s*(.+)$/im;
    const match = content.match(excerptRegex);
    
    if (match) {
      return match[1].trim();
    }
    
    // Fallback: first paragraph under 200 characters
    const paragraphs = content.split('\n\n');
    for (const paragraph of paragraphs) {
      const clean = paragraph.replace(/^#+\s+/, '').trim();
      if (clean.length > 50 && clean.length <= 200) {
        return clean;
      }
    }
    
    return null;
  }
  
  private extractTags(content: string): string[] {
    const tagsRegex = /tags?:\s*(.+)$/im;
    const match = content.match(tagsRegex);
    
    if (match) {
      return match[1]
        .split(/[,\s]+/)
        .map(tag => tag.trim().replace(/^#/, ''))
        .filter(tag => tag.length > 0)
        .slice(0, 7);
    }
    
    return [];
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
          model: 'sonar',
          messages: [
            {
              role: 'user',
              content: 'Hello'
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