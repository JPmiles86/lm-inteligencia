# AI Content System - Complete User Flows
## Date: 2025-08-25
## Purpose: Define all user interactions before implementation

---

## 🎯 PRIMARY USER FLOWS

### Flow 1: One-Shot Blog Generation
**Goal**: Generate complete blog in single action

```mermaid
Start → Select Vertical(s) → Add Context → Generate → Review → Edit/Publish
```

1. **Entry Point**: Dashboard "Quick Generate" button
2. **Vertical Selection**:
   - Single vertical (default)
   - Multiple verticals (checkbox selection)
   - Generation strategy (parallel vs sequential)
3. **Context Modal**:
   - Style guides (auto-selected based on vertical)
   - Previous blogs (0-10 selections)
   - Brand guide (on/off)
   - Custom instructions (text field)
4. **Generation Config**:
   - Provider selection (OpenAI/Anthropic/Google)
   - Model selection (GPT-4o/Claude-3.5/Gemini-2.0)
   - Temperature/creativity setting
5. **Input Method**:
   - Topic/idea (required)
   - Target keywords (optional)
   - Target length (optional)
6. **Generation Process**:
   - Loading state with progress indicators
   - Real-time token counting
   - Cancel option
7. **Results Display**:
   - Full blog preview (Quill editor)
   - Parsed image prompts (sidebar)
   - Metadata panel (tags, excerpt, SEO)
   - Multi-vertical tabs (if applicable)
8. **Actions**:
   - Edit in place
   - Generate variations
   - Publish to blog
   - Export (multiple formats)

### Flow 2: Structured Blog Creation
**Goal**: Step-by-step blog development with control at each stage

```mermaid
Brainstorm → Select Idea → Generate Titles → Choose Title → 
Create Synopsis → Research → Outline → Write → Review
```

1. **Brainstorm Ideas**:
   - Chat interface for discussion
   - Generate 10 ideas button
   - Import previous topics
   - Save/dismiss individual ideas
2. **Title Generation**:
   - Generate 10 titles for selected idea
   - Edit titles inline
   - A/B test variations
   - Select primary title
3. **Synopsis Creation**:
   - Generate 3-5 synopsis options
   - Edit and refine
   - SEO keyword integration
4. **Research Phase** (Optional):
   - Perplexity integration
   - Source collection
   - Fact verification
   - Competitive analysis
5. **Outline Development**:
   - H1/H2/H3 structure
   - Image placement markers
   - CTA positioning
6. **Content Writing**:
   - Section-by-section generation
   - Or complete generation
   - Style guide application
7. **Review & Refinement**:
   - SEO analysis
   - Readability scoring
   - Fact checking
   - Image prompt extraction

### Flow 3: Edit Existing Blog
**Goal**: AI-assisted editing of published/draft blogs

1. **Blog Selection**:
   - Grid/list view of existing blogs
   - Filter by vertical/status/date
   - Search functionality
2. **Edit Options**:
   - "Make it more [adjective]" quick buttons
   - Custom edit instructions
   - Targeted section editing
   - Complete rewrite option
3. **Context Preservation**:
   - Maintain original metadata
   - Preserve publishing date
   - Keep revision history
4. **AI Assistance Types**:
   - Style transformation
   - Length adjustment
   - Tone modification
   - SEO optimization
   - Update with new information

### Flow 4: Multi-Vertical Generation
**Goal**: Create variations of content for different verticals

1. **Base Content Creation**:
   - Generate master version
   - Or select existing blog
2. **Vertical Selection**:
   - Choose 2-4 verticals
   - Set generation order (if sequential)
3. **Adaptation Strategy**:
   - Parallel: Independent generations
   - Sequential: Each builds on previous
   - Hybrid: Share intro, vary body
4. **Customization Per Vertical**:
   - Vertical-specific examples
   - Industry terminology
   - Unique CTAs
   - Targeted keywords
5. **Review Interface**:
   - Side-by-side comparison
   - Highlight differences
   - Bulk actions
   - Individual publishing

### Flow 5: Style Guide Management
**Goal**: Create and manage writing styles

1. **Create New Style Guide**:
   - From existing blogs (analysis)
   - From conversation (guided creation)
   - From template (preset styles)
2. **Guide Components**:
   - Tone attributes (professional, casual, etc.)
   - Sentence structure preferences
   - Vocabulary level
   - Industry terminology
   - Example paragraphs
3. **Version Control**:
   - Save as new version
   - Compare versions
   - Rollback capability
   - A/B testing
4. **Assignment**:
   - Set as default
   - Assign to vertical
   - User-specific
   - Campaign-specific

### Flow 6: Image Generation Workflow
**Goal**: Generate images from blog content

1. **Prompt Extraction**:
   - Auto-parse from blog
   - Manual prompt entry
   - AI-suggested prompts
2. **Enhancement Options**:
   - Style modifiers (cinematic, minimal, etc.)
   - Brand elements (logo placement)
   - Color scheme application
3. **Character Insertion**:
   - Select persona
   - Upload reference images
   - Position in scene
4. **Generation Settings**:
   - Provider (DALL-E 3/Imagen 3/Midjourney)
   - Size/aspect ratio
   - Number of variations
5. **Post-Generation**:
   - Select best option
   - Request variations
   - Edit prompt and regenerate
   - Save to media library

### Flow 7: Social Media Post Creation
**Goal**: Transform blog into social posts

