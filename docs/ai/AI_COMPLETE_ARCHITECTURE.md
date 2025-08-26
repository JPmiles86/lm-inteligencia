# AI Writing System - Complete Architecture
## Date: 2025-08-25
## Philosophy: Build it right from the start

---

## 🎯 Core Design Principles

1. **Flexible Generation Paths**: Support both structured workflows AND one-shot generation
2. **Multi-Vertical Aware**: Generate for 1-4 verticals in parallel or sequence
3. **Full Provider Support**: OpenAI, Anthropic, Google, Perplexity from day one
4. **Complete Context Control**: Granular selection of what to include
5. **Persistent Generation History**: Keep everything, user controls visibility

---

## 🏗️ System Architecture

### 1. Generation Modes

```typescript
type GenerationMode = 
  | 'structured'    // Step-by-step: idea → title → synopsis → blog
  | 'direct'        // Generate complete blog in one shot
  | 'batch'         // Generate multiple independent items
  | 'multi_vertical' // Generate same content for multiple verticals
  | 'edit_existing' // Modify existing blog

interface GenerationRequest {
  mode: GenerationMode;
  vertical: 'all' | 'hospitality' | 'healthcare' | 'tech' | 'athletics';
  verticalMode: 'parallel' | 'sequential' | 'adaptive'; // How to handle multiple
  task: TaskType;
  prompt: string;
  context: ContextSelection;
  provider: AIProvider;
  model: string;
  outputCount: number; // How many variations to generate
}
```

### 2. Context Management System

```typescript
interface ContextSelection {
  styleGuides: {
    brand?: boolean;
    vertical?: string[];
    writingStyle?: string[]; // IDs of active styles
    persona?: string[];
  };
  
  previousContent: {
    mode: 'none' | 'all' | 'vertical' | 'selected';
    verticalFilter?: string;
    items?: string[]; // Specific blog IDs
    includeElements: {
      titles: boolean;
      synopsis: boolean;
      content: boolean;
      tags: boolean;
      metadata: boolean;
      images: boolean;
    };
  };
  
  referenceImages: {
    style?: File[];      // "I like this style"
    logo?: File[];       // Brand assets
    persona?: File[];    // Character references
  };
  
  additionalContext?: string; // Free-form context
}

// Context Modal UI
interface ContextModal {
  // Tab 1: Style Guides
  showActiveGuides(): StyleGuide[];
  toggleGuide(guideId: string): void;
  
  // Tab 2: Previous Content
  filterByVertical(vertical: string): BlogPost[];
  selectBlogs(blogIds: string[]): void;
  toggleElements(elements: string[]): void;
  
  // Tab 3: Reference Images
  uploadReferences(type: 'style' | 'logo' | 'persona', files: File[]): void;
  
  // Tab 4: Custom Context
  addCustomContext(text: string): void;
}
```

### 3. Style Guide Management

```typescript
interface StyleGuideSystem {
  guides: {
    brand: StyleGuide;        // One main brand guide
    verticals: Map<string, StyleGuide>; // One per vertical
    writingStyles: StyleGuide[]; // Multiple (professional, casual, technical, narrative)
    personas: PersonaGuide[];  // Multiple writer personas
  };
  
  // Track active/versions
  activeGuides: Set<string>;
  versions: Map<string, StyleGuideVersion[]>;
  
  // Creation methods
  createFromBlogs(blogs: BlogPost[], type: GuideType): Promise<StyleGuide>;
  createFromChat(conversation: Message[], type: GuideType): Promise<StyleGuide>;
  createFromScratch(type: GuideType): Promise<StyleGuide>;
  
  // Management
  setActive(guideId: string): void;
  deactivate(guideId: string): void;
  updateGuide(guideId: string, changes: string): Promise<StyleGuide>;
  getContextString(): string; // Combines all active guides
}

interface PersonaGuide extends StyleGuide {
  name: string;
  perspective: string; // "female", "technical expert", etc.
  voiceCharacteristics: string[];
  referenceImages?: File[];
}
```

### 4. Generation Tree Structure

