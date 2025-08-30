# Google Image Generation API Research
*Updated: August 29, 2025*

## 🎯 LATEST GOOGLE IMAGE MODELS

### Imagen 4 (Latest - May 2025)
**Status**: Public Preview on Vertex AI  
**Model ID**: `imagen-4.0-generate-001`  
**Key Features**:
- Photorealistic images with 2K resolution
- Near real-time generation speed
- Sharper clarity in fine details (fabrics, water, fur)
- Multiple aspect ratios supported
- Both photorealistic and abstract styles

### Imagen 3 (Current Stable)
**Status**: Generally Available  
**Model IDs**: 
- `imagen-3.0-generate-002` (Latest)
- `imagen-3.0-fast-generate-001` (Fast version)
**Features**:
- Brighter, better composed images
- Diverse art styles (photorealism to anime)
- Available to all Google Cloud customers
- SynthID watermarking included

### ⚠️ IMPORTANT DEPRECATION
- Imagen 1 & 2: Deprecated June 24, 2025
- Full removal: September 24, 2025
- **Must use Imagen 3 or 4**

---

## 📡 API IMPLEMENTATION

### Vertex AI Setup
```javascript
// API Endpoint
const VERTEX_AI_ENDPOINT = 'https://us-central1-aiplatform.googleapis.com/v1';

// Model paths
const IMAGEN_4_MODEL = 'projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-4.0-generate-001';
const IMAGEN_3_MODEL = 'projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-generate-002';
const IMAGEN_3_FAST = 'projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-fast-generate-001';
```

### Request Format
```javascript
const generateImage = async (prompt, apiKey) => {
  const response = await fetch(`${VERTEX_AI_ENDPOINT}/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-4.0-generate-001:predict`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 4,  // Generate 4 images
        aspectRatio: '1:1',  // Options: '1:1', '16:9', '9:16', '4:3', '3:4'
        mode: 'generate',  // or 'edit' for image editing
        personGeneration: 'allow',  // or 'block'
        safetyFilterLevel: 'block_some',  // Options: 'block_none', 'block_some', 'block_most'
        addWatermark: true,  // SynthID watermark
        seed: 123  // Optional for reproducibility
      }
    })
  });
  
  return await response.json();
};
```

### Authentication Options
1. **Service Account** (Recommended for production)
2. **Google AI Studio** (For testing - simpler auth)
3. **Application Default Credentials** (For development)

---

## 🎬 VEO MODELS (Video Generation)

### Veo 3 (Latest - Private Preview)
**Model ID**: `veo-3.0-generate-preview`  
**Features**:
- Native audio generation (sound effects, dialogue)
- Better physics and realism
- Accurate lip syncing
- Camera control (rotation, dolly, zoom)

### Veo 2 (Current)
**Status**: Available via VideoFX tool  
**Features**:
- Reference-powered video for consistency
- Camera movement controls
- Available to Ultra subscribers

---

## 🔧 IMPLEMENTATION PLAN FOR LM-INTELIGENCIA

### 1. Primary Implementation - Imagen 4
```javascript
// src/services/ai/GoogleImageService.js
export class GoogleImageService {
  constructor() {
    this.baseUrl = 'https://us-central1-aiplatform.googleapis.com/v1';
    this.models = {
      'imagen-4': 'imagen-4.0-generate-001',
      'imagen-3': 'imagen-3.0-generate-002',
      'imagen-3-fast': 'imagen-3.0-fast-generate-001'
    };
  }

  async generateImages(prompt, options = {}) {
    const {
      model = 'imagen-4',
      count = 4,
      aspectRatio = '1:1',
      resolution = '2048x2048'
    } = options;

    // Implementation details...
  }
}
```

### 2. Fallback Strategy
- Primary: Imagen 4 (best quality)
- Fallback 1: Imagen 3 Fast (speed)
- Fallback 2: OpenAI DALL-E 3 (if Google unavailable)

### 3. UI Integration Points
- Add to provider selector
- Create image generation modal
- Auto-generate prompts from blog content
- Gallery view for generated images

---

## 💰 PRICING (Vertex AI)

### Imagen 4
- **Standard**: $0.040 per image (1K resolution)
- **High-res**: $0.060 per image (2K resolution)

### Imagen 3
- **Standard**: $0.020 per image
- **Fast**: $0.010 per image

### Batch Processing
- 50% discount for batch requests
- Minimum 10 images per batch

---

## 🔑 SETUP REQUIREMENTS

1. **Google Cloud Project**
   - Enable Vertex AI API
   - Create service account
   - Download credentials JSON

2. **Permissions Required**
   - `aiplatform.endpoints.predict`
   - `aiplatform.models.predict`

3. **Environment Variables**
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
   ```

---

## ✅ ACTION ITEMS FOR AGENT-5

1. **Set up Vertex AI authentication**
2. **Implement GoogleImageService.js**
3. **Create image generation UI component**
4. **Add auto-prompt generation from blog**
5. **Test with Imagen 4 first, then add fallbacks**
6. **Implement gallery and download features**

---

## 📝 NOTES

- **NOT "Nano Banana"** - No Google model by that name
- **Imagen 4** is the latest and best for images
- **Veo 3** is for video (not needed for blog images)
- **SynthID** watermarking is automatic
- **Google AI Studio** might be easier for initial testing

---

*Research Complete - Ready for Implementation*