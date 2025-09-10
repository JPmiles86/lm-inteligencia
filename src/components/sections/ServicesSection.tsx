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
  Check,
  Smile,
  Heart,
  Activity,
  Utensils,
  Share2
} from 'lucide-react';
import type { ServiceContent } from '../../types/Industry';

interface ServicesSectionProps {
  services: ServiceContent[];
  industryTheme?: string;
  viewAllCta?: string;
  industryPath?: string;
  title?: string;
  subtitle?: string;
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
  'Healthcare Patient Acquisition': <Shield className="w-12 h-12" />,
  'Dental Practice Marketing': <Smile className="w-12 h-12" />,
  'Wellness & Retreat Marketing': <Heart className="w-12 h-12" />,
  'Fitness & Gym Marketing': <Activity className="w-12 h-12" />,
  
  // Sports
  'Tournament & Event Promotion': <Trophy className="w-12 h-12" />,
  'Membership Growth Marketing': <Users className="w-12 h-12" />,
  'Sports Facility Management': <Calendar className="w-12 h-12" />,
  
  // Hospitality additional services
  'OTA Optimization & Demand Generation': <Globe className="w-12 h-12" />,
  'Restaurant Marketing': <Utensils className="w-12 h-12" />,
  'Alternative Channel Marketing': <Share2 className="w-12 h-12" />,
  'Conversion Rate Optimization (CRO)': <TrendingUp className="w-12 h-12" />,
  
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
  title = 'Marketing That Moves The Metrics That Matter',
  subtitle = 'AI-Driven Strategy for Your Business'
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
            {title.split('The Metrics That Matter').map((part, index) => (
              <span key={index}>
                {part}
                {index === 0 && title.includes('The Metrics That Matter') && (
                  <>
                    <br />
                    The Metrics That Matter
                  </>
                )}
              </span>
            ))}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle} 
            {viewAllCta && (
              <span className="block mt-4 text-lg">
                <Link to="/services" className="font-medium hover:opacity-80 transition-opacity duration-300 text-secondary">
                  {viewAllCta}
                </Link>
              </span>
            )}
          </p>
        </motion.div>

        {/* Mobile/Tablet View - All Cards Expanded */}
        <div className="lg:hidden space-y-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Service Image */}
              <div className="h-64 overflow-hidden">
                <img 
                  src={service.image || getPlaceholderImage(index)}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Service Content */}
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(240, 74, 155, 0.06)' }}>
                    {getServiceIcon(service.title)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#000' }}>
                      {service.title}
                    </h3>
                    <p className="text-gray-600">
                      {service.keyBenefit}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                {service.features && (
                  <ul className="space-y-3">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {service.learnMoreLink && (
                  <Link 
                    to={service.learnMoreLink}
                    className="inline-block mt-6 text-secondary font-semibold hover:opacity-80 transition-opacity"
                  >
                    Learn More →
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop View - Original Hover Interaction */}
        <div className="hidden lg:grid grid-cols-2 gap-12">
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
                      backgroundColor: hoveredIndex === index ? 'rgba(240, 74, 155, 0.06)' : '#f9fafb'
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

          {/* Service Details Panel - Desktop Only */}
          <div className="sticky top-8 h-fit">
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
                  src={services[hoveredIndex]?.image || getPlaceholderImage(hoveredIndex)}
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
                  <div className="font-semibold text-lg text-secondary">
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
                        <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-accent" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Link
                to={services[hoveredIndex]?.learnMoreLink || `/contact?service=${encodeURIComponent(services[hoveredIndex]?.title || '')}`}
                className="w-full py-4 rounded-xl font-medium text-white text-center block transition-all duration-300 hover:scale-[1.02] transform bg-secondary hover:opacity-90"
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
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-3xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h3>
            <p className="text-white mb-10 text-lg">
              Let's discuss how these services can be customized for your specific business needs.
            </p>
            <div className="flex justify-center">
              <Link
                to="/contact"
                className="px-10 py-4 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] transform text-center bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Schedule Free Consultation
              </Link>
              {/* Case Studies button hidden for now - can be restored later
              <Link
                to={`${industryPath}/case-studies`}
                className="border px-10 py-4 rounded-xl font-medium transition-all duration-300 hover:bg-gray-100 text-center"
                style={{ borderColor: '#e5e7eb', color: '#000' }}
              >
                View Case Studies
              </Link>
              */}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};