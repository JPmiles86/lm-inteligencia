# AI Implementation Architecture - First Principles Design
## Date: 2025-08-25
## Status: PLANNING PHASE

## 🎯 Core Philosophy
**Keep it simple, make it powerful, build it modular**

### Design Principles:
1. **Task-Based Architecture**: Each AI operation is a discrete task with clear inputs/outputs
2. **Provider Agnostic**: Standardized interfaces work with OpenAI, Anthropic, Google
3. **Version Control Native**: Every generation creates a branch in a tree structure
4. **Context Aware**: Smart context management without overwhelming the AI
5. **Modular & Reusable**: Components can be lifted to other projects

---

## 🏗️ System Architecture

### 1. Core Entities

```typescript
// The fundamental building blocks
interface AITask {
  id: string;
  type: TaskType;
  inputs: TaskInput;
  outputs: TaskOutput[];
  provider: AIProvider;
  model: string;
  parentId?: string; // For branching/versioning
  metadata: TaskMetadata;
}

type TaskType = 
  | 'style_guide_creation'
  | 'idea_generation'
  | 'title_generation'
  | 'synopsis_generation'
  | 'research'
  | 'outline_creation'
  | 'blog_writing'
  | 'blog_editing'
  | 'blog_analysis'  
  | 'seo_analysis'
  | 'social_post_generation'
  | 'image_prompt_generation'
  | 'image_prompt_editing';

interface StyleGuide {
  id: string;
  name: string;
  type: 'brand' | 'vertical' | 'writing_style' | 'persona';
  version: number;
  content: string;
  verticalId?: 'hospitality' | 'healthcare' | 'tech' | 'athletics';
  parentId?: string; // For version history
  createdAt: Date;
  updatedAt: Date;
}

interface Generation {
  id: string;
  taskId: string;
  content: string | StructuredContent;
  selected: boolean;
  hidden: boolean;
  metadata: {
    provider: string;
    model: string;
    timestamp: Date;
    tokenCount?: number;
    cost?: number;
  };
}
```

### 2. Task Flow Structure

```
[Idea] 
  └── [Title Generation] → 10 title options
       └── [Selected Title]
            ├── [Synopsis Generation] → 3 synopsis options
            ├── [Research] → Research document
            └── [Outline Generation] → 2-3 outline options
                 └── [Blog Writing] → Full blog
                      ├── [SEO Analysis] → Score & suggestions
                      ├── [Editing] → Revised version
                      ├── [Image Prompt Extraction] → List of prompts
                      │    └── [Image Generation] → Generated images
                      └── [Social Post Generation] → Platform-specific posts
```

---

## 📦 Feature Modules

### Module 1: Style Guide Management

**Purpose**: Create and manage writing guidelines at multiple levels

**Components**:
- **Brand Style Guide**: Overall Inteligencia voice and tone
- **Vertical Guides**: Industry-specific adaptations (4 verticals)
- **Writing Styles**: Different tones (informational, narrative, statistical, creative)
- **Persona Guides**: Individual writer perspectives

**Key Features**:
```typescript
interface StyleGuideManager {
  // Creation methods
  createFromExistingContent(blogs: BlogPost[]): Promise<StyleGuide>;
  createFromConversation(messages: Message[]): Promise<StyleGuide>;
  
  // Version management
  updateGuide(guideId: string, changes: string): Promise<StyleGuide>;
  revertToVersion(guideId: string, version: number): Promise<StyleGuide>;
  
  // Usage
  getActiveGuides(vertical?: string): StyleGuide[];
  combineGuides(guides: StyleGuide[]): string; // For context
}
```

**UI/UX**:
- Card-based display of active guides
- Version history sidebar
- Quick toggle for which guides to include in generation
- Edit mode with AI assistance or manual editing

---

### Module 2: Content Generation Pipeline

**Purpose**: Structured approach to content creation with branching

**Stages**:
1. **Ideation** → Chat or structured input
2. **Title Generation** → Multiple options (typically 10)
3. **Synopsis/Excerpt** → Brief descriptions (3-5 options)
4. **Research** (Optional) → Via Perplexity or other
5. **Outline Creation** → Structure planning
6. **Full Blog Writing** → Complete article
7. **Refinement** → Editing, SEO optimization

