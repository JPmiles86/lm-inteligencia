// Content Processing Utilities for Blog Migration
// Handles content transformation and validation

export interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
  publishedDate: string | null;
  readTime: number;
  category: string;
  tags: string[];
  featuredImage: string;
  featured: boolean;
}

export interface ProcessedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedDate: string;
  authorName: string;
  authorTitle: string;
  authorImage?: string;
  readTime: number;
  editorType: 'rich' | 'block';
}

export class ContentProcessor {
  /**
   * Transform blog data from source format to database format
   */
  transformBlogPost(sourcePost: BlogPostData): ProcessedBlogPost {
    return {
      title: sourcePost.title.trim(),
      slug: this.generateSlug(sourcePost.title),
      excerpt: sourcePost.excerpt.trim(),
      content: this.processContent(sourcePost.content),
      featuredImage: sourcePost.featuredImage,
      category: sourcePost.category,
      tags: sourcePost.tags || [],
      featured: sourcePost.featured || false,
      published: true, // All existing posts are published
      publishedDate: this.formatDate(sourcePost.publishedDate),
      authorName: sourcePost.author.name,
      authorTitle: sourcePost.author.title,
      authorImage: sourcePost.author.image,
      readTime: sourcePost.readTime || this.calculateReadTime(sourcePost.content),
      editorType: 'rich' // Default to rich text editor
    };
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Process content for database storage
   */
  private processContent(content: string): string {
    let processedContent = content.trim();

    // Ensure consistent line endings
    processedContent = processedContent.replace(/\r\n/g, '\n');
    
    // Clean up extra whitespace while preserving structure
    processedContent = processedContent.replace(/\n{3,}/g, '\n\n');
    
    // Ensure markdown headers have proper spacing
    processedContent = processedContent.replace(/\n(#{1,6})/g, '\n\n$1');
    processedContent = processedContent.replace(/(#{1,6}[^\n]+)\n([^\n#])/g, '$1\n\n$2');

    return processedContent;
  }

  /**
   * Format date to ISO string
   */
  private formatDate(dateString: string | null): string {
    try {
      if (!dateString) {
        // If date is null, use current date
        return new Date().toISOString().split('T')[0];
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If date is invalid, use current date
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      // Fallback to current date
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Calculate estimated read time
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Validate blog post data
   */
  validateBlogPost(post: ProcessedBlogPost): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!post.title || post.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!post.slug || post.slug.trim().length === 0) {
      errors.push('Slug is required');
    }

    if (!post.content || post.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!post.category || post.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!post.authorName || post.authorName.trim().length === 0) {
      errors.push('Author name is required');
    }

    // Length validations
    if (post.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }

    if (post.slug.length > 255) {
      errors.push('Slug must be 255 characters or less');
    }

    if (post.category.length > 100) {
      errors.push('Category must be 100 characters or less');
    }

    if (post.authorName.length > 100) {
      errors.push('Author name must be 100 characters or less');
    }

    if (post.authorTitle && post.authorTitle.length > 150) {
      errors.push('Author title must be 150 characters or less');
    }

    // URL validations
    if (post.featuredImage && !this.isValidUrl(post.featuredImage)) {
      errors.push('Featured image must be a valid URL');
    }

    if (post.authorImage && !this.isValidUrl(post.authorImage)) {
      errors.push('Author image must be a valid URL');
    }

    // Tags validation
    if (!Array.isArray(post.tags)) {
      errors.push('Tags must be an array');
    }

    // Read time validation
    if (typeof post.readTime !== 'number' || post.readTime < 1) {
      errors.push('Read time must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate URL format (including relative paths)
   */
  private isValidUrl(url: string): boolean {
    try {
      // Allow relative paths starting with /
      if (url.startsWith('/')) {
        return true;
      }
      // Try to parse as absolute URL
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up content for specific editor type
   */
  processContentForEditor(content: string, editorType: 'rich' | 'block'): string {
    if (editorType === 'rich') {
      // Convert markdown to HTML-like structure for rich text editor
      return this.convertMarkdownToHtml(content);
    } else {
      // Keep as markdown for block editor
      return content;
    }
  }

  /**
   * Convert basic markdown to HTML
   */
  private convertMarkdownToHtml(content: string): string {
    let html = content;

    // Headers
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images (already processed by image processor)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Paragraphs (basic)
    html = html.replace(/(<br>){2,}/g, '</p><p>');
    html = `<p>${html}</p>`;

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');

    return html;
  }

  /**
   * Extract all external links from content
   */
  extractExternalLinks(content: string): string[] {
    const links = new Set<string>();
    
    // Markdown links
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      if (match[2].startsWith('http')) {
        links.add(match[2]);
      }
    }

    // HTML links
    const htmlLinkRegex = /<a[^>]+href=['""]([^'""]+)['""][^>]*>/g;
    while ((match = htmlLinkRegex.exec(content)) !== null) {
      if (match[1].startsWith('http')) {
        links.add(match[1]);
      }
    }

    return Array.from(links);
  }

  /**
   * Generate content preview
   */
  generatePreview(content: string, maxLength: number = 160): string {
    // Remove markdown/HTML formatting
    const plainText = content
      .replace(/[#*`\[\]()]/g, '') // Remove markdown characters
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, ' ') // Replace line breaks with spaces
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Truncate at word boundary
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }
}

export default ContentProcessor;