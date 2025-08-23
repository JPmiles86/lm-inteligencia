import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
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
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Read file and convert to base64 data URL
    const fileData = fs.readFileSync(file.filepath);
    const base64 = fileData.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    // Return the data URL
    // In production, you'd want to upload to a CDN or cloud storage
    res.status(200).json({
      success: true,
      url: dataUrl
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload image' 
    });
  }
}