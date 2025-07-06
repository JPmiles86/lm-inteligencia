// Blog Service - Handles blog data operations and storage

import { BlogPost, blogPosts as initialBlogPosts, blogCategories } from '../data/blogData';

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
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

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  monthlyPublications: Record<string, number>;
}

class BlogService {
  private storageKey = 'inteligencia_blog_posts';
  private draftsKey = 'inteligencia_blog_drafts';

  // Get all published blog posts
  getAllPosts(): BlogPost[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default posts if none exist
      this.savePosts(initialBlogPosts);
      return initialBlogPosts;
    } catch (error) {
      console.error('Error loading blog posts:', error);
      return initialBlogPosts;
    }
  }

  // Get all draft posts
  getAllDrafts(): BlogPost[] {
    try {
      const stored = localStorage.getItem(this.draftsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading draft posts:', error);
      return [];
    }
  }

  // Get a single post by ID (from published or drafts)
  getPostById(id: string): BlogPost | null {
    const publishedPosts = this.getAllPosts();
    const draftPosts = this.getAllDrafts();
    
    return publishedPosts.find(post => post.id === id) || 
           draftPosts.find(post => post.id === id) || 
           null;
  }

  // Get a single post by slug
  getPostBySlug(slug: string): BlogPost | null {
    const publishedPosts = this.getAllPosts();
    return publishedPosts.find(post => post.slug === slug) || null;
  }

  // Save posts to storage
  private savePosts(posts: BlogPost[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving blog posts:', error);
    }
  }

  // Save drafts to storage
  private saveDrafts(drafts: BlogPost[]): void {
    try {
      localStorage.setItem(this.draftsKey, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving draft posts:', error);
    }
  }

  // Create a new blog post
  createPost(formData: BlogFormData, isDraft: boolean = false): BlogPost {
    const newPost: BlogPost = {
      id: this.generateId(),
      ...formData,
      slug: this.generateSlug(formData.title),
      publishedDate: isDraft ? '' : (formData.publishedDate || new Date().toISOString().split('T')[0] || ''),
      readTime: this.calculateReadTime(formData.content)
    };

    if (isDraft) {
      const drafts = this.getAllDrafts();
      drafts.push(newPost);
      this.saveDrafts(drafts);
    } else {
      const posts = this.getAllPosts();
      posts.push(newPost);
      this.savePosts(posts);
    }

    return newPost;
  }

  // Update an existing blog post
  updatePost(id: string, formData: BlogFormData, isDraft: boolean = false): BlogPost | null {
    const publishedPosts = this.getAllPosts();
    const draftPosts = this.getAllDrafts();
    
    // Find the post in either published or drafts
    let postIndex = publishedPosts.findIndex(post => post.id === id);
    const isInPublished = postIndex !== -1;
    
    if (!isInPublished) {
      postIndex = draftPosts.findIndex(post => post.id === id);
      if (postIndex === -1) {
        return null; // Post not found
      }
    }

    const updatedPost: BlogPost = {
      id,
      ...formData,
      slug: this.generateSlug(formData.title),
      publishedDate: isDraft ? '' : (formData.publishedDate || new Date().toISOString().split('T')[0] || ''),
      readTime: this.calculateReadTime(formData.content)
    };

    // Handle moving between published and draft states
    if (isDraft && isInPublished) {
      // Move from published to draft
      publishedPosts.splice(postIndex, 1);
      draftPosts.push(updatedPost);
      this.savePosts(publishedPosts);
      this.saveDrafts(draftPosts);
    } else if (!isDraft && !isInPublished) {
      // Move from draft to published
      draftPosts.splice(postIndex, 1);
      publishedPosts.push(updatedPost);
      this.savePosts(publishedPosts);
      this.saveDrafts(draftPosts);
    } else if (isDraft) {
      // Update in drafts
      draftPosts[postIndex] = updatedPost;
      this.saveDrafts(draftPosts);
    } else {
      // Update in published
      publishedPosts[postIndex] = updatedPost;
      this.savePosts(publishedPosts);
    }

    return updatedPost;
  }

  // Delete a blog post
  deletePost(id: string): boolean {
    const publishedPosts = this.getAllPosts();
    const draftPosts = this.getAllDrafts();
    
    const publishedIndex = publishedPosts.findIndex(post => post.id === id);
    const draftIndex = draftPosts.findIndex(post => post.id === id);
    
    if (publishedIndex !== -1) {
      publishedPosts.splice(publishedIndex, 1);
      this.savePosts(publishedPosts);
      return true;
    } else if (draftIndex !== -1) {
      draftPosts.splice(draftIndex, 1);
      this.saveDrafts(draftPosts);
      return true;
    }
    
    return false;
  }

  // Publish a draft post
  publishDraft(id: string): BlogPost | null {
    const drafts = this.getAllDrafts();
    const draftIndex = drafts.findIndex(post => post.id === id);
    
    if (draftIndex === -1) {
      return null;
    }
    
    const draft = drafts[draftIndex];
    if (!draft) {
      return null;
    }
    
    const publishedPost: BlogPost = {
      ...draft,
      publishedDate: new Date().toISOString().split('T')[0] || ''
    };
    
    // Remove from drafts and add to published
    drafts.splice(draftIndex, 1);
    const publishedPosts = this.getAllPosts();
    publishedPosts.push(publishedPost);
    
    this.saveDrafts(drafts);
    this.savePosts(publishedPosts);
    
    return publishedPost;
  }

  // Get blog statistics
  getStats(): BlogStats {
    const publishedPosts = this.getAllPosts();
    const draftPosts = this.getAllDrafts();
    const allPosts = [...publishedPosts, ...draftPosts];

    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const monthlyPublications: Record<string, number> = {};

    publishedPosts.forEach(post => {
      // Category counts
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
      
      // Tag counts
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      // Monthly publications
      if (post.publishedDate) {
        const month = post.publishedDate.substring(0, 7); // YYYY-MM
        monthlyPublications[month] = (monthlyPublications[month] || 0) + 1;
      }
    });

    return {
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      featuredPosts: publishedPosts.filter(post => post.featured).length,
      categoryCounts,
      tagCounts,
      monthlyPublications
    };
  }

  // Get available categories
  getCategories(): string[] {
    return blogCategories.slice(1); // Remove "All" category
  }

  // Get popular tags
  getPopularTags(limit: number = 20): string[] {
    const stats = this.getStats();
    return Object.entries(stats.tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  }

  // Search posts
  searchPosts(query: string, category?: string, includeDrafts: boolean = false): BlogPost[] {
    const publishedPosts = this.getAllPosts();
    const draftPosts = includeDrafts ? this.getAllDrafts() : [];
    const allPosts = [...publishedPosts, ...draftPosts];
    
    if (!query.trim() && !category) {
      return allPosts;
    }

    let filtered = allPosts;

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(post => post.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        post.author.name.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  // Export all blog data
  exportData(): { posts: BlogPost[]; drafts: BlogPost[] } {
    return {
      posts: this.getAllPosts(),
      drafts: this.getAllDrafts()
    };
  }

  // Import blog data
  importData(data: { posts?: BlogPost[]; drafts?: BlogPost[] }): void {
    if (data.posts) {
      this.savePosts(data.posts);
    }
    if (data.drafts) {
      this.saveDrafts(data.drafts);
    }
  }

  // Utility functions
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

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

export const blogService = new BlogService();