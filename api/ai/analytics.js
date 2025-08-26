// Analytics and Reporting API Endpoints
// Handles usage statistics, cost tracking, and performance metrics

import { AnalyticsService } from '../../src/services/ai/AnalyticsService.js';

const analyticsService = new AnalyticsService();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetAnalytics(req, res);
      case 'POST':
        return await handleLogUsage(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function handleGetAnalytics(req, res) {
  const { report } = req.query;

  switch (report) {
    case 'usage-summary':
      // Get overall usage summary
      const { timeframe = 'month', provider } = req.query;
      const usageSummary = await analyticsService.getUsageSummary({
        timeframe,
        provider
      });
      return res.json({
        success: true,
        data: usageSummary
      });

    case 'cost-breakdown':
      // Get detailed cost breakdown
      const { period = 'month', groupBy = 'provider' } = req.query;
      const costBreakdown = await analyticsService.getCostBreakdown({
        period,
        groupBy // provider, model, task, vertical
      });
      return res.json({
        success: true,
        data: costBreakdown
      });

    case 'performance-metrics':
      // Get performance metrics
      const { metric = 'latency', timeRange = 'week' } = req.query;
      const performanceMetrics = await analyticsService.getPerformanceMetrics({
        metric, // latency, tokens_per_second, success_rate
        timeRange
      });
      return res.json({
        success: true,
        data: performanceMetrics
      });

    case 'provider-comparison':
      // Compare providers across metrics
      const { metrics = 'cost,latency,success_rate' } = req.query;
      const comparison = await analyticsService.compareProviders({
        metrics: metrics.split(',')
      });
      return res.json({
        success: true,
        data: comparison
      });

    case 'usage-trends':
      // Get usage trends over time
      const { 
        interval = 'day', // day, week, month
        duration = '30d',
        taskType,
        vertical: trendVertical
      } = req.query;
      const trends = await analyticsService.getUsageTrends({
        interval,
        duration,
        taskType,
        vertical: trendVertical
      });
      return res.json({
        success: true,
        data: trends
      });

    case 'top-tasks':
      // Get most popular tasks
      const { 
        period: taskPeriod = 'month',
        limit: taskLimit = 10,
        vertical: taskVertical
      } = req.query;
      const topTasks = await analyticsService.getTopTasks({
        period: taskPeriod,
        limit: parseInt(taskLimit),
        vertical: taskVertical
      });
      return res.json({
        success: true,
        data: topTasks
      });

    case 'error-analysis':
      // Analyze errors and failures
      const { 
        period: errorPeriod = 'week',
        provider: errorProvider
      } = req.query;
      const errorAnalysis = await analyticsService.getErrorAnalysis({
        period: errorPeriod,
        provider: errorProvider
      });
      return res.json({
        success: true,
        data: errorAnalysis
      });

    case 'cost-projections':
      // Project costs based on current usage
      const { projectionPeriod = 'month' } = req.query;
      const projections = await analyticsService.getCostProjections({
        period: projectionPeriod
      });
      return res.json({
        success: true,
        data: projections
      });

    case 'efficiency-report':
      // Analyze efficiency across different configurations
      const { 
        compareBy = 'model', // model, provider, task
        timeframe: efficiencyTimeframe = 'month'
      } = req.query;
      const efficiencyReport = await analyticsService.getEfficiencyReport({
        compareBy,
        timeframe: efficiencyTimeframe
      });
      return res.json({
        success: true,
        data: efficiencyReport
      });

    case 'dashboard':
      // Get dashboard summary with key metrics
      const dashboard = await analyticsService.getDashboardSummary();
      return res.json({
        success: true,
        data: dashboard
      });

    case 'export':
      // Export analytics data
      const { 
        format = 'json', // json, csv
        reportType,
        dateRange
      } = req.query;
      
      if (!reportType) {
        return res.status(400).json({ error: 'Report type required' });
      }

      const exportData = await analyticsService.exportData({
        reportType,
        format,
        dateRange: dateRange ? JSON.parse(dateRange) : undefined
      });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${Date.now()}.csv"`);
        return res.send(exportData);
      }

      return res.json({
        success: true,
        data: exportData
      });

    case 'real-time':
      // Get real-time usage statistics
      const realTimeStats = await analyticsService.getRealTimeStats();
      return res.json({
        success: true,
        data: realTimeStats
      });

    case 'alerts':
      // Get usage alerts and warnings
      const alerts = await analyticsService.getUsageAlerts();
      return res.json({
        success: true,
        data: alerts
      });

    default:
      // Default: return general analytics
      const generalAnalytics = await analyticsService.getGeneralAnalytics();
      return res.json({
        success: true,
        data: generalAnalytics
      });
  }
}

async function handleLogUsage(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'generation':
      // Log a generation event
      const generationData = {
        task: req.body.task,
        mode: req.body.mode,
        vertical: req.body.vertical,
        provider: req.body.provider,
        model: req.body.model,
        success: req.body.success,
        tokensUsed: req.body.tokensUsed,
        cost: req.body.cost,
        latencyMs: req.body.latencyMs,
        error: req.body.error
      };
      
      await analyticsService.logGeneration(generationData);
      return res.json({
        success: true,
        message: 'Generation logged successfully'
      });

    case 'batch':
      // Log multiple events in batch
      const { events } = req.body;
      await analyticsService.logBatch(events);
      return res.json({
        success: true,
        message: `${events.length} events logged successfully`
      });

    case 'update-analytics':
      // Update analytics aggregations
      await analyticsService.updateAnalytics();
      return res.json({
        success: true,
        message: 'Analytics updated successfully'
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}