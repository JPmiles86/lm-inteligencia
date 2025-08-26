# AI Models Configuration - August 2025
## Current Models & Pricing

---

## 🤖 Model Selection Guide

### For Blog Writing
**Best Quality**: Claude Opus 4.1 ($15/$75 per 1M tokens)
**Best Value**: Claude Sonnet 4 ($3/$15 per 1M tokens)  
**Budget**: GPT-5-mini ($0.25/$2 per 1M tokens)

### For Research
**Best Deep**: Perplexity Sonar Deep Research (exhaustive, $5/$25 per 1M)
**Best Value**: Perplexity Sonar Pro ($3/$15 per 1M)
**Quick**: Perplexity Sonar ($0.2/$0.8 per 1M)
**Alternative**: GPT-5 with web search

### For Ideation/Brainstorming
**Best**: GPT-4.1 (creative tasks)
**Budget**: Gemini 2.5 Flash

### For SEO/Analysis
**Best**: Gemini 2.5 Flash-Lite ($0.02/$0.08 per 1M tokens)
**Alternative**: GPT-5-nano (fast, cheap)

### For Image Generation
**Best Quality**: Google Imagen 4.0 Ultra ($0.06/image, 2K resolution)
**Best Value**: Google Imagen 4.0 Standard ($0.04/image, 1K resolution)
**Fast**: Google Imagen 4.0 Fast ($0.02/image)
**Alternative**: OpenAI GPT-Image-1 ($0.08/image)

---

## 📊 Detailed Model Specifications

### OpenAI

```typescript
const OPENAI_MODELS = {
  // GPT-5 Series (Latest - Uses Responses API)
  'gpt-5': {
    id: 'gpt-5',
    name: 'GPT-5',
    api: 'responses', // New Responses API
    contextWindow: 272000, // Input context
    maxOutput: 128000, // Output tokens
    pricing: { input: 3, output: 15 }, // per 1M tokens (estimated)
    bestFor: ['complex_reasoning', 'coding', 'multi_step_planning'],
    features: [
      'reasoning_effort_control', // minimal, low, medium, high
      'verbosity_control', // low, medium, high
      'web_search_preview',
      'custom_tools',
      'structured_outputs'
    ],
    notes: 'Best for complex tasks requiring broad world knowledge'
  },
  'gpt-5-mini': {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    api: 'responses',
    contextWindow: 272000,
    maxOutput: 128000,
    pricing: { input: 0.6, output: 2.4 }, // per 1M tokens (estimated)
    bestFor: ['balanced_performance', 'cost_optimized_reasoning'],
    features: ['reasoning_effort_control', 'verbosity_control', 'web_search'],
    notes: 'Balances speed, cost, and capability'
  },
  'gpt-5-nano': {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    api: 'responses',
    contextWindow: 272000,
    maxOutput: 128000,
    pricing: { input: 0.15, output: 0.6 }, // per 1M tokens (estimated)
    bestFor: ['instruction_following', 'classification', 'high_throughput'],
    features: ['reasoning_effort_control', 'verbosity_control'],
    notes: 'Fastest, best for simple well-defined tasks'
  },
  
  // GPT-4.1 Series (Vision & Multimodal)
  'gpt-4.1': {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    api: 'chat', // Chat Completions API
    contextWindow: 1000000,
    maxOutput: 32000,
    pricing: { input: 2.5, output: 10 }, // per 1M tokens
    bestFor: ['creative_writing', 'vision_tasks', 'long_context'],
    features: ['vision', 'web_search', 'image_generation'],
    notes: 'Best for creative and visual tasks'
  },
  'gpt-4.1-mini': {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    api: 'chat',
    contextWindow: 1000000,
    maxOutput: 32000,
    pricing: { input: 0.15, output: 0.6 }, // per 1M tokens
    bestFor: ['general_tasks', 'fast_responses'],
    features: ['vision', 'web_search', 'image_generation'],
    notes: '83% cheaper than GPT-4o, half the latency'
  },
  'gpt-4.1-nano': {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    api: 'chat',
    contextWindow: 128000,
    maxOutput: 16000,
    pricing: { input: 0.075, output: 0.3 }, // per 1M tokens
    bestFor: ['simple_tasks', 'high_volume'],
    features: ['basic_generation'],
    notes: 'No web search support'
  },
  
  // Image Generation
  'gpt-image-1': {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    api: 'responses',
    pricing: { perImage: 0.08 }, // Standard quality
    bestFor: ['image_generation', 'visual_content'],
    features: [
      'text_to_image',
      'image_to_image',
      'contextual_generation',
      'world_knowledge'
    ],
    notes: 'Natively multimodal, understands context better than DALL-E'
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    api: 'images',
    pricing: { 
      standard: 0.04, // 1024x1024
      hd: 0.08 // 1024x1792 or 1792x1024
    },
    bestFor: ['specialized_image_generation'],
    features: ['text_to_image'],
    notes: 'Traditional image generation model'
  },
  
  // O-Series for Deep Reasoning
  'o3': {
    id: 'o3',
    name: 'O3',
    api: 'chat',
    contextWindow: 200000,
    pricing: { input: 15, output: 60 },
    bestFor: ['complex_reasoning', 'math', 'science'],
    features: ['chain_of_thought'],
    notes: 'Use GPT-5 with high reasoning effort instead'
  },
  'o4-mini': {
    id: 'o4-mini',
    name: 'O4 Mini',
    api: 'chat',
    contextWindow: 128000,
    pricing: { input: 3, output: 12 },
    bestFor: ['reasoning_tasks'],
    features: ['chain_of_thought', 'web_search'],
    notes: 'GPT-5-mini often better choice'
  }
};
```

