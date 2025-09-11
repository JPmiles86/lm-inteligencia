// Temporary wrapper to make page components work with the new structure
// This provides the context that pages expect until we can update them properly

import React from 'react';
import { IndustryType } from '../types/Industry.js';
import type { IndustryConfig } from '../types/Industry.js';
import { IndustryContext } from '../contexts/IndustryContext.js';

interface PageWrapperProps {
  config: IndustryConfig;
  industry: IndustryType;
  children: (context: {
    config: IndustryConfig;
    industry: IndustryType;
    industryKey: string;
  }) => React.ReactNode;
}

// Create a mock context that pages expect
const createMockContext = (config: IndustryConfig, industry: IndustryType) => {
  const pathToIndustryMap: Record<string, IndustryType> = {
    hospitality: 'hospitality',
    hotels: 'hospitality',
    restaurants: 'hospitality',
    health: 'healthcare',
    healthcare: 'healthcare',
    dental: 'healthcare',
    tech: 'tech',
    sports: 'athletics'
  };
  
  const industryKey = Object.keys(pathToIndustryMap).find(
    key => pathToIndustryMap[key] === industry
  ) || 'hotels';
  
  return {
    config,
    industry,
    industryKey,
    industryPath: `/${industryKey}`
  };
};

export const PageWrapper: React.FC<PageWrapperProps> = ({ config, industry, children }) => {
  const contextValue = createMockContext(config, industry);
  
  return (
    <IndustryContext.Provider value={contextValue}>
      <div className="pt-20">
        {children(contextValue)}
      </div>
    </IndustryContext.Provider>
  );
};