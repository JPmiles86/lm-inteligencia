import { uploadImageToGCS } from '../../src/services/gcsService.ts';

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
    const { image, filename, mimetype } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!filename || !mimetype) {
      return res.status(400).json({ error: 'Filename and mimetype are required' });
    }

    // Validate environment variables
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
      console.error('GCS environment variables not configured');
      // Fallback to base64 if GCS not configured
      return res.status(200).json({
        success: true,
        publicUrl: image,
        fileName: filename,
        fallback: true,
        message: 'Using base64 fallback - GCS not configured'
      });
    }

    // Convert base64 to buffer
    let buffer;
    try {
      // Remove data URL prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Error converting base64 to buffer:', error);
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    // Upload to Google Cloud Storage
    const result = await uploadImageToGCS(buffer, filename, mimetype);
    
    res.status(200).json({
      success: true,
      fileName: result.fileName,
      publicUrl: result.publicUrl
    });

  } catch (error) {
    console.error('Error uploading to GCS:', error);
    
    // Fallback to base64 if GCS upload fails
    const { image } = req.body;
    res.status(200).json({
      success: true,
      publicUrl: image,
      fileName: req.body.filename || 'fallback-image',
      fallback: true,
      error: error.message,
      message: 'Using base64 fallback due to GCS error'
    });
  }
}