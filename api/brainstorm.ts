/**
 * Enhanced Brainstorming API endpoint with database persistence
 * Replaces localStorage with proper database storage for brainstorming sessions and ideas
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { getOpenAIKey } from './lib/api-keys.js';
import { db } from '../src/db/index.js';
import { brainstormSessions, brainstormIdeas } from '../src/db/schema.js';
import { eq, and, desc, isNull } from 'drizzle-orm';

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
      case 'generate-ideas':
        return await generateIdeas(req, res);
      case 'save-session':
        return await saveSession(req, res);
      case 'load-session':
        return await loadSession(req, res);
      case 'get-sessions':
        return await getSessions(req, res);
      case 'toggle-favorite':
        return await toggleFavorite(req, res);
      case 'convert-to-blogs':
        return await convertToBlogs(req, res);
      case 'delete-session':
        return await deleteSession(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Brainstorm API error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Generate brainstorming ideas and save to database
 */
async function generateIdeas(req: VercelRequest, res: VercelResponse) {
  const {
    topic,
    count = 10,
    vertical = 'all',
    tone = 'professional',
    contentTypes = [],
    provider = 'openai',
    model = 'gpt-4o',
    customContext = '',
    sessionId
  } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Get API key from database
  let apiKey: string;
  try {
    apiKey = await getOpenAIKey();
  } catch (error: any) {
    return res.status(500).json({
      error: 'OpenAI not configured',
      message: 'Please add your OpenAI API key in Admin Settings',
      details: error.message
    });
  }

  const openai = new OpenAI({ apiKey });
  const startTime = Date.now();

  try {
    // Build the brainstorming prompt
    const prompt = buildBrainstormingPrompt({
      topic,
      count,
      vertical,
      tone,
      contentTypes,
      customContext
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model as any,
      messages: [
        { role: 'system', content: 'You are an expert content strategist and creative ideation specialist.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the generated ideas
    const result = JSON.parse(content);
    const ideas = parseGeneratedIdeas(result.ideas || result);

    // Calculate costs and tokens
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = calculateCost(model, tokensUsed);

    // Save session to database
    const sessionData = {
      sessionId,
      topic,
      count,
      vertical: vertical !== 'all' ? vertical : null,
      tone,
      contentTypes,
      customContext: customContext || null,
      provider,
      model,
      metadata: {
        generatedAt: new Date().toISOString(),
        tokensUsed,
        cost,
        durationMs
      },
      tokensUsed,
      cost: cost.toString(),
      durationMs
    };

    // Insert or update session
    await db.insert(brainstormSessions)
      .values(sessionData)
      .onConflictDoUpdate({
        target: brainstormSessions.sessionId,
        set: {
          ...sessionData,
          updatedAt: new Date()
        }
      });

    // Save ideas to database
    const ideaData = ideas.map((idea: any, index: number) => ({
      sessionId: sessionId, // This will be resolved to UUID by foreign key
      ideaId: idea.id,
      title: idea.title,
      angle: idea.angle,
      description: idea.description,
      tags: idea.tags,
      difficulty: idea.difficulty,
      estimatedWordCount: idea.estimatedWordCount,
      score: idea.score,
      position: index
    }));

    // Get the session UUID from database
    const [session] = await db.select({ id: brainstormSessions.id })
      .from(brainstormSessions)
      .where(eq(brainstormSessions.sessionId, sessionId));

    if (!session) {
      throw new Error('Failed to create session');
    }

    // Delete existing ideas and insert new ones
    await db.delete(brainstormIdeas)
      .where(eq(brainstormIdeas.sessionId, session.id));

    await db.insert(brainstormIdeas)
      .values(ideaData.map(idea => ({
        ...idea,
        sessionId: session.id
      })));

    return res.status(200).json({
      success: true,
      sessionId,
      ideas,
      metadata: {
        topic,
        count,
        vertical,
        tone,
        contentTypes,
        provider,
        model,
        tokensUsed,
        cost,
        durationMs,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error generating ideas:', error);
    return res.status(500).json({
      error: 'Failed to generate ideas',
      message: error.message
    });
  }
}

/**
 * Load a brainstorming session with ideas from database
 */
async function loadSession(req: VercelRequest, res: VercelResponse) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Get session data
    const [session] = await db.select()
      .from(brainstormSessions)
      .where(
        and(
          eq(brainstormSessions.sessionId, sessionId),
          isNull(brainstormSessions.deletedAt)
        )
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get ideas for the session
    const ideas = await db.select()
      .from(brainstormIdeas)
      .where(
        and(
          eq(brainstormIdeas.sessionId, session.id),
          isNull(brainstormIdeas.deletedAt)
        )
      )
      .orderBy(brainstormIdeas.position);

    // Format response to match existing frontend expectations
    const formattedIdeas = ideas.map(idea => ({
      id: idea.ideaId,
      title: idea.title,
      angle: idea.angle,
      description: idea.description,
      tags: idea.tags,
      difficulty: idea.difficulty,
      estimatedWordCount: idea.estimatedWordCount,
      score: idea.score,
      isFavorited: idea.isFavorited,
      createdAt: idea.createdAt.toISOString()
    }));

    return res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      ideas: formattedIdeas,
      savedAt: session.createdAt.toISOString(),
      favoriteIds: ideas.filter(idea => idea.isFavorited).map(idea => idea.ideaId)
    });

  } catch (error: any) {
    console.error('Error loading session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load session',
      message: error.message
    });
  }
}

/**
 * Get all saved brainstorming sessions
 */
async function getSessions(req: VercelRequest, res: VercelResponse) {
  try {
    // Get all sessions with idea counts
    const sessions = await db
      .select({
        sessionId: brainstormSessions.sessionId,
        topic: brainstormSessions.topic,
        vertical: brainstormSessions.vertical,
        createdAt: brainstormSessions.createdAt
      })
      .from(brainstormSessions)
      .where(isNull(brainstormSessions.deletedAt))
      .orderBy(desc(brainstormSessions.createdAt));

    // Get idea counts and favorite counts for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const [sessionData] = await db.select({ id: brainstormSessions.id })
          .from(brainstormSessions)
          .where(eq(brainstormSessions.sessionId, session.sessionId));

        const ideas = await db.select({
          id: brainstormIdeas.id,
          isFavorited: brainstormIdeas.isFavorited
        })
        .from(brainstormIdeas)
        .where(
          and(
            eq(brainstormIdeas.sessionId, sessionData.id),
            isNull(brainstormIdeas.deletedAt)
          )
        );

        return {
          sessionId: session.sessionId,
          topic: session.topic,
          ideaCount: ideas.length,
          favoriteCount: ideas.filter(idea => idea.isFavorited).length,
          savedAt: session.createdAt.toISOString(),
          vertical: session.vertical
        };
      })
    );

    return res.status(200).json({
      success: true,
      sessions: sessionsWithCounts
    });

  } catch (error: any) {
    console.error('Error getting sessions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
      message: error.message
    });
  }
}

