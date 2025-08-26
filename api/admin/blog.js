// Consolidated Admin Blog API
// Combines posts, categories, revisions, and stats into one endpoint

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
      case 'posts':
        return handlePosts(req, res);
      case 'post':
        return handleSinglePost(req, res, id);
      case 'categories':
        return handleCategories(req, res);
      case 'revisions':
        return handleRevisions(req, res);
      case 'stats':
        return handleStats(req, res);
      case 'enhanced':
        return handleEnhancedPosts(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Import existing handlers
async function handlePosts(req, res) {
  const postsHandler = await import('./blog/posts.js');
  return postsHandler.default(req, res);
}

async function handleSinglePost(req, res, id) {
  req.query.id = id;
  const postHandler = await import('./blog/posts/[id].js');
  return postHandler.default(req, res);
}

async function handleCategories(req, res) {
  const categoriesHandler = await import('./blog/categories.js');
  return categoriesHandler.default(req, res);
}

async function handleRevisions(req, res) {
  const revisionsHandler = await import('./blog/revisions.js');
  return revisionsHandler.default(req, res);
}

async function handleStats(req, res) {
  const statsHandler = await import('./blog/stats.js');
  return statsHandler.default(req, res);
}

async function handleEnhancedPosts(req, res) {
  const enhancedHandler = await import('./blog/posts-enhanced.js');
  return enhancedHandler.default(req, res);
}