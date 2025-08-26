# AI MVP Implementation Plan - Simplified & Focused
## Date: 2025-08-25
## Goal: Build a working AI writing system in stages

## 🎯 MVP Philosophy
**Start simple, validate early, expand based on real usage**

---

## Phase 1: Core Foundation (Week 1-2)
### Goal: Get basic AI generation working end-to-end

### Features:
1. **API Key Management**
   - Simple settings page for API keys
   - Support OpenAI and Anthropic only (Google NOW)
   - Encrypted storage in localStorage/database

2. **Single Task Generation**
   - Simple "Generate Blog" button
   - Basic prompt → response flow
   - Display result in editor
   - Provider selection dropdown

3. **Basic Context System**
   - "Include previous blogs" checkbox
   - "Include style guide" checkbox (hardcoded initially)
   - Simple token counter

### Technical Tasks:
```typescript
// Simplified initial interfaces
interface AIProvider {
  generateContent(prompt: string, context: string): Promise<string>;
  countTokens(text: string): number;
}

interface GenerationRequest {
  taskType: 'blog' | 'title' | 'idea';
  prompt: string;
  context: {
    includeStyleGuide: boolean;
    includePreviousBlogs: number[]; // blog IDs
  };
  provider: 'openai' | 'anthropic';
  model: string;
}
```

### UI: Simple Generation Panel
```
┌─────────────────────────────────────┐
│ Generate Content                     │
├─────────────────────────────────────┤
│ Prompt: [___________________]       │
│                                     │
│ Provider: [Anthropic ▼]            │
│ Model: [Claude 3 Opus ▼]           │
│                                     │
│ Context:                            │
│ [✓] Include Style Guide             │
│ [ ] Include Previous Blogs          │
│                                     │
│ [Generate] [Clear]                  │
└─────────────────────────────────────┘
```

---

## Phase 2: Multi-Option Generation (Week 3-4)
### Goal: Generate multiple options and select best

### Features:
1. **Multiple Generations**
   - Generate 3-10 options for any task
   - Display as cards
   - Select preferred option
   - Basic version tracking

2. **Task Types**
   - Blog ideas (10 options)
   - Titles (10 options)
   - Full blogs (3 options)
   - Social posts (3 per platform)

3. **Simple Branching**
   - "Try Again" with modified prompt
   - Keep history of attempts
   - Basic tree structure

### UI: Card Selection
```
┌─────────────────────────────────────┐
│ Generated Titles (Select One)        │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Title 1 │ │ Title 2 │ │ Title 3 ││
│ │         │ │         │ │         ││
│ │ [Select]│ │ [Select]│ │ [Select]││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ [Generate More] [Edit Prompt]       │
└─────────────────────────────────────┘
```

---

## Phase 3: Style Guide System (Week 5-6)
### Goal: Create and manage writing styles

### Features:
1. **Style Guide Creation**
   - Create from existing blogs
   - Create from conversation
   - Manual editing

2. **Multiple Guide Types**
   - Brand guide (1 main)
   - Vertical guides (4 industries)
   - Writing styles (professional, casual, technical)

3. **Guide Management**
   - Active/inactive toggles
   - Version history
   - Quick preview

### Implementation:
```typescript
interface StyleGuide {
  id: string;
  name: string;
  type: 'brand' | 'vertical' | 'style';
  content: string;
  active: boolean;
  version: number;
}

// Simple creation flow
async function createStyleGuide(
  method: 'from_blogs' | 'from_chat',
  input: BlogPost[] | ChatMessage[]
): Promise<StyleGuide> {
  const prompt = method === 'from_blogs' 
    ? buildAnalysisPrompt(input)
    : buildConversationPrompt(input);
    
  const guideContent = await ai.generate(prompt);
  return saveStyleGuide(guideContent);
}
```

---

## Phase 4: Content Pipeline (Week 7-8)
### Goal: Structured blog creation workflow

### Workflow:
```
1. Idea Generation
   ↓ (select one)
2. Title Options
   ↓ (select one)
3. Synopsis/Outline
   ↓ (select one)
4. Full Blog Writing
   ↓
5. Review & Edit
```

### Features:
1. **Pipeline Stages**
   - Each stage builds on previous
   - Can skip stages if desired
   - Can go back and branch

2. **Context Accumulation**
   - Each stage adds to context
   - Smart context pruning to stay under limits

3. **Edit & Feedback**
   - "Make it funnier"
   - "Add more statistics"
   - "Shorten by 20%"

---

## Phase 5: Image Integration (Week 9-10)
### Goal: Parse and generate images

