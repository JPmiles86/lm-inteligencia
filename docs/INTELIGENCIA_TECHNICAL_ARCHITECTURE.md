# Inteligencia Technical Architecture
## Complete Technical Specification for Development

### 🏗️ System Architecture Overview

#### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUBDOMAIN DETECTION                         │
│  inteligencia.com → Main Landing                           │
│  hotels.inteligencia.com → Hotels Config                   │
│  restaurants.inteligencia.com → Restaurant Config          │
│  dental.inteligencia.com → Dental Config                   │
│  sports.inteligencia.com → Sports Config                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CONFIGURATION LOADER                           │
│  - Load base configuration                                  │
│  - Apply industry-specific overrides                       │
│  - Merge content and styling                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               DYNAMIC CONTENT RENDERING                     │
│  - Industry-specific components                            │
│  - Shared layout with custom content                      │
│  - Dynamic styling and branding                           │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Project Structure

```
/Users/jpmiles/laurie-meiring-website/
├── JPMilesWebGen/                           # JP's Multi-Client Platform
│   ├── platform/
│   │   ├── src/
│   │   │   ├── components/                  # Shared platform components
│   │   │   ├── services/                    # Platform services
│   │   │   ├── utils/                       # Platform utilities
│   │   │   └── types/                       # Platform TypeScript types
│   │   ├── admin-dashboard/                 # JP's admin interface
│   │   └── api/                             # Platform API endpoints
│   ├── templates/
│   │   ├── base-template/                   # Core template structure
│   │   ├── multi-industry/                  # Multi-industry template
│   │   └── single-industry/                 # Single industry template
│   └── client-configs/
│       ├── laurie-inteligencia.json         # Laurie's config
│       └── template-defaults.json           # Default configurations
├── clients/
│   ├── laurie-pickleball/                   # Existing pickleball site
│   └── laurie-inteligencia/                 # New Inteligencia project
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/                  # Layout components
│       │   │   │   ├── Navbar.tsx
│       │   │   │   ├── Footer.tsx
│       │   │   │   └── IndustrySelector.tsx
│       │   │   ├── sections/                # Page sections
│       │   │   │   ├── HeroSection.tsx
│       │   │   │   ├── ServicesSection.tsx
│       │   │   │   ├── TeamSection.tsx
│       │   │   │   ├── TestimonialsSection.tsx
│       │   │   │   ├── PricingSection.tsx
│       │   │   │   └── ContactSection.tsx
│       │   │   ├── admin/                   # Admin interface
│       │   │   │   ├── AdminDashboard.tsx
│       │   │   │   ├── ContentEditor.tsx
│       │   │   │   ├── CSVImporter.tsx
│       │   │   │   └── ImageGenerator.tsx
│       │   │   └── shared/                  # Shared components
│       │   ├── hooks/                       # Custom React hooks
│       │   │   ├── useIndustryConfig.ts
│       │   │   ├── useContentManagement.ts
│       │   │   └── useImageGeneration.ts
│       │   ├── services/                    # API services
│       │   │   ├── configService.ts
│       │   │   ├── contentService.ts
│       │   │   └── imageService.ts
│       │   ├── types/                       # TypeScript definitions
│       │   │   ├── Industry.ts
│       │   │   ├── Content.ts
│       │   │   └── Configuration.ts
│       │   ├── utils/                       # Utility functions
│       │   │   ├── subdomainDetection.ts
│       │   │   ├── configMerger.ts
│       │   │   └── csvParser.ts
│       │   └── styles/                      # Styling
│       │       ├── globals.css
│       │       ├── components/
│       │       └── industry-themes/
│       ├── public/
│       │   ├── images/
│       │   │   ├── industries/              # Industry-specific images
│       │   │   ├── team/                    # Team photos
│       │   │   └── generated/               # AI-generated images
│       │   └── videos/                      # Background videos
│       ├── content/                         # Content files
│       │   ├── industries/
│       │   │   ├── hotels.json
│       │   │   ├── restaurants.json
│       │   │   ├── dental.json
│       │   │   └── sports.json
│       │   └── base-content.json            # Shared content
│       ├── config/                          # Configuration files
│       │   ├── industry-configs.ts
│       │   ├── subdomain-mapping.ts
│       │   └── api-config.ts
│       └── database/
│           ├── migrations/                  # Database migrations
│           └── seeds/                       # Sample data
└── docs/                                    # Project documentation
    ├── orchestrator/                        # Orchestrator documentation
    ├── sub-agents/                          # Sub-agent documentation
    └── handoffs/                            # Handoff tracking
```

### 🛠️ Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6 with subdomain detection
- **Styling**: Tailwind CSS + CSS-in-JS for dynamic themes
- **State Management**: React Context + useState/useReducer
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite for fast development and builds

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **File Storage**: Google Cloud Storage (existing)
- **Image Processing**: Sharp for optimization
- **Validation**: Zod for runtime type checking

