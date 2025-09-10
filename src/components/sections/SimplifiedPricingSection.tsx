// Simplified Pricing Section Component - Shows 3 simple packages

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIndustryContext } from '../../contexts/IndustryContext';
import type { PricingContent } from '../../types/Industry';
import { isSectionVisibleSync } from '../../utils/verticalVisibility';

export const SimplifiedPricingSection: React.FC = () => {
  const { config } = useIndustryContext();
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
                  ? 'border-secondary transform lg:scale-105' 
                  : 'border-gray-100 hover:border-gray-300'
              }`}>
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="btn-gradient px-6 py-2 rounded-full text-sm font-bold">
                      RECOMMENDED
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name.replace(' Package', '')}
                  </h3>
                  {plan.description && (
                    <p className="text-gray-600 text-sm px-4">
                      {plan.description}
                    </p>
                  )}
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

                {/* Perfect For section */}
                {plan.suitableFor && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Perfect for:</p>
                    <p className="text-sm text-gray-600">{plan.suitableFor}</p>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  to="/contact"
                  className="block w-full py-4 rounded-lg font-bold text-center transition-all duration-300 btn-gradient transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional Add-Ons - Only show if addOns exist and visibility setting allows */}
        {pricing.addOns && Array.isArray(pricing.addOns) && pricing.addOns.length > 0 && 
         isSectionVisibleSync(config.industry, 'showOptionalAddOns') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Optional Add-Ons (A La Carte)
            </h3>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <ul className="space-y-4">
                {pricing.addOns.map((addon: { name: string; price: string }, index: number) => (
                  <li key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{addon.name}</span>
                    <span className="text-gray-900 font-semibold">{addon.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

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
              to="/contact"
              className="btn-gradient px-8 py-4 rounded-lg"
            >
              Schedule Free Consultation
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-gray-700 text-gray-700 bg-white px-8 py-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-900 transition-all duration-300"
            >
              View Detailed Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};