### Features:
1. **Prompt Extraction**
   - Parse [IMAGE: description] from blog
   - List prompts in sidebar
   - One-click generation

2. **Prompt Editing**
   - Manual text editing
   - AI-assisted editing ("make it more cinematic")

3. **Simple Character Consistency**
   - Upload reference images
   - "Add Laurie to this image" button

### Blog Format:
```markdown
# Blog Title

Paragraph of text here...

[IMAGE: A bustling hotel lobby with guests checking in, warm lighting, professional photography]

More paragraph text...
```

---

## Phase 6: Social Media & SEO (Week 11-12)
### Goal: Extend content for distribution

### Features:
1. **Social Post Generation**
   - LinkedIn, Facebook, Instagram, X
   - Platform-specific formatting
   - Hashtag suggestions

2. **SEO Analysis**
   - Keyword density check
   - Meta description generation
   - Readability score

3. **Bulk Operations**
   - Generate all social posts at once
   - Batch SEO optimization

---

## 🏗️ Technical Architecture (Simplified)

### Frontend Structure:
```
/src/components/ai/
  ├── AIWorkspace.tsx          // Main container
  ├── GenerationPanel.tsx       // Input and controls
  ├── ResultsDisplay.tsx        // Show generations
  ├── ContextManager.tsx        // What to include
  ├── StyleGuideManager.tsx     // Guide CRUD
  └── TaskPipeline.tsx          // Workflow stages
```

### API Routes:
```
/api/ai/
  ├── generate.ts              // Main generation endpoint
  ├── style-guides.ts          // CRUD for guides
  ├── tasks.ts                 // Task management
  └── providers/
      ├── openai.ts
      ├── anthropic.ts
      └── base.ts              // Abstract interface
```

### Database:
```sql
-- Minimal schema for MVP
CREATE TABLE ai_tasks (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  prompt TEXT,
  context JSONB,
  provider VARCHAR(20),
  model VARCHAR(50),
  parent_id INTEGER REFERENCES ai_tasks(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_generations (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES ai_tasks(id),
  content TEXT,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE style_guides (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(20),
  content TEXT,
  active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎮 User Experience Flow

### Simple Generation Flow:
1. User clicks "AI Assistant" in blog editor
2. Modal opens with task selection
3. User enters prompt or uses template
4. System generates options
5. User selects preferred option
6. Content inserted into editor

### Advanced Flow (after MVP):
1. Start with idea brainstorming
2. Select idea, generate titles
3. Select title, generate outline
4. Approve outline, write blog
5. Extract image prompts
6. Generate images
7. Create social posts
8. Publish

---

## 🚫 What We're NOT Building (Yet)

1. **Complex Analytics** - Just basic token counting
2. **Collaboration** - Single user for now  
3. **Auto-publishing** - Manual publish only
4. **Training/Fine-tuning** - Use base models only
5. **Video Generation** - Future phase
6. **Complex Personas** - Simple style guides only
7. **A/B Testing** - One version at a time
8. **Translation** - English only initially

---

## ✅ Success Criteria for MVP

1. **It Works**: Can generate a blog from start to finish
2. **It's Simple**: Laurie can use it without training
3. **It's Flexible**: Can use different providers/models
4. **It Saves Time**: Faster than writing from scratch
5. **It's Consistent**: Maintains brand voice
6. **It's Reliable**: Handles errors gracefully

---

## 🔧 Implementation Priorities

### Must Have (MVP):
- API key management
- Basic generation with provider selection
- Multiple options generation
- Simple style guide
- Blog writing workflow

### Should Have (Phase 2):
- Image prompt extraction
- Social media generation
- SEO analysis
- Character consistency

### Nice to Have (Future):
- Advanced personas
- Video scripts
- A/B testing
- Analytics dashboard
- Collaboration features

---

## 📅 Timeline

**Weeks 1-2**: Foundation
- Get basic generation working
- API integration
- Simple UI

**Weeks 3-4**: Multi-option & Selection
- Generate multiple options
- Card-based selection
- Basic versioning

**Weeks 5-6**: Style Guides
- Guide creation and management
- Context integration

**Weeks 7-8**: Content Pipeline
- Full blog workflow
- Edit and feedback

**Weeks 9-10**: Images
- Prompt extraction
- Generation integration

**Weeks 11-12**: Polish
- Social media
- SEO tools
- Bug fixes

---

## 🎯 Next Immediate Steps

1. **Set up API providers abstraction**
2. **Create basic generation UI**
3. **Implement simple task → generation flow**
4. **Add provider selection**
5. **Test with real blog generation**

The key is to **start simple** and **validate each step** before adding complexity!