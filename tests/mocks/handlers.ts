import { http, HttpResponse } from 'msw';

// Mock API handlers for MSW (Mock Service Worker)
export const handlers = [
  // Provider endpoints
  http.get('/api/providers', () => {
    return HttpResponse.json([
      {
        provider: 'openai',
        hasKey: true,
        active: true,
        defaultModel: 'gpt-4',
        fallbackModel: 'gpt-3.5-turbo',
        monthlyLimit: 100.00,
        currentUsage: 15.50,
        testSuccess: true,
      },
      {
        provider: 'anthropic',
        hasKey: false,
        active: false,
        defaultModel: 'claude-3-sonnet-20240229',
        fallbackModel: 'claude-3-haiku-20240307',
        monthlyLimit: 150.00,
        currentUsage: 0.00,
        testSuccess: false,
      },
      {
        provider: 'google',
        hasKey: true,
        active: true,
        defaultModel: 'gemini-1.5-pro',
        fallbackModel: 'gemini-1.5-flash',
        monthlyLimit: 200.00,
        currentUsage: 45.75,
        testSuccess: true,
      },
    ]);
  }),

  // Provider settings endpoints
  http.post('/api/providers/settings', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      provider: body.provider,
      message: `Settings updated for ${body.provider}`,
    });
  }),

  http.post('/api/providers/test', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const provider = body.provider as string;
    
    // Simulate different test results
    if (provider === 'openai') {
      return HttpResponse.json({
        success: true,
        provider: 'openai',
        model: 'gpt-4',
        responseTime: 245,
      });
    } else if (provider === 'anthropic') {
      return HttpResponse.json({
        success: false,
        provider: 'anthropic',
        error: 'Invalid API key',
      }, { status: 401 });
    } else {
      return HttpResponse.json({
        success: true,
        provider,
        model: 'test-model',
        responseTime: 180,
      });
    }
  }),

  // Blog generation endpoints
  http.post('/api/generate/blog', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const prompt = body.prompt as string;
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return HttpResponse.json({
      content: `Generated blog content for: ${prompt.slice(0, 50)}...`,
      provider: 'openai',
      model: 'gpt-4',
      tokensUsed: 150,
      cost: 0.003,
      finishReason: 'stop',
      generationTime: 2.4,
    });
  }),

  // Idea generation endpoints
  http.post('/api/generate/ideas', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const context = body.context as Record<string, unknown>;
    
    return HttpResponse.json({
      ideas: [
        {
          id: 'idea-1',
          content: 'AI-Powered Content Strategy for Modern Businesses',
          score: 0.92,
          reasoning: 'High relevance to current market trends',
        },
        {
          id: 'idea-2',
          content: 'The Future of Automated Customer Service',
          score: 0.88,
          reasoning: 'Strong business impact potential',
        },
        {
          id: 'idea-3',
          content: 'Building Trust in AI-Generated Content',
          score: 0.85,
          reasoning: 'Addresses current industry concerns',
        },
      ],
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      tokensUsed: 95,
      cost: 0.002,
      vertical: context.vertical,
    });
  }),

  // Title generation endpoints
  http.post('/api/generate/titles', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const idea = body.idea as string;
    
    return HttpResponse.json({
      titles: [
        {
          id: 'title-1',
          content: `10 Ways ${idea} Can Transform Your Business`,
          score: 0.94,
          type: 'list',
        },
        {
          id: 'title-2',
          content: `The Ultimate Guide to ${idea}`,
          score: 0.89,
          type: 'guide',
        },
        {
          id: 'title-3',
          content: `Why ${idea} Matters More Than Ever in 2025`,
          score: 0.86,
          type: 'opinion',
        },
      ],
      provider: 'openai',
      model: 'gpt-4',
      tokensUsed: 45,
      cost: 0.0009,
    });
  }),

  // Style guide endpoints
  http.get('/api/style-guides', () => {
    return HttpResponse.json([
      {
        id: 1,
        type: 'brand',
        name: 'Inteligencia Brand Guide',
        content: 'Professional, authoritative, data-driven writing style...',
        active: true,
        isDefault: true,
      },
      {
        id: 2,
        type: 'vertical',
        name: 'Hospitality Style Guide',
        vertical: 'hospitality',
        content: 'Warm, welcoming tone for hospitality industry...',
        active: true,
      },
    ]);
  }),

  http.post('/api/style-guides', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: Math.floor(Math.random() * 1000),
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),

  // Analytics endpoints
  http.get('/api/analytics/usage', () => {
    return HttpResponse.json({
      totalGenerations: 1247,
      totalTokens: 156890,
      totalCost: 78.45,
      averageResponseTime: 2.3,
      providerUsage: {
        openai: 45.2,
        anthropic: 32.8,
        google: 22.0,
      },
      monthlyTrend: [
        { month: 'Jan', generations: 890, cost: 45.20 },
        { month: 'Feb', generations: 1050, cost: 52.75 },
        { month: 'Mar', generations: 1247, cost: 62.35 },
      ],
    });
  }),

  // Error simulation endpoints
  http.post('/api/generate/error', () => {
    return new HttpResponse('Internal Server Error', { status: 500 });
  }),

  http.post('/api/generate/timeout', () => {
    // Simulate timeout - never resolve
    return new Promise(() => {});
  }),

  // Rate limiting simulation
  http.post('/api/generate/rate-limited', () => {
    return HttpResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),
];

export default handlers;