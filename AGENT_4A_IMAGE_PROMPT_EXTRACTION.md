# Agent-4A: Image Prompt Extraction System Specialist
**Priority:** 🔴 CRITICAL
**Duration:** 12 hours
**Dependencies:** Phase 3 complete (All AI providers integrated)
**Created:** 2025-08-31

## 🚨 CRITICAL MD RULE
**ALL WORK MUST BE DOCUMENTED IN .MD FILES**
- Create `/docs/agent-reports/AGENT-4A-PROGRESS.md` IMMEDIATELY
- Update it CONTINUOUSLY as you work
- Document EVERY file created/modified
- Record ALL TypeScript errors found/fixed
- This ensures crash recovery and agent handoff

## ⚠️ TYPESCRIPT COMPLIANCE
**MONITOR TypeScript errors constantly:**
```bash
# Run before starting work
npm run type-check > initial-ts-errors.log

# Run after EVERY file change
npm run type-check

# Run before marking complete
npm run type-check > final-ts-errors.log
```
**DO NOT introduce new TypeScript errors!**

## 🎯 MISSION
Create a comprehensive image prompt extraction system that identifies where images should be placed in blog content, extracts/generates appropriate prompts, and prepares them for the image generation pipeline.

## 📋 CONTEXT
- **User Requirement:** Automated image generation within blogs
- **Current State:** AI providers generate content with [IMAGE_PROMPT: ...] markers
- **Goal:** Extract prompts, enhance them, create UI cards for manual flow
- **Format:** [IMAGE_PROMPT: description] embedded in content

## ✅ SUCCESS CRITERIA
1. Markdown parser that extracts image prompts
2. Prompt enhancement system for better image generation
3. Image placement mapping (track where each image goes)
4. Interactive prompt cards for manual editing
5. Support for both automated and step-by-step workflows
6. NO new TypeScript errors introduced
7. All work documented in .md files

## 🔧 SPECIFIC TASKS

### 1. Create Progress Tracking File (FIRST TASK - 5 minutes)

**File:** `/docs/agent-reports/AGENT-4A-PROGRESS.md`
```markdown
# Agent-4A: Image Prompt Extraction System Progress

## Assignment
Implement image prompt extraction system for blog content

## Status: IN PROGRESS
Started: [timestamp]

## TypeScript Baseline
Initial errors: [count from npm run type-check]

## Files Created/Modified
- [ ] /src/services/ai/ImagePromptExtractor.ts
- [ ] /src/services/ai/PromptEnhancer.ts
- [ ] /src/components/ai/ImagePromptCard.tsx
- [ ] /src/components/ai/ImagePromptManager.tsx
- [ ] /api/services/imagePromptService.ts
- [ ] /__tests__/unit/services/promptExtractor.test.ts

## Progress Log
[timestamp] - Started work, checking TypeScript baseline
[timestamp] - Creating image prompt extractor service
[Update continuously...]

## Issues Found
- [List any issues]

## TypeScript Errors
- Before: X errors
- After: Y errors
- New errors introduced: MUST BE 0
```

### 2. Create Image Prompt Extractor Service (3 hours)

