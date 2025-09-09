/**
 * Vertical Visibility Configuration
 * Controls which verticals are shown on the main landing page and in navigation
 */

export type VerticalType = 'hospitality' | 'healthcare' | 'tech' | 'athletics';

export interface EnabledVerticalsConfig {
  development: VerticalType[];
  production: VerticalType[];
}

export const ENABLED_VERTICALS: EnabledVerticalsConfig = {
  // In development, show all available verticals for testing
  development: ['hospitality', 'healthcare', 'tech', 'athletics'],
  
  // In production, only show these two active verticals
  production: ['hospitality', 'healthcare']
};

/**
 * Get the enabled verticals based on current environment
 */
export function getEnabledVerticals(): VerticalType[] {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? ENABLED_VERTICALS.development : ENABLED_VERTICALS.production;
}

/**
 * Check if a vertical is currently enabled
 */
export function isVerticalEnabled(vertical: VerticalType): boolean {
  const enabledVerticals = getEnabledVerticals();
  return enabledVerticals.includes(vertical);
}

/**
 * Get the count of enabled verticals
 */
export function getEnabledVerticalCount(): number {
  return getEnabledVerticals().length;
}