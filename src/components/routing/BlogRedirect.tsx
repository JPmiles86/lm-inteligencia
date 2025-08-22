import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BlogListingPage } from '../pages/BlogListingPage';
import { BlogPostPage } from '../pages/BlogPostPage';

interface BlogRedirectProps {
  isPostPage?: boolean;
}

export const BlogRedirect: React.FC<BlogRedirectProps> = ({ isPostPage = false }) => {
  const params = useParams<{ slug?: string }>();
  
  // Extract slug from URL path if not in params
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const urlSlug = isPostPage ? pathSegments[pathSegments.length - 1] : undefined;
  const slug = params.slug || urlSlug;
  
  // Check if blog is enabled
  const adminSettings = localStorage.getItem('admin_settings');
  let showBlog = false; // Default to false
  
  if (adminSettings) {
    try {
      const settings = JSON.parse(adminSettings);
      showBlog = settings.showBlog || false;
    } catch (e) {
      showBlog = false;
    }
  }
  
  // If blog is disabled, redirect to homepage
  if (!showBlog) {
    // Get the current subdomain to determine redirect path
    const hostname = window.location.hostname;
    const isHospitalitySubdomain = hostname.startsWith('hospitality.');
    
    // On hospitality subdomain, redirect to root, otherwise to industry path
    const redirectPath = isHospitalitySubdomain ? '/' : window.location.pathname.split('/')[1] ? `/${window.location.pathname.split('/')[1]}` : '/';
    
    return <Navigate to={redirectPath} replace />;
  }
  
  // If blog is enabled, show the appropriate page
  if (isPostPage && slug) {
    // Pass the slug as a prop since useParams won't work
    return <BlogPostPage slug={slug} />;
  }
  
  return <BlogListingPage />;
};