**File:** `/src/services/ai/ImagePromptExtractor.ts`
```typescript
export interface ImagePrompt {
  id: string;
  originalPrompt: string;
  enhancedPrompt?: string;
  position: number; // Character position in content
  lineNumber: number;
  context: string; // Surrounding text for context
  suggestedSize?: '1024x1024' | '1792x1024' | '1024x1792';
  suggestedStyle?: 'photorealistic' | 'illustration' | 'artistic' | 'diagram';
  metadata?: {
    paragraphIndex: number;
    sectionTitle?: string;
    importance: 'primary' | 'secondary' | 'decorative';
  };
}

export interface ExtractionResult {
  prompts: ImagePrompt[];
  contentWithPlaceholders: string;
  promptMap: Map<string, ImagePrompt>;
}

export class ImagePromptExtractor {
  private readonly PROMPT_REGEX = /\[IMAGE_PROMPT:\s*([^\]]+)\]/g;
  private readonly PLACEHOLDER_PREFIX = '{{IMAGE_PLACEHOLDER_';
  
  /**
   * Extract all image prompts from blog content
   */
  extractPrompts(content: string): ExtractionResult {
    const prompts: ImagePrompt[] = [];
    const promptMap = new Map<string, ImagePrompt>();
    let contentWithPlaceholders = content;
    let match;
    let promptIndex = 0;
    
    // Reset regex state
    this.PROMPT_REGEX.lastIndex = 0;
    
    while ((match = this.PROMPT_REGEX.exec(content)) !== null) {
      const id = this.generatePromptId(promptIndex);
      const originalPrompt = match[1].trim();
      
      const prompt: ImagePrompt = {
        id,
        originalPrompt,
        position: match.index,
        lineNumber: this.getLineNumber(content, match.index),
        context: this.extractContext(content, match.index),
        suggestedSize: this.suggestImageSize(originalPrompt, match.index, content),
        suggestedStyle: this.suggestImageStyle(originalPrompt),
        metadata: this.extractMetadata(content, match.index)
      };
      
      prompts.push(prompt);
      promptMap.set(id, prompt);
      
      // Replace with placeholder
      const placeholder = `${this.PLACEHOLDER_PREFIX}${id}}}`;
      contentWithPlaceholders = contentWithPlaceholders.replace(
        match[0],
        placeholder
      );
      
      promptIndex++;
    }
    
    return {
      prompts,
      contentWithPlaceholders,
      promptMap
    };
  }
  
  /**
   * Re-embed images into content using placeholders
   */
  embedImages(
    contentWithPlaceholders: string,
    images: Array<{ promptId: string; url: string; alt?: string }>
  ): string {
    let finalContent = contentWithPlaceholders;
    
    for (const image of images) {
      const placeholder = `${this.PLACEHOLDER_PREFIX}${image.promptId}}}`;
      const imageMarkdown = this.createImageMarkdown(image.url, image.alt);
      
      finalContent = finalContent.replace(placeholder, imageMarkdown);
    }
    
    // Remove any remaining placeholders (failed generations)
    finalContent = this.removeUnusedPlaceholders(finalContent);
    
    return finalContent;
  }
  
  /**
   * Analyze prompt to suggest appropriate image size
   */
  private suggestImageSize(
    prompt: string,
    position: number,
    content: string
  ): '1024x1024' | '1792x1024' | '1024x1792' {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if it's a hero/banner image (usually first image)
    if (position < 500) {
      return '1792x1024'; // Landscape for hero images
    }
    
    // Check for specific aspect ratio hints
    if (lowerPrompt.includes('portrait') || 
        lowerPrompt.includes('vertical') ||
        lowerPrompt.includes('tall')) {
      return '1024x1792';
    }
    
    if (lowerPrompt.includes('landscape') || 
        lowerPrompt.includes('wide') ||
        lowerPrompt.includes('banner') ||
        lowerPrompt.includes('header')) {
      return '1792x1024';
    }
    
    // Check content structure
    const beforeContent = content.substring(Math.max(0, position - 200), position);
    if (beforeContent.includes('##') && !beforeContent.includes('###')) {
      // Section header image - use landscape
      return '1792x1024';
    }
    
    // Default to square
    return '1024x1024';
  }
  
  /**
   * Analyze prompt to suggest image style
   */
  private suggestImageStyle(
    prompt: string
  ): 'photorealistic' | 'illustration' | 'artistic' | 'diagram' {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('photo') || 
        lowerPrompt.includes('realistic') ||
        lowerPrompt.includes('real')) {
      return 'photorealistic';
    }
    
    if (lowerPrompt.includes('illustration') || 
        lowerPrompt.includes('cartoon') ||
        lowerPrompt.includes('drawing') ||
        lowerPrompt.includes('sketch')) {
      return 'illustration';
    }
    
    if (lowerPrompt.includes('diagram') || 
        lowerPrompt.includes('chart') ||
        lowerPrompt.includes('graph') ||
        lowerPrompt.includes('infographic')) {
      return 'diagram';
    }
    
    if (lowerPrompt.includes('artistic') || 
        lowerPrompt.includes('abstract') ||
        lowerPrompt.includes('creative')) {
      return 'artistic';
    }
    
    // Default based on content type
    return 'photorealistic';
  }
  
  /**
   * Extract metadata about prompt location
   */
  private extractMetadata(content: string, position: number): ImagePrompt['metadata'] {
    const beforeContent = content.substring(0, position);
    const paragraphs = beforeContent.split(/\n\n/);
    const paragraphIndex = paragraphs.length - 1;
    
    // Find section title
    const sections = beforeContent.split(/\n#{1,3}\s+/);
    const lastSection = sections[sections.length - 1];
    const sectionTitle = lastSection.split('\n')[0]?.trim();
    
    // Determine importance
    let importance: 'primary' | 'secondary' | 'decorative' = 'secondary';
    if (position < 500) {
      importance = 'primary'; // Hero image
    } else if (beforeContent.split('\n').length > 50) {
      importance = 'decorative'; // Later in content
    }
    
    return {
      paragraphIndex,
      sectionTitle,
      importance
    };
  }
  
  /**
   * Get surrounding context for the prompt
   */
  private extractContext(content: string, position: number): string {
    const contextRadius = 200;
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(content.length, position + contextRadius);
    
    let context = content.substring(start, end);
    
    // Clean up context
    context = context.replace(/\[IMAGE_PROMPT:[^\]]+\]/g, '[IMAGE]');
    context = context.replace(/\s+/g, ' ').trim();
    
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';
    
    return context;
  }
  
  /**
   * Calculate line number for position
   */
  private getLineNumber(content: string, position: number): number {
    const lines = content.substring(0, position).split('\n');
    return lines.length;
  }
  
  /**
   * Generate unique ID for prompt
   */
  private generatePromptId(index: number): string {
    return `img_${Date.now()}_${index}`;
  }
  
  /**
   * Create markdown for image
   */
  private createImageMarkdown(url: string, alt?: string): string {
    const altText = alt || 'Generated image';
    return `![${altText}](${url})`;
  }
  
  /**
   * Remove any leftover placeholders
   */
  private removeUnusedPlaceholders(content: string): string {
    const placeholderRegex = new RegExp(
      `${this.PLACEHOLDER_PREFIX}[^}]+}}`,
      'g'
    );
    return content.replace(placeholderRegex, '');
  }
}

export const imagePromptExtractor = new ImagePromptExtractor();
```

