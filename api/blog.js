// Consolidated Public Blog API
// Combines public blog endpoints into one serverless function

export default async function handler(req, res) {
  const { method, query } = req;
  const { slug } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route based on whether slug is provided
    if (slug) {
      // Get single post by slug
      req.query.slug = slug;
      const slugHandler = await import('./blog/posts/slug/[slug].js');
      return slugHandler.default(req, res);
    } else {
      // Get all posts
      const postsHandler = await import('./blog/posts.js');
      return postsHandler.default(req, res);
    }
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}