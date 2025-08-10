import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layout Components
import { SeamlessIndustrySelector } from './components/layout/SeamlessIndustrySelector';
// import { SharedIndustryLayout } from './components/layout/SharedIndustryLayout'; // Deprecated

// Page Components
import { SeamlessIndustryPage } from './components/pages/SeamlessIndustryPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { CaseStudiesPage } from './components/pages/CaseStudiesPage';
import { PricingPage } from './components/pages/PricingPage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { BlogListingPage } from './components/pages/BlogListingPage';
import { BlogPostPage } from './components/pages/BlogPostPage';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Error Components
import { NotFoundPage } from './components/layout/ErrorPage';

/**
 * Main App component with nested routing for industry pages
 */
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Main landing page with industry selector */}
            <Route path="/" element={<SeamlessIndustrySelector />} />
            
            {/* Global admin access */}
            <Route path="/admin" element={<AdminDashboard tenantId="laurie-inteligencia" />} />
            
            {/* Global route redirects to landing page */}
            <Route path="/contact" element={<Navigate to="/" />} />
            <Route path="/services" element={<Navigate to="/" />} />
            <Route path="/about" element={<Navigate to="/" />} />
            <Route path="/case-studies" element={<Navigate to="/" />} />
            <Route path="/pricing" element={<Navigate to="/" />} />
            <Route path="/blog" element={<Navigate to="/" />} />
            
            {/* Industry-specific nested routes */}
            <Route path="/:industry" element={<SharedIndustryLayout />}>
              <Route index element={<SeamlessIndustryPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="case-studies" element={<CaseStudiesPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="blog" element={<BlogListingPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
            </Route>
            
            {/* 404 page for unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;