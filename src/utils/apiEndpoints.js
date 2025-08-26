// Centralized API endpoint configuration
// Maps old individual endpoints to new consolidated ones

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://laurie-inteligencia.com/api'
  : 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Admin endpoints - now consolidated
  admin: {
    posts: `${API_BASE}/admin?action=posts`,
    post: (id) => `${API_BASE}/admin?action=post&id=${id}`,
    categories: `${API_BASE}/admin?action=categories`,
    revisions: `${API_BASE}/admin?action=revisions`,
    stats: `${API_BASE}/admin?action=stats`,
    enhanced: `${API_BASE}/admin?action=enhanced`,
  },
  
  // AI endpoints - now consolidated
  ai: {
    generate: `${API_BASE}/ai?action=generate`,
    providers: `${API_BASE}/ai?action=providers`,
    context: `${API_BASE}/ai?action=context`,
    styleGuides: `${API_BASE}/ai?action=style-guides`,
    tree: `${API_BASE}/ai?action=tree`,
    analytics: `${API_BASE}/ai?action=analytics`,
    images: `${API_BASE}/ai?action=images`,
  },
  
  // Public blog endpoints - now consolidated
  blog: {
    posts: `${API_BASE}/blog`,
    post: (slug) => `${API_BASE}/blog?slug=${slug}`,
  },
  
  // Upload endpoints - now consolidated
  upload: {
    image: `${API_BASE}/upload?action=image`,
    gcsImage: `${API_BASE}/upload?action=gcs-image`,
    gcsDelete: `${API_BASE}/upload?action=gcs-delete`,
    quillImage: `${API_BASE}/upload?action=quill-image`,
  },
};

// Helper function to migrate old API calls
export function getApiUrl(oldPath) {
  // Map old paths to new consolidated endpoints
  const pathMappings = {
    '/api/admin/blog/posts': API_ENDPOINTS.admin.posts,
    '/api/admin/blog/categories': API_ENDPOINTS.admin.categories,
    '/api/admin/blog/revisions': API_ENDPOINTS.admin.revisions,
    '/api/admin/blog/stats': API_ENDPOINTS.admin.stats,
    '/api/admin/blog/posts-enhanced': API_ENDPOINTS.admin.enhanced,
    '/api/ai/generate': API_ENDPOINTS.ai.generate,
    '/api/ai/providers': API_ENDPOINTS.ai.providers,
    '/api/ai/context': API_ENDPOINTS.ai.context,
    '/api/ai/style-guides': API_ENDPOINTS.ai.styleGuides,
    '/api/ai/tree': API_ENDPOINTS.ai.tree,
    '/api/ai/analytics': API_ENDPOINTS.ai.analytics,
    '/api/ai/images': API_ENDPOINTS.ai.images,
    '/api/blog/posts': API_ENDPOINTS.blog.posts,
    '/api/upload/image': API_ENDPOINTS.upload.image,
    '/api/upload/gcs-image': API_ENDPOINTS.upload.gcsImage,
    '/api/upload/gcs-delete': API_ENDPOINTS.upload.gcsDelete,
    '/api/upload/quill-image': API_ENDPOINTS.upload.quillImage,
  };
  
  return pathMappings[oldPath] || oldPath;
}

export default API_ENDPOINTS;