**Key Features**:
```typescript
interface ContentPipeline {
  // Each stage can branch
  generateOptions(
    stage: PipelineStage,
    context: Context,
    count: number
  ): Promise<Generation[]>;
  
  // Select and continue
  selectAndProceed(
    generationId: string,
    nextStage: PipelineStage
  ): Promise<Task>;
  
  // Branch from any point
  createBranch(
    fromGenerationId: string,
    newPrompt: string
  ): Promise<Generation>;
  
  // Context management
  buildContext(
    includeGuides: string[],
    includePreviousBlogs: string[],
    includeResearch: boolean
  ): Context;
}
```

**UI/UX**:
- Tree visualization showing generation flow
- Card grid for selecting from multiple options
- Inline editing with "Regenerate" and "Edit Prompt" buttons
- Context sidebar showing what's being included

---

### Module 3: Image Generation System

**Purpose**: Parse, edit, and generate images with consistency

**Key Features**:
```typescript
interface ImageSystem {
  // Parse prompts from blog content
  extractImagePrompts(blogContent: string): ImagePrompt[];
  
  // Edit prompts
  editPromptManually(prompt: ImagePrompt, changes: string): ImagePrompt;
  editPromptWithAI(prompt: ImagePrompt, instruction: string): Promise<ImagePrompt>;
  
  // Character consistency
  createCharacter(name: string, images: File[]): Promise<Character>;
  insertCharacter(prompt: ImagePrompt, character: Character): ImagePrompt;
  
  // Generation
  generateImage(prompt: ImagePrompt, provider: 'openai' | 'google'): Promise<Image>;
}

interface ImagePrompt {
  id: string;
  originalText: string;
  editedText?: string;
  position: 'hero' | 'inline' | 'footer';
  blogSection?: number; // Which paragraph it follows
}
```

**UI/UX**:
- Sidebar with extracted prompts
- One-click generate or edit mode
- Character library with drag-and-drop
- Preview in context of blog

---

### Module 4: Provider & Model Management

**Purpose**: Flexible AI provider selection with smart defaults

**Configuration**:
```typescript
interface ProviderConfig {
  providers: {
    openai?: { apiKey: string; defaultModel: string; };
    anthropic?: { apiKey: string; defaultModel: string; };
    google?: { apiKey: string; defaultModel: string; };
    perplexity?: { apiKey: string; defaultModel: string; };
  };
  
  taskDefaults: {
    research: { provider: 'perplexity', model: 'default' };
    writing: { provider: 'anthropic', model: 'claude-4-sonnet' };
    editing: { provider: 'openai', model: 'gpt-4' };
    imageGeneration: { provider: 'google', model: 'imagen-3' };
    // ... etc
  };
}
```

**UI/UX**:
- Settings page for API keys (encrypted storage)
- Task-specific default configuration
- Override dropdown on each generation
- Usage tracking and cost estimation

---

### Module 5: Social Media Generation

**Purpose**: Transform blogs into platform-specific social posts

**Key Features**:
```typescript
interface SocialGenerator {
  generatePost(
    blog: BlogPost,
    platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter',
    style?: 'professional' | 'casual' | 'promotional'
  ): Promise<SocialPost>;
  
  generateMultiple(
    blog: BlogPost,
    platforms: Platform[]
  ): Promise<SocialPost[]>;
}

interface SocialPost {
  platform: string;
  content: string;
  hashtags: string[];
  imagePrompt?: string;
  characterLimit: number;
}
```

---

## 💾 Data Management Strategy

### Storage Approach:
1. **Active Generations**: Keep in database
2. **Selected/Used**: Permanent storage
3. **Unselected Options**: Soft delete after 30 days
4. **Branches**: Maintain full tree for active projects
5. **Archives**: Export completed projects as JSON

### Database Schema:
```sql
-- Core tables
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY,
  type VARCHAR(50),
  parent_id UUID REFERENCES ai_tasks(id),
  inputs JSONB,
  provider VARCHAR(20),
  model VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE generations (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES ai_tasks(id),
  content TEXT,
  structured_content JSONB,
  selected BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP
);

CREATE TABLE style_guides (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(20),
  vertical VARCHAR(20),
  version INTEGER,
  content TEXT,
  parent_id UUID REFERENCES style_guides(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE characters (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  images JSONB, -- URLs to stored images
  embedding VECTOR(1536), -- For similarity matching
  created_at TIMESTAMP
);
```

