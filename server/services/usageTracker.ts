/**
 * Usage Tracker Service
 * 
 * Tracks AI provider usage including:
 * - Token consumption and costs
 * - Performance metrics
 * - Monthly limits monitoring
 * - Real-time statistics
 */

import { eq, and, gte, sql } from 'drizzle-orm';
import { db } from '../../api/index.js';
import { providerSettings } from '../../src/db/schema.js';
import { intelligentProviderSelector } from './intelligentProviderSelector.js';

interface UsageRecord {
  provider: string;
  task: string;
  tokensUsed: number;
  cost: number;
  duration: number;
  success: boolean;
  timestamp: Date;
  model: string;
  errorMessage?: string;
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
  byTask: Record<string, {
    tokens: number;
    cost: number;
    calls: number;
    avgLatency: number;
  }>;
  timeRange: {
    from: Date;
    to: Date;
  };
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

export class UsageTracker {
  private usageHistory: UsageRecord[] = [];
  private readonly MAX_HISTORY_SIZE = 10000; // Keep last 10k records in memory
  
  /**
   * Track usage for a provider operation
   */
  async trackUsage(record: UsageRecord): Promise<void> {
    try {
      // Add to in-memory history
      this.usageHistory.push(record);
      
      // Maintain history size limit
      if (this.usageHistory.length > this.MAX_HISTORY_SIZE) {
        this.usageHistory = this.usageHistory.slice(-this.MAX_HISTORY_SIZE);
      }
      
      // Update database usage counter
      await this.updateDatabaseUsage(record);
      
      // Check and enforce usage limits
      await this.checkUsageLimits(record.provider);
      
      // Update provider health status
      intelligentProviderSelector.updateProviderHealth(
        record.provider, 
        record.success, 
        record.duration
      );
      
      // Log significant usage or errors
      if (!record.success || record.cost > 1.0) {
        console.log(`Usage tracked: ${record.provider} ${record.task} - ${record.tokensUsed} tokens, $${record.cost.toFixed(4)}, ${record.duration}ms, success: ${record.success}`);
      }
      
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }
  
  /**
   * Update database with usage information
   */
  private async updateDatabaseUsage(record: UsageRecord): Promise<void> {
    try {
      await db.update(providerSettings)
        .set({
          currentUsage: sql`COALESCE(current_usage, 0) + ${record.cost}`,
          updatedAt: new Date()
        })
        .where(eq(providerSettings.provider, record.provider as any));
    } catch (error) {
      console.error('Failed to update database usage:', error);
      // Don't throw - this shouldn't break the main operation
    }
  }
  
  /**
   * Check and enforce usage limits
   */
  private async checkUsageLimits(provider: string): Promise<void> {
    try {
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, provider as any))
        .limit(1);
      
      if (settings.length > 0) {
        const { monthlyLimit, currentUsage } = settings[0];
        
        if (monthlyLimit && currentUsage) {
          const usage = parseFloat(currentUsage.toString());
          const limit = parseFloat(monthlyLimit.toString());
          
          if (usage >= limit) {
            // Disable provider if limit reached
            await db.update(providerSettings)
              .set({ active: false })
              .where(eq(providerSettings.provider, provider as any));
            
            console.warn(`Provider ${provider} disabled - monthly limit exceeded: $${usage.toFixed(2)} >= $${limit.toFixed(2)}`);
          } else if (usage >= limit * 0.9) {
            // Warning at 90% usage
            console.warn(`Provider ${provider} approaching limit: $${usage.toFixed(2)} / $${limit.toFixed(2)} (${((usage/limit) * 100).toFixed(1)}%)`);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to check usage limits for ${provider}:`, error);
    }
  }
  
  /**
   * Get comprehensive usage statistics
   */
  async getUsageStats(provider?: string, days: number = 30): Promise<UsageStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Filter relevant usage records
    const relevantUsage = this.usageHistory.filter(record => {
      if (provider && record.provider !== provider) return false;
      return record.timestamp >= cutoffDate;
    });
    
    if (relevantUsage.length === 0) {
      return this.getEmptyStats(cutoffDate, new Date());
    }
    
    // Calculate aggregate stats
    const totalTokens = relevantUsage.reduce((sum, record) => sum + record.tokensUsed, 0);
    const totalCost = relevantUsage.reduce((sum, record) => sum + record.cost, 0);
    const totalDuration = relevantUsage.reduce((sum, record) => sum + record.duration, 0);
    const successCount = relevantUsage.filter(record => record.success).length;
    
    // Calculate by-provider stats
    const byProvider: Record<string, any> = {};
    const byTask: Record<string, any> = {};
    
    for (const record of relevantUsage) {
      // Provider stats
      if (!byProvider[record.provider]) {
        byProvider[record.provider] = {
          tokens: 0,
          cost: 0,
          calls: 0,
          totalDuration: 0,
          successes: 0,
          lastUsed: record.timestamp
        };
      }
      
      const providerStats = byProvider[record.provider];
      providerStats.tokens += record.tokensUsed;
      providerStats.cost += record.cost;
      providerStats.calls++;
      providerStats.totalDuration += record.duration;
      if (record.success) providerStats.successes++;
      if (record.timestamp > providerStats.lastUsed) {
        providerStats.lastUsed = record.timestamp;
      }
      
      // Task stats
      if (!byTask[record.task]) {
        byTask[record.task] = {
          tokens: 0,
          cost: 0,
          calls: 0,
          totalDuration: 0
        };
      }
      
      const taskStats = byTask[record.task];
      taskStats.tokens += record.tokensUsed;
      taskStats.cost += record.cost;
      taskStats.calls++;
      taskStats.totalDuration += record.duration;
    }
    
    // Calculate averages and rates
    for (const provider in byProvider) {
      const stats = byProvider[provider];
      stats.avgLatency = stats.totalDuration / stats.calls;
      stats.successRate = stats.successes / stats.calls;
      delete stats.totalDuration;
      delete stats.successes;
    }
    
    for (const task in byTask) {
      const stats = byTask[task];
      stats.avgLatency = stats.totalDuration / stats.calls;
      delete stats.totalDuration;
    }
    
    return {
      totalTokens,
      totalCost,
      averageLatency: totalDuration / relevantUsage.length,
      successRate: successCount / relevantUsage.length,
      requestCount: relevantUsage.length,
      byProvider,
      byTask,
      timeRange: {
        from: cutoffDate,
        to: new Date()
      }
    };
  }
  
  /**
   * Get monthly usage status for all providers
   */
  async getMonthlyUsage(): Promise<MonthlyUsage[]> {
    try {
      const providers = await db.select().from(providerSettings);
      const monthlyUsageData: MonthlyUsage[] = [];
      
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysPassed = now.getDate();
      const daysRemaining = daysInMonth - daysPassed;
      
      for (const provider of providers) {
        const currentUsage = parseFloat(provider.currentUsage?.toString() || '0');
        const limit = parseFloat(provider.monthlyLimit?.toString() || '0');
        
        if (limit > 0) {
          const percentage = (currentUsage / limit) * 100;
          const projected = (currentUsage / daysPassed) * daysInMonth;
          
          let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
          if (percentage >= 100) status = 'exceeded';
          else if (percentage >= 90) status = 'critical';
          else if (percentage >= 75) status = 'warning';
          
          monthlyUsageData.push({
            provider: provider.provider,
            currentUsage,
            limit,
            percentage,
            daysRemaining,
            projected,
            status
          });
        }
      }
      
      return monthlyUsageData.sort((a, b) => b.percentage - a.percentage);
    } catch (error) {
      console.error('Failed to get monthly usage:', error);
      return [];
    }
  }
  
  /**
   * Get cost breakdown by time period
   */
  async getCostBreakdown(days: number = 30): Promise<{
    daily: Array<{ date: string; cost: number; tokens: number; requests: number }>;
    hourly: Array<{ hour: number; cost: number; tokens: number; requests: number }>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantUsage = this.usageHistory.filter(record => 
      record.timestamp >= cutoffDate
    );
    
    // Daily breakdown
    const dailyMap = new Map<string, { cost: number; tokens: number; requests: number }>();
    const hourlyMap = new Map<number, { cost: number; tokens: number; requests: number }>();
    
    for (const record of relevantUsage) {
      // Daily aggregation
      const dateKey = record.timestamp.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { cost: 0, tokens: 0, requests: 0 });
      }
      const dailyStats = dailyMap.get(dateKey)!;
      dailyStats.cost += record.cost;
      dailyStats.tokens += record.tokensUsed;
      dailyStats.requests++;
      
      // Hourly aggregation
      const hour = record.timestamp.getHours();
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { cost: 0, tokens: 0, requests: 0 });
      }
      const hourlyStats = hourlyMap.get(hour)!;
      hourlyStats.cost += record.cost;
      hourlyStats.tokens += record.tokensUsed;
      hourlyStats.requests++;
    }
    
    return {
      daily: Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        ...stats
      })).sort((a, b) => a.date.localeCompare(b.date)),
      
      hourly: Array.from(hourlyMap.entries()).map(([hour, stats]) => ({
        hour,
        ...stats
      })).sort((a, b) => a.hour - b.hour)
    };
  }
  
  /**
   * Get provider performance comparison
   */
  async getProviderComparison(days: number = 7): Promise<{
    providers: Array<{
      name: string;
      avgLatency: number;
      successRate: number;
      costPerToken: number;
      totalCost: number;
      totalTokens: number;
      requests: number;
    }>;
    bestBy: {
      speed: string;
      reliability: string;
      cost: string;
      volume: string;
    };
  }> {
    const stats = await this.getUsageStats(undefined, days);
    
    const providers = Object.entries(stats.byProvider).map(([name, data]) => ({
      name,
      avgLatency: data.avgLatency,
      successRate: data.successRate,
      costPerToken: data.tokens > 0 ? data.cost / data.tokens : 0,
      totalCost: data.cost,
      totalTokens: data.tokens,
      requests: data.calls
    }));
    
    const bestBy = {
      speed: providers.reduce((best, current) => 
        current.avgLatency < best.avgLatency ? current : best, providers[0])?.name || 'none',
      reliability: providers.reduce((best, current) => 
        current.successRate > best.successRate ? current : best, providers[0])?.name || 'none',
      cost: providers.reduce((best, current) => 
        current.costPerToken < best.costPerToken ? current : best, providers[0])?.name || 'none',
      volume: providers.reduce((best, current) => 
        current.totalTokens > best.totalTokens ? current : best, providers[0])?.name || 'none'
    };
    
    return {
      providers: providers.sort((a, b) => b.totalCost - a.totalCost),
      bestBy
    };
  }
  
  /**
   * Reset monthly usage counters (typically called on the first of each month)
   */
  async resetMonthlyCounters(): Promise<void> {
    try {
      await db.update(providerSettings)
        .set({
          currentUsage: sql`0`,
          lastResetDate: new Date(),
          updatedAt: new Date()
        });
      
      console.log('Monthly usage counters reset successfully');
    } catch (error) {
      console.error('Failed to reset monthly counters:', error);
      throw error;
    }
  }
  
  /**
   * Get empty stats structure
   */
  private getEmptyStats(from: Date, to: Date): UsageStats {
    return {
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      successRate: 0,
      requestCount: 0,
      byProvider: {},
      byTask: {},
      timeRange: { from, to }
    };
  }
  
  /**
   * Export usage data for analysis
   */
  async exportUsageData(
    startDate: Date, 
    endDate: Date, 
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const relevantUsage = this.usageHistory.filter(record => 
      record.timestamp >= startDate && record.timestamp <= endDate
    );
    
    if (format === 'csv') {
      const headers = ['timestamp', 'provider', 'task', 'model', 'tokensUsed', 'cost', 'duration', 'success', 'errorMessage'];
      const rows = relevantUsage.map(record => [
        record.timestamp.toISOString(),
        record.provider,
        record.task,
        record.model,
        record.tokensUsed,
        record.cost,
        record.duration,
        record.success,
        record.errorMessage || ''
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    
    return JSON.stringify(relevantUsage, null, 2);
  }
  
  /**
   * Get current in-memory usage count
   */
  getInMemoryRecordCount(): number {
    return this.usageHistory.length;
  }
}

// Export singleton instance
export const usageTracker = new UsageTracker();