### Anthropic

```typescript
const ANTHROPIC_MODELS = {
  // Claude Opus 4.1 - Most Capable Model
  'claude-opus-4.1': {
    id: 'claude-opus-4-1-20250805',
    alias: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    contextWindow: 200000,
    maxOutput: 32000,
    pricing: { input: 15, output: 75 },
    bestFor: ['complex_reasoning', 'advanced_coding', 'deep_analysis'],
    features: ['extended_thinking', 'vision', 'multilingual', 'superior_reasoning'],
    notes: ['Cannot use both temperature and top_p parameters'],
    trainingCutoff: 'March 2025'
  },
  
  // Claude Opus 4
  'claude-opus-4': {
    id: 'claude-opus-4-20250514',
    alias: 'claude-opus-4-0',
    name: 'Claude Opus 4',
    contextWindow: 200000,
    maxOutput: 32000,
    pricing: { input: 15, output: 75 },
    bestFor: ['complex_coding', 'long_documents', 'advanced_writing'],
    features: ['extended_thinking', 'vision', 'multilingual'],
    trainingCutoff: 'March 2025'
  },
  
  // Claude Sonnet 4 - High Performance
  'claude-sonnet-4': {
    id: 'claude-sonnet-4-20250514',
    alias: 'claude-sonnet-4-0',
    name: 'Claude Sonnet 4',
    contextWindow: 200000, // 1M with beta header
    maxOutput: 64000,
    pricing: { input: 3, output: 15 },
    bestFor: ['general_content', 'balanced_performance', 'writing'],
    features: ['extended_thinking', 'vision', 'multilingual'],
    betaHeaders: {
      '1M_context': 'context-1m-2025-08-07' // Enables 1M context window
    },
    trainingCutoff: 'March 2025'
  },
  
  // Claude Sonnet 3.7
  'claude-3.7-sonnet': {
    id: 'claude-3-7-sonnet-20250219',
    alias: 'claude-3-7-sonnet-latest',
    name: 'Claude 3.7 Sonnet',
    contextWindow: 200000,
    maxOutput: 64000, // 128K with beta header
    pricing: { input: 3, output: 15 },
    bestFor: ['content_with_reasoning', 'toggleable_thinking'],
    features: ['extended_thinking', 'vision', 'multilingual'],
    betaHeaders: {
      '128K_output': 'output-128k-2025-02-19' // Enables 128K output
    },
    trainingCutoff: 'November 2024'
  },
  
  // Claude Haiku 3.5 - Fastest
  'claude-haiku-3.5': {
    id: 'claude-3-5-haiku-20241022',
    alias: 'claude-3-5-haiku-latest',
    name: 'Claude Haiku 3.5',
    contextWindow: 200000,
    maxOutput: 8192,
    pricing: { input: 0.80, output: 4 },
    bestFor: ['quick_tasks', 'real_time_responses', 'simple_generation'],
    features: ['vision', 'multilingual'], // No extended thinking
    trainingCutoff: 'July 2024'
  },
  
  // Claude Haiku 3 - Most Cost Effective
  'claude-haiku-3': {
    id: 'claude-3-haiku-20240307',
    name: 'Claude Haiku 3',
    contextWindow: 200000,
    maxOutput: 4096,
    pricing: { input: 0.25, output: 1.25 },
    bestFor: ['simple_tasks', 'cost_efficiency'],
    features: ['vision', 'multilingual'], // No extended thinking
    trainingCutoff: 'August 2023'
  }
};

// Prompt Caching Pricing (per MTok)
// Opus 4.1/4: 5m cache $18.75, 1h cache $30, hits $1.50
// Sonnet 4/3.7: 5m cache $3.75, 1h cache $6, hits $0.30
// Haiku 3.5: 5m cache $1, 1h cache $1.6, hits $0.08
// Haiku 3: 5m cache $0.30, 1h cache $0.50, hits $0.03
```

