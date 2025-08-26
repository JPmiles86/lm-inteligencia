# Google Gemini API Usage Guide for Inteligencia AI System
## Date: 2025-08-25
## Purpose: Define how to use Google's Gemini and Imagen features

---

## 🎯 KEY CONCEPTS: THINKING MODELS

### Gemini 2.5 Series - Thinking by Default

**IMPORTANT**: Gemini 2.5 Pro and Flash have "thinking" enabled by default, which:
- Enhances response quality
- Increases token usage
- Takes longer to process

#### Control Thinking:
```typescript
// Disable thinking for speed (Flash only)
const config = {
  thinkingConfig: {
    thinkingBudget: 0 // Disables thinking
  }
};

// Configure thinking budget (Flash)
const config = {
  thinkingConfig: {
    thinkingBudget: 1000 // Limit thinking tokens
  }
};
```

---

## 📋 IMPLEMENTATION BY TASK

### 1. Blog Writing (Full Generation)
```typescript
// Use Gemini 2.5 Pro for highest quality
const generateBlog = async (topic: string, vertical: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: buildPrompt(topic, vertical),
    config: {
      systemInstruction: `You are an expert blog writer for ${vertical} industry`,
      temperature: 0.8,
      // Thinking enabled by default for quality
    }
  });
  return parseResponse(response);
};

// Cost-optimized: Use Flash with controlled thinking
const generateBlogOptimized = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: topic,
    config: {
      thinkingConfig: {
        thinkingBudget: 500 // Balance quality/speed
      }
    }
  });
  return response;
};
```

### 2. Research & Analysis
```typescript
// Use Flash for balanced research
const research = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Research current trends in: ${topic}`,
    config: {
      // Keep thinking enabled for accuracy
      temperature: 0.3 // Lower for factual content
    }
  });
  return response;
};
```

### 3. Quick Tasks (Titles, Tags, etc.)
```typescript
// Use Flash-Lite for maximum speed
const generateTitles = async (idea: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `Generate 10 blog titles for: ${idea}`,
    config: {
      temperature: 0.9, // Higher for creativity
      maxOutputTokens: 500
    }
  });
  return parseTitles(response);
};
```

### 4. SEO Analysis
```typescript
// Flash-Lite is perfect for quick analysis
const analyzeSEO = async (content: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      "Analyze this content for SEO:",
      content
    ],
    config: {
      responseSchema: seoSchema, // Structured output
      temperature: 0.1
    }
  });
  return response;
};
```

### 5. Image Generation with Imagen 4.0
```typescript
// Standard quality (1K resolution)
const generateImage = async (prompt: string) => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 4,
      aspectRatio: "16:9",
      sampleImageSize: "1K", // 1024x1024
      personGeneration: "allow_adult"
    }
  });
  return response.generatedImages;
};

// Ultra quality (2K resolution)
const generateUltraImage = async (prompt: string) => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-ultra-generate-001',
    prompt: enhancePrompt(prompt),
    config: {
      numberOfImages: 2,
      sampleImageSize: "2K", // 2048x2048
      aspectRatio: "1:1"
    }
  });
  return response.generatedImages;
};

// Fast generation for drafts
const generateQuickImage = async (prompt: string) => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-fast-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 4
    }
  });
  return response.generatedImages;
};
```

### 6. Multimodal Content Analysis
```typescript
// Analyze images with blogs for context
const analyzeWithImage = async (text: string, imagePath: string) => {
  const image = await ai.files.upload({
    file: imagePath
  });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      createUserContent([
        text,
        createPartFromUri(image.uri, image.mimeType)
      ])
    ],
    config: {
      thinkingConfig: { thinkingBudget: 0 } // Quick analysis
    }
  });
  return response;
};
```

### 7. Social Media Generation
```typescript
// Use Flash-Lite for quick social posts
const generateSocialPost = async (blog: string, platform: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `Convert to ${platform} post: ${blog}`,
    config: {
      systemInstruction: socialMediaInstructions[platform],
      maxOutputTokens: 280, // Twitter limit
      temperature: 0.7
    }
  });
  return response.text;
};
```

### 8. Multi-Turn Conversations
```typescript
// Use chat for context management
const chat = ai.chats.create({
  model: "gemini-2.5-flash",
  history: previousMessages,
  config: {
    thinkingConfig: {
      thinkingBudget: 200 // Moderate thinking
    }
  }
});

const response = await chat.sendMessage({
  message: "Refine this blog introduction"
});
```

---

## 🎨 IMAGEN PROMPT ENGINEERING

### Effective Prompt Structure:
```typescript
const imagenPrompt = {
  subject: "A modern office space",
  context: "with natural lighting",
  style: "photorealistic, architectural photography",
  details: "35mm lens, golden hour",
  modifiers: "high-quality, 4K, HDR"
};

