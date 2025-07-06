import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UnifiedInteligenciaAppDebug } from './components/layout/UnifiedInteligenciaAppDebug';

const App: React.FC = () => {
  // Test file loaded
  
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<UnifiedInteligenciaAppDebug />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;