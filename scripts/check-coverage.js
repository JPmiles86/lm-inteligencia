#!/usr/bin/env node

/**
 * Coverage Threshold Checker
 * Validates that code coverage meets required thresholds
 */

const fs = require('fs');
const path = require('path');

class CoverageChecker {
  constructor() {
    this.thresholds = {
      global: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      },
      critical: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95
      }
    };

    this.criticalPaths = [
      'src/services/ai/',
      'src/repositories/aiRepository.ts',
      'api/ai/',
      'src/components/ai/'
    ];
  }

  async checkCoverage() {
    console.log('Checking coverage thresholds...');
    
    try {
      const coverageSummary = this.loadCoverageSummary();
      
      if (!coverageSummary) {
        console.error('No coverage summary found. Run tests with coverage first.');
        process.exit(1);
      }

      const globalResult = this.checkGlobalCoverage(coverageSummary.total);
      const criticalResult = this.checkCriticalPathsCoverage(coverageSummary);

      if (globalResult && criticalResult) {
        console.log('✅ All coverage thresholds met!');
        process.exit(0);
      } else {
        console.error('❌ Coverage thresholds not met');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error checking coverage:', error);
      process.exit(1);
    }
  }

  loadCoverageSummary() {
    const summaryPaths = [
      'coverage/coverage-summary.json',
      'coverage/lcov-report/coverage-summary.json'
    ];

    for (const summaryPath of summaryPaths) {
      if (fs.existsSync(summaryPath)) {
        try {
          return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        } catch (error) {
          console.warn(`Error reading ${summaryPath}:`, error.message);
        }
      }
    }

    return null;
  }

  checkGlobalCoverage(totalCoverage) {
    console.log('\n📊 Global Coverage Analysis:');
    
    const metrics = ['statements', 'branches', 'functions', 'lines'];
    let allMet = true;

    for (const metric of metrics) {
      const actual = totalCoverage[metric].pct;
      const threshold = this.thresholds.global[metric];
      const met = actual >= threshold;
      
      const status = met ? '✅' : '❌';
      const color = met ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';
      
      console.log(`${status} ${metric.padEnd(12)}: ${color}${actual.toFixed(1)}%${reset} (threshold: ${threshold}%)`);
      
      if (!met) {
        allMet = false;
      }
    }

    return allMet;
  }

  checkCriticalPathsCoverage(coverageSummary) {
    console.log('\n🔥 Critical Paths Coverage Analysis:');
    
    let allMet = true;
    const files = Object.keys(coverageSummary).filter(key => key !== 'total');

    for (const criticalPath of this.criticalPaths) {
      const criticalFiles = files.filter(file => file.includes(criticalPath));
      
      if (criticalFiles.length === 0) {
        console.log(`⚠️  No files found for critical path: ${criticalPath}`);
        continue;
      }

      console.log(`\n📁 ${criticalPath}:`);

      for (const file of criticalFiles) {
        const coverage = coverageSummary[file];
        const fileName = path.basename(file);
        
        const metrics = ['statements', 'branches', 'functions', 'lines'];
        let fileMet = true;

        for (const metric of metrics) {
          const actual = coverage[metric].pct;
          const threshold = this.thresholds.critical[metric];
          const met = actual >= threshold;
          
          if (!met) {
            fileMet = false;
            allMet = false;
          }
        }

        const status = fileMet ? '✅' : '❌';
        const avgCoverage = metrics.reduce((sum, metric) => 
          sum + coverage[metric].pct, 0) / metrics.length;
        
        const color = fileMet ? '\x1b[32m' : '\x1b[31m';
        const reset = '\x1b[0m';
        
        console.log(`  ${status} ${fileName.padEnd(30)}: ${color}${avgCoverage.toFixed(1)}%${reset}`);
        
        if (!fileMet) {
          // Show which metrics failed
          for (const metric of metrics) {
            const actual = coverage[metric].pct;
            const threshold = this.thresholds.critical[metric];
            
            if (actual < threshold) {
              console.log(`    ❌ ${metric}: ${actual.toFixed(1)}% < ${threshold}%`);
            }
          }
        }
      }
    }

    return allMet;
  }

  generateCoverageReport() {
    const coverageSummary = this.loadCoverageSummary();
    
    if (!coverageSummary) {
      return null;
    }

    const globalResult = this.checkGlobalCoverage(coverageSummary.total);
    const criticalResult = this.checkCriticalPathsCoverage(coverageSummary);

    return {
      passed: globalResult && criticalResult,
      global: {
        statements: coverageSummary.total.statements.pct,
        branches: coverageSummary.total.branches.pct,
        functions: coverageSummary.total.functions.pct,
        lines: coverageSummary.total.lines.pct
      },
      thresholds: this.thresholds,
      details: coverageSummary
    };
  }
}

// Main execution
const main = async () => {
  const checker = new CoverageChecker();
  await checker.checkCoverage();
};

if (require.main === module) {
  main().catch(error => {
    console.error('Coverage check failed:', error);
    process.exit(1);
  });
}

module.exports = CoverageChecker;