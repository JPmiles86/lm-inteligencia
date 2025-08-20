import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { IndustryContext } from '../../contexts/IndustryContext';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import { IndustryNavbar } from './IndustryNavbar';
import { Footer } from './Footer';
import { PageLoadingSpinner } from './LoadingSpinner';
import { getCurrentSubdomain } from '../../utils/domainRedirect';
import type { IndustryType } from '../../types/Industry';

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