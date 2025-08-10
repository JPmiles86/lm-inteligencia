import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Components
import { IndustrySelector } from './components/layout/IndustrySelector';
import { IndustryRoutes } from './components/routing/IndustryRoutes';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PageLoadingSpinner } from './components/layout/LoadingSpinner';
import { ErrorPage, NotFoundPage } from './components/layout/ErrorPage';

// Hooks
import { useIndustryConfig } from './hooks/useIndustryConfig';

// Utils
import { IndustryMapping } from './types/Industry';

/**
 * PathBasedIndustryWrapper component
 * Loads industry config based on URL path and renders IndustryRoutes
 */
interface PathBasedIndustryWrapperProps {
  industryKey: string;
}

const PathBasedIndustryWrapper: React.FC<PathBasedIndustryWrapperProps> = ({ industryKey }) => {
  const industry = IndustryMapping[industryKey];
  
  // Ensure industry is defined
  if (!industry) {
    return <NotFoundPage />;
  }
  
  const { config, loading, error, refetch } = useIndustryConfig(industry);

  // Loading state
  if (loading) {
    return <PageLoadingSpinner />;
  }

  // Error state
  if (error || !config) {
    return <ErrorPage error={error || 'Configuration not found'} onRetry={refetch} />;
  }

  return <IndustryRoutes industry={industry} config={config} />;
};

/**
 * BackwardCompatibilityRedirect component
 * Handles old query parameter URLs and redirects to path-based URLs
 */
const BackwardCompatibilityRedirect: React.FC = () => {
  const [redirecting, setRedirecting] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const industryParam = params.get('industry');
    
    if (industryParam && industryParam in IndustryMapping) {
      setRedirecting(true);
      // Remove query parameter and redirect to path-based URL
      const newPath = `/${industryParam}`;
      
      // Use navigate instead of window.location for better SPA behavior
      window.history.replaceState({}, '', newPath);
      
      // Force a reload to properly initialize the new route
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, []);

  if (redirecting) {
    return <PageLoadingSpinner />;
  }

  return <IndustrySelector />;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Main landing page with industry selector */}
            <Route path="/" element={<BackwardCompatibilityRedirect />} />
            
            {/* Global admin access */}
            <Route path="/admin" element={<AdminDashboard tenantId="laurie-inteligencia" />} />
            
            {/* Industry-specific routes */}
            <Route path="/hotels/*" element={<PathBasedIndustryWrapper industryKey="hotels" />} />
            <Route path="/restaurants/*" element={<PathBasedIndustryWrapper industryKey="restaurants" />} />
            <Route path="/dental/*" element={<PathBasedIndustryWrapper industryKey="dental" />} />
            <Route path="/sports/*" element={<PathBasedIndustryWrapper industryKey="sports" />} />
            
            {/* 404 page for unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;