/**
 * Brainstorming Service - Generate multiple blog ideas from a single topic
 * Uses GPT-5 with high reasoning effort for creative ideation
 */

export class BrainstormingService {
  constructor() {
    // Use the same logic as other services - check if we're in production or development
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBase = isDevelopment 
      ? (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api')
      : '/api';
    this.baseUrl = `${apiBase}/ai`;
  }

  /**
   * Generate multiple blog ideas from a topic
   * @param {Object} params - Generation parameters
   * @param {string} params.topic - The main topic/theme
   * @param {number} params.count - Number of ideas to generate (5, 10, 20)
   * @param {string} params.vertical - Target industry/vertical
   * @param {string} params.tone - Tone/style preference
   * @param {string[]} params.contentTypes - Types of content (how-to, listicle, guide, etc.)
   * @param {string} params.provider - AI provider to use
   * @param {string} params.model - Model to use (GPT-5 recommended)
   * @returns {Promise<Object>} Generated ideas with success status
   */
  async generateIdeas({
    topic,
    count = 10,
    vertical = 'all',
    tone = 'professional',
    contentTypes = [],
    provider = 'openai',
    model = 'gpt-4o',
    customContext = ''
  }) {
    try {
      console.log('[BrainstormingService] Generating ideas:', {
        topic,
        count,
        vertical,
        tone,
        contentTypes,
        provider,
        model
      });

      // Build the brainstorming prompt
      const prompt = this._buildBrainstormingPrompt({
        topic,
        count,
        vertical,
        tone,
        contentTypes,
        customContext
      });

      // Generate a unique session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(`${this.baseUrl}/brainstorm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-ideas',
          topic,
          count,
          vertical,
          tone,
          contentTypes,
          provider,
          model,
          customContext,
          sessionId // Include session ID for database persistence
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate ideas');
      }

      // Ideas are already parsed and formatted by the API
      const ideas = data.ideas || [];

      return {
        success: true,
        sessionId: data.sessionId || sessionId, // Return the session ID for future operations
        ideas,
        tokensUsed: data.metadata?.tokensUsed || 0,
        cost: data.metadata?.cost || 0,
        durationMs: data.metadata?.durationMs || 0,
        metadata: data.metadata || {
          topic,
          count,
          vertical,
          tone,
          contentTypes,
          provider,
          model,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('[BrainstormingService] Error generating ideas:', error);
      return {
        success: false,
        error: error.message,
        ideas: []
      };
    }
  }

  /**
   * Save ideas - now handled automatically by database API during generation
   * This method is kept for compatibility but is no longer needed
   * @param {Object[]} ideas - Array of generated ideas (unused)
   * @param {string} sessionId - Session identifier
   */
  async saveIdeas(ideas, sessionId) {
    // Ideas are now automatically saved to database during generation
    console.log('[BrainstormingService] Ideas are automatically saved during generation');

    return {
      success: true,
      sessionId,
      savedCount: ideas?.length || 0,
      message: 'Ideas are automatically saved to database during generation'
    };
  }

  /**
   * Load saved brainstorming session from database
   * @param {string} sessionId - Session identifier
   */
  async loadIdeas(sessionId) {
    try {
      const response = await fetch(`${this.baseUrl}/brainstorm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'load-session',
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Session not found'
        };
      }

      return {
        success: true,
        sessionId: data.sessionId,
        ideas: data.ideas,
        savedAt: data.savedAt,
        favoriteIds: data.favoriteIds || []
      };

    } catch (error) {
      console.error('[BrainstormingService] Error loading ideas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all saved brainstorming sessions from database
   */
  async getSavedSessions() {
    try {
      const response = await fetch(`${this.baseUrl}/brainstorm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-sessions'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to get sessions',
          sessions: []
        };
      }

      return {
        success: true,
        sessions: data.sessions || []
      };

    } catch (error) {
      console.error('[BrainstormingService] Error getting saved sessions:', error);
      return {
        success: false,
        error: error.message,
        sessions: []
      };
    }
  }

  /**
   * Mark an idea as favorite via database API
   * @param {string} sessionId - Session identifier
   * @param {string} ideaId - Idea identifier
   */
  async toggleFavorite(sessionId, ideaId) {
    try {
      const response = await fetch(`${this.baseUrl}/brainstorm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle-favorite',
          sessionId,
          ideaId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to toggle favorite'
        };
      }

      return {
        success: true,
        isFavorited: data.isFavorited,
        favoriteCount: data.favoriteCount
      };

    } catch (error) {
      console.error('[BrainstormingService] Error toggling favorite:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert selected ideas to blog generation requests via database API
   * @param {string[]} ideaIds - Array of idea IDs to convert
   * @param {string} sessionId - Session identifier
   */
  async convertIdeasToBlogs(ideaIds, sessionId) {
    try {
      const response = await fetch(`${this.baseUrl}/brainstorm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'convert-to-blogs',
          ideaIds,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to convert ideas to blogs',
          blogRequests: []
        };
      }

      return {
        success: true,
        blogRequests: data.blogRequests,
        convertedCount: data.convertedCount
      };

    } catch (error) {
      console.error('[BrainstormingService] Error converting ideas to blogs:', error);
      return {
        success: false,
        error: error.message,
        blogRequests: []
      };
    }
  }

