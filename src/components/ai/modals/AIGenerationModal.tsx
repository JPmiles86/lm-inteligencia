// Unified AI Generation Modal - Consolidates all AI generation modals into one responsive interface
// Provides tab-based navigation with mobile-optimized layout and touch controls

import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import {
  X,
  BookOpen,
  Type,
  Lightbulb,
  Calendar,
  Layers,
  Share2,
  Image,
  ChevronDown,
  ChevronUp,
  Menu,
  ArrowLeft,
} from 'lucide-react';

// Import individual modal content components
import { ContextSelectionContent } from './content/ContextSelectionContent';
import { StyleGuideContent } from './content/StyleGuideContent';
import { BrainstormingContent } from './content/BrainstormingContent';
import { ContentPlanningContent } from './content/ContentPlanningContent';
import { MultiVerticalContent } from './content/MultiVerticalContent';
import { SocialMediaContent } from './content/SocialMediaContent';
import { ImageGenerationContent } from './content/ImageGenerationContent';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  activeVertical?: string;
}

interface TabConfig {
  id: string;
  label: string;
  shortLabel: string; // For mobile
  icon: React.ElementType;
  color: string;
  description: string;
  component: React.ComponentType<any>;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'context',
  activeVertical = 'hospitality'
}) => {
  const { addNotification } = useAIStore();

  // State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Tab configurations
  const tabs: TabConfig[] = [
    {
      id: 'context',
      label: 'Context Selection',
      shortLabel: 'Context',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Configure context and knowledge base for AI generation',
      component: ContextSelectionContent
    },
    {
      id: 'styleGuide',
      label: 'Style Guides',
      shortLabel: 'Style',
      icon: Type,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description: 'Create and manage style guides with AI enhancement',
      component: StyleGuideContent
    },
    {
      id: 'brainstorming',
      label: 'Brainstorming',
      shortLabel: 'Ideas',
      icon: Lightbulb,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      description: 'Generate creative blog post ideas with AI assistance',
      component: BrainstormingContent
    },
    {
      id: 'contentPlanning',
      label: 'Content Planning',
      shortLabel: 'Planning',
      icon: Calendar,
      color: 'text-green-600 bg-green-50 border-green-200',
      description: '5-step guided process for comprehensive blog creation',
      component: ContentPlanningContent
    },
    {
      id: 'multiVertical',
      label: 'Multi-Vertical',
      shortLabel: 'Multi',
      icon: Layers,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      description: 'Generate tailored content for multiple industries',
      component: MultiVerticalContent
    },
    {
      id: 'socialMedia',
      label: 'Social Media',
      shortLabel: 'Social',
      icon: Share2,
      color: 'text-pink-600 bg-pink-50 border-pink-200',
      description: 'Transform your content for social platforms',
      component: SocialMediaContent
    },
    {
      id: 'imageGeneration',
      label: 'Image Generation',
      shortLabel: 'Images',
      icon: Image,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Powered by Google\'s Gemini 2.5 Flash',
      component: ImageGenerationContent
    }
  ];

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setShowMobileNav(false);
    }
  }, [isOpen, initialTab]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileNav(false);

    // Track navigation for analytics
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      addNotification({
        type: 'info',
        title: `Switched to ${tab.label}`,
        message: tab.description,
        duration: 2000
      });
    }
  };

  // Get active tab config
  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || ContextSelectionContent;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Mobile backdrop */}
      {showMobileNav && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setShowMobileNav(false)}
        />
      )}

      {/* Main modal container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-full max-w-full max-h-full md:w-[95vw] md:h-[90vh] md:max-w-7xl md:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {/* Mobile back/menu button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileNav(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
              >
                <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}

            <div className="flex items-center space-x-2">
              {activeTabConfig && (
                <div className={`p-2 rounded-lg ${activeTabConfig.color}`}>
                  <activeTabConfig.icon className="h-5 w-5" />
                </div>
              )}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  {activeTabConfig?.label || 'AI Generation'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
                  {activeTabConfig?.description || 'AI-powered content generation'}
                </p>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar navigation */}
          <div className={`
            hidden md:flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900
            transition-all duration-200
            ${sidebarCollapsed ? 'w-16' : 'w-64'}
          `}>
            {/* Sidebar header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generation Tools
                  </span>
                )}
                {sidebarCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            {/* Navigation tabs */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      w-full flex items-center p-3 rounded-lg text-left transition-all duration-200
                      ${isActive
                        ? `${tab.color} border`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                    title={sidebarCollapsed ? tab.label : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'text-gray-500'}`} />
                    {!sidebarCollapsed && (
                      <span className="ml-3 text-sm font-medium truncate">
                        {tab.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile navigation overlay */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transform transition-transform duration-300 md:hidden
            ${showMobileNav ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Mobile nav header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generation Tools
              </h3>
              <button
                onClick={() => setShowMobileNav(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Mobile navigation tabs */}
            <nav className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      w-full flex items-center p-3 rounded-lg text-left transition-colors
                      ${isActive
                        ? `${tab.color} border`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'text-gray-500'}`} />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tab.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ActiveComponent
              activeVertical={activeVertical}
              onClose={onClose}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Mobile bottom navigation (alternative to sidebar) */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
          <div className="flex items-center justify-center space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-colors
                    ${isActive
                      ? `${tab.color}`
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">
                    {tab.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationModal;