import React from 'react';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import type { IndustryType } from '../../types/Industry';

interface FooterProps {
  selectedIndustry: IndustryType;
}

interface Industry {
  industry: IndustryType;
  title: string;
  label: string;
}

const industries: Industry[] = [
  {
    industry: 'hospitality',
    title: 'hotels',
    label: 'hospitality & accommodations'
  },
  {
    industry: 'foodservice',
    title: 'food service',
    label: 'restaurants & food businesses'
  },
  {
    industry: 'healthcare', 
    title: 'healthcare',
    label: 'medical & healthcare practices'
  },
  {
    industry: 'athletics',
    title: 'sports', 
    label: 'athletic facilities & communities'
  }
];

const pathToIndustryMap: Record<string, IndustryType> = {
  'hotels': 'hospitality',
  'restaurants': 'foodservice',
  'dental': 'healthcare',
  'sports': 'athletics'
};

export const Footer: React.FC<FooterProps> = ({ selectedIndustry }) => {
  const { config, loading } = useIndustryConfig(selectedIndustry);

  // Debug logging removed

  // Handle loading state or missing config
  if (loading) {
    return null;
  }
  
  if (!config || !config.content) {
    // Return a simple footer even if config is missing
    return (
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Inteligencia</div>
            <p className="text-gray-400 mb-4">Smart marketing solutions that drive real results.</p>
            <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
              <p>&copy; 2024 Inteligencia. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4">Inteligencia</div>
            <p className="text-gray-400 mb-4">
              Smart marketing solutions that drive real results for {industries.find(i => i.industry === selectedIndustry)?.label}.
            </p>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              {config.content.services?.slice(0, 4).map((service, index) => (
                <li key={index}>
                  <a 
                    href={service.learnMoreLink || `/${Object.keys(pathToIndustryMap).find(k => pathToIndustryMap[k] === selectedIndustry)}/services`} 
                    className="hover:text-white transition-colors"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Industries */}
          <div>
            <h4 className="font-bold mb-4">Industries</h4>
            <ul className="space-y-2 text-gray-400">
              {industries.map((ind) => (
                <li key={ind.industry}>
                  <a
                    href={`/${Object.keys(pathToIndustryMap).find(k => pathToIndustryMap[k] === ind.industry)}`}
                    className="hover:text-white transition-colors text-left block"
                  >
                    {ind.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              {config.content.contact?.email && (
                <div>
                  <a href={`mailto:${config.content.contact.email}`} className="hover:text-white transition-colors">
                    {config.content.contact.email}
                  </a>
                </div>
              )}
              {config.content.contact?.phone && (
                <div>
                  <a href={`tel:${config.content.contact.phone}`} className="hover:text-white transition-colors">
                    {config.content.contact.phone}
                  </a>
                </div>
              )}
              <div className="pt-2">
                <a href={`/${Object.keys(pathToIndustryMap).find(k => pathToIndustryMap[k] === selectedIndustry)}/contact`} className="text-white hover:opacity-80 transition-opacity">
                  Get in Touch →
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Inteligencia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};