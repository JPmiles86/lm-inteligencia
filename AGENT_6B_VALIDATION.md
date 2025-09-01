# Agent-6B: Input Validation & Sanitization
**Role:** Validation & Security Specialist
**Phase:** 6B - Error Handling & Resilience
**Duration:** 12 hours
**Status:** ASSIGNED

## 📋 YOUR ASSIGNMENT

You are Agent-6B, responsible for implementing comprehensive input validation, sanitization, and security measures throughout the AI blog writing system.

## 🎯 OBJECTIVES

1. **Add Zod Schemas** - Validate all inputs with Zod
2. **Implement XSS Prevention** - Sanitize all user inputs
3. **Add SQL Injection Protection** - Secure database queries
4. **Create Input Limits** - Enforce size/length constraints
5. **Add Rate Limiting** - Prevent abuse
6. **Sanitize Markdown** - Safe markdown rendering

## 📁 CONTEXT FILES TO READ

Before starting, read these files in order:
1. `/MASTER_PROGRESS_LOG.md` - See overall progress
2. `/PHASE_6_ERROR_HANDLING.md` - Phase 6 overview
3. `/AGENT_6A_PROGRESS.md` - See what Agent-6A completed
4. `/api/routes/*.ts` - All API endpoints
5. `/src/db/schema.ts` - Database schema

## ✅ DETAILED TASKS

### Task 1: Zod Schema Implementation
**Location:** `/src/schemas/`

Create validation schemas for:
```typescript
// Generation Request Schema
const GenerationRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  provider: z.enum(['openai', 'anthropic', 'google', 'perplexity']),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(150000),
  vertical: z.string().optional(),
  styleGuideId: z.number().optional(),
});

// Blog Post Schema
const BlogPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(100).max(100000),
  excerpt: z.string().max(500),
  tags: z.array(z.string()).max(20),
  verticalId: z.number(),
  status: z.enum(['draft', 'published', 'archived']),
});

// Provider Configuration Schema
const ProviderConfigSchema = z.object({
  name: z.string(),
  apiKey: z.string().min(20).max(200),
  models: z.array(z.string()),
  maxTokens: z.number(),
  rateLimit: z.number(),
});

// Image Generation Schema
const ImageGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract']),
  size: z.enum(['256x256', '512x512', '1024x1024']),
  count: z.number().min(1).max(4),
});
```

### Task 2: XSS Prevention
**Location:** `/src/utils/sanitization.ts`

Implement sanitization for:
- User-generated content
- Markdown content
- HTML rendering
- Form inputs
- API responses

```typescript
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};

export const sanitizeMarkdown = (markdown: string): string => {
  const html = marked(markdown);
  return sanitizeHTML(html);
};
```

### Task 3: SQL Injection Protection
**Location:** `/api/utils/database.ts`

Secure all database operations:
- Use parameterized queries only
- Validate all inputs before queries
- Escape special characters
- Implement query builders safely

```typescript
// NEVER do this:
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ALWAYS do this:
const query = db.select().from(users).where(eq(users.id, userId));
```

### Task 4: Input Length Limits
Define and enforce limits:

| Input Type | Min | Max | Notes |
|------------|-----|-----|-------|
| Blog Title | 1 | 200 | Characters |
| Blog Content | 100 | 100,000 | Characters |
| AI Prompt | 1 | 10,000 | Characters |
| Tags | 1 | 50 | Per tag |
| File Upload | - | 10MB | File size |
| API Key | 20 | 200 | Characters |
| Username | 3 | 50 | Characters |
| Password | 8 | 128 | Characters |

### Task 5: Rate Limiting
**Location:** `/api/middleware/rateLimit.ts`

Implement rate limiting for:
```typescript
// API Endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// AI Generation
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 generations per minute
  keyGenerator: (req) => req.user?.id || req.ip,
});

// File Upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
});
```

### Task 6: Markdown Sanitization
**Location:** `/src/utils/markdown.ts`

