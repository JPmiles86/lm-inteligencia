import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Unified Component
import { UnifiedInteligenciaApp } from './components/layout/UnifiedInteligenciaApp';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAuth } from './components/admin/AdminAuth';

/**
 * App using the unified single-page architecture
 * This approach maintains the header during all transitions
 */
const App: React.FC = () => {
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