import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Unified Component
import { UnifiedInteligenciaApp } from './components/layout/UnifiedInteligenciaApp';

// Admin Components
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { BlogManagement } from './components/admin/BlogManagement';
// import { BlogEditor } from './components/admin/BlogManagement/BlogEditor'; // REMOVED: Use BlogManagement instead
import { AdminDashboard } from './components/admin/SimplifiedAdminDashboard';
import { Settings } from './components/admin/SimplifiedSettings';
import { AIContentDashboard } from './components/admin/AI/AIContentDashboard';

// Debug Component (temporary for testing) - REMOVE IN PRODUCTION
// import { RoutingDebugger } from './components/debug/RoutingDebugger';

// Hooks
import { useVideoPreloaderWithTrigger } from './hooks/useVideoPreloaderWithTrigger';

/**
 * AdminRoutes - Handles all admin section routing with proper React Router navigation
 */
const AdminRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine current section based on URL using React Router location
  const currentSection = useMemo(() => {
    const path = location.pathname;
    console.log('[AdminRoutes] URL CHANGE - Determining section:', {
      path: path,
      timestamp: new Date().toISOString()
    });
    
    if (path.includes('/admin/blog')) {
      console.log('[AdminRoutes] Section determined: blog');
      return 'blog';
    } else if (path.includes('/admin/ai')) {
      console.log('[AdminRoutes] Section determined: ai');
      return 'ai';
    } else if (path.includes('/admin/analytics')) {
      console.log('[AdminRoutes] Section determined: analytics');
      return 'analytics';
    } else if (path.includes('/admin/settings')) {
      console.log('[AdminRoutes] Section determined: settings');
      return 'settings';
    } else {
      console.log('[AdminRoutes] Section determined: dashboard');
      return 'dashboard';
    }
  }, [location.pathname]);

  // Handle section change using React Router navigate
  const handleSectionChange = (section: 'dashboard' | 'blog' | 'ai' | 'analytics' | 'settings') => {
    console.log('[AdminRoutes] SECTION CHANGE:', {
      from: currentSection,
      to: section,
      currentPath: location.pathname,
      timestamp: new Date().toISOString()
    });
    
    const basePath = `/admin${section === 'dashboard' ? '' : `/${section}`}`;
    console.log('[AdminRoutes] Navigating to:', basePath);
    navigate(basePath); // ✅ Use React Router navigate instead of pushState
  };

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      tenantId="hospitality"
    >
      <Routes>
        <Route path="/blog" element={<BlogManagement />} />
        <Route path="/blog/new" element={<BlogManagement />} />
        <Route path="/blog/edit/:id" element={<BlogManagement />} />
        <Route path="/ai/*" element={<AIContentDashboard />} />
        <Route path="/analytics" element={<div className="p-6 text-center text-gray-500">Analytics - Coming Soon</div>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/*" element={<AdminDashboard tenantId="hospitality" />} />
      </Routes>
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