export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // The image is already a base64 data URL from the frontend
    // In production, you'd want to upload to a CDN or cloud storage
    // For now, we'll just return it as-is
    
    res.status(200).json({
      success: true,
      url: image
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process image' 
    });
  }
}