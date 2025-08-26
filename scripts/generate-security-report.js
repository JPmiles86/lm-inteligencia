#!/usr/bin/env node

/**
 * Security Report Generator
 * Consolidates security scan results from multiple tools
 */

const fs = require('fs');
const path = require('path');

class SecurityReportGenerator {
  constructor(artifactsPath) {
    this.artifactsPath = artifactsPath;
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_vulnerabilities: 0,
        critical_vulnerabilities: 0,
        high_vulnerabilities: 0,
        medium_vulnerabilities: 0,
        low_vulnerabilities: 0,
        security_score: 0
      },
      findings: {
        dependencies: [],
        code: [],
        api: [],
        infrastructure: [],
        secrets: [],
        containers: []
      },
      recommendations: []
    };
  }

  async generate() {
    console.log('Generating security report...');
    
    try {
      await this.processDependencyScans();
      await this.processCodeSecurityScans();
      await this.processApiSecurityScans();
      await this.processInfrastructureScans();
      await this.processSecretsDetection();
      await this.processContainerScans();
      
      this.calculateSummary();
      this.generateRecommendations();
      
      await this.writeReport();
      
      console.log('Security report generated successfully');
    } catch (error) {
      console.error('Error generating security report:', error);
      process.exit(1);
    }
  }

  async processDependencyScans() {
    console.log('Processing dependency security scans...');
    
    // Process npm audit results
    const npmAuditFiles = this.findFiles('npm-audit-results.json');
    for (const file of npmAuditFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.vulnerabilities) {
          for (const [pkgName, vuln] of Object.entries(data.vulnerabilities)) {
            this.report.findings.dependencies.push({
              source: 'npm-audit',
              package: pkgName,
              severity: vuln.severity,
              title: vuln.title || 'Unknown vulnerability',
              description: vuln.info || '',
              via: vuln.via || [],
              fixAvailable: vuln.fixAvailable || false
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing npm audit file ${file}:`, error.message);
      }
    }

    // Process Snyk results
    const snykFiles = this.findFiles('snyk-results.json');
    for (const file of snykFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.vulnerabilities) {
          for (const vuln of data.vulnerabilities) {
            this.report.findings.dependencies.push({
              source: 'snyk',
              package: vuln.packageName,
              severity: vuln.severity,
              title: vuln.title,
              description: vuln.description,
              cve: vuln.identifiers?.CVE || [],
              fixAvailable: vuln.isUpgradable || vuln.isPatchable
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing Snyk file ${file}:`, error.message);
      }
    }
  }

  async processCodeSecurityScans() {
    console.log('Processing code security scans...');
    
    // Process ESLint security results
    const eslintFiles = this.findFiles('eslint-security-results.json');
    for (const file of eslintFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        for (const result of data) {
          for (const message of result.messages) {
            if (message.ruleId && message.ruleId.includes('security')) {
              this.report.findings.code.push({
                source: 'eslint',
                file: result.filePath,
                line: message.line,
                column: message.column,
                severity: this.mapEslintSeverity(message.severity),
                rule: message.ruleId,
                message: message.message
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing ESLint file ${file}:`, error.message);
      }
    }

    // Process Semgrep results
    const semgrepFiles = this.findFiles('semgrep-results.json');
    for (const file of semgrepFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.results) {
          for (const result of data.results) {
            this.report.findings.code.push({
              source: 'semgrep',
              file: result.path,
              line: result.start.line,
              column: result.start.col,
              severity: this.mapSemgrepSeverity(result.extra.severity),
              rule: result.check_id,
              message: result.extra.message,
              cwe: result.extra.metadata?.cwe || []
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing Semgrep file ${file}:`, error.message);
      }
    }
  }

  async processApiSecurityScans() {
    console.log('Processing API security scans...');
    
    // Process OWASP ZAP results
    const zapFiles = this.findFiles('zap-*-report.json');
    for (const file of zapFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.site && data.site[0] && data.site[0].alerts) {
          for (const alert of data.site[0].alerts) {
            for (const instance of alert.instances) {
              this.report.findings.api.push({
                source: 'owasp-zap',
                url: instance.uri,
                method: instance.method,
                severity: this.mapZapSeverity(alert.riskdesc),
                name: alert.name,
                description: alert.desc,
                solution: alert.solution,
                reference: alert.reference,
                cweid: alert.cweid,
                wascid: alert.wascid
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing ZAP file ${file}:`, error.message);
      }
    }
  }

  async processInfrastructureScans() {
    console.log('Processing infrastructure security scans...');
    
    // Process Trivy results
    const trivyFiles = this.findFiles('trivy-*.json');
    for (const file of trivyFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.Results) {
          for (const result of data.Results) {
            if (result.Vulnerabilities) {
              for (const vuln of result.Vulnerabilities) {
                this.report.findings.infrastructure.push({
                  source: 'trivy',
                  target: result.Target,
                  type: result.Type,
                  severity: vuln.Severity,
                  vulnerabilityId: vuln.VulnerabilityID,
                  title: vuln.Title,
                  description: vuln.Description,
                  references: vuln.References || [],
                  fixedVersion: vuln.FixedVersion
                });
              }
            }

            if (result.Misconfigurations) {
              for (const misconfig of result.Misconfigurations) {
                this.report.findings.infrastructure.push({
                  source: 'trivy-config',
                  target: result.Target,
                  type: 'misconfiguration',
                  severity: misconfig.Severity,
                  id: misconfig.ID,
                  title: misconfig.Title,
                  description: misconfig.Description,
                  resolution: misconfig.Resolution
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing Trivy file ${file}:`, error.message);
      }
    }
  }

  async processSecretsDetection() {
    console.log('Processing secrets detection results...');
    
    // Process GitLeaks results
    const gitleaksFiles = this.findFiles('gitleaks-results.json');
    for (const file of gitleaksFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (Array.isArray(data)) {
          for (const finding of data) {
            this.report.findings.secrets.push({
              source: 'gitleaks',
              file: finding.File,
              line: finding.StartLine,
              commit: finding.Commit,
              severity: 'high', // GitLeaks findings are generally high severity
              rule: finding.RuleID,
              description: finding.Description,
              match: finding.Match
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing GitLeaks file ${file}:`, error.message);
      }
    }

    // Process TruffleHog results
    const truffleFiles = this.findFiles('trufflehog-results.json');
    for (const file of truffleFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const finding = JSON.parse(line);
              this.report.findings.secrets.push({
                source: 'trufflehog',
                file: finding.SourceMetadata?.Data?.Filesystem?.file,
                line: finding.SourceMetadata?.Data?.Filesystem?.line,
                severity: 'high',
                detectorType: finding.DetectorType,
                description: `${finding.DetectorType} secret detected`,
                verified: finding.Verified
              });
            } catch (parseError) {
              // Skip malformed JSON lines
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing TruffleHog file ${file}:`, error.message);
      }
    }
  }

  async processContainerScans() {
    console.log('Processing container security scans...');
    
    // Process container Trivy results
    const containerFiles = this.findFiles('trivy-container-results.json');
    for (const file of containerFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.Results) {
          for (const result of data.Results) {
            if (result.Vulnerabilities) {
              for (const vuln of result.Vulnerabilities) {
                this.report.findings.containers.push({
                  source: 'trivy-container',
                  target: result.Target,
                  severity: vuln.Severity,
                  vulnerabilityId: vuln.VulnerabilityID,
                  packageName: vuln.PkgName,
                  installedVersion: vuln.InstalledVersion,
                  fixedVersion: vuln.FixedVersion,
                  title: vuln.Title,
                  description: vuln.Description
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing container Trivy file ${file}:`, error.message);
      }
    }

    // Process Grype results
    const gryeFiles = this.findFiles('grype-results.json');
    for (const file of gryeFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (data.matches) {
          for (const match of data.matches) {
            this.report.findings.containers.push({
              source: 'grype',
              vulnerabilityId: match.vulnerability.id,
              packageName: match.artifact.name,
              installedVersion: match.artifact.version,
              fixedVersion: match.vulnerability.fix?.versions?.[0],
              severity: match.vulnerability.severity,
              description: match.vulnerability.description,
              urls: match.vulnerability.urls || []
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing Grype file ${file}:`, error.message);
      }
    }
  }

  calculateSummary() {
    console.log('Calculating security summary...');
    
    const allFindings = [
      ...this.report.findings.dependencies,
      ...this.report.findings.code,
      ...this.report.findings.api,
      ...this.report.findings.infrastructure,
      ...this.report.findings.secrets,
      ...this.report.findings.containers
    ];

    // Count vulnerabilities by severity
    for (const finding of allFindings) {
      const severity = finding.severity?.toLowerCase();
      
      switch (severity) {
        case 'critical':
          this.report.summary.critical_vulnerabilities++;
          break;
        case 'high':
          this.report.summary.high_vulnerabilities++;
          break;
        case 'medium':
        case 'moderate':
          this.report.summary.medium_vulnerabilities++;
          break;
        case 'low':
        case 'info':
          this.report.summary.low_vulnerabilities++;
          break;
      }
    }

    this.report.summary.total_vulnerabilities = allFindings.length;

    // Calculate security score (0-100)
    let score = 100;
    score -= this.report.summary.critical_vulnerabilities * 20; // -20 per critical
    score -= this.report.summary.high_vulnerabilities * 10;     // -10 per high
    score -= this.report.summary.medium_vulnerabilities * 5;    // -5 per medium
    score -= this.report.summary.low_vulnerabilities * 1;       // -1 per low

    this.report.summary.security_score = Math.max(0, score);
    
    console.log(`Security score: ${this.report.summary.security_score}/100`);
    console.log(`Total vulnerabilities: ${this.report.summary.total_vulnerabilities}`);
  }

  generateRecommendations() {
    console.log('Generating security recommendations...');
    
    const recommendations = [];

    // Critical vulnerabilities
    if (this.report.summary.critical_vulnerabilities > 0) {
      recommendations.push({
        priority: 'Critical',
        category: 'Immediate Action Required',
        issue: `${this.report.summary.critical_vulnerabilities} critical vulnerabilities detected`,
        recommendation: 'Address all critical vulnerabilities immediately. These pose significant security risks and should be patched or mitigated as highest priority.'
      });
    }

    // Dependency vulnerabilities
    const depVulns = this.report.findings.dependencies.filter(d => d.severity === 'high' || d.severity === 'critical');
    if (depVulns.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Dependency Security',
        issue: `${depVulns.length} high/critical dependency vulnerabilities`,
        recommendation: 'Update vulnerable dependencies to patched versions. Use npm audit fix or manual updates.'
      });
    }

    // Secrets detection
    if (this.report.findings.secrets.length > 0) {
      recommendations.push({
        priority: 'Critical',
        category: 'Secrets Management',
        issue: `${this.report.findings.secrets.length} potential secrets detected in code`,
        recommendation: 'Remove all hardcoded secrets from code. Use environment variables or secure secret management systems.'
      });
    }

    // Code security issues
    const codeIssues = this.report.findings.code.filter(c => c.severity === 'high' || c.severity === 'critical');
    if (codeIssues.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Code Security',
        issue: `${codeIssues.length} high-risk code security issues`,
        recommendation: 'Review and fix code security issues. Implement secure coding practices and regular security code reviews.'
      });
    }

    // API security
    const apiIssues = this.report.findings.api.filter(a => a.severity === 'high' || a.severity === 'critical');
    if (apiIssues.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'API Security',
        issue: `${apiIssues.length} high-risk API security issues`,
        recommendation: 'Implement proper authentication, input validation, and security headers. Follow OWASP API security guidelines.'
      });
    }

    // Infrastructure security
    const infraIssues = this.report.findings.infrastructure.filter(i => i.severity === 'high' || i.severity === 'critical');
    if (infraIssues.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Infrastructure Security',
        issue: `${infraIssues.length} infrastructure security issues`,
        recommendation: 'Review infrastructure configuration, update base images, and implement security hardening.'
      });
    }

    this.report.recommendations = recommendations;
  }

  async writeReport() {
    console.log('Writing security report files...');
    
    // Write JSON summary
    fs.writeFileSync('security-summary.json', JSON.stringify(this.report.summary, null, 2));

    // Write HTML report
    const htmlReport = this.generateHtmlReport();
    fs.writeFileSync('security-report.html', htmlReport);

    console.log('Security report files written successfully');
  }

  generateHtmlReport() {
    const scoreColor = this.report.summary.security_score >= 80 ? 'green' : 
                      this.report.summary.security_score >= 60 ? 'orange' : 'red';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Content Generation System - Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 10px; }
        .critical { color: #dc3545; font-weight: bold; }
        .high { color: #fd7e14; font-weight: bold; }
        .medium { color: #ffc107; font-weight: bold; }
        .low { color: #6c757d; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .section h2 { margin-top: 0; color: #333; }
        .finding { margin: 10px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #6c757d; }
        .finding.critical { border-left-color: #dc3545; }
        .finding.high { border-left-color: #fd7e14; }
        .finding.medium { border-left-color: #ffc107; }
        .recommendation { margin: 10px 0; padding: 10px; background: #f5f5f5; border-left: 4px solid #007cba; }
        .recommendation.critical { border-left-color: #dc3545; }
        .recommendation.high { border-left-color: #fd7e14; }
        .recommendation.medium { border-left-color: #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Content Generation System</h1>
        <h2>Security Report</h2>
        <div class="score">${this.report.summary.security_score}/100</div>
        <p>Generated on: ${new Date(this.report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="critical">${this.report.summary.critical_vulnerabilities}</div>
            <div>Critical</div>
        </div>
        <div class="summary-item">
            <div class="high">${this.report.summary.high_vulnerabilities}</div>
            <div>High</div>
        </div>
        <div class="summary-item">
            <div class="medium">${this.report.summary.medium_vulnerabilities}</div>
            <div>Medium</div>
        </div>
        <div class="summary-item">
            <div class="low">${this.report.summary.low_vulnerabilities}</div>
            <div>Low</div>
        </div>
        <div class="summary-item">
            <div><strong>${this.report.summary.total_vulnerabilities}</strong></div>
            <div>Total</div>
        </div>
    </div>

    <div class="section">
        <h2>Critical Recommendations</h2>
        ${this.report.recommendations.map(rec => 
          `<div class="recommendation ${rec.priority.toLowerCase()}">
             <strong>${rec.category} (${rec.priority} Priority):</strong><br>
             ${rec.issue}<br>
             <em>Recommendation: ${rec.recommendation}</em>
           </div>`
        ).join('')}
    </div>

    <div class="section">
        <h2>Findings by Category</h2>
        
        <h3>Dependencies (${this.report.findings.dependencies.length})</h3>
        ${this.report.findings.dependencies.slice(0, 10).map(finding => 
          `<div class="finding ${finding.severity}">
             <strong>${finding.package}</strong> - ${finding.severity}
             <br>${finding.title || finding.description}
           </div>`
        ).join('')}
        ${this.report.findings.dependencies.length > 10 ? `<p><em>And ${this.report.findings.dependencies.length - 10} more...</em></p>` : ''}

        <h3>Code Security (${this.report.findings.code.length})</h3>
        ${this.report.findings.code.slice(0, 10).map(finding => 
          `<div class="finding ${finding.severity}">
             <strong>${finding.rule}</strong> in ${finding.file}:${finding.line}
             <br>${finding.message}
           </div>`
        ).join('')}
        ${this.report.findings.code.length > 10 ? `<p><em>And ${this.report.findings.code.length - 10} more...</em></p>` : ''}

        <h3>API Security (${this.report.findings.api.length})</h3>
        ${this.report.findings.api.slice(0, 10).map(finding => 
          `<div class="finding ${finding.severity}">
             <strong>${finding.name}</strong> at ${finding.url}
             <br>${finding.description}
           </div>`
        ).join('')}
        ${this.report.findings.api.length > 10 ? `<p><em>And ${this.report.findings.api.length - 10} more...</em></p>` : ''}

        <h3>Secrets Detection (${this.report.findings.secrets.length})</h3>
        ${this.report.findings.secrets.slice(0, 10).map(finding => 
          `<div class="finding ${finding.severity}">
             <strong>${finding.rule || finding.detectorType}</strong> in ${finding.file}:${finding.line}
             <br>${finding.description}
           </div>`
        ).join('')}
        ${this.report.findings.secrets.length > 10 ? `<p><em>And ${this.report.findings.secrets.length - 10} more...</em></p>` : ''}
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
      try {
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
      } catch (error) {
        console.warn(`Error reading directory ${dir}:`, error.message);
      }
    };

    traverse(basePath);
    return files;
  }

  mapEslintSeverity(level) {
    return level === 2 ? 'high' : level === 1 ? 'medium' : 'low';
  }

  mapSemgrepSeverity(severity) {
    return severity?.toLowerCase() || 'medium';
  }

  mapZapSeverity(riskDesc) {
    if (riskDesc.includes('High')) return 'high';
    if (riskDesc.includes('Medium')) return 'medium';
    if (riskDesc.includes('Low')) return 'low';
    return 'medium';
  }
}

// Main execution
const main = async () => {
  const artifactsPath = process.argv[2] || './security-artifacts';
  
  if (!fs.existsSync(artifactsPath)) {
    console.error(`Artifacts path does not exist: ${artifactsPath}`);
    process.exit(1);
  }

  const generator = new SecurityReportGenerator(artifactsPath);
  await generator.generate();
};

if (require.main === module) {
  main().catch(error => {
    console.error('Failed to generate security report:', error);
    process.exit(1);
  });
}

module.exports = SecurityReportGenerator;