```typescript
interface GenerationNode {
  id: string;
  type: 'idea' | 'title' | 'synopsis' | 'outline' | 'blog' | 'social' | 'image';
  content: string | StructuredContent;
  
  // Relationships
  parentId?: string;     // Previous step in workflow
  childrenIds: string[]; // Next steps
  alternativeIds: string[]; // Other options at same level
  
  // Metadata
  vertical?: string;
  selected: boolean;
  visible: boolean;  // User can hide without deleting
  deleted: boolean;  // Soft delete
  
  // Provider info
  provider: string;
  model: string;
  timestamp: Date;
  cost: number;
}

// Example tree for multi-vertical generation:
/*
  [Idea: Viral Video Marketing]
    ├── [Vertical: Hospitality]
    │   ├── [Title 1] [Title 2] [Title 3] ... [Title 10]
    │   └── [Selected Title]
    │       └── [Blog Content]
    ├── [Vertical: Healthcare]
    │   ├── [Title 1] [Title 2] [Title 3] ... [Title 10]
    │   └── [Selected Title]
    │       └── [Blog Content]
    └── [Vertical: Tech]
        └── [Adapted from Hospitality version]
*/
```

### 5. Task Types & Workflows

```typescript
type TaskType = 
  // Generation tasks
  | 'style_guide_creation'
  | 'idea_generation'        // Generate blog ideas
  | 'title_generation'        // Generate titles (for idea or standalone)
  | 'synopsis_generation'     
  | 'outline_creation'
  | 'blog_writing_complete'   // Full blog in one shot
  | 'blog_writing_section'    // Just intro, body, or conclusion
  
  // Editing tasks
  | 'blog_editing'           // Edit existing blog
  | 'blog_rewriting'         // Complete rewrite
  | 'blog_adaptation'        // Adapt to different vertical
  
  // Analysis tasks
  | 'blog_analysis'          // General feedback
  | 'seo_analysis'           
  | 'readability_analysis'
  | 'brand_consistency_check'
  
  // Research
  | 'topic_research'         // Via Perplexity or web-enabled models
  | 'competitor_analysis'
  | 'trend_research'
  
  // Output generation
  | 'social_post_generation'
  | 'social_post_batch'      // All platforms at once
  | 'image_prompt_generation'
  | 'image_prompt_editing'
  | 'meta_description'
  | 'email_newsletter';

// Workflow definitions
interface Workflow {
  structured: {
    steps: ['idea', 'research?', 'titles', 'synopsis', 'outline', 'blog', 'images', 'social'];
    canSkip: boolean[];
    canBranch: boolean[];
  };
  
  direct: {
    input: 'prompt' | 'idea' | 'title';
    output: 'complete_blog';
    includes: ['title', 'tags', 'meta', 'content', 'image_prompts'];
  };
  
  multiVertical: {
    mode: 'parallel' | 'sequential' | 'adaptive';
    shareBase: boolean; // Use first as template for others
  };
}
```

### 6. Image Generation System

```typescript
interface ImageSystem {
  // Parsing
  parseImagePrompts(content: string): ImagePrompt[];
  
  // Generation
  generateImage(prompt: ImagePrompt, provider: 'openai' | 'google'): Promise<Image>;
  generateBatch(prompts: ImagePrompt[]): Promise<Image[]>;
  
  // Character consistency
  characters: Map<string, Character>;
  insertCharacter(imagePrompt: string, characterId: string): string;
  
  // Reference images
  useStyleReference(prompt: string, styleImages: File[]): string;
  includeBrandAssets(prompt: string, logos: File[]): string;
}

interface ImagePrompt {
  id: string;
  originalText: string;
  position: number; // Order in document
  type: 'hero' | 'section' | 'footer';
  
  // Editing
  editedText?: string;
  characterIds?: string[];
  styleReferences?: string[];
}

// Blog format with image placeholders:
/*
# Blog Title

Paragraph text...

[IMAGE: A bustling hotel lobby, warm lighting, professional]

More text...

[IMAGE_WITH_CHARACTER: Laurie presenting to clients, modern office]
*/
```

### 7. Provider Configuration

