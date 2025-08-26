// Analytics Service - Tracks AI usage, performance, and costs
// Handles logging, metrics, and reporting for AI generations

import { aiRepository } from '../../repositories/aiRepository.js';

export class AnalyticsService {
  constructor() {
    this.metricsBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 30000; // 30 seconds
    this.startFlushTimer();
  }

  // ================================
  // USAGE LOGGING
  // ================================

  async logGeneration(generationData) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        task: generationData.task,
        mode: generationData.mode || 'direct',
        vertical: generationData.vertical || 'all',
        provider: generationData.provider,
        model: generationData.model,
        success: generationData.success,
        tokensInput: generationData.tokensInput || 0,
        tokensOutput: generationData.tokensOutput || 0,
        tokensTotal: generationData.tokensUsed || 0,
        cost: generationData.cost || 0,
        latencyMs: generationData.latencyMs || 0,
        error: generationData.error || null,
        nodeId: generationData.nodeId || null,
        rootNodeId: generationData.rootNodeId || null,
        streaming: generationData.streaming || false
      };

      // Add to buffer for batch processing
      this.metricsBuffer.push(logEntry);

      // Flush if buffer is full
      if (this.metricsBuffer.length >= this.bufferSize) {
        await this.flushMetrics();
      }

      return logEntry;
    } catch (error) {
      console.error('Error logging generation:', error);
    }
  }

  async logProviderHealth(provider, healthData) {
    try {
      const healthEntry = {
        timestamp: new Date().toISOString(),
        provider,
        status: healthData.status,
        latencyMs: healthData.latencyMs,
        error: healthData.error || null,
        details: healthData.details || {}
      };

      await aiRepository.logProviderHealth(healthEntry);
      return healthEntry;
    } catch (error) {
      console.error('Error logging provider health:', error);
    }
  }

  async logCostAlert(alertData) {
    try {
      const alertEntry = {
        timestamp: new Date().toISOString(),
        type: alertData.type, // 'daily_limit', 'monthly_limit', 'cost_spike'
        provider: alertData.provider,
        threshold: alertData.threshold,
        actual: alertData.actual,
        percentage: alertData.percentage,
        message: alertData.message
      };

      await aiRepository.logCostAlert(alertEntry);
      return alertEntry;
    } catch (error) {
      console.error('Error logging cost alert:', error);
    }
  }

  // ================================
  // METRICS & REPORTING
  // ================================

  async getUsageStats(timeRange = '24h') {
    try {
      const stats = await aiRepository.getUsageStats(timeRange);
      
      return {
        timeRange,
        totalGenerations: stats.totalGenerations || 0,
        successfulGenerations: stats.successfulGenerations || 0,
        failedGenerations: stats.failedGenerations || 0,
        successRate: stats.totalGenerations > 0 
          ? (stats.successfulGenerations / stats.totalGenerations * 100).toFixed(2) + '%'
          : '0%',
        totalTokens: stats.totalTokens || 0,
        totalCost: stats.totalCost || 0,
        averageLatency: stats.averageLatency || 0,
        byProvider: stats.byProvider || {},
        byTask: stats.byTask || {},
        byVertical: stats.byVertical || {},
        hourlyBreakdown: stats.hourlyBreakdown || []
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw new Error(`Failed to get usage stats: ${error.message}`);
    }
  }

  async getProviderComparison(timeRange = '7d') {
    try {
      const comparison = await aiRepository.getProviderComparison(timeRange);
      
      return comparison.map(provider => ({
        provider: provider.provider,
        totalGenerations: provider.totalGenerations,
        successRate: provider.successRate,
        averageLatency: provider.averageLatency,
        totalCost: provider.totalCost,
        costPerGeneration: provider.totalGenerations > 0 
          ? (provider.totalCost / provider.totalGenerations).toFixed(4)
          : 0,
        tokensPerGeneration: provider.totalGenerations > 0
          ? Math.round(provider.totalTokens / provider.totalGenerations)
          : 0,
        topModels: provider.topModels || [],
        topTasks: provider.topTasks || []
      }));
    } catch (error) {
      console.error('Error getting provider comparison:', error);
      throw new Error(`Failed to get provider comparison: ${error.message}`);
    }
  }

  async getCostTrends(timeRange = '30d') {
    try {
      const trends = await aiRepository.getCostTrends(timeRange);
      
      return {
        timeRange,
        totalCost: trends.totalCost || 0,
        dailyAverage: trends.dailyAverage || 0,
        trend: trends.trend || 'stable', // 'increasing', 'decreasing', 'stable'
        trendPercentage: trends.trendPercentage || 0,
        dailyBreakdown: trends.dailyBreakdown || [],
        byProvider: trends.byProvider || {},
        projectedMonthlyCost: trends.projectedMonthlyCost || 0,
        alerts: trends.alerts || []
      };
    } catch (error) {
      console.error('Error getting cost trends:', error);
      throw new Error(`Failed to get cost trends: ${error.message}`);
    }
  }

  async getPerformanceMetrics(timeRange = '24h') {
    try {
      const metrics = await aiRepository.getPerformanceMetrics(timeRange);
      
      return {
        timeRange,
        averageLatency: metrics.averageLatency || 0,
        medianLatency: metrics.medianLatency || 0,
        p95Latency: metrics.p95Latency || 0,
        p99Latency: metrics.p99Latency || 0,
        timeouts: metrics.timeouts || 0,
        errors: metrics.errors || 0,
        retries: metrics.retries || 0,
        cacheHitRate: metrics.cacheHitRate || 0,
        byProvider: metrics.byProvider || {},
        byTask: metrics.byTask || {},
        latencyDistribution: metrics.latencyDistribution || []
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error.message}`);
    }
  }

  // ================================
  // COST MONITORING & ALERTS
  // ================================

  async checkCostThresholds() {
    try {
      const providers = await aiRepository.getProviders();
      const alerts = [];

      for (const provider of providers) {
        // Check daily limits
        if (provider.dailyLimit) {
          const dailyUsage = await aiRepository.getProviderUsage(provider.provider, 'day');
          const dailyPercentage = (dailyUsage.cost / provider.dailyLimit) * 100;

          if (dailyPercentage >= 90) {
            alerts.push({
              type: 'daily_limit',
              provider: provider.provider,
              threshold: provider.dailyLimit,
              actual: dailyUsage.cost,
              percentage: dailyPercentage,
              message: `${provider.provider} is at ${dailyPercentage.toFixed(1)}% of daily limit`
            });
          }
        }

        // Check monthly limits
        if (provider.monthlyLimit) {
          const monthlyUsage = await aiRepository.getProviderUsage(provider.provider, 'month');
          const monthlyPercentage = (monthlyUsage.cost / provider.monthlyLimit) * 100;

          if (monthlyPercentage >= 80) {
            alerts.push({
              type: 'monthly_limit',
              provider: provider.provider,
              threshold: provider.monthlyLimit,
              actual: monthlyUsage.cost,
              percentage: monthlyPercentage,
              message: `${provider.provider} is at ${monthlyPercentage.toFixed(1)}% of monthly limit`
            });
          }
        }

        // Check for cost spikes
        const costSpike = await this.detectCostSpike(provider.provider);
        if (costSpike) {
          alerts.push(costSpike);
        }
      }

      // Log alerts
      for (const alert of alerts) {
        await this.logCostAlert(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking cost thresholds:', error);
      return [];
    }
  }

  async detectCostSpike(provider, threshold = 200) { // 200% increase
    try {
      const currentHour = await aiRepository.getProviderUsage(provider, 'hour');
      const previousHour = await aiRepository.getProviderUsage(provider, 'hour', -1);

      if (previousHour.cost === 0 || currentHour.cost === 0) {
        return null;
      }

      const increasePercentage = ((currentHour.cost - previousHour.cost) / previousHour.cost) * 100;

      if (increasePercentage >= threshold) {
        return {
          type: 'cost_spike',
          provider,
          threshold,
          actual: increasePercentage,
          percentage: increasePercentage,
          message: `${provider} cost increased by ${increasePercentage.toFixed(1)}% in the last hour`
        };
      }

      return null;
    } catch (error) {
      console.error('Error detecting cost spike:', error);
      return null;
    }
  }

  // ================================
  // OPTIMIZATION SUGGESTIONS
  // ================================

  async generateOptimizationSuggestions(timeRange = '7d') {
    try {
      const stats = await this.getUsageStats(timeRange);
      const comparison = await this.getProviderComparison(timeRange);
      const suggestions = [];

      // Model optimization suggestions
      for (const provider of comparison) {
        if (provider.costPerGeneration > 0.05) { // $0.05 per generation threshold
          suggestions.push({
            type: 'cost_optimization',
            priority: 'high',
            provider: provider.provider,
            suggestion: `Consider using more cost-effective models for simple tasks. Current average: $${provider.costPerGeneration}/generation`,
            potentialSavings: provider.totalCost * 0.3 // Estimated 30% savings
          });
        }

        if (provider.averageLatency > 10000) { // 10 second threshold
          suggestions.push({
            type: 'performance_optimization',
            priority: 'medium',
            provider: provider.provider,
            suggestion: `High latency detected (${(provider.averageLatency / 1000).toFixed(1)}s). Consider using faster models or implementing caching`,
            impact: 'Improved user experience'
          });
        }
      }

      // Caching suggestions
      const cacheStats = await aiRepository.getCacheStats();
      if (cacheStats.hitRate < 20) {
        suggestions.push({
          type: 'caching_optimization',
          priority: 'medium',
          suggestion: `Low cache hit rate (${cacheStats.hitRate}%). Enable prompt caching for frequently used contexts`,
          potentialSavings: stats.totalCost * 0.15
        });
      }

      // Provider diversification
      const activeProviders = comparison.filter(p => p.totalGenerations > 0).length;
      if (activeProviders < 2) {
        suggestions.push({
          type: 'reliability_optimization',
          priority: 'low',
          suggestion: 'Consider using multiple providers for better reliability and cost optimization',
          impact: 'Improved reliability and fallback options'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      return [];
    }
  }

  // ================================
  // BATCH PROCESSING
  // ================================

  startFlushTimer() {
    setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flushMetrics().catch(console.error);
      }
    }, this.flushInterval);
  }

  async flushMetrics() {
    if (this.metricsBuffer.length === 0) return;

    try {
      const batch = [...this.metricsBuffer];
      this.metricsBuffer = [];

      await aiRepository.batchLogUsage(batch);
      console.log(`Flushed ${batch.length} metrics to database`);
    } catch (error) {
      console.error('Error flushing metrics:', error);
      // Re-add failed metrics to buffer for retry
      this.metricsBuffer.unshift(...this.metricsBuffer);
    }
  }

  // ================================
  // EXPORT & REPORTING
  // ================================

  async exportUsageReport(timeRange = '30d', format = 'json') {
    try {
      const stats = await this.getUsageStats(timeRange);
      const comparison = await this.getProviderComparison(timeRange);
      const trends = await this.getCostTrends(timeRange);
      const performance = await this.getPerformanceMetrics(timeRange);
      const suggestions = await this.generateOptimizationSuggestions(timeRange);

      const report = {
        reportInfo: {
          timeRange,
          generatedAt: new Date().toISOString(),
          format
        },
        summary: stats,
        providerComparison: comparison,
        costTrends: trends,
        performance,
        optimizationSuggestions: suggestions
      };

      switch (format) {
        case 'json':
          return JSON.stringify(report, null, 2);
        case 'csv':
          return this.generateCSVReport(report);
        case 'markdown':
          return this.generateMarkdownReport(report);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting usage report:', error);
      throw new Error(`Failed to export usage report: ${error.message}`);
    }
  }

  generateMarkdownReport(report) {
    let markdown = `# AI Usage Report\n\n`;
    markdown += `**Time Range:** ${report.reportInfo.timeRange}\n`;
    markdown += `**Generated:** ${report.reportInfo.generatedAt}\n\n`;

    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Total Generations:** ${report.summary.totalGenerations}\n`;
    markdown += `- **Success Rate:** ${report.summary.successRate}\n`;
    markdown += `- **Total Cost:** $${report.summary.totalCost.toFixed(4)}\n`;
    markdown += `- **Total Tokens:** ${report.summary.totalTokens.toLocaleString()}\n`;
    markdown += `- **Average Latency:** ${report.summary.averageLatency}ms\n\n`;

    // Provider comparison
    markdown += `## Provider Comparison\n\n`;
    markdown += `| Provider | Generations | Success Rate | Avg Latency | Total Cost | Cost/Gen |\n`;
    markdown += `|----------|-------------|--------------|-------------|------------|---------|\n`;
    
    for (const provider of report.providerComparison) {
      markdown += `| ${provider.provider} | ${provider.totalGenerations} | ${provider.successRate}% | ${provider.averageLatency}ms | $${provider.totalCost.toFixed(4)} | $${provider.costPerGeneration} |\n`;
    }

    // Optimization suggestions
    if (report.optimizationSuggestions.length > 0) {
      markdown += `\n## Optimization Suggestions\n\n`;
      for (const suggestion of report.optimizationSuggestions) {
        markdown += `- **${suggestion.type}** (${suggestion.priority}): ${suggestion.suggestion}\n`;
      }
    }

    return markdown;
  }

  generateCSVReport(report) {
    // Generate CSV for provider comparison
    const headers = ['Provider', 'Generations', 'Success_Rate', 'Avg_Latency', 'Total_Cost', 'Cost_Per_Generation'];
    const rows = report.providerComparison.map(p => [
      p.provider,
      p.totalGenerations,
      p.successRate,
      p.averageLatency,
      p.totalCost,
      p.costPerGeneration
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // ================================
  // CLEANUP
  // ================================

  async cleanup() {
    // Flush any remaining metrics
    await this.flushMetrics();
  }
}