// Testimonials Section Component

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TestimonialContent } from '../../types/Industry';

interface TestimonialsSectionProps {
  testimonials: TestimonialContent[];
  industryTheme?: string;
  viewAllCta?: string;
  industryPath?: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  testimonials,
  industryTheme = 'default', // TODO: Use for industry-specific styling
  viewAllCta,
  industryPath = ''
}) => {
  // Industry theme will be used for custom styling in future versions
  void industryTheme;
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-12" style={{ letterSpacing: '-0.02em' }}>
            Client Success Stories
          </h2>
          <div className="bg-gray-50 rounded-3xl p-16 max-w-3xl mx-auto">
            <Trophy className="w-16 h-16 mx-auto mb-8" style={{ color: '#0f5bfb' }} />
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Success Stories Coming Soon
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
              We're currently working with amazing clients and will be featuring their success stories here soon. 
              Contact us to discuss how we can help you achieve similar results.
            </p>
            <button className="px-10 py-4 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]" style={{ backgroundColor: '#0f5bfb' }}>
              Be Our Next Success Story
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-white" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-8" style={{ color: '#000', letterSpacing: '-0.02em' }}>
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real results from real businesses who trusted us with their marketing
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-3xl p-12 lg:p-16 max-w-4xl mx-auto"
          >
            {/* Quote Icon */}
            <div className="text-7xl mb-8 text-center opacity-10" style={{ color: '#0f5bfb' }}>
              "
            </div>

            {/* Testimonial Quote */}
            <blockquote className="text-2xl lg:text-3xl text-gray-800 text-center mb-12 leading-relaxed font-light">
              {testimonials[activeTestimonial]?.quote}
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                {testimonials[activeTestimonial]?.image && (
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial]?.author || 'Testimonial author'}
                    className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
                  />
                )}
                <div className="font-semibold text-gray-900 text-xl mb-1">
                  {testimonials[activeTestimonial]?.author}
                </div>
                <div className="text-gray-600 mb-1">
                  {testimonials[activeTestimonial]?.position}
                </div>
                <div className="font-medium" style={{ color: '#0f5bfb' }}>
                  {testimonials[activeTestimonial]?.company}
                </div>
                
                {/* Rating Stars */}
                {testimonials[activeTestimonial]?.rating && (
                  <div className="flex justify-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5"
                        fill={i < (testimonials[activeTestimonial]?.rating || 5) ? '#fbbf24' : '#e5e7eb'}
                        color={i < (testimonials[activeTestimonial]?.rating || 5) ? '#fbbf24' : '#e5e7eb'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={() => setActiveTestimonial(
                  activeTestimonial === 0 ? testimonials.length - 1 : activeTestimonial - 1
                )}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-4 shadow-md hover:scale-[1.02] transition-all duration-300 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => setActiveTestimonial(
                  activeTestimonial === testimonials.length - 1 ? 0 : activeTestimonial + 1
                )}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-4 shadow-md hover:scale-[1.02] transition-all duration-300 text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Testimonial Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeTestimonial
                    ? 'w-8' : ''
                }`}
                style={{ backgroundColor: index === activeTestimonial ? '#0f5bfb' : '#e5e7eb' }}
              />
            ))}
          </div>
        )}

        {/* View All CTA */}
        {viewAllCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to={`${industryPath}/case-studies`}
              className="inline-flex items-center text-lg font-medium hover:opacity-80 transition-opacity duration-300"
              style={{ color: '#0f5bfb' }}
            >
              {viewAllCta}
            </Link>
          </motion.div>
        )}

        {/* All Testimonials Grid (for more than 3) */}
        {testimonials.length > 3 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              More Success Stories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(3).map((testimonial, index) => (
                <motion.div
                  key={index + 3}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="text-sm text-gray-600 mb-4 italic">
                    "{testimonial.quote.length > 120 
                      ? testimonial.quote.substring(0, 120) + '...' 
                      : testimonial.quote}"
                  </div>
                  <div className="flex items-center">
                    {testimonial.image && (
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-gray-500">
                        {testimonial.position}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};