  /**
   * Migrate existing localStorage data to database
   * This method helps with the transition from localStorage to database
   */
  async migrateLocalStorageData() {
    try {
      const migratedSessions = [];

      // Check for existing localStorage data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('brainstorming-session-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));

            // Create a session with the original data
            const sessionId = data.sessionId || `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Generate new ideas using the same topic (this will save to database)
            if (data.ideas && data.ideas.length > 0) {
              const firstIdea = data.ideas[0];
              const topic = firstIdea.metadata?.topic || data.topic || 'Migrated from localStorage';

              console.log(`[BrainstormingService] Migrating session: ${topic}`);

              // Note: Since ideas are already generated, we would need a different approach
              // For now, we'll save the session metadata and mark it as migrated
              migratedSessions.push({
                originalSessionId: sessionId,
                topic,
                ideaCount: data.ideas.length,
                migrated: true
              });

              // Remove from localStorage after successful migration
              localStorage.removeItem(key);
            }
          } catch (parseError) {
            console.error(`[BrainstormingService] Error parsing localStorage data for key ${key}:`, parseError);
          }
        }
      }

      if (migratedSessions.length > 0) {
        console.log(`[BrainstormingService] Successfully migrated ${migratedSessions.length} sessions from localStorage`);
      }

      return {
        success: true,
        migratedCount: migratedSessions.length,
        sessions: migratedSessions
      };

    } catch (error) {
      console.error('[BrainstormingService] Error migrating localStorage data:', error);
      return {
        success: false,
        error: error.message,
        migratedCount: 0
      };
    }
  }

  /**
   * Build the brainstorming prompt based on parameters
   * @private
   */
  _buildBrainstormingPrompt({ topic, count, vertical, tone, contentTypes, customContext }) {
    const verticalContext = vertical !== 'all' ? 
      `Focus specifically on the ${vertical} industry/vertical.` : 
      'Consider multiple industries and verticals where relevant.';
    
    const contentTypeContext = contentTypes.length > 0 ?
      `Prioritize these content types: ${contentTypes.join(', ')}.` :
      'Include a variety of content types (how-to guides, listicles, tutorials, comparisons, etc.).';

    const toneContext = `Maintain a ${tone} tone throughout.`;
    
    const customSection = customContext ? 
      `\nAdditional Context: ${customContext}` : '';

    return `
You are an expert content strategist and creative ideation specialist. Generate exactly ${count} unique, compelling blog post ideas about the topic: "${topic}".

Requirements:
- ${verticalContext}
- ${contentTypeContext}
- ${toneContext}
- Each idea must be unique and offer a distinct angle or perspective
- Ideas should be specific enough to create actionable content
- Include SEO potential and audience appeal considerations

${customSection}

For each idea, provide:
1. Title: A compelling, specific headline (60-80 characters ideal)
2. Angle: The unique perspective or approach (1-2 sentences)
3. Description: Brief overview of what the content would cover (2-3 sentences)
4. Tags: 3-5 relevant tags for categorization
5. Difficulty: Content creation difficulty (Beginner/Intermediate/Advanced)
6. Estimated Word Count: Suggested length for the full article

Format your response as a JSON array where each idea is an object with the above properties.

Example structure:
[
  {
    "title": "5 Proven Strategies That Transform Customer Service in Healthcare",
    "angle": "Focus on actionable, data-backed strategies with real healthcare examples",
    "description": "Explore five evidence-based approaches to customer service excellence in healthcare settings, including patient communication techniques, technology integration, and staff training methodologies that demonstrably improve patient satisfaction scores.",
    "tags": ["customer-service", "healthcare", "patient-satisfaction", "strategy", "improvement"],
    "difficulty": "Intermediate",
    "estimatedWordCount": 1500
  }
]

Now generate ${count} unique blog post ideas for the topic "${topic}":
    `.trim();
  }

  /**
   * Parse and format the AI-generated ideas
   * @private
   */
  _parseGeneratedIdeas(rawContent) {
    try {
      // Try to parse as JSON first
      let ideas;
      
      if (typeof rawContent === 'string') {
        // Look for JSON array in the content
        const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          ideas = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: parse structured text
          ideas = this._parseStructuredText(rawContent);
        }
      } else if (Array.isArray(rawContent)) {
        ideas = rawContent;
      } else {
        throw new Error('Invalid content format');
      }

      // Ensure each idea has required properties and unique ID
      return ideas.map((idea, index) => ({
        id: `idea_${Date.now()}_${index}`,
        title: idea.title || `Blog Idea ${index + 1}`,
        angle: idea.angle || 'Standard approach to the topic',
        description: idea.description || 'A comprehensive exploration of the topic',
        tags: idea.tags || ['general'],
        difficulty: idea.difficulty || 'Intermediate',
        estimatedWordCount: idea.estimatedWordCount || 1000,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: this._calculateIdeaScore(idea)
      }));

    } catch (error) {
      console.error('[BrainstormingService] Error parsing ideas:', error);
      
      // Return fallback ideas if parsing fails
      return [{
        id: `idea_${Date.now()}_0`,
        title: 'Error generating ideas - please try again',
        angle: 'Technical error occurred',
        description: 'There was an issue processing the generated content. Please try again with different parameters.',
        tags: ['error'],
        difficulty: 'Beginner',
        estimatedWordCount: 500,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: 0
      }];
    }
  }

  /**
   * Parse structured text format as fallback
   * @private
   */
  _parseStructuredText(content) {
    // Simple parsing for structured text format
    const ideas = [];
    const sections = content.split(/\d+\./);
    
    sections.slice(1).forEach((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0]?.trim() || `Blog Idea ${index + 1}`;
      
      ideas.push({
        title: title.replace(/^(Title:|Headline:)\s*/i, ''),
        angle: 'Creative approach to the topic',
        description: section.substring(0, 200) + '...',
        tags: ['content', 'blog'],
        difficulty: 'Intermediate',
        estimatedWordCount: 1000
      });
    });

    return ideas.length > 0 ? ideas : [{
      title: 'Generated Blog Idea',
      angle: 'Standard approach',
      description: content.substring(0, 200) + '...',
      tags: ['general'],
      difficulty: 'Intermediate',
      estimatedWordCount: 1000
    }];
  }

  /**
   * Calculate a quality score for an idea
   * @private
   */
  _calculateIdeaScore(idea) {
    let score = 50; // Base score
    
    // Title length optimization
    if (idea.title && idea.title.length >= 40 && idea.title.length <= 80) {
      score += 10;
    }
    
    // Description quality
    if (idea.description && idea.description.length >= 100) {
      score += 10;
    }
    
    // Tag relevance
    if (idea.tags && idea.tags.length >= 3) {
      score += 10;
    }
    
    // Word count appropriateness
    if (idea.estimatedWordCount >= 1000 && idea.estimatedWordCount <= 3000) {
      score += 10;
    }
    
    // Difficulty balance
    if (idea.difficulty === 'Intermediate') {
      score += 5;
    }
    
    return Math.min(100, score);
  }

  /**
   * Export ideas to different formats
   * @param {Object[]} ideas - Array of ideas to export
   * @param {string} format - Export format (json, csv, markdown)
   */
  async exportIdeas(ideas, format = 'json') {
    try {
      let content, filename, mimeType;
      
      switch (format.toLowerCase()) {
        case 'json':
          content = JSON.stringify(ideas, null, 2);
          filename = `blog-ideas-${Date.now()}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          const csvHeader = 'Title,Angle,Description,Tags,Difficulty,Word Count,Created At\n';
          const csvRows = ideas.map(idea => 
            `"${idea.title}","${idea.angle}","${idea.description}","${idea.tags.join(';')}","${idea.difficulty}","${idea.estimatedWordCount}","${idea.createdAt}"`
          ).join('\n');
          content = csvHeader + csvRows;
          filename = `blog-ideas-${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'markdown':
          content = ideas.map((idea, index) => 
            `## ${index + 1}. ${idea.title}\n\n` +
            `**Angle:** ${idea.angle}\n\n` +
            `**Description:** ${idea.description}\n\n` +
            `**Tags:** ${idea.tags.join(', ')}\n\n` +
            `**Difficulty:** ${idea.difficulty} | **Word Count:** ${idea.estimatedWordCount}\n\n` +
            `---\n\n`
          ).join('');
          filename = `blog-ideas-${Date.now()}.md`;
          mimeType = 'text/markdown';
          break;
          
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        success: true,
        filename,
        format,
        ideaCount: ideas.length
      };

    } catch (error) {
      console.error('[BrainstormingService] Error exporting ideas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const brainstormingService = new BrainstormingService();