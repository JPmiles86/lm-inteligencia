// Quick Actions Component - Fast access buttons for common AI content generation tasks
// Provides one-click access to generation modes and settings

import React from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  Zap, 
  FileText, 
  Edit, 
  Layers, 
  Image, 
  Share2, 
  Settings, 
  BookOpen,
  Lightbulb,
  Calendar,
  Target,
} from 'lucide-react';

interface QuickActionsProps {
  onContextModal: () => void;
  onStyleGuideModal: () => void;
  onMultiVerticalModal: () => void;
  onIdeationModal?: () => void;
  onSocialMediaModal?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onContextModal,
  onStyleGuideModal,
  onMultiVerticalModal,
  onIdeationModal,
  onSocialMediaModal,
}) => {
  const {
    setMode,
    addNotification,
  } = useAIStore();

  // Quick action handlers
  const handleQuickGenerate = () => {
    setMode('quick');
    onContextModal();
    addNotification({
      type: 'info',
      title: 'Quick Generate',
      message: 'Ready for fast content generation',
      duration: 2000,
    });
  };

  const handleStructuredMode = () => {
    setMode('structured');
    addNotification({
      type: 'info',
      title: 'Structured Mode',
      message: 'Step-by-step content creation',
      duration: 2000,
    });
  };

  const handleEditMode = () => {
    setMode('edit');
    addNotification({
      type: 'info',
      title: 'Edit Mode',
      message: 'AI-assisted content editing',
      duration: 2000,
    });
  };

  // Quick action definitions
  const quickActions = [
    {
      id: 'quick-generate',
      icon: Zap,
      label: 'Quick Generate',
      description: 'One-click blog generation',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      action: handleQuickGenerate,
      shortcut: '⌘G',
    },
    {
      id: 'structured',
      icon: FileText,
      label: 'Structured',
      description: 'Step-by-step creation',
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
      action: handleStructuredMode,
      shortcut: '⌘S',
    },
    {
      id: 'edit-existing',
      icon: Edit,
      label: 'Edit Existing',
      description: 'Improve current content',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      action: handleEditMode,
      shortcut: '⌘E',
    },
    {
      id: 'multi-vertical',
      icon: Layers,
      label: 'Multi-Vertical',
      description: 'Create for all industries',
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
      action: onMultiVerticalModal,
      shortcut: '⌘M',
    },
  ];

  const utilityActions = [
    {
      id: 'style-guides',
      icon: BookOpen,
      label: 'Style Guides',
      description: 'Manage writing styles',
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
      action: onStyleGuideModal,
    },
    {
      id: 'ideas',
      icon: Lightbulb,
      label: 'Brainstorm Ideas',
      description: 'Generate content ideas',
      color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
      action: () => {
        if (onIdeationModal) {
          onIdeationModal();
        } else {
          addNotification({
            type: 'info',
            title: 'Brainstorming Available',
            message: 'Use the AI Dashboard to access the brainstorming module',
            duration: 3000,
          });
        }
      },
    },
    {
      id: 'social',
      icon: Share2,
      label: 'Social Posts',
      description: 'Transform to social media',
      color: 'text-pink-600 bg-pink-50 hover:bg-pink-100',
      action: () => {
        if (onSocialMediaModal) {
          onSocialMediaModal();
        } else {
          addNotification({
            type: 'info',
            title: 'Social Media Generator',
            message: 'Use the AI Dashboard to access the social media generation module',
            duration: 3000,
          });
        }
      },
    },
    {
      id: 'images',
      icon: Image,
      label: 'Generate Images',
      description: 'AI-powered visuals with Gemini 2.5 Flash',
      color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100',
      action: () => {
        // Open image generation modal or navigate to image generator
        addNotification({
          type: 'info',
          title: 'Image Generation Ready',
          message: 'Gemini 2.5 Flash image generation is now available in the AI Dashboard',
          duration: 4000,
        });
        
        // Set mode to trigger image generation workflow
        setMode('quick');
        
        // You can add modal trigger here when integrated with the main dashboard
        // For now, notify users where to find the feature
      },
    },
  ];

  // Seasonal/contextual actions
  const seasonalActions = [
    {
      id: 'halloween',
      icon: Target,
      label: 'Halloween Blog',
      description: 'Seasonal content',
      color: 'text-orange-800 bg-orange-100 hover:bg-orange-200',
      action: () => {
        // TODO: Implement seasonal content generation
        addNotification({
          type: 'info',
          title: 'Halloween Blog',
          message: 'Generating seasonal content...',
          duration: 3000,
        });
      },
    },
    {
      id: 'weekly-plan',
      icon: Calendar,
      label: 'Weekly Plan',
      description: 'Content calendar',
      color: 'text-teal-600 bg-teal-50 hover:bg-teal-100',
      action: () => {
        // TODO: Implement content planning
        addNotification({
          type: 'info',
          title: 'Content Planning',
          message: 'Weekly content planner coming soon',
          duration: 3000,
        });
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="space-y-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${action.color}`}
              title={action.shortcut ? `${action.description} (${action.shortcut})` : action.description}
            >
              <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {action.label}
                </p>
                <p className="text-xs text-gray-600 hidden sm:block">
                  {action.description}
                </p>
              </div>
              {action.shortcut && (
                <span className="text-xs text-gray-500 ml-2 hidden md:block">
                  {action.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Utility Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Tools
        </h4>
        <div className="space-y-2">
          {utilityActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`w-full flex items-center p-2 rounded-lg transition-colors ${action.color}`}
                title={action.description}
              >
                <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {action.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seasonal/Quick Wins */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Quick Wins
        </h4>
        <div className="space-y-2">
          {seasonalActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`w-full flex items-center p-2 rounded-lg transition-colors ${action.color}`}
                title={action.description}
              >
                <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {action.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            💡 Pro Tip
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-200">
            Use keyboard shortcuts for faster access. Press Cmd+G for quick generation, 
            Cmd+E for edit mode, or Cmd+S for structured creation.
          </p>
        </div>
      </div>
    </div>
  );
};