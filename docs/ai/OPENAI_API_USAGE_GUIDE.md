# OpenAI API Usage Guide for Inteligencia AI System
## Date: 2025-08-25
## Purpose: Define how to use OpenAI's features for our content generation app

---

## 🚀 KEY CHANGES: RESPONSES API vs CHAT COMPLETIONS

### When to Use Each API

#### Use **Responses API** (GPT-5 series) for:
- Complex blog generation requiring reasoning
- Multi-step content planning
- Code-heavy content or technical blogs
- When you need web search capabilities
- Structured outputs with JSON schemas

#### Use **Chat Completions API** (GPT-4.1 series) for:
- Quick generations with minimal reasoning
- Vision/image analysis tasks
- Existing integrations (backward compatibility)
- Simple completions without reasoning chains

---

## 📋 IMPLEMENTATION STRATEGY BY TASK

### 1. Blog Writing (Full Generation)
```typescript
// PRIMARY: Use GPT-5 with medium reasoning
const generateBlog = async (topic: string, context: Context) => {
  return await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" }, // Balance quality and speed
    text: { verbosity: "high" }, // Detailed content
    tools: [{ type: "web_search_preview" }], // Enable research
    input: buildPrompt(topic, context),
    text: {
      format: {
        type: "json_schema",
        schema: blogSchema, // Structured output
        strict: true
      }
    }
  });
};

// FALLBACK: Claude Sonnet 4 for cost optimization
```

### 2. Research & Fact-Checking
```typescript
// Use GPT-5 with web search for real-time information
const research = async (topic: string) => {
  return await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" }, // Quick research
    tools: [{ 
      type: "web_search_preview",
      search_context_size: "high" // Maximum context
    }],
    input: `Research current information about: ${topic}`
  });
};
```

### 3. Idea Generation & Brainstorming
```typescript
// Use GPT-5-mini for cost-effective ideation
const generateIdeas = async (vertical: string, count: number) => {
  return await openai.responses.create({
    model: "gpt-5-mini",
    reasoning: { effort: "minimal" }, // Fast generation
    text: { verbosity: "low" }, // Concise ideas
    input: `Generate ${count} blog ideas for ${vertical}`,
    text: {
      format: {
        type: "json_schema",
        schema: ideasArraySchema
      }
    }
  });
};
```

### 4. Title Generation
```typescript
// Use GPT-5-nano for simple, fast title generation
const generateTitles = async (idea: string) => {
  return await openai.responses.create({
    model: "gpt-5-nano",
    reasoning: { effort: "minimal" },
    text: { verbosity: "low" },
    input: `Generate 10 catchy titles for: ${idea}`,
    instructions: "Create engaging, SEO-friendly titles"
  });
};
```

### 5. SEO Analysis
```typescript
// Use GPT-5-nano with structured output
const analyzeSEO = async (content: string) => {
  return await openai.responses.create({
    model: "gpt-5-nano",
    reasoning: { effort: "minimal" },
    text: { verbosity: "low" },
    input: content,
    instructions: "Analyze SEO and provide structured feedback",
    text: {
      format: {
        type: "json_schema",
        schema: seoAnalysisSchema
      }
    }
  });
};
```

### 6. Image Generation
```typescript
// Use GPT-Image-1 for context-aware images
const generateImage = async (prompt: string, context?: string) => {
  return await openai.responses.create({
    model: "gpt-4.1-mini", // Or gpt-image-1 when available
    tools: [{ type: "image_generation" }],
    input: [
      { role: "user", content: prompt },
      context && { role: "developer", content: context }
    ].filter(Boolean)
  });
};

// Alternative: Use DALL-E 3 directly for simple generations
const generateSimpleImage = async (prompt: string) => {
  return await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    size: "1024x1024",
    quality: "standard"
  });
};
```

