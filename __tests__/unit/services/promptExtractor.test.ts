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

    it('should suggest appropriate image sizes', () => {
      const heroContent = '[IMAGE_PROMPT: Hero banner image]'; // Early in content
      const sectionContent = `
        # Blog Title
        
        Some intro content with over 500 characters to move past the hero position threshold.
        This is filler content to reach that threshold and test section image sizing.
        More filler content here to ensure we're well past position 500.
        Even more content to be absolutely sure.
        
        ## Section Header
        [IMAGE_PROMPT: Section image for documentation]
      `;
      
      const heroResult = imagePromptExtractor.extractPrompts(heroContent);
      const sectionResult = imagePromptExtractor.extractPrompts(sectionContent);
      
      expect(heroResult.prompts[0].suggestedSize).toBe('1792x1024'); // Hero should be landscape
      expect(sectionResult.prompts[0].suggestedSize).toBe('1792x1024'); // Section header should be landscape
    });

    it('should suggest appropriate image styles', () => {
      const photoContent = '[IMAGE_PROMPT: A realistic photo of a businessman]';
      const diagramContent = '[IMAGE_PROMPT: Technical diagram showing system architecture]';
      
      const photoResult = imagePromptExtractor.extractPrompts(photoContent);
      const diagramResult = imagePromptExtractor.extractPrompts(diagramContent);
      
      expect(photoResult.prompts[0].suggestedStyle).toBe('photorealistic');
      expect(diagramResult.prompts[0].suggestedStyle).toBe('diagram');
    });

    it('should extract context around prompts', () => {
      const content = `
        Previous paragraph with important context information.
        
        [IMAGE_PROMPT: Context test image]
        
        Following paragraph with more context.
      `;
      
      const result = imagePromptExtractor.extractPrompts(content);
      
      expect(result.prompts[0].context).toContain('Previous paragraph');
      expect(result.prompts[0].context).toContain('Following paragraph');
      expect(result.prompts[0].context).toContain('[IMAGE]'); // Should replace prompt with [IMAGE]
    });

    it('should handle empty content gracefully', () => {
      const result = imagePromptExtractor.extractPrompts('');
      
      expect(result.prompts).toHaveLength(0);
      expect(result.contentWithPlaceholders).toBe('');
      expect(result.promptMap.size).toBe(0);
    });

    it('should handle malformed prompts gracefully', () => {
      const content = `
        [IMAGE_PROMPT: Valid prompt]
        [IMAGE_PROMPT:] // Empty prompt
        [IMAGE_PROMPT // Unclosed bracket
        [IMAGE_PROMPT: Another valid prompt]
      `;
      
      const result = imagePromptExtractor.extractPrompts(content);
      
      // Should extract only valid prompts
      expect(result.prompts).toHaveLength(2);
      expect(result.prompts[0].originalPrompt).toBe('Valid prompt');
      expect(result.prompts[1].originalPrompt).toBe('Another valid prompt');
    });

    it('should remove unused placeholders', () => {
      const content = '[IMAGE_PROMPT: Test]';
      const result = imagePromptExtractor.extractPrompts(content);
      
      // Embed no images (simulating failed generation)
      const finalContent = imagePromptExtractor.embedImages(
        result.contentWithPlaceholders,
        []
      );
      
      expect(finalContent).not.toContain('IMAGE_PLACEHOLDER');
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

    it('should apply brand guidelines', () => {
      const original = 'Corporate office';
      const enhanced = promptEnhancer.enhancePrompt(original, {
        brandGuidelines: {
          colors: ['blue', 'white'],
          mustInclude: ['professional'],
          avoid: ['casual']
        }
      });
      
      expect(enhanced).toContain('color palette: blue, white');
      expect(enhanced).toContain('must include: professional');
      expect(enhanced).toContain('avoid: casual');
    });

    it('should add appropriate lighting and mood', () => {
      const original = 'Business presentation';
      const enhanced = promptEnhancer.enhancePrompt(original, {
        lighting: 'studio',
        mood: 'professional'
      });
      
      expect(enhanced).toContain('studio lighting');
      expect(enhanced).toContain('professional atmosphere');
    });

    it('should clean up duplicate words', () => {
      const original = 'professional professional business business setting';
      const enhanced = promptEnhancer.enhancePrompt(original);
      
      // Should remove duplicates
      const words = enhanced.split(/[\s,]+/);
      const uniqueWords = [...new Set(words)];
      expect(words.length).toBe(uniqueWords.length);
    });

    it('should limit prompt length', () => {
      const veryLongOriginal = 'A'.repeat(1200); // Longer than 1000 chars
      const enhanced = promptEnhancer.enhancePrompt(veryLongOriginal);
      
      expect(enhanced.length).toBeLessThanOrEqual(1000);
    });

    it('should extract common style from multiple prompts', () => {
      const photographyPrompts = [
        'realistic photo of a building',
        'photorealistic image of a car',
        'real photo of people'
      ];
      
      const enhanced = promptEnhancer.enhanceMultiplePrompts(photographyPrompts);
      
      // All should have photorealistic elements
      enhanced.forEach(prompt => {
        expect(prompt.toLowerCase()).toContain('photorealistic');
      });
    });
  });
});