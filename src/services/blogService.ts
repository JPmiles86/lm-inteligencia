// Blog Service - Handles blog data operations using database API

import { BlogPost } from '../data/blogData';
import { Block } from '../components/admin/BlogManagement/types';
import { blocksToHtml } from '../components/admin/BlogManagement/utils/blockHelpers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  blocks?: Block[];
  editorType?: 'rich' | 'block';
  category: string;
  tags: string[];
  featuredImage: string;
  featured: boolean;
  publishedDate: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
  readTime: number;
}

// Extended interface for rich text editor
export interface RichTextBlogFormData extends BlogFormData {
  editorType: 'rich' | 'block';
  images: string[];
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: Date;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string[];
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  monthlyPublications: Record<string, number>;
}

export interface BlogPostFilters {
  page?: number;
  limit?: number;
  category?: string;
  published?: boolean;
  featured?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: PaginationInfo;
}

class BlogDatabaseService {
  private authToken: string | null = null;

  constructor() {
    // Get auth token from localStorage or session storage
    this.authToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Handle authentication error
        this.authToken = null;
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
        throw new Error('Authentication required');
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || data;
  }

  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return this.handleApiResponse<T>(response);
  }

  // Get all blog posts with filtering and pagination
  async getAllPosts(filters: BlogPostFilters = {}): Promise<BlogPostsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.published !== undefined) queryParams.append('published', filters.published.toString());
      if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const endpoint = `/admin/blog/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await this.apiCall<BlogPostsResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      console.log('Falling back to hardcoded blog data for admin');
      return this.getFallbackBlogPosts(filters);
    }
  }

  // Fallback method using hardcoded blog data
  private async getFallbackBlogPosts(filters: BlogPostFilters = {}): Promise<BlogPostsResponse> {
    const { blogPosts } = await import('../data/blogData');
    
    let filteredPosts = [...blogPosts];
    
    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.category && filters.category !== 'All') {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.tags!.some(tag => post.tags.some(postTag => postTag.toLowerCase().includes(tag.toLowerCase())))
      );
    }
    
    if (filters.published !== undefined) {
      filteredPosts = filteredPosts.filter(post => 
        filters.published ? (post.published !== false && post.publishedDate !== null) : 
                           (post.published === false || post.publishedDate === null)
      );
    }
    
    if (filters.featured !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
    }
    
    // Sort posts
    const sortBy = filters.sortBy || 'publishedAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    filteredPosts.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'publishedAt':
        default:
          aValue = new Date(a.publishedDate || '1970-01-01');
          bValue = new Date(b.publishedDate || '1970-01-01');
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredPosts.length / limit),
        totalCount: filteredPosts.length,
        hasNext: endIndex < filteredPosts.length,
        hasPrevious: page > 1
      }
    };
  }

  // Get all published posts (for public use)
  async getAllPublishedPosts(filters: BlogPostFilters = {}): Promise<BlogPostsResponse> {
    try {
      const publishedFilters = { ...filters, published: true };
      const queryParams = new URLSearchParams();
      
      if (publishedFilters.page) queryParams.append('page', publishedFilters.page.toString());
      if (publishedFilters.limit) queryParams.append('limit', publishedFilters.limit.toString());
      if (publishedFilters.category) queryParams.append('category', publishedFilters.category);
      if (publishedFilters.featured !== undefined) queryParams.append('featured', publishedFilters.featured.toString());
      if (publishedFilters.search) queryParams.append('search', publishedFilters.search);
      if (publishedFilters.tags && publishedFilters.tags.length > 0) {
        publishedFilters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (publishedFilters.sortBy) queryParams.append('sortBy', publishedFilters.sortBy);
      if (publishedFilters.sortOrder) queryParams.append('sortOrder', publishedFilters.sortOrder);

      const endpoint = `/blog/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await this.apiCall<BlogPostsResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }
  }

  // Get all draft posts
  async getAllDrafts(filters: BlogPostFilters = {}): Promise<BlogPostsResponse> {
    try {
      const draftFilters = { ...filters, published: false };
      return await this.getAllPosts(draftFilters);
    } catch (error) {
      console.error('Error fetching draft posts:', error);
      throw error;
    }
  }

  // Get a single post by ID
  async getPostById(id: number): Promise<BlogPost | null> {
    try {
      const post = await this.apiCall<BlogPost>(`/admin/blog/posts/${id}`);
      return post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error fetching post by ID:', error);
      throw error;
    }
  }

  // Get a single post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const post = await this.apiCall<BlogPost>(`/admin/blog/posts/slug/${slug}`);
      return post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error fetching post by slug:', error);
      throw error;
    }
  }

  // Get a published post by slug (for public use)
  async getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const post = await this.apiCall<BlogPost>(`/blog/posts/${slug}`);
      return post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error fetching published post by slug:', error);
      throw error;
    }
  }

  // Convert form data to API format
  private formatPostForAPI(formData: BlogFormData): any {
    // Process content based on editor type
    let processedContent = formData.content;
    if (formData.editorType === 'block' && formData.blocks) {
      processedContent = blocksToHtml(formData.blocks);
    }

    return {
      title: formData.title,
      slug: formData.slug || this.generateSlug(formData.title),
      excerpt: formData.excerpt,
      content: processedContent,
      featuredImage: formData.featuredImage,
      category: formData.category,
      tags: formData.tags,
      featured: formData.featured,
      published: Boolean(formData.publishedDate),
      publishedAt: formData.publishedDate ? new Date(formData.publishedDate).toISOString() : null,
      authorName: formData.author.name,
      authorTitle: formData.author.title,
      authorImage: formData.author.image,
      readTime: formData.readTime || this.calculateReadTime(processedContent),
      editorType: formData.editorType || 'rich',
      blocks: formData.blocks || []
    };
  }

  // Create a new blog post
  async createPost(formData: BlogFormData, isDraft: boolean = false): Promise<BlogPost> {
    try {
      const postData = this.formatPostForAPI(formData);
      
      // Set published status based on isDraft flag
      postData.published = !isDraft;
      if (isDraft) {
        postData.publishedAt = null;
      }

      const newPost = await this.apiCall<BlogPost>('/admin/blog/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Update an existing blog post
  async updatePost(id: number, formData: BlogFormData, isDraft: boolean = false): Promise<BlogPost | null> {
    try {
      const postData = this.formatPostForAPI(formData);
      
      // Set published status based on isDraft flag
      postData.published = !isDraft;
      if (isDraft) {
        postData.publishedAt = null;
      }

      const updatedPost = await this.apiCall<BlogPost>(`/admin/blog/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });

      return updatedPost;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Delete a blog post
  async deletePost(id: number): Promise<boolean> {
    try {
      await this.apiCall(`/admin/blog/posts/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Toggle published status
  async togglePublished(id: number): Promise<BlogPost | null> {
    try {
      const response = await this.apiCall<{ post: BlogPost; action: string }>(`/admin/blog/posts/${id}/publish`, {
        method: 'PATCH',
      });
      return response.post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error toggling publish status:', error);
      throw error;
    }
  }

  // Toggle featured status
  async toggleFeatured(id: number): Promise<BlogPost | null> {
    try {
      const response = await this.apiCall<{ post: BlogPost; action: string }>(`/admin/blog/posts/${id}/feature`, {
        method: 'PATCH',
      });
      return response.post;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error toggling feature status:', error);
      throw error;
    }
  }

  // Publish a draft (legacy method for compatibility)
  async publishDraft(id: number): Promise<BlogPost | null> {
    return await this.togglePublished(id);
  }

  // Get blog statistics
  async getStats(): Promise<BlogStats> {
    try {
      const stats = await this.apiCall<BlogStats>('/admin/blog/stats');
      return stats;
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      console.log('Falling back to hardcoded blog data for stats');
      return this.getFallbackStats();
    }
  }

  // Fallback method for blog stats
  private async getFallbackStats(): Promise<BlogStats> {
    const { blogPosts } = await import('../data/blogData');
    
    const publishedPosts = blogPosts.filter(post => post.published !== false && post.publishedDate !== null);
    const draftPosts = blogPosts.filter(post => post.published === false || post.publishedDate === null);
    
    return {
      totalPosts: blogPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews: 0, // Not available in hardcoded data
      categories: [...new Set(blogPosts.map(post => post.category))].length
    };
  }

  // Get available categories
  async getCategories(): Promise<string[]> {
    try {
      const categories = await this.apiCall<string[]>('/admin/blog/categories');
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.log('Falling back to hardcoded blog data for categories');
      return this.getFallbackCategories();
    }
  }

  // Fallback method for categories
  private async getFallbackCategories(): Promise<string[]> {
    const { blogCategories } = await import('../data/blogData');
    return blogCategories.filter(cat => cat !== 'All');
  }

  // Get available tags
  async getTags(): Promise<string[]> {
    try {
      const tags = await this.apiCall<string[]>('/admin/blog/tags');
      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  // Get popular tags
  async getPopularTags(limit: number = 20): Promise<string[]> {
    try {
      const tags = await this.getTags();
      return tags.slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      throw error;
    }
  }

  // Search posts
  async searchPosts(
    query: string, 
    category?: string, 
    includeDrafts: boolean = false,
    page: number = 1,
    limit: number = 10
  ): Promise<BlogPostsResponse> {
    try {
      const filters: BlogPostFilters = {
        search: query,
        page,
        limit
      };
      
      if (category && category !== 'All') {
        filters.category = category;
      }
      
      if (!includeDrafts) {
        filters.published = true;
      }

      return await this.getAllPosts(filters);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  // Image upload to GCS
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Upload image for Quill editor
  async uploadQuillImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/quill-image`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading Quill image:', error);
      throw error;
    }
  }

  // Create a new rich text blog post with extended data
  async createRichTextPost(formData: RichTextBlogFormData): Promise<BlogPost> {
    const isDraft = formData.status === 'draft';
    return await this.createPost(formData, isDraft);
  }

  // Update an existing rich text blog post
  async updateRichTextPost(id: number, formData: RichTextBlogFormData): Promise<BlogPost | null> {
    const isDraft = formData.status === 'draft';
    return await this.updatePost(id, formData, isDraft);
  }

  // Duplicate a blog post
  async duplicatePost(id: number): Promise<BlogPost | null> {
    try {
      const duplicatedPost = await this.apiCall<BlogPost>(`/admin/blog/posts/${id}/duplicate`, {
        method: 'POST',
      });
      return duplicatedPost;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error duplicating post:', error);
      throw error;
    }
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('admin_token', token);
  }

  // Clear authentication token
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Utility functions

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

export const blogService = new BlogDatabaseService();