### 3. Create Prompt Enhancement Service (2 hours)

**File:** `/src/services/ai/PromptEnhancer.ts`
```typescript
interface EnhancementOptions {
  style?: 'photorealistic' | 'illustration' | 'artistic' | 'diagram';
  quality?: 'standard' | 'high' | 'ultra';
  lighting?: 'natural' | 'studio' | 'dramatic' | 'soft';
  mood?: 'professional' | 'casual' | 'dramatic' | 'cheerful';
  brandGuidelines?: {
    colors?: string[];
    avoid?: string[];
    mustInclude?: string[];
  };
}

export class PromptEnhancer {
  /**
   * Enhance a basic prompt for better image generation
   */
  enhancePrompt(
    originalPrompt: string,
    options: EnhancementOptions = {}
  ): string {
    let enhanced = originalPrompt;
    
    // Add style descriptors
    enhanced = this.addStyleDescriptors(enhanced, options.style);
    
    // Add quality modifiers
    enhanced = this.addQualityModifiers(enhanced, options.quality);
    
    // Add lighting
    enhanced = this.addLighting(enhanced, options.lighting);
    
    // Add mood
    enhanced = this.addMood(enhanced, options.mood);
    
    // Apply brand guidelines
    if (options.brandGuidelines) {
      enhanced = this.applyBrandGuidelines(enhanced, options.brandGuidelines);
    }
    
    // Add technical specifications
    enhanced = this.addTechnicalSpecs(enhanced);
    
    // Clean up and optimize
    enhanced = this.cleanupPrompt(enhanced);
    
    return enhanced;
  }
  
  /**
   * Enhance multiple prompts with consistency
   */
  enhanceMultiplePrompts(
    prompts: string[],
    options: EnhancementOptions = {}
  ): string[] {
    // Extract common style elements
    const commonStyle = this.extractCommonStyle(prompts);
    
    return prompts.map((prompt, index) => {
      const enhancedOptions = {
        ...options,
        // Maintain consistency across images
        style: options.style || commonStyle
      };
      
      // Add positional context
      if (index === 0) {
        // Hero image
        enhancedOptions.quality = 'ultra';
      }
      
      return this.enhancePrompt(prompt, enhancedOptions);
    });
  }
  
  private addStyleDescriptors(prompt: string, style?: string): string {
    const styleMap = {
      photorealistic: 'photorealistic, high detail, professional photography',
      illustration: 'digital illustration, vector art style, clean lines',
      artistic: 'artistic interpretation, creative composition, unique style',
      diagram: 'technical diagram, clear labels, informative, educational'
    };
    
    if (style && styleMap[style]) {
      return `${prompt}, ${styleMap[style]}`;
    }
    
    return prompt;
  }
  
  private addQualityModifiers(prompt: string, quality?: string): string {
    const qualityMap = {
      standard: '4k resolution, sharp focus',
      high: '8k resolution, ultra sharp, highly detailed',
      ultra: '16k resolution, hyperrealistic, extreme detail, award-winning'
    };
    
    if (quality && qualityMap[quality]) {
      return `${prompt}, ${qualityMap[quality]}`;
    }
    
    return `${prompt}, high quality`;
  }
  
  private addLighting(prompt: string, lighting?: string): string {
    const lightingMap = {
      natural: 'natural lighting, golden hour',
      studio: 'studio lighting, professional setup',
      dramatic: 'dramatic lighting, high contrast',
      soft: 'soft diffused lighting, gentle shadows'
    };
    
    if (lighting && lightingMap[lighting]) {
      return `${prompt}, ${lightingMap[lighting]}`;
    }
    
    return prompt;
  }
  
  private addMood(prompt: string, mood?: string): string {
    const moodMap = {
      professional: 'professional atmosphere, business setting',
      casual: 'relaxed atmosphere, informal setting',
      dramatic: 'dramatic mood, intense atmosphere',
      cheerful: 'bright and cheerful, positive energy'
    };
    
    if (mood && moodMap[mood]) {
      return `${prompt}, ${moodMap[mood]}`;
    }
    
    return prompt;
  }
  
  private applyBrandGuidelines(
    prompt: string,
    guidelines: EnhancementOptions['brandGuidelines']
  ): string {
    let enhanced = prompt;
    
    if (guidelines?.colors && guidelines.colors.length > 0) {
      enhanced += `, color palette: ${guidelines.colors.join(', ')}`;
    }
    
    if (guidelines?.mustInclude && guidelines.mustInclude.length > 0) {
      enhanced += `, must include: ${guidelines.mustInclude.join(', ')}`;
    }
    
    if (guidelines?.avoid && guidelines.avoid.length > 0) {
      enhanced += `, avoid: ${guidelines.avoid.join(', ')}`;
    }
    
    return enhanced;
  }
  
  private addTechnicalSpecs(prompt: string): string {
    // Add technical specifications for better generation
    const specs = [
      'centered composition',
      'rule of thirds',
      'balanced elements'
    ];
    
    // Only add if not already present
    const specsToAdd = specs.filter(spec => 
      !prompt.toLowerCase().includes(spec.toLowerCase())
    );
    
    if (specsToAdd.length > 0) {
      return `${prompt}, ${specsToAdd[0]}`;
    }
    
    return prompt;
  }
  
  private cleanupPrompt(prompt: string): string {
    // Remove duplicate words
    const words = prompt.split(/[\s,]+/);
    const unique = [...new Set(words)];
    
    // Rebuild prompt
    let cleaned = unique.join(' ');
    
    // Fix punctuation
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.trim();
    
    // Limit length (some APIs have limits)
    if (cleaned.length > 1000) {
      cleaned = cleaned.substring(0, 997) + '...';
    }
    
    return cleaned;
  }
  
  private extractCommonStyle(prompts: string[]): 'photorealistic' | 'illustration' | 'artistic' | 'diagram' {
    // Analyze all prompts to find common style
    const styles = {
      photorealistic: 0,
      illustration: 0,
      artistic: 0,
      diagram: 0
    };
    
    for (const prompt of prompts) {
      const lower = prompt.toLowerCase();
      if (lower.includes('photo') || lower.includes('realistic')) {
        styles.photorealistic++;
      }
      if (lower.includes('illustration') || lower.includes('drawing')) {
        styles.illustration++;
      }
      if (lower.includes('artistic') || lower.includes('creative')) {
        styles.artistic++;
      }
      if (lower.includes('diagram') || lower.includes('chart')) {
        styles.diagram++;
      }
    }
    
    // Return most common style
    const maxStyle = Object.entries(styles).reduce((a, b) => 
      a[1] > b[1] ? a : b
    );
    
    return maxStyle[0] as any;
  }
}

export const promptEnhancer = new PromptEnhancer();
```

