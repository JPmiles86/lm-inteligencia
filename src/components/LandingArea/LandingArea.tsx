import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { IndustryType } from '../../types/Industry';
import { useNavigationStore } from '../../store/navigationStore';
import { getEnabledVerticals } from '../../config/enabled-verticals';
import { industryToSubdomain } from '../../config/subdomain-mapping';

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

const industryHoverColors: Record<IndustryType, string> = {
  'hospitality': '#f04a9b',
  'healthcare': '#f04a9b',
  'tech': '#f04a9b',
  'athletics': '#f04a9b',
  'main': '#371657'
};

const selectedTagline = "intelligent marketing solutions that drive real results";

interface LandingAreaProps {
  onScrollToContent?: () => void;
}

export const LandingArea: React.FC<LandingAreaProps> = ({ onScrollToContent }) => {
  const { 
    selectedIndustry, 
    landingAreaState,
    setSelectedIndustry,
    setLandingAreaState 
  } = useNavigationStore();

  const [showScrollHint, setShowScrollHint] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  
  // Get enabled verticals and filter industries accordingly
  const enabledVerticals = getEnabledVerticals();
  const enabledIndustries = industries.filter(industry => 
    industry.industry !== 'main' && enabledVerticals.includes(industry.industry as any)
  );
  
  // Check if we're on a subdomain
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

  // Show scroll hint after 2 seconds of no interaction in decided state
  useEffect(() => {
    if (landingAreaState === 'decided') {
      const checkForInactivity = setInterval(() => {
        const timeSinceLastInteraction = Date.now() - lastInteractionTime;
        if (timeSinceLastInteraction > 2000 && !showScrollHint) {
          setShowScrollHint(true);
        }
      }, 100);

      return () => clearInterval(checkForInactivity);
    } else {
      setShowScrollHint(false);
    }
    return undefined;
  }, [landingAreaState, lastInteractionTime, showScrollHint]);

  // Reset interaction time on any user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setLastInteractionTime(Date.now());
      setShowScrollHint(false);
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const handleIndustryClick = async (industry: IndustryType) => {
    if (landingAreaState !== 'undecided') return;
    
    setSelectedIndustry(industry);
    setLandingAreaState('decided');
    
    // On main domain, redirect to appropriate subdomain
    if (!subdomain || subdomain === 'main') {
      // In production, redirect to subdomain
      if (process.env.NODE_ENV === 'production') {
        const targetSubdomain = industryToSubdomain[industry];
        const currentDomain = window.location.hostname;
        const baseDomain = currentDomain.includes('inteligenciadm.com') ? 'inteligenciadm.com' : currentDomain;
        const targetUrl = `https://${targetSubdomain}.${baseDomain}`;
        
        // Redirect to subdomain
        window.location.href = targetUrl;
      } else {
        // In development, just update URL path for testing
        const pathMap: Record<IndustryType, string> = {
          'hospitality': '/hospitality',
          'healthcare': '/healthcare',
          'tech': '/tech',
          'athletics': '/sports',
          'main': '/'
        };
        window.history.pushState({}, '', pathMap[industry]);
      }
    }
  };

  const handleScrollClick = () => {
    setLastInteractionTime(Date.now());
    if (onScrollToContent) {
      onScrollToContent();
    }
  };

  // Calculate center position for selected industry
  const getCenteringAnimation = (_index: number, isSelected: boolean) => {
    if (!isSelected) return {};
    
    return {
      position: 'absolute' as const,
      left: '50%',
      transform: 'translateX(-50%) scale(1.1)'
    };
  };

  return (
    <div className={`${landingAreaState === 'decided' ? 'min-h-screen' : 'h-screen'} flex flex-col items-center justify-center px-8 relative transition-all duration-500`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-6xl mx-auto"
      >
        {/* Logo with floating animation when decided */}
        <motion.img 
          src="/LM_inteligencia/Inteligencia-logo-new.png" 
          alt="Inteligencia logo" 
          className="mx-auto mb-16"
          style={{ width: '400px', height: 'auto', objectFit: 'contain' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: landingAreaState === 'decided' ? [0, -10, 0] : 0 
          }}
          transition={{ 
            opacity: { duration: 0.5 },
            y: landingAreaState === 'decided' 
              ? { duration: 3, repeat: Infinity, ease: "easeInOut" } 
              : { duration: 0.5 }
          }}
        />
        
        {/* inteligencia text */}
        <motion.h1
          className="text-6xl mb-4"
          style={{ color: '#371657', fontFamily: 'Poppins, sans-serif', fontWeight: 400, letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          inteligencia
        </motion.h1>
        
        {/* digital marketing text */}
        <motion.h2
          className="text-2xl mb-12"
          style={{ color: '#371657', fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          digital marketing
        </motion.h2>
        
        {/* Tagline */}
        <motion.p 
          className="text-xl mb-24 tracking-wide max-w-2xl mx-auto" 
          style={{ color: '#666', fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          {selectedTagline}
        </motion.p>
        
        {/* Industry Selector */}
        <motion.div 
          className="flex flex-row justify-center items-start relative"
          animate={{
            gap: landingAreaState === 'decided' ? '10px' : (enabledIndustries.length === 2 ? '60px' : '80px')
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ minHeight: '100px' }}
        >
          {enabledIndustries.map((industry, index) => {
            const isSelected = selectedIndustry === industry.industry;
            const shouldHide = landingAreaState === 'decided' && !isSelected;
            const centeringAnimation = getCenteringAnimation(index, isSelected && landingAreaState === 'decided');
            
            // On subdomain, only show the relevant industry
            const isOnSubdomain = subdomain && subdomain !== 'main';
            const isSubdomainIndustry = (
              (subdomain === 'hospitality' && industry.industry === 'hospitality') ||
              (subdomain === 'healthcare' && industry.industry === 'healthcare')
            );
            
            if (isOnSubdomain && !isSubdomainIndustry) {
              return null;
            }
            
            return (
              <motion.div
                key={industry.industry}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: shouldHide ? 0 : 1,
                  y: 0,
                  ...(isSelected && landingAreaState === 'decided' ? centeringAnimation : {})
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: shouldHide ? 0 : 0.6 + index * 0.1 },
                  y: { duration: 0.5, delay: 0.6 + index * 0.1 },
                  position: { duration: 0 }
                }}
                whileHover={landingAreaState === 'undecided' && !isOnSubdomain ? { scale: 1.02 } : {}}
                className={`cursor-pointer group p-4 rounded-lg ${
                  landingAreaState !== 'undecided' || isOnSubdomain ? 'pointer-events-none' : ''
                }`}
                onClick={() => !isOnSubdomain && handleIndustryClick(industry.industry)}
                style={isSelected && landingAreaState === 'decided' ? { zIndex: 10 } : {}}
              >
                <div className="text-2xl font-light tracking-wide">
                  <div 
                    className="mb-2"
                    style={{ 
                      color: isSelected && landingAreaState === 'decided' ? '#371657' : '#371657' 
                    }}
                  >
                    {industry.title}
                  </div>
                  <motion.div 
                    className="text-sm font-normal"
                    style={{ color: '#666' }}
                    animate={{ 
                      opacity: shouldHide ? 0 : 0.7
                    }}
                    whileHover={{ 
                      color: landingAreaState === 'undecided' && !isOnSubdomain ? industryHoverColors[industry.industry] : '#666'
                    }}
                  >
                    {industry.label}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
      
      {/* Scroll Arrow with bounce animation */}
      <AnimatePresence>
        {landingAreaState === 'decided' && (
          <motion.button
            className="absolute bottom-12 cursor-pointer flex flex-col items-center"
            onClick={handleScrollClick}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: 5 }}
          >
            <AnimatePresence>
              {showScrollHint && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-600 mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Scroll to explore
                </motion.span>
              )}
            </AnimatePresence>
            <ChevronDown 
              size={40} 
              color="#666"
              className="animate-bounce"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};