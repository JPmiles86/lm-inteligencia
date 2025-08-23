// Blog Listing Page - Professional blog listing with search and filtering

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { blogCategories } from '../../data/blogData';
import { getIndustryPath } from '../../utils/subdomainDetection';

// Database blog post type
interface DatabaseBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    title: string;
    image: string | null;
  };
  readTime: number;
  editorType: 'rich' | 'block';
}

export const BlogListingPage: React.FC = () => {
  const { config } = useIndustryContext();
  const industryPath = getIndustryPath();
  
  console.log('[BlogListingPage] Component rendered at path:', window.location.pathname);

  // State for blog posts from database
  const [blogPosts, setBlogPosts] = useState<DatabaseBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map industry types to blog categories
  const getDefaultCategory = () => {
    switch (config.industry) {
      case 'hospitality':
        return 'Hospitality Marketing';
      case 'healthcare':
        return 'Health & Wellness Marketing';
      case 'tech':
        return 'Tech & AI Marketing';
      case 'athletics':
        return 'Sports & Media Marketing';
      default:
        return 'All';
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(getDefaultCategory());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'readTime'>('newest');

  // Fetch blog posts from database
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
        
        const response = await fetch(`${apiBaseUrl}/blog/posts?published=true`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts: ${response.status}`);
        }
        
        const data = await response.json();
        setBlogPosts(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Filter and sort blog posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = blogPosts;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        post.author.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort posts
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : new Date(b.createdAt).getTime();
          const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : new Date(a.createdAt).getTime();
          return dateB - dateA;
        case 'oldest':
          const oldDateA = a.publishedDate ? new Date(a.publishedDate).getTime() : new Date(a.createdAt).getTime();
          const oldDateB = b.publishedDate ? new Date(b.publishedDate).getTime() : new Date(b.createdAt).getTime();
          return oldDateA - oldDateB;
        case 'readTime':
          return a.readTime - b.readTime;
        default:
          return 0;
      }
    });

    return sorted;
  }, [blogPosts, searchQuery, selectedCategory, sortBy]);

  const featuredPosts = blogPosts.filter(post => post.featured);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">Loading blog posts...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <div>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const BlogCard: React.FC<{ post: DatabaseBlogPost; featured?: boolean }> = ({ post, featured = false }) => (
    <article
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      <Link to={`${industryPath}/blog/${post.slug}`} className="block">
        <div className={`relative aspect-video overflow-hidden ${featured ? 'lg:aspect-[2/1]' : ''}`}>
          <img
            src={post.featuredImage || '/images/blog-placeholder.jpg'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMjAwQzQxNi41NjggMjAwIDQzMCAxODYuNTY4IDQzMCAxNzBDNDMwIDE1My40MzIgNDE2LjU2OCAxNDAgNDAwIDE0MEMzODMuNDMyIDE0MCAzNzAgMTUzLjQzMiAzNzAgMTcwQzM3MCAxODYuNTY4IDM4My40MzIgMjAwIDQwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMzAgMjQwSDQ3MFYyNzBIMzMwVjI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm">
              {post.readTime} min read
            </span>
          </div>
          
          <h2 className={`font-bold text-gray-900 mb-3 hover:text-primary transition-colors ${
            featured ? 'text-2xl lg:text-3xl' : 'text-xl'
          }`}>
            {post.title}
          </h2>
          
          <p className={`text-gray-600 mb-4 ${featured ? 'text-lg' : ''}`}>
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.author.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAxOS45OTk5IDI0QzE1LjU4MTYgMjQgMTIgMjYuNjg2MyAxMiAzMEgxNkMxNiAyOC44OTU0IDE3Ljc5MDggMjggMTkuOTk5OSAyOEMyMi4yMDkxIDI4IDI0IDI4Ljg5NTQgMjQgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg=='}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover bg-gray-200"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAxOS45OTk5IDI0QzE1LjU4MTYgMjQgMTIgMjYuNjg2MyAxMiAzMEgxNkMxNiAyOC44OTU0IDE3Ljc5MDggMjggMTkuOTk5OSAyOEMyMi4yMDkxIDI4IDI0IDI4Ljg5NTQgMjQgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                }}
              />
              <div>
                <div className="font-semibold text-gray-900 text-sm">{post.author.name}</div>
                <div className="text-gray-600 text-xs">{post.author.title}</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {formatDate(post.publishedDate)}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              Marketing Insights & Strategies
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Expert insights, proven strategies, and industry-specific guidance to help your business thrive in the digital landscape.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{blogPosts.length}</div>
                <div className="text-gray-300">Expert Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">4</div>
                <div className="text-gray-300">Industries Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">15+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">100+</div>
                <div className="text-gray-300">Success Stories</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {blogCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'readTime')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="readTime">Quick Reads</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedPosts.length} of {blogPosts.length} articles
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="ml-2 text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts Section - Only show when "All" is selected */}
      {selectedCategory === 'All' && featuredPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our most popular and impactful marketing insights
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAndSortedPosts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filteredAndSortedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
              <p className="text-gray-600 mb-8">
                Try adjusting your search criteria or browse all articles.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-br from-[#371657] via-[#9123d1] to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Stay Updated with Marketing Insights
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Get the latest marketing strategies, industry insights, and expert tips delivered directly to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105">
                Subscribe
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mt-4">
              No spam. Unsubscribe anytime. Read our{' '}
              <a href="/privacy" className="text-secondary hover:underline">privacy policy</a>.
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
};