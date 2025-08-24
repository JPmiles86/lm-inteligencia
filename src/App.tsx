import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Unified Component
import { UnifiedInteligenciaApp } from './components/layout/UnifiedInteligenciaApp';

// Admin Components
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { BlogManagement } from './components/admin/BlogManagement';
// import { BlogEditor } from './components/admin/BlogManagement/BlogEditor'; // REMOVED: Use BlogManagement instead
import { AdminDashboard } from './components/admin/AdminDashboard';

// Debug Component (temporary for testing) - REMOVE IN PRODUCTION
// import { RoutingDebugger } from './components/debug/RoutingDebugger';

// Hooks
import { useVideoPreloaderWithTrigger } from './hooks/useVideoPreloaderWithTrigger';

/**
 * AdminRoutes - Handles all admin section routing with proper navigation
 */
const AdminRoutes: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'blog' | 'customization' | 'analytics' | 'settings'>('dashboard');
  
  // Parse URL to determine current section
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin/blog')) {
      setCurrentSection('blog');
    } else if (path.includes('/admin/customization')) {
      setCurrentSection('customization');
    } else if (path.includes('/admin/analytics')) {
      setCurrentSection('analytics');
    } else if (path.includes('/admin/settings')) {
      setCurrentSection('settings');
    } else {
      setCurrentSection('dashboard');
    }
  }, []);

  const handleSectionChange = (section: typeof currentSection) => {
    setCurrentSection(section);
    // Update URL without page reload
    const basePath = `/admin/${section === 'dashboard' ? '' : section}`;
    window.history.pushState({}, '', basePath);
  };

  const renderContent = () => {
    const path = window.location.pathname;
    
    // All blog routes are handled by BlogManagement component
    if (path.includes('/admin/blog')) {
      return <BlogManagement />;
    }
    
    switch (currentSection) {
      case 'blog':
        return <BlogManagement />;
      case 'customization':
        return <div className="p-6">Site Customization - Coming Soon</div>;
      case 'analytics':
        return <div className="p-6">Analytics - Coming Soon</div>;
      case 'settings':
        return <div className="p-6">Settings - Coming Soon</div>;
      case 'dashboard':
      default:
        return <AdminPanel />;
    }
  };

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      tenantId="hospitality"
    >
      {renderContent()}
    </AdminLayout>
  );
};

/**
 * App using the unified single-page architecture
 * This approach maintains the header during all transitions
 */
const App: React.FC = () => {
  // Check for redirect on app load but don't block rendering
  useEffect(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    console.log('[App.tsx] App loaded - Route check:', {
      hostname,
      pathname,
      fullURL: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Skip redirect for admin route
    if (pathname === '/admin') {
      console.log('[App.tsx] Admin route detected - skipping redirect');
      return;
    }
    
    // Direct check - if on main domain, redirect to hospitality
    if (hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com') {
      console.log('[App.tsx] On main domain, redirecting to hospitality...');
      // Small delay to let meta refresh work first
      setTimeout(() => {
        window.location.href = 'https://hospitality.inteligenciadm.com' + window.location.pathname + window.location.search;
      }, 100);
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
  
  console.log('[App.tsx] Rendering App component with routes');
  
  return (
    <HelmetProvider>
      <Router>
        {/* Add routing debugger for testing - REMOVE IN PRODUCTION */}
        {/* <RoutingDebugger /> */}
        
        <Routes>
          {/* Admin routes with proper layout and navigation */}
          <Route 
            path="/admin/*" 
            element={
              <AdminAuth>
                <AdminRoutes />
              </AdminAuth>
            } 
          />
          
          {/* Main app with seamless transitions - catch-all route comes last */}
          <Route 
            path="/*" 
            element={
              (() => {
                console.log('[App.tsx] Catch-all route matched. Current path:', window.location.pathname);
                return <UnifiedInteligenciaApp />;
              })()
            } 
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;