---

## 🎨 UI/UX Design Patterns

### 1. Main Workspace
```
┌─────────────────────────────────────────────────────┐
│ [Toolbar: New Task | Settings | Active Guides]       │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│  Task Tree    │         Main Canvas                │
│               │                                     │
│  ├─ Idea      │    [Selected Generation Display]   │
│  └─ Titles    │                                     │
│    ├─ T1      │    [Action Buttons]                │
│    ├─ T2 ✓    │    [Edit] [Regenerate] [Continue]  │
│    └─ T3      │                                     │
│               │                                     │
├───────────────┴─────────────────────────────────────┤
│ Context Bar: [✓ Brand Guide] [✓ Vertical] [  Previous Blogs] │
└─────────────────────────────────────────────────────┘
```

### 2. Generation Cards
- Grid layout for multiple options
- Quick actions (select, hide, delete)
- Preview on hover
- Drag to reorder preferences

### 3. Context Manager
- Checkbox list of available context
- Token count indicator
- "Smart Select" based on task type

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema setup
- [ ] Provider abstraction layer
- [ ] Basic task/generation system
- [ ] Simple UI for single-task generation

### Phase 2: Style Guides (Weeks 3-4)
- [ ] Style guide CRUD operations
- [ ] Version management
- [ ] Context integration
- [ ] Guide editor UI

### Phase 3: Content Pipeline (Weeks 5-8)
- [ ] Multi-stage generation flow
- [ ] Branching/tree structure
- [ ] Selection and progression logic
- [ ] Tree visualization UI

### Phase 4: Advanced Features (Weeks 9-12)
- [ ] Image prompt extraction and editing
- [ ] Character consistency system
- [ ] Social media generation
- [ ] SEO analysis integration

### Phase 5: Polish & Optimization (Weeks 13-16)
- [ ] Performance optimization
- [ ] Cost tracking and alerts
- [ ] Export/import functionality
- [ ] Analytics dashboard

---

## 🔑 Critical Success Factors

### 1. **Simplicity First**
- Start with single-task generation
- Add complexity gradually
- Always provide sensible defaults

### 2. **Context Intelligence**
- Don't send everything every time
- Smart context selection based on task
- Token limit awareness

### 3. **Version Control Native**
- Every generation is saved
- Easy branching and comparison
- Clear parent-child relationships

### 4. **Provider Flexibility**
- Abstract provider differences
- Consistent interface regardless of AI
- Easy to add new providers

### 5. **Modular Architecture**
- Each module can work independently
- Clear interfaces between modules
- Easily portable to other projects

---

## 🤔 Open Questions & Decisions Needed

1. **Storage Strategy**: How long to keep unselected generations?
2. **Context Limits**: Max tokens to send per request?
3. **Branching Depth**: How many levels of branching to support?
4. **Character Consistency**: Use embeddings or just prompt engineering?
5. **Cost Management**: Pre-approve spending limits per task?
6. **Research Integration**: Build custom or use Perplexity API?
7. **SEO Analysis**: Build custom or integrate existing tool?

---

## 💡 Additional Ideas for Consideration

1. **Templates System**: Pre-built workflows for common tasks
2. **Collaboration**: Multiple users working on same content?
3. **Scheduling**: Auto-publish when content is approved?
4. **A/B Testing**: Generate variations for testing?
5. **Analytics Integration**: Track which AI content performs best?
6. **Voice/Tone Analyzer**: Ensure consistency across content?
7. **Fact Checking**: Integration with fact-checking services?
8. **Translation**: Multi-language support?

---

## 📝 Next Steps

1. **Validate Architecture**: Review and refine based on feedback
2. **Technical Spike**: Test provider integrations
3. **UI Mockups**: Create detailed wireframes
4. **Database Design**: Finalize schema
5. **MVP Scope**: Define Phase 1 features precisely
6. **Begin Implementation**: Start with provider abstraction layer