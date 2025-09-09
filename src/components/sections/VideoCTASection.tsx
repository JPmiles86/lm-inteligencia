// Video CTA Section Component

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

interface VideoCTAContent {
  videoUrl?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  trustIndicators?: string[];
}

interface VideoCTASectionProps {
  content?: VideoCTAContent;
  industryTheme?: string;
  industryPath?: string;
  // Also support direct props for backwards compatibility
  industry?: string;
  videoUrl?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  trustIndicators?: string[];
}

export const VideoCTASection: React.FC<VideoCTASectionProps> = (props) => {
  // Use content prop first, then individual props, then defaults
  const videoUrl = props.content?.videoUrl || props.videoUrl;
  const headline = props.content?.headline || props.headline || 'Ready to transform your business?';
  const subtitle = props.content?.subtitle || props.subtitle || 'Let\'s discuss how AI-powered marketing can revolutionize your business';
  const ctaText = props.content?.ctaText || props.ctaText || 'Start Your Transformation';
  const baseCTALink = props.content?.ctaLink || props.ctaLink || '/contact';
  
  // Prepend industryPath if provided
  const ctaLink = props.industryPath ? `${props.industryPath}${baseCTALink}` : baseCTALink;
  const trustIndicators = props.content?.trustIndicators || props.trustIndicators || [
    'Free Strategy Consultation',
    'No Long-term Contracts', 
    'Results in 30 Days'
  ];

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Background - Video or Gradient */}
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
              <div className="w-full h-full bg-gray-900" />
            </video>
            {/* Semi-transparent overlay for video */}
            <div className="absolute inset-0 bg-black bg-opacity-60" />
          </>
        ) : (
          /* Dark blue gradient background when no video */
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a2540] via-[#1e4976] to-[#0a2540]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center text-white max-w-4xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            {headline}
          </h2>
          
          <p className="text-xl sm:text-2xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link
              to={ctaLink}
              className="inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg bg-white text-gray-900 hover:bg-gray-100"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Additional trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 flex flex-wrap justify-center gap-12 text-base"
          >
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <Check className="w-6 h-6" />
                <span>{indicator}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};