Safe markdown processing:
- Remove script tags
- Sanitize links
- Validate image sources
- Prevent code injection
- Safe HTML conversion

## 🔧 IMPLEMENTATION GUIDELINES

### Validation Pattern
```typescript
// API Route with Validation
export const createBlogPost = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validated = BlogPostSchema.parse(req.body);
    
    // Sanitize content
    validated.content = sanitizeMarkdown(validated.content);
    validated.title = sanitizeText(validated.title);
    
    // Process request
    const result = await blogService.create(validated);
    
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    throw error;
  }
};
```

### Frontend Validation
```typescript
// Form Component with Validation
const BlogForm = () => {
  const form = useForm({
    resolver: zodResolver(BlogPostSchema),
  });
  
  const onSubmit = async (data) => {
    // Client-side validation passed
    // Additional sanitization before sending
    const sanitized = {
      ...data,
      content: sanitizeMarkdown(data.content),
    };
    
    await api.createBlog(sanitized);
  };
};
```

## 📊 SUCCESS CRITERIA

1. **Validation Coverage**
   - [ ] All API endpoints validated
   - [ ] All forms validated
   - [ ] All database inputs validated
   - [ ] File uploads validated

2. **Security Measures**
   - [ ] XSS prevention implemented
   - [ ] SQL injection impossible
   - [ ] CSRF protection added
   - [ ] Rate limiting active

3. **User Experience**
   - [ ] Clear validation messages
   - [ ] Real-time form validation
   - [ ] Helpful error messages
   - [ ] No false positives

4. **Performance**
   - [ ] Validation < 10ms
   - [ ] No blocking operations
   - [ ] Efficient sanitization
   - [ ] Minimal overhead

## 🚨 SECURITY CHECKLIST

- [ ] Never trust user input
- [ ] Validate on both client and server
- [ ] Sanitize before storage
- [ ] Escape before display
- [ ] Use parameterized queries
- [ ] Implement CORS properly
- [ ] Add CSRF tokens
- [ ] Secure file uploads
- [ ] Validate file types
- [ ] Check file sizes
- [ ] Scan for malware patterns
- [ ] Log security events

## 📝 DOCUMENTATION REQUIREMENTS

Create/Update these files:
1. `AGENT_6B_PROGRESS.md` - Track your progress
2. `AGENT_6B_IMPLEMENTATION.md` - Document implementation
3. `docs/SECURITY_GUIDE.md` - Security best practices
4. `docs/VALIDATION_RULES.md` - All validation rules

## 🎬 GETTING STARTED

1. Create `AGENT_6B_PROGRESS.md` to track work
2. Install required packages:
   ```bash
   npm install zod @hookform/resolvers dompurify
   npm install --save-dev @types/dompurify
   npm install express-rate-limit
   npm install helmet cors
   ```
3. Start with Zod schemas
4. Test each validation thoroughly
5. Document all security measures

## ⚡ TESTING REQUIREMENTS

Create tests for:
```typescript
// Validation Tests
describe('Input Validation', () => {
  test('rejects XSS attempts', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHTML(malicious);
    expect(sanitized).not.toContain('<script>');
  });
  
  test('validates blog post schema', () => {
    const invalid = { title: '' };
    expect(() => BlogPostSchema.parse(invalid)).toThrow();
  });
  
  test('prevents SQL injection', () => {
    const malicious = "'; DROP TABLE users; --";
    // Test that query builder escapes properly
  });
});
```

## 🔄 HANDOFF PROTOCOL

When complete or if context exhausted:
1. Update `AGENT_6B_PROGRESS.md` with final status
2. List all validation rules implemented
3. Document security measures added
4. Update `MASTER_PROGRESS_LOG.md`
5. Create security audit report

---

**Remember:** Security is critical. Take no shortcuts. Test everything. Document all validation rules and security measures for future reference.

*Assignment created: 2025-09-01 by Current Agent*