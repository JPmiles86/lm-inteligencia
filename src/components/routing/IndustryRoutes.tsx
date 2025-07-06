// Industry-specific routing component for nested routes
// Handles all routes within an industry context (e.g., /hotels/*, /restaurants/*)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import type { IndustryType, IndustryConfig } from '../../types/Industry';

// Import page components
import { IndustryPage } from '../pages/IndustryPage';
import { ServicesPage } from '../pages/ServicesPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { CaseStudiesPage } from '../pages/CaseStudiesPage';
import { BlogListingPage } from '../pages/BlogListingPage';
import { BlogPostPage } from '../pages/BlogPostPage';
import { AdminDashboard } from '../admin/AdminDashboard';
import { NotFoundPage } from '../layout/ErrorPage';

interface IndustryRoutesProps {
  industry: IndustryType;
  config: IndustryConfig;
}

/**
 * IndustryRoutes component handles all nested routes within an industry context
 * 
 * Route structure:
 * - /hotels (index) -> IndustryPage
 * - /hotels/services -> ServicesPage
 * - /hotels/about -> AboutPage
 * - /hotels/contact -> ContactPage
 * - /hotels/case-studies -> CaseStudiesPage
 * - /hotels/blog -> BlogListingPage
 * - /hotels/blog/:slug -> BlogPostPage
 * - /hotels/admin -> AdminDashboard
 */
export const IndustryRoutes: React.FC<IndustryRoutesProps> = ({ config }) => {
  return (
    <Routes>
      {/* Industry homepage - matches exact path /hotels */}
      <Route index element={<IndustryPage config={config} />} />
      
      {/* Services page - /hotels/services */}
      <Route path="services" element={<ServicesPage />} />
      
      {/* About page - /hotels/about */}
      <Route path="about" element={<AboutPage />} />
      
      {/* Contact page - /hotels/contact */}
      <Route path="contact" element={<ContactPage />} />
      
      {/* Case studies page - /hotels/case-studies */}
      <Route path="case-studies" element={<CaseStudiesPage />} />
      
      {/* Blog listing page - /hotels/blog */}
      <Route path="blog" element={<BlogListingPage />} />
      
      {/* Individual blog post - /hotels/blog/:slug */}
      <Route path="blog/:slug" element={<BlogPostPage />} />
      
      {/* Admin dashboard - /hotels/admin */}
      <Route path="admin" element={<AdminDashboard tenantId="laurie-inteligencia" />} />
      
      {/* 404 for unmatched routes within industry */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};