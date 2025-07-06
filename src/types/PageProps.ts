import type { IndustryType, IndustryConfig } from './Industry';

export interface PageProps {
  industry: IndustryType;
  config: IndustryConfig;
}

export interface BlogPageProps extends PageProps {
  slug?: string;
}