### 4. Create Image Prompt Card Component (2 hours)

**File:** `/src/components/ai/ImagePromptCard.tsx`
```typescript
import React, { useState } from 'react';
import { Image, Edit2, RefreshCw, Check, X, Sparkles } from 'lucide-react';
import { ImagePrompt } from '@/services/ai/ImagePromptExtractor';
import { promptEnhancer } from '@/services/ai/PromptEnhancer';

interface ImagePromptCardProps {
  prompt: ImagePrompt;
  onGenerate: (prompt: ImagePrompt) => Promise<void>;
  onUpdate: (prompt: ImagePrompt) => void;
  onDelete: (promptId: string) => void;
  imageUrl?: string;
  loading?: boolean;
}

export const ImagePromptCard: React.FC<ImagePromptCardProps> = ({
  prompt,
  onGenerate,
  onUpdate,
  onDelete,
  imageUrl,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt.enhancedPrompt || prompt.originalPrompt);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const enhanced = promptEnhancer.enhancePrompt(editedPrompt, {
        style: prompt.suggestedStyle,
        quality: prompt.metadata?.importance === 'primary' ? 'ultra' : 'high'
      });
      
      setEditedPrompt(enhanced);
      onUpdate({
        ...prompt,
        enhancedPrompt: enhanced
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleSave = () => {
    onUpdate({
      ...prompt,
      enhancedPrompt: editedPrompt
    });
    setIsEditing(false);
  };
  
  const handleGenerate = async () => {
    await onGenerate({
      ...prompt,
      enhancedPrompt: editedPrompt
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Image className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium">
            Image {prompt.metadata?.importance === 'primary' ? '(Hero)' : `#${prompt.id.split('_')[2]}`}
          </span>
        </div>
        <button
          onClick={() => onDelete(prompt.id)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Image Preview or Placeholder */}
      <div className="mb-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Generated"
            className="w-full h-48 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
            {loading ? (
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <Image className="h-8 w-8 text-gray-400" />
            )}
          </div>
        )}
      </div>
      
      {/* Prompt Text */}
      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Enhance</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setEditedPrompt(prompt.enhancedPrompt || prompt.originalPrompt);
                  setIsEditing(false);
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded-md text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {prompt.enhancedPrompt || prompt.originalPrompt}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Prompt</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
          {prompt.suggestedSize}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
          {prompt.suggestedStyle}
        </span>
        {prompt.metadata?.sectionTitle && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {prompt.metadata.sectionTitle}
          </span>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Image className="h-4 w-4" />
              <span>{imageUrl ? 'Regenerate' : 'Generate'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
```

### 5. Create Image Prompt Manager Component (2 hours)

**File:** `/src/components/ai/ImagePromptManager.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { ImagePromptCard } from './ImagePromptCard';
import { imagePromptExtractor, ImagePrompt } from '@/services/ai/ImagePromptExtractor';
import { Wand2, Download, Eye } from 'lucide-react';

interface ImagePromptManagerProps {
  content: string;
  onContentUpdate: (content: string) => void;
  onImagesGenerated?: (images: Array<{ promptId: string; url: string }>) => void;
}

export const ImagePromptManager: React.FC<ImagePromptManagerProps> = ({
  content,
  onContentUpdate,
  onImagesGenerated
}) => {
  const [prompts, setPrompts] = useState<ImagePrompt[]>([]);
  const [contentWithPlaceholders, setContentWithPlaceholders] = useState('');
  const [generatedImages, setGeneratedImages] = useState<Map<string, string>>(new Map());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    // Extract prompts when content changes
    const result = imagePromptExtractor.extractPrompts(content);
    setPrompts(result.prompts);
    setContentWithPlaceholders(result.contentWithPlaceholders);
  }, [content]);
  
  const handleGenerateImage = async (prompt: ImagePrompt) => {
    try {
      // Call appropriate image generation service
      const provider = await selectImageProvider();
      const response = await fetch('/api/ai/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.enhancedPrompt || prompt.originalPrompt,
          provider,
          config: {
            size: prompt.suggestedSize,
            quality: prompt.metadata?.importance === 'primary' ? 'hd' : 'standard'
          }
        })
      });
      
      const data = await response.json();
      if (data.success && data.urls?.length > 0) {
        const newImages = new Map(generatedImages);
        newImages.set(prompt.id, data.urls[0]);
        setGeneratedImages(newImages);
        
        // Update content with image
        updateContentWithImage(prompt.id, data.urls[0]);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    }
  };
  
  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const images: Array<{ promptId: string; url: string }> = [];
      
      for (const prompt of prompts) {
        if (!generatedImages.has(prompt.id)) {
          await handleGenerateImage(prompt);
          const url = generatedImages.get(prompt.id);
          if (url) {
            images.push({ promptId: prompt.id, url });
          }
        }
      }
      
      if (onImagesGenerated) {
        onImagesGenerated(images);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };
  
  const handleUpdatePrompt = (updatedPrompt: ImagePrompt) => {
    setPrompts(prompts.map(p => 
      p.id === updatedPrompt.id ? updatedPrompt : p
    ));
  };
  
  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
    
    // Remove from generated images
    const newImages = new Map(generatedImages);
    newImages.delete(promptId);
    setGeneratedImages(newImages);
    
    // Remove placeholder from content
    const placeholder = `{{IMAGE_PLACEHOLDER_${promptId}}}`;
    const updatedContent = contentWithPlaceholders.replace(placeholder, '');
    setContentWithPlaceholders(updatedContent);
  };
  
  const updateContentWithImage = (promptId: string, url: string) => {
    const images = Array.from(generatedImages.entries()).map(([id, imgUrl]) => ({
      promptId: id,
      url: imgUrl
    }));
    
    // Add new image
    images.push({ promptId, url });
    
    // Embed all images into content
    const finalContent = imagePromptExtractor.embedImages(
      contentWithPlaceholders,
      images
    );
    
    onContentUpdate(finalContent);
  };
  
  const selectImageProvider = async (): Promise<string> => {
    // Check available providers with image capability
    const response = await fetch('/api/ai/providers/capabilities');
    const capabilities = await response.json();
    
    // Prefer Google (Gemini) for native image generation
    if (capabilities.google?.image) return 'google';
    // Fallback to OpenAI (DALL-E)
    if (capabilities.openai?.image) return 'openai';
    
    throw new Error('No image generation provider available');
  };
  
  const exportImages = () => {
    const imageData = Array.from(generatedImages.entries()).map(([id, url]) => {
      const prompt = prompts.find(p => p.id === id);
      return {
        id,
        url,
        prompt: prompt?.originalPrompt,
        enhancedPrompt: prompt?.enhancedPrompt
      };
    });
    
    const blob = new Blob([JSON.stringify(imageData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-images.json';
    a.click();
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Image Prompts ({prompts.length})
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          {generatedImages.size > 0 && (
            <button
              onClick={exportImages}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || prompts.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            <span>Generate All</span>
          </button>
        </div>
      </div>
      
      {/* Preview */}
      {showPreview && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium mb-2">Content Preview</h4>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: contentWithPlaceholders.replace(
                /{{IMAGE_PLACEHOLDER_[^}]+}}/g,
                '<div class="bg-gray-200 p-4 text-center rounded">Image Placeholder</div>'
              )
            }}
          />
        </div>
      )}
      
      {/* Prompt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map(prompt => (
          <ImagePromptCard
            key={prompt.id}
            prompt={prompt}
            onGenerate={handleGenerateImage}
            onUpdate={handleUpdatePrompt}
            onDelete={handleDeletePrompt}
            imageUrl={generatedImages.get(prompt.id)}
            loading={isGeneratingAll}
          />
        ))}
      </div>
      
      {/* Empty State */}
      {prompts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Image className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No image prompts found in content</p>
          <p className="text-sm mt-1">
            Add [IMAGE_PROMPT: description] to your content
          </p>
        </div>
      )}
    </div>
  );
};
```

### 6. Create API Service (1 hour)

**File:** `/api/services/imagePromptService.ts`
```typescript
import { Request, Response } from 'express';
import { imagePromptExtractor } from '@/services/ai/ImagePromptExtractor';
import { promptEnhancer } from '@/services/ai/PromptEnhancer';

