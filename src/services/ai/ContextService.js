// Context Service - Manages context building and optimization for AI generations
// Handles style guides, previous content, and context assembly

import { aiRepository } from '../../repositories/aiRepository.js';

export class ContextService {
  constructor() {
    this.contextCache = new Map();
    this.maxCacheSize = 100;
    this.maxCacheAge = 30 * 60 * 1000; // 30 minutes
  }

  // ================================
  // CONTEXT BUILDING
  // ================================

  async buildContext(contextConfig) {
    if (!contextConfig) {
      return null;
    }

    const cacheKey = this.buildCacheKey(contextConfig);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const context = {
      styleGuides: null,
      previousContent: null,
      referenceImages: null,
      customContext: null,
      metadata: {
        totalTokens: 0,
        cacheKey,
        builtAt: new Date().toISOString()
      }
    };

    // Build style guides context
    if (contextConfig.styleGuides) {
      context.styleGuides = await this.buildStyleGuidesContext(contextConfig.styleGuides);
      context.metadata.totalTokens += this.estimateTokens(context.styleGuides);
    }

    // Build previous content context
    if (contextConfig.previousContent) {
      context.previousContent = await this.buildPreviousContentContext(contextConfig.previousContent);
      context.metadata.totalTokens += this.estimateTokens(context.previousContent);
    }

    // Build reference images context
    if (contextConfig.referenceImages) {
      context.referenceImages = await this.buildReferenceImagesContext(contextConfig.referenceImages);
    }

    // Add custom context
    if (contextConfig.customContext) {
      context.customContext = contextConfig.customContext;
      context.metadata.totalTokens += this.estimateTokens(context.customContext);
    }

    // Assemble final context string
    const finalContext = this.assembleContext(context);
    
    // Cache the result
    this.cacheContext(cacheKey, finalContext, context.metadata);
    
    return finalContext;
  }

  // ================================
  // STYLE GUIDES CONTEXT
  // ================================

  async buildStyleGuidesContext(styleGuidesConfig) {
    const contexts = [];
    
    try {
      // Brand guide
      if (styleGuidesConfig.brand) {
        const brandGuide = await aiRepository.getStyleGuide('brand');
        if (brandGuide) {
          contexts.push(`## Brand Guide\n${brandGuide.content}`);
        }
      }

      // Vertical guides
      if (styleGuidesConfig.vertical && styleGuidesConfig.vertical.length > 0) {
        for (const vertical of styleGuidesConfig.vertical) {
          const verticalGuide = await aiRepository.getStyleGuide('vertical', vertical);
          if (verticalGuide) {
            contexts.push(`## ${vertical.charAt(0).toUpperCase() + vertical.slice(1)} Industry Guide\n${verticalGuide.content}`);
          }
        }
      }

      // Writing style guides
      if (styleGuidesConfig.writingStyle && styleGuidesConfig.writingStyle.length > 0) {
        for (const styleId of styleGuidesConfig.writingStyle) {
          const styleGuide = await aiRepository.getStyleGuideById(styleId);
          if (styleGuide) {
            contexts.push(`## ${styleGuide.name} Style\n${styleGuide.content}`);
          }
        }
      }

      // Persona guides
      if (styleGuidesConfig.persona && styleGuidesConfig.persona.length > 0) {
        for (const personaId of styleGuidesConfig.persona) {
          const personaGuide = await aiRepository.getStyleGuideById(personaId);
          if (personaGuide) {
            contexts.push(`## ${personaGuide.name} Persona\n${personaGuide.content}`);
          }
        }
      }

    } catch (error) {
      console.error('Error building style guides context:', error);
    }

    return contexts.length > 0 ? contexts.join('\n\n') : null;
  }

  // ================================
  // PREVIOUS CONTENT CONTEXT
  // ================================

