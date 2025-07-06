// Simplified Pricing Section Component - Shows 3 simple packages

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIndustryContext } from '../../contexts/IndustryContext';
import type { PricingContent } from '../../types/Industry';

export const SimplifiedPricingSection: React.FC = () => {
  const { config, industryPath } = useIndustryContext();
  const pricing = config.content.pricing;

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
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All packages include our full suite of digital marketing services
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricing.plans.slice(0, 3).map((plan: PricingContent['plans'][0], index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className={`h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 ${
                plan.recommended 
                  ? 'border-blue-500 transform lg:scale-105' 
                  : 'border-gray-100 hover:border-gray-300'
              }`}>
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      RECOMMENDED
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name.replace(' Package', '')}
                  </h3>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2 text-lg">
                      /{plan.duration.replace('per ', '')}
                    </span>
                  </div>
                  {plan.price.includes('+') && (
                    <p className="text-sm text-gray-500 mt-2">
                      Custom pricing available
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li 
                        key={featureIndex}
                        className="flex items-start"
                      >
                        <svg 
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Link
                  to={`${industryPath}/contact`}
                  className={`block w-full py-4 rounded-lg font-bold text-center transition-all duration-300 ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-8 text-lg">
            Need a custom solution? We'll create a package tailored to your specific needs and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`${industryPath}/contact`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Schedule Free Consultation
            </Link>
            <Link
              to={`${industryPath}/pricing`}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              View Detailed Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};