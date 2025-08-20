// Pricing Page - Displays detailed pricing plans and packages

import React from 'react';
import { motion } from 'framer-motion';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { getIndustryName } from '../../types/Industry';
// Removed unused universalContent import

export const PricingPage: React.FC = () => {
  const { config, industryKey } = useIndustryContext();
  const industryName = getIndustryName(config.industry);
  const pricing = config.content.pricing;
  const pricingPageContent = config.content.pricingPageContent || {
    hero: {
      title: `${industryName} Marketing Pricing`,
      subtitle: 'Transparent pricing designed to scale with your business. Choose the plan that fits your goals and budget.'
    },
    choosePlanSection: {
      title: 'Choose Your Plan',
      subtitle: `All plans include our core marketing services tailored specifically for ${industryName.toLowerCase()} businesses.`
    },
    customPricingSection: {
      title: 'Custom Pricing Available',
      subtitle: 'We offer customized pricing packages tailored to your specific needs and budget.',
      ctaText: 'Get a Custom Quote'
    },
    faqSection: {
      title: 'Frequently Asked Questions',
      subtitle: 'Get answers to common questions about our pricing and services.',
      faqs: []
    },
    ctaSection: {
      title: 'Ready to Grow Your Business?',
      subtitle: 'Choose the plan that\'s right for you, or contact us for a custom solution tailored to your needs.',
      primaryButton: 'Get Started Today',
      secondaryButton: 'View Our Services'
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              {pricingPageContent.hero.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              {pricingPageContent.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {pricing.plans && pricing.plans.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{pricingPageContent.choosePlanSection.title}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {pricingPageContent.choosePlanSection.subtitle}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricing.plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                      plan.recommended ? 'ring-2 ring-primary transform scale-105' : ''
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/{plan.duration}</span>
                      </div>
                      {plan.description && (
                        <p className="text-gray-600">{plan.description}</p>
                      )}
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={plan.ctaLink || '/contact'}
                      className={`block w-full py-3 px-6 rounded-lg font-bold text-center transition-colors ${
                        plan.recommended
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.ctaText || 'Get Started'}
                    </a>
                  </motion.div>
                ))}
              </div>

              {pricing.disclaimer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mt-12 text-center text-gray-600"
                >
                  <p className="text-sm">{pricing.disclaimer}</p>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{pricingPageContent.customPricingSection.title}</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {pricingPageContent.customPricingSection.subtitle}
              </p>
              <a
                href="/contact"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                {pricingPageContent.customPricingSection.ctaText}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      {pricingPageContent.comparison && pricing.plans && pricing.plans.length >= 3 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{pricingPageContent.comparison.title}</h2>
            </motion.div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-lg">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-gray-900 font-semibold">Features</th>
                    {pricing.plans.map((plan, idx) => (
                      <th key={idx} className="px-6 py-4 text-center">
                        <div className="font-bold text-gray-900">{plan.name}</div>
                        <div className="text-sm text-gray-600">{plan.price}/{plan.duration}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingPageContent.comparison.features.map((feature, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.starter === 'boolean' ? (
                          feature.starter ? (
                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{feature.starter}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.growth === 'boolean' ? (
                          feature.growth ? (
                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{feature.growth}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{feature.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{pricingPageContent.faqSection.title}</h2>
            <p className="text-xl text-gray-600">
              {pricingPageContent.faqSection.subtitle}
            </p>
          </motion.div>

          <div className="space-y-6">
            {(pricingPageContent.faqSection.faqs.length > 0 ? pricingPageContent.faqSection.faqs : [
              {
                question: 'What\'s included in each plan?',
                answer: 'All plans include our core marketing services: strategy development, campaign management, analytics reporting, and ongoing optimization. Higher-tier plans include additional services and more dedicated support.'
              },
              {
                question: 'Can I change plans later?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.'
              },
              {
                question: 'Do you offer custom packages?',
                answer: 'Absolutely. We understand that every business is unique. Contact us to discuss a custom package tailored to your specific needs and goals.'
              },
              {
                question: 'What\'s your contract length?',
                answer: 'We offer month-to-month contracts with no long-term commitments. However, we do offer discounts for annual prepayment.'
              },
              {
                question: 'How quickly can I see results?',
                answer: 'Most clients start seeing initial results within 30-60 days. However, the best results come from consistent, long-term marketing efforts.'
              }
            ]).map((faq: { question: string; answer: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-8 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{pricingPageContent.ctaSection.title}</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {pricingPageContent.ctaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                {pricingPageContent.ctaSection.primaryButton}
              </a>
              <a
                href="/services"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-primary transition-colors"
              >
                {pricingPageContent.ctaSection.secondaryButton}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};