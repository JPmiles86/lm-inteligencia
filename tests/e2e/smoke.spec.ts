import { test, expect } from '@playwright/test';

/**
 * Smoke Tests for Production Deployment
 * Quick validation tests to ensure basic functionality works after deployment
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Inteligencia/i);
    
    // Check for essential elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('industry pages load successfully', async ({ page }) => {
    const industries = ['hospitality', 'healthcare', 'tech', 'athletics'];
    
    for (const industry of industries) {
      await page.goto(`${BASE_URL}/${industry}`);
      
      // Check that the page loads
      await expect(page).toHaveTitle(new RegExp(industry, 'i'));
      
      // Check for industry-specific content
      await expect(page.locator('main')).toContainText(new RegExp(industry, 'i'));
      
      // Check navigation works
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('blog listing loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Check basic structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/blog/i);
  });

  test('contact forms are accessible', async ({ page }) => {
    const industries = ['hospitality', 'healthcare', 'tech', 'athletics'];
    
    for (const industry of industries) {
      await page.goto(`${BASE_URL}/${industry}/contact`);
      
      // Check form elements exist
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    }
  });

  test('navigation between pages works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test navigation to different industries
    await page.click('nav a[href*="hospitality"]');
    await expect(page).toHaveURL(/hospitality/);
    
    await page.click('nav a[href*="healthcare"]');  
    await expect(page).toHaveURL(/healthcare/);
    
    await page.click('nav a[href*="tech"]');
    await expect(page).toHaveURL(/tech/);
    
    await page.click('nav a[href*="athletics"]');
    await expect(page).toHaveURL(/athletics/);
  });

  test('api health check passes', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/health`);
    expect(response.status()).toBe(200);
  });

  test('ai api endpoints are accessible', async ({ page }) => {
    // Test providers endpoint
    const providersResponse = await page.request.get(`${BASE_URL}/api/ai/providers`);
    expect(providersResponse.status()).toBe(200);
    
    const providers = await providersResponse.json();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  test('no javascript errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Allow for minor warnings but no critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('favicon') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('essential css styles are loaded', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check that main elements have expected styling
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const headerBg = await header.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    
    // Should not be the default transparent/white
    expect(headerBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(headerBg).not.toBe('rgb(255, 255, 255)');
  });

  test('responsive design works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
    
    // Test tablet viewport  
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('images load correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check for broken images
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        const naturalWidth = await img.evaluate(img => (img as HTMLImageElement).naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });
});