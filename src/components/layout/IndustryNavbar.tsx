// Industry-specific Navigation Component with support for both scroll and page navigation
// This component is used across all industry pages and adapts its behavior based on context

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { IndustryType, IndustryConfig } from '../../types/Industry';
import { IndustryNames } from '../../types/Industry';
import { universalContent } from '../../config/universal-content';
import { IndustryContext, useIndustryContext } from '../../contexts/IndustryContext';
import { getIndustryFromPath, industryToUrlMap } from '../../utils/industryMapping';
import { isSectionVisibleSync } from '../../utils/verticalVisibility';
import { getEnabledVerticals, getEnabledVerticalCount } from '../../config/enabled-verticals';

interface IndustryNavbarProps {
  // Support both prop formats for backward compatibility
  config?: IndustryConfig;
  industry?: IndustryType;
  industryName?: string;
  currentIndustry?: IndustryType;
}

// Inner component that uses the context hook
const IndustryNavbarWithContext: React.FC<IndustryNavbarProps> = ({ 
  config, 
  industry: industryProp, 
  industryName: industryNameProp,
  currentIndustry 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ industry: string }>();

  // Always call the hook - this component is only rendered when context is available
  const context = useIndustryContext();
  const contextIndustry = context.industry;
  const contextIndustryKey = context.industryKey;

  // Determine the current industry and name from context or props
  const industry = contextIndustry || industryProp || config?.industry || currentIndustry || 'main';
  const industryName = industryNameProp || config?.name || IndustryNames[industry];
  
  // Get enabled verticals configuration
  const enabledVerticals = getEnabledVerticals();
  const enabledVerticalCount = getEnabledVerticalCount();

  // Get subdomain helper
  const getCurrentSubdomain = () => {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) return null;
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[parts.length - 2] === 'inteligenciadm') {
      return parts[0] || null;
    }
    if (hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com') {
      return 'main';
    }
    return null;
  };
  
  const subdomain = getCurrentSubdomain();
  
  // Determine industry key for navigation
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const industryKey = (subdomain === 'hospitality' || subdomain === 'healthcare') ? '' : (contextIndustryKey || params.industry || pathSegments[0] || 'hotels'); // Empty prefix on subdomain
  const isSeamlessPage = (pathSegments.length === 1 && getIndustryFromPath(location.pathname) !== null) || 
                         ((subdomain === 'hospitality' || subdomain === 'healthcare') && location.pathname === '/');

  // Click outside handler for industry dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.industry-dropdown-container')) {
        setIsIndustryDropdownOpen(false);
      }
    };

    if (isIndustryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    // Return undefined when dropdown is not open
    return undefined;
  }, [isIndustryDropdownOpen]);

  // Navigation handlers
  const handleNavigation = (destination: string, isScrollTarget: boolean = false) => {
    if (isSeamlessPage && isScrollTarget) {
      // On seamless page, scroll to section
      const element = document.getElementById(destination);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!isSeamlessPage && isScrollTarget) {
      // On subpage wanting to scroll to main page section
      navigate(`${industryKey ? `/${industryKey}` : ''}#${destination}`);
    } else {
      // Regular navigation to subpage
      navigate(destination);
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    handleNavigation(sectionId, true);
  };

  // Get navigation items from universal content
  const navItems = universalContent.navigation.mainMenu;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16 py-1">
            {/* Logo and Brand Name */}
            <div className="flex items-center">
              <Link
                to={industry === 'main' || !industry ? '/' : (industryKey ? `/${industryKey}` : '/')}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <img 
                    src="/LM_inteligencia/Inteligencia-logo-new.png" 
                    alt="Inteligencia Digital Marketing" 
                    className="h-8 lg:h-9"
                    style={{ objectFit: 'contain' }}
                  />
                  <span className="text-2xl font-medium text-primary" style={{ fontFamily: 'inherit' }}>
                    Inteligencia
                  </span>
                </motion.div>
              </Link>
              <div className={`relative industry-dropdown-container ml-2 ${enabledVerticalCount > 1 ? 'block' : 'hidden'}`}>
                
                {/* Industry switcher - show when multiple verticals are enabled */}
                <button
                  onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mt-1"
                >
                  {industryName}
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Industry Dropdown - show enabled verticals only */}
                {isIndustryDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50">
                    {Object.entries(industryToUrlMap).map(([ind, urlPath]) => {
                      // Only show enabled verticals, skip main and current industry
                      if (ind === 'main' || ind === industry || !urlPath || !enabledVerticals.includes(ind as any)) return null;
                      
                      // Map to subdomain URLs
                      const subdomainMap: Record<string, string> = {
                        'hospitality': 'hospitality.inteligenciadm.com',
                        'healthcare': 'healthcare.inteligenciadm.com',
                        'tech': 'tech.inteligenciadm.com',
                        'athletics': 'athletics.inteligenciadm.com'
                      };
                      
                      const targetSubdomain = subdomainMap[ind];
                      if (!targetSubdomain) return null;
                      
                      // Always go to homepage when switching industries
                      const targetUrl = `https://${targetSubdomain}`;
                      
                      return (
                        <a
                          key={ind}
                          href={targetUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsIndustryDropdownOpen(false);
                            // Use window.location for full page navigation to subdomain
                            window.location.href = targetUrl;
                          }}
                          className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {IndustryNames[ind as IndustryType]}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Services - always navigate to services page */}
              <Link
                to={industryKey ? `/${industryKey}/services` : '/services'}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                {navItems.services}
              </Link>

              {/* About - always navigate to subpage */}
              <Link
                to={industryKey ? `/${industryKey}/about` : '/about'}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                {navItems.about}
              </Link>

              {/* Case Studies - conditionally show based on vertical settings */}
              {isSectionVisibleSync(industry, 'showCaseStudies') && (
                <Link
                  to={industryKey ? `/${industryKey}/case-studies` : '/case-studies'}
                  className="font-medium transition-colors hover:text-primary text-gray-700"
                >
                  {navItems.caseStudies}
                </Link>
              )}

              {/* Blog - conditionally show based on vertical settings */}
              {isSectionVisibleSync(industry, 'showBlog') && (
                <Link
                  to={industryKey ? `/${industryKey}/blog` : '/blog'}
                  className="font-medium transition-colors hover:text-primary text-gray-700"
                >
                  {navItems.blog}
                </Link>
              )}

              {/* Contact - always navigate to contact page */}
              <Link
                to={industryKey ? `/${industryKey}/contact` : '/contact'}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                {navItems.contact}
              </Link>

              <button
                onClick={() => handleNavigation(industryKey ? `/${industryKey}/contact` : '/contact', false)}
                className="inline-block px-8 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 transform bg-secondary hover:opacity-90"
              >
                {universalContent.navigation.buttons.getStarted}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md transition-colors text-gray-700 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            height: isMobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {/* Mobile navigation items */}
            <Link
              to={industryKey ? `/${industryKey}/services` : '/services'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.services}
            </Link>

            <Link
              to={industryKey ? `/${industryKey}/about` : '/about'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.about}
            </Link>

            <Link
              to={industryKey ? `/${industryKey}/case-studies` : '/case-studies'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.caseStudies}
            </Link>

            {/* Blog - conditionally show based on vertical settings */}
            {isSectionVisibleSync(industry, 'showBlog') && (
              <Link
                to={industryKey ? `/${industryKey}/blog` : '/blog'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
              >
                {navItems.blog}
              </Link>
            )}

            <Link
              to={industryKey ? `/${industryKey}/contact` : '/contact'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.contact}
            </Link>
            
            <button
              onClick={() => handleNavigation(industryKey ? `/${industryKey}/contact` : '/contact', false)}
              className="block w-full px-8 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 transform bg-secondary hover:opacity-90 text-center"
            >
              {universalContent.navigation.buttons.getStarted}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Spacer for fixed navbar on non-seamless pages */}
      {!isSeamlessPage && <div className="h-14 lg:h-16" />}
    </>
  );
};

// Component without context for standalone usage
const IndustryNavbarWithoutContext: React.FC<IndustryNavbarProps> = ({ 
  config, 
  industry: industryProp, 
  industryName: industryNameProp,
  currentIndustry 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ industry: string }>();

  // Determine the current industry and name from props only
  const industry = industryProp || config?.industry || currentIndustry || 'main';
  const industryName = industryNameProp || config?.name || IndustryNames[industry];
  
  // Get enabled verticals configuration
  const enabledVerticals = getEnabledVerticals();
  const enabledVerticalCount = getEnabledVerticalCount();

  // Get subdomain helper
  const getCurrentSubdomain = () => {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) return null;
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[parts.length - 2] === 'inteligenciadm') {
      return parts[0] || null;
    }
    if (hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com') {
      return 'main';
    }
    return null;
  };
  
  const subdomain = getCurrentSubdomain();

  // Determine industry key for navigation
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const industryKey = (subdomain === 'hospitality' || subdomain === 'healthcare') ? '' : (params.industry || pathSegments[0] || 'hotels'); // Empty prefix on subdomain
  const isSeamlessPage = (pathSegments.length === 1 && getIndustryFromPath(location.pathname) !== null) || 
                         ((subdomain === 'hospitality' || subdomain === 'healthcare') && location.pathname === '/');

  // Click outside handler for industry dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.industry-dropdown-container')) {
        setIsIndustryDropdownOpen(false);
      }
    };

    if (isIndustryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    // Return undefined when dropdown is not open
    return undefined;
  }, [isIndustryDropdownOpen]);

  // Navigation handlers
  const handleNavigation = (destination: string, isScrollTarget: boolean = false) => {
    if (isSeamlessPage && isScrollTarget) {
      // On seamless page, scroll to section
      const element = document.getElementById(destination);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!isSeamlessPage && isScrollTarget) {
      // On subpage wanting to scroll to main page section
      navigate(`${industryKey ? `/${industryKey}` : ''}#${destination}`);
    } else {
      // Regular navigation to subpage
      navigate(destination);
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    handleNavigation(sectionId, true);
  };

  // Get navigation items from universal content
  const navItems = universalContent.navigation.mainMenu;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16 py-1">
            {/* Logo and Brand Name */}
            <div className="flex items-center">
              <Link
                to={industry === 'main' || !industry ? '/' : (industryKey ? `/${industryKey}` : '/')}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <img 
                    src="/LM_inteligencia/Inteligencia-logo-new.png" 
                    alt="Inteligencia Digital Marketing" 
                    className="h-8 lg:h-9"
                    style={{ objectFit: 'contain' }}
                  />
                  <span className="text-2xl font-medium text-primary" style={{ fontFamily: 'inherit' }}>
                    Inteligencia
                  </span>
                </motion.div>
              </Link>
              <div className={`relative industry-dropdown-container ml-2 ${enabledVerticalCount > 1 ? 'block' : 'hidden'}`}>
                
                {/* Industry switcher - show when multiple verticals are enabled */}
                <button
                  onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mt-1"
                >
                  {industryName}
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Industry Dropdown - show enabled verticals only */}
                {isIndustryDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50">
                    {Object.entries(industryToUrlMap).map(([ind, urlPath]) => {
                      // Only show enabled verticals, skip main and current industry
                      if (ind === 'main' || ind === industry || !urlPath || !enabledVerticals.includes(ind as any)) return null;
                      
                      // Map to subdomain URLs
                      const subdomainMap: Record<string, string> = {
                        'hospitality': 'hospitality.inteligenciadm.com',
                        'healthcare': 'healthcare.inteligenciadm.com',
                        'tech': 'tech.inteligenciadm.com',
                        'athletics': 'athletics.inteligenciadm.com'
                      };
                      
                      const targetSubdomain = subdomainMap[ind];
                      if (!targetSubdomain) return null;
                      
                      // Always go to homepage when switching industries
                      const targetUrl = `https://${targetSubdomain}`;
                      
                      return (
                        <a
                          key={ind}
                          href={targetUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsIndustryDropdownOpen(false);
                            // Use window.location for full page navigation to subdomain
                            window.location.href = targetUrl;
                          }}
                          className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {IndustryNames[ind as IndustryType]}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Services - always navigate to services page */}
              <Link
                to={industryKey ? `/${industryKey}/services` : '/services'}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                {navItems.services}
              </Link>

              {/* About - always navigate to subpage */}
              <Link
                to={industryKey ? `/${industryKey}/about` : '/about'}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                {navItems.about}
              </Link>

              {/* Case Studies - conditionally show based on vertical settings */}
              {isSectionVisibleSync(industry, 'showCaseStudies') && (
                <Link
                  to={industryKey ? `/${industryKey}/case-studies` : '/case-studies'}
                  className="font-medium transition-colors hover:text-primary text-gray-700"
                >
                  {navItems.caseStudies}
                </Link>
              )}

              {/* Blog - conditionally show based on vertical settings */}
              {isSectionVisibleSync(industry, 'showBlog') && (
                <Link
                  to={industryKey ? `/${industryKey}/blog` : '/blog'}
                  className="font-medium transition-colors hover:text-primary text-gray-700"
                >
                  {navItems.blog}
                </Link>
              )}

              {/* Contact - always navigate to contact page */}
              <Link
                to={industryKey ? `/${industryKey}/contact` : '/contact'}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                {navItems.contact}
              </Link>

              <button
                onClick={() => handleNavigation(industryKey ? `/${industryKey}/contact` : '/contact', false)}
                className="inline-block px-8 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 transform bg-secondary hover:opacity-90"
              >
                {universalContent.navigation.buttons.getStarted}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md transition-colors text-gray-700 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            height: isMobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {/* Mobile navigation items */}
            <Link
              to={industryKey ? `/${industryKey}/services` : '/services'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.services}
            </Link>

            <Link
              to={industryKey ? `/${industryKey}/about` : '/about'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.about}
            </Link>

            <Link
              to={industryKey ? `/${industryKey}/case-studies` : '/case-studies'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.caseStudies}
            </Link>

            {/* Blog - conditionally show based on vertical settings */}
            {isSectionVisibleSync(industry, 'showBlog') && (
              <Link
                to={industryKey ? `/${industryKey}/blog` : '/blog'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
              >
                {navItems.blog}
              </Link>
            )}

            <Link
              to={industryKey ? `/${industryKey}/contact` : '/contact'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              {navItems.contact}
            </Link>
            
            <button
              onClick={() => handleNavigation(industryKey ? `/${industryKey}/contact` : '/contact', false)}
              className="block w-full px-8 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 transform bg-secondary hover:opacity-90 text-center"
            >
              {universalContent.navigation.buttons.getStarted}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Spacer for fixed navbar on non-seamless pages */}
      {!isSeamlessPage && <div className="h-14 lg:h-16" />}
    </>
  );
};

// Main component that decides which version to render
export const IndustryNavbar: React.FC<IndustryNavbarProps> = (props) => {
  // Use the IndustryContext.Consumer to safely check if context is available
  return (
    <IndustryContext.Consumer>
      {(context) => 
        context ? (
          <IndustryNavbarWithContext {...props} />
        ) : (
          <IndustryNavbarWithoutContext {...props} />
        )
      }
    </IndustryContext.Consumer>
  );
};