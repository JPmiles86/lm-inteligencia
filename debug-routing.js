// Debug script to test routing logic locally
// This simulates the routing logic to verify it works correctly

console.log('=== ROUTING LOGIC TEST ===');

// Simulate the routing logic from UnifiedInteligenciaApp
function testRouting(pathname, hostname) {
  console.log(`\nTesting: ${hostname}${pathname}`);
  
  // Extract path segments (same as in the app)
  const pathSegments = pathname.split('/').filter(Boolean);
  console.log('Path segments:', pathSegments);
  
  // Get subdomain (simplified version)
  let subdomain = null;
  if (hostname.includes('hospitality.inteligenciadm.com')) {
    subdomain = 'hospitality';
  } else if (hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com') {
    subdomain = 'main';
  }
  console.log('Subdomain:', subdomain);
  
  // Check admin route (same logic as app)
  const isAdminRoute = pathSegments[0] === 'admin' || (subdomain && pathSegments[0] === 'admin');
  console.log('Is admin route:', isAdminRoute);
  
  // Check if it's a subpage (same logic as app)
  const isRootPage = pathname === '/';
  const isSubpage = isAdminRoute || 
                   (pathSegments.length > 1) || 
                   (subdomain === 'hospitality' && pathSegments.length >= 1 && pathSegments[0] !== 'hospitality');
  
  console.log('Route flags:', {
    isRootPage,
    isSubpage,
    isAdminRoute,
    shouldShowAdminPanel: isAdminRoute
  });
  
  // Determine what should render
  if (isSubpage && isAdminRoute) {
    console.log('✅ SHOULD RENDER: AdminAuth + AdminPanel');
  } else if (isSubpage) {
    console.log('🔵 SHOULD RENDER: Other subpage');
  } else {
    console.log('🏠 SHOULD RENDER: Homepage with landing area');
  }
  
  return { isAdminRoute, isSubpage, shouldRenderAdmin: isAdminRoute };
}

// Test cases
console.log('Testing various URL scenarios:');

// Test localhost scenarios
testRouting('/admin', 'localhost:3002');
testRouting('/', 'localhost:3002');
testRouting('/hospitality', 'localhost:3002');

// Test production scenarios
testRouting('/admin', 'hospitality.inteligenciadm.com');
testRouting('/', 'hospitality.inteligenciadm.com');
testRouting('/services', 'hospitality.inteligenciadm.com');
testRouting('/admin', 'inteligenciadm.com');

console.log('\n=== END ROUTING LOGIC TEST ===');

// Expected results:
// - /admin on any domain should set isAdminRoute = true
// - /admin should be treated as a subpage
// - /admin should render AdminAuth + AdminPanel