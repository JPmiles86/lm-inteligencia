// About & Team Page - Professional about page for Inteligencia

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// Removed unused imports
import { universalContent } from '../../config/universal-content';
import { useAdminSettings } from '../../hooks/useAdminSettings';

export const AboutPage: React.FC = () => {
  // industryKey not needed in this component
  // Removed unused industryName variable
  const adminSettings = useAdminSettings();

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
            <div className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto whitespace-pre-line">
              {universalContent.aboutPage.hero.subtitle}
            </div>
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
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {founderStory.title}
              </h2>
              {founderStory.subtitle && (
                <p className="text-xl text-gray-700 font-medium mb-2">
                  {founderStory.subtitle}
                </p>
              )}
              {founderStory.tagline && (
                <p className="text-lg text-gray-600 italic mb-6">
                  {founderStory.tagline}
                </p>
              )}
              <p className="text-lg text-gray-700 mb-6">
                {founderStory.description}
              </p>
              <p className="text-lg text-gray-700 mb-6">
                {founderStory.extendedStory}
              </p>
              <div className="text-lg text-gray-700 mb-8 whitespace-pre-line">
                {founderStory.approach}
              </div>
              
              {/* Laurie's Certifications */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Degrees and Qualifications</h3>
                <ul className="space-y-1 text-gray-600">
                  {founderStory.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>{cert}</span>
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
              {/* Office Image - Hidden per client request */}
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
            {/* Display first 4 values in first row */}
            {companyValues.slice(0, 4).map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="flex justify-center mb-4">
                  {typeof value.icon === 'string' && value.icon.length <= 2 ? (
                    <div className="text-4xl">{value.icon}</div>
                  ) : (
                    <div className="w-12 h-12 text-primary" dangerouslySetInnerHTML={{ __html: value.icon }} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Display remaining 4 values in second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {companyValues.slice(4).map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="flex justify-center mb-4">
                  {typeof value.icon === 'string' && value.icon.length <= 2 ? (
                    <div className="text-4xl">{value.icon}</div>
                  ) : (
                    <div className="w-12 h-12 text-primary" dangerouslySetInnerHTML={{ __html: value.icon }} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Visibility controlled by admin settings */}
      {adminSettings.showStaffSection && (
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
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-[#371657] via-[#9123d1] to-gray-900 text-white">
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
              <Link
                to="/contact"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-block text-center"
              >
                {universalContent.aboutPage.ctaSection.primaryButton}
              </Link>
              <Link
                to="/services"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-block text-center"
              >
                {universalContent.aboutPage.ctaSection.secondaryButton}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};