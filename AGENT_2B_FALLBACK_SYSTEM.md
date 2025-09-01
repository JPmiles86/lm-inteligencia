# Agent-2B: Intelligent Fallback System Implementation
**Priority:** 🟡 HIGH
**Duration:** 12 hours
**Dependencies:** Agent-2A (Provider Settings) should be started first
**Created:** 2025-08-31

## 🎯 MISSION
Implement an intelligent fallback system that automatically selects the best available AI provider based on task requirements, user preferences, and provider availability. The system must handle failures gracefully and retry with alternative providers.

## 📋 CONTEXT
- **User Requirement:** System should work with whatever API keys user has configured
- **Current State:** Basic provider selection created by Agent-1B
- **Goal:** Sophisticated fallback with retry logic and capability matching

## ✅ SUCCESS CRITERIA
1. Automatic provider selection based on task type
2. Fallback to next provider on failure
3. Retry logic with exponential backoff
4. Provider health monitoring
5. Usage tracking and cost calculation
6. Real-time provider availability status

## 🔧 SPECIFIC TASKS

### 1. Enhance Provider Selection Service (3 hours)

#### `/api/services/intelligentProviderSelector.ts`
```typescript
interface ProviderCapability {
  text: boolean;
  image: boolean;
  research: boolean;
  multimodal: boolean;
  maxTokens: number;
  costPer1kTokens: number;
}

interface TaskRequirements {
  capability: 'text' | 'image' | 'research' | 'multimodal';
  minTokens?: number;
  maxCost?: number;
  preferredModels?: string[];
  requiresOnline?: boolean; // For research tasks
}

interface ProviderHealth {
  provider: string;
  isHealthy: boolean;
  lastCheck: Date;
  failureCount: number;
  averageLatency: number;
  successRate: number;
}

class IntelligentProviderSelector {
  private providerHealth: Map<string, ProviderHealth> = new Map();
  private readonly healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  
  // Provider capabilities matrix
  private readonly capabilities: Record<string, ProviderCapability> = {
    openai: {
      text: true,
      image: true,
      research: true,
      multimodal: false,
      maxTokens: 128000,
      costPer1kTokens: 0.03
    },
    anthropic: {
      text: true,
      image: false,
      research: true,
      multimodal: false,
      maxTokens: 200000,
      costPer1kTokens: 0.025
    },
    google: {
      text: true,
      image: true,
      research: true,
      multimodal: true,
      maxTokens: 1000000,
      costPer1kTokens: 0.02
    },
    perplexity: {
      text: true,
      image: false,
      research: true,
      multimodal: false,
      maxTokens: 128000,
      costPer1kTokens: 0.015
    }
  };
  
  // Task-specific fallback chains
  private readonly fallbackChains = {
    research: ['perplexity', 'anthropic', 'google', 'openai'],
    writing: ['anthropic', 'openai', 'google'],
    image: ['google', 'openai'],
    creative: ['openai', 'anthropic', 'google'],
    analysis: ['anthropic', 'google', 'openai'],
    multimodal: ['google']
  };
  
  constructor() {
    // Start health monitoring
    this.startHealthMonitoring();
  }
  
  async selectProvider(
    task: string,
    requirements: TaskRequirements,
    preferredProvider?: string
  ): Promise<{
    provider: string;
    model: string;
    config: any;
    fallbackChain: string[];
  }> {
    const availableProviders = await this.getAvailableProviders();
    const capableProviders = this.filterByCapability(
      availableProviders, 
      requirements
    );
    
    // Check preferred provider first
    if (preferredProvider && this.isProviderSuitable(
      preferredProvider, 
      requirements, 
      capableProviders
    )) {
      return this.prepareProvider(preferredProvider, task);
    }
    
    // Use fallback chain
    const chain = this.fallbackChains[task] || this.fallbackChains.writing;
    
    for (const providerName of chain) {
      if (this.isProviderSuitable(providerName, requirements, capableProviders)) {
        const health = this.providerHealth.get(providerName);
        
        // Skip unhealthy providers unless no alternatives
        if (health && !health.isHealthy && capableProviders.length > 1) {
          continue;
        }
        
        return this.prepareProvider(providerName, task);
      }
    }
    
    throw new Error(`No suitable provider available for ${task}`);
  }
  
  private async getAvailableProviders(): Promise<string[]> {
    const response = await fetch('/api/providers');
    const providers = await response.json();
    
    return providers
      .filter(p => p.hasKey && p.active)
      .map(p => p.provider);
  }
  
  private filterByCapability(
    providers: string[],
    requirements: TaskRequirements
  ): string[] {
    return providers.filter(provider => {
      const cap = this.capabilities[provider];
      if (!cap) return false;
      
      // Check capability
      if (!cap[requirements.capability]) return false;
      
      // Check token requirements
      if (requirements.minTokens && cap.maxTokens < requirements.minTokens) {
        return false;
      }
      
      // Check cost requirements
      if (requirements.maxCost && cap.costPer1kTokens > requirements.maxCost) {
        return false;
      }
      
      return true;
    });
  }
  
  private isProviderSuitable(
    provider: string,
    requirements: TaskRequirements,
    capableProviders: string[]
  ): boolean {
    return capableProviders.includes(provider);
  }
  
  private async prepareProvider(provider: string, task: string) {
    const models = this.getModelsForTask(provider, task);
    const config = this.getConfigForTask(provider, task);
    const chain = this.getFallbackChainFrom(provider, task);
    
    return {
      provider,
      model: models[0],
      config,
      fallbackChain: chain
    };
  }
  
  private getModelsForTask(provider: string, task: string): string[] {
    const modelMap = {
      openai: {
        writing: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
        creative: ['gpt-4-turbo-preview', 'gpt-4'],
        image: ['dall-e-3', 'dall-e-2'],
        research: ['gpt-4-turbo-preview']
      },
      anthropic: {
        writing: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
        creative: ['claude-3-opus-20240229'],
        research: ['claude-3-opus-20240229']
      },
      google: {
        writing: ['gemini-1.5-pro', 'gemini-1.5-flash'],
        creative: ['gemini-1.5-pro'],
        image: ['imagen-3', 'gemini-1.5-pro-vision'],
        research: ['gemini-1.5-pro']
      },
      perplexity: {
        research: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
        writing: ['llama-3.1-sonar-large-128k-chat']
      }
    };
    
    return modelMap[provider]?.[task] || modelMap[provider]?.writing || [];
  }
  
  private getConfigForTask(provider: string, task: string): any {
    const baseConfig = {
      temperature: 0.7,
      maxTokens: 4000
    };
    
    const taskConfigs = {
      writing: { temperature: 0.7, maxTokens: 4000 },
      creative: { temperature: 0.9, maxTokens: 4000 },
      research: { temperature: 0.3, maxTokens: 8000 },
      analysis: { temperature: 0.2, maxTokens: 4000 }
    };
    
    return { ...baseConfig, ...(taskConfigs[task] || {}) };
  }
  
  private getFallbackChainFrom(provider: string, task: string): string[] {
    const chain = this.fallbackChains[task] || this.fallbackChains.writing;
    const index = chain.indexOf(provider);
    return index >= 0 ? chain.slice(index + 1) : chain;
  }
  
  private startHealthMonitoring() {
    setInterval(() => {
      this.checkProvidersHealth();
    }, this.healthCheckInterval);
  }
  
  private async checkProvidersHealth() {
    const providers = await this.getAvailableProviders();
    
    for (const provider of providers) {
      const health = await this.checkProviderHealth(provider);
      this.providerHealth.set(provider, health);
    }
  }
  
  private async checkProviderHealth(provider: string): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/providers/${provider}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      const latency = Date.now() - startTime;
      const existing = this.providerHealth.get(provider);
      
      return {
        provider,
        isHealthy: response.ok,
        lastCheck: new Date(),
        failureCount: response.ok ? 0 : (existing?.failureCount || 0) + 1,
        averageLatency: existing 
          ? (existing.averageLatency * 0.9 + latency * 0.1)
          : latency,
        successRate: existing
          ? (response.ok ? existing.successRate * 0.9 + 1 * 0.1 : existing.successRate * 0.9)
          : response.ok ? 1 : 0
      };
    } catch (error) {
      const existing = this.providerHealth.get(provider);
      
      return {
        provider,
        isHealthy: false,
        lastCheck: new Date(),
        failureCount: (existing?.failureCount || 0) + 1,
        averageLatency: existing?.averageLatency || 0,
        successRate: existing ? existing.successRate * 0.9 : 0
      };
    }
  }
}

export const providerSelector = new IntelligentProviderSelector();
```