#### Development Tools
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **Docker**: Development environment consistency

#### Deployment
- **Platform**: Vercel with serverless functions
- **Database**: Vercel Postgres or Railway
- **CDN**: Vercel Edge Network
- **SSL**: Automatic HTTPS with custom domains

### 🗄️ Database Schema Extension

#### New Tables for Multi-Industry Support

```sql
-- Industry configurations
CREATE TABLE industry_configs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, industry)
);

-- Industry-specific content
CREATE TABLE industry_content (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'services', 'team', etc.
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, industry, section_type)
);

-- Multi-industry websites
CREATE TABLE client_sites (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  site_name VARCHAR(100) NOT NULL,
  primary_domain VARCHAR(100) NOT NULL,
  industries JSONB NOT NULL DEFAULT '[]',
  config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated images tracking
CREATE TABLE generated_images (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50),
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  openai_image_id VARCHAR(100),
  usage_context VARCHAR(100), -- 'hero', 'service', 'team', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Platform analytics
CREATE TABLE platform_analytics (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  industry VARCHAR(50),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 🔧 Core TypeScript Interfaces

```typescript
// Industry configuration interface
interface IndustryConfig {
  industry: string;
  name: string;
  subdomain: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
  };
  content: {
    hero: HeroContent;
    services: ServiceContent[];
    team: TeamContent[];
    testimonials: TestimonialContent[];
    pricing: PricingContent;
    contact: ContactContent;
  };
  features: {
    blog: boolean;
    aiWriter: boolean;
    imageGeneration: boolean;
    analytics: boolean;
  };
}

