// Pricing Section Component

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { PricingContent } from '../../types/Industry';

interface PricingSectionProps {
  pricing: PricingContent;
  industryTheme?: string;
  viewDetailedCta?: string;
  industryPath?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  pricing,
  industryTheme = 'default',
  viewDetailedCta,
  industryPath = ''
}) => {
  // Industry theme will be used for custom styling in future versions
  void industryTheme;

  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Our Pricing Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business size and marketing goals. 
            All plans include our core services with varying levels of support and features.
            {viewDetailedCta && (
              <span className="block mt-4 text-lg">
                <Link to={`${industryPath}/pricing`} className="font-medium hover:opacity-80 transition-opacity duration-300" style={{ color: '#f04a9b' }}>
                  {viewDetailedCta}
                </Link>
              </span>
            )}
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricing.plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 ${
                plan.recommended 
                  ? 'border-blue-500 transform scale-105' 
                  : 'border-gray-100'
              }`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {plan.duration}
                  </span>
                </div>
                {plan.description && (
                  <p className="text-gray-600 text-sm">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex}
                      className="flex items-start"
                    >
                      <span className="text-green-500 mr-3 mt-1 flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-gray-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                to={plan.ctaLink}
                className={`block w-full py-4 rounded-lg font-bold text-center transition-all duration-300 ${
                  plan.recommended
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.ctaText}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        {pricing.disclaimer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm max-w-4xl mx-auto">
              {pricing.disclaimer}
            </p>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-6">
              Schedule a free consultation to discuss your specific needs and find the perfect plan for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`${industryPath}/contact`}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Schedule Consultation
              </Link>
              <Link
                to={`${industryPath}/services`}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View All Services
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};