### 2. Implement Retry Logic with Exponential Backoff (2 hours)

#### `/api/services/retryHandler.ts`
```typescript
interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  shouldRetry?: (error: any) => boolean;
}

export class RetryHandler {
  private readonly defaultOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
      // Retry on network errors or 5xx status codes
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return true;
      }
      if (error.status >= 500 && error.status < 600) {
        return true;
      }
      // Don't retry on 4xx errors (client errors)
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      return true;
    }
  };
  
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: any;
    
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === opts.maxAttempts) {
          break;
        }
        
        if (!opts.shouldRetry(error)) {
          throw error;
        }
        
        const delay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );
        
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  async executeWithFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackChain: Array<() => Promise<T>>,
    options?: Partial<RetryOptions>
  ): Promise<{ result: T; provider: string; attempts: number }> {
    let totalAttempts = 0;
    
    // Try primary function
    try {
      totalAttempts++;
      const result = await this.executeWithRetry(primaryFn, options);
      return { result, provider: 'primary', attempts: totalAttempts };
    } catch (primaryError) {
      console.error('Primary provider failed:', primaryError);
    }
    
    // Try fallback chain
    for (let i = 0; i < fallbackChain.length; i++) {
      try {
        totalAttempts++;
        const result = await this.executeWithRetry(fallbackChain[i], {
          ...options,
          maxAttempts: 2 // Fewer retries for fallbacks
        });
        return { result, provider: `fallback-${i}`, attempts: totalAttempts };
      } catch (fallbackError) {
        console.error(`Fallback ${i} failed:`, fallbackError);
        
        if (i === fallbackChain.length - 1) {
          throw new Error('All providers failed');
        }
      }
    }
    
    throw new Error('No providers available');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const retryHandler = new RetryHandler();
```

