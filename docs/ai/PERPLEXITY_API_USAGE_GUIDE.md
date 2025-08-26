# Perplexity API Usage Guide for Inteligencia AI System
## Date: 2025-08-25
## Purpose: Define how to use Perplexity's Sonar models for research

---

## 🎯 KEY CONCEPT: REAL-TIME WEB SEARCH

Perplexity's Sonar models are specifically designed for real-time web search and research, providing:
- **Current information** with citations
- **Academic sources** when needed
- **Source verification** and fact-checking
- **OpenAI-compatible API** for easy integration

---

## 🔧 SETUP: OPENAI COMPATIBILITY

### Use OpenAI SDK with Perplexity:
```typescript
import OpenAI from 'openai';

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai"
});

// Use exactly like OpenAI
const response = await perplexity.chat.completions.create({
  model: "sonar-pro",
  messages: [{ role: "user", content: "Latest AI developments?" }]
});
```

---

## 📋 IMPLEMENTATION BY TASK

### 1. Quick Research (Sonar)
```typescript
// Fast, cost-effective research
const quickResearch = async (topic: string) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar",
    messages: [
      { role: "user", content: `Research: ${topic}` }
    ],
    temperature: 0.2, // Lower for factual content
    search_mode: "web"
  });
  
  // Access search results
  console.log(`Sources: ${response.search_results?.length || 0}`);
  return response.choices[0].message.content;
};
```

### 2. Advanced Research (Sonar Pro)
```typescript
// Comprehensive research with filters
const advancedResearch = async (topic: string, vertical: string) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { 
        role: "system", 
        content: `You are researching for the ${vertical} industry` 
      },
      { 
        role: "user", 
        content: topic 
      }
    ],
    search_domain_filter: [
      "nature.com",
      "science.org",
      "-wikipedia.org" // Exclude with minus
    ],
    search_recency_filter: "month", // Recent content only
    return_related_questions: true,
    web_search_options: {
      search_context_size: "high" // Maximum context
    }
  });
  
  // Extract citations
  response.search_results?.forEach(result => {
    console.log(`Source: ${result.title}`);
    console.log(`URL: ${result.url}`);
    console.log(`Date: ${result.date}`);
  });
  
  return response;
};
```

### 3. Academic Research
```typescript
// Scholarly sources for credibility
const academicResearch = async (topic: string) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { role: "user", content: `Academic research on: ${topic}` }
    ],
    search_mode: "academic", // Prioritize peer-reviewed sources
    search_domain_filter: [
      "pubmed.gov",
      "arxiv.org",
      "scholar.google.com"
    ],
    return_images: false, // Focus on text
    temperature: 0.1 // Very factual
  });
  
  return response;
};
```

### 4. Deep Research (Exhaustive)
```typescript
// Exhaustive research with reasoning
const deepResearch = async (topic: string, effort: 'low' | 'medium' | 'high' = 'medium') => {
  const response = await perplexity.chat.completions.create({
    model: "sonar-deep-research",
    messages: [
      { role: "user", content: `Comprehensive analysis: ${topic}` }
    ],
    reasoning_effort: effort, // Controls depth vs speed
    search_mode: "web",
    web_search_options: {
      search_context_size: "high"
    }
  });
  
  console.log(`Reasoning tokens used: ${response.usage.reasoning_tokens}`);
  return response;
};
```

### 5. Fact Checking with Citations
```typescript
// Verify claims with sources
const factCheck = async (claim: string) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { 
        role: "system", 
        content: "Fact-check the following claim with reliable sources" 
      },
      { role: "user", content: claim }
    ],
    search_recency_filter: "week", // Recent sources
    return_related_questions: false,
    temperature: 0 // Deterministic
  });
  
  // Extract and format citations
  const citations = response.search_results?.map(r => ({
    source: r.title,
    url: r.url,
    date: r.date
  }));
  
  return {
    verdict: response.choices[0].message.content,
    citations
  };
};
```

### 6. Trend Analysis
```typescript
// Analyze current trends
const analyzeTrends = async (industry: string) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { role: "user", content: `Current trends in ${industry}` }
    ],
    search_recency_filter: "month",
    search_after_date_filter: "1/1/2025", // After specific date
    return_related_questions: true,
    web_search_options: {
      search_context_size: "medium",
      image_search_relevance_enhanced: true // Better image results
    }
  });
  
  // Get related questions for content ideas
  console.log("Related questions:", response.related_questions);
  return response;
};
```

### 7. Competitor Analysis
```typescript
// Research specific domains
const competitorAnalysis = async (competitors: string[]) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { role: "user", content: "Analyze digital marketing strategies" }
    ],
    search_domain_filter: competitors, // Limit to competitor sites
    search_recency_filter: "week",
    disable_search: false, // Ensure search is enabled
    enable_search_classifier: false // Force search use
  });
  
  return response;
};
```

### 8. Location-Based Research
```typescript
// Research with geographic context
const localResearch = async (topic: string, location: any) => {
  const response = await perplexity.chat.completions.create({
    model: "sonar",
    messages: [
      { role: "user", content: `${topic} in local area` }
    ],
    web_search_options: {
      search_context_size: "medium",
      user_location: {
        city: location.city,
        region: location.state,
        country: location.country
      }
    }
  });
  
  return response;
};
```

---

## 🎛️ SEARCH CONFIGURATION OPTIONS

### Search Context Size:
| Level | Use Case | Cost Impact |
|-------|----------|-------------|
| **low** | Quick answers | Minimal |
| **medium** | Balanced research | Moderate |
| **high** | Comprehensive | Higher |