### 7. Social Media Post Generation
```typescript
// Use GPT-5-mini for quick social posts
const generateSocialPost = async (blog: string, platform: string) => {
  return await openai.responses.create({
    model: "gpt-5-mini",
    reasoning: { effort: "low" },
    text: { verbosity: "low" }, // Concise for social
    input: `Convert to ${platform} post: ${blog}`,
    instructions: platformInstructions[platform]
  });
};
```

### 8. Content Editing & Refinement
```typescript
// Use GPT-5 with high reasoning for quality edits
const editContent = async (content: string, instructions: string) => {
  return await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "high" }, // Thorough analysis
    text: { verbosity: "medium" },
    input: content,
    instructions: instructions,
    previous_response_id: previousId // Maintain context
  });
};
```

---

## 🎛️ REASONING EFFORT GUIDELINES

### When to Use Each Level:

| Effort | Use Cases | Speed | Cost |
|--------|-----------|-------|------|
| **minimal** | • Simple classifications<br>• Title generation<br>• Quick summaries | Fastest | Lowest |
| **low** | • Ideation<br>• Social posts<br>• Basic research | Fast | Low |
| **medium** | • Blog writing<br>• Content analysis<br>• Structured generation | Balanced | Medium |
| **high** | • Complex editing<br>• Technical content<br>• Multi-step planning | Slower | Higher |

---

## 📝 VERBOSITY CONTROL

### When to Use Each Level:

| Verbosity | Use Cases | Output Length |
|-----------|-----------|---------------|
| **low** | • Titles<br>• Social posts<br>• Quick answers | 50-80% fewer tokens |
| **medium** | • Standard blogs<br>• Summaries<br>• Analysis | Default length |
| **high** | • Detailed blogs<br>• Comprehensive guides<br>• Technical docs | 50-100% more tokens |

---

## 🔧 STRUCTURED OUTPUTS IMPLEMENTATION

### Define Schemas for Consistency:

```typescript
// Blog Output Schema
const blogSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string", maxLength: 200 },
    content: { type: "string" },
    tags: { 
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 10
    },
    seoMetadata: {
      type: "object",
      properties: {
        metaTitle: { type: "string", maxLength: 60 },
        metaDescription: { type: "string", maxLength: 160 },
        focusKeyword: { type: "string" }
      },
      required: ["metaTitle", "metaDescription", "focusKeyword"]
    },
    imagePrompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          position: { type: "string", enum: ["hero", "section", "footer"] },
          prompt: { type: "string" },
          style: { type: "string" }
        },
        required: ["position", "prompt"]
      }
    }
  },
  required: ["title", "excerpt", "content", "tags", "seoMetadata"],
  additionalProperties: false
};
```

---

## 🌐 WEB SEARCH INTEGRATION

### Configuration for Different Needs:

```typescript
const searchConfigs = {
  // Quick fact checking
  quick: {
    type: "web_search_preview",
    search_context_size: "low"
  },
  
  // Standard research
  standard: {
    type: "web_search_preview",
    search_context_size: "medium"
  },
  
  // Deep research
  comprehensive: {
    type: "web_search_preview",
    search_context_size: "high",
    user_location: {
      type: "approximate",
      country: "US"
    }
  }
};
```

---

## 💰 COST OPTIMIZATION STRATEGIES

### 1. **Model Selection by Task**
```typescript
const modelSelector = {
  complex: "gpt-5",           // Only for complex reasoning
  balanced: "gpt-5-mini",      // Most tasks
  simple: "gpt-5-nano",        // High-volume simple tasks
  vision: "gpt-4.1-mini",      // Image analysis
  creative: "gpt-4.1"          // Creative writing
};
```

### 2. **Caching Strategy**
- Cache style guides and brand guides
- Reuse previous reasoning chains with `previous_response_id`
- Store common prompts and templates

### 3. **Batch Processing**
```typescript
// Group similar tasks for efficiency
const batchGenerate = async (tasks: Task[]) => {
  const grouped = groupBy(tasks, 'type');
  return Promise.all(
    Object.entries(grouped).map(([type, items]) => 
      processTaskType(type, items)
    )
  );
};
```

---