### 3. Create Provider Usage Tracking (2 hours)

#### `/api/services/usageTracker.ts`
```typescript
interface UsageRecord {
  provider: string;
  task: string;
  tokensUsed: number;
  cost: number;
  duration: number;
  success: boolean;
  timestamp: Date;
  model: string;
}

export class UsageTracker {
  private usageHistory: UsageRecord[] = [];
  
  async trackUsage(record: UsageRecord): Promise<void> {
    this.usageHistory.push(record);
    
    // Update database
    await this.updateDatabaseUsage(record);
    
    // Check usage limits
    await this.checkUsageLimits(record.provider);
  }
  
  private async updateDatabaseUsage(record: UsageRecord): Promise<void> {
    try {
      await db.update(providerSettings)
        .set({
          currentUsage: sql`current_usage + ${record.cost}`,
          updatedAt: new Date()
        })
        .where(eq(providerSettings.provider, record.provider));
    } catch (error) {
      console.error('Failed to update usage:', error);
    }
  }
  
  private async checkUsageLimits(provider: string): Promise<void> {
    const settings = await db.select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, provider))
      .limit(1);
    
    if (settings.length > 0) {
      const { monthlyLimit, currentUsage } = settings[0];
      
      if (monthlyLimit && currentUsage >= monthlyLimit) {
        // Disable provider if limit reached
        await db.update(providerSettings)
          .set({ active: false })
          .where(eq(providerSettings.provider, provider));
        
        console.warn(`Provider ${provider} has reached monthly limit`);
      }
    }
  }
  
  async getUsageStats(provider?: string, days: number = 30): Promise<{
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    successRate: number;
    byProvider: Record<string, any>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantUsage = this.usageHistory.filter(record => {
      if (provider && record.provider !== provider) return false;
      return record.timestamp >= cutoffDate;
    });
    
    const stats = {
      totalTokens: 0,
      totalCost: 0,
      totalDuration: 0,
      successCount: 0,
      byProvider: {}
    };
    
    relevantUsage.forEach(record => {
      stats.totalTokens += record.tokensUsed;
      stats.totalCost += record.cost;
      stats.totalDuration += record.duration;
      if (record.success) stats.successCount++;
      
      if (!stats.byProvider[record.provider]) {
        stats.byProvider[record.provider] = {
          tokens: 0,
          cost: 0,
          calls: 0,
          avgLatency: 0
        };
      }
      
      stats.byProvider[record.provider].tokens += record.tokensUsed;
      stats.byProvider[record.provider].cost += record.cost;
      stats.byProvider[record.provider].calls++;
    });
    
    return {
      totalTokens: stats.totalTokens,
      totalCost: stats.totalCost,
      averageLatency: stats.totalDuration / relevantUsage.length || 0,
      successRate: stats.successCount / relevantUsage.length || 0,
      byProvider: stats.byProvider
    };
  }
}

export const usageTracker = new UsageTracker();
```

