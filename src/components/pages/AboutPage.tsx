// About & Team Page - Professional about page for Inteligencia

import React from 'react';
import { motion } from 'framer-motion';
import { useIndustryContext } from '../../contexts/IndustryContext';
// Removed unused getIndustryName import
import { universalContent } from '../../config/universal-content';

export const AboutPage: React.FC = () => {
  const { industryKey } = useIndustryContext();
  // Removed unused industryName variable

  // Use universal content that's identical across all industries
  const aboutContent = universalContent.about;
  const founderStory = aboutContent.founderStory;
  const companyValues = aboutContent.values;
  const fullTeam = aboutContent.team;
  // Removed unused footerContent variable

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              {universalContent.aboutPage.hero.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {universalContent.aboutPage.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Laurie's Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {founderStory.title}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                {founderStory.description}
              </p>
              <p className="text-lg text-gray-700 mb-6">
                {founderStory.extendedStory}
              </p>
              <p className="text-lg text-gray-700 mb-8">
                {founderStory.approach}
              </p>
              
              {/* Laurie's Certifications */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Certifications & Expertise</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                  {founderStory.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={founderStory.image}
                  alt="Laurie Meiring, Founder of Inteligencia"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Office Image */}
              <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={aboutContent.officeImage}
                  alt="Inteligencia Office"
                  className="w-full h-48 object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{universalContent.aboutPage.valuesSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {universalContent.aboutPage.valuesSection.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{universalContent.aboutPage.teamSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {universalContent.aboutPage.teamSection.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fullTeam.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.title}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  
                  {member.certifications && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.certifications.map((cert, certIndex) => (
                          <span
                            key={certIndex}
                            className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{universalContent.aboutPage.ctaSection.title}</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {universalContent.aboutPage.ctaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${industryKey}/contact`}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                {universalContent.aboutPage.ctaSection.primaryButton}
              </a>
              <a
                href={`/${industryKey}/services`}
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                {universalContent.aboutPage.ctaSection.secondaryButton}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};