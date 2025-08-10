import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Components
import { SeamlessIndustrySelector } from './components/layout/SeamlessIndustrySelector';
import { SeamlessIndustryPage } from './components/pages/SeamlessIndustryPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PageLoadingSpinner } from './components/layout/LoadingSpinner';
import { ErrorPage, NotFoundPage } from './components/layout/ErrorPage';

// Hooks
import { useIndustryConfig } from './hooks/useIndustryConfig';

// Utils
import { IndustryMapping } from './types/Industry';
import type { IndustryType } from './types/Industry';

/**
 * SeamlessIndustryWrapper component
 * Loads industry config and renders the seamless industry page
 */
interface SeamlessIndustryWrapperProps {
  industryKey: string;
}

const SeamlessIndustryWrapper: React.FC<SeamlessIndustryWrapperProps> = ({ industryKey }) => {
  const industry = IndustryMapping[industryKey];
  
  if (!industry) {
    return <NotFoundPage />;
  }
  
  const { config, loading, error, refetch } = useIndustryConfig(industry);

  if (loading) {
    return <PageLoadingSpinner />;
  }

  if (error || !config) {
    return <ErrorPage error={error || 'Configuration not found'} onRetry={refetch} />;
  }

  return <SeamlessIndustryPage config={config} />;
};

/**
 * Main App component with seamless transitions
 */
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Main landing page with seamless industry selector */}
            <Route path="/" element={<SeamlessIndustrySelector />} />
            
            {/* Global admin access */}
            <Route path="/admin" element={<AdminDashboard tenantId="laurie-inteligencia" />} />
            
            {/* Industry-specific routes with seamless transitions */}
            <Route path="/hotels/*" element={<SeamlessIndustryWrapper industryKey="hotels" />} />
            <Route path="/restaurants/*" element={<SeamlessIndustryWrapper industryKey="restaurants" />} />
            <Route path="/dental/*" element={<SeamlessIndustryWrapper industryKey="dental" />} />
            <Route path="/sports/*" element={<SeamlessIndustryWrapper industryKey="sports" />} />
            
            {/* 404 page for unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;