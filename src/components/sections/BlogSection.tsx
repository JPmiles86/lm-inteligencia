import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

interface BlogSectionProps {
  industryPath: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ industryPath }) => {
  const [displayPosts, setDisplayPosts] = useState<DatabaseBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        // Try production API first, fallback to local dev
        const apiBaseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:4000' 
          : '';
        
        // First try to get featured posts
        const featuredResponse = await fetch(`${apiBaseUrl}/api/blog/posts?featured=true&limit=3`);
        
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          if (featuredData.success && featuredData.data && featuredData.data.length >= 3) {
            setDisplayPosts(featuredData.data.slice(0, 3));
            setLoading(false);
            return;
          }
        }
        
        // If not enough featured posts, get the most recent posts
        const recentResponse = await fetch(`${apiBaseUrl}/api/blog/posts?limit=3&published=true`);
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          setDisplayPosts(recentData.data || []);
        }
      } catch (err) {
        console.error('Error fetching blog posts for homepage:', err);
        setDisplayPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Marketing Insights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay ahead with proven strategies and industry insights from our marketing experts
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {displayPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <Link to={`${industryPath}/blog/${post.slug}`}>
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={post.featuredImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMjAwQzQxNi41NjggMjAwIDQzMCAxODYuNTY4IDQzMCAxNzBDNDMwIDE1My40MzIgNDE2LjU2OCAxNDAgNDAwIDE0MEMzODMuNDMyIDE0MCAzNzAgMTUzLjQzMiAzNzAgMTcwQzM3MCAxODYuNTY4IDM4My40MzIgMjAwIDQwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMzAgMjQwSDQ3MFYyNzBIMzMwVjI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={{ transform: 'scale(1)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMjAwQzQxNi41NjggMjAwIDQzMCAxODYuNTY4IDQzMCAxNzBDNDMwIDE1My40MzIgNDE2LjU2OCAxNDAgNDAwIDE0MEMzODMuNDMyIDE0MCAzNzAgMTUzLjQzMiAzNzAgMTcwQzM3MCAxODYuNTY4IDM4My40MzIgMjAwIDQwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMzAgMjQwSDQ3MFYyNzBIMzMwVjI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                      loading="lazy"
                    />
                  </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span>{post.readTime} min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
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
                      <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {post.publishedDate 
                          ? new Date(post.publishedDate).toLocaleDateString() 
                          : new Date(post.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to={`${industryPath}/blog`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View All Articles
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};