// Content type definitions
interface HeroContent {
  title: string;
  subtitle: string;
  backgroundType: 'image' | 'video';
  backgroundSrc: string;
  ctaText: string;
  ctaLink: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

interface ServiceContent {
  title: string;
  description: string;
  features: string[];
  icon: string;
  results?: string;
}

interface TeamContent {
  name: string;
  title: string;
  bio: string;
  image: string;
  certifications?: string[];
}

interface TestimonialContent {
  quote: string;
  author: string;
  position: string;
  company: string;
  image?: string;
}

// Configuration management
interface ConfigManager {
  getIndustryConfig(industry: string): Promise<IndustryConfig>;
  updateIndustryConfig(industry: string, config: Partial<IndustryConfig>): Promise<void>;
  mergeConfigs(base: IndustryConfig, override: Partial<IndustryConfig>): IndustryConfig;
}
```

### 🌐 Subdomain Detection & Routing

#### Subdomain Detection Logic
```typescript
// utils/subdomainDetection.ts
export const detectIndustry = (): string => {
  if (typeof window === 'undefined') return 'main';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost development
  if (hostname.includes('localhost')) {
    const params = new URLSearchParams(window.location.search);
    return params.get('industry') || 'main';
  }
  
  // Production subdomain detection
  const subdomain = parts[0];
  const industryMap: Record<string, string> = {
    'hotels': 'hospitality',
    'restaurants': 'foodservice',
    'dental': 'healthcare',
    'sports': 'athletics',
    'inteligencia': 'main'
  };
  
  return industryMap[subdomain] || 'main';
};

// Custom hook for industry configuration
export const useIndustryConfig = () => {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const industry = detectIndustry();
        const industryConfig = await configService.getIndustryConfig(industry);
        setConfig(industryConfig);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  return { config, loading, error };
};
```

#### Dynamic Routing Configuration
```typescript
// App.tsx - Main routing logic
const App: React.FC = () => {
  const { config, loading, error } = useIndustryConfig();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorPage error={error} />;
  if (!config) return <NotFoundPage />;
  
  return (
    <BrowserRouter>
      <Routes>
        {config.industry === 'main' ? (
          <Route path="/" element={<IndustrySelector />} />
        ) : (
          <>
            <Route path="/" element={<IndustryHomePage config={config} />} />
            <Route path="/services" element={<ServicesPage config={config} />} />
            <Route path="/about" element={<AboutPage config={config} />} />
            <Route path="/contact" element={<ContactPage config={config} />} />
            <Route path="/admin" element={<AdminDashboard config={config} />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### 📊 Content Management System

#### CSV Import System
```typescript
// services/csvService.ts
interface CSVRow {
  section: string;
  field: string;
  content_type: string;
  hotels_content: string;
  restaurants_content: string;
  dental_content: string;
  sports_content: string;
  description: string;
  image_description: string;
}

export class CSVImporter {
  static async parseCSV(file: File): Promise<CSVRow[]> {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
        return obj;
      }, {} as CSVRow);
    });
  }
  
  static async importContent(csvData: CSVRow[], tenantId: string): Promise<void> {
    const industries = ['hotels', 'restaurants', 'dental', 'sports'];
    
    for (const industry of industries) {
      const industryContent = this.transformCSVToIndustryContent(csvData, industry);
      await contentService.updateIndustryContent(tenantId, industry, industryContent);
    }
  }
  
  private static transformCSVToIndustryContent(csvData: CSVRow[], industry: string): IndustryConfig {
    // Transform CSV data into structured industry configuration
    // Group by section (hero, services, team, etc.)
    // Apply industry-specific content
    // Return structured configuration object
  }
}
```

#### Admin Interface Components
```typescript
// components/admin/ContentEditor.tsx
interface ContentEditorProps {
  industry: string;
  config: IndustryConfig;
  onSave: (config: IndustryConfig) => Promise<void>;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ 
  industry, 
  config, 
  onSave 
}) => {
  const [editedConfig, setEditedConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleSectionUpdate = (section: string, content: any) => {
    setEditedConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: content
      }
    }));
    setHasChanges(true);
  };
  
  return (
    <div className="content-editor">
      <EditorHeader 
        industry={industry}
        hasChanges={hasChanges}
        onSave={() => onSave(editedConfig)}
      />
      
      <EditorTabs>
        <TabPanel label="Hero Section">
          <HeroEditor 
            content={editedConfig.content.hero}
            onChange={(hero) => handleSectionUpdate('hero', hero)}
          />
        </TabPanel>
        
        <TabPanel label="Services">
          <ServicesEditor 
            content={editedConfig.content.services}
            onChange={(services) => handleSectionUpdate('services', services)}
          />
        </TabPanel>
        
        <TabPanel label="Team">
          <TeamEditor 
            content={editedConfig.content.team}
            onChange={(team) => handleSectionUpdate('team', team)}
          />
        </TabPanel>
      </EditorTabs>
    </div>
  );
};
```

### 🎨 AI Image Generation Integration

#### OpenAI DALL-E 3 Service
```typescript
// services/imageService.ts
export class ImageGenerationService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateImage(prompt: string, industry: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: this.enhancePrompt(prompt, industry),
        size: "1792x1024",
        quality: "hd",
        n: 1,
      });
      
      const imageUrl = response.data[0].url;
      if (!imageUrl) throw new Error('No image URL returned');
      
      // Save to database for tracking
      await this.saveGeneratedImage(prompt, imageUrl, industry);
      
      return imageUrl;
    } catch (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
  
  private enhancePrompt(basePrompt: string, industry: string): string {
    const industryStyles = {
      hospitality: "professional luxury hotel style, warm lighting, modern furniture",
      foodservice: "restaurant ambiance, warm lighting, culinary excellence",
      healthcare: "clean modern medical environment, professional, trustworthy",
      athletics: "dynamic sports environment, energetic, community-focused"
    };
    
    return `${basePrompt}, ${industryStyles[industry]}, high quality professional photography, 4K resolution`;
  }
  
  async saveGeneratedImage(prompt: string, imageUrl: string, industry: string): Promise<void> {
    // Save to database for tracking and reuse
  }
}
```

### 🚀 Performance Optimization

#### Code Splitting Strategy
```typescript
// Lazy load industry-specific components
const HotelsPage = lazy(() => import('./pages/HotelsPage'));
const RestaurantsPage = lazy(() => import('./pages/RestaurantsPage'));
const DentalPage = lazy(() => import('./pages/DentalPage'));
const SportsPage = lazy(() => import('./pages/SportsPage'));

// Dynamic component loading based on industry
const IndustryPage = ({ industry }: { industry: string }) => {
  const Component = useMemo(() => {
    switch (industry) {
      case 'hospitality': return HotelsPage;
      case 'foodservice': return RestaurantsPage;
      case 'healthcare': return DentalPage;
      case 'athletics': return SportsPage;
      default: return IndustrySelector;
    }
  }, [industry]);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
};
```

#### Caching Strategy
```typescript
// Configuration caching
const configCache = new Map<string, IndustryConfig>();

export const getCachedConfig = async (industry: string): Promise<IndustryConfig> => {
  if (configCache.has(industry)) {
    return configCache.get(industry)!;
  }
  
  const config = await fetchIndustryConfig(industry);
  configCache.set(industry, config);
  
  // Cache for 1 hour
  setTimeout(() => configCache.delete(industry), 60 * 60 * 1000);
  
  return config;
};
```

### 🔒 Security Considerations

#### Input Validation
```typescript
// Zod validation schemas
export const industryConfigSchema = z.object({
  industry: z.string().min(1),
  name: z.string().min(1),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  content: z.object({
    hero: z.object({
      title: z.string().min(1).max(100),
      subtitle: z.string().min(1).max(200),
    }),
  }),
});

// API endpoint validation
export const validateIndustryConfig = (data: unknown): IndustryConfig => {
  return industryConfigSchema.parse(data);
};
```

#### Authentication & Authorization
```typescript
// JWT middleware for admin routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

This technical architecture provides a comprehensive foundation for the orchestrator and sub-agents to implement the Inteligencia multi-industry website with JP's scalable platform system.