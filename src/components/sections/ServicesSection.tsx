// Services Section Component

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Hotel, 
  Camera, 
  Mail, 
  TrendingUp, 
  MapPin,
  ShoppingCart,
  Shield,
  Search,
  BookOpen,
  Trophy,
  Users,
  Calendar,
  Briefcase,
  Globe,
  Smartphone,
  Target,
  BarChart,
  Check
} from 'lucide-react';
import type { ServiceContent } from '../../types/Industry';

interface ServicesSectionProps {
  services: ServiceContent[];
  industryTheme?: string;
  viewAllCta?: string;
  industryPath?: string;
}

// Industry-specific icons mapping
const serviceIcons: Record<string, React.ReactNode> = {
  // Core Services (all industries)
  'Google Ads Management': <Target className="w-12 h-12" />,
  'Meta (FB/IG) Advertising': <Smartphone className="w-12 h-12" />,
  'Email Marketing & Funnels': <Mail className="w-12 h-12" />,
  'Marketing Strategy Consulting': <TrendingUp className="w-12 h-12" />,
  'Event/Launch Campaigns': <Calendar className="w-12 h-12" />,
  
  // Old service names (for backward compatibility)
  'Smart Booking System That Beats OTAs': <Hotel className="w-12 h-12" />,
  'Know Your Guests Before They Book': <Target className="w-12 h-12" />,
  'Reputation & Pricing That Wins': <BarChart className="w-12 h-12" />,
  
  // Restaurants  
  'Local SEO & Google My Business': <MapPin className="w-12 h-12" />,
  'Online Ordering Integration': <ShoppingCart className="w-12 h-12" />,
  'Food Photography': <Camera className="w-12 h-12" />,
  
  // Healthcare
  'HIPAA-Compliant Digital Marketing': <Shield className="w-12 h-12" />,
  'Local SEO for Healthcare': <Search className="w-12 h-12" />,
  'Patient Education Content': <BookOpen className="w-12 h-12" />,
  
  // Sports
  'Tournament & Event Promotion': <Trophy className="w-12 h-12" />,
  'Membership Growth Marketing': <Users className="w-12 h-12" />,
  'Sports Facility Management': <Calendar className="w-12 h-12" />,
  
  // Default
  'default': <Briefcase className="w-12 h-12" />
};

// Unsplash placeholder images by industry
const placeholderImages: Record<string, string[]> = {
  hospitality: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop'
  ],
  foodservice: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'
  ],
  healthcare: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop'
  ],
  athletics: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&h=400&fit=crop'
  ]
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  services,
  industryTheme = 'default',
  viewAllCta,
  industryPath = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0); // Show first service by default
  
  const getServiceIcon = (title: string): React.ReactNode => {
    return serviceIcons[title] || serviceIcons.default || <Globe className="w-12 h-12" />;
  };
  
  const getPlaceholderImage = (index: number): string => {
    const images = placeholderImages[industryTheme as keyof typeof placeholderImages] || placeholderImages.hospitality;
    const fallbackImage = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop';
    return images?.[index % images.length] || fallbackImage;
  };

  return (
    <section className="py-32 bg-gray-50" id="services">
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
            Digital Marketing That Drives Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We manage your digital marketing so you can focus on your business. 
            {viewAllCta && (
              <span className="block mt-4 text-lg">
                <Link to={`${industryPath}/services`} className="font-medium hover:opacity-80 transition-opacity duration-300" style={{ color: '#0f5bfb' }}>
                  {viewAllCta}
                </Link>
              </span>
            )}
          </p>
        </motion.div>

        {/* Services Grid with Hover Reveal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Services List */}
          <div className="space-y-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredIndex(index)}
                className={`p-8 rounded-2xl cursor-pointer transition-all duration-300 ${
                  hoveredIndex === index 
                    ? 'bg-white shadow-lg transform scale-[1.02]' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Service Icon */}
                  <div 
                    className="p-3 rounded-xl transition-colors duration-300"
                    style={{ 
                      backgroundColor: hoveredIndex === index ? '#0f5bfb10' : '#f9fafb',
                      color: hoveredIndex === index ? '#0f5bfb' : '#6b7280'
                    }}
                  >
                    {getServiceIcon(service.title)}
                  </div>

                  {/* Service Title and Brief */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#000' }}>
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {service.keyBenefit || 'Click to learn more'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Service Details Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <motion.div
              key={hoveredIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-10"
            >
              {/* Service Image */}
              <div className="mb-8 rounded-xl overflow-hidden">
                <img 
                  src={getPlaceholderImage(hoveredIndex)}
                  alt={services[hoveredIndex]?.title}
                  className="w-full h-56 object-cover transform hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* Service Details */}
              <h3 className="text-3xl font-bold mb-6" style={{ color: '#000', letterSpacing: '-0.01em' }}>
                {services[hoveredIndex]?.title}
              </h3>
              
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                {services[hoveredIndex]?.description}
              </p>

              {/* Key Benefit */}
              {services[hoveredIndex]?.keyBenefit && (
                <div 
                  className="rounded-xl p-6 mb-8 bg-gray-50"
                >
                  <div className="text-sm font-medium mb-2 text-gray-600">
                    Key Benefit
                  </div>
                  <div className="font-semibold text-lg" style={{ color: '#0f5bfb' }}>
                    {services[hoveredIndex].keyBenefit}
                  </div>
                </div>
              )}

              {/* Features List */}
              {services[hoveredIndex]?.features && services[hoveredIndex].features.length > 0 && (
                <div className="mb-8">
                  <ul className="space-y-4">
                    {services[hoveredIndex].features.slice(0, 3).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: '#0f5bfb' }} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Link
                to={services[hoveredIndex]?.learnMoreLink ? `${industryPath}${services[hoveredIndex].learnMoreLink}` : `${industryPath}/contact?service=${encodeURIComponent(services[hoveredIndex]?.title || '')}`}
                className="w-full py-4 rounded-xl font-medium text-white text-center block transition-all duration-300 hover:scale-[1.02] transform"
                style={{ backgroundColor: '#0f5bfb' }}
              >
                {services[hoveredIndex]?.learnMoreLink ? 'Learn More' : 'Get Started'}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <div className="bg-gray-50 rounded-3xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6" style={{ color: '#000' }}>
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-10 text-lg">
              Let's discuss how these services can be customized for your specific business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to={`${industryPath}/contact`}
                className="px-10 py-4 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] transform text-center"
                style={{ backgroundColor: '#0f5bfb' }}
              >
                Schedule Consultation
              </Link>
              <Link
                to={`${industryPath}/case-studies`}
                className="border px-10 py-4 rounded-xl font-medium transition-all duration-300 hover:bg-gray-100 text-center"
                style={{ borderColor: '#e5e7eb', color: '#000' }}
              >
                View Case Studies
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};