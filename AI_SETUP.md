# AI Generation Setup Guide

## Overview
The AI content generation system now fully integrates with OpenAI to create blog posts using your configured style guides.

## Environment Variables Required

Add these to your `.env` file (local) and Vercel environment settings (production):

```env
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Database (already configured)
DATABASE_URL=your-database-url
```

## How It Works

### 1. Style Guide Integration
When generating content, the system:
- Fetches selected style guides from the database
- Combines brand, vertical, persona, and writing style guides
- Builds comprehensive context for the AI

### 2. Blog Generation Process
The generation flow:
1. User selects style guides in the UI
2. Provides a prompt/topic for the blog
3. System fetches all selected guides from database
4. Builds context combining all guidelines
5. Sends to OpenAI with structured prompt
6. Returns formatted blog with:
   - Title
   - SEO-friendly slug
   - Synopsis
   - Full content (markdown)
   - Tags
   - SEO metadata
   - Reading time
   - Target audience

### 3. API Endpoint
```
POST /api/ai/generate
```

Request body example:
```json
{
  "mode": "quick",
  "vertical": "hospitality",
  "task": "blog",
  "prompt": "Viral Video Marketing in 2025",
  "context": {
    "styleGuides": {
      "brand": true,
      "vertical": ["guide-id-1"],
      "writingStyle": ["guide-id-2"],
      "persona": ["guide-id-3"]
    },
    "additionalContext": "Optional extra instructions"
  },
  "provider": "openai",
  "model": "gpt-4o",
  "temperature": 0.7,
  "maxTokens": 4000
}
```

Response format:
```json
{
  "success": true,
  "generation": {
    "title": "Blog Title",
    "slug": "blog-slug",
    "synopsis": "Brief summary",
    "content": "Full markdown content",
    "tags": ["tag1", "tag2"],
    "metaTitle": "SEO title",
    "metaDescription": "SEO description",
    "keywords": ["keyword1", "keyword2"],
    "readingTime": "5 minutes",
    "targetAudience": "Hospitality professionals"
  },
  "tokensUsed": 1500,
  "cost": 0.045,
  "durationMs": 3200
}
```

## Testing

1. Ensure OpenAI API key is configured in Vercel
2. Create or activate style guides in the Style Guide Manager
3. Go to AI Content Dashboard
4. Select style guides
5. Enter a blog topic
6. Click Generate

## Troubleshooting

### "Generation not implemented" error
- Check that OpenAI API key is set in environment variables
- Verify the key has access to the specified model (gpt-4o)
- Check Vercel logs for detailed error messages

### Style guides not being used
- Ensure guides are marked as "active" in the database
- Verify guide IDs are being passed correctly in the request
- Check database connection in production

### Cost Management
- Default model is GPT-4o (more expensive but better quality)
- Can switch to gpt-3.5-turbo for lower costs
- Monitor usage through OpenAI dashboard
- Typical blog post costs ~$0.04-0.08

## File Structure
```
/api/ai.js                              - Main API handler
/src/services/ai/GenerationServiceReal.js - OpenAI integration
/src/services/ai/StyleGuideService.js     - Style guide fetching
/src/services/ai/StubServices.js          - Fallback stubs
```