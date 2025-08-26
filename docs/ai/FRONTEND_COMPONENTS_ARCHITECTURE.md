# Frontend Components Architecture
## AI Content Generation System
## Date: 2025-08-25

---

## 🏗️ COMPONENT HIERARCHY

```
App
├── AIContentDashboard
│   ├── ProviderSelector
│   ├── QuickActions
│   ├── GenerationWorkspace
│   │   ├── GenerationModeSelector
│   │   ├── ContentEditor
│   │   ├── GenerationTree
│   │   └── MetadataPanel
│   ├── ContextManager
│   └── NotificationCenter
├── Modals
│   ├── ContextSelectionModal
│   ├── CleanupModal
│   ├── StyleGuideModal
│   └── MultiVerticalModal
└── Shared
    ├── LoadingStates
    ├── ErrorBoundaries
    └── Analytics
```

---

## 📦 CORE COMPONENTS

### 1. AIContentDashboard
**Purpose**: Main container for AI content system

```typescript
interface AIContentDashboardProps {
  user: User;
  activeVertical?: Vertical;
  apiKeys: APIKeyConfig;
}

interface AIContentDashboardState {
  activeMode: 'quick' | 'structured' | 'edit';
  currentGeneration: Generation | null;
  generationTree: TreeNode[];
  selectedProvider: Provider;
  selectedModel: Model;
}
```

**Features**:
- Provider/model selection
- Mode switching
- Generation state management
- Tree navigation

### 2. GenerationWorkspace
**Purpose**: Main working area for content generation

```typescript
interface GenerationWorkspaceProps {
  mode: GenerationMode;
  generation: Generation;
  onGenerate: (config: GenerationConfig) => void;
  onEdit: (content: string) => void;
  onBranch: (nodeId: string) => void;
}

interface Generation {
  id: string;
  type: 'blog' | 'title' | 'synopsis' | 'outline';
  content: string | string[];
  metadata: GenerationMetadata;
  parentId?: string;
  children: string[];
  status: 'pending' | 'generating' | 'complete' | 'error';
}
```

**Sub-components**:
- ContentEditor (Quill-based)
- GenerationControls
- ParsedElements (image prompts, metadata)
- VersionSelector

### 3. ContextManager
**Purpose**: Handle context selection and management

```typescript
interface ContextManagerProps {
  vertical: Vertical;
  availableGuides: Guide[];
  previousBlogs: Blog[];
  onContextSelect: (context: Context) => void;
}

interface Context {
  brandGuide: boolean;
  verticalGuide?: string;
  styleGuide?: string;
  persona?: string;
  previousContent: {
    blogs: string[];
    includeTypes: ('title' | 'synopsis' | 'content' | 'metadata')[];
  };
  customInstructions?: string;
}
```

**Features**:
- Guide selection dropdowns
- Blog multi-select with filters
- Context preview
- Quick presets

### 4. GenerationTree
**Purpose**: Visualize and navigate generation history

```typescript
interface GenerationTreeProps {
  tree: TreeNode[];
  activeNode: string;
  onNodeSelect: (nodeId: string) => void;
  onBranch: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

interface TreeNode {
  id: string;
  type: GenerationType;
  label: string;
  timestamp: Date;
  status: GenerationStatus;
  children: TreeNode[];
  metadata: {
    tokens: number;
    cost: number;
    provider: string;
    model: string;
  };
}
```

**Features**:
- Interactive tree visualization
- Node actions (view, branch, delete)
- Status indicators
- Metadata tooltips

### 5. MultiVerticalGenerator
**Purpose**: Handle multi-vertical content generation

```typescript
interface MultiVerticalGeneratorProps {
  baseContent?: string;
  verticals: Vertical[];
  strategy: 'parallel' | 'sequential' | 'hybrid';
  onGenerate: (config: MultiVerticalConfig) => void;
}

interface MultiVerticalConfig {
  verticals: Vertical[];
  strategy: GenerationStrategy;
  shareIntro: boolean;
  customizePerVertical: Map<Vertical, VerticalCustomization>;
}
```

**Features**:
- Vertical selection checkboxes
- Strategy selector
- Per-vertical customization
- Progress tracking

### 6. ContentEditor
**Purpose**: Rich text editing with AI assistance

