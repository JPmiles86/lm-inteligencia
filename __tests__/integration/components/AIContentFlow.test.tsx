/**
 * AI Content Flow Integration Tests
 * Tests the complete AI content generation workflow
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AIContentDashboard } from '../../../src/components/ai/AIContentDashboard';
import { useModalStore } from '../../../src/stores/modalStore';
import { server } from '../../mocks/server';
import { rest } from 'msw';

// Mock Zustand store
jest.mock('../../../src/stores/modalStore');

const MockedAIContentDashboard = () => (
  <BrowserRouter>
    <AIContentDashboard />
  </BrowserRouter>
);

describe('AI Content Generation Flow', () => {
  beforeEach(() => {
    // Reset modal store
    (useModalStore as jest.Mock).mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
      activeModal: null,
    });
  });

  describe('Content Generation Workflow', () => {
    it('should complete full blog generation flow', async () => {
      const user = userEvent.setup();
      
      render(<MockedAIContentDashboard />);

      // 1. Click on Blog Post generation
      const blogCard = screen.getByText(/Blog Post/i).closest('div');
      expect(blogCard).toBeInTheDocument();
      await user.click(blogCard!);

      // 2. Fill in the generation form
      await waitFor(() => {
        expect(screen.getByLabelText(/Topic/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Topic/i), 'AI in Healthcare');
      await user.type(screen.getByLabelText(/Keywords/i), 'medical, diagnosis, treatment');
      
      // Select tone
      const toneSelect = screen.getByLabelText(/Tone/i);
      await user.selectOptions(toneSelect, 'professional');

      // 3. Generate content
      const generateButton = screen.getByRole('button', { name: /Generate/i });
      await user.click(generateButton);

      // 4. Wait for content to be generated
      await waitFor(() => {
        expect(screen.getByText(/Generated Successfully/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // 5. Verify generated content is displayed
      expect(screen.getByText(/AI in Healthcare/i)).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();

      // 6. Edit the generated content
      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      const editor = screen.getByRole('textbox', { name: /Content/i });
      await user.clear(editor);
      await user.type(editor, 'Updated content about AI in Healthcare');

      // 7. Save the blog post
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Saved Successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle provider fallback during generation', async () => {
      const user = userEvent.setup();

      // Mock primary provider failure
      server.use(
        rest.post('/api/ai/generate', (req, res, ctx) => {
          const { provider } = req.body as any;
          if (provider === 'openai') {
            return res(
              ctx.status(500),
              ctx.json({ success: false, error: 'OpenAI API error' })
            );
          }
          return res(
            ctx.json({
              success: true,
              content: 'Generated with fallback provider',
              provider: 'anthropic',
            })
          );
        })
      );

      render(<MockedAIContentDashboard />);

      // Start generation
      const generateButton = screen.getByRole('button', { name: /Quick Generate/i });
      await user.click(generateButton);

      // Should show fallback notification
      await waitFor(() => {
        expect(screen.getByText(/Using fallback provider/i)).toBeInTheDocument();
      });

      // Should still generate content
      await waitFor(() => {
        expect(screen.getByText(/Generated with fallback provider/i)).toBeInTheDocument();
      });
    });

    it('should generate images for blog posts', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Navigate to blog generation
      const blogCard = screen.getByText(/Blog Post/i).closest('div');
      await user.click(blogCard!);

      // Enable image generation
      const imageToggle = screen.getByLabelText(/Include Images/i);
      await user.click(imageToggle);

      // Set image count
      const imageCount = screen.getByLabelText(/Number of Images/i);
      await user.clear(imageCount);
      await user.type(imageCount, '3');

      // Generate content with images
      const generateButton = screen.getByRole('button', { name: /Generate/i });
      await user.click(generateButton);

      // Wait for images to be generated
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
      }, { timeout: 10000 });

      // Verify image captions
      expect(screen.getByText(/Image 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Image 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Image 3/i)).toBeInTheDocument();
    });
  });

  describe('Content Enhancement', () => {
    it('should enhance existing content', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Input existing content
      const contentInput = screen.getByPlaceholderText(/Paste your content here/i);
      await user.type(contentInput, 'AI is transforming healthcare.');

      // Select enhancements
      const expandCheckbox = screen.getByLabelText(/Expand/i);
      const examplesCheckbox = screen.getByLabelText(/Add Examples/i);
      
      await user.click(expandCheckbox);
      await user.click(examplesCheckbox);

      // Enhance content
      const enhanceButton = screen.getByRole('button', { name: /Enhance/i });
      await user.click(enhanceButton);

      // Wait for enhancement
      await waitFor(() => {
        expect(screen.getByText(/Enhanced Successfully/i)).toBeInTheDocument();
      });

      // Verify enhanced content
      const enhancedContent = screen.getByRole('article');
      expect(enhancedContent.textContent).toContain('AI is transforming healthcare');
      expect(enhancedContent.textContent?.length).toBeGreaterThan(30);
    });

    it('should show enhancement diff', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Enhance content
      await user.type(
        screen.getByPlaceholderText(/Paste your content here/i),
        'Original text'
      );
      
      await user.click(screen.getByRole('button', { name: /Enhance/i }));

      // Wait for enhancement
      await waitFor(() => {
        expect(screen.getByText(/View Changes/i)).toBeInTheDocument();
      });

      // View diff
      await user.click(screen.getByText(/View Changes/i));

      // Verify diff display
      expect(screen.getByText(/Original/i)).toBeInTheDocument();
      expect(screen.getByText(/Enhanced/i)).toBeInTheDocument();
      expect(screen.getByRole('deletion')).toBeInTheDocument();
      expect(screen.getByRole('insertion')).toBeInTheDocument();
    });
  });

  describe('Template System', () => {
    it('should apply content templates', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Open template selector
      const templateButton = screen.getByRole('button', { name: /Use Template/i });
      await user.click(templateButton);

      // Select a template
      const template = screen.getByText(/Product Review Template/i);
      await user.click(template);

      // Verify template is applied
      await waitFor(() => {
        const contentArea = screen.getByRole('textbox', { name: /Content/i });
        expect(contentArea).toHaveValue(expect.stringContaining('Product Name:'));
        expect(contentArea).toHaveValue(expect.stringContaining('Pros:'));
        expect(contentArea).toHaveValue(expect.stringContaining('Cons:'));
      });

      // Fill in template fields
      const contentArea = screen.getByRole('textbox', { name: /Content/i });
      const currentValue = contentArea.getAttribute('value') || '';
      const filledTemplate = currentValue
        .replace('Product Name:', 'Product Name: AI Assistant Pro')
        .replace('Pros:', 'Pros: Fast, Accurate, User-friendly')
        .replace('Cons:', 'Cons: Expensive, Requires training');

      await user.clear(contentArea);
      await user.type(contentArea, filledTemplate);

      // Generate from template
      const generateButton = screen.getByRole('button', { name: /Generate from Template/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Review generated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Collaboration Features', () => {
    it('should save and load drafts', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Create content
      await user.type(
        screen.getByPlaceholderText(/Start writing/i),
        'Draft content for testing'
      );

      // Save as draft
      const saveDraftButton = screen.getByRole('button', { name: /Save Draft/i });
      await user.click(saveDraftButton);

      await waitFor(() => {
        expect(screen.getByText(/Draft saved/i)).toBeInTheDocument();
      });

      // Clear and reload
      const newButton = screen.getByRole('button', { name: /New/i });
      await user.click(newButton);

      // Load draft
      const loadDraftButton = screen.getByRole('button', { name: /Load Draft/i });
      await user.click(loadDraftButton);

      // Select the draft
      const draftItem = screen.getByText(/Draft content for testing/i);
      await user.click(draftItem);

      // Verify draft is loaded
      expect(screen.getByText(/Draft content for testing/i)).toBeInTheDocument();
    });

    it('should export content in multiple formats', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Generate content
      await user.type(
        screen.getByPlaceholderText(/Start writing/i),
        '# Test Content\n\nThis is **bold** and this is *italic*.'
      );

      // Open export menu
      const exportButton = screen.getByRole('button', { name: /Export/i });
      await user.click(exportButton);

      // Test different export formats
      const formats = ['Markdown', 'HTML', 'Plain Text', 'JSON'];
      
      for (const format of formats) {
        const formatButton = screen.getByText(new RegExp(format, 'i'));
        await user.click(formatButton);

        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Exported as ${format}`, 'i'))).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle generation errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock API error
      server.use(
        rest.post('/api/ai/generate', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ success: false, error: 'All providers failed' })
          );
        })
      );

      render(<MockedAIContentDashboard />);

      const generateButton = screen.getByRole('button', { name: /Generate/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Generation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/All providers failed/i)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    it('should validate inputs before generation', async () => {
      const user = userEvent.setup();

      render(<MockedAIContentDashboard />);

      // Try to generate without required fields
      const generateButton = screen.getByRole('button', { name: /Generate/i });
      await user.click(generateButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Topic is required/i)).toBeInTheDocument();
      });

      // Should not make API call
      expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    });
  });
});

export {};