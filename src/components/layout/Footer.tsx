import React from 'react';
import { Link } from 'react-router-dom';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import type { IndustryType } from '../../types/Industry';
import { getCurrentSubdomain } from '../../utils/domainRedirect';

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
    title: 'hospitality & lifestyle',
    label: 'hotels • restaurants • travel & tourism'
  },
  {
    industry: 'healthcare', 
    title: 'health & wellness',
    label: 'dentistry • health clinics • retreats • fitness'
  },
  {
    industry: 'tech',
    title: 'tech & AI',
    label: 'SaaS • AI startups • martech • platforms'
  },
  {
    industry: 'athletics',
    title: 'sport & media', 
    label: 'pickleball • events • tournaments • media'
  }
];

const pathToIndustryMap: Record<string, IndustryType> = {
  'hospitality': 'hospitality',
  'hotels': 'hospitality',
  'restaurants': 'hospitality',
  'health': 'healthcare',
  'dental': 'healthcare',
  'healthcare': 'healthcare',
  'tech': 'tech',
  'sports': 'athletics'
};

export const Footer: React.FC<FooterProps> = ({ selectedIndustry }) => {
  const { config, loading } = useIndustryConfig(selectedIndustry);
  const subdomain = getCurrentSubdomain();
  const isOnSubdomain = subdomain === 'hospitality' || subdomain === 'healthcare' || subdomain === 'tech' || subdomain === 'athletics';

  // Determine URL prefix - empty for subdomain, use industry path for main domain
  const urlPrefix = isOnSubdomain ? '' : `/${Object.keys(pathToIndustryMap).find(k => pathToIndustryMap[k] === selectedIndustry) || ''}`;

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
            <Link to="/" className="flex items-center gap-2 mb-4 justify-center hover:opacity-80 transition-opacity">
              <img 
                src="/LM_inteligencia/Inteligencia-logo-new.png" 
                alt="Inteligencia" 
                className="h-8"
                style={{ objectFit: 'contain' }}
              />
              <span className="text-2xl font-bold">Inteligencia</span>
            </Link>
            <p className="text-gray-400 mb-4">Smart marketing solutions that drive real results.</p>
            <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
              <p>&copy; 2025 Inteligencia. All rights reserved.</p>
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
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity inline-flex">
              <img 
                src="/LM_inteligencia/Inteligencia-logo-new.png" 
                alt="Inteligencia" 
                className="h-8"
                style={{ objectFit: 'contain' }}
              />
              <span className="text-2xl font-bold">Inteligencia</span>
            </Link>
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
                    href={service.learnMoreLink || `${urlPrefix}/services`} 
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
                  {ind.industry === 'hospitality' || ind.industry === 'healthcare' ? (
                    <a
                      href={ind.industry === 'healthcare' ? 'https://healthcare.inteligenciadm.com' : (ind.industry === 'hospitality' ? 'https://hospitality.inteligenciadm.com' : '/')}
                      className="hover:text-white transition-colors text-left block capitalize"
                    >
                      {ind.title}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-left block capitalize">
                      {ind.title} <span className="text-xs">(Coming Soon)</span>
                    </span>
                  )}
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
                <a href={`${urlPrefix}/contact`} className="text-white hover:opacity-80 transition-opacity">
                  Get in Touch →
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Inteligencia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};