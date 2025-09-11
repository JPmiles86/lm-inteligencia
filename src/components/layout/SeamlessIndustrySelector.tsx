// Seamless transition version of the industry selector

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { IndustryType } from '../../types/Industry.js';

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

const selectedTagline = "intelligent marketing solutions that drive real results";

const industryHoverColors: Record<IndustryType, string> = {
  'hospitality': '#0f5bfb',    // Electric Blue
  'healthcare': '#ffa424',     // Bright Orange
  'tech': '#f12d8f',           // Neon Magenta
  'athletics': '#760b85',      // Futuristic Purple
  'main': '#374151'            // Gray
};

export const SeamlessIndustrySelector: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasAnimated = useRef(false);
  const navigate = useNavigate();
  const renderCount = useRef(0);
  // Removed unused componentId

  useEffect(() => {
    // Animation lifecycle tracking removed
    
    return () => {
      // Component unmounting cleanup
    };
  }, []);

  useEffect(() => {
    renderCount.current += 1;
    // Render tracking removed
  });

  const handleIndustryClick = async (industry: IndustryType) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSelectedIndustry(industry);

    // Start the transition sequence
    // Other verticals will fade out, selected will move to center
    
    // Wait for animations to complete
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate without page refresh
    const pathMap: Record<IndustryType, string> = {
      'hospitality': '/hospitality',
      'healthcare': '/health',
      'tech': '/tech',
      'athletics': '/sports',
      'main': '/'
    };
    
    navigate(pathMap[industry], { state: { fromSelector: true } });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white px-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-6xl mx-auto"
      >
        {/* Logo with floating animation */}
        <motion.img 
          src="/LM_inteligencia/Inteligencia-logo-trans.png" 
          alt="Inteligencia logo" 
          className="mx-auto mb-16"
          style={{ width: '400px', height: 'auto', objectFit: 'contain' }}
          initial={hasAnimated.current ? false : { opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: selectedIndustry ? [0, -10, 0] : 0 
          }}
          transition={{ 
            opacity: { duration: 0.5 },
            y: selectedIndustry ? { duration: 3, repeat: Infinity, ease: "easeInOut" as const } : { duration: 0.5 }
          }}
        />
        
        {/* inteligencia text - lowercase */}
        <motion.h1
          className="text-6xl mb-4"
          style={{ color: '#1f1d32', fontFamily: 'Poppins, sans-serif', fontWeight: 400, letterSpacing: '-0.02em' }}
          initial={hasAnimated.current ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: hasAnimated.current ? 0 : 0.2, ease: "easeOut" as const }}
        >
          inteligencia
        </motion.h1>
        
        {/* digital marketing text - lowercase */}
        <motion.h2
          className="text-2xl mb-12"
          style={{ color: '#1f1d32', fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
          initial={hasAnimated.current ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: hasAnimated.current ? 0 : 0.3, ease: "easeOut" as const }}
        >
          digital marketing
        </motion.h2>
        
        <motion.p 
          className="text-xl mb-24 tracking-wide max-w-2xl mx-auto" 
          style={{ color: '#666', fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
          initial={hasAnimated.current ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: hasAnimated.current ? 0 : 0.5, ease: "easeOut" as const }}
        >
          {selectedTagline}
        </motion.p>
        
        <motion.div 
          className="flex flex-row gap-20 justify-center items-start relative"
          animate={selectedIndustry ? { justifyContent: 'center' } : { justifyContent: 'center' }}
        >
          {industries.map((industry, index) => {
            const isSelected = selectedIndustry === industry.industry;
            const shouldHide = selectedIndustry && !isSelected;
            
            // Calculate animation values
            const initialValue = hasAnimated.current ? false : { opacity: 0, y: 30 };
            const animateValue = { 
              opacity: shouldHide ? 0 : 1,
              y: 0,
              scale: isSelected ? 1.1 : 1,
              position: isSelected ? 'absolute' : 'relative',
              left: isSelected ? '50%' : 'auto',
              x: isSelected ? '-50%' : 0
            };
            const transitionValue = { 
              opacity: { duration: 0.5, delay: shouldHide ? 0 : (hasAnimated.current ? 0 : 0.6 + index * 0.1) },
              y: { duration: 0.5, delay: hasAnimated.current ? 0 : 0.6 + index * 0.1 },
              scale: { duration: 0.8, delay: 0.3 },
              x: { duration: 0.8, delay: 0.3 },
              ease: "easeOut" as const
            };
            
            // Animation state tracking removed
            
            return (
              <motion.div
                key={industry.industry}
                initial={initialValue}
                animate={animateValue}
                transition={transitionValue}
                onAnimationStart={() => {
                  // Animation start tracking removed
                }}
                onAnimationComplete={() => {
                  // Animation complete tracking removed
                  
                  if (!hasAnimated.current && index === industries.length - 1) {
                    hasAnimated.current = true;
                  }
                }}
                onUpdate={() => {
                  // Animation update tracking removed
                }}
                whileHover={!isTransitioning ? { scale: 1.02 } : {}}
                className={`cursor-pointer group p-4 rounded-lg ${
                  isTransitioning ? 'pointer-events-none' : ''
                }`}
                onClick={() => handleIndustryClick(industry.industry)}
              >
                <div className="text-2xl font-light tracking-wide">
                  <div 
                    className="mb-2"
                    style={{ color: '#1f1d32' }}
                  >
                    {industry.title}
                  </div>
                  <motion.div 
                    className="text-sm font-normal"
                    style={{ 
                      color: '#666'
                    }}
                    animate={{ 
                      opacity: shouldHide || (isSelected && isTransitioning) ? 0 : 0.7
                    }}
                    whileHover={{ 
                      color: industryHoverColors[industry.industry]
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
    </div>
  );
};