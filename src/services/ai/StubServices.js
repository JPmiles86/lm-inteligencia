// Stub services for Vercel compatibility
// These provide minimal functionality to prevent errors

export class AnalyticsService {
  async getGenerationStats(filters) {
    return { total: 0, byProvider: {}, byType: {} };
  }

  async getProviderUsage(filters) {
    return { usage: [], total: 0 };
  }

  async getContentPerformance(filters) {
    return { performance: [] };
  }

  async getCostAnalysis(filters) {
    return { costs: [], total: 0 };
  }

  async getAnalyticsOverview(filters) {
    return { overview: {} };
  }

  async trackGeneration(data) {
    return { success: true };
  }
}

export class ContextService {
  async getAvailableSections(filters) {
    return [
      { id: 'brand', name: 'Brand Guidelines', selected: false },
      { id: 'vertical', name: 'Industry Context', selected: false },
      { id: 'previous', name: 'Previous Content', selected: false }
    ];
  }

  async buildContext(data) {
    return 'Context built from: ' + JSON.stringify(data.sections);
  }

  async buildContextPreview(data) {
    return { preview: 'Preview not available', tokens: 0 };
  }

  async getTemplates(filters) {
    return [];
  }

  async saveContextTemplate(data) {
    return { ...data, id: Date.now() };
  }

  async calculateTokens(text) {
    return Math.ceil((text || '').length / 4);
  }
}

export class GenerationService {
  async generateContent(config) {
    return {
      generation: {
        id: Date.now(),
        content: 'Generation not implemented',
        status: 'completed'
      },
      usage: { totalTokens: 0 },
      cost: 0,
      durationMs: 0
    };
  }

  async generateVariations(config) {
    return [];
  }

  async generateSEOMetadata(config) {
    return {
      title: 'SEO Title',
      description: 'SEO Description',
      keywords: []
    };
  }

  async enhanceContent(config) {
    return { content: config.content };
  }
}

export class TreeNodeService {
  async getNode(nodeId, options) {
    return { id: nodeId, children: [] };
  }

  async getRootNodes() {
    return [];
  }

  async createNode(data) {
    return { ...data, id: Date.now() };
  }

  async updateNode(nodeId, data) {
    return { ...data, id: nodeId };
  }

  async deleteNode(nodeId) {
    return { success: true };
  }

  async createBranch(data) {
    return {
      generation: { id: Date.now(), content: 'Branch created' },
      tokensUsed: 0,
      cost: 0,
      durationMs: 0
    };
  }
}

export class ImageGenerationService {
  async getImage(imageId) {
    return { id: imageId, url: '' };
  }

  async getRecentImages() {
    return [];
  }

  async generateImage(config) {
    return { url: '', id: Date.now() };
  }

  async deleteImage(imageId) {
    return { success: true };
  }
}