import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { IndustryContext } from '../../contexts/IndustryContext.js';
import { useIndustryConfig } from '../../hooks/useIndustryConfig.js';
import { IndustryNavbar } from './IndustryNavbar.js';
import { Footer } from './Footer.js';
import { PageLoadingSpinner } from './LoadingSpinner.js';
import { getCurrentSubdomain } from '../../utils/domainRedirect.js';
import type { IndustryType } from '../../types/Industry.js';

const industryPathMap: Record<string, IndustryType> = {
  hospitality: 'hospitality',
  hotels: 'hospitality',
  restaurants: 'hospitality',
  health: 'healthcare',
  healthcare: 'healthcare',
  dental: 'healthcare',
  tech: 'tech',
  athletics: 'athletics',
  sports: 'athletics'
};

export const SharedIndustryLayout: React.FC = () => {
  const { industry: industryParam } = useParams();
  const industry = industryPathMap[industryParam || ''] || 'hospitality';
  const { config, loading } = useIndustryConfig(industry);
  
  // Check if we're on a subdomain to determine URL prefix
  const subdomain = getCurrentSubdomain();
  const isOnHospitalitySubdomain = subdomain === 'hospitality';

  if (loading || !config) {
    return <PageLoadingSpinner />;
  }

  const contextValue = {
    config,
    industry,
    industryKey: industryParam || 'hospitality',
    // Use empty path on hospitality subdomain, otherwise use industry-prefixed path
    industryPath: isOnHospitalitySubdomain ? '' : `/${industryParam || 'hospitality'}`
  };

  return (
    <IndustryContext.Provider value={contextValue}>
      <div className="min-h-screen bg-white">
        <IndustryNavbar />
        <main>
          <Outlet />
        </main>
        <Footer selectedIndustry={industry} />
      </div>
    </IndustryContext.Provider>
  );
};