1. **Source Selection**:
   - Published blog
   - Draft blog
   - Custom content
2. **Platform Selection**:
   - LinkedIn (professional, longer)
   - Facebook (engaging, visual)
   - Instagram (visual, hashtags)
   - X/Twitter (concise, threaded)
3. **Generation Options**:
   - Single platform
   - All platforms
   - Platform-optimized versions
4. **Customization**:
   - Add mentions/tags
   - Include links
   - Attach images
   - Schedule posting
5. **Output Format**:
   - Copy to clipboard
   - Download as doc
   - Direct platform integration (future)

---

## 🔄 CONTEXT MANAGEMENT FLOWS

### Context Selection Modal
**Triggered by**: Any generation action

**Structure**:
```
┌─────────────────────────────────┐
│ Add Context to Generation       │
├─────────────────────────────────┤
│ ☑ Brand Guide (Inteligencia)    │
│ ☑ Vertical Guide: [Dropdown]    │
│ ☑ Writing Style: [Dropdown]     │
│ ☐ Persona: [Dropdown]           │
├─────────────────────────────────┤
│ Previous Content:               │
│ ○ None                          │
│ ○ All from vertical             │
│ ● Select specific:              │
│   ☑ Blog Title 1 (3 days ago)  │
│   ☐ Blog Title 2 (1 week ago)  │
│   ☐ Blog Title 3 (2 weeks ago) │
│   [Load More...]                │
├─────────────────────────────────┤
│ Include from blogs:             │
│ ☑ Titles & Synopsis             │
│ ☐ Full Content                  │
│ ☐ Metadata Only                 │
├─────────────────────────────────┤
│ [Cancel]          [Add Context] │
└─────────────────────────────────┘
```

### Generation Tree Navigation
**Purpose**: Navigate through generation history

**Interface Elements**:
- Breadcrumb trail showing path
- Tree view in sidebar
- Version switcher dropdown
- Branch comparison view

**Actions**:
- Jump to any node
- Create new branch
- Delete branch
- Merge changes

---

## 💾 DATA MANAGEMENT FLOWS

### Storage Cleanup Flow
**Triggered by**: Blog publication

```
Blog Published → Show Cleanup Modal → 
User Selects What to Keep → Archive/Delete → Confirmation
```

**Cleanup Options**:
- Keep everything (default)
- Keep only final version
- Keep research & final
- Keep titles & final
- Custom selection

### Import/Export Flows

**Import Options**:
- CSV of blog ideas
- Previous blog exports
- Style guide JSON
- Bulk blog content

**Export Options**:
- Single blog (MD/HTML/DOCX)
- Bulk blogs (ZIP)
- Style guides (JSON)
- Analytics data (CSV)

---

## 🎨 UI COMPONENT INTERACTIONS

### Dashboard Layout
```
┌──────────────────────────────────────┐
│ Top Bar: Provider/Model Selection    │
├─────────┬────────────────────────────┤
│ Sidebar │ Main Content Area          │
│         │                            │
│ Actions │ Blog Editor/Preview        │
│ Tree    │                            │
│ History │                            │
├─────────┼────────────────────────────┤
│         │ Bottom: Metadata/Analytics │
└─────────┴────────────────────────────┘
```

### Quick Actions Bar
- Generate Blog
- Create from Idea
- Edit Existing
- Manage Styles
- View Analytics

### Generation Status Indicators
- Pending (gray)
- In Progress (pulsing blue)
- Complete (green)
- Error (red)
- Cancelled (orange)

---

## 🔔 NOTIFICATION FLOWS

### Real-time Notifications
- Generation started
- Generation complete
- Error occurred
- Token limit warning
- API rate limit reached

### Email Notifications (Future)
- Daily generation summary
- Weekly analytics
- API usage alerts

---

## ⚡ QUICK WINS SECTION
*For Laurie's immediate productivity*

### Preset Buttons
1. **"Generate Halloween Blog"** (seasonal)
2. **"Create 4 Vertical Versions"**
3. **"Weekly Content Plan"**
4. **"Transform to Social"**
5. **"Quick SEO Check"**

### Keyboard Shortcuts
- `Cmd+G`: Quick generate
- `Cmd+E`: Edit mode
- `Cmd+S`: Save draft
- `Cmd+P`: Publish
- `Cmd+/`: AI assist

### Templates
- Event announcement
- Service spotlight
- Case study
- How-to guide
- Industry trends

---

## 🚨 ERROR HANDLING FLOWS

### API Failures
- Show error message
- Offer retry
- Switch provider option
- Save draft locally

### Rate Limits
- Warning at 80%
- Block at 100%
- Show reset time
- Suggest alternative provider

### Content Issues
- Inappropriate content filter
- Plagiarism check
- Fact verification warnings
- Brand guideline violations

---

## 📊 ANALYTICS FLOWS

### Performance Tracking
- Tokens used per generation
- Cost per blog
- Time to generate
- Edit iterations
- Publishing frequency

### Content Analytics
- Most successful topics
- Best performing styles
- Optimal content length
- Engagement by vertical

---

## 🔐 SETTINGS & CONFIGURATION

### API Management
1. Add/remove API keys
2. Set spending limits
3. Configure defaults
4. View usage history

### User Preferences
1. Default vertical
2. Preferred model
3. Auto-save frequency
4. UI theme
5. Notification settings

### Team Management (Future)
1. User roles
2. Approval workflows
3. Content ownership
4. Audit logs