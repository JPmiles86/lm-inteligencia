// Consolidated AI API
// Combines all AI-related endpoints into one serverless function

export default async function handler(req, res) {
  const { method, query, body } = req;
  const { action, id } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route to appropriate handler based on action
    switch (action) {
      case 'generate':
        return handleGenerate(req, res);
      case 'providers':
        return handleProviders(req, res);
      case 'context':
        return handleContext(req, res);
      case 'style-guides':
        return handleStyleGuides(req, res);
      case 'tree':
        return handleTree(req, res);
      case 'analytics':
        return handleAnalytics(req, res);
      case 'images':
        return handleImages(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Import existing handlers from lib directory
async function handleGenerate(req, res) {
  const generateHandler = await import('../lib/api-handlers/generate.js');
  return generateHandler.default(req, res);
}

async function handleProviders(req, res) {
  const providersHandler = await import('../lib/api-handlers/providers.js');
  return providersHandler.default(req, res);
}

async function handleContext(req, res) {
  const contextHandler = await import('../lib/api-handlers/context.js');
  return contextHandler.default(req, res);
}

async function handleStyleGuides(req, res) {
  const styleGuidesHandler = await import('../lib/api-handlers/style-guides.js');
  return styleGuidesHandler.default(req, res);
}

async function handleTree(req, res) {
  const treeHandler = await import('../lib/api-handlers/tree.js');
  return treeHandler.default(req, res);
}

async function handleAnalytics(req, res) {
  const analyticsHandler = await import('../lib/api-handlers/analytics.js');
  return analyticsHandler.default(req, res);
}

async function handleImages(req, res) {
  const imagesHandler = await import('../lib/api-handlers/images.js');
  return imagesHandler.default(req, res);
}