### Google

```typescript
const GOOGLE_MODELS = {
  // Gemini 2.5 Series - Thinking Models (Latest)
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    contextWindow: 1000000, // 2M context coming soon
    pricing: { input: 1.25, output: 5 }, // per 1M tokens
    bestFor: ['complex_reasoning', 'multimodal_understanding', 'advanced_coding'],
    features: [
      'thinking_enabled_by_default',
      'audio_video_image_text_input',
      'state_of_the_art_performance'
    ],
    notes: 'Most powerful thinking model with maximum accuracy'
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    contextWindow: 1000000,
    pricing: { input: 0.075, output: 0.3 }, // per 1M tokens
    bestFor: ['price_performance', 'adaptive_thinking', 'high_volume'],
    features: [
      'thinking_enabled_by_default',
      'configurable_thinking_budget',
      'multimodal_input'
    ],
    notes: 'Best value, thinking can be disabled with thinkingBudget: 0'
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    contextWindow: 1000000,
    pricing: { input: 0.02, output: 0.08 }, // per 1M tokens
    bestFor: ['cost_efficiency', 'high_throughput', 'real_time'],
    features: [
      'most_cost_efficient',
      'low_latency',
      'multimodal_input'
    ],
    notes: 'Optimized for cost and speed'
  },
  
  // Gemini 2.0 Series (Previous Generation)
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    contextWindow: 1000000,
    pricing: { input: 0.075, output: 0.3 }, // per 1M tokens
    bestFor: ['speed', 'realtime_streaming'],
    features: ['next_gen_features', 'multimodal'],
    notes: 'No thinking capability'
  },
  
  // Image Generation Models
  'imagen-4.0-ultra': {
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4.0 Ultra',
    pricing: { perImage: 0.06 }, // 2K resolution
    bestFor: ['highest_quality_images'],
    features: [
      'text_to_image',
      '2K_resolution',
      'synthid_watermark',
      'text_in_images'
    ],
    maxImages: 4,
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9']
  },
  'imagen-4.0': {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4.0 Standard',
    pricing: { perImage: 0.04 }, // 1K resolution
    bestFor: ['standard_image_generation'],
    features: [
      'text_to_image',
      '1K_resolution',
      'synthid_watermark',
      'text_in_images'
    ],
    maxImages: 4,
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9']
  },
  'imagen-4.0-fast': {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4.0 Fast',
    pricing: { perImage: 0.02 },
    bestFor: ['quick_image_generation'],
    features: [
      'text_to_image',
      'fast_generation',
      'synthid_watermark'
    ],
    maxImages: 4
  },
  
  // Specialized Models
  'gemini-2.5-flash-live': {
    id: 'gemini-live-2.5-flash-preview',
    name: 'Gemini 2.5 Flash Live',
    pricing: { input: 0.04, output: 0.08 }, // per 1M tokens
    bestFor: ['voice_interactions', 'video_chat'],
    features: ['bidirectional_audio_video', 'low_latency'],
    notes: 'For real-time interactions'
  },
  'gemini-2.0-flash-image-gen': {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Image Generation',
    pricing: { input: 0.075, output: 0.3, perImage: 0.04 },
    bestFor: ['conversational_image_generation'],
    features: ['text_to_image', 'image_editing', 'multimodal_conversation'],
    notes: 'Can generate and edit images in conversation'
  },
  
  // Deprecated Models (Still Available)
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (Deprecated)',
    contextWindow: 2000000, // 2M context
    pricing: { input: 1.25, output: 5 },
    bestFor: ['legacy_applications'],
    features: ['multimodal', 'long_context'],
    notes: 'Use Gemini 2.5 Pro instead'
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Deprecated)',
    contextWindow: 1000000,
    pricing: { input: 0.075, output: 0.3 },
    bestFor: ['legacy_applications'],
    features: ['fast_performance'],
    notes: 'Use Gemini 2.5 Flash instead'
  }
};

// Note: Google AI Studio offers FREE access to experiment
// Batch mode: 50% price reduction available
// Thinking models: 2.5 Pro and Flash have thinking ON by default
```