  async buildPreviousContentContext(previousContentConfig) {
    const { mode, verticalFilter, items, includeElements } = previousContentConfig;
    
    if (mode === 'none') {
      return null;
    }

    try {
      let blogPosts = [];

      switch (mode) {
        case 'all':
          blogPosts = await aiRepository.getAllBlogs({ limit: 50 });
          break;
        
        case 'vertical':
          if (verticalFilter) {
            blogPosts = await aiRepository.getBlogsByVertical(verticalFilter, { limit: 20 });
          }
          break;
        
        case 'selected':
          if (items && items.length > 0) {
            blogPosts = await aiRepository.getBlogsByIds(items);
          }
          break;
      }

      if (blogPosts.length === 0) {
        return null;
      }

      return this.formatPreviousContent(blogPosts, includeElements || {});

    } catch (error) {
      console.error('Error building previous content context:', error);
      return null;
    }
  }

  formatPreviousContent(blogPosts, includeElements) {
    const contentParts = [];
    
    blogPosts.forEach((post, index) => {
      const postParts = [`## Previous Blog ${index + 1}`];
      
      if (includeElements.titles && post.title) {
        postParts.push(`**Title:** ${post.title}`);
      }
      
      if (includeElements.synopsis && post.synopsis) {
        postParts.push(`**Synopsis:** ${post.synopsis}`);
      }
      
      if (includeElements.tags && post.tags) {
        const tags = Array.isArray(post.tags) ? post.tags.join(', ') : post.tags;
        postParts.push(`**Tags:** ${tags}`);
      }
      
      if (includeElements.content && post.content) {
        // Truncate long content to avoid context overflow
        const truncatedContent = post.content.length > 1000 
          ? post.content.substring(0, 1000) + '...'
          : post.content;
        postParts.push(`**Content Preview:**\n${truncatedContent}`);
      }
      
      if (includeElements.metadata && post.metadata) {
        postParts.push(`**Metadata:** ${JSON.stringify(post.metadata)}`);
      }
      
      contentParts.push(postParts.join('\n\n'));
    });
    
    return contentParts.join('\n\n---\n\n');
  }

  // ================================
  // REFERENCE IMAGES CONTEXT
  // ================================

  async buildReferenceImagesContext(referenceImagesConfig) {
    const contexts = [];
    
    try {
      // Style reference images
      if (referenceImagesConfig.style && referenceImagesConfig.style.length > 0) {
        const styleImages = await aiRepository.getReferenceImages('style', referenceImagesConfig.style);
        if (styleImages.length > 0) {
          const descriptions = styleImages.map(img => img.description || 'Style reference').join(', ');
          contexts.push(`**Style References:** ${descriptions}`);
        }
      }
      
      // Logo reference images
      if (referenceImagesConfig.logo && referenceImagesConfig.logo.length > 0) {
        const logoImages = await aiRepository.getReferenceImages('logo', referenceImagesConfig.logo);
        if (logoImages.length > 0) {
          const descriptions = logoImages.map(img => img.description || 'Brand logo').join(', ');
          contexts.push(`**Brand Assets:** ${descriptions}`);
        }
      }
      
      // Persona reference images
      if (referenceImagesConfig.persona && referenceImagesConfig.persona.length > 0) {
        const personaImages = await aiRepository.getReferenceImages('persona', referenceImagesConfig.persona);
        if (personaImages.length > 0) {
          const descriptions = personaImages.map(img => img.description || 'Character reference').join(', ');
          contexts.push(`**Character References:** ${descriptions}`);
        }
      }
      
    } catch (error) {
      console.error('Error building reference images context:', error);
    }
    
    return contexts.length > 0 ? contexts.join('\n\n') : null;
  }

  // ================================
  // CONTEXT ASSEMBLY
  // ================================

