// Hero Section Component

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
// Removed unused ChevronDown import
import { Link } from 'react-router-dom';
import type { HeroContent } from '../../types/Industry';

interface HeroSectionProps {
  content: HeroContent;
  industryPath?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  content, 
  industryPath = ''
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);
  
  // Use minimal white background for cleaner design
  const useMinimalBackground = true;
  
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${useMinimalBackground ? 'bg-white' : ''}`}>
      {/* Background Media - Only show if not minimal */}
      {!useMinimalBackground && (
        <div className="absolute inset-0 z-0">
          {content.backgroundType === 'video' ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={content.backgroundSrc} type="video/mp4" />
              <img 
                src="/images/fallback-hero.jpg" 
                alt="Background" 
                className="w-full h-full object-cover"
              />
            </video>
          ) : (
            <img
              src={content.backgroundSrc}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${useMinimalBackground ? 'text-gray-900' : 'text-white'}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            {content.title}
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`text-xl sm:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed ${useMinimalBackground ? 'text-gray-600' : 'opacity-90'}`}
          >
            {content.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <Link 
              to={`${industryPath}/contact`}
              className={`inline-block px-10 py-5 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md ${useMinimalBackground ? 'bg-[#0f5bfb] text-white hover:bg-[#0d52d9]' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
            >
              {content.ctaText}
            </Link>
          </motion.div>

          {/* Stats */}
          {content.stats && content.stats.length > 0 && (
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {content.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={hasAnimated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                  className="text-center"
                >
                  <motion.div 
                    className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${useMinimalBackground ? 'text-[#0f5bfb]' : 'text-white'}`}
                    initial={{ opacity: 0 }}
                    animate={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                  >
                    {hasAnimated && <AnimatedNumber value={stat.value} />}
                  </motion.div>
                  <div className={`text-lg ${useMinimalBackground ? 'text-gray-600' : 'opacity-80'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator - Commented out as requested */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className={`${useMinimalBackground ? 'text-gray-400' : 'text-white opacity-70'}`}>
          <ChevronDown size={32} />
        </div>
      </motion.div> */}
    </section>
  );
};

// Animated number component for one-time animation
const AnimatedNumber: React.FC<{ value: string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    // Extract numeric part from value (e.g., "68%" -> 68)
    const numericMatch = value.match(/\d+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetNumber = parseInt(numericMatch[0]);
    const suffix = value.replace(numericMatch[0], '');
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNumber / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNumber) {
        clearInterval(timer);
        setDisplayValue(targetNumber + suffix);
      } else {
        setDisplayValue(Math.floor(current) + suffix);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{displayValue}</>;
};