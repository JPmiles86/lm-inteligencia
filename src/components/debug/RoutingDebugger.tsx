import React from 'react';
import { useLocation } from 'react-router-dom';

export const RoutingDebugger: React.FC = () => {
  const location = useLocation();
  
  // Mirror the exact logic from UnifiedInteligenciaApp
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Get subdomain (simplified for testing)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  let subdomain: string | null = null;
  if (hostname.includes('hospitality.inteligenciadm.com')) {
    subdomain = 'hospitality';
  } else if (hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com') {
    subdomain = 'main';
  }
  
  const isAdminRoute = pathSegments[0] === 'admin' || (subdomain && pathSegments[0] === 'admin');
  const isRootPage = location.pathname === '/';
  const isSubpage = isAdminRoute || 
                   (pathSegments.length > 1) || 
                   (subdomain === 'hospitality' && pathSegments.length >= 1 && pathSegments[0] !== 'hospitality');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Routing Debugger</h4>
      <div><strong>URL:</strong> {location.pathname}</div>
      <div><strong>Hostname:</strong> {hostname}</div>
      <div><strong>Subdomain:</strong> {subdomain || 'null'}</div>
      <div><strong>Path Segments:</strong> {JSON.stringify(pathSegments)}</div>
      <div><strong>Is Admin Route:</strong> {isAdminRoute ? '✅ YES' : '❌ NO'}</div>
      <div><strong>Is Subpage:</strong> {isSubpage ? '✅ YES' : '❌ NO'}</div>
      <div><strong>Is Root:</strong> {isRootPage ? '✅ YES' : '❌ NO'}</div>
      <div style={{marginTop: '10px', padding: '5px', background: isAdminRoute ? 'green' : 'red'}}>
        <strong>Should Render:</strong> {isAdminRoute ? 'ADMIN PANEL' : (isSubpage ? 'SUBPAGE' : 'HOMEPAGE')}
      </div>
    </div>
  );
};