import React from 'react';
import { useParams } from 'react-router-dom';
import { BlogListingPage } from '../pages/BlogListingPage.js';
import { BlogPostPage } from '../pages/BlogPostPage.js';

interface BlogRedirectProps {
  isPostPage?: boolean;
}

export const BlogRedirect: React.FC<BlogRedirectProps> = ({ isPostPage = false }) => {
  const params = useParams<{ slug?: string }>();
  
  // Extract slug from URL path if not in params
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const urlSlug = isPostPage ? pathSegments[pathSegments.length - 1] : undefined;
  const slug = params.slug || urlSlug;
  
  console.log('[BlogRedirect] Component rendered:', {
    isPostPage,
    paramsSlug: params.slug,
    urlSlug,
    finalSlug: slug,
    pathSegments,
    fullPath: window.location.pathname
  });
  
  // Simply show the blog page - no redirects
  // The navbar will handle hiding/showing the blog link based on vertical settings
  if (isPostPage && slug) {
    console.log('[BlogRedirect] → Rendering BlogPostPage with slug:', slug);
    // Pass the slug as a prop since useParams won't work
    return <BlogPostPage slug={slug} />;
  }
  
  console.log('[BlogRedirect] → Rendering BlogListingPage');
  return <BlogListingPage />;
};