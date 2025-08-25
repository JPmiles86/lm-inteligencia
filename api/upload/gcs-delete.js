import { deleteImageFromGCS } from '../../src/services/gcsService.ts';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    // Validate environment variables
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
      console.error('GCS environment variables not configured');
      return res.status(200).json({
        success: true,
        message: 'GCS not configured - delete operation skipped'
      });
    }

    // Delete from Google Cloud Storage
    await deleteImageFromGCS(fileName);
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting from GCS:', error);
    
    // Return success even if delete fails to avoid blocking UI
    res.status(200).json({
      success: true,
      message: 'Delete operation completed (may have failed)',
      error: error.message
    });
  }
}