### Search Modes:
```typescript
search_mode: "web"      // General web search
search_mode: "academic" // Scholarly sources
```

### Domain Filtering:
```typescript
// Include specific domains
search_domain_filter: ["example.com", "trusted.org"]

// Exclude domains (prefix with -)
search_domain_filter: ["-spam.com", "-unreliable.net"]

// Max 10 domains total
```

### Date Filtering:
```typescript
// Recency filters
search_recency_filter: "day" | "week" | "month" | "year"

// Specific date ranges (MM/DD/YYYY format)
search_after_date_filter: "3/1/2025"
search_before_date_filter: "3/31/2025"
last_updated_after_filter: "2/15/2025"
```

---

## 💰 COST OPTIMIZATION

### Model Selection by Research Depth:
```typescript
const researchSelector = {
  // Quick facts - $0.2/$0.8 per 1M tokens
  quick: {
    model: "sonar",
    search_context_size: "low"
  },
  
  // Standard research - $3/$15 per 1M tokens
  standard: {
    model: "sonar-pro",
    search_context_size: "medium"
  },
  
  // Deep analysis - $5/$25 per 1M tokens
  exhaustive: {
    model: "sonar-deep-research",
    reasoning_effort: "high",
    search_context_size: "high"
  },
  
  // Reasoning tasks - $3-8/$15-40 per 1M tokens
  reasoning: {
    model: "sonar-reasoning-pro",
    disable_search: false // Keep search for context
  }
};
```

### Tips for Cost Reduction:
1. Use `sonar` for simple fact-checking
2. Limit `search_context_size` when possible
3. Use domain filters to reduce search scope
4. Disable images/related questions if not needed
5. Cache research results for reuse

---

## 🔄 STREAMING RESPONSES

```typescript
// Stream for real-time display
const streamResearch = async (topic: string) => {
  const stream = await perplexity.chat.completions.create({
    model: "sonar-pro",
    messages: [{ role: "user", content: topic }],
    stream: true
  });
  
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
  
  // Note: search_results arrive in final chunk
};
```

---

## ⚠️ ERROR HANDLING

```typescript
const handlePerplexityError = async (error: any) => {
  if (error.status === 429) {
    // Rate limit
    await delay(exponentialBackoff(attempt));
    return retry();
  }
  
  if (error.status === 400) {
    // Invalid parameters
    console.error("Check domain filter count (max 10)");
  }
  
  if (error.status === 503) {
    // Service unavailable - use fallback
    return useFallbackProvider();
  }
};
```

---

## 📊 ASYNC OPERATIONS

### For large research tasks:
```typescript
// Create async job
const createAsyncResearch = async (topic: string) => {
  const job = await fetch('https://api.perplexity.ai/async/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      request: {
        model: "sonar-deep-research",
        messages: [{ role: "user", content: topic }],
        reasoning_effort: "high"
      }
    })
  });
  
  return job.json();
};

// Check status
const checkStatus = async (jobId: string) => {
  const status = await fetch(
    `https://api.perplexity.ai/async/chat/completions/${jobId}`,
    { headers: { 'Authorization': `Bearer ${API_KEY}` } }
  );
  
  return status.json();
};
```

---

## 🎯 BEST PRACTICES

### 1. **Choose Right Model**
- Quick facts: `sonar`
- General research: `sonar-pro`
- Academic/exhaustive: `sonar-deep-research`
- Complex analysis: `sonar-reasoning-pro`

### 2. **Optimize Search**
```typescript
// Be specific with queries
"digital marketing trends 2025" // Better than "marketing"

// Use system prompts for context
{ role: "system", content: "Focus on actionable insights" }
```

### 3. **Handle Citations**
```typescript
// Always display sources to users
response.search_results?.forEach(source => {
  displayCitation(source.title, source.url);
});
```

### 4. **Combine with Other Providers**
```typescript
// Research with Perplexity, write with Claude
const research = await perplexityResearch(topic);
const blog = await claudeWrite(research);
```

---

## 🔧 CLIENT SETUP

```typescript
// services/ai/perplexity-client.ts
import OpenAI from 'openai';

class PerplexityService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.perplexity.ai"
    });
  }
  
  // Quick research
  async quickSearch(query: string) {
    return this.client.chat.completions.create({
      model: "sonar",
      messages: [{ role: "user", content: query }],
      temperature: 0.2
    });
  }
  
  // Advanced research with filters
  async deepResearch(config: ResearchConfig) {
    return this.client.chat.completions.create({
      model: config.depth === 'deep' ? "sonar-deep-research" : "sonar-pro",
      messages: config.messages,
      search_mode: config.academic ? "academic" : "web",
      search_domain_filter: config.domains,
      search_recency_filter: config.recency,
      reasoning_effort: config.effort || "medium",
      web_search_options: {
        search_context_size: config.contextSize || "medium"
      }
    });
  }
  
  // Extract citations
  extractCitations(response: any) {
    return response.search_results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      date: r.date
    })) || [];
  }
}

export default PerplexityService;
```

---

## ✅ INTEGRATION CHECKLIST

- [ ] Set up OpenAI SDK with Perplexity base URL
- [ ] Configure API keys
- [ ] Implement search filters
- [ ] Add citation extraction
- [ ] Set up academic mode for research
- [ ] Configure domain filtering
- [ ] Add date filtering for trends
- [ ] Implement location-based search
- [ ] Set up async operations for deep research
- [ ] Add fallback to other providers
- [ ] Monitor token usage
- [ ] Cache research results