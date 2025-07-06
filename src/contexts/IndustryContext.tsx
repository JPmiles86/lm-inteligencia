// Industry Context for sharing industry configuration across components
// This context is used by both PageWrapper and SharedIndustryLayout

import React from 'react';
import type { IndustryConfig, IndustryType } from '../types/Industry';

interface IndustryContextValue {
  config: IndustryConfig;
  industry: IndustryType;
  industryKey: string;
  industryPath: string;
}

export const IndustryContext = React.createContext<IndustryContextValue | null>(null);

export const useIndustryContext = (): IndustryContextValue => {
  const context = React.useContext(IndustryContext);
  if (!context) {
    throw new Error('useIndustryContext must be used within IndustryContext.Provider');
  }
  return context;
};