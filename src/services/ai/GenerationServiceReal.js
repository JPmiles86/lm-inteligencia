// Real Generation Service with OpenAI Integration
import pg from 'pg';
const { Pool } = pg;

export class GenerationService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  // Helper to get style guides by IDs
  async getStyleGuidesByIds(guideIds) {
    if (!guideIds || guideIds.length === 0) return [];
    
    try {
      const placeholders = guideIds.map((_, i) => `$${i + 1}`).join(',');
      const query = `
        SELECT id, type, name, content, description 
        FROM style_guides 
        WHERE id::text IN (${placeholders})
      `;
      
      const result = await this.pool.query(query, guideIds);
      return result.rows;
    } catch (error) {
      console.error('Error fetching style guides:', error);
      return [];
    }
  }

  // Build context from style guides
  async buildContextFromGuides(styleGuideIds) {
    const guides = await this.getStyleGuidesByIds(styleGuideIds);
    
    if (guides.length === 0) return '';
    
    let context = '## Style Guidelines\n\n';
    
    guides.forEach(guide => {
      context += `### ${guide.name}\n`;
      if (guide.description) {
        context += `${guide.description}\n\n`;
      }
      context += `${guide.content}\n\n`;
    });
    
    return context;
  }

  // Main generation method
  async generateContent(config) {
    const startTime = Date.now();
    
    try {
      // Extract configuration
      const {
        prompt,
        context = {},
        provider = 'openai',
        model = 'gpt-4o',
        temperature = 0.7,
        maxTokens = 4000,
        mode = 'quick',
        task = 'blog',
        vertical = 'hospitality'
      } = config;

      // Build context from style guides
      let fullContext = '';
      
      // Add style guides context
      if (context.styleGuides) {
        const allGuideIds = [];
        
        // Collect all guide IDs
        if (context.styleGuides.vertical && Array.isArray(context.styleGuides.vertical)) {
          allGuideIds.push(...context.styleGuides.vertical);
        }
        if (context.styleGuides.persona && Array.isArray(context.styleGuides.persona)) {
          allGuideIds.push(...context.styleGuides.persona);
        }
        if (context.styleGuides.writingStyle && Array.isArray(context.styleGuides.writingStyle)) {
          allGuideIds.push(...context.styleGuides.writingStyle);
        }
        
        // Get brand guide if specified
        if (context.styleGuides.brand === true) {
          // Fetch the active brand guide
          const brandQuery = `
            SELECT id FROM style_guides 
            WHERE type = 'brand' AND active = true 
            LIMIT 1
          `;
          const brandResult = await this.pool.query(brandQuery);
          if (brandResult.rows.length > 0) {
            allGuideIds.push(brandResult.rows[0].id);
          }
        }
        
        if (allGuideIds.length > 0) {
          fullContext = await this.buildContextFromGuides(allGuideIds);
        }
      }
      
      // Add additional context
      if (context.additionalContext) {
        fullContext += `\n## Additional Instructions\n${context.additionalContext}\n`;
      }

      // Build the system prompt based on task
      let systemPrompt = `You are an expert content creator specializing in ${vertical} industry content.`;
      
      if (fullContext) {
        systemPrompt += `\n\nPlease follow these style guidelines and context:\n\n${fullContext}`;
      }

      // Build the user prompt based on task
      let userPrompt = '';
      
      if (task === 'blog') {
        userPrompt = `Create a comprehensive blog post about "${prompt}" for the ${vertical} industry.

Please provide the content in the following JSON format:
{
  "title": "Engaging blog title",
  "slug": "url-friendly-slug",
  "synopsis": "Brief 2-3 sentence summary of the blog post",
  "content": "Full blog content in markdown format with proper headings, paragraphs, and formatting",
  "tags": ["relevant", "tags", "for", "the", "post"],
  "metaTitle": "SEO optimized title (60 chars max)",
  "metaDescription": "SEO meta description (160 chars max)",
  "keywords": ["seo", "keywords"],
  "readingTime": "estimated reading time in minutes",
  "targetAudience": "primary audience for this content"
}

Make the content engaging, informative, and valuable for readers in the ${vertical} industry.`;
      } else {
        userPrompt = prompt;
      }

      // Make the actual API call to OpenAI
      const openaiApiKey = process.env.OPENAI_API_KEY;
      
      if (!openaiApiKey) {
        console.error('OpenAI API key not configured');
        return {
          success: false,
          error: 'OpenAI API key not configured',
          generation: null
        };
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          response_format: task === 'blog' ? { type: 'json_object' } : undefined
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error('OpenAI API error:', errorData);
        return {
          success: false,
          error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
          generation: null
        };
      }

      const data = await openaiResponse.json();
      const generatedContent = data.choices[0].message.content;
      
      // Parse the response based on task type
      let finalContent;
      
      if (task === 'blog') {
        try {
          // Parse JSON response for blog
          finalContent = JSON.parse(generatedContent);
        } catch (parseError) {
          console.error('Error parsing blog JSON:', parseError);
          // Fallback to raw content
          finalContent = {
            title: prompt,
            content: generatedContent,
            synopsis: 'AI generated content',
            tags: [],
            metaTitle: prompt.substring(0, 60),
            metaDescription: 'AI generated blog post',
            keywords: []
          };
        }
      } else {
        finalContent = generatedContent;
      }

      const endTime = Date.now();
      
      // Calculate costs (approximate)
      const tokensUsed = data.usage?.total_tokens || 0;
      const costPerToken = model === 'gpt-4o' ? 0.00003 : 0.000002; // Rough estimates
      const cost = tokensUsed * costPerToken;

      return {
        success: true,
        generation: finalContent,
        tokensUsed: tokensUsed,
        cost: cost,
        durationMs: endTime - startTime,
        model: model,
        provider: provider
      };

    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error.message,
        generation: null,
        tokensUsed: 0,
        cost: 0,
        durationMs: Date.now() - startTime
      };
    }
  }

  // Generate variations of existing content
  async generateVariations(config) {
    const { baseContent, count = 3, variationType = 'tone' } = config;
    
    const variations = [];
    for (let i = 0; i < count; i++) {
      const result = await this.generateContent({
        prompt: `Create a ${variationType} variation of this content: ${baseContent}`,
        temperature: 0.9
      });
      
      if (result.success) {
        variations.push(result.generation);
      }
    }
    
    return variations;
  }

  // Generate SEO metadata
  async generateSEOMetadata(config) {
    const { content, targetKeywords = [] } = config;
    
    const prompt = `Generate SEO metadata for this content. Target keywords: ${targetKeywords.join(', ')}
    
Content: ${content}

Provide response as JSON with: title, description, keywords array`;
    
    const result = await this.generateContent({
      prompt,
      temperature: 0.3,
      model: 'gpt-3.5-turbo'
    });
    
    if (result.success) {
      try {
        return JSON.parse(result.generation);
      } catch {
        return {
          title: 'Generated Title',
          description: 'Generated Description',
          keywords: targetKeywords
        };
      }
    }
    
    return {
      title: '',
      description: '',
      keywords: []
    };
  }

  // Enhance existing content
  async enhanceContent(config) {
    const { content, enhancements = ['clarity', 'engagement'] } = config;
    
    const prompt = `Enhance this content for better ${enhancements.join(' and ')}:
    
${content}`;
    
    const result = await this.generateContent({
      prompt,
      temperature: 0.7
    });
    
    return {
      content: result.success ? result.generation : content
    };
  }
}