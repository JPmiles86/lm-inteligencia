# Style Guides Database Population - Implementation Summary

## Overview

This implementation creates a comprehensive style guides system for LM Inteligencia's AI content generation, populating the database with brand guides, industry-specific guides, writing styles, and persona information based on the hard-coded content found throughout the application.

## What Was Created

### 1. StyleGuideService (`/src/services/ai/StyleGuideService.js`)

A complete service class that handles all style guide operations:

- **CRUD Operations**: Create, read, update, delete style guides
- **Version Management**: Create and manage versions of style guides
- **Activation System**: Activate/deactivate guides and manage active sets
- **Context Generation**: Generate combined context strings from active guides
- **Filtering & Querying**: Get guides by type, vertical, active status
- **Bulk Operations**: Create multiple guides from content arrays

### 2. Database Population Script (`/src/scripts/populateStyleGuides.ts`)

A comprehensive CLI script that:

- Tests database connection
- Checks for existing style guides
- Populates database with predefined style guides
- Provides multiple execution modes (check, populate, clear)
- Includes safety checks to prevent accidental overwrites
- Generates detailed reports of population results

### 3. Database Check Script (`/src/scripts/checkStyleGuides.ts`)

A quick utility to:

- Verify database connectivity
- Display current style guides in database
- Show active/inactive status
- Identify missing guide types

## Style Guides Data Structure

The implementation includes **8 comprehensive style guides** based on hard-coded content:

### Brand Guide (1)
- **LM Inteligencia Brand Guide**: Core brand voice, messaging, and personality

### Vertical Guides (4)
- **Hospitality Marketing Guide**: Hotel/restaurant industry focus
- **Healthcare Marketing Guide**: HIPAA-compliant medical practice focus
- **Technology Marketing Guide**: SaaS/B2B tech focus
- **Athletics Marketing Guide**: Sports facilities and recreation focus

### Writing Style Guides (3)
- **Professional & Data-Driven Style**: Formal, metrics-focused business communications
- **Conversational & Engaging Style**: Friendly, approachable blog and social content
- **Educational & Authoritative Style**: Expert-level thought leadership content

### Persona Guide (1)
- **Laurie Meiring - Founder Voice**: Personal brand voice and perspective

## Database Schema

The style guides use the existing `style_guides` table with these key fields:

```sql
style_guides:
- id (UUID, primary key)
- type (brand | vertical | writing_style | persona)
- name (guide display name)
- vertical (hospitality | healthcare | tech | athletics | null)
- content (full guide content in markdown)
- description (brief guide description)
- active (boolean - whether guide is currently active)
- isDefault (boolean - whether guide is default for its type)
- version (integer - version number)
- parentId (UUID - for version management)
- perspective (text - for persona guides)
- voiceCharacteristics (JSON array - for persona guides)
```

## Usage Instructions

### 1. Check Current Style Guides

```bash
npm run style-guides:check
```

This will:
- Test database connection
- Show all existing style guides
- Display active/inactive status
- Identify missing guide types

### 2. Populate Style Guides

```bash
# Basic population (skips existing guides)
npm run style-guides:populate

# Add alongside existing guides
npm run style-guides:populate -- populate --add

# Replace all existing guides
npm run style-guides:populate -- populate --force
```

### 3. Clear All Style Guides

```bash
npm run style-guides:populate -- clear --confirm
```

## API Integration

The style guides integrate with the existing AI system through:

### Style Guides API (`/lib/api-handlers/style-guides.js`)
- Already exists and imports the StyleGuideService
- Provides REST endpoints for UI interaction
- Handles context generation for AI prompts

### Frontend Integration
The guides will appear in:
- **Style Guide Modal**: Shows available guides by type
- **Context Manager**: Allows selection of active guides
- **AI Generation**: Uses active guides to build context strings

## Content Details

### Brand Guide Content
- Core value propositions (AI-powered, industry specialization, measurable ROI)
- Brand personality traits (confident, data-driven, innovative, accessible)
- Writing style guidelines (active voice, specific metrics, problem-solution format)
- Tone variations by content type (website, blog, social, case studies, email)

### Vertical-Specific Adaptations
Each industry guide includes:
- Industry-specific voice and tone
- Key messaging pillars for that vertical
- Target audience language preferences
- Success metrics to highlight
- Industry terminology to use

### Writing Style Variations
- **Professional**: Data-driven, formal business language with metrics
- **Conversational**: Friendly, engaging tone with storytelling elements
- **Educational**: Expert-level authority with comprehensive guidance

### Laurie Meiring Persona
- Personal background and experience
- Voice characteristics (authentic, data-driven, approachable)
- Communication style preferences
- Key personal messages and story elements

## Next Steps

1. **Test Database Connection**: Ensure the Railway database is accessible
2. **Run Population**: Execute the style guides population script
3. **Verify UI Integration**: Check that guides appear in the AI interface
4. **Test Context Generation**: Verify that active guides generate proper context strings
5. **User Training**: Document how to use the style guides in the AI workflow

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in .env file
- Ensure Railway database is running
- Check that migrations have been applied

### Population Errors
- Run with `--add` flag to avoid conflicts with existing guides
- Use `--force` flag to replace all existing guides
- Check console output for specific error messages

### Missing Guides in UI
- Verify guides are marked as active in database
- Check that StyleGuideService is properly imported
- Ensure API endpoints are working correctly

## File Locations

```
/src/services/ai/StyleGuideService.js          # Service class
/src/scripts/populateStyleGuides.ts            # Population script
/src/scripts/checkStyleGuides.ts               # Check script
/lib/api-handlers/style-guides.js              # API endpoints (existing)
/src/db/schema.ts                              # Database schema (existing)
```

## NPM Scripts Added

```json
{
  "style-guides:populate": "tsx src/scripts/populateStyleGuides.ts",
  "style-guides:check": "tsx src/scripts/checkStyleGuides.ts"
}
```

This implementation provides a complete foundation for style-guided AI content generation with comprehensive brand consistency across all LM Inteligencia's industry verticals.