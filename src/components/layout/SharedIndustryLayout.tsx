import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { IndustryContext } from '../../contexts/IndustryContext';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import { IndustryNavbar } from './IndustryNavbar';
import { Footer } from './Footer';
import { PageLoadingSpinner } from './LoadingSpinner';
import type { IndustryType } from '../../types/Industry';

const industryPathMap: Record<string, IndustryType> = {
  hospitality: 'hospitality',
  hotels: 'hospitality',
  foodservice: 'foodservice',
  restaurants: 'foodservice',
  healthcare: 'healthcare',
  athletics: 'athletics',
  sports: 'athletics'
};

export const SharedIndustryLayout: React.FC = () => {
  const { industry: industryParam } = useParams();
  const industry = industryPathMap[industryParam || ''] || 'hospitality';
  const { config, loading } = useIndustryConfig(industry);

  if (loading || !config) {
    return <PageLoadingSpinner />;
  }

  const contextValue = {
    config,
    industry,
    industryKey: industryParam || 'hospitality',
    industryPath: `/${industryParam || 'hospitality'}`
  };

  return (
    <IndustryContext.Provider value={contextValue}>
      <div className="min-h-screen bg-white">
        <IndustryNavbar />
        <main className="pt-20">
          <Outlet />
        </main>
        <Footer selectedIndustry={industry} />
      </div>
    </IndustryContext.Provider>
  );
};