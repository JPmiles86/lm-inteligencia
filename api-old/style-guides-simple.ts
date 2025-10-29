/**
 * Simplified Style Guides API endpoint
 * Returns style guides from database
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      // Fetch all style guides
      const { vertical } = req.query;
      
      let query = sql`
        SELECT 
          id,
          name,
          vertical,
          tone,
          voice,
          language,
          perspective,
          formality,
          structure_preferences,
          content_guidelines,
          forbidden_phrases,
          preferred_vocabulary,
          example_content,
          seo_keywords,
          active,
          created_at,
          updated_at
        FROM style_guides
        WHERE active = true
      `;

      if (vertical) {
        query = sql`
          SELECT 
            id,
            name,
            vertical,
            tone,
            voice,
            language,
            perspective,
            formality,
            structure_preferences,
            content_guidelines,
            forbidden_phrases,
            preferred_vocabulary,
            example_content,
            seo_keywords,
            active,
            created_at,
            updated_at
          FROM style_guides
          WHERE active = true
          AND vertical = ${vertical}
        `;
      }

      const guides = await query;

      return res.status(200).json({
        success: true,
        styleGuides: guides,
        count: guides.length,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // Create or update a style guide
      const {
        id,
        name,
        vertical,
        tone,
        voice,
        language = 'en',
        perspective = 'second',
        formality = 'professional',
        structurePreferences,
        contentGuidelines,
        forbiddenPhrases,
        preferredVocabulary,
        exampleContent,
        seoKeywords
      } = req.body;

      if (!name || !vertical) {
        return res.status(400).json({ 
          error: 'Name and vertical are required' 
        });
      }

      let result;
      
      if (id) {
        // Update existing
        result = await sql`
          UPDATE style_guides
          SET 
            name = ${name},
            vertical = ${vertical},
            tone = ${tone},
            voice = ${voice},
            language = ${language},
            perspective = ${perspective},
            formality = ${formality},
            structure_preferences = ${structurePreferences || {}},
            content_guidelines = ${contentGuidelines || {}},
            forbidden_phrases = ${forbiddenPhrases || []},
            preferred_vocabulary = ${preferredVocabulary || []},
            example_content = ${exampleContent || []},
            seo_keywords = ${seoKeywords || []},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
      } else {
        // Create new
        result = await sql`
          INSERT INTO style_guides (
            name,
            vertical,
            tone,
            voice,
            language,
            perspective,
            formality,
            structure_preferences,
            content_guidelines,
            forbidden_phrases,
            preferred_vocabulary,
            example_content,
            seo_keywords
          ) VALUES (
            ${name},
            ${vertical},
            ${tone},
            ${voice},
            ${language},
            ${perspective},
            ${formality},
            ${structurePreferences || {}},
            ${contentGuidelines || {}},
            ${forbiddenPhrases || []},
            ${preferredVocabulary || []},
            ${exampleContent || []},
            ${seoKeywords || []}
          )
          RETURNING *
        `;
      }

      return res.status(200).json({
        success: true,
        styleGuide: result[0],
        message: id ? 'Style guide updated' : 'Style guide created',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Style Guides API error:', error);
    
    return res.status(500).json({
      error: 'Failed to process style guides request',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}