/**
 * Toggle favorite status of an idea
 */
async function toggleFavorite(req: VercelRequest, res: VercelResponse) {
  const { sessionId, ideaId } = req.body;

  if (!sessionId || !ideaId) {
    return res.status(400).json({ error: 'Session ID and Idea ID are required' });
  }

  try {
    // Get session
    const [session] = await db.select({ id: brainstormSessions.id })
      .from(brainstormSessions)
      .where(eq(brainstormSessions.sessionId, sessionId));

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get current idea
    const [idea] = await db.select()
      .from(brainstormIdeas)
      .where(
        and(
          eq(brainstormIdeas.sessionId, session.id),
          eq(brainstormIdeas.ideaId, ideaId)
        )
      );

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Toggle favorite status
    const newFavoriteStatus = !idea.isFavorited;

    await db.update(brainstormIdeas)
      .set({
        isFavorited: newFavoriteStatus,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(brainstormIdeas.sessionId, session.id),
          eq(brainstormIdeas.ideaId, ideaId)
        )
      );

    // Get favorite count
    const favoriteIdeas = await db.select()
      .from(brainstormIdeas)
      .where(
        and(
          eq(brainstormIdeas.sessionId, session.id),
          eq(brainstormIdeas.isFavorited, true)
        )
      );

    return res.status(200).json({
      success: true,
      isFavorited: newFavoriteStatus,
      favoriteCount: favoriteIdeas.length
    });

  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle favorite',
      message: error.message
    });
  }
}

/**
 * Delete a brainstorming session (soft delete)
 */
async function deleteSession(req: VercelRequest, res: VercelResponse) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Soft delete session
    await db.update(brainstormSessions)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(brainstormSessions.sessionId, sessionId));

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete session',
      message: error.message
    });
  }
}

/**
 * Convert selected ideas to blog generation requests (placeholder)
 */
async function convertToBlogs(req: VercelRequest, res: VercelResponse) {
  const { ideaIds, sessionId } = req.body;

  if (!ideaIds || !Array.isArray(ideaIds) || !sessionId) {
    return res.status(400).json({ error: 'Idea IDs array and Session ID are required' });
  }

  try {
    // Get session
    const [session] = await db.select({ id: brainstormSessions.id })
      .from(brainstormSessions)
      .where(eq(brainstormSessions.sessionId, sessionId));

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get selected ideas
    const ideas = await db.select()
      .from(brainstormIdeas)
      .where(
        and(
          eq(brainstormIdeas.sessionId, session.id),
          // Use SQL IN operator for ideaIds
        )
      );

    const blogRequests = ideas.map(idea => ({
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ideaId: idea.ideaId,
      title: idea.title,
      angle: idea.angle,
      description: idea.description,
      prompt: `Write a comprehensive blog post about: ${idea.title}.
               Angle: ${idea.angle}
               Context: ${idea.description}

               Please create engaging, well-structured content that follows this specific angle.`,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    // TODO: Integrate with blog generation system
    // For now, just return the request objects

    return res.status(200).json({
      success: true,
      blogRequests,
      convertedCount: blogRequests.length
    });

  } catch (error: any) {
    console.error('Error converting ideas to blogs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to convert ideas to blogs',
      message: error.message
    });
  }
}

/**
 * Build the brainstorming prompt based on parameters
 */
function buildBrainstormingPrompt({
  topic,
  count,
  vertical,
  tone,
  contentTypes,
  customContext
}: {
  topic: string;
  count: number;
  vertical: string;
  tone: string;
  contentTypes: string[];
  customContext: string;
}) {
  const verticalContext = vertical !== 'all' ?
    `Focus specifically on the ${vertical} industry/vertical.` :
    'Consider multiple industries and verticals where relevant.';

  const contentTypeContext = contentTypes.length > 0 ?
    `Prioritize these content types: ${contentTypes.join(', ')}.` :
    'Include a variety of content types (how-to guides, listicles, tutorials, comparisons, etc.).';

  const toneContext = `Maintain a ${tone} tone throughout.`;

  const customSection = customContext ?
    `\nAdditional Context: ${customContext}` : '';

  return `
You are an expert content strategist and creative ideation specialist. Generate exactly ${count} unique, compelling blog post ideas about the topic: "${topic}".

Requirements:
- ${verticalContext}
- ${contentTypeContext}
- ${toneContext}
- Each idea must be unique and offer a distinct angle or perspective
- Ideas should be specific enough to create actionable content
- Include SEO potential and audience appeal considerations

${customSection}

For each idea, provide:
1. Title: A compelling, specific headline (60-80 characters ideal)
2. Angle: The unique perspective or approach (1-2 sentences)
3. Description: Brief overview of what the content would cover (2-3 sentences)
4. Tags: 3-5 relevant tags for categorization
5. Difficulty: Content creation difficulty (Beginner/Intermediate/Advanced)
6. Estimated Word Count: Suggested length for the full article

Format your response as a JSON object with an "ideas" array where each idea is an object with the above properties.

Example structure:
{
  "ideas": [
    {
      "title": "5 Proven Strategies That Transform Customer Service in Healthcare",
      "angle": "Focus on actionable, data-backed strategies with real healthcare examples",
      "description": "Explore five evidence-based approaches to customer service excellence in healthcare settings, including patient communication techniques, technology integration, and staff training methodologies that demonstrably improve patient satisfaction scores.",
      "tags": ["customer-service", "healthcare", "patient-satisfaction", "strategy", "improvement"],
      "difficulty": "Intermediate",
      "estimatedWordCount": 1500
    }
  ]
}

Now generate ${count} unique blog post ideas for the topic "${topic}":
  `.trim();
}

/**
 * Parse and format the AI-generated ideas
 */
function parseGeneratedIdeas(rawIdeas: any[]): any[] {
  try {
    const ideas = Array.isArray(rawIdeas) ? rawIdeas : [];

    return ideas.map((idea, index) => ({
      id: `idea_${Date.now()}_${index}`,
      title: idea.title || `Blog Idea ${index + 1}`,
      angle: idea.angle || 'Standard approach to the topic',
      description: idea.description || 'A comprehensive exploration of the topic',
      tags: idea.tags || ['general'],
      difficulty: idea.difficulty || 'Intermediate',
      estimatedWordCount: idea.estimatedWordCount || 1000,
      isFavorited: false,
      createdAt: new Date().toISOString(),
      score: calculateIdeaScore(idea)
    }));

  } catch (error) {
    console.error('Error parsing ideas:', error);

    // Return fallback ideas if parsing fails
    return [{
      id: `idea_${Date.now()}_0`,
      title: 'Error generating ideas - please try again',
      angle: 'Technical error occurred',
      description: 'There was an issue processing the generated content. Please try again with different parameters.',
      tags: ['error'],
      difficulty: 'Beginner',
      estimatedWordCount: 500,
      isFavorited: false,
      createdAt: new Date().toISOString(),
      score: 0
    }];
  }
}

/**
 * Calculate a quality score for an idea
 */
function calculateIdeaScore(idea: any): number {
  let score = 50; // Base score

  // Title length optimization
  if (idea.title && idea.title.length >= 40 && idea.title.length <= 80) {
    score += 10;
  }

  // Description quality
  if (idea.description && idea.description.length >= 100) {
    score += 10;
  }

  // Tag relevance
  if (idea.tags && idea.tags.length >= 3) {
    score += 10;
  }

  // Word count appropriateness
  if (idea.estimatedWordCount >= 1000 && idea.estimatedWordCount <= 3000) {
    score += 10;
  }

  // Difficulty balance
  if (idea.difficulty === 'Intermediate') {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Calculate cost based on model and tokens (rough estimate)
 */
function calculateCost(model: string, tokens: number): number {
  // Rough cost estimates per 1k tokens (as of 2025)
  const costPer1k: { [key: string]: number } = {
    'gpt-4o': 0.005,
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.002
  };

  const rate = costPer1k[model] || costPer1k['gpt-3.5-turbo'];
  return (tokens / 1000) * rate;
}

/**
 * Save session placeholder (for compatibility)
 */
async function saveSession(req: VercelRequest, res: VercelResponse) {
  // This is handled automatically by generateIdeas now
  return res.status(200).json({
    success: true,
    message: 'Sessions are automatically saved during generation'
  });
}