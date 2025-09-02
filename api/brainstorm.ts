/**
 * Standalone brainstorm API endpoint
 * Uses API keys stored securely in the database
 */

import { OpenAI } from 'openai';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Import schema
import { providerSettings } from '../src/db/schema';

// Encryption service (simplified inline version)
class SimpleEncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;
  private iterations = 100000;
  private masterKey: Buffer;

  constructor() {
    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey) {
      // Use a default key for development (NOT for production!)
      this.masterKey = this.deriveKey('default-dev-key-do-not-use-in-production');
    } else {
      this.masterKey = this.deriveKey(envKey);
    }
  }

  private deriveKey(password: string): Buffer {
    const salt = Buffer.from('static-salt-for-key-derivation', 'utf8');
    return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
  }

  decrypt(encryptedKey: string): string {
    try {
      const combined = Buffer.from(encryptedKey, 'base64');
      const iv = combined.slice(0, this.ivLength);
      const tag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = combined.slice(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      (decipher as any).setAuthTag(tag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }
}

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

  let db: any;
  let sql: any;

  try {
    // Initialize database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not configured');
    }

    sql = postgres(connectionString, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    db = drizzle(sql);

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

    // Fetch the provider settings from database
    const providerSettingsResult = await db
      .select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider))
      .limit(1);

    if (!providerSettingsResult || providerSettingsResult.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No API key configured for provider: ${provider}. Please add your API key in the admin settings.`
      });
    }

    const settings = providerSettingsResult[0];
    
    if (!settings.active) {
      return res.status(400).json({
        success: false,
        error: `Provider ${provider} is not active. Please enable it in settings.`
      });
    }

    // Decrypt the API key
    const encryptionService = new SimpleEncryptionService();
    let apiKey: string;
    
    try {
      apiKey = encryptionService.decrypt(settings.apiKeyEncrypted);
    } catch (decryptError) {
      console.error('Failed to decrypt API key:', decryptError);
      return res.status(500).json({
        success: false,
        error: 'Failed to decrypt API key. Please re-enter your API key in settings.'
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

    // Initialize OpenAI with the decrypted key
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const startTime = Date.now();

    // Generate ideas using OpenAI
    const completion = await openai.chat.completions.create({
      model: settings.defaultModel || model || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a creative content strategist. Always return valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: settings.settings?.temperature || 0.8,
      max_tokens: settings.settings?.maxTokens || 2000,
      response_format: { type: 'json_object' }
    });

    const responseTime = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '[]';

    // Parse the generated ideas
    let ideas: any[] = [];
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

    // Update usage tracking (optional)
    const tokensUsed = completion.usage?.total_tokens || 0;
    const estimatedCost = tokensUsed * 0.00002; // Approximate cost per token

    // Close database connection
    if (sql) {
      await sql.end();
    }

    return res.status(200).json({
      success: true,
      ideas,
      generation: ideas, // For backward compatibility
      tokensUsed,
      cost: estimatedCost,
      durationMs: responseTime,
      metadata: {
        provider: provider,
        model: settings.defaultModel || model || 'gpt-4o',
        topic,
        count: ideas.length,
        vertical,
        tone,
        contentTypes
      }
    });
  } catch (error: any) {
    console.error('Brainstorming error:', error);
    
    // Close database connection on error
    if (sql) {
      try {
        await sql.end();
      } catch {}
    }

    // Check for specific OpenAI errors
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key. Please check your OpenAI API key in settings.',
        details: 'The API key stored in the database appears to be invalid or expired.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        details: 'You have exceeded the OpenAI API rate limits.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate ideas',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}