## 🔄 MIGRATION PATH

### Phase 1: Core Features (Week 1-2)
1. Implement Responses API for GPT-5 models
2. Set up structured outputs for blogs
3. Configure web search for research

### Phase 2: Enhanced Features (Week 3-4)
1. Add reasoning effort controls
2. Implement verbosity controls
3. Set up image generation pipeline

### Phase 3: Optimization (Week 5-6)
1. Add caching layer
2. Implement batch processing
3. Optimize model selection logic

---

## ⚠️ ERROR HANDLING

### Handle API-Specific Errors:

```typescript
const handleOpenAIError = async (error: any) => {
  if (error.status === "incomplete") {
    if (error.incomplete_details?.reason === "max_output_tokens") {
      // Retry with higher token limit or lower verbosity
    }
    if (error.incomplete_details?.reason === "content_filter") {
      // Handle content policy violation
    }
  }
  
  if (error.output?.[0]?.content?.[0]?.type === "refusal") {
    // Handle model refusal
    const refusalReason = error.output[0].content[0].refusal;
    // Provide user feedback or adjust prompt
  }
  
  // Rate limiting
  if (error.code === 'rate_limit_exceeded') {
    // Implement exponential backoff
    await delay(calculateBackoff(attempt));
    return retry(request);
  }
};
```

---

## 📚 API CLIENT SETUP

### Initialize Clients:

```typescript
// services/ai/openai-client.ts
import OpenAI from "openai";

class OpenAIService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  // Responses API for GPT-5
  async generateWithReasoning(config: GenerationConfig) {
    return this.client.responses.create({
      model: config.model,
      reasoning: config.reasoning || { effort: "medium" },
      text: config.text || { verbosity: "medium" },
      tools: config.tools,
      input: config.input,
      instructions: config.instructions
    });
  }
  
  // Chat Completions for GPT-4.1
  async generateChat(config: ChatConfig) {
    return this.client.chat.completions.create({
      model: config.model,
      messages: config.messages,
      tools: config.tools
    });
  }
  
  // Direct image generation
  async generateImage(prompt: string, options?: ImageOptions) {
    return this.client.images.generate({
      model: options?.model || "dall-e-3",
      prompt,
      size: options?.size || "1024x1024",
      quality: options?.quality || "standard"
    });
  }
}

export default OpenAIService;
```

---

## 🎯 BEST PRACTICES

### 1. **Always Set Instructions**
Use the `instructions` parameter for system-level guidance that takes priority.

### 2. **Use Previous Response ID**
Maintain conversation context and avoid re-reasoning:
```typescript
previous_response_id: lastResponse.id
```

### 3. **Stream for Long Content**
Use streaming for better UX on long generations:
```typescript
const stream = await openai.responses.stream({ ... });
```

### 4. **Monitor Token Usage**
Track and optimize token consumption:
```typescript
const usage = response.usage;
await trackUsage(usage.input_tokens, usage.output_tokens);
```

### 5. **Implement Fallbacks**
Always have backup models:
```typescript
try {
  return await generateWithGPT5(config);
} catch (error) {
  return await generateWithClaude(config);
}
```

---

## 📊 MONITORING & ANALYTICS

### Track Key Metrics:

```typescript
interface GenerationMetrics {
  model: string;
  task_type: string;
  reasoning_effort: string;
  verbosity: string;
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens: number;
  cost: number;
  latency_ms: number;
  success: boolean;
  error_type?: string;
}

// Log every generation for analysis
await logGeneration(metrics);
```

---

## 🔗 INTEGRATION CHECKLIST

- [ ] Set up Responses API client
- [ ] Configure structured output schemas
- [ ] Implement web search tools
- [ ] Add reasoning effort controls
- [ ] Set up verbosity controls
- [ ] Create error handling
- [ ] Add retry logic
- [ ] Implement caching
- [ ] Set up monitoring
- [ ] Configure fallback models
- [ ] Test all generation flows
- [ ] Optimize for cost/performance