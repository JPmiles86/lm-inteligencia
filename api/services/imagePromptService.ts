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
        error: error instanceof Error ? error.message : 'Unknown error'
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
        error: error instanceof Error ? error.message : 'Unknown error'
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const imagePromptAPIHandler = new ImagePromptAPIHandler();