  assembleContext(contextObj) {
    const parts = [];
    
    if (contextObj.styleGuides) {
      parts.push(`# Style Guidelines\n\n${contextObj.styleGuides}`);
    }
    
    if (contextObj.previousContent) {
      parts.push(`# Previous Content Examples\n\n${contextObj.previousContent}`);
    }
    
    if (contextObj.referenceImages) {
      parts.push(`# Visual References\n\n${contextObj.referenceImages}`);
    }
    
    if (contextObj.customContext) {
      parts.push(`# Additional Context\n\n${contextObj.customContext}`);
    }
    
    return parts.length > 0 ? parts.join('\n\n---\n\n') : null;
  }

  // ================================
  // CONTEXT OPTIMIZATION
  // ================================

  async optimizeContext(context, maxTokens = 50000) {
    if (!context) return null;
    
    const estimatedTokens = this.estimateTokens(context);
    
    if (estimatedTokens <= maxTokens) {
      return context;
    }
    
    console.warn(`Context too large (${estimatedTokens} tokens), optimizing...`);
    
    // Strategy 1: Truncate previous content
    let optimizedContext = context.replace(
      /## Previous Blog \d+[\s\S]*?(?=## Previous Blog \d+|$)/g,
      (match) => {
        if (match.length > 2000) {
          return match.substring(0, 2000) + '\n\n[Content truncated...]';
        }
        return match;
      }
    );
    
    // Strategy 2: Remove less important sections if still too large
    if (this.estimateTokens(optimizedContext) > maxTokens) {
      optimizedContext = optimizedContext
        .replace(/# Visual References[\s\S]*?(?=---|$)/, '')
        .replace(/# Additional Context[\s\S]*?(?=---|$)/, '');
    }
    
    // Strategy 3: Truncate overall if still too large
    if (this.estimateTokens(optimizedContext) > maxTokens) {
      const targetLength = Math.floor(optimizedContext.length * (maxTokens / this.estimateTokens(optimizedContext)));
      optimizedContext = optimizedContext.substring(0, targetLength) + '\n\n[Context truncated due to size limits...]';
    }
    
    return optimizedContext;
  }

  // ================================
  // CACHING
  // ================================

  buildCacheKey(contextConfig) {
    return JSON.stringify({
      styleGuides: contextConfig.styleGuides || {},
      previousContent: contextConfig.previousContent || {},
      referenceImages: contextConfig.referenceImages || {},
      customContext: contextConfig.customContext ? 
        contextConfig.customContext.substring(0, 100) : null
    });
  }

  getFromCache(cacheKey) {
    const cached = this.contextCache.get(cacheKey);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.maxCacheAge;
    if (isExpired) {
      this.contextCache.delete(cacheKey);
      return null;
    }
    
    return cached.context;
  }

  cacheContext(cacheKey, context, metadata) {
    // Clean old entries if cache is full
    if (this.contextCache.size >= this.maxCacheSize) {
      const oldestKey = this.contextCache.keys().next().value;
      this.contextCache.delete(oldestKey);
    }
    
    this.contextCache.set(cacheKey, {
      context,
      metadata,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.contextCache.clear();
  }

  // ================================
  // UTILITIES
  // ================================

  estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async getContextStats() {
    return {
      cacheSize: this.contextCache.size,
      maxCacheSize: this.maxCacheSize,
      entries: Array.from(this.contextCache.entries()).map(([key, value]) => ({
        key: key.substring(0, 50) + '...',
        tokens: value.metadata?.totalTokens || 0,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }

  // ================================
  // CONTEXT VALIDATION
  // ================================

  validateContextConfig(contextConfig) {
    const errors = [];
    
    if (contextConfig.previousContent?.mode === 'selected' && 
        (!contextConfig.previousContent.items || contextConfig.previousContent.items.length === 0)) {
      errors.push('Selected mode requires items array');
    }
    
    if (contextConfig.previousContent?.mode === 'vertical' && 
        !contextConfig.previousContent.verticalFilter) {
      errors.push('Vertical mode requires verticalFilter');
    }
    
    return errors;
  }
}