export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

import { uploadImageToGCS } from '../../src/services/gcsService.ts';

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

    // Check if GCS is configured
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('GCS not configured, using base64 fallback');
      return res.status(200).json({
        success: true,
        url: image,
        fallback: true,
        message: 'Using base64 fallback - GCS not configured'
      });
    }

    try {
      // Extract filename and mimetype from base64 data URL
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 data URL format');
      }

      const mimetype = matches[1];
      const base64Data = matches[2];
      const extension = mimetype.split('/')[1] || 'jpg';
      const filename = `uploaded-${Date.now()}.${extension}`;

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to Google Cloud Storage
      const result = await uploadImageToGCS(buffer, filename, mimetype);
      
      res.status(200).json({
        success: true,
        url: result.publicUrl,
        fileName: result.fileName,
        gcs: true
      });

    } catch (gcsError) {
      console.error('GCS upload failed, using fallback:', gcsError);
      // Fallback to base64 if GCS fails
      res.status(200).json({
        success: true,
        url: image,
        fallback: true,
        error: gcsError.message,
        message: 'Using base64 fallback due to GCS error'
      });
    }

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process image' 
    });
  }
}