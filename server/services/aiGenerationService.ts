import { ProviderConfig } from './providerSelector.js';
import { ProviderError } from '../middleware/error.middleware.js';

// Generation request interface
export interface GenerationRequest {
  type: 'blog' | 'image' | 'research' | 'creative' | 'analysis' | 'test';
  prompt: string;
  context?: any;
  outputCount?: number;
  count?: number; // For images
  size?: string;
  quality?: string;
  style?: string;
  includeRealtimeData?: boolean;
  maxSources?: number;
  settings?: any;
}

// Generation result interface
export interface GenerationResult {
  content?: string;
  url?: string; // For images
  tokens?: number;
  cost?: number;
  metadata?: any;
  sources?: any[]; // For research
  analysis?: any; // For analysis tasks
}

/**
 * Main function to generate content using the selected provider
 */
export async function generateWithProvider(
  providerConfig: ProviderConfig,
  request: GenerationRequest
): Promise<GenerationResult[]> {
  const { provider, apiKey, model, settings } = providerConfig;

  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(apiKey, model, request, settings);
      case 'anthropic':
        return await generateWithAnthropic(apiKey, model, request, settings);
      case 'google':
        return await generateWithGoogle(apiKey, model, request, settings);
      case 'perplexity':
        return await generateWithPerplexity(apiKey, model, request, settings);
      default:
        throw new ProviderError(`Unsupported provider: ${provider}`, provider);
    }
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(
      `Generation failed with ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      provider
    );
  }
}

/**
 * Generate content using OpenAI
 */
async function generateWithOpenAI(
  apiKey: string,
  model: string,
  request: GenerationRequest,
  settings: any
): Promise<GenerationResult[]> {
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey });

  if (request.type === 'image') {
    // Image generation
    const response = await openai.images.generate({
      model: model || 'dall-e-3',
      prompt: request.prompt,
      n: request.count || 1,
      size: request.size as any || '1024x1024',
      quality: request.quality as any || 'standard',
      style: request.style as any
    });

    return (response.data || []).map((image, index) => ({
      url: image.url || '',
      metadata: {
        revised_prompt: image.revised_prompt,
        index
      },
      cost: calculateOpenAICost('image', model, 1) // Approximate cost per image
    }));
  } else {
    // Text generation
    const messages = [
      { role: 'user' as const, content: buildPromptWithContext(request.prompt, request.context) }
    ];

    const completionSettings = {
      model: model || 'gpt-4o',
      messages,
      max_tokens: settings.maxTokens || settings.max_tokens || 4000,
      temperature: settings.temperature || 0.7,
      top_p: settings.topP || settings.top_p || 1,
      frequency_penalty: settings.frequencyPenalty || settings.frequency_penalty || 0,
      presence_penalty: settings.presencePenalty || settings.presence_penalty || 0,
      n: request.outputCount || 1
    };

    const response = await openai.chat.completions.create(completionSettings);

    return response.choices.map((choice, index) => {
      const content = choice.message?.content || '';
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      return {
        content,
        tokens: inputTokens + outputTokens,
        cost: calculateOpenAICost('text', model, inputTokens, outputTokens),
        metadata: {
          finish_reason: choice.finish_reason,
          index,
          model: response.model,
          inputTokens,
          outputTokens
        }
      };
    });
  }
}

/**
 * Generate content using Anthropic
 */
async function generateWithAnthropic(
  apiKey: string,
  model: string,
  request: GenerationRequest,
  settings: any
): Promise<GenerationResult[]> {
  if (request.type === 'image') {
    throw new ProviderError('Anthropic does not support image generation', 'anthropic');
  }

  const { Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });

  const message = buildPromptWithContext(request.prompt, request.context);

  const response = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    max_tokens: settings.maxTokens || settings.max_tokens || 4000,
    temperature: settings.temperature || 0.7,
    top_p: settings.topP || settings.top_p || 1,
    messages: [{ role: 'user', content: message }]
  });

  const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  return [{
    content,
    tokens: inputTokens + outputTokens,
    cost: calculateAnthropicCost(model, inputTokens, outputTokens),
    metadata: {
      model: response.model,
      stop_reason: response.stop_reason,
      inputTokens,
      outputTokens
    }
  }];
}

/**
 * Generate content using Google Gemini
 */
async function generateWithGoogle(
  apiKey: string,
  model: string,
  request: GenerationRequest,
  settings: any
): Promise<GenerationResult[]> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  if (request.type === 'image') {
    // Google's Imagen API would be used here
    // For now, we'll throw an error as Imagen requires special setup
    throw new ProviderError('Google image generation requires Imagen API setup', 'google');
  }

  const googleModel = genAI.getGenerativeModel({ 
    model: model || 'gemini-1.5-pro-latest',
    generationConfig: {
      temperature: settings.temperature || 0.7,
      topP: settings.topP || settings.top_p || 1,
      maxOutputTokens: settings.maxTokens || settings.max_tokens || 4000,
    }
  });

  const prompt = buildPromptWithContext(request.prompt, request.context);
  const result = await googleModel.generateContent(prompt);
  const response = await result.response;
  
  const content = response.text();
  const tokens = response.usageMetadata?.totalTokenCount || 0;

  return [{
    content,
    tokens,
    cost: calculateGoogleCost(model, tokens),
    metadata: {
      model,
      finishReason: response.candidates?.[0]?.finishReason,
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0
    }
  }];
}

/**
 * Generate content using Perplexity
 */
async function generateWithPerplexity(
  apiKey: string,
  model: string,
  request: GenerationRequest,
  settings: any
): Promise<GenerationResult[]> {
  if (request.type === 'image') {
    throw new ProviderError('Perplexity does not support image generation', 'perplexity');
  }

  const message = buildPromptWithContext(request.prompt, request.context);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'llama-3.1-sonar-large-128k-online',
      messages: [{ role: 'user', content: message }],
      max_tokens: settings.maxTokens || settings.max_tokens || 4000,
      temperature: settings.temperature || 0.7,
      top_p: settings.topP || settings.top_p || 1,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ProviderError(`Perplexity API error: ${response.status} ${error}`, 'perplexity');
  }

  const data = await response.json();
  const choice = data.choices[0];
  const content = choice?.message?.content || '';
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;

  return [{
    content,
    tokens: inputTokens + outputTokens,
    cost: calculatePerplexityCost(model, inputTokens, outputTokens),
    metadata: {
      model,
      finish_reason: choice?.finish_reason,
      inputTokens,
      outputTokens,
      citations: data.citations || []
    },
    sources: data.citations || []
  }];
}

/**
 * Build a prompt with context information
 */
function buildPromptWithContext(prompt: string, context: any = {}): string {
  let fullPrompt = prompt;

  if (context.previousContent && context.previousContent.length > 0) {
    fullPrompt += '\n\nFor context, here is some previous content:\n';
    fullPrompt += context.previousContent.map((item: any) => 
      `- ${item.title || 'Untitled'}: ${item.excerpt || item.content?.substring(0, 200) || ''}`
    ).join('\n');
  }

  if (context.styleGuides && context.styleGuides.length > 0) {
    fullPrompt += '\n\nPlease follow these style guidelines:\n';
    fullPrompt += context.styleGuides.map((guide: any) => 
      `- ${guide.name || 'Style Guide'}: ${guide.content || guide.description || ''}`
    ).join('\n');
  }

  if (context.additionalContext) {
    fullPrompt += '\n\nAdditional context:\n' + context.additionalContext;
  }

  if (context.vertical) {
    fullPrompt += `\n\nPlease tailor the content for the ${context.vertical} industry.`;
  }

  return fullPrompt;
}

/**
 * Calculate costs for different providers (approximate)
 */
function calculateOpenAICost(type: string, model: string, inputTokens: number, outputTokens: number = 0): number {
  const pricing: Record<string, { input: number, output: number }> = {
    'gpt-4o': { input: 0.005, output: 0.015 }, // per 1K tokens
    'gpt-4o-mini': { input: 0.0001, output: 0.0004 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    'dall-e-3': { input: 0.040, output: 0 } // per image, not tokens
  };

  if (type === 'image') {
    return pricing[model]?.input || 0.040;
  }

  const rates = pricing[model] || pricing['gpt-4o'];
  return ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000;
}

function calculateAnthropicCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number, output: number }> = {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-5-haiku-20241022': { input: 0.00025, output: 0.00125 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
  };

  const rates = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
  return ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000;
}

function calculateGoogleCost(model: string, totalTokens: number): number {
  const pricing: Record<string, number> = {
    'gemini-1.5-pro-latest': 0.00125, // per 1K tokens
    'gemini-1.5-flash-latest': 0.00007
  };

  const rate = pricing[model] || pricing['gemini-1.5-pro-latest'];
  return (totalTokens * rate) / 1000;
}

function calculatePerplexityCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number, output: number }> = {
    'llama-3.1-sonar-large-128k-online': { input: 0.001, output: 0.001 },
    'llama-3.1-sonar-small-128k-online': { input: 0.0002, output: 0.0002 }
  };

  const rates = pricing[model] || pricing['llama-3.1-sonar-large-128k-online'];
  return ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000;
}