```typescript
interface ProviderManager {
  providers: {
    openai: {
      apiKey: string;
      models: ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'o1'];
      defaultModel: string;
      fallbackModel: string;
    };
    anthropic: {
      apiKey: string;
      models: ['claude-opus-4', 'claude-sonnet-4', 'claude-3.7-sonnet'];
      defaultModel: string;
    };
    google: {
      apiKey: string;
      models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'imagen-4'];
      defaultModel: string;
    };
    perplexity: {
      apiKey: string;
      models: ['sonar', 'pro-search'];
      defaultModel: string;
    };
  };
  
  // Task-specific defaults (user configurable)
  taskDefaults: {
    research: { provider: 'perplexity', model: 'pro-search' };
    ideation: { provider: 'anthropic', model: 'claude-opus-4' };
    writing: { provider: 'anthropic', model: 'claude-sonnet-4' };
    editing: { provider: 'openai', model: 'gpt-5' };
    analysis: { provider: 'openai', model: 'gpt-5-mini' };
    imageGeneration: { provider: 'google', model: 'imagen-4' };
  };
  
  // Override on any generation
  selectProvider(task: TaskType): { provider: string; model: string; };
  estimateCost(tokens: number, provider: string, model: string): number;
}
```

---

## 💾 Database Schema

```sql
-- Style guides with versioning
CREATE TABLE style_guides (
  id UUID PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('brand', 'vertical', 'writing_style', 'persona')),
  name VARCHAR(255) NOT NULL,
  vertical VARCHAR(20),
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES style_guides(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generation nodes (tree structure)
CREATE TABLE generation_nodes (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  content TEXT,
  structured_content JSONB,
  
  -- Tree relationships
  parent_id UUID REFERENCES generation_nodes(id),
  root_id UUID REFERENCES generation_nodes(id), -- Top of tree
  
  -- Selection/visibility
  selected BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  deleted BOOLEAN DEFAULT false,
  
  -- Metadata
  vertical VARCHAR(20),
  provider VARCHAR(20),
  model VARCHAR(50),
  prompt TEXT,
  context JSONB,
  tokens_used INTEGER,
  cost DECIMAL(10, 6),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Characters for consistency
CREATE TABLE characters (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reference_images JSONB, -- Array of image URLs
  embedding VECTOR(1536), -- For similarity matching
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reference images
CREATE TABLE reference_images (
  id UUID PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('style', 'logo', 'persona')),
  url TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Provider settings
CREATE TABLE provider_settings (
  id UUID PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  default_model VARCHAR(50),
  task_defaults JSONB,
  monthly_limit DECIMAL(10, 2),
  current_usage DECIMAL(10, 2),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI Components

### 1. Main AI Workspace

```
┌──────────────────────────────────────────────────────────┐
│ AI Writing Assistant                                      │
├─────────────┬──────────────────────────┬─────────────────┤
│             │                           │                 │
│ Task Panel  │     Main Canvas          │  Context Panel  │
│             │                           │                 │
│ ○ New Blog  │   [Current Generation]   │ Active Guides:  │
│ ○ Edit Blog │                           │ ☑ Brand         │
│ ○ Ideas     │   [Action Buttons Bar]   │ ☑ Hospitality   │
│ ○ Research  │   Edit | Regenerate |    │ ☐ Professional  │
│             │   Branch | Use This      │                 │
│ Verticals:  │                           │ Previous Blogs: │
│ ☑ All       │   [Alternative Options]  │ ☑ Last 5        │
│ ☐ Hosp      │   Card 1 | Card 2 | ...  │ ☐ Selected      │
│ ☐ Health    │                           │                 │
│             │   [Generation Tree View]  │ References:     │
│ Provider:   │   └─Idea                  │ 🖼 Style (2)    │
│ [Claude ▼]  │     ├─Title 1            │ 🏢 Logo (1)     │
│             │     └─Title 2 ✓          │ 👤 Laurie (5)   │
│             │       └─Blog              │                 │
└─────────────┴──────────────────────────┴─────────────────┘
```

### 2. Context Selection Modal

```
┌─────────────────────────────────────────────────┐
│ Select Context for Generation                   │
├──────┬──────────────────────────────────────────┤
│ Tabs │  [Guides] [Content] [Images] [Custom]    │
├──────┴──────────────────────────────────────────┤
│                                                  │
│  Previous Content Selection:                    │
│  ┌──────────────────────────────────────┐      │
│  │ Filter: [All Verticals ▼]            │      │
│  │                                      │      │
│  │ ☑ Blog 1: Halloween Marketing        │      │
│  │ ☑ Blog 2: Video Viral Strategies     │      │
│  │ ☐ Blog 3: Holiday Campaigns          │      │
│  │                                      │      │
│  │ Include from selected:               │      │
│  │ ☑ Titles  ☑ Synopsis  ☐ Full Content│      │
│  │ ☑ Tags    ☐ Metadata  ☐ Images      │      │
│  └──────────────────────────────────────┘      │
│                                                  │
│  Token Count: 3,847 / 200,000                   │
│                                                  │
│  [Cancel]                          [Add Context] │
└──────────────────────────────────────────────────┘
```

### 3. Multi-Vertical Generation

```
┌─────────────────────────────────────────────────┐
│ Generate for Multiple Verticals                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  Base Idea: "Viral Video Marketing"             │
│                                                  │
│  Generate for:                                  │
│  ☑ Hospitality  ☑ Healthcare                    │
│  ☑ Tech        ☑ Athletics                     │
│                                                  │
│  Generation Mode:                               │
│  ○ Parallel (4 separate agents)                │
│  ● Sequential (adapt from first)               │
│  ○ Adaptive (each builds on previous)          │
│                                                  │
│  Options per vertical:                          │
│  Titles: [5 ▼]  Blogs: [1 ▼]                   │
│                                                  │
│  [Generate All]                                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Strategy

