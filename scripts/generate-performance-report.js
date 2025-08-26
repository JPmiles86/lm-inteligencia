#!/usr/bin/env node

/**
 * Performance Report Generator
 * Consolidates performance test results from multiple sources
 */

const fs = require('fs');
const path = require('path');

class PerformanceReportGenerator {
  constructor(artifactsPath) {
    this.artifactsPath = artifactsPath;
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        overall_score: 0,
        api_performance: {},
        frontend_performance: {},
        database_performance: {},
        resource_usage: {}
      },
      details: {},
      recommendations: []
    };
  }

  async generate() {
    console.log('Generating performance report...');
    
    try {
      await this.processK6Results();
      await this.processLighthouseResults();
      await this.processDatabaseResults();
      await this.processResourceResults();
      
      this.calculateOverallScore();
      this.generateRecommendations();
      
      await this.writeReport();
      
      console.log('Performance report generated successfully');
    } catch (error) {
      console.error('Error generating performance report:', error);
      process.exit(1);
    }
  }

  async processK6Results() {
    console.log('Processing k6 performance results...');
    
    const k6Files = this.findFiles('results-*.json');
    const apiMetrics = {
      response_times: [],
      error_rates: [],
      throughput: [],
      scenarios: {}
    };

    for (const file of k6Files) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.metrics) {
          // Extract key metrics
          if (data.metrics.http_req_duration) {
            apiMetrics.response_times.push({
              scenario: this.extractScenario(file),
              avg: data.metrics.http_req_duration.values.avg,
              p95: data.metrics.http_req_duration.values.p95,
              p99: data.metrics.http_req_duration.values.p99
            });
          }

          if (data.metrics.http_req_failed) {
            apiMetrics.error_rates.push({
              scenario: this.extractScenario(file),
              rate: data.metrics.http_req_failed.values.rate
            });
          }

          if (data.metrics.iterations) {
            apiMetrics.throughput.push({
              scenario: this.extractScenario(file),
              rate: data.metrics.iterations.values.rate
            });
          }

          // Store detailed scenario data
          const scenario = this.extractScenario(file);
          apiMetrics.scenarios[scenario] = {
            duration: data.setup_data?.duration || 'unknown',
            vus: data.setup_data?.vus || 'unknown',
            metrics: data.metrics
          };
        }
      } catch (error) {
        console.warn(`Error processing k6 file ${file}:`, error.message);
      }
    }

    this.report.summary.api_performance = apiMetrics;
    this.report.details.k6_results = k6Files.map(f => path.basename(f));
  }

  async processLighthouseResults() {
    console.log('Processing Lighthouse results...');
    
    const lighthouseDir = path.join(this.artifactsPath, 'lighthouse-results-*', '.lighthouseci');
    const frontendMetrics = {
      performance_scores: [],
      core_web_vitals: {},
      accessibility_scores: [],
      best_practices_scores: [],
      seo_scores: []
    };

    try {
      if (fs.existsSync(lighthouseDir)) {
        // Process Lighthouse CI results
        const reportFiles = this.findFiles('lhr-*.json', lighthouseDir);
        
        for (const file of reportFiles) {
          try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            
            if (data.categories) {
              frontendMetrics.performance_scores.push({
                url: data.finalUrl || 'unknown',
                score: data.categories.performance?.score || 0
              });

              frontendMetrics.accessibility_scores.push({
                url: data.finalUrl || 'unknown',
                score: data.categories.accessibility?.score || 0
              });

              frontendMetrics.best_practices_scores.push({
                url: data.finalUrl || 'unknown',
                score: data.categories['best-practices']?.score || 0
              });

              frontendMetrics.seo_scores.push({
                url: data.finalUrl || 'unknown',
                score: data.categories.seo?.score || 0
              });
            }

            // Extract Core Web Vitals
            if (data.audits) {
              const cwv = {
                lcp: data.audits['largest-contentful-paint']?.numericValue || 0,
                fid: data.audits['max-potential-fid']?.numericValue || 0,
                cls: data.audits['cumulative-layout-shift']?.numericValue || 0
              };
              
              frontendMetrics.core_web_vitals[data.finalUrl || 'unknown'] = cwv;
            }
          } catch (error) {
            console.warn(`Error processing Lighthouse file ${file}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('Error processing Lighthouse results:', error.message);
    }

    this.report.summary.frontend_performance = frontendMetrics;
  }

  async processDatabaseResults() {
    console.log('Processing database performance results...');
    
    const dbFiles = this.findFiles('db-performance-results.json');
    const dbMetrics = {
      query_times: [],
      connection_pool: {},
      slow_queries: []
    };

    for (const file of dbFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.query_performance) {
          dbMetrics.query_times = data.query_performance.query_times || [];
          dbMetrics.slow_queries = data.query_performance.slow_queries || [];
        }

        if (data.connection_pool) {
          dbMetrics.connection_pool = data.connection_pool;
        }
      } catch (error) {
        console.warn(`Error processing database file ${file}:`, error.message);
      }
    }

    this.report.summary.database_performance = dbMetrics;
  }

  async processResourceResults() {
    console.log('Processing resource monitoring results...');
    
    const resourceFiles = this.findFiles('memory-usage-*.json');
    const resourceMetrics = {
      memory_usage: [],
      cpu_usage: [],
      memory_leaks: []
    };

    for (const file of resourceFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.memory) {
          resourceMetrics.memory_usage.push(data.memory);
        }

        if (data.cpu) {
          resourceMetrics.cpu_usage.push(data.cpu);
        }

        if (data.leaks) {
          resourceMetrics.memory_leaks = resourceMetrics.memory_leaks.concat(data.leaks);
        }
      } catch (error) {
        console.warn(`Error processing resource file ${file}:`, error.message);
      }
    }

    this.report.summary.resource_usage = resourceMetrics;
  }

  calculateOverallScore() {
    console.log('Calculating overall performance score...');
    
    let totalScore = 0;
    let components = 0;

    // API Performance Score (25%)
    if (this.report.summary.api_performance.response_times.length > 0) {
      const avgResponseTime = this.report.summary.api_performance.response_times.reduce(
        (sum, rt) => sum + rt.p95, 0
      ) / this.report.summary.api_performance.response_times.length;
      
      const avgErrorRate = this.report.summary.api_performance.error_rates.reduce(
        (sum, er) => sum + er.rate, 0
      ) / this.report.summary.api_performance.error_rates.length;

      // Score based on response time and error rate
      let apiScore = 1.0;
      if (avgResponseTime > 5000) apiScore -= 0.4; // -40% for >5s response time
      else if (avgResponseTime > 2000) apiScore -= 0.2; // -20% for >2s response time
      
      if (avgErrorRate > 0.05) apiScore -= 0.3; // -30% for >5% error rate
      else if (avgErrorRate > 0.01) apiScore -= 0.1; // -10% for >1% error rate

      totalScore += Math.max(0, apiScore) * 0.25;
      components++;
    }

    // Frontend Performance Score (25%)
    if (this.report.summary.frontend_performance.performance_scores.length > 0) {
      const avgFrontendScore = this.report.summary.frontend_performance.performance_scores.reduce(
        (sum, ps) => sum + ps.score, 0
      ) / this.report.summary.frontend_performance.performance_scores.length;

      totalScore += avgFrontendScore * 0.25;
      components++;
    }

    // Database Performance Score (25%)
    if (this.report.summary.database_performance.query_times.length > 0) {
      const avgQueryTime = this.report.summary.database_performance.query_times.reduce(
        (sum, qt) => sum + qt.avg_time, 0
      ) / this.report.summary.database_performance.query_times.length;

      let dbScore = 1.0;
      if (avgQueryTime > 1000) dbScore -= 0.4; // -40% for >1s average query time
      else if (avgQueryTime > 500) dbScore -= 0.2; // -20% for >500ms average query time

      totalScore += Math.max(0, dbScore) * 0.25;
      components++;
    }

    // Resource Usage Score (25%)
    if (this.report.summary.resource_usage.memory_usage.length > 0) {
      const hasMemoryLeaks = this.report.summary.resource_usage.memory_leaks.length > 0;
      let resourceScore = hasMemoryLeaks ? 0.5 : 1.0;

      totalScore += resourceScore * 0.25;
      components++;
    }

    this.report.summary.overall_score = components > 0 ? totalScore : 0;
    
    console.log(`Overall performance score: ${(this.report.summary.overall_score * 100).toFixed(1)}%`);
  }

  generateRecommendations() {
    console.log('Generating performance recommendations...');
    
    const recommendations = [];

    // API Performance Recommendations
    if (this.report.summary.api_performance.response_times.length > 0) {
      const slowResponses = this.report.summary.api_performance.response_times.filter(rt => rt.p95 > 5000);
      if (slowResponses.length > 0) {
        recommendations.push({
          category: 'API Performance',
          priority: 'High',
          issue: 'Slow API response times detected',
          recommendation: 'Optimize database queries, implement caching, or consider API rate limiting'
        });
      }

      const highErrorRates = this.report.summary.api_performance.error_rates.filter(er => er.rate > 0.05);
      if (highErrorRates.length > 0) {
        recommendations.push({
          category: 'API Reliability',
          priority: 'Critical',
          issue: 'High API error rates detected',
          recommendation: 'Investigate and fix API errors, implement better error handling and monitoring'
        });
      }
    }

    // Frontend Performance Recommendations
    if (this.report.summary.frontend_performance.performance_scores.length > 0) {
      const lowScores = this.report.summary.frontend_performance.performance_scores.filter(ps => ps.score < 0.8);
      if (lowScores.length > 0) {
        recommendations.push({
          category: 'Frontend Performance',
          priority: 'Medium',
          issue: 'Low Lighthouse performance scores',
          recommendation: 'Optimize images, implement code splitting, minimize JavaScript, and use CDN'
        });
      }
    }

    // Database Performance Recommendations
    if (this.report.summary.database_performance.slow_queries.length > 0) {
      recommendations.push({
        category: 'Database Performance',
        priority: 'High',
        issue: 'Slow database queries detected',
        recommendation: 'Add database indexes, optimize query structure, or implement query caching'
      });
    }

    // Resource Usage Recommendations
    if (this.report.summary.resource_usage.memory_leaks.length > 0) {
      recommendations.push({
        category: 'Resource Usage',
        priority: 'Critical',
        issue: 'Memory leaks detected',
        recommendation: 'Investigate and fix memory leaks, implement proper cleanup in event handlers'
      });
    }

    this.report.recommendations = recommendations;
  }

  async writeReport() {
    console.log('Writing performance report files...');
    
    // Write JSON summary
    fs.writeFileSync('performance-summary.json', JSON.stringify(this.report.summary, null, 2));

    // Write HTML report
    const htmlReport = this.generateHtmlReport();
    fs.writeFileSync('performance-report.html', htmlReport);

    console.log('Performance report files written successfully');
  }

  generateHtmlReport() {
    const overallPercentage = (this.report.summary.overall_score * 100).toFixed(1);
    const scoreColor = this.report.summary.overall_score >= 0.8 ? 'green' : 
                      this.report.summary.overall_score >= 0.6 ? 'orange' : 'red';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Content Generation System - Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .section h2 { margin-top: 0; color: #333; }
        .metric { margin: 10px 0; }
        .recommendation { margin: 10px 0; padding: 10px; background: #f5f5f5; border-left: 4px solid #007cba; }
        .critical { border-left-color: #dc3545; }
        .high { border-left-color: #fd7e14; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Content Generation System</h1>
        <h2>Performance Report</h2>
        <div class="score">${overallPercentage}%</div>
        <p>Generated on: ${new Date(this.report.timestamp).toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>API Performance</h2>
        <div class="metric">
            <strong>Average Response Times:</strong>
            ${this.report.summary.api_performance.response_times.map(rt => 
              `<div>${rt.scenario}: P95 ${rt.p95}ms, P99 ${rt.p99}ms</div>`
            ).join('')}
        </div>
        <div class="metric">
            <strong>Error Rates:</strong>
            ${this.report.summary.api_performance.error_rates.map(er => 
              `<div>${er.scenario}: ${(er.rate * 100).toFixed(2)}%</div>`
            ).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Frontend Performance</h2>
        <div class="metric">
            <strong>Lighthouse Scores:</strong>
            ${this.report.summary.frontend_performance.performance_scores.map(ps => 
              `<div>${ps.url}: ${(ps.score * 100).toFixed(0)}%</div>`
            ).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Database Performance</h2>
        <div class="metric">
            <strong>Query Performance:</strong>
            ${this.report.summary.database_performance.query_times.length > 0 ? 
              this.report.summary.database_performance.query_times.map(qt => 
                `<div>${qt.query}: ${qt.avg_time}ms average</div>`
              ).join('') : 
              '<div>No database performance data available</div>'
            }
        </div>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        ${this.report.recommendations.map(rec => 
          `<div class="recommendation ${rec.priority.toLowerCase()}">
             <strong>${rec.category} (${rec.priority} Priority):</strong><br>
             ${rec.issue}<br>
             <em>Recommendation: ${rec.recommendation}</em>
           </div>`
        ).join('')}
    </div>
</body>
</html>
    `;
  }

  findFiles(pattern, basePath = this.artifactsPath) {
    const files = [];
    
    if (!fs.existsSync(basePath)) {
      return files;
    }

    const traverse = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          // Simple pattern matching
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            if (regex.test(entry.name)) {
              files.push(fullPath);
            }
          } else if (entry.name === pattern) {
            files.push(fullPath);
          }
        }
      }
    };

    traverse(basePath);
    return files;
  }

  extractScenario(filename) {
    const match = filename.match(/results-(.+)\.json/);
    return match ? match[1] : 'unknown';
  }
}

// Main execution
const main = async () => {
  const artifactsPath = process.argv[2] || './performance-artifacts';
  
  if (!fs.existsSync(artifactsPath)) {
    console.error(`Artifacts path does not exist: ${artifactsPath}`);
    process.exit(1);
  }

  const generator = new PerformanceReportGenerator(artifactsPath);
  await generator.generate();
};

if (require.main === module) {
  main().catch(error => {
    console.error('Failed to generate performance report:', error);
    process.exit(1);
  });
}

module.exports = PerformanceReportGenerator;