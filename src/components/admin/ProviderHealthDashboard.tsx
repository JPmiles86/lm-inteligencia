import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';

// Type definitions matching our backend services
interface ProviderHealth {
  provider: string;
  isHealthy: boolean;
  lastCheck: Date;
  failureCount: number;
  averageLatency: number;
  successRate: number;
}

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  successRate: number;
  requestCount: number;
  byProvider: Record<string, {
    tokens: number;
    cost: number;
    calls: number;
    avgLatency: number;
    successRate: number;
    lastUsed: Date;
  }>;
}

interface MonthlyUsage {
  provider: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  daysRemaining: number;
  projected: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
}

export const ProviderHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<Record<string, ProviderHealth>>({});
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setError(null);
      
      const [healthResponse, usageResponse, monthlyResponse] = await Promise.all([
        fetch('/api/providers/health').then(r => r.json()).catch(() => ({})),
        fetch('/api/providers/usage').then(r => r.json()).catch(() => null),
        fetch('/api/providers/monthly-usage').then(r => r.json()).catch(() => [])
      ]);
      
      setHealthData(healthResponse);
      setUsageStats(usageResponse);
      setMonthlyUsage(monthlyResponse);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const refreshData = () => {
    setLoading(true);
    loadDashboardData();
  };
  
  const getHealthColor = (health: ProviderHealth) => {
    if (!health.isHealthy) return 'text-red-500';
    if (health.successRate > 0.95) return 'text-green-500';
    if (health.successRate > 0.8) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  const getHealthIcon = (health: ProviderHealth) => {
    if (!health.isHealthy) return <XCircle className="h-5 w-5 text-red-500" />;
    if (health.successRate > 0.95) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };
  
  const getUsageStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-orange-600 bg-orange-100';
      case 'exceeded': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const getFallbackChainForTask = (task: string): string[] => {
    const chains: Record<string, string[]> = {
      research: ['perplexity', 'anthropic', 'google', 'openai'],
      writing: ['anthropic', 'openai', 'google'],
      image: ['google', 'openai'],
      creative: ['openai', 'anthropic', 'google']
    };
    return chains[task] || chains.writing;
  };
  
  if (loading && Object.keys(healthData).length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Provider Health Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time monitoring of AI provider performance and usage
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}
      
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(usageStats?.requestCount || 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {((usageStats?.successRate || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(usageStats?.averageLatency || 0)}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(usageStats?.totalCost || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Provider Health Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Health Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(healthData).map(([provider, health]) => (
            <div key={provider} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">{provider}</h4>
                {getHealthIcon(health)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={getHealthColor(health)}>
                    {health.isHealthy ? 'Healthy' : 'Unhealthy'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                  <span className="text-gray-900 dark:text-white">
                    {(health.successRate * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Avg Latency:</span>
                  <span className="text-gray-900 dark:text-white">
                    {Math.round(health.averageLatency)}ms
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Failures:</span>
                  <span className="text-gray-900 dark:text-white">{health.failureCount}</span>
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  Last checked: {new Date(health.lastCheck).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Monthly Usage Limits */}
      {monthlyUsage.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Usage Limits</h3>
          </div>
          
          <div className="space-y-4">
            {monthlyUsage.map((usage) => (
              <div key={usage.provider} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium capitalize">
                      {usage.provider[0].toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {usage.provider}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(usage.currentUsage)} / {formatCurrency(usage.limit)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getUsageStatusColor(usage.status)}`}>
                    {usage.percentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {usage.daysRemaining} days remaining
                  </p>
                  {usage.projected > usage.limit && (
                    <p className="text-xs text-red-500 mt-1">
                      Projected: {formatCurrency(usage.projected)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Fallback Chain Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Zap className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fallback Chains</h3>
        </div>
        
        <div className="space-y-4">
          {['research', 'writing', 'image', 'creative'].map(task => (
            <div key={task} className="flex items-center space-x-2">
              <span className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {task}:
              </span>
              <div className="flex items-center space-x-2">
                {getFallbackChainForTask(task).map((provider, idx) => {
                  const health = healthData[provider];
                  const isHealthy = health?.isHealthy !== false;
                  
                  return (
                    <React.Fragment key={provider}>
                      <div className={`
                        px-3 py-1 rounded-lg text-xs font-medium
                        ${isHealthy 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}
                      `}>
                        {provider}
                        {health && (
                          <span className="ml-1">
                            ({Math.round(health.averageLatency)}ms)
                          </span>
                        )}
                      </div>
                      {idx < getFallbackChainForTask(task).length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Provider Performance Comparison */}
      {usageStats?.byProvider && Object.keys(usageStats.byProvider).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Performance</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2 text-gray-700 dark:text-gray-300">Provider</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Requests</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Tokens</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Cost</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Avg Latency</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(usageStats.byProvider).map(([provider, stats]) => (
                  <tr key={provider} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 font-medium text-gray-900 dark:text-white capitalize">
                      {provider}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                      {formatNumber(stats.calls)}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                      {formatNumber(stats.tokens)}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                      {formatCurrency(stats.cost)}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                      {Math.round(stats.avgLatency)}ms
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${
                        stats.successRate > 0.95 ? 'text-green-600' :
                        stats.successRate > 0.8 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(stats.successRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};