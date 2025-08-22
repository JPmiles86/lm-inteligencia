import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import after dotenv config
const { uploadImageToGCS, deleteImageFromGCS, validateImageFile } = await import('../src/services/gcsService.js');

// Import blog API routes
const blogPublicRoutes = await import('../src/routes/blogPublic.js');
const blogAdminRoutes = await import('../src/routes/blogAdmin.js');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Blog API Routes
app.use('/api/blog', blogPublicRoutes.default);
app.use('/api/admin/blog', blogAdminRoutes.default);

// Upload image endpoint
app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Validate the uploaded file
    const validation = validateImageFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Upload to Google Cloud Storage
    const result = await uploadImageToGCS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      data: {
        fileName: result.fileName,
        publicUrl: result.publicUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Upload multiple images endpoint
app.post('/api/upload/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
      // Validate each file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(`${file.originalname}: ${validation.error}`);
      }

      // Upload to Google Cloud Storage
      const result = await uploadImageToGCS(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      return {
        fileName: result.fileName,
        publicUrl: result.publicUrl,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: uploadResults
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload images'
    });
  }
});

// Delete image endpoint
app.delete('/api/upload/delete', async (req, res) => {
  try {
    const { fileName } = req.body;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: 'File name is required'
      });
    }

    await deleteImageFromGCS(fileName);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// Upload for Quill editor (returns in specific format expected by Quill)
app.post('/api/upload/quill-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Validate the uploaded file
    const validation = validateImageFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Upload to Google Cloud Storage
    const result = await uploadImageToGCS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Return in format expected by Quill
    res.json({
      url: result.publicUrl
    });

  } catch (error) {
    console.error('Quill upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image'
    });
  }
});

// Upload-specific error handling
app.use('/api/upload', (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Upload error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Global error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;