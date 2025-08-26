#!/usr/bin/env node

/**
 * Coverage Percentage Calculator
 * Returns the overall coverage percentage for CI/CD quality gates
 */

const fs = require('fs');

function getCoveragePercentage() {
  const summaryPaths = [
    'coverage/coverage-summary.json',
    'coverage/lcov-report/coverage-summary.json'
  ];

  for (const summaryPath of summaryPaths) {
    if (fs.existsSync(summaryPath)) {
      try {
        const coverageSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        
        if (coverageSummary.total) {
          // Calculate weighted average of all metrics
          const total = coverageSummary.total;
          const metrics = ['statements', 'branches', 'functions', 'lines'];
          
          const average = metrics.reduce((sum, metric) => 
            sum + total[metric].pct, 0
          ) / metrics.length;
          
          return average.toFixed(2);
        }
      } catch (error) {
        // Continue to next path
      }
    }
  }

  return '0.00';
}

const percentage = getCoveragePercentage();
console.log(percentage);

module.exports = { getCoveragePercentage };