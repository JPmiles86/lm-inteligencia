import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import type { IndustryType } from '../../types/Industry.js';

// Type for industries excluding 'main' which is used for specific industry UI elements
type IndustryTypeWithoutMain = Exclude<IndustryType, 'main'>;

interface TransitionManagerProps {
  children: React.ReactNode;
  selectedIndustry?: IndustryType;
  onTransitionComplete?: () => void;
}

export const TransitionManager: React.FC<TransitionManagerProps> = ({ 
  children, 
  selectedIndustry,
  onTransitionComplete 
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fadeOut' | 'center' | 'complete'>('idle');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (selectedIndustry && transitionPhase === 'idle') {
      startTransition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndustry]);

  const startTransition = async () => {
    setIsTransitioning(true);
    setTransitionPhase('fadeOut');

    // Phase 1: Fade out other verticals (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTransitionPhase('center');
    
    // Phase 2: Center animation (800ms)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update URL without page refresh
    if (selectedIndustry) {
      const industryPath = getIndustryPath(selectedIndustry);
      navigate(industryPath, { replace: true });
    }
    
    setTransitionPhase('complete');
    setIsTransitioning(false);
    
    if (onTransitionComplete) {
      onTransitionComplete();
    }
  };

  const getIndustryPath = (industry: IndustryType): string => {
    const pathMap: Record<IndustryTypeWithoutMain, string> = {
      'hospitality': '/hospitality',
      'healthcare': '/health',
      'tech': '/tech',
      'athletics': '/sports'
    };
    
    // Return '/' for 'main' industry, otherwise use the pathMap
    if (industry === 'main') {
      return '/';
    }
    return pathMap[industry as IndustryTypeWithoutMain] || '/';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {React.cloneElement(children as React.ReactElement, {
          transitionPhase,
          isTransitioning
        })}
      </motion.div>
    </AnimatePresence>
  );
};