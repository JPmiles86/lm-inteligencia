// End-to-End tests for AI Content Generation workflows
import { test, expect, Page } from '@playwright/test';

// Test data and constants
const TEST_USER = {
  email: 'test@inteligencia.com',
  password: 'test123',
};

const GENERATION_PROMPTS = {
  simple: 'Write a blog about AI in hospitality',
  complex: 'Create a comprehensive guide to implementing AI chatbots in hotels',
  research: 'Research the latest trends in healthcare AI for 2025',
  multiVertical: 'Customer service best practices',
};

// Helper functions
async function loginUser(page: Page) {
  await page.goto('/admin');
  await page.fill('[data-testid="email-input"]', TEST_USER.email);
  await page.fill('[data-testid="password-input"]', TEST_USER.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/admin/dashboard');
}

async function navigateToAIStudio(page: Page) {
  await page.click('[data-testid="ai-studio-nav"]');
  await page.waitForURL('**/admin/ai-studio');
  await expect(page.getByText('AI Content Studio')).toBeVisible();
}

async function selectProvider(page: Page, provider: string, model?: string) {
  await page.click('[data-testid="provider-selector"]');
  await page.click(`[data-testid="provider-option-${provider}"]`);
  
  if (model) {
    await page.click('[data-testid="change-model-button"]');
    await page.click(`[data-testid="model-option-${model}"]`);
  }
  
  // Wait for provider to be selected
  await expect(page.locator('[data-testid="provider-selector"]')).toContainText(provider);
}

async function waitForGenerationComplete(page: Page, timeout = 60000) {
  // Wait for generation to complete (loading indicators to disappear)
  await page.waitForSelector('[data-testid="generation-loading"]', { state: 'hidden', timeout });
  
  // Wait for content to appear
  await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout });
}

test.describe('AI Content Generation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment
    await loginUser(page);
    await navigateToAIStudio(page);
  });

  test.describe('Quick Generation Workflow', () => {
    test('should generate single blog with OpenAI', async ({ page }) => {
      // Select provider
      await selectProvider(page, 'openai', 'gpt-5');
      
      // Enter prompt
      await page.fill('[data-testid="generation-prompt"]', GENERATION_PROMPTS.simple);
      
      // Select vertical
      await page.selectOption('[data-testid="vertical-selector"]', 'hospitality');
      
      // Start generation
      await page.click('[data-testid="generate-button"]');
      
      // Wait for completion
      await waitForGenerationComplete(page);
      
      // Verify results
      const content = await page.textContent('[data-testid="generated-content"]');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(100);
      
      // Check metadata
      await expect(page.locator('[data-testid="token-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="generation-cost"]')).toBeVisible();
      await expect(page.locator('[data-testid="generation-time"]')).toBeVisible();
      
      // Verify provider info
      await expect(page.locator('[data-testid="used-provider"]')).toContainText('openai');
      await expect(page.locator('[data-testid="used-model"]')).toContainText('gpt-5');
    });

    test('should generate multiple title variations', async ({ page }) => {
      // Switch to title generation mode
      await page.selectOption('[data-testid="task-selector"]', 'title_generation');
      
      // Select provider
      await selectProvider(page, 'anthropic', 'claude-sonnet-4');
      
      // Enter prompt
      await page.fill('[data-testid="generation-prompt"]', 'Generate titles for a blog about hotel customer service');
      
      // Set output count to 5
      await page.fill('[data-testid="output-count"]', '5');
      
      // Generate
      await page.click('[data-testid="generate-button"]');
      
      // Wait for completion
      await waitForGenerationComplete(page);
      
      // Verify 5 title options
      const titleOptions = page.locator('[data-testid="title-option"]');
      await expect(titleOptions).toHaveCount(5);
      
      // Each title should be unique
      const titles = await titleOptions.allTextContents();
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(5);
      
      // Should be able to select different titles
      await page.click('[data-testid="title-option"]:nth-child(3)');
      await expect(page.locator('[data-testid="selected-title"]')).toContainText(titles[2]);
    });

    test('should handle generation errors gracefully', async ({ page }) => {
      // Try to use a non-existent provider (simulate error)
      await page.evaluate(() => {
        // Mock a provider failure
        window.__mockProviderFailure = true;
      });
      
      await page.fill('[data-testid="generation-prompt"]', 'Test error handling');
      await page.click('[data-testid="generate-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/generation failed|error occurred/i);
      
      // Should offer retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Should not have generated content
      await expect(page.locator('[data-testid="generated-content"]')).not.toBeVisible();
    });
  });

  test.describe('Structured Generation Workflow', () => {
    test('should complete full blog creation workflow', async ({ page }) => {
      // Switch to structured mode
      await page.click('[data-testid="mode-structured"]');
      
      // Select task
      await page.selectOption('[data-testid="task-selector"]', 'blog_complete');
      
      // Enter initial idea
      await page.fill('[data-testid="generation-prompt"]', GENERATION_PROMPTS.complex);
      
      // Select vertical and provider
      await page.selectOption('[data-testid="vertical-selector"]', 'hospitality');
      await selectProvider(page, 'anthropic');
      
      // Start workflow
      await page.click('[data-testid="start-workflow-button"]');
      
      // Step 1: Idea Development
      await page.waitForSelector('[data-testid="workflow-step-idea"]');
      await expect(page.locator('[data-testid="step-idea"] [data-testid="step-status"]')).toContainText('In Progress');
      
      await waitForGenerationComplete(page);
      await expect(page.locator('[data-testid="step-idea"] [data-testid="step-status"]')).toContainText('Complete');
      
      // Continue to next step
      await page.click('[data-testid="continue-to-titles"]');
      
      // Step 2: Title Generation
      await page.waitForSelector('[data-testid="workflow-step-title"]');
      await waitForGenerationComplete(page);
      
      // Should show multiple title options
      const titleOptions = page.locator('[data-testid="title-option"]');
      await expect(titleOptions).toHaveCount.toBeGreaterThan(1);
      
      // Select a title
      await titleOptions.first().click();
      await page.click('[data-testid="continue-to-synopsis"]');
      
      // Step 3: Synopsis Creation
      await page.waitForSelector('[data-testid="workflow-step-synopsis"]');
      await waitForGenerationComplete(page);
      
      const synopsis = await page.textContent('[data-testid="generated-synopsis"]');
      expect(synopsis).toBeTruthy();
      expect(synopsis!.length).toBeGreaterThan(50);
      
      // Continue to final blog
      await page.click('[data-testid="continue-to-blog"]');
      
      // Step 4: Full Blog Generation
      await page.waitForSelector('[data-testid="workflow-step-blog"]');
      await waitForGenerationComplete(page, 120000); // Extended timeout for full blog
      
      // Verify complete blog
      const blogContent = await page.textContent('[data-testid="generated-blog"]');
      expect(blogContent).toBeTruthy();
      expect(blogContent!.length).toBeGreaterThan(1000);
      
      // Check for proper blog structure
      await expect(page.locator('[data-testid="generated-blog"]')).toContainText(/introduction|overview/i);
      await expect(page.locator('[data-testid="generated-blog"]')).toContainText(/conclusion|summary/i);
      
      // Verify workflow completion
      await expect(page.locator('[data-testid="workflow-complete"]')).toBeVisible();
    });

    test('should allow skipping optional steps', async ({ page }) => {
      await page.click('[data-testid="mode-structured"]');
      
      // Configure workflow to skip synopsis and outline
      await page.click('[data-testid="workflow-config"]');
      await page.uncheck('[data-testid="include-synopsis"]');
      await page.uncheck('[data-testid="include-outline"]');
      await page.click('[data-testid="save-config"]');
      
      await page.fill('[data-testid="generation-prompt"]', 'Quick blog about hotel technology');
      await page.click('[data-testid="start-workflow-button"]');
      
      // Should go directly from idea to title to blog
      await waitForGenerationComplete(page);
      await page.click('[data-testid="continue-to-titles"]');
      
      await waitForGenerationComplete(page);
      await page.locator('[data-testid="title-option"]').first().click();
      await page.click('[data-testid="continue-to-blog"]'); // Should skip synopsis
      
      // Verify skipped steps
      await expect(page.locator('[data-testid="step-synopsis"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="step-outline"]')).not.toBeVisible();
      
      await waitForGenerationComplete(page, 90000);
      await expect(page.locator('[data-testid="generated-blog"]')).toBeVisible();
    });
  });

  test.describe('Multi-Vertical Generation', () => {
    test('should generate content for multiple verticals in parallel', async ({ page }) => {
      // Switch to multi-vertical mode
      await page.click('[data-testid="mode-multi-vertical"]');
      
      // Select multiple verticals
      await page.click('[data-testid="vertical-hospitality"]');
      await page.click('[data-testid="vertical-healthcare"]');
      await page.click('[data-testid="vertical-tech"]');
      
      // Select parallel mode
      await page.selectOption('[data-testid="vertical-mode"]', 'parallel');
      
      // Enter prompt
      await page.fill('[data-testid="generation-prompt"]', GENERATION_PROMPTS.multiVertical);
      
      // Select provider
      await selectProvider(page, 'anthropic');
      
      // Start generation
      await page.click('[data-testid="generate-multi-vertical"]');
      
      // Wait for all verticals to complete
      await waitForGenerationComplete(page, 180000); // Extended timeout for multiple generations
      
      // Verify results for each vertical
      const verticals = ['hospitality', 'healthcare', 'tech'];
      
      for (const vertical of verticals) {
        const tabButton = page.locator(`[data-testid="vertical-tab-${vertical}"]`);
        await expect(tabButton).toBeVisible();
        
        await tabButton.click();
        
        const content = page.locator(`[data-testid="content-${vertical}"]`);
        await expect(content).toBeVisible();
        
        const contentText = await content.textContent();
        expect(contentText).toBeTruthy();
        expect(contentText!.length).toBeGreaterThan(200);
      }
      
      // Verify content is different for each vertical
      await page.click('[data-testid="vertical-tab-hospitality"]');
      const hospitalityContent = await page.textContent('[data-testid="content-hospitality"]');
      
      await page.click('[data-testid="vertical-tab-healthcare"]');
      const healthcareContent = await page.textContent('[data-testid="content-healthcare"]');
      
      expect(hospitalityContent).not.toBe(healthcareContent);
    });

    test('should generate content sequentially with adaptation', async ({ page }) => {
      await page.click('[data-testid="mode-multi-vertical"]');
      
      // Select verticals
      await page.click('[data-testid="vertical-hospitality"]');
      await page.click('[data-testid="vertical-tech"]');
      
      // Select sequential mode
      await page.selectOption('[data-testid="vertical-mode"]', 'sequential');
      
      await page.fill('[data-testid="generation-prompt"]', 'Digital transformation strategies');
      
      await page.click('[data-testid="generate-multi-vertical"]');
      
      // Should show progress for each vertical
      await expect(page.locator('[data-testid="progress-hospitality"]')).toBeVisible();
      await page.waitForSelector('[data-testid="progress-hospitality"][data-status="completed"]');
      
      await expect(page.locator('[data-testid="progress-tech"]')).toBeVisible();
      await page.waitForSelector('[data-testid="progress-tech"][data-status="completed"]');
      
      // Verify both contents exist and are related but adapted
      await page.click('[data-testid="vertical-tab-hospitality"]');
      const hospitalityContent = await page.textContent('[data-testid="content-hospitality"]');
      
      await page.click('[data-testid="vertical-tab-tech"]');
      const techContent = await page.textContent('[data-testid="content-tech"]');
      
      expect(hospitalityContent).toContain('hotel');
      expect(techContent).toContain('technology');
    });
  });

  test.describe('Context and Style Guide Integration', () => {
    test('should apply style guides to generation', async ({ page }) => {
      // First, create a custom style guide
      await page.goto('/admin/ai-studio/style-guides');
      await page.click('[data-testid="create-style-guide"]');
      
      await page.fill('[data-testid="style-guide-name"]', 'Test Professional Style');
      await page.selectOption('[data-testid="style-guide-type"]', 'writing_style');
      await page.fill('[data-testid="style-guide-content"]', 'Write in a formal, professional tone with technical depth. Use industry terminology and provide detailed examples.');
      
      await page.click('[data-testid="save-style-guide"]');
      
      // Go back to generation
      await page.goto('/admin/ai-studio');
      
      // Open context modal
      await page.click('[data-testid="add-context-button"]');
      
      // Select the custom style guide
      await page.click('[data-testid="style-guides-tab"]');
      await page.check('[data-testid="style-guide-test-professional-style"]');
      
      await page.click('[data-testid="add-context"]');
      
      // Generate content
      await page.fill('[data-testid="generation-prompt"]', 'Write about artificial intelligence implementation');
      await page.click('[data-testid="generate-button"]');
      
      await waitForGenerationComplete(page);
      
      // Verify style was applied (content should be more formal/technical)
      const content = await page.textContent('[data-testid="generated-content"]');
      expect(content).toMatch(/implementation|technical|professional|industry/i);
    });

    test('should include previous content as context', async ({ page }) => {
      // First generate a base blog
      await page.fill('[data-testid="generation-prompt"]', 'Introduction to hotel AI systems');
      await page.click('[data-testid="generate-button"]');
      await waitForGenerationComplete(page);
      
      // Save this generation
      await page.click('[data-testid="save-generation"]');
      
      // Start new generation with previous content
      await page.click('[data-testid="new-generation"]');
      
      // Open context modal
      await page.click('[data-testid="add-context-button"]');
      
      // Select previous content
      await page.click('[data-testid="previous-content-tab"]');
      await page.selectOption('[data-testid="content-filter"]', 'last_5');
      await page.check('[data-testid="previous-blog-0"]'); // Most recent
      
      // Configure what to include
      await page.check('[data-testid="include-titles"]');
      await page.check('[data-testid="include-content"]');
      
      await page.click('[data-testid="add-context"]');
      
      // Generate follow-up content
      await page.fill('[data-testid="generation-prompt"]', 'Advanced AI implementation strategies');
      await page.click('[data-testid="generate-button"]');
      
      await waitForGenerationComplete(page);
      
      // New content should reference or build upon previous content
      const newContent = await page.textContent('[data-testid="generated-content"]');
      expect(newContent).toMatch(/previous|mentioned|discussed|building|advanced/i);
    });
  });

  test.describe('Generation Tree Navigation', () => {
    test('should navigate generation history and alternatives', async ({ page }) => {
      // Generate multiple alternatives
      await page.fill('[data-testid="generation-prompt"]', 'Marketing automation for hotels');
      await page.fill('[data-testid="output-count"]', '3');
      await page.click('[data-testid="generate-button"]');
      
      await waitForGenerationComplete(page);
      
      // Should show tree view
      await expect(page.locator('[data-testid="generation-tree"]')).toBeVisible();
      
      // Should have 3 alternative nodes
      const alternatives = page.locator('[data-testid="tree-node"][data-type="alternative"]');
      await expect(alternatives).toHaveCount(3);
      
      // Click on different alternatives
      await alternatives.nth(1).click();
      const content1 = await page.textContent('[data-testid="generated-content"]');
      
      await alternatives.nth(2).click();
      const content2 = await page.textContent('[data-testid="generated-content"]');
      
      expect(content1).not.toBe(content2);
      
      // Should be able to create a branch from any alternative
      await alternatives.nth(0).click();
      await page.click('[data-testid="create-branch"]');
      
      await page.fill('[data-testid="branch-modifications"]', 'Make it more technical');
      await page.click('[data-testid="generate-branch"]');
      
      await waitForGenerationComplete(page);
      
      // Tree should now show the branch
      await expect(page.locator('[data-testid="tree-node"][data-type="branch"]')).toBeVisible();
    });

    test('should handle generation tree cleanup', async ({ page }) => {
      // Generate content with multiple steps
      await page.click('[data-testid="mode-structured"]');
      await page.fill('[data-testid="generation-prompt"]', 'Test cleanup workflow');
      await page.click('[data-testid="start-workflow-button"]');
      
      // Complete a few steps
      await waitForGenerationComplete(page);
      await page.click('[data-testid="continue-to-titles"]');
      await waitForGenerationComplete(page);
      
      // Tree should show multiple nodes
      const treeNodes = page.locator('[data-testid="tree-node"]');
      await expect(treeNodes).toHaveCount.toBeGreaterThan(1);
      
      // Open cleanup options
      await page.click('[data-testid="tree-cleanup"]');
      
      // Select cleanup strategy
      await page.selectOption('[data-testid="cleanup-strategy"]', 'keep_final_only');
      await page.click('[data-testid="confirm-cleanup"]');
      
      // Should reduce number of nodes
      const remainingNodes = page.locator('[data-testid="tree-node"]');
      await expect(remainingNodes).toHaveCount.toBeLessThan(await treeNodes.count());
    });
  });

  test.describe('Publishing and Export', () => {
    test('should publish generated blog to CMS', async ({ page }) => {
      // Generate a complete blog
      await page.fill('[data-testid="generation-prompt"]', GENERATION_PROMPTS.complex);
      await page.selectOption('[data-testid="vertical-selector"]', 'hospitality');
      await page.click('[data-testid="generate-button"]');
      
      await waitForGenerationComplete(page, 90000);
      
      // Review and edit if needed
      const content = await page.textContent('[data-testid="generated-content"]');
      expect(content!.length).toBeGreaterThan(500);
      
      // Open publish modal
      await page.click('[data-testid="publish-blog-button"]');
      
      // Fill in blog metadata
      await page.fill('[data-testid="blog-title"]', 'AI Chatbot Implementation Guide');
      await page.selectOption('[data-testid="blog-category"]', 'Technology');
      await page.fill('[data-testid="meta-description"]', 'Complete guide to implementing AI chatbots in hotels');
      await page.fill('[data-testid="keywords"]', 'AI, chatbots, hotels, automation');
      
      // Set publish options
      await page.selectOption('[data-testid="publish-status"]', 'published');
      await page.selectOption('[data-testid="blog-vertical"]', 'hospitality');
      
      // Publish
      await page.click('[data-testid="confirm-publish"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="publish-success"]')).toBeVisible();
      
      // Should redirect to blog management
      await expect(page).toHaveURL(/blog-management/);
      
      // Verify blog appears in list
      await expect(page.locator('[data-testid="blog-list"]')).toContainText('AI Chatbot Implementation Guide');
    });

    test('should export content in multiple formats', async ({ page }) => {
      await page.fill('[data-testid="generation-prompt"]', 'Export test content');
      await page.click('[data-testid="generate-button"]');
      await waitForGenerationComplete(page);
      
      // Open export options
      await page.click('[data-testid="export-button"]');
      
      // Test different export formats
      const formats = ['markdown', 'html', 'docx', 'pdf'];
      
      for (const format of formats) {
        const downloadPromise = page.waitForEvent('download');
        
        await page.click(`[data-testid="export-${format}"]`);
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(new RegExp(`\\.(${format}|${format.toLowerCase()})$`));
      }
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should handle long-running generations', async ({ page }) => {
      // Set a very detailed prompt that will take time
      const longPrompt = `Write a comprehensive, detailed analysis of implementing AI systems in the hospitality industry. Include:
        1. Technical architecture considerations
        2. Integration challenges with existing systems
        3. Staff training requirements
        4. Customer experience implications
        5. ROI analysis and metrics
        6. Case studies from major hotel chains
        7. Future trends and predictions
        8. Implementation roadmap
        Please provide detailed explanations for each section with specific examples.`;
      
      await page.fill('[data-testid="generation-prompt"]', longPrompt);
      await page.selectOption('[data-testid="task-selector"]', 'blog_writing_complete');
      
      // Start generation
      await page.click('[data-testid="generate-button"]');
      
      // Should show progress indicators
      await expect(page.locator('[data-testid="generation-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="estimated-time"]')).toBeVisible();
      
      // Should be able to cancel if needed
      await expect(page.locator('[data-testid="cancel-generation"]')).toBeVisible();
      
      // Wait for completion (extended timeout)
      await waitForGenerationComplete(page, 300000); // 5 minutes max
      
      // Verify comprehensive content was generated
      const content = await page.textContent('[data-testid="generated-content"]');
      expect(content!.length).toBeGreaterThan(2000);
      expect(content).toContain('architecture');
      expect(content).toContain('implementation');
      expect(content).toContain('ROI');
    });

    test('should recover from network interruptions', async ({ page }) => {
      await page.fill('[data-testid="generation-prompt"]', 'Network recovery test');
      
      // Start generation
      await page.click('[data-testid="generate-button"]');
      
      // Simulate network interruption
      await page.route('**/api/ai/generate', route => route.abort());
      
      // Should show error state
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Restore network and retry
      await page.unroute('**/api/ai/generate');
      await page.click('[data-testid="retry-button"]');
      
      // Should complete successfully
      await waitForGenerationComplete(page);
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible();
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work correctly in ${browserName}`, async ({ page }) => {
        // Basic functionality test for each browser
        await page.fill('[data-testid="generation-prompt"]', `Browser test for ${browserName}`);
        await page.selectOption('[data-testid="vertical-selector"]', 'tech');
        
        await page.click('[data-testid="generate-button"]');
        await waitForGenerationComplete(page);
        
        // Verify core functionality works
        await expect(page.locator('[data-testid="generated-content"]')).toBeVisible();
        
        const content = await page.textContent('[data-testid="generated-content"]');
        expect(content).toBeTruthy();
        expect(content!.length).toBeGreaterThan(50);
        
        // Test UI interactions
        await page.click('[data-testid="provider-selector"]');
        await expect(page.locator('[data-testid="provider-dropdown"]')).toBeVisible();
        
        // Test responsive design
        await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
        await expect(page.locator('[data-testid="ai-studio-layout"]')).toBeVisible();
        
        await page.setViewportSize({ width: 375, height: 667 }); // Mobile
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      });
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab'); // Should focus first interactive element
      
      // Navigate to prompt input
      let focused = page.locator(':focus');
      await page.keyboard.press('Tab');
      
      // Should be able to reach generation prompt
      for (let i = 0; i < 10; i++) {
        focused = page.locator(':focus');
        const tagName = await focused.evaluate(el => el.tagName.toLowerCase());
        const placeholder = await focused.getAttribute('placeholder');
        
        if (placeholder?.includes('prompt') || tagName === 'textarea') {
          break;
        }
        await page.keyboard.press('Tab');
      }
      
      // Type in prompt
      await page.keyboard.type('Accessibility test content');
      
      // Navigate to generate button and activate
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Verify generation works with keyboard only
      await waitForGenerationComplete(page);
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible();
    });

    test('should have proper ARIA labels and screen reader support', async ({ page }) => {
      // Check main elements have proper ARIA labels
      await expect(page.locator('[data-testid="generation-prompt"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="generate-button"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="provider-selector"]')).toHaveAttribute('aria-label');
      
      // Check loading states have proper announcements
      await page.fill('[data-testid="generation-prompt"]', 'Screen reader test');
      await page.click('[data-testid="generate-button"]');
      
      // Should have live region for status updates
      await expect(page.locator('[aria-live="polite"]')).toBeVisible();
      
      await waitForGenerationComplete(page);
      
      // Generated content should be properly labeled
      await expect(page.locator('[data-testid="generated-content"]')).toHaveAttribute('role', 'region');
      await expect(page.locator('[data-testid="generated-content"]')).toHaveAttribute('aria-label');
    });
  });
});