```typescript
interface ContentEditorProps {
  content: string;
  mode: 'edit' | 'preview' | 'compare';
  onChange: (content: string) => void;
  onAIAssist: (instruction: string) => void;
  parsedElements?: ParsedElements;
}

interface ParsedElements {
  images: ImagePrompt[];
  headings: Heading[];
  metadata: BlogMetadata;
}
```

**Features**:
- Quill editor integration
- AI assist panel
- Image prompt extraction
- Format preservation
- Side-by-side comparison

### 7. StyleGuideManager
**Purpose**: Create and manage style guides

```typescript
interface StyleGuideManagerProps {
  guides: StyleGuide[];
  activeGuide?: string;
  onCreateGuide: (method: 'analysis' | 'conversation' | 'template') => void;
  onEditGuide: (guideId: string, updates: Partial<StyleGuide>) => void;
  onSetActive: (guideId: string) => void;
}

interface StyleGuide {
  id: string;
  name: string;
  vertical?: Vertical;
  tone: ToneAttributes;
  structure: StructurePreferences;
  vocabulary: VocabularySettings;
  examples: string[];
  version: number;
  active: boolean;
}
```

**Features**:
- Guide creation wizard
- Version management
- A/B testing setup
- Example management

### 8. ImageGenerationPanel
**Purpose**: Handle image generation from prompts

```typescript
interface ImageGenerationPanelProps {
  prompts: ImagePrompt[];
  onGenerate: (prompt: ImagePrompt, config: ImageConfig) => void;
  onEdit: (promptId: string, newPrompt: string) => void;
  personas?: Persona[];
}

interface ImagePrompt {
  id: string;
  originalPrompt: string;
  editedPrompt?: string;
  position: number;
  generated?: GeneratedImage[];
}

interface ImageConfig {
  provider: 'dalle3' | 'imagen3' | 'midjourney';
  size: ImageSize;
  style?: string;
  persona?: string;
  referenceImages?: string[];
}
```

**Features**:
- Prompt list with edit capability
- AI prompt enhancement
- Provider selection
- Character insertion
- Batch generation

### 9. SocialMediaGenerator
**Purpose**: Transform blogs to social posts

```typescript
interface SocialMediaGeneratorProps {
  source: Blog;
  platforms: Platform[];
  onGenerate: (config: SocialConfig) => void;
}

interface SocialConfig {
  platforms: Platform[];
  includeImages: boolean;
  includeLinks: boolean;
  hashtags: 'auto' | 'custom' | 'none';
  customizations: Map<Platform, PlatformCustomization>;
}
```

**Features**:
- Platform selection
- Preview per platform
- Customization options
- Bulk generation

### 10. ProviderConfigPanel
**Purpose**: Manage API keys and settings

```typescript
interface ProviderConfigPanelProps {
  providers: ProviderConfig[];
  onUpdateKey: (provider: string, key: string) => void;
  onSetDefault: (provider: string, model: string) => void;
  onSetLimit: (provider: string, limit: number) => void;
}

interface ProviderConfig {
  name: 'openai' | 'anthropic' | 'google' | 'perplexity';
  apiKey?: string;
  models: Model[];
  defaultModel?: string;
  usageLimit?: number;
  currentUsage: number;
}
```

**Features**:
- Secure key input
- Model selection
- Usage tracking
- Limit setting

---

## 🎨 UI COMPONENTS

### LoadingStates
```typescript
interface LoadingStateProps {
  type: 'spinner' | 'progress' | 'skeleton';
  message?: string;
  progress?: number;
  estimatedTime?: number;
}
```

### ErrorBoundary
```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: string[];
}
```

### TokenCounter
```typescript
interface TokenCounterProps {
  current: number;
  limit?: number;
  cost?: number;
  provider: string;
}
```

### GenerationStatus
```typescript
interface GenerationStatusProps {
  status: 'idle' | 'generating' | 'complete' | 'error';
  message?: string;
  details?: GenerationDetails;
}
```

---

## 🔌 HOOKS & UTILITIES

