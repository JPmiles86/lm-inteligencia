// Consolidated Upload API
// Combines all upload-related endpoints into one serverless function

export default async function handler(req, res) {
  const { method, query } = req;
  const { action } = query;

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
      case 'image':
        return handleImage(req, res);
      case 'gcs-image':
        return handleGcsImage(req, res);
      case 'gcs-delete':
        return handleGcsDelete(req, res);
      case 'quill-image':
        return handleQuillImage(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Import existing handlers from lib directory
async function handleImage(req, res) {
  const imageHandler = await import('../lib/api-handlers/image.js');
  return imageHandler.default(req, res);
}

async function handleGcsImage(req, res) {
  const gcsImageHandler = await import('../lib/api-handlers/gcs-image.js');
  return gcsImageHandler.default(req, res);
}

async function handleGcsDelete(req, res) {
  const gcsDeleteHandler = await import('../lib/api-handlers/gcs-delete.js');
  return gcsDeleteHandler.default(req, res);
}

async function handleQuillImage(req, res) {
  const quillImageHandler = await import('../lib/api-handlers/quill-image.js');
  return quillImageHandler.default(req, res);
}