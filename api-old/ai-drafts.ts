/**
 * AI Drafts API endpoint - handles saving and loading of AI generation drafts
 * Replaces localStorage persistence with database storage
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/index.js';
import { generationNodes } from '../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'save-draft':
        return await saveDraft(req, res);
      case 'load-draft':
        return await loadDraft(req, res);
      case 'get-drafts':
        return await getDrafts(req, res);
      case 'delete-draft':
        return await deleteDraft(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('AI Drafts API error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Save an AI generation draft to database
 */
async function saveDraft(req: VercelRequest, res: VercelResponse) {
  const {
    draftId,
    content,
    activeVertical,
    provider = 'openai',
    model = 'gpt-4o',
    draftType = 'generation_workspace'
  } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const draftData = {
      type: 'idea' as any, // Using existing enum value
      mode: 'direct' as any,
      content,
      contextData: {
        draftType,
        activeVertical,
        provider,
        model,
        savedAt: new Date().toISOString(),
        isDraft: true
      },
      vertical: activeVertical as any,
      provider: provider as any,
      model,
      status: 'completed' as any,
      selected: false,
      visible: true,
      deleted: false
    };

    if (draftId) {
      // Update existing draft
      const [existingDraft] = await db.select()
        .from(generationNodes)
        .where(eq(generationNodes.id, draftId));

      if (existingDraft) {
        await db.update(generationNodes)
          .set({
            content,
            contextData: draftData.contextData,
            vertical: activeVertical as any,
            provider: provider as any,
            model,
            completedAt: new Date()
          })
          .where(eq(generationNodes.id, draftId));

        return res.status(200).json({
          success: true,
          draftId: existingDraft.id,
          message: 'Draft updated successfully'
        });
      }
    }

    // Create new draft
    const [newDraft] = await db.insert(generationNodes)
      .values(draftData)
      .returning({ id: generationNodes.id });

    return res.status(200).json({
      success: true,
      draftId: newDraft.id,
      message: 'Draft saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving draft:', error);
    return res.status(500).json({
      error: 'Failed to save draft',
      message: error.message
    });
  }
}

/**
 * Load the most recent AI draft
 */
async function loadDraft(req: VercelRequest, res: VercelResponse) {
  const { draftType = 'generation_workspace' } = req.body;

  try {
    // Get the most recent draft of this type
    const drafts = await db.select()
      .from(generationNodes)
      .where(
        and(
          eq(generationNodes.type, 'idea'),
          eq(generationNodes.deleted, false)
        )
      )
      .orderBy(desc(generationNodes.createdAt))
      .limit(10); // Get several recent ones to find the right type

    // Filter by draft type from contextData
    const matchingDraft = drafts.find(draft =>
      draft.contextData &&
      typeof draft.contextData === 'object' &&
      'draftType' in draft.contextData &&
      draft.contextData.draftType === draftType &&
      draft.contextData.isDraft === true
    );

    if (!matchingDraft) {
      return res.status(200).json({
        success: false,
        message: 'No draft found'
      });
    }

    return res.status(200).json({
      success: true,
      draft: {
        id: matchingDraft.id,
        content: matchingDraft.content,
        timestamp: matchingDraft.createdAt.toISOString(),
        activeVertical: matchingDraft.contextData?.activeVertical,
        provider: matchingDraft.provider,
        model: matchingDraft.model
      }
    });

  } catch (error: any) {
    console.error('Error loading draft:', error);
    return res.status(500).json({
      error: 'Failed to load draft',
      message: error.message
    });
  }
}

/**
 * Get all AI drafts
 */
async function getDrafts(req: VercelRequest, res: VercelResponse) {
  const { draftType, limit = 20 } = req.body;

  try {
    let drafts = await db.select()
      .from(generationNodes)
      .where(
        and(
          eq(generationNodes.type, 'idea'),
          eq(generationNodes.deleted, false)
        )
      )
      .orderBy(desc(generationNodes.createdAt))
      .limit(limit);

    // Filter by draft type if specified
    if (draftType) {
      drafts = drafts.filter(draft =>
        draft.contextData &&
        typeof draft.contextData === 'object' &&
        'draftType' in draft.contextData &&
        draft.contextData.draftType === draftType &&
        draft.contextData.isDraft === true
      );
    } else {
      // Only return actual drafts
      drafts = drafts.filter(draft =>
        draft.contextData &&
        typeof draft.contextData === 'object' &&
        'isDraft' in draft.contextData &&
        draft.contextData.isDraft === true
      );
    }

    const formattedDrafts = drafts.map(draft => ({
      id: draft.id,
      content: draft.content,
      timestamp: draft.createdAt.toISOString(),
      activeVertical: draft.contextData?.activeVertical,
      provider: draft.provider,
      model: draft.model,
      draftType: draft.contextData?.draftType || 'unknown'
    }));

    return res.status(200).json({
      success: true,
      drafts: formattedDrafts
    });

  } catch (error: any) {
    console.error('Error getting drafts:', error);
    return res.status(500).json({
      error: 'Failed to get drafts',
      message: error.message
    });
  }
}

/**
 * Delete an AI draft
 */
async function deleteDraft(req: VercelRequest, res: VercelResponse) {
  const { draftId } = req.body;

  if (!draftId) {
    return res.status(400).json({ error: 'Draft ID is required' });
  }

  try {
    // Soft delete the draft
    await db.update(generationNodes)
      .set({
        deleted: true,
        completedAt: new Date()
      })
      .where(eq(generationNodes.id, draftId));

    return res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting draft:', error);
    return res.status(500).json({
      error: 'Failed to delete draft',
      message: error.message
    });
  }
}