### Custom Hooks
```typescript
// Generation management
useGeneration(config: GenerationConfig): GenerationResult
useGenerationTree(): TreeOperations
useMultiVertical(verticals: Vertical[]): MultiVerticalOperations

// Context management  
useContext(vertical: Vertical): ContextOperations
useStyleGuide(guideId: string): StyleGuideOperations

// Provider management
useProvider(provider: string): ProviderOperations
useTokenTracking(): TokenTrackingData

// Storage & persistence
useAutoSave(content: string, interval: number)
useGenerationHistory(): HistoryOperations
useCleanupPrompt(blogId: string): CleanupOperations
```

### Utility Functions
```typescript
// Content parsing
parseImagePrompts(content: string): ImagePrompt[]
extractMetadata(content: string): BlogMetadata
parseHeadings(content: string): Heading[]

// Generation utilities
buildPrompt(context: Context, instruction: string): string
calculateTokens(text: string, model: string): number
estimateCost(tokens: number, provider: string): number

// Tree operations
findNode(tree: TreeNode[], nodeId: string): TreeNode | null
createBranch(node: TreeNode, content: string): TreeNode
pruneTree(tree: TreeNode[], keepIds: string[]): TreeNode[]
```

---

## 📊 STATE MANAGEMENT

### Redux Store Structure
```typescript
interface AIContentState {
  generation: {
    current: Generation | null;
    history: Generation[];
    tree: TreeNode[];
    activeNode: string;
  };
  
  context: {
    selected: Context;
    guides: Guide[];
    previousBlogs: Blog[];
  };
  
  providers: {
    config: Map<string, ProviderConfig>;
    active: string;
    model: string;
  };
  
  ui: {
    mode: GenerationMode;
    loading: boolean;
    errors: Error[];
    notifications: Notification[];
  };
  
  analytics: {
    tokensUsed: number;
    totalCost: number;
    generationCount: number;
    successRate: number;
  };
}
```

### Actions
```typescript
// Generation actions
startGeneration(config: GenerationConfig)
completeGeneration(result: GenerationResult)
cancelGeneration()
createBranch(nodeId: string)
deleteNode(nodeId: string)

// Context actions
updateContext(context: Partial<Context>)
selectGuide(guideId: string)
selectBlogs(blogIds: string[])

// Provider actions
setProvider(provider: string)
setModel(model: string)
updateApiKey(provider: string, key: string)

// UI actions
setMode(mode: GenerationMode)
showNotification(notification: Notification)
clearErrors()
```

---

## 🎯 COMPONENT GUIDELINES

### Performance Optimization
- Lazy load heavy components (Editor, Tree)
- Memoize expensive calculations
- Virtual scrolling for long lists
- Debounce API calls
- Progressive rendering for content

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly interactions
- Collapsible panels for mobile
- Adaptive layouts

### Error Handling
- Graceful degradation
- User-friendly error messages
- Retry mechanisms
- Fallback UI states
- Error logging

---

## 🔄 DATA FLOW

### Generation Flow
```
User Input → Context Selection → Provider Selection → 
API Call → Response Processing → Content Display → 
Tree Update → Analytics Update
```

### Context Flow
```
Guide Selection → Blog Selection → Custom Instructions →
Context Building → Prompt Enhancement → API Request
```

### Storage Flow
```
Generation Complete → Auto-save → Tree Update →
Cleanup Prompt (on publish) → Archive/Delete →
Storage Update
```

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Component rendering
- Hook behavior
- Utility functions
- State reducers

### Integration Tests
- Component interactions
- API integration
- State management
- Data persistence

### E2E Tests
- Complete generation flow
- Multi-vertical generation
- Context selection
- Error scenarios

---

## 📝 IMPLEMENTATION NOTES

### Phase 1 Components (MVP)
1. AIContentDashboard
2. GenerationWorkspace
3. ContentEditor
4. ProviderConfigPanel
5. Basic ContextManager

### Phase 2 Components
1. GenerationTree
2. MultiVerticalGenerator
3. StyleGuideManager
4. ImageGenerationPanel
5. Advanced ContextManager

### Phase 3 Components
1. SocialMediaGenerator
2. Analytics Dashboard
3. Team Management
4. Advanced Personas
5. Video Integration

### Critical Dependencies
- Quill.js for rich text editing
- D3.js for tree visualization
- React DnD for drag interactions
- Zustand/Redux for state management
- React Query for API management