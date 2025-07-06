// About Teaser Section - Brief about section with CTA to full About page

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Award, Target, Heart } from 'lucide-react';
import type { TeamContent } from '../../types/Industry';

interface AboutTeaserSectionProps {
  team: TeamContent[];
  industryTheme?: string;
  learnMoreCta?: string;
  industryPath?: string;
}

export const AboutTeaserSection: React.FC<AboutTeaserSectionProps> = ({ 
  team,
  industryTheme = 'default',
  learnMoreCta,
  industryPath = ''
}) => {
  // Industry theme will be used for custom styling in future versions
  void industryTheme;

  // Get the founder (first team member)
  const founder = team[0];

  if (!founder || !learnMoreCta) {
    return null;
  }

  return (
    <section className="py-32 bg-white" id="about-teaser">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold mb-8" style={{ color: '#000', letterSpacing: '-0.02em' }}>
              Meet Your Growth Partner
            </h2>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#000' }}>
                {founder.name}
              </h3>
              <p className="text-lg text-gray-600 mb-2">
                {founder.title}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {founder.bio.substring(0, 200)}...
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <Award className="w-8 h-8 mr-3" style={{ color: '#0f5bfb' }} />
                <div>
                  <div className="font-semibold text-gray-900">Certified Expert</div>
                  <div className="text-sm text-gray-600">{founder.certifications?.length || 4}+ Certifications</div>
                </div>
              </div>
              <div className="flex items-center">
                <Target className="w-8 h-8 mr-3" style={{ color: '#0f5bfb' }} />
                <div>
                  <div className="font-semibold text-gray-900">Proven Results</div>
                  <div className="text-sm text-gray-600">100+ Success Stories</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              to={`${industryPath}/about`}
              className="inline-flex items-center text-lg font-medium hover:opacity-80 transition-opacity duration-300"
              style={{ color: '#0f5bfb' }}
            >
              {learnMoreCta}
            </Link>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-2xl">
              {founder.image ? (
                <img 
                  src={founder.image} 
                  alt={founder.name}
                  className="w-full h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[500px] bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
                  <Users className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div 
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
              style={{ backgroundColor: '#0f5bfb' }}
            />
            <div 
              className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-10"
              style={{ backgroundColor: '#f12d8f' }}
            />
          </motion.div>
        </div>

        {/* Values Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: '#f12d8f' }} />
            <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>Client-First Approach</h4>
            <p className="text-gray-600">Your success is our only metric</p>
          </div>
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto mb-4" style={{ color: '#0f5bfb' }} />
            <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>Data-Driven Results</h4>
            <p className="text-gray-600">Every decision backed by real insights</p>
          </div>
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#ffa424' }} />
            <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>Industry Expertise</h4>
            <p className="text-gray-600">Deep knowledge of your specific market</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};