### 4. Implement Provider Health Dashboard Component (3 hours)

#### `/src/components/admin/ProviderHealthDashboard.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export const ProviderHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<Record<string, ProviderHealth>>({});
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);
  
  const loadHealthData = async () => {
    try {
      const [health, usage] = await Promise.all([
        fetch('/api/providers/health').then(r => r.json()),
        fetch('/api/providers/usage').then(r => r.json())
      ]);
      
      setHealthData(health);
      setUsageStats(usage);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getHealthColor = (health: ProviderHealth) => {
    if (!health.isHealthy) return 'text-red-500';
    if (health.successRate > 0.95) return 'text-green-500';
    if (health.successRate > 0.8) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  const getHealthIcon = (health: ProviderHealth) => {
    if (!health.isHealthy) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <Activity className="h-5 w-5 text-green-500" />;
  };
  
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold">
                {usageStats?.totalRequests || 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">
                {((usageStats?.successRate || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Latency</p>
              <p className="text-2xl font-bold">
                {(usageStats?.averageLatency || 0).toFixed(0)}ms
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold">
                ${(usageStats?.totalCost || 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Provider Health Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Provider Health Status</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(healthData).map(([provider, health]) => (
            <div key={provider} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{provider}</h4>
                {getHealthIcon(health)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={getHealthColor(health)}>
                    {health.isHealthy ? 'Healthy' : 'Unhealthy'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Success Rate:</span>
                  <span>{(health.successRate * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg Latency:</span>
                  <span>{health.averageLatency.toFixed(0)}ms</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Failures:</span>
                  <span>{health.failureCount}</span>
                </div>
                
                <div className="text-xs text-gray-400">
                  Last checked: {new Date(health.lastCheck).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fallback Chain Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Active Fallback Chains</h3>
        
        <div className="space-y-3">
          {['research', 'writing', 'image', 'creative'].map(task => (
            <div key={task} className="flex items-center space-x-2">
              <span className="w-20 text-sm font-medium capitalize">{task}:</span>
              <div className="flex items-center space-x-2">
                {getFallbackChainForTask(task).map((provider, idx) => (
                  <React.Fragment key={provider}>
                    <div className={`
                      px-2 py-1 rounded text-xs
                      ${healthData[provider]?.isHealthy 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'}
                    `}>
                      {provider}
                    </div>
                    {idx < getFallbackChainForTask(task).length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function getFallbackChainForTask(task: string): string[] {
  const chains = {
    research: ['perplexity', 'anthropic', 'google', 'openai'],
    writing: ['anthropic', 'openai', 'google'],
    image: ['google', 'openai'],
    creative: ['openai', 'anthropic', 'google']
  };
  return chains[task] || chains.writing;
}
```

### 5. Create Fallback Testing Utility (2 hours)

#### `/api/utils/fallbackTester.ts`
```typescript
export class FallbackTester {
  async testFallbackChain(
    task: string,
    simulateFailures: string[] = []
  ): Promise<{
    chainTested: string[];
    results: Array<{
      provider: string;
      success: boolean;
      latency: number;
      error?: string;
    }>;
    finalProvider?: string;
  }> {
    const chain = this.getFallbackChain(task);
    const results = [];
    let finalProvider = null;
    
    for (const provider of chain) {
      const startTime = Date.now();
      
      if (simulateFailures.includes(provider)) {
        results.push({
          provider,
          success: false,
          latency: Date.now() - startTime,
          error: 'Simulated failure'
        });
        continue;
      }
      
      try {
        const success = await this.testProvider(provider, task);
        const latency = Date.now() - startTime;
        
        results.push({
          provider,
          success,
          latency
        });
        
        if (success && !finalProvider) {
          finalProvider = provider;
          break; // Stop at first success
        }
      } catch (error) {
        results.push({
          provider,
          success: false,
          latency: Date.now() - startTime,
          error: error.message
        });
      }
    }
    
    return {
      chainTested: chain,
      results,
      finalProvider
    };
  }
  
  private async testProvider(provider: string, task: string): Promise<boolean> {
    // Test with minimal request
    const testPrompt = 'Test prompt for fallback testing';
    
    try {
      const response = await fetch(`/api/providers/${provider}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, prompt: testPrompt })
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
  
  private getFallbackChain(task: string): string[] {
    const chains = {
      research: ['perplexity', 'anthropic', 'google', 'openai'],
      writing: ['anthropic', 'openai', 'google'],
      image: ['google', 'openai'],
      creative: ['openai', 'anthropic', 'google']
    };
    return chains[task] || chains.writing;
  }
}
```

## 📝 REQUIRED DELIVERABLES

### 1. Implementation Report
**File:** `/docs/agent-reports/AGENT-2B-FALLBACK-SYSTEM.md`
- Document fallback logic implementation
- List all retry mechanisms
- Note health monitoring setup

### 2. Fallback Configuration Guide
**File:** `/docs/FALLBACK_SYSTEM_GUIDE.md`
- How fallback chains work
- Customizing fallback order
- Understanding health monitoring
- Cost optimization strategies

### 3. Update Master Progress Log
Add completion status to `/MASTER_PROGRESS_LOG.md`

## 🔍 TESTING REQUIREMENTS

1. **Fallback Testing:**
```typescript
// Test that fallback works when primary fails
const result = await testFallbackChain('writing', ['anthropic']); // Simulate anthropic failure
expect(result.finalProvider).toBe('openai'); // Should fallback to OpenAI
```

2. **Retry Logic Testing:**
- Verify exponential backoff works
- Test max retry limits
- Ensure non-retryable errors don't retry

3. **Health Monitoring:**
- Verify health checks run periodically
- Test unhealthy provider detection
- Confirm unhealthy providers are skipped

4. **Usage Tracking:**
- Verify usage is tracked correctly
- Test cost calculations
- Check monthly limit enforcement

## ⚠️ IMPORTANT NOTES

1. **Performance:**
- Health checks should be async and non-blocking
- Cache provider availability for 5 minutes
- Use connection pooling for API calls

2. **Reliability:**
- Always have at least 2 providers in each chain
- Log all fallback events for debugging
- Monitor fallback frequency

3. **Cost Management:**
- Track costs per provider
- Alert when approaching limits
- Optimize model selection for cost

## 🚫 DO NOT

1. Retry on 4xx errors (client errors)
2. Infinite retry loops
3. Block on health checks
4. Ignore cost limits
5. Skip logging failures

## 💡 OPTIMIZATION TIPS

### Smart Provider Selection
- Consider latency for time-sensitive tasks
- Use cheaper providers for simple tasks
- Reserve premium providers for complex work

### Efficient Fallback
- Skip known unhealthy providers
- Use recent success data for ordering
- Implement circuit breakers for repeated failures

### Cost Optimization
- Use smaller models when possible
- Batch requests to reduce overhead
- Cache responses where appropriate

---

*Report completion to `/docs/agent-reports/` and update `/MASTER_PROGRESS_LOG.md`*