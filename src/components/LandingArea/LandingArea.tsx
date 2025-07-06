import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { IndustryType } from '../../types/Industry';
import { useNavigationStore } from '../../store/navigationStore';

interface Industry {
  industry: IndustryType;
  title: string;
  label: string;
}

const industries: Industry[] = [
  {
    industry: 'hospitality',
    title: 'hotels',
    label: 'hospitality & accommodations'
  },
  {
    industry: 'foodservice',
    title: 'food service',
    label: 'restaurants & food businesses'
  },
  {
    industry: 'healthcare', 
    title: 'healthcare',
    label: 'medical & healthcare practices'
  },
  {
    industry: 'athletics',
    title: 'sports', 
    label: 'athletic facilities & communities'
  }
];

const industryHoverColors: Record<IndustryType, string> = {
  'hospitality': '#0f5bfb',
  'foodservice': '#f12d8f',
  'healthcare': '#ffa424',
  'athletics': '#760b85',
  'main': '#374151'
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
    
    // Update URL without navigation
    const pathMap: Record<IndustryType, string> = {
      'hospitality': '/hotels',
      'foodservice': '/restaurants',
      'healthcare': '/dental',
      'athletics': '/sports',
      'main': '/'
    };
    window.history.pushState({}, '', pathMap[industry]);
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
          src="/LM_inteligencia/Inteligencia-logo-trans.png" 
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
          style={{ color: '#1f1d32', fontFamily: 'Poppins, sans-serif', fontWeight: 400, letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          inteligencia
        </motion.h1>
        
        {/* digital marketing text */}
        <motion.h2
          className="text-2xl mb-12"
          style={{ color: '#1f1d32', fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
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
          className="flex flex-row gap-20 justify-center items-start relative"
          animate={{
            gap: landingAreaState === 'decided' ? '10px' : '80px'
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ minHeight: '100px' }}
        >
          {industries.map((industry, index) => {
            const isSelected = selectedIndustry === industry.industry;
            const shouldHide = landingAreaState === 'decided' && !isSelected;
            const centeringAnimation = getCenteringAnimation(index, isSelected && landingAreaState === 'decided');
            
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
                whileHover={landingAreaState === 'undecided' ? { scale: 1.02 } : {}}
                className={`cursor-pointer group p-4 rounded-lg ${
                  landingAreaState !== 'undecided' ? 'pointer-events-none' : ''
                }`}
                onClick={() => handleIndustryClick(industry.industry)}
                style={isSelected && landingAreaState === 'decided' ? { zIndex: 10 } : {}}
              >
                <div className="text-2xl font-light tracking-wide">
                  <div 
                    className="mb-2"
                    style={{ 
                      color: isSelected && landingAreaState === 'decided' ? '#1f1d32' : '#1f1d32' 
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
                      color: landingAreaState === 'undecided' ? industryHoverColors[industry.industry] : '#666'
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