### Perplexity

```typescript
const PERPLEXITY_MODELS = {
  // Sonar Models - Web Search Enabled
  'sonar': {
    id: 'sonar',
    name: 'Sonar (Lightweight)',
    contextWindow: 128000,
    pricing: { input: 0.2, output: 0.8 }, // per 1M tokens
    bestFor: ['quick_research', 'simple_queries'],
    features: [
      'real_time_web_search',
      'citations',
      'academic_mode'
    ],
    notes: 'Fast, cost-effective for simple searches'
  },
  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Sonar Pro (Advanced)',
    contextWindow: 128000,
    pricing: { input: 3, output: 15 }, // per 1M tokens
    bestFor: ['advanced_research', 'complex_queries'],
    features: [
      'advanced_web_search',
      'citations',
      'academic_mode',
      'search_filters'
    ],
    notes: 'Best for comprehensive research needs'
  },
  
  // Deep Research Models
  'sonar-deep-research': {
    id: 'sonar-deep-research',
    name: 'Sonar Deep Research',
    contextWindow: 128000,
    pricing: { input: 5, output: 25 }, // per 1M tokens (estimated)
    bestFor: ['exhaustive_research', 'academic_papers'],
    features: [
      'deep_web_search',
      'reasoning_effort_control', // low/medium/high
      'extensive_citations',
      'academic_sources'
    ],
    notes: 'Exhaustive research with configurable reasoning effort'
  },
  
  // Reasoning Models
  'sonar-reasoning': {
    id: 'sonar-reasoning',
    name: 'Sonar Reasoning (Fast)',
    contextWindow: 128000,
    pricing: { input: 3, output: 15 }, // per 1M tokens
    bestFor: ['logical_analysis', 'problem_solving'],
    features: [
      'chain_of_thought',
      'web_search_optional',
      'structured_reasoning'
    ],
    notes: 'Fast reasoning with optional web search'
  },
  'sonar-reasoning-pro': {
    id: 'sonar-reasoning-pro',
    name: 'Sonar Reasoning Pro (Premier)',
    contextWindow: 128000,
    pricing: { input: 8, output: 40 }, // per 1M tokens (estimated)
    bestFor: ['complex_reasoning', 'multi_step_analysis'],
    features: [
      'advanced_reasoning',
      'web_search_integrated',
      'step_by_step_analysis'
    ],
    notes: 'Premier reasoning capabilities with integrated search'
  }
};

// Search Configuration Options
const SEARCH_CONFIG = {
  search_mode: ['web', 'academic'], // Academic prioritizes scholarly sources
  search_context_size: ['low', 'medium', 'high'], // Controls search depth
  search_recency_filter: ['day', 'week', 'month', 'year'],
  domain_filters: [], // Limit to specific domains (max 10)
  return_images: false,
  return_related_questions: false
};

// Note: Perplexity uses OpenAI-compatible API format
// Can use OpenAI SDK with baseURL change
```

---

## 🎯 Recommended Task Defaults

