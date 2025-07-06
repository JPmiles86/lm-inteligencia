// Blog Post Page - Individual blog post template with full content

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { getIndustryName } from '../../types/Industry';
import { blogPosts, type BlogPost } from '../../data/blogData';
import { getIndustryPath } from '../../utils/subdomainDetection';

export const BlogPostPage: React.FC = () => {
  const { config } = useIndustryContext();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const industryName = getIndustryName(config.industry);
  const industryPath = getIndustryPath();

  useEffect(() => {
    if (slug) {
      const foundPost = blogPosts.find(p => p.slug === slug);
      setPost(foundPost || null);
      
      if (foundPost) {
        // Find related posts by category or tags
        const related = blogPosts
          .filter(p => 
            p.id !== foundPost.id && 
            (p.category === foundPost.category || 
             p.tags.some(tag => foundPost.tags.includes(tag)))
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    if (!post) return;
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    const text = encodeURIComponent(post.excerpt);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
        break;
      default:
        return;
    }
    
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link
              to={`${industryPath}/blog`}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Convert markdown-like content to HTML (improved implementation)
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentListItems: string[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    let elementIndex = 0;

    const flushList = () => {
      if (currentListItems.length > 0 && currentListType) {
        const ListComponent = currentListType;
        const className = currentListType === 'ul' 
          ? "list-disc list-inside text-gray-700 mb-6 ml-4 space-y-2"
          : "list-decimal list-inside text-gray-700 mb-6 ml-4 space-y-2";
        
        elements.push(
          <ListComponent key={`list-${elementIndex++}`} className={className}>
            {currentListItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ListComponent>
        );
        currentListItems = [];
        currentListType = null;
      }
    };

    const formatInlineMarkdown = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');
    };

    lines.forEach((line) => {
      // Images - handle ![alt text](image-url) syntax
      if (line.includes('![')) {
        flushList();
        const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
          const [, alt, src] = imgMatch;
          elements.push(
            <img 
              key={`img-${elementIndex++}`}
              src={src} 
              alt={alt}
              className="w-full max-w-2xl mx-auto h-auto object-contain rounded-lg my-6"
              style={{ maxHeight: '70vh' }}
            />
          );
        }
      }
      // Headers
      else if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${elementIndex++}`} className="text-4xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${elementIndex++}`} className="text-3xl font-bold text-gray-900 mb-4 mt-8">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${elementIndex++}`} className="text-2xl font-bold text-gray-900 mb-4 mt-6">
            {line.slice(4)}
          </h3>
        );
      }
      // Unordered lists
      else if (line.startsWith('- ')) {
        if (currentListType !== 'ul') {
          flushList();
          currentListType = 'ul';
        }
        currentListItems.push(line.slice(2));
      }
      // Ordered lists
      else if (/^\d+\. /.test(line)) {
        if (currentListType !== 'ol') {
          flushList();
          currentListType = 'ol';
        }
        currentListItems.push(line.replace(/^\d+\. /, ''));
      }
      // Empty lines
      else if (!line.trim()) {
        flushList();
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          if (lastElement && lastElement.type !== 'br') {
            elements.push(<br key={`br-${elementIndex++}`} />);
          }
        }
      }
      // Regular paragraphs
      else {
        flushList();
        const formattedText = formatInlineMarkdown(line);
        elements.push(
          <p 
            key={`p-${elementIndex++}`} 
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      }
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  return (
    <div className="min-h-screen">
      
      {/* Breadcrumb */}
      <nav className="bg-gray-50 py-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to={industryPath} className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to={`${industryPath}/blog`} className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">{post.category}</span>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">
                {post.readTime} min read
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            {/* Author and Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-gray-900 text-lg">{post.author.name}</div>
                  <div className="text-gray-600">{post.author.title}</div>
                  <div className="text-gray-500 text-sm">{formatDate(post.publishedDate)}</div>
                </div>
              </div>
              
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
                
                {showShareMenu && (
                  <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-blue-500">𝕏</span>
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-blue-700">in</span>
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-blue-600">f</span>
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-gray-600">✉</span>
                      Email
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-gray-600">🔗</span>
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="aspect-video max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-full object-cover rounded-2xl shadow-lg"
        />
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <div className="text-lg leading-relaxed">
            {formatContent(post.content)}
          </div>
        </motion.div>
        
        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Author Bio */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-start gap-6">
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.author.name}</h3>
                <p className="text-primary font-medium mb-4">{post.author.title}</p>
                <p className="text-gray-600 mb-6">
                  Laurie Meiring is the founder of Inteligencia, bringing over 15 years of experience in digital marketing with specialization in industry-specific strategies. She helps businesses build sustainable growth through proven marketing frameworks and data-driven insights.
                </p>
                <div className="flex gap-4">
                  <Link
                    to={`${industryPath}/about`}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Learn More
                  </Link>
                  <Link
                    to={`${industryPath}/contact`}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Get In Touch
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <p className="text-xl text-gray-600">
                Continue reading with these related insights
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.article
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <Link to={`${industryPath}/blog/${relatedPost.slug}`}>
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {relatedPost.category}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {relatedPost.readTime} min read
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4">
                        {relatedPost.excerpt.substring(0, 120)}...
                      </p>
                      
                      <div className="text-sm text-gray-500">
                        {formatDate(relatedPost.publishedDate)}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Marketing?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Get personalized marketing strategies that drive real results for your {industryName.toLowerCase()} business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Get Free Consultation
              </Link>
              <Link
                to={`${industryPath}/case-studies`}
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                View Success Stories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">Inteligencia</div>
              <p className="text-gray-400 mb-4">
                Expert marketing insights for {industryName.toLowerCase()}.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to={industryPath} className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to={`${industryPath}/services`} className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to={`${industryPath}/about`} className="hover:text-white transition-colors">About</Link></li>
                <li><Link to={`${industryPath}/case-studies`} className="hover:text-white transition-colors">Case Studies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Blog</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to={`${industryPath}/blog`} className="hover:text-white transition-colors">All Articles</Link></li>
                <li><Link to={`${industryPath}/blog`} className="hover:text-white transition-colors">Marketing Tips</Link></li>
                <li><Link to={`${industryPath}/blog`} className="hover:text-white transition-colors">Industry Insights</Link></li>
                <li><Link to={`${industryPath}/blog`} className="hover:text-white transition-colors">Case Studies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div>info@inteligencia.com</div>
                <div>(555) 123-4567</div>
                <div className="pt-4">
                  <Link
                    to={`${industryPath}/contact`}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity inline-block"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Inteligencia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};