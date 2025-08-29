// AI Content Dashboard - Main container for AI content generation system
// Provides provider selection, mode switching, and generation management

import React, { useEffect, useState } from 'react';
import { useAIStore } from '../../store/aiStore';
import { aiGenerationService } from '../../services/ai/AIGenerationService';
import { ProviderSelector } from './components/ProviderSelector';
import { QuickActions } from './components/QuickActions';
import { GenerationWorkspace } from './GenerationWorkspace';
import { NotificationCenter } from './components/NotificationCenter';
import { ContextManager } from './ContextManager';
import { ContextSelectionModal } from './modals/ContextSelectionModal';
import { StyleGuideModalEnhanced } from './modals/StyleGuideModalEnhanced';
import { MultiVerticalModal } from './modals/MultiVerticalModal';
import { 
  Brain, 
  Settings, 
  Zap, 
  BarChart3, 
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface AIContentDashboardProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  activeVertical?: string;
}

export const AIContentDashboard: React.FC<AIContentDashboardProps> = ({
  user,
  activeVertical = 'hospitality',
}) => {
  const {
    // State
    mode,
    loading,
    streaming,
    errors,
    
    // Actions
    setMode,
    setProviders,
    setStyleGuides,
    setLoading,
    addNotification,
    clearErrors,
  } = useAIStore();

  // Modal states
  const [showContextModal, setShowContextModal] = useState(false);
  const [showStyleGuideModal, setShowStyleGuideModal] = useState(false);
  const [showMultiVerticalModal, setShowMultiVerticalModal] = useState(false);
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState({
    todayGenerations: 0,
    todayCost: 0,
    successRate: 100,
    avgResponseTime: 0,
  });

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      
      try {
        // Fetch providers
        const providersResponse = await aiGenerationService.getProviders();
        if (providersResponse.success && providersResponse.data) {
          setProviders(providersResponse.data);
        }

        // Fetch style guides
        const stylesResponse = await aiGenerationService.getStyleGuides();
        if (stylesResponse.success && stylesResponse.data) {
          setStyleGuides(stylesResponse.data);
        }

        // Fetch today's analytics
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const analyticsResponse = await aiGenerationService.getAnalytics({
          start: startOfDay,
          end: today,
        });

        if (analyticsResponse.success && analyticsResponse.data) {
          setDashboardStats({
            todayGenerations: analyticsResponse.data.totalGenerations || 0,
            todayCost: analyticsResponse.data.totalCost || 0,
            successRate: analyticsResponse.data.successRate || 100,
            avgResponseTime: analyticsResponse.data.avgDuration || 0,
          });
        }

        addNotification({
          type: 'success',
          title: 'Dashboard Loaded',
          message: 'AI content generation system is ready.',
          duration: 3000,
        });
        
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Failed to load dashboard data. Please refresh.',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [setLoading, setProviders, setStyleGuides, addNotification]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'g':
            event.preventDefault();
            setShowContextModal(true);
            break;
          case 'e':
            event.preventDefault();
            setMode(mode === 'edit' ? 'quick' : 'edit');
            break;
          case 's':
            event.preventDefault();
            setShowStyleGuideModal(true);
            break;
          case 'm':
            event.preventDefault();
            setShowMultiVerticalModal(true);
            break;
          case '/':
            event.preventDefault();
            // Focus on main input (to be implemented in GenerationWorkspace)
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, setMode]);

  // Handle mode change
  const handleModeChange = (newMode: 'quick' | 'structured' | 'edit') => {
    setMode(newMode);
    addNotification({
      type: 'info',
      title: 'Mode Changed',
      message: `Switched to ${newMode} mode`,
      duration: 2000,
    });
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const analyticsResponse = await aiGenerationService.getAnalytics({
        start: startOfDay,
        end: today,
      });

      if (analyticsResponse.success && analyticsResponse.data) {
        setDashboardStats({
          todayGenerations: analyticsResponse.data.totalGenerations || 0,
          todayCost: analyticsResponse.data.totalCost || 0,
          successRate: analyticsResponse.data.successRate || 100,
          avgResponseTime: analyticsResponse.data.avgDuration || 0,
        });
      }

      addNotification({
        type: 'success',
        title: 'Dashboard Refreshed',
        message: 'Latest data loaded successfully.',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Could not refresh dashboard data.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Content Studio
                </h1>
              </div>
              
              {/* Mode Selector */}
              <div className="hidden md:flex items-center space-x-1 ml-8">
                {(['quick', 'structured', 'edit'] as const).map((modeOption) => (
                  <button
                    key={modeOption}
                    onClick={() => handleModeChange(modeOption)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      mode === modeOption
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {modeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Provider and Actions */}
            <div className="flex items-center space-x-4">
              <ProviderSelector />
              
              {/* Dashboard Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>{dashboardStats.todayGenerations} today</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>${dashboardStats.todayCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshDashboard}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Refresh Dashboard"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowStyleGuideModal(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-200">
                  {errors[errors.length - 1]}
                </p>
              </div>
              <button
                onClick={clearErrors}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <QuickActions 
                  onContextModal={() => setShowContextModal(true)}
                  onStyleGuideModal={() => setShowStyleGuideModal(true)}
                  onMultiVerticalModal={() => setShowMultiVerticalModal(true)}
                />
              </div>

              {/* Context Manager */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <ContextManager activeVertical={activeVertical} />
              </div>

              {/* Analytics Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Today's Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Generations</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {dashboardStats.todayGenerations}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${dashboardStats.todayCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {dashboardStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(dashboardStats.avgResponseTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <GenerationWorkspace 
              user={user}
              activeVertical={activeVertical}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showContextModal && (
        <ContextSelectionModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          activeVertical={activeVertical}
        />
      )}

      {showStyleGuideModal && (
        <StyleGuideModalEnhanced
          isOpen={showStyleGuideModal}
          onClose={() => setShowStyleGuideModal(false)}
        />
      )}

      {showMultiVerticalModal && (
        <MultiVerticalModal
          isOpen={showMultiVerticalModal}
          onClose={() => setShowMultiVerticalModal(false)}
        />
      )}

      {/* Notification Center */}
      <NotificationCenter />

      {/* Loading Overlay */}
      {(loading || streaming) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {streaming ? 'Generating Content...' : 'Loading...'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {streaming ? 'Streaming in progress' : 'Please wait'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};