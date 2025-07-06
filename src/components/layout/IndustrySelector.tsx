// Ultra-minimal landing page with logo and simplified industry selection

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { IndustryType } from '../../types/Industry';
import { getIndustryUrl } from '../../utils/subdomainDetection';

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
    label: 'medical & dental practices'
  },
  {
    industry: 'athletics',
    title: 'sports', 
    label: 'athletic facilities & communities'
  }
];

const selectedTagline = "intelligent marketing solutions that drive real results";

interface LayoutVariantProps {
  onIndustryClick: (industry: IndustryType) => void;
  hasSelectedIndustry?: boolean;
}

// Main Layout: Horizontal Industries with Custom Colors
const MainLayout: React.FC<LayoutVariantProps> = ({ onIndustryClick, hasSelectedIndustry = false }) => (
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
        style={{ width: '280px', height: 'auto', objectFit: 'contain' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: hasSelectedIndustry ? [0, -10, 0] : 0 
        }}
        transition={{ 
          opacity: { duration: 1 },
          y: hasSelectedIndustry ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 1 }
        }}
      />
      
      {/* inteligencia text - lowercase */}
      <motion.h1
        className="text-6xl mb-4"
        style={{ color: '#1f1d32', fontFamily: 'Poppins, sans-serif', fontWeight: 400, letterSpacing: '-0.02em' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      >
        inteligencia
      </motion.h1>
      
      {/* digital marketing text - lowercase */}
      <motion.h2
        className="text-2xl mb-12"
        style={{ color: '#1f1d32', fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
      >
        digital marketing
      </motion.h2>
      <motion.p 
        className="text-xl mb-24 font-light tracking-wide max-w-2xl mx-auto" 
        style={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2, ease: "easeOut" }}
      >
        {selectedTagline}
      </motion.p>
      <div className="flex flex-row gap-20 justify-center items-start">
        {industries.map((industry, index) => (
          <motion.div
            key={industry.industry}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              delay: 2.5 + index * 0.2,
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer group transition-all duration-500 p-4 rounded-lg"
            onClick={() => onIndustryClick(industry.industry)}
          >
            <div className="text-2xl font-light tracking-wide transition-all duration-300">
              <div 
                className="group-hover:text-[#0f5bfb] transition-colors duration-500 mb-2"
                style={{ color: '#1f1d32' }}
              >
                {industry.title}
              </div>
              <div 
                className="text-sm font-normal opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                style={{ color: '#666' }}
              >
                {industry.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);


export const IndustrySelector: React.FC = () => {
  const [hasSelectedIndustry, setHasSelectedIndustry] = useState(false);
  
  const handleIndustryClick = (industry: IndustryType): void => {
    setHasSelectedIndustry(true);
    // Add a slight delay to show the floating animation before redirect
    setTimeout(() => {
      const url = getIndustryUrl(industry);
      window.location.href = url;
    }, 500);
  };

  return (
    <MainLayout onIndustryClick={handleIndustryClick} hasSelectedIndustry={hasSelectedIndustry} />
  );
};