```typescript
const TASK_DEFAULTS = {
  // Research
  topic_research: {
    provider: 'perplexity',
    model: 'sonar-pro',
    config: {
      search_mode: 'web',
      search_context_size: 'medium',
      return_related_questions: true
    },
    fallback: { 
      provider: 'openai',
      model: 'gpt-5',
      config: { 
        tools: [{ type: 'web_search_preview' }],
        reasoning: { effort: 'medium' }
      }
    }
  },
  
  // Content Generation
  blog_writing: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    fallback: { 
      provider: 'openai', 
      model: 'gpt-5',
      config: { 
        reasoning: { effort: 'medium' },
        text: { verbosity: 'high' }
      }
    }
  },
  
  // Ideation
  idea_generation: {
    provider: 'openai',
    model: 'gpt-5',
    config: {
      reasoning: { effort: 'low' },
      text: { verbosity: 'medium' }
    },
    fallback: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' }
  },
  
  // Analysis
  seo_analysis: {
    provider: 'openai',
    model: 'gpt-5-nano',
    config: {
      reasoning: { effort: 'minimal' },
      text: { verbosity: 'low' }
    },
    fallback: { provider: 'google', model: 'gemini-2.5-flash-lite' }
  },
  
  // Editing
  blog_editing: {
    provider: 'openai',
    model: 'gpt-5',
    config: {
      reasoning: { effort: 'high' },
      text: { verbosity: 'medium' }
    },
    fallback: { provider: 'anthropic', model: 'claude-opus-4-1-20250805' }
  },
  
  // Image Generation
  image_generation: {
    provider: 'google',
    model: 'imagen-4.0-generate-001',
    config: {
      numberOfImages: 2,
      aspectRatio: '1:1'
    },
    fallback: { provider: 'openai', model: 'gpt-image-1' }
  },
  
  // Social Media
  social_posts: {
    provider: 'google',
    model: 'gemini-2.5-flash-lite',
    config: {
      thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed
    },
    fallback: { 
      provider: 'openai', 
      model: 'gpt-5-nano',
      config: {
        reasoning: { effort: 'minimal' },
        text: { verbosity: 'low' }
      }
    }
  }
};
```

---

## 💰 Cost Optimization Strategies

### 1. **Use Batch Processing**
- Anthropic: 50% discount
- Google: 50% discount
- Process multiple blogs overnight

### 2. **Prompt Caching (Anthropic)**
- Up to 90% cost savings
- Cache style guides and common contexts

### 3. **Smart Model Selection**
- Use nano/lite models for simple tasks
- Reserve premium models for complex generation
- Use fallbacks for availability

### 4. **Context Window Management**
- Keep under 200K for Anthropic to avoid 2x pricing
- Use summarization for long contexts
- Prune unnecessary context

### 5. **Free Options**
- Google AI Studio: Completely free
- Perplexity: 5 free Pro searches/day

---

## 🔧 Implementation Config

```typescript
// config/ai-models.ts
export const AI_CONFIG = {
  providers: {
    openai: {
      models: OPENAI_MODELS,
      defaultModel: 'gpt-5-mini',
      apiEndpoint: 'https://api.openai.com/v1'
    },
    anthropic: {
      models: ANTHROPIC_MODELS,
      defaultModel: 'claude-sonnet-4-20250514',
      apiEndpoint: 'https://api.anthropic.com/v1',
      headers: {
        'anthropic-version': '2023-06-01',
        // Add beta headers as needed:
        // 'anthropic-beta': 'context-1m-2025-08-07' // For 1M context on Sonnet 4
        // 'anthropic-beta': 'output-128k-2025-02-19' // For 128K output on Sonnet 3.7
      }
    },
    google: {
      models: GOOGLE_MODELS,
      defaultModel: 'gemini-2.5-flash',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
      notes: {
        thinking: 'Gemini 2.5 models have thinking ON by default',
        disableThinking: 'Set thinkingConfig.thinkingBudget: 0',
        freeAccess: 'Google AI Studio available for testing'
      }
    },
    perplexity: {
      models: PERPLEXITY_MODELS,
      defaultModel: 'sonar-pro',
      apiEndpoint: 'https://api.perplexity.ai',
      notes: {
        compatibility: 'OpenAI-compatible API format',
        setup: 'Use OpenAI SDK with baseURL change',
        search: 'All models include web search capabilities'
      }
    }
  },
  
  taskDefaults: TASK_DEFAULTS,
  
  limits: {
    maxTokensPerRequest: 200000,
    maxCostPerTask: 1.00,
    monthlyBudget: 500.00
  }
};
```

---

## 📝 Notes for Implementation

1. **API Keys**: Store encrypted in database, not localStorage
2. **Rate Limiting**: Implement queuing for high-volume generation
3. **Error Handling**: Always have fallback models configured
4. **Cost Tracking**: Log every API call with cost calculation
5. **Model Updates**: Check for new models monthly (providers release frequently)
6. **Testing**: Use cheap models (nano/lite) during development