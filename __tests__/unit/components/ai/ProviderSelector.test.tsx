// Unit tests for ProviderSelector component - AI provider selection interface
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProviderSelector } from '../../../../src/components/ai/components/ProviderSelector';
import { useAIStore } from '../../../../src/store/aiStore';

// Mock the AI store
jest.mock('../../../../src/store/aiStore', () => ({
  useAIStore: jest.fn(),
}));

const mockUseAIStore = useAIStore as jest.MockedFunction<typeof useAIStore>;

describe('ProviderSelector', () => {
  // Mock store data
  const mockProviders = {
    openai: {
      name: 'OpenAI',
      active: true,
      usageLimit: 100,
      currentUsage: 25,
      defaultModel: 'gpt-5',
      models: [
        {
          id: 'gpt-5',
          name: 'GPT-5',
          contextWindow: 128000,
          pricing: { input: 0.00001, output: 0.00003 },
          bestFor: ['writing', 'analysis', 'coding'],
        },
        {
          id: 'gpt-4.1',
          name: 'GPT-4.1',
          contextWindow: 32000,
          pricing: { input: 0.000005, output: 0.000015 },
          bestFor: ['general', 'chat'],
        },
      ],
    },
    anthropic: {
      name: 'Anthropic',
      active: true,
      usageLimit: 150,
      currentUsage: 75,
      defaultModel: 'claude-sonnet-4',
      models: [
        {
          id: 'claude-sonnet-4',
          name: 'Claude Sonnet 4',
          contextWindow: 200000,
          pricing: { input: 0.000008, output: 0.000024 },
          bestFor: ['writing', 'research', 'analysis'],
        },
        {
          id: 'claude-haiku-3',
          name: 'Claude Haiku 3',
          contextWindow: 200000,
          pricing: { input: 0.000003, output: 0.000009 },
          bestFor: ['speed', 'simple tasks'],
        },
      ],
    },
    google: {
      name: 'Google',
      active: false,
      usageLimit: 200,
      currentUsage: 180,
      defaultModel: 'gemini-2.5-pro',
      models: [
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          contextWindow: 1000000,
          pricing: { input: 0.000007, output: 0.000021 },
          bestFor: ['multimodal', 'code', 'reasoning'],
        },
      ],
    },
  };

  const mockStoreState = {
    providers: mockProviders,
    activeProvider: 'openai',
    activeModel: 'gpt-5',
    setActiveProvider: jest.fn(),
    setActiveModel: jest.fn(),
    addNotification: jest.fn(),
  };

  beforeEach(() => {
    mockUseAIStore.mockReturnValue(mockStoreState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with current provider and model', () => {
      render(<ProviderSelector />);
      
      expect(screen.getByText('openai')).toBeInTheDocument();
      expect(screen.getByText('GPT-5')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument(); // OpenAI icon
    });

    it('should display usage indicator for current provider', () => {
      render(<ProviderSelector />);
      
      // Should show usage bar (25/100 = 25%)
      const usageBar = document.querySelector('[style*="width: 25%"]');
      expect(usageBar).toBeInTheDocument();
      expect(usageBar).toHaveClass('bg-green-500'); // Under 50% should be green
    });

    it('should handle provider without usage limit', () => {
      const stateWithoutLimits = {
        ...mockStoreState,
        providers: {
          ...mockProviders,
          openai: {
            ...mockProviders.openai,
            usageLimit: undefined,
            currentUsage: undefined,
          },
        },
      };
      
      mockUseAIStore.mockReturnValue(stateWithoutLimits);
      render(<ProviderSelector />);
      
      // Should not display usage indicator
      expect(document.querySelector('[style*="width:"]')).not.toBeInTheDocument();
    });
  });

  describe('Provider Selection Dropdown', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      expect(screen.getByText('AI Providers')).toBeInTheDocument();
      expect(screen.getByText('anthropic')).toBeInTheDocument();
      expect(screen.getByText('google')).toBeInTheDocument();
    });

    it('should display correct provider information in dropdown', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      // Check provider models count
      expect(screen.getByText('2 models')).toBeInTheDocument(); // OpenAI has 2 models
      
      // Check usage percentages
      expect(screen.getByText('25%')).toBeInTheDocument(); // OpenAI usage
      expect(screen.getByText('50%')).toBeInTheDocument(); // Anthropic usage (75/150)
      expect(screen.getByText('90%')).toBeInTheDocument(); // Google usage (180/200)
    });

    it('should show active/inactive status indicators', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      // Should show active indicators (Zap icons) for active providers
      const activeIndicators = document.querySelectorAll('[data-lucide="zap"]');
      expect(activeIndicators).toHaveLength(2); // OpenAI and Anthropic are active
      
      // Should show warning indicator for inactive provider
      const warningIndicators = document.querySelectorAll('[data-lucide="alert-triangle"]');
      expect(warningIndicators).toHaveLength(1); // Google is inactive
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ProviderSelector />
          <button>Outside Button</button>
        </div>
      );
      
      // Open dropdown
      const providerButton = screen.getByRole('button', { name: /openai/i });
      await user.click(providerButton);
      expect(screen.getByText('AI Providers')).toBeInTheDocument();
      
      // Click outside
      const outsideButton = screen.getByRole('button', { name: /outside/i });
      await user.click(outsideButton);
      
      // Dropdown should close (this would require implementing click outside logic)
      await waitFor(() => {
        expect(screen.queryByText('AI Providers')).not.toBeInTheDocument();
      });
    });
  });

  describe('Provider Selection Logic', () => {
    it('should change provider and model when selected', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      // Open dropdown
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      // Select Anthropic
      const anthropicButton = screen.getByRole('button', { name: /anthropic/i });
      await user.click(anthropicButton);
      
      expect(mockStoreState.setActiveProvider).toHaveBeenCalledWith('anthropic');
      expect(mockStoreState.setActiveModel).toHaveBeenCalledWith('claude-sonnet-4');
      expect(mockStoreState.addNotification).toHaveBeenCalledWith({
        type: 'info',
        title: 'Provider Changed',
        message: 'Switched to anthropic',
        duration: 2000,
      });
    });

    it('should use first model if no default model specified', async () => {
      const stateWithoutDefault = {
        ...mockStoreState,
        providers: {
          ...mockProviders,
          anthropic: {
            ...mockProviders.anthropic,
            defaultModel: undefined,
          },
        },
      };
      
      mockUseAIStore.mockReturnValue(stateWithoutDefault);
      
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      const anthropicButton = screen.getByRole('button', { name: /anthropic/i });
      await user.click(anthropicButton);
      
      expect(mockStoreState.setActiveModel).toHaveBeenCalledWith('claude-sonnet-4'); // First model
    });
  });

  describe('Model Selection Modal', () => {
    it('should open model selector when "Change Model" is clicked', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      // Open provider dropdown
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      // Click change model
      const changeModelButton = screen.getByText('Change Model');
      await user.click(changeModelButton);
      
      expect(screen.getByText('Select Model - openai')).toBeInTheDocument();
      expect(screen.getByText('GPT-5')).toBeInTheDocument();
      expect(screen.getByText('GPT-4.1')).toBeInTheDocument();
    });

    it('should display model details in modal', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      const changeModelButton = screen.getByText('Change Model');
      await user.click(changeModelButton);
      
      // Check model details
      expect(screen.getByText('128,000 tokens • $0.010/1K in • $0.030/1K out')).toBeInTheDocument();
      expect(screen.getByText('32,000 tokens • $0.005/1K in • $0.015/1K out')).toBeInTheDocument();
      
      // Check best for tags
      expect(screen.getByText('writing')).toBeInTheDocument();
      expect(screen.getByText('analysis')).toBeInTheDocument();
      expect(screen.getByText('coding')).toBeInTheDocument();
    });

    it('should change model when selected in modal', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      // Open provider dropdown and then model modal
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      const changeModelButton = screen.getByText('Change Model');
      await user.click(changeModelButton);
      
      // Select different model
      const gpt41Button = screen.getByRole('button', { name: /gpt-4\.1/i });
      await user.click(gpt41Button);
      
      expect(mockStoreState.setActiveModel).toHaveBeenCalledWith('gpt-4.1');
      expect(mockStoreState.addNotification).toHaveBeenCalledWith({
        type: 'info',
        title: 'Model Changed',
        message: 'Switched to GPT-4.1',
        duration: 2000,
      });
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      const changeModelButton = screen.getByText('Change Model');
      await user.click(changeModelButton);
      
      expect(screen.getByText('Select Model - openai')).toBeInTheDocument();
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(screen.queryByText('Select Model - openai')).not.toBeInTheDocument();
    });
  });

  describe('Usage Indicators and Colors', () => {
    it('should show correct usage colors based on percentage', () => {
      render(<ProviderSelector />);
      
      // Test usage color calculation
      const component = new (ProviderSelector as unknown as new () => { getUsageColor: (percentage: number) => string })();
      
      expect(component.getUsageColor(25)).toBe('text-green-500');
      expect(component.getUsageColor(60)).toBe('text-yellow-500');
      expect(component.getUsageColor(80)).toBe('text-orange-500');
      expect(component.getUsageColor(95)).toBe('text-red-500');
    });

    it('should calculate usage percentage correctly', () => {
      render(<ProviderSelector />);
      
      const component = new (ProviderSelector as unknown as new () => { getUsagePercentage: (data: { usageLimit: number; currentUsage: number }) => number })();
      
      expect(component.getUsagePercentage({ usageLimit: 100, currentUsage: 25 })).toBe(25);
      expect(component.getUsagePercentage({ usageLimit: 150, currentUsage: 75 })).toBe(50);
      expect(component.getUsagePercentage({ usageLimit: 100, currentUsage: 150 })).toBe(100); // Capped at 100
      expect(component.getUsagePercentage({ usageLimit: 0, currentUsage: 50 })).toBe(Infinity);
    });

    it('should display high usage warning colors', async () => {
      const highUsageState = {
        ...mockStoreState,
        providers: {
          ...mockProviders,
          openai: {
            ...mockProviders.openai,
            currentUsage: 95, // 95% usage
          },
        },
      };
      
      mockUseAIStore.mockReturnValue(highUsageState);
      render(<ProviderSelector />);
      
      // Should show red usage bar for high usage
      const usageBar = document.querySelector('[style*="width: 95%"]');
      expect(usageBar).toHaveClass('bg-red-500');
    });
  });

  describe('Provider Icons and Colors', () => {
    it('should display correct icons for each provider', () => {
      render(<ProviderSelector />);
      
      const component = new (ProviderSelector as unknown as new () => { getProviderIcon: (provider: string) => string })();
      
      expect(component.getProviderIcon('openai')).toBe('🤖');
      expect(component.getProviderIcon('anthropic')).toBe('🧠');
      expect(component.getProviderIcon('google')).toBe('🌟');
      expect(component.getProviderIcon('perplexity')).toBe('🔍');
      expect(component.getProviderIcon('unknown')).toBe('⚡');
    });

    it('should apply correct color schemes for providers', () => {
      render(<ProviderSelector />);
      
      const component = new (ProviderSelector as unknown as new () => { getProviderColor: (provider: string) => string })();
      
      expect(component.getProviderColor('openai')).toBe('text-green-600 bg-green-50');
      expect(component.getProviderColor('anthropic')).toBe('text-purple-600 bg-purple-50');
      expect(component.getProviderColor('google')).toBe('text-blue-600 bg-blue-50');
      expect(component.getProviderColor('perplexity')).toBe('text-orange-600 bg-orange-50');
      expect(component.getProviderColor('unknown')).toBe('text-gray-600 bg-gray-50');
    });
  });

  describe('Current Provider Details Display', () => {
    it('should show current provider details in dropdown', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      expect(screen.getByText('Current: openai')).toBeInTheDocument();
      expect(screen.getByText('$25.00 / $100.00')).toBeInTheDocument();
      expect(screen.getByText('Model: GPT-5')).toBeInTheDocument();
      expect(screen.getByText('Context: 128,000 tokens')).toBeInTheDocument();
      expect(screen.getByText(/Pricing: \$0\.010\/1K input, \$0\.030\/1K output/)).toBeInTheDocument();
    });

    it('should handle provider without current model gracefully', () => {
      const stateWithoutModel = {
        ...mockStoreState,
        activeModel: 'nonexistent-model',
      };
      
      mockUseAIStore.mockReturnValue(stateWithoutModel);
      render(<ProviderSelector />);
      
      expect(screen.getByText('nonexistent-model')).toBeInTheDocument(); // Should show model ID
    });
  });

  describe('Keyboard and Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      // Tab to the main button
      await user.tab();
      expect(screen.getByRole('button', { name: /openai/i })).toHaveFocus();
      
      // Press Enter to open dropdown
      await user.keyboard('{Enter}');
      expect(screen.getByText('AI Providers')).toBeInTheDocument();
    });

    it('should have proper ARIA labels and roles', () => {
      render(<ProviderSelector />);
      
      const button = screen.getByRole('button', { name: /openai/i });
      expect(button).toBeInTheDocument();
      
      // Modal should have proper role when opened
      fireEvent.click(button);
      fireEvent.click(screen.getByText('Change Model'));
      
      const modal = document.querySelector('[role="dialog"]') || 
                   document.querySelector('.fixed.inset-0'); // Check for modal structure
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty providers gracefully', () => {
      const emptyState = {
        ...mockStoreState,
        providers: {},
      };
      
      mockUseAIStore.mockReturnValue(emptyState);
      render(<ProviderSelector />);
      
      // Should not crash and should handle gracefully
      expect(screen.getByText('openai')).toBeInTheDocument(); // Current active provider
    });

    it('should handle provider without models', () => {
      const providerWithoutModels = {
        ...mockStoreState,
        providers: {
          ...mockProviders,
          openai: {
            ...mockProviders.openai,
            models: undefined,
          },
        },
      };
      
      mockUseAIStore.mockReturnValue(providerWithoutModels);
      render(<ProviderSelector />);
      
      // Should not crash
      expect(screen.getByText('openai')).toBeInTheDocument();
    });
  });

  describe('Integration with AI Store', () => {
    it('should call store methods with correct parameters', async () => {
      const user = userEvent.setup();
      render(<ProviderSelector />);
      
      // Test all store method calls
      const button = screen.getByRole('button', { name: /openai/i });
      await user.click(button);
      
      const anthropicButton = screen.getByRole('button', { name: /anthropic/i });
      await user.click(anthropicButton);
      
      expect(mockStoreState.setActiveProvider).toHaveBeenCalledWith('anthropic');
      expect(mockStoreState.setActiveModel).toHaveBeenCalledWith('claude-sonnet-4');
      expect(mockStoreState.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          title: 'Provider Changed',
          message: 'Switched to anthropic',
        })
      );
    });
  });
});