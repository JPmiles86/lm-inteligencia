import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Unified Component
import { UnifiedInteligenciaApp } from './components/layout/UnifiedInteligenciaApp';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAuth } from './components/admin/AdminAuth';

// Hooks
import { useVideoPreloaderWithTrigger } from './hooks/useVideoPreloaderWithTrigger';

// Utils
import { handleDomainRedirect, isRedirectEnabled, getCurrentSubdomain } from './utils/domainRedirect';

/**
 * App using the unified single-page architecture
 * This approach maintains the header during all transitions
 */
const App: React.FC = () => {
  // Check for redirect IMMEDIATELY on app load
  useEffect(() => {
    if (isRedirectEnabled()) {
      const subdomain = getCurrentSubdomain();
      if (subdomain === 'main') {
        console.log('[App.tsx] Triggering redirect from main domain...');
        handleDomainRedirect();
      }
    }
  }, []);

  const [landingAreaLoaded, setLandingAreaLoaded] = useState(false);
  
  // Start preloading videos after landing area loads (logo, title, verticals)
  useEffect(() => {
    // Wait for essential elements to load
    const checkLandingElements = () => {
      const logo = document.querySelector('img[alt*="Inteligencia"]');
      const hasTextContent = document.querySelector('h1') || document.querySelector('h2');
      
      if (logo && hasTextContent) {
        // Give a small delay for smooth rendering
        setTimeout(() => {
          setLandingAreaLoaded(true);
        }, 200);
      } else {
        // Keep checking
        setTimeout(checkLandingElements, 100);
      }
    };
    
    checkLandingElements();
  }, []);
  
  // Preload videos after landing area is ready
  useVideoPreloaderWithTrigger(landingAreaLoaded);
  
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Main app with seamless transitions */}
          <Route path="/*" element={<UnifiedInteligenciaApp />} />
          
          {/* Admin route (separate from main app) */}
          <Route 
            path="/admin" 
            element={
              <AdminAuth>
                <AdminDashboard tenantId="laurie-inteligencia" />
              </AdminAuth>
            } 
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;