### Phase 1: Complete Foundation (Weeks 1-3)
- Full database schema
- All provider integrations (OpenAI, Anthropic, Google, Perplexity)
- Basic generation with context selection
- Style guide system (all types)
- Generation tree structure

### Phase 2: Core Workflows (Weeks 4-6)
- Structured workflow (idea → title → blog)
- Direct generation (complete blog)
- Multi-vertical generation
- Edit existing blogs
- Context management UI

### Phase 3: Advanced Features (Weeks 7-9)
- Research integration
- Blog analysis (not just SEO)
- Image prompt parsing and generation
- Character consistency
- Reference image system

### Phase 4: Polish & Optimization (Weeks 10-12)
- Social media generation
- Batch operations
- Cost tracking
- Performance optimization
- Export/import

---

## 🔑 Key Decisions Made

1. **Storage**: Keep all generations forever, user controls visibility
2. **Structure**: Support both structured AND unstructured workflows
3. **Verticals**: Full multi-vertical support from start
4. **Providers**: All 4 providers from day one
5. **Context**: Granular control over what to include
6. **Style Guides**: Database-driven, versioned, multiple types
7. **Reference Images**: Support style, logo, and persona references
8. **Existing Content**: Can edit/adapt existing blogs, not just create new

---

## 📁 File Organization

```
/src/components/ai/
  ├── core/
  │   ├── AIProvider.ts         // Provider abstraction
  │   ├── ContextManager.ts     // Context selection logic
  │   ├── GenerationTree.ts     // Tree structure management
  │   └── CostTracker.ts        // Usage and cost tracking
  ├── providers/
  │   ├── OpenAIProvider.ts
  │   ├── AnthropicProvider.ts
  │   ├── GoogleProvider.ts
  │   └── PerplexityProvider.ts
  ├── ui/
  │   ├── AIWorkspace.tsx       // Main workspace
  │   ├── ContextModal.tsx      // Context selection
  │   ├── GenerationCards.tsx   // Option display
  │   ├── TreeView.tsx          // Generation tree viz
  │   └── ProviderSelector.tsx  // Provider/model selection
  ├── workflows/
  │   ├── StructuredFlow.ts     // Step-by-step generation
  │   ├── DirectGeneration.ts   // One-shot blog creation
  │   ├── MultiVertical.ts      // Multi-vertical logic
  │   └── BlogEditing.ts        // Edit existing content
  └── guides/
      ├── StyleGuideManager.ts
      ├── GuideEditor.tsx
      └── GuideVersioning.ts

/api/ai/
  ├── generate.ts
  ├── analyze.ts
  ├── research.ts
  ├── guides/
  └── images/
```

This is the complete system - built right from the start, no major refactoring needed later!