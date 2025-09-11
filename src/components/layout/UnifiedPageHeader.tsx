import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { IndustryType } from '../../types/Industry.js';

// Type for industries excluding 'main' which is used for specific industry UI elements
type IndustryTypeWithoutMain = Exclude<IndustryType, 'main'>;

interface UnifiedPageHeaderProps {
  industry: IndustryType;
  isDirect?: boolean; // If user accessed URL directly
}

const industryDisplayNames: Record<IndustryTypeWithoutMain, string> = {
  'hospitality': 'hospitality & lifestyle',
  'healthcare': 'health & wellness',
  'tech': 'tech & AI',
  'athletics': 'sport & media'
};

export const UnifiedPageHeader: React.FC<UnifiedPageHeaderProps> = ({ 
  industry,
  isDirect = false 
}) => {
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    // Show scroll arrow after animations complete
    const timer = setTimeout(() => {
      setShowScrollArrow(true);
    }, isDirect ? 1000 : 2000);

    return () => clearTimeout(timer);
  }, [isDirect]);

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white relative">
      <motion.div 
        initial={{ opacity: isDirect ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <motion.img 
          src="/LM_inteligencia/Inteligencia-logo-trans.png" 
          alt="Inteligencia logo" 
          className="mx-auto mb-16 cursor-pointer"
          style={{ width: '280px', height: 'auto', objectFit: 'contain' }}
          onMouseEnter={() => setIsHoveringLogo(true)}
          onMouseLeave={() => setIsHoveringLogo(false)}
          initial={{ y: isDirect ? 0 : 20 }}
          animate={{ 
            y: !isHoveringLogo ? [0, -15, 0] : 0
          }}
          transition={{ 
            y: { 
              duration: 3, 
              repeat: !isHoveringLogo ? Infinity : 0, 
              ease: "easeInOut" 
            }
          }}
        />
        
        {/* inteligencia text */}
        <motion.h1
          className="text-6xl mb-4"
          style={{ 
            color: '#1f1d32', 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 400, 
            letterSpacing: '-0.02em' 
          }}
          initial={{ opacity: isDirect ? 1 : 0, y: isDirect ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: isDirect ? 0 : 0.5 }}
        >
          inteligencia
        </motion.h1>
        
        {/* digital marketing text */}
        <motion.h2
          className="text-2xl mb-4"
          style={{ 
            color: '#1f1d32', 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 300 
          }}
          initial={{ opacity: isDirect ? 1 : 0, y: isDirect ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: isDirect ? 0.2 : 0.7 }}
        >
          digital marketing
        </motion.h2>
        
        {/* Industry name */}
        <motion.h3
          className="text-3xl"
          style={{ 
            color: '#1f1d32', 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 400 
          }}
          initial={{ opacity: isDirect ? 1 : 0, y: isDirect ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: isDirect ? 0.4 : 1 }}
        >
          {industry === 'main' ? 'all industries' : industryDisplayNames[industry as IndustryTypeWithoutMain]}
        </motion.h3>
      </motion.div>

      {/* Scroll Arrow */}
      <AnimatePresence>
        {showScrollArrow && (
          <motion.button
            className="absolute bottom-12 cursor-pointer"
            onClick={handleScrollDown}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: 5 }}
          >
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