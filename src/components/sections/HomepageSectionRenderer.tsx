// Homepage Section Renderer - Renders different section types from industry configs

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Calculator, ArrowRight } from 'lucide-react';
import type { HomepageSection } from '../../types/Industry.js';

interface HomepageSectionRendererProps {
  section: HomepageSection;
  industryTheme?: string;
  index: number;
  industryPath?: string;
}

export const HomepageSectionRenderer: React.FC<HomepageSectionRendererProps> = ({ 
  section, 
  industryTheme = 'default',
  index
}) => {
  // Industry theme will be used for custom styling in future versions
  void industryTheme;
  
  // Determine background based on index
  const isEvenSection = index % 2 === 0;
  const bgColor = isEvenSection ? 'bg-gray-50' : 'bg-white';

  switch (section.type) {
    case 'value-expansion':
      return (
        <section className={`py-32 ${bgColor}`} id={section.id}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl sm:text-6xl font-bold mb-8" style={{ color: '#000', letterSpacing: '-0.02em' }}>
                {section.headline}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {section.content?.points?.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <Target className="w-16 h-16 mx-auto" style={{ color: '#0f5bfb' }} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: '#000' }}>
                    {point.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {point.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'social-proof':
      return (
        <section className={`py-32 ${bgColor}`} id={section.id}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl sm:text-6xl font-bold text-center mb-16" style={{ color: '#000', letterSpacing: '-0.02em' }}>
                {section.headline}
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                {section.stats?.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold mb-2" style={{ color: '#0f5bfb' }}>
                      {stat}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Featured Testimonial */}
              {section.featuredTestimonial && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="max-w-4xl mx-auto bg-white rounded-3xl p-12 shadow-lg"
                  style={{ backgroundColor: isEvenSection ? '#fff' : '#f9fafb' }}
                >
                  <blockquote className="text-2xl text-gray-800 mb-8 leading-relaxed">
                    "{section.featuredTestimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-xl">
                        {section.featuredTestimonial.author}
                      </div>
                      <div className="text-gray-600">
                        {section.featuredTestimonial.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      );

    case 'process':
      return (
        <section className={`py-32 ${bgColor}`} id={section.id}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl sm:text-6xl font-bold text-center mb-16" style={{ color: '#000', letterSpacing: '-0.02em' }}>
                {section.headline}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {section.steps?.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {/* Step number */}
                    <div className="absolute -top-4 left-0 text-6xl font-bold opacity-10" style={{ color: '#0f5bfb' }}>
                      {idx + 1}
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow relative z-10">
                      <h3 className="text-xl font-bold mb-3" style={{ color: '#000' }}>
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow to next step */}
                    {idx < (section.steps?.length || 0) - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      );

    case 'interactive':
      return (
        <section className={`py-32 ${bgColor}`} id={section.id}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="max-w-3xl mx-auto">
                <Calculator className="w-20 h-20 mx-auto mb-8" style={{ color: '#0f5bfb' }} />
                <h2 className="text-5xl sm:text-6xl font-bold mb-8" style={{ color: '#000', letterSpacing: '-0.02em' }}>
                  {section.headline}
                </h2>
                <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                  {section.description}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-10 py-4 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] transform"
                  style={{ backgroundColor: '#0f5bfb' }}
                >
                  {section.ctaText || 'Get Started'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      );

    default:
      return null;
  }
};