export class ImagePromptAPIHandler {
  async extractPrompts(req: Request, res: Response) {
    const { content } = req.body;
    
    try {
      const result = imagePromptExtractor.extractPrompts(content);
      
      res.json({
        success: true,
        prompts: result.prompts,
        contentWithPlaceholders: result.contentWithPlaceholders
      });
    } catch (error) {
      console.error('Prompt extraction failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async enhancePrompt(req: Request, res: Response) {
    const { prompt, options } = req.body;
    
    try {
      const enhanced = promptEnhancer.enhancePrompt(prompt, options);
      
      res.json({
        success: true,
        original: prompt,
        enhanced
      });
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async embedImages(req: Request, res: Response) {
    const { contentWithPlaceholders, images } = req.body;
    
    try {
      const finalContent = imagePromptExtractor.embedImages(
        contentWithPlaceholders,
        images
      );
      
      res.json({
        success: true,
        content: finalContent
      });
    } catch (error) {
      console.error('Image embedding failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const imagePromptAPIHandler = new ImagePromptAPIHandler();
```

### 7. Create Tests (1 hour)

**File:** `/__tests__/unit/services/promptExtractor.test.ts`
```typescript
import { imagePromptExtractor } from '@/services/ai/ImagePromptExtractor';
import { promptEnhancer } from '@/services/ai/PromptEnhancer';

describe('Image Prompt Extraction', () => {
  describe('ImagePromptExtractor', () => {
    it('should extract image prompts from content', () => {
      const content = `
        # Blog Title
        
        Introduction paragraph.
        
        [IMAGE_PROMPT: A modern office with people collaborating]
        
        More content here.
        
        [IMAGE_PROMPT: Data visualization dashboard]
        
        Final paragraph.
      `;
      
      const result = imagePromptExtractor.extractPrompts(content);
      
      expect(result.prompts).toHaveLength(2);
      expect(result.prompts[0].originalPrompt).toBe('A modern office with people collaborating');
      expect(result.prompts[1].originalPrompt).toBe('Data visualization dashboard');
    });
    
    it('should create placeholders in content', () => {
      const content = '[IMAGE_PROMPT: Test image]';
      const result = imagePromptExtractor.extractPrompts(content);
      
      expect(result.contentWithPlaceholders).toContain('IMAGE_PLACEHOLDER');
      expect(result.contentWithPlaceholders).not.toContain('IMAGE_PROMPT');
    });
    
    it('should embed images back into content', () => {
      const content = '[IMAGE_PROMPT: Test]';
      const result = imagePromptExtractor.extractPrompts(content);
      
      const finalContent = imagePromptExtractor.embedImages(
        result.contentWithPlaceholders,
        [{ promptId: result.prompts[0].id, url: 'https://example.com/image.jpg' }]
      );
      
      expect(finalContent).toContain('![Generated image](https://example.com/image.jpg)');
    });
  });
  
  describe('PromptEnhancer', () => {
    it('should enhance basic prompts', () => {
      const original = 'A cat sitting on a chair';
      const enhanced = promptEnhancer.enhancePrompt(original, {
        style: 'photorealistic',
        quality: 'high'
      });
      
      expect(enhanced).toContain('photorealistic');
      expect(enhanced).toContain('high quality');
      expect(enhanced.length).toBeGreaterThan(original.length);
    });
    
    it('should maintain consistency across multiple prompts', () => {
      const prompts = [
        'Office scene',
        'Meeting room',
        'Conference call'
      ];
      
      const enhanced = promptEnhancer.enhanceMultiplePrompts(prompts);
      
      expect(enhanced).toHaveLength(3);
      enhanced.forEach(e => {
        expect(e.length).toBeGreaterThan(10);
      });
    });
  });
});
```

## 📝 REQUIRED DELIVERABLES

### 1. Progress Report (UPDATE CONTINUOUSLY)
**File:** `/docs/agent-reports/AGENT-4A-PROGRESS.md`
- Document every file created
- Track TypeScript errors before/after
- List extraction patterns found
- Record enhancement strategies

### 2. Implementation Report (AT COMPLETION)
**File:** `/docs/agent-reports/AGENT-4A-IMPLEMENTATION.md`
- Summary of extraction system
- UI components created
- Enhancement capabilities
- Integration points

### 3. Update Master Progress Log
Add to `/MASTER_PROGRESS_LOG.md` when complete

## 🔍 TESTING REQUIREMENTS

1. **TypeScript Compliance:**
```bash
npm run type-check  # MUST show same or fewer errors than baseline
```

2. **Unit Tests:**
```bash
npm test -- promptExtractor.test.ts
```

3. **Component Testing:**
- Test prompt card interactions
- Test manager with multiple prompts
- Test image generation flow

## ⚠️ CRITICAL REMINDERS

1. **MD Rule:** Document EVERYTHING in .md files
2. **TypeScript:** NO new errors allowed
3. **User Flow:** Support both automated and manual workflows
4. **Error Handling:** Gracefully handle extraction failures
5. **Progress Updates:** Update progress file every 30 minutes

## 🚫 DO NOT

1. Hardcode image providers
2. Skip prompt validation
3. Introduce TypeScript errors
4. Forget edge cases (empty content, malformed prompts)
5. Skip documentation in .md files

---

**REMEMBER: All work must be documented in .md files for crash recovery and agent handoff!**