const fullPrompt = Object.values(imagenPrompt).join(", ");
```

### Aspect Ratios by Use Case:
| Use Case | Aspect Ratio | Dimensions |
|----------|--------------|------------|
| Social Media | 1:1 | Square |
| Blog Hero | 16:9 | Widescreen |
| Portrait | 9:16 | Vertical |
| Print | 4:3 | Standard |
| Mobile | 3:4 | Portrait |

### Text in Images:
```typescript
// Keep text under 25 characters
const logoPrompt = `
  A minimalist logo for "TechCo" 
  on a solid blue background. 
  Bold sans-serif font.
`;
```

---

## 💰 COST OPTIMIZATION

### Model Selection Strategy:
```typescript
const modelSelector = {
  // Complex tasks with thinking
  complex: {
    model: "gemini-2.5-pro",
    config: {} // Default thinking ON
  },
  
  // Balanced tasks
  balanced: {
    model: "gemini-2.5-flash",
    config: {
      thinkingConfig: { thinkingBudget: 300 }
    }
  },
  
  // Simple, fast tasks
  simple: {
    model: "gemini-2.5-flash-lite",
    config: {
      temperature: 0.5
    }
  },
  
  // Image generation by quality
  imageUltra: "imagen-4.0-ultra-generate-001", // $0.06
  imageStandard: "imagen-4.0-generate-001",     // $0.04
  imageFast: "imagen-4.0-fast-generate-001"     // $0.02
};
```

### Batch Processing:
```typescript
// 50% discount for batch mode
const batchGenerate = async (prompts: string[]) => {
  // Group by complexity
  const batches = groupByComplexity(prompts);
  
  // Process in batch mode
  return Promise.all(
    batches.map(batch => 
      processBatch(batch, { batchMode: true })
    )
  );
};
```

---

## 🔧 STRUCTURED OUTPUT

### Using Response Schemas:
```typescript
const blogSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    content: { type: "string" },
    tags: {
      type: "array",
      items: { type: "string" }
    },
    metadata: {
      type: "object",
      properties: {
        readingTime: { type: "number" },
        difficulty: { 
          type: "string",
          enum: ["beginner", "intermediate", "advanced"]
        }
      }
    }
  },
  required: ["title", "content", "tags"]
};

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseSchema: blogSchema,
    responseMimeType: "application/json"
  }
});
```

---

## 🚀 STREAMING RESPONSES

### For Better UX:
```typescript
const streamGeneration = async (prompt: string) => {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 } // Faster streaming
    }
  });
  
  for await (const chunk of response) {
    process.stdout.write(chunk.text);
  }
};
```

---

## ⚠️ ERROR HANDLING

```typescript
const handleGeminiError = async (error: any) => {
  if (error.status === 429) {
    // Rate limit - implement exponential backoff
    await delay(calculateBackoff(attempt));
    return retry(request);
  }
  
  if (error.status === 400) {
    // Invalid request - check prompt length
    if (error.message.includes("token limit")) {
      return truncateAndRetry(request);
    }
  }
  
  if (error.status === 503) {
    // Model overloaded - try different model
    return fallbackModel(request);
  }
  
  // Content filtering
  if (error.message.includes("BLOCKED")) {
    return handleContentFilter(error);
  }
};
```

---

## 📊 MONITORING

### Track Key Metrics:
```typescript
interface GeminiMetrics {
  model: string;
  task_type: string;
  thinking_budget?: number;
  input_tokens: number;
  output_tokens: number;
  thinking_tokens?: number;
  latency_ms: number;
  cost: number;
  streaming: boolean;
}

// Log for optimization
await logMetrics(metrics);
```

---

## 🎯 BEST PRACTICES

### 1. **Thinking Budget Management**
```typescript
// High-value content: Keep thinking ON
// Quick tasks: Disable thinking
// Balanced: Set specific budget
```

### 2. **System Instructions**
```typescript
config: {
  systemInstruction: "You are an expert in [domain]..."
}
```

### 3. **Temperature Tuning**
- Creative content: 0.7-0.9
- Factual content: 0.1-0.3
- Balanced: 0.4-0.6

### 4. **Context Window Usage**
- Gemini supports up to 1M tokens
- Use efficiently to reduce costs
- Consider summarization for long contexts

### 5. **Free Testing**
- Use Google AI Studio for development
- No cost for experimentation
- Test prompts before production

---

## 🔄 MIGRATION FROM GEMINI 1.5

### Key Differences:
1. **Thinking enabled by default** in 2.5
2. **Better performance** without prompt engineering
3. **Lower costs** for Flash-Lite
4. **Improved multimodal** understanding

### Migration Steps:
```typescript
// Old (Gemini 1.5)
const oldConfig = {
  model: "gemini-1.5-flash",
  // Complex prompt engineering needed
};

// New (Gemini 2.5)
const newConfig = {
  model: "gemini-2.5-flash",
  config: {
    thinkingConfig: { thinkingBudget: 300 }
    // Simpler prompts work better
  }
};
```

---

## 📝 CLIENT SETUP

```typescript
// services/ai/gemini-client.ts
import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private client: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }
  
  // Text generation with thinking control
  async generateWithThinking(config: GenerationConfig) {
    return this.client.models.generateContent({
      model: config.model || "gemini-2.5-flash",
      contents: config.prompt,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature || 0.7,
        thinkingConfig: config.thinking || {},
        responseSchema: config.schema
      }
    });
  }
  
  // Image generation with Imagen
  async generateImage(prompt: string, options?: ImageOptions) {
    return this.client.models.generateImages({
      model: options?.quality === 'ultra' 
        ? 'imagen-4.0-ultra-generate-001'
        : 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: options?.count || 2,
        aspectRatio: options?.aspectRatio || "1:1",
        sampleImageSize: options?.quality === 'ultra' ? "2K" : "1K"
      }
    });
  }
  
  // Streaming for real-time
  async *streamGeneration(config: StreamConfig) {
    const response = await this.client.models.generateContentStream({
      model: config.model,
      contents: config.prompt,
      config: config.options
    });
    
    for await (const chunk of response) {
      yield chunk.text;
    }
  }
}

export default GeminiService;
```

---

## ✅ INTEGRATION CHECKLIST

- [ ] Set up Gemini API client
- [ ] Configure thinking budgets by task
- [ ] Implement Imagen for images
- [ ] Set up structured outputs
- [ ] Add streaming support
- [ ] Configure system instructions
- [ ] Implement error handling
- [ ] Set up cost tracking
- [ ] Test in AI Studio (free)
- [ ] Configure fallback models
- [ ] Monitor thinking token usage
- [ ] Optimize for cost/performance