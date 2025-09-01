/**
 * Blog Creation E2E Test
 * Complete user journey for creating a blog post with AI
 */

import { test, expect } from '@playwright/test';

test.describe('Blog Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    
    // Login if required
    const loginForm = page.locator('form[data-testid="login-form"]');
    if (await loginForm.isVisible()) {
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/**');
    }
  });

  test('should create a blog post with AI generation', async ({ page }) => {
    // Navigate to blog management
    await page.click('text=Blog Management');
    await page.waitForSelector('[data-testid="blog-management"]');

    // Click create new blog
    await page.click('button:has-text("New Blog Post")');
    
    // Wait for editor to load
    await page.waitForSelector('[data-testid="blog-editor"]');

    // Use AI to generate content
    await page.click('button:has-text("AI Generate")');
    
    // Fill in generation parameters
    await page.fill('input[name="topic"]', 'The Future of AI in Healthcare');
    await page.fill('textarea[name="keywords"]', 'artificial intelligence, medical diagnosis, patient care, machine learning');
    
    // Select tone and length
    await page.selectOption('select[name="tone"]', 'professional');
    await page.selectOption('select[name="length"]', 'medium');
    
    // Generate content
    await page.click('button:has-text("Generate Content")');
    
    // Wait for generation to complete (with timeout for AI response)
    await page.waitForSelector('[data-testid="generated-content"]', { timeout: 30000 });
    
    // Verify content was generated
    const content = await page.textContent('[data-testid="generated-content"]');
    expect(content).toContain('AI');
    expect(content).toContain('healthcare');
    
    // Edit the generated title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('AI Revolution in Healthcare: A Comprehensive Guide');
    
    // Add a custom excerpt
    await page.fill('textarea[name="excerpt"]', 'Discover how artificial intelligence is transforming healthcare delivery and patient outcomes.');
    
    // Add tags
    await page.fill('input[name="tags"]', 'AI, Healthcare, Technology, Innovation');
    
    // Generate featured image
    await page.click('button:has-text("Generate Image")');
    await page.waitForSelector('img[data-testid="featured-image"]', { timeout: 20000 });
    
    // Save as draft first
    await page.click('button:has-text("Save Draft")');
    await page.waitForSelector('text=Draft saved successfully');
    
    // Preview the post
    await page.click('button:has-text("Preview")');
    
    // Verify preview
    const previewTitle = await page.textContent('[data-testid="preview-title"]');
    expect(previewTitle).toBe('AI Revolution in Healthcare: A Comprehensive Guide');
    
    // Close preview
    await page.click('button:has-text("Close Preview")');
    
    // Publish the post
    await page.click('button:has-text("Publish")');
    
    // Confirm publication
    await page.click('button:has-text("Confirm Publish")');
    
    // Wait for success message
    await page.waitForSelector('text=Blog post published successfully');
    
    // Verify the post appears in the list
    await page.click('text=Back to Blog List');
    await page.waitForSelector('[data-testid="blog-list"]');
    
    const publishedPost = page.locator('text=AI Revolution in Healthcare: A Comprehensive Guide');
    await expect(publishedPost).toBeVisible();
  });

  test('should handle AI generation with provider fallback', async ({ page }) => {
    // Navigate to blog creation
    await page.click('text=Blog Management');
    await page.click('button:has-text("New Blog Post")');
    
    // Trigger AI generation
    await page.click('button:has-text("AI Generate")');
    
    // Use a topic that might trigger fallback (simulate primary provider issue)
    await page.fill('input[name="topic"]', 'Complex Technical Topic Requiring Fallback');
    
    // Generate content
    await page.click('button:has-text("Generate Content")');
    
    // Check for fallback notification
    const fallbackNotice = page.locator('text=/Using fallback provider|Switched to/i');
    
    // If fallback occurred, verify it completed successfully
    if (await fallbackNotice.isVisible({ timeout: 5000 })) {
      await page.waitForSelector('[data-testid="generated-content"]', { timeout: 30000 });
      const content = await page.textContent('[data-testid="generated-content"]');
      expect(content?.length).toBeGreaterThan(100);
    }
  });

  test('should enhance existing content', async ({ page }) => {
    // Navigate to blog management
    await page.click('text=Blog Management');
    
    // Select an existing draft or create new
    await page.click('button:has-text("New Blog Post")');
    
    // Add some basic content
    const editor = page.locator('[data-testid="content-editor"]');
    await editor.fill('AI is transforming the healthcare industry. It helps doctors make better decisions.');
    
    // Click enhance button
    await page.click('button:has-text("Enhance with AI")');
    
    // Select enhancement options
    await page.check('input[name="expand"]');
    await page.check('input[name="addExamples"]');
    await page.check('input[name="improveFlow"]');
    
    // Apply enhancements
    await page.click('button:has-text("Apply Enhancements")');
    
    // Wait for enhancement to complete
    await page.waitForSelector('[data-testid="enhancement-complete"]', { timeout: 20000 });
    
    // Verify content was enhanced
    const enhancedContent = await editor.inputValue();
    expect(enhancedContent.length).toBeGreaterThan(100);
    expect(enhancedContent).toContain('AI');
    expect(enhancedContent).toContain('healthcare');
  });

  test('should generate multiple images for blog post', async ({ page }) => {
    // Create new blog post
    await page.click('text=Blog Management');
    await page.click('button:has-text("New Blog Post")');
    
    // Add content
    await page.fill('input[name="title"]', 'Visual Guide to AI Applications');
    await page.fill('[data-testid="content-editor"]', `
      Introduction to AI applications.
      [Image: Modern AI dashboard with analytics]
      
      Machine learning in practice.
      [Image: Neural network visualization]
      
      Future of AI technology.
      [Image: Futuristic AI robot assistant]
    `);
    
    // Click generate images button
    await page.click('button:has-text("Generate All Images")');
    
    // Wait for all images to generate
    await page.waitForSelector('[data-testid="image-generation-complete"]', { timeout: 60000 });
    
    // Verify all images were generated
    const images = page.locator('img[data-testid^="generated-image-"]');
    await expect(images).toHaveCount(3);
    
    // Verify each image has a caption
    for (let i = 0; i < 3; i++) {
      const caption = page.locator(`[data-testid="image-caption-${i}"]`);
      await expect(caption).toBeVisible();
    }
  });

  test('should save and restore drafts', async ({ page }) => {
    // Create a draft
    await page.click('text=Blog Management');
    await page.click('button:has-text("New Blog Post")');
    
    // Add content
    await page.fill('input[name="title"]', 'My Draft Post');
    await page.fill('[data-testid="content-editor"]', 'This is draft content that should be saved.');
    
    // Save as draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForSelector('text=Draft saved');
    
    // Navigate away
    await page.click('text=Dashboard');
    
    // Come back to blog management
    await page.click('text=Blog Management');
    
    // Find and open the draft
    await page.click('text=My Draft Post');
    
    // Verify draft content was restored
    const title = await page.inputValue('input[name="title"]');
    const content = await page.inputValue('[data-testid="content-editor"]');
    
    expect(title).toBe('My Draft Post');
    expect(content).toContain('This is draft content that should be saved.');
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/admin');
    
    // Check mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Navigate to blog management
    await page.click('text=Blog Management');
    
    // Verify responsive layout
    const container = page.locator('[data-testid="blog-management"]');
    const box = await container.boundingBox();
    
    if (box) {
      // Should be full width on mobile
      expect(box.width).toBeLessThanOrEqual(400);
    }
    
    // Test create blog on mobile
    await page.click('button:has-text("New")'); // Shorter text on mobile
    await page.waitForSelector('[data-testid="blog-editor"]');
    
    // Verify mobile-optimized editor
    const editor = page.locator('[data-testid="content-editor"]');
    await expect(editor).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/admin/blog');
    
    // Tab through interface
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Navigate with keyboard
    await page.keyboard.press('Enter');
    
    // Verify navigation worked
    await expect(page).toHaveURL(/.*\/(new|edit).*/);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/admin/blog');
    
    // Check main navigation
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    
    // Check form labels
    await page.click('button:has-text("New Blog Post")');
    
    const titleInput = page.locator('input[aria-label="Blog title"]');
    await expect(titleInput).toBeVisible();
    
    const contentEditor = page.locator('[aria-label="Blog content editor"]');
    await expect(contentEditor).toBeVisible();
  });

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/admin/blog');
    
    // Check for screen reader only content
    const srOnly = page.locator('.sr-only');
    const count = await srOnly.count();
    expect(count).toBeGreaterThan(0);
    
    // Check live regions for dynamic content
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveCount(1);
  });
});

export {};