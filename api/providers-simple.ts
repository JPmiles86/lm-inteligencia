/**
 * Simplified Providers API endpoint
 * Returns configured AI providers from database
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query provider settings - don't return encrypted keys
    const providers = await sql`
      SELECT 
        provider,
        default_model,
        fallback_model,
        task_defaults,
        monthly_limit,
        current_usage,
        settings,
        active,
        last_tested,
        test_success,
        created_at,
        updated_at
      FROM provider_settings
      WHERE active = true
      ORDER BY provider
    `;

    // Format the response
    const formattedProviders = providers.map((p: any) => ({
      id: p.provider,
      name: p.provider,
      configured: true,
      active: p.active,
      defaultModel: p.default_model,
      fallbackModel: p.fallback_model,
      taskDefaults: p.task_defaults,
      usage: {
        monthlyLimit: p.monthly_limit,
        currentUsage: p.current_usage
      },
      settings: p.settings,
      lastTested: p.last_tested,
      testSuccess: p.test_success,
      updatedAt: p.updated_at
    }));

    return res.status(200).json({
      success: true,
      providers: formattedProviders,
      count: formattedProviders.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Providers API error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch providers',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}