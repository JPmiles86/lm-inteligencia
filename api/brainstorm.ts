/**
 * Standalone brainstorm API endpoint
 */

import { OpenAI } from 'openai';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const {
      topic,
      count = 10,
      vertical = 'all',
      tone = 'professional',
      contentTypes = [],
      provider = 'openai',
      model = 'gpt-4o',
      customContext = ''
    } = req.body;

    // Validate required fields
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a string'
      });
    }

    // Build brainstorming prompt
    const prompt = `Generate ${count} unique and creative blog post ideas about "${topic}".
    
    Requirements:
    - Industry/Vertical: ${vertical === 'all' ? 'General audience' : vertical}
    - Tone: ${tone}
    ${contentTypes.length > 0 ? `- Content types to include: ${contentTypes.join(', ')}` : ''}
    ${customContext ? `- Additional context: ${customContext}` : ''}
    
    For each idea, provide:
    1. A catchy, SEO-friendly title
    2. A unique angle or perspective
    3. A brief description (2-3 sentences)
    4. 3-5 relevant tags
    5. Difficulty level (Beginner/Intermediate/Advanced)
    6. Estimated word count (500-3000 words)
    
    Return ONLY a valid JSON array of objects with these fields:
    - title: string
    - angle: string
    - description: string
    - tags: string[]
    - difficulty: "Beginner" | "Intermediate" | "Advanced"
    - estimatedWordCount: number
    
    Example:
    [
      {
        "title": "10 Ways to Improve Your Pickleball Serve",
        "angle": "Focus on technique improvements for beginners",
        "description": "A comprehensive guide to mastering the pickleball serve with step-by-step instructions and common mistakes to avoid.",
        "tags": ["pickleball", "serve", "technique", "beginners"],
        "difficulty": "Beginner",
        "estimatedWordCount": 1500
      }
    ]`;

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });

    const startTime = Date.now();

    // Generate ideas using OpenAI
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a creative content strategist. Always return valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseTime = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '[]';

    // Parse the generated ideas
    let ideas = [];
    try {
      // Try to parse the response
      const parsed = JSON.parse(content);
      ideas = Array.isArray(parsed) ? parsed : (parsed.ideas || parsed.results || [parsed]);

      // Add metadata to each idea
      ideas = ideas.map((idea: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: idea.title || `Idea ${index + 1}`,
        angle: idea.angle || '',
        description: idea.description || '',
        tags: Array.isArray(idea.tags) ? idea.tags : [],
        difficulty: idea.difficulty || 'Intermediate',
        estimatedWordCount: idea.estimatedWordCount || 1000,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: Math.random() * 100,
        metadata: {
          generatedFromTopic: topic,
          generationIndex: index,
          vertical,
          tone,
          contentTypes
        }
      }));
    } catch (parseError) {
      console.error('Failed to parse ideas:', parseError);
      // Return a fallback idea if parsing fails
      ideas = [{
        id: `${Date.now()}-0`,
        title: `Blog Post About ${topic}`,
        angle: 'Expert perspective',
        description: `An in-depth exploration of ${topic} with practical insights and actionable advice.`,
        tags: [topic.toLowerCase(), tone, vertical].filter(Boolean),
        difficulty: 'Intermediate',
        estimatedWordCount: 1500,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: 75,
        metadata: {
          generatedFromTopic: topic,
          generationIndex: 0,
          fallback: true
        }
      }];
    }

    return res.status(200).json({
      success: true,
      ideas,
      generation: ideas, // For backward compatibility
      tokensUsed: completion.usage?.total_tokens || 0,
      cost: (completion.usage?.total_tokens || 0) * 0.00002, // Approximate cost
      durationMs: responseTime,
      metadata: {
        provider: 'openai',
        model: model || 'gpt-4o',
        topic,
        count: ideas.length,
        vertical,
        tone,
        contentTypes
      }
    });
  } catch (error: any) {
    console.error('Brainstorming error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate ideas',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}