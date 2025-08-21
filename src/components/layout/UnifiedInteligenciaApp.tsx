import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed unused ChevronDown import
import { useLocation, useNavigate } from 'react-router-dom';
import type { IndustryType } from '../../types/Industry';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import { useNavigationStore } from '../../store/navigationStore';
import { getIndustryFromPath, getPathFromIndustry } from '../../utils/industryMapping';
import { getCurrentSubdomain } from '../../utils/domainRedirect';

// Removed unused type IndustryTypeWithoutMain

// Landing Area Component
import { LandingArea } from '../LandingArea';
import { Footer } from './Footer';

// Section Components
import { HeroSection } from '../sections/HeroSection';
import { ServicesSection } from '../sections/ServicesSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { VideoCTASection } from '../sections/VideoCTASection';
import { VideoBackgroundSection } from '../sections/VideoBackgroundSection';
import { IndustryNavbar } from './IndustryNavbar';
import { PageLoadingSpinner } from './LoadingSpinner';

// Page Components and Wrapper
import { IndustryContext } from '../../contexts/IndustryContext';
import { ServicesPage } from '../pages/ServicesPage';
import { AboutPage } from '../pages/AboutPage';
import { CaseStudiesPage } from '../pages/CaseStudiesPage';
import { ContactPage } from '../pages/ContactPage';
import { BlogRedirect } from '../routing/BlogRedirect';
import { AdminPanel } from '../admin/AdminPanel';
import { AdminAuth } from '../admin/AdminAuth';

interface Industry {
  industry: IndustryType;
  title: string;
  label: string;
}

const industries: Industry[] = [
  {
    industry: 'hospitality',
    title: 'hospitality & lifestyle',
    label: 'hotels • restaurants • travel & tourism'
  },
  {
    industry: 'healthcare', 
    title: 'health & wellness',
    label: 'dentistry • health clinics • retreats • fitness'
  },
  {
    industry: 'tech',
    title: 'tech & AI',
    label: 'SaaS • AI startups • martech • platforms'
  },
  {
    industry: 'athletics',
    title: 'sport & media', 
    label: 'pickleball • events • tournaments • media'
  }
];

// Removed unused selectedTagline variable

// Removed unused industryHoverColors variable

export const UnifiedInteligenciaApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const landingAreaRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef<string>(location.pathname);

  // Zustand store
  const {
    selectedIndustry,
    landingAreaState,
    showNavbar,
    setSelectedIndustry,
    setLandingAreaState,
    setShowNavbar,
    setScrollPosition,
    resetToUndecided
  } = useNavigationStore();

  // Local state for content display
  const [showContent, setShowContent] = useState(false);

  // Always call the hook, but with a null check inside
  const { config, loading, error } = useIndustryConfig(selectedIndustry);
  
  // Get subdomain using the imported function
  const subdomain = getCurrentSubdomain();
  
  // Route detection with subdomain awareness
  const pathSegments = location.pathname.split('/').filter(Boolean);
  let industryKey = pathSegments[0] || '';
  let subPage = pathSegments[1];
  
  // Check if this is admin route first
  const isAdminRoute = pathSegments[0] === 'admin' || (subdomain && pathSegments[0] === 'admin');
  
  // On subdomain, adjust path interpretation
  if (subdomain === 'hospitality') {
    // On hospitality subdomain, root should be hospitality
    if (location.pathname === '/') {
      industryKey = 'hospitality';
    }
    // On subdomain, first segment is the subpage (not industry)
    if (pathSegments.length >= 1 && pathSegments[0] !== 'hospitality') {
      subPage = pathSegments[0];
      industryKey = 'hospitality';
    }
  }
  
  // Use centralized mapping
  const currentIndustry = subdomain === 'hospitality' && location.pathname === '/' 
    ? 'hospitality' 
    : getIndustryFromPath(location.pathname);
  const isRootPage = location.pathname === '/';
  const isIndustryHomepage = (pathSegments.length === 1 && currentIndustry !== null) || 
                             (subdomain === 'hospitality' && location.pathname === '/');
  const isHomepage = isRootPage || isIndustryHomepage; // Both root and industry homepages show landing area
  const isSubpage = isAdminRoute || (pathSegments.length > 1) || 
                    (subdomain === 'hospitality' && pathSegments.length >= 1 && pathSegments[0] !== 'hospitality'); // Admin and paths with multiple segments are subpages
  
  // Handle subdomain detection and auto-selection
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // If on hospitality subdomain, ALWAYS select hospitality industry
    if (hostname === 'hospitality.inteligenciadm.com') {
      setSelectedIndustry('hospitality');
      
      // Only set landing area state for homepage
      if (location.pathname === '/') {
        setLandingAreaState('decided');
        setTimeout(() => setShowContent(true), 500);
      } else {
        // For subpages, hide landing area
        setLandingAreaState('hidden');
      }
    }
    
    // Redirect handled by meta refresh and App.tsx, so page still renders
  }, [location.pathname]); // Re-run when pathname changes

  // Handle invalid industry paths (but not on subdomains)
  useEffect(() => {
    // Skip this check if we're on a subdomain
    if (subdomain === 'hospitality') {
      return;
    }
    
    if (industryKey && !currentIndustry && !isRootPage) {
      // Invalid industry path - redirect to root
      navigate('/');
    }
  }, [industryKey, currentIndustry, isRootPage, navigate, subdomain]);

  // Debug logging removed

  useEffect(() => {
    // Check if navigating from a subpage to industry homepage
    const previousPath = previousPathRef.current;
    const previousSegments = previousPath.split('/').filter(Boolean);
    const isFromSubpage = previousSegments.length > 1 && isIndustryHomepage;
    
    // Check initial URL on mount and sync with Zustand
    if (currentIndustry) {
      // Direct access to industry URL
      setSelectedIndustry(currentIndustry);
      setLandingAreaState(isHomepage ? 'decided' : 'hidden');
      if (isHomepage) {
        setTimeout(() => {
          setShowContent(true);
          // Auto-scroll past landing area if coming from subpage
          if (isFromSubpage && contentRef.current) {
            setTimeout(() => {
              contentRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }, 500);
      }
    } else if (location.pathname === '/') {
      // Root path - show undecided state
      resetToUndecided();
      setShowContent(false);
    }
    
    // Update previous path ref
    previousPathRef.current = location.pathname;

    // Handle browser navigation
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const segments = currentPath.split('/').filter(Boolean);
      const industry = getIndustryFromPath(currentPath);
      
      if (currentPath === '/') {
        resetToUndecided();
        setShowContent(false);
      } else if (industry) {
        setSelectedIndustry(industry);
        setLandingAreaState(segments.length === 1 ? 'decided' : 'hidden');
        if (segments.length === 1) {
          setTimeout(() => setShowContent(true), 500);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndustry, location.pathname, isHomepage]);

  // Handle scroll for navbar visibility and landing area state
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrollPosition(scrollY);
      
      if (isHomepage && landingAreaRef.current) {
        const landingAreaBottom = landingAreaRef.current.getBoundingClientRect().bottom;
        
        // Show navbar when scrolled past landing area
        setShowNavbar(landingAreaBottom < 0);
        
        // Hide landing area when scrolled past
        if (landingAreaBottom < -100 && landingAreaState !== 'hidden') {
          setLandingAreaState('hidden');
        } else if (landingAreaBottom >= 100 && landingAreaState === 'hidden' && scrollY < 100) {
          // Only show landing area again if scrolled back to very top
          setLandingAreaState('decided');
        }
      } else if (isSubpage) {
        // Always show navbar on subpages
        setShowNavbar(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage, isSubpage, landingAreaState, setShowNavbar, setLandingAreaState, setScrollPosition]);

  // Ensure content shows when landing area state changes to decided
  useEffect(() => {
    if (landingAreaState === 'decided' && isHomepage && selectedIndustry) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    }
    // Return undefined when condition is not met
    return undefined;
  }, [landingAreaState, isHomepage, selectedIndustry]);

  const handleScrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Removed unused scrollToSection function

  // Render appropriate page component for subpages
  const renderSubpage = () => {
    // Check if this is admin route first - no industry needed
    if (isAdminRoute) {
      return (
        <AdminAuth>
          <AdminPanel />
        </AdminAuth>
      );
    }
    
    // Subpage rendering debug removed
    
    if (!selectedIndustry || !config) return null;

    // Create context value for pages
    const subdomain = getCurrentSubdomain();
    const isOnHospitalitySubdomain = subdomain === 'hospitality';
    
    const contextValue = {
      config,
      industry: selectedIndustry,
      industryKey,
      // Use empty path on hospitality subdomain, otherwise use industry-prefixed path
      industryPath: isOnHospitalitySubdomain ? '' : `/${industryKey}`
    };
    
    const renderPage = () => {
      switch(subPage) {
        case 'services':
          return <ServicesPage />;
        case 'about':
          return <AboutPage />;
        case 'case-studies':
          return <CaseStudiesPage />;
        case 'contact':
          return <ContactPage />;
        case 'blog': {
          // Check if we have a blog post slug
          const blogSlug = pathSegments[2];
          return <BlogRedirect isPostPage={!!blogSlug} />;
        }
        default:
          return null;
      }
    };
    
    const pageComponent = renderPage();
    
    if (!pageComponent) {
      return (
        <div className="min-h-screen pt-20">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#1f1d32' }}>
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The page you're looking for doesn't exist.
            </p>
            <a 
              href={`/${industryKey}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to {industries.find(i => i.industry === selectedIndustry)?.title} Home
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <IndustryContext.Provider value={contextValue}>
        <div className="pt-20 min-h-screen">
          {pageComponent}
        </div>
      </IndustryContext.Provider>
    );
  };

  return (
    <div ref={containerRef} className="bg-white">
      {/* Navbar - always visible on subpages, appears on scroll for homepage, but not on admin */}
      <AnimatePresence>
        {showNavbar && selectedIndustry && config && !isAdminRoute && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <IndustryNavbar 
              industry={selectedIndustry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional rendering based on route type */}
      {isSubpage ? (
        // Subpage layout - no landing area, just navbar and content
        <>
          {loading && (
            <div className="flex items-center justify-center min-h-screen pt-20">
              <PageLoadingSpinner />
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center min-h-screen pt-20">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h2>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {renderSubpage()}
              {selectedIndustry && !isAdminRoute && <Footer selectedIndustry={selectedIndustry as IndustryType} />}
            </>
          )}
        </>
      ) : (
        // Homepage layout - with landing area
        <>
          {/* Landing Area - replaces the old header section */}
          {landingAreaState !== 'hidden' && (
            <div ref={landingAreaRef}>
              <LandingArea onScrollToContent={handleScrollToContent} />
            </div>
          )}
          
          {/* Space for when landing area is hidden */}
          {landingAreaState === 'hidden' && <div style={{ height: '100px' }} />}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-screen">
              <PageLoadingSpinner />
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h2>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {/* Industry Content - Loads below the fold */}
          <AnimatePresence>
            {landingAreaState !== 'undecided' && showContent && config && !loading && (
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className=""
              >
                {/* Hero Section */}
                <HeroSection 
                  content={config.content.hero}
                  useMinimalBackground={true}
                />
                
                {/* Full Viewport Video Section - Only show if video URLs are configured */}
                {config.content.hero.backgroundVideo && config.content.hero.backgroundVideoMobile && (
                  <VideoBackgroundSection 
                    desktopVideoUrl={config.content.hero.backgroundVideo}
                    mobileVideoUrl={config.content.hero.backgroundVideoMobile}
                  />
                )}
                
                {/* Services Section */}
                <div id="services">
                  <ServicesSection 
                    services={config.content.services}
                    title={config.content.servicesTitle || 'Marketing That Moves The Metrics That Matter'}
                    subtitle={config.content.servicesSubtitle || 'AI-Driven Strategy for Your Business'}
                    industryTheme={config.industry}
                  />
                </div>
                
                {/* Testimonials Section */}
                {config.content.testimonials && (
                  <div id="testimonials">
                    <TestimonialsSection 
                      testimonials={config.content.testimonials}
                      industryTheme={config.industry}
                    />
                  </div>
                )}
                
                {/* Video CTA Section */}
                {config.content.videoCTA && (
                  <VideoCTASection 
                    content={config.content.videoCTA}
                    industryTheme={config.industry}
                    industryPath={subdomain === 'hospitality' ? '' : `/${industryKey}`}
                  />
                )}
                
                {/* Contact Section */}
                <section id="contact" className="py-20 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-8 text-primary">
                      Ready to Transform Your {industries.find(i => i.industry === selectedIndustry)?.title} Marketing?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                      Let's discuss how we can help you achieve your goals with our proven strategies and industry expertise.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href={subdomain === 'hospitality' ? '/contact' : (selectedIndustry ? `/${getPathFromIndustry(selectedIndustry)}/contact` : '#')}
                        className="inline-block px-8 py-4 text-white rounded-lg font-semibold transition-all hover:scale-105 transform bg-secondary hover:opacity-90"
                      >
                        Schedule Free Consultation
                      </a>
                      <a 
                        href={subdomain === 'hospitality' ? '/services' : (selectedIndustry ? `/${getPathFromIndustry(selectedIndustry)}/services` : '#')}
                        className="inline-block px-8 py-4 border-2 rounded-lg font-semibold transition-all hover:scale-105 transform border-secondary text-secondary hover:bg-secondary hover:text-white"
                      >
                        View Our Services
                      </a>
                    </div>
                  </div>
                </section>
                
                {/* Footer */}
                {selectedIndustry && <Footer selectedIndustry={selectedIndustry as IndustryType} />}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};