// Generation Controls - Input and controls for AI content generation
// Provides topic input, generation triggers, and streaming controls

import React, { useState, useRef, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  // Play, // Unused - preserved for future use
  Square, 
  Loader2, 
  // Settings, // Unused - preserved for future use
  Zap, 
  FileText, 
  Edit, 
  Layers,
  // MessageSquare, // Unused - preserved for future use
  Sparkles,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface GenerationControlsProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
  loading: boolean;
  streaming: boolean;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  value,
  onChange,
  onGenerate,
  onCancel,
  loading,
  streaming,
}) => {
  const {
    mode,
    activeProvider,
    activeModel,
    selectedContext,
    providers,
  } = useAIStore();

  const [inputFocused, setInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Calculate estimates
  useEffect(() => {
    if (value.trim()) {
      // Rough token estimation (1 token ≈ 4 characters)
      const tokens = Math.ceil(value.length / 4);
      setEstimatedTokens(tokens);

      // Cost estimation
      const provider = providers[activeProvider];
      const model = provider?.models?.find(m => m.id === activeModel);
      if (model) {
        const inputCost = tokens * model.pricing.input;
        const outputCost = 1000 * model.pricing.output; // Estimate 1000 output tokens
        setEstimatedCost(inputCost + outputCost);
      }
    } else {
      setEstimatedTokens(0);
      setEstimatedCost(0);
    }
  }, [value, activeProvider, activeModel, providers]);

  // Topic suggestions based on mode and vertical
  const topicSuggestions = {
    hospitality: [
      'Digital marketing trends for hotels in 2024',
      'How to optimize your hotel\'s online booking process',
      'Social media strategies for restaurants',
      'Building customer loyalty in hospitality',
      'The importance of online reviews for hotels',
    ],
    healthcare: [
      'HIPAA compliance in digital marketing',
      'Building trust with healthcare patients online',
      'Telehealth marketing best practices',
      'Healthcare content marketing strategies',
      'Patient engagement through digital channels',
    ],
    tech: [
      'B2B SaaS marketing strategies that convert',
      'AI and machine learning in marketing',
      'Software product launch strategies',
      'Technical content that drives leads',
      'Developer marketing best practices',
    ],
    athletics: [
      'Sports facility marketing during off-season',
      'Youth sports program promotion strategies',
      'Fitness center membership retention',
      'Event marketing for sports organizations',
      'Social media for sports teams and athletes',
    ],
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Show suggestions when input is empty and focused
    if (!newValue.trim() && inputFocused) {
      const currentVertical = selectedContext.previousContent.verticalFilter || 'hospitality';
      setSuggestions(topicSuggestions[currentVertical as keyof typeof topicSuggestions] || []);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Handle key shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !loading && !streaming) {
        onGenerate();
      }
    }
    
    if (e.key === 'Escape' && streaming) {
      onCancel();
    }
  };

  // Get mode-specific placeholder and button text
  const getModeConfig = () => {
    switch (mode) {
      case 'quick':
        return {
          placeholder: 'What topic would you like to write about? Be specific for better results...',
          buttonText: 'Generate Blog',
          icon: Zap,
          description: 'One-click complete blog generation',
        };
      case 'structured':
        return {
          placeholder: 'Describe your content idea. We\'ll help you develop it step by step...',
          buttonText: 'Start Creation',
          icon: FileText,
          description: 'Guided step-by-step content development',
        };
      case 'edit':
        return {
          placeholder: 'Describe how you\'d like to improve existing content...',
          buttonText: 'Enhance Content',
          icon: Edit,
          description: 'AI-powered content improvement',
        };
      default:
        return {
          placeholder: 'Enter your topic or request...',
          buttonText: 'Generate',
          icon: Sparkles,
          description: 'AI content generation',
        };
    }
  };

  const modeConfig = getModeConfig();
  const IconComponent = modeConfig.icon;
  const canGenerate = value.trim() && !loading && !streaming;

  return (
    <div className="space-y-4">
      {/* Mode Description */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <IconComponent className="h-4 w-4" />
        <span>{modeConfig.description}</span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
          {mode}
        </span>
      </div>

      {/* Main Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setInputFocused(true);
            if (!value.trim()) {
              const currentVertical = selectedContext.previousContent.verticalFilter || 'hospitality';
              setSuggestions(topicSuggestions[currentVertical as keyof typeof topicSuggestions] || []);
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setInputFocused(false);
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={modeConfig.placeholder}
          className="w-full p-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px] max-h-[200px]"
          disabled={loading || streaming}
        />

        {/* Character/Token Counter */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          {value.length} chars • ~{estimatedTokens} tokens
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            <div className="p-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                💡 Topic Suggestions
              </h4>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Main Generate Button */}
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              canGenerate
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading || streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconComponent className="h-4 w-4" />
            )}
            <span>{loading || streaming ? 'Generating...' : modeConfig.buttonText}</span>
          </button>

          {/* Cancel Button (only during generation) */}
          {streaming && (
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* Generation Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          {estimatedCost > 0 && (
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>~${estimatedCost.toFixed(4)}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>
              ~{mode === 'quick' ? '30-60s' : mode === 'structured' ? '2-5min' : '15-30s'}
            </span>
          </div>

          {/* Provider/Model indicator */}
          <div className="flex items-center space-x-1 capitalize">
            <div className={`w-2 h-2 rounded-full ${
              providers[activeProvider]?.active ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span>{activeProvider}</span>
          </div>
        </div>
      </div>

      {/* Context Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <Layers className="h-3 w-3" />
          <span>Active Context</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Style Guides */}
          {selectedContext.styleGuides.brand && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
              Brand Guide
            </span>
          )}
          
          {Array.isArray(selectedContext.styleGuides.vertical) && 
           selectedContext.styleGuides.vertical.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
              {selectedContext.styleGuides.vertical.length} Vertical Guide{selectedContext.styleGuides.vertical.length > 1 ? 's' : ''}
            </span>
          )}
          
          {/* Previous Content */}
          {selectedContext.previousContent.mode !== 'none' && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded">
              {selectedContext.previousContent.mode === 'all' ? 'All Content' :
               selectedContext.previousContent.mode === 'vertical' ? 'Vertical Content' :
               `${selectedContext.previousContent.items?.length || 0} Selected`}
            </span>
          )}
          
          {/* Custom Context */}
          {selectedContext.additionalContext && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded">
              Custom Instructions
            </span>
          )}
          
          {/* Empty State */}
          {!selectedContext.styleGuides.brand && 
           (!selectedContext.styleGuides.vertical || selectedContext.styleGuides.vertical.length === 0) &&
           selectedContext.previousContent.mode === 'none' &&
           !selectedContext.additionalContext && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
              No context selected
            </span>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘ Enter</kbd>
            {' '}to generate
          </span>
          {streaming && (
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>
              {' '}to cancel
            </span>
          )}
        </div>
        
        {canGenerate && (
          <div className="flex items-center space-x-1 text-green-500 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            <span>Ready</span>
          </div>
        )}
        
        {!value.trim() && (
          <div className="flex items-center space-x-1 text-orange-500 dark:text-orange-400">
            <AlertCircle className="h-3 w-3" />
            <span>Enter topic to continue</span>
          </div>
        )}
      </div>
    </div>
  );
};