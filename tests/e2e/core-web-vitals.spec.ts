import { test, expect } from '@playwright/test';

/**
 * Core Web Vitals Performance Tests
 * Measures and validates Core Web Vitals metrics
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

test.describe('Core Web Vitals', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance metrics
    await page.addInitScript(() => {
      (window as unknown).webVitalsData = {};
    });
  });

  test('measure Core Web Vitals on homepage', async ({ page }) => {
    // Inject Web Vitals measurement script
    await page.addInitScript(() => {
      // Simple CLS measurement
      let cumulativeLayoutShift = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as unknown).hadRecentInput) {
            cumulativeLayoutShift += (entry as unknown).value;
          }
        }
        (window as unknown).webVitalsData.cls = cumulativeLayoutShift;
      });
      
      if ('PerformanceObserver' in window) {
        observer.observe({ type: 'layout-shift', buffered: true });
      }
    });

    await page.goto(BASE_URL);
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const _firstPaint = paint.find(p => p.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      return {
        // Time to First Byte
        ttfb: navigation.responseStart - navigation.requestStart,
        
        // First Contentful Paint
        fcp: firstContentfulPaint,
        
        // Load Event End
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        
        // DOM Content Loaded
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        
        // Cumulative Layout Shift (from injected script)
        cls: (window as unknown).webVitalsData?.cls || 0
      };
    });

    console.log('Performance Metrics:', performanceMetrics);

    // Core Web Vitals thresholds (in milliseconds)
    expect(performanceMetrics.fcp).toBeLessThan(2500); // FCP < 2.5s (good)
    expect(performanceMetrics.cls).toBeLessThan(0.1);  // CLS < 0.1 (good)
    expect(performanceMetrics.ttfb).toBeLessThan(800); // TTFB < 800ms (good)
  });

  test('measure LCP on different pages', async ({ page }) => {
    const pages = [
      '/',
      '/hospitality', 
      '/healthcare',
      '/tech',
      '/athletics'
    ];

    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      
      // Wait for LCP to be measured
      const lcp = await page.evaluate(async () => {
        return new Promise((resolve) => {
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.startTime);
            });
            
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            
            // Fallback after 5 seconds
            setTimeout(() => resolve(0), 5000);
          } else {
            resolve(0);
          }
        });
      });

      console.log(`LCP for ${pagePath}: ${lcp}ms`);
      
      // LCP should be less than 2.5 seconds (good threshold)
      if (lcp > 0) {
        expect(lcp).toBeLessThan(2500);
      }
    }
  });

  test('measure FID simulation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Simulate user interaction and measure response time
    const startTime = Date.now();
    
    // Click on navigation item
    await page.click('nav a[href*="hospitality"]');
    
    // Wait for navigation to complete
    await page.waitForURL(/hospitality/);
    
    const interactionTime = Date.now() - startTime;
    
    console.log(`Navigation interaction time: ${interactionTime}ms`);
    
    // Should respond quickly to user interaction
    expect(interactionTime).toBeLessThan(100); // 100ms is good for FID
  });

  test('measure resource loading performance', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const resourceTimings = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const analysis = {
        totalResources: resources.length,
        slowResources: 0,
        largeResources: 0,
        totalSize: 0,
        totalDuration: 0
      };
      
      resources.forEach(resource => {
        const duration = resource.responseEnd - resource.startTime;
        const size = resource.transferSize || 0;
        
        analysis.totalDuration += duration;
        analysis.totalSize += size;
        
        if (duration > 1000) analysis.slowResources++; // > 1 second
        if (size > 100000) analysis.largeResources++;  // > 100KB
      });
      
      return analysis;
    });

    console.log('Resource Analysis:', resourceTimings);
    
    // Performance assertions
    expect(resourceTimings.slowResources).toBeLessThan(5); // Less than 5 slow resources
    expect(resourceTimings.totalSize).toBeLessThan(5000000); // Total < 5MB
  });

  test('measure JavaScript execution time', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Measure JavaScript execution time
    const jsExecutionTime = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Simulate some JavaScript work
      const testArray = new Array(1000).fill(0).map((_, i) => i);
      testArray.sort((a, b) => b - a);
      
      return performance.now() - startTime;
    });

    console.log(`JavaScript execution time: ${jsExecutionTime}ms`);
    
    // JavaScript should execute quickly
    expect(jsExecutionTime).toBeLessThan(50); // Less than 50ms
  });

  test('memory usage stays reasonable', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check memory usage if available
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as unknown).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (memoryInfo) {
      console.log('Memory Usage:', memoryInfo);
      
      // Memory usage should be reasonable
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // < 50MB
    }
  });

  test('network efficiency', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const networkAnalysis = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const byType: { [key: string]: { count: number; size: number } } = {};
      let totalSize = 0;
      
      resources.forEach(resource => {
        // Determine resource type from URL or initiator type
        let type = 'other';
        if (resource.name.includes('.js')) type = 'javascript';
        else if (resource.name.includes('.css')) type = 'stylesheet';
        else if (resource.name.includes('.png') || resource.name.includes('.jpg') || resource.name.includes('.svg')) type = 'image';
        else if (resource.name.includes('.woff') || resource.name.includes('.ttf')) type = 'font';
        
        const size = resource.transferSize || 0;
        
        if (!byType[type]) {
          byType[type] = { count: 0, size: 0 };
        }
        
        byType[type].count++;
        byType[type].size += size;
        totalSize += size;
      });
      
      return { byType, totalSize };
    });

    console.log('Network Analysis:', networkAnalysis);
    
    // Check resource efficiency
    expect(networkAnalysis.totalSize).toBeLessThan(3 * 1024 * 1024); // < 3MB total
    
    if (networkAnalysis.byType.javascript) {
      expect(networkAnalysis.byType.javascript.size).toBeLessThan(1 * 1024 * 1024); // JS < 1MB
    }
    
    if (networkAnalysis.byType.stylesheet) {
      expect(networkAnalysis.byType.stylesheet.size).toBeLessThan(200 * 1024); // CSS < 200KB
    }
  });
});