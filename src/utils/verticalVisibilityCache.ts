import type { AllVerticalSettings } from './verticalVisibility';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const BACKGROUND_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

interface CacheEntry {
  data: AllVerticalSettings | null;
  timestamp: number;
  isLoading: boolean;
  error: string | null;
}

class VerticalVisibilityCache {
  private cache: CacheEntry = {
    data: null,
    timestamp: 0,
    isLoading: false,
    error: null
  };

  private backgroundRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * Get cached data if valid, otherwise return null
   */
  public getCachedData(): AllVerticalSettings | null {
    const now = Date.now();
    if (this.cache.data && (now - this.cache.timestamp) < CACHE_DURATION) {
      return this.cache.data;
    }
    return null;
  }

  /**
   * Check if cache is valid
   */
  public isCacheValid(): boolean {
    const now = Date.now();
    return this.cache.data !== null && (now - this.cache.timestamp) < CACHE_DURATION;
  }

  /**
   * Set cached data
   */
  public setCachedData(data: AllVerticalSettings): void {
    this.cache = {
      data,
      timestamp: Date.now(),
      isLoading: false,
      error: null
    };

    // Start background refresh if not already running
    this.startBackgroundRefresh();
  }

  /**
   * Set loading state
   */
  public setLoading(isLoading: boolean): void {
    this.cache.isLoading = isLoading;
  }

  /**
   * Set error state
   */
  public setError(error: string | null): void {
    this.cache.error = error;
  }

  /**
   * Get loading state
   */
  public isLoading(): boolean {
    return this.cache.isLoading;
  }

  /**
   * Get error state
   */
  public getError(): string | null {
    return this.cache.error;
  }

  /**
   * Clear cache
   */
  public clear(): void {
    this.cache = {
      data: null,
      timestamp: 0,
      isLoading: false,
      error: null
    };

    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer);
      this.backgroundRefreshTimer = null;
    }
  }

  /**
   * Start background refresh to keep cache warm
   */
  private startBackgroundRefresh(): void {
    if (this.backgroundRefreshTimer) {
      return; // Already running
    }

    this.backgroundRefreshTimer = setInterval(async () => {
      try {
        const data = await this.fetchFromAPI();
        if (data) {
          this.setCachedData(data);
        }
      } catch (error) {
        console.warn('Background refresh failed:', error);
        // Don't clear cache on background refresh failures
      }
    }, BACKGROUND_REFRESH_INTERVAL);
  }

  /**
   * Stop background refresh
   */
  public stopBackgroundRefresh(): void {
    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer);
      this.backgroundRefreshTimer = null;
    }
  }

  /**
   * Fetch data from API
   */
  private async fetchFromAPI(): Promise<AllVerticalSettings | null> {
    const response = await fetch('/api/vertical-visibility', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.data) {
      throw new Error('Invalid API response format');
    }

    return result.data;
  }

  /**
   * Force refresh from API
   */
  public async refresh(): Promise<AllVerticalSettings> {
    this.setLoading(true);
    this.setError(null);

    try {
      const data = await this.fetchFromAPI();
      if (data) {
        this.setCachedData(data);
        return data;
      } else {
        throw new Error('No data received from API');
      }
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get data with automatic refresh if cache is stale
   */
  public async get(): Promise<AllVerticalSettings> {
    // Return cached data if valid
    const cachedData = this.getCachedData();
    if (cachedData) {
      return cachedData;
    }

    // If already loading, wait for it
    if (this.isLoading()) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!this.isLoading()) {
            clearInterval(checkInterval);
            const data = this.getCachedData();
            if (data) {
              resolve(data);
            } else {
              reject(new Error(this.getError() || 'Failed to load data'));
            }
          }
        }, 50);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Timeout waiting for data'));
        }, 10000);
      });
    }

    // Refresh from API
    return this.refresh();
  }
}

// Export singleton instance
export const verticalVisibilityCache = new VerticalVisibilityCache();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    verticalVisibilityCache.stopBackgroundRefresh();
  });
}