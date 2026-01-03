import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import { compliance } from './compliance-monitor';

interface SecurityScan {
  id: string;
  type: 'dependency' | 'secret' | 'container' | 'infrastructure' | 'code';
  target: string;
  timestamp: string;
  findings: SecurityFinding[];
  metadata: {
    tool: string;
    version: string;
    duration: number;
    configuration?: Record<string, unknown>;
  };
}

interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  location?: {
    file?: string;
    startLine?: number;
    endLine?: number;
    snippet?: string;
  };
  cvss?: {
    score: number;
    vector: string;
  };
  references?: string[];
  remediation?: string;
  falsePositive?: boolean;
  suppressed?: boolean;
  metadata?: Record<string, unknown>;
}

export class SecurityScanner {
  private static instance: SecurityScanner;
  private readonly configPath: string;
  private readonly scanPath: string;
  private readonly reportsPath: string;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'security');
    this.scanPath = join(rootPath, 'scans');
    this.reportsPath = join(rootPath, 'reports', 'security');
    this.initialize();
  }

  public static getInstance(): SecurityScanner {
    if (!SecurityScanner.instance) {
      SecurityScanner.instance = new SecurityScanner();
    }
    return SecurityScanner.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.scanPath, this.reportsPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });
  }

  public async scanDependencies(path: string): Promise<SecurityScan> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // Run npm audit
      const npmOutput = execSync('npm audit --json', { cwd: path });
      const npmResults = JSON.parse(npmOutput.toString());

      // Process npm audit results
      for (const vuln of npmResults.advisories || []) {
        findings.push({
          id: `NPM-${vuln.id}`,
          title: vuln.title,
          description: vuln.overview,
          severity: this.mapNpmSeverity(vuln.severity),
          category: 'dependency',
          cvss: {
            score: vuln.cvss.score,
            vector: vuln.cvss.vectorString
          },
          references: vuln.references,
          remediation: vuln.recommendation,
          metadata: {
            package: vuln.module_name,
            version: vuln.vulnerable_versions,
            patchedIn: vuln.patched_versions
          }
        });
      }

      // Run Snyk (if available)
      try {
        const snykOutput = execSync('snyk test --json', { cwd: path });
        const snykResults = JSON.parse(snykOutput.toString());

        // Process Snyk results
        for (const vuln of snykResults.vulnerabilities || []) {
          findings.push({
            id: `SNYK-${vuln.id}`,
            title: vuln.title,
            description: vuln.description,
            severity: this.mapSnykSeverity(vuln.severity),
            category: 'dependency',
            cvss: vuln.cvssScore ? {
              score: vuln.cvssScore,
              vector: vuln.cvssDetails || ''
            } : undefined,
            references: vuln.references,
            remediation: vuln.remediation?.advice || undefined,
            metadata: {
              package: vuln.package,
              version: vuln.version,
              fixedIn: vuln.fixedIn
            }
          });
        }
      } catch (error) {
        logger.warn('Snyk scan failed, continuing with npm audit results only', {
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
      }

    } catch (error) {
      logger.error('Dependency scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }

    const scan: SecurityScan = {
      id: `dep-${Date.now()}`,
      type: 'dependency',
      target: path,
      timestamp: new Date().toISOString(),
      findings,
      metadata: {
        tool: 'npm-audit,snyk',
        version: '1.0.0',
        duration: Date.now() - startTime
      }
    };

    await this.storeScanResults(scan);
    await this.updateComplianceEvidence(scan);

    return scan;
  }

  public async scanSecrets(path: string): Promise<SecurityScan> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // Run git-secrets
      try {
        execSync('git secrets --scan', { cwd: path });
      } catch (error) {
        // git-secrets exits with code 1 if secrets are found
        if (error instanceof Error && 'stdout' in error) {
          const output = error.stdout.toString();
          const matches = output.matchAll(/([^:]+):(\d+):(.*)/g);

          for (const match of matches) {
            findings.push({
              id: `SECRET-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              title: 'Potential secret found',
              description: 'A pattern matching a secret was detected',
              severity: 'high',
              category: 'secret',
              location: {
                file: match[1],
                startLine: parseInt(match[2]),
                snippet: match[3]
              }
            });
          }
        }
      }

      // Run trufflehog (if available)
      try {
        const truffleOutput = execSync('trufflehog --json .', { cwd: path });
        const truffleResults = truffleOutput.toString().split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));

        for (const result of truffleResults) {
          findings.push({
            id: `TRUFFLE-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title: 'Secret detected',
            description: `Found ${result.type} pattern`,
            severity: 'critical',
            category: 'secret',
            location: {
              file: result.path,
              startLine: result.line,
              snippet: result.snippet
            },
            metadata: {
              type: result.type,
              commit: result.commit
            }
          });
        }
      } catch (error) {
        logger.warn('Trufflehog scan failed, continuing with git-secrets results only', {
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
      }

    } catch (error) {
      logger.error('Secret scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }

    const scan: SecurityScan = {
      id: `secret-${Date.now()}`,
      type: 'secret',
      target: path,
      timestamp: new Date().toISOString(),
      findings,
      metadata: {
        tool: 'git-secrets,trufflehog',
        version: '1.0.0',
        duration: Date.now() - startTime
      }
    };

    await this.storeScanResults(scan);
    await this.updateComplianceEvidence(scan);

    return scan;
  }

  public async scanContainers(path: string): Promise<SecurityScan> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // Run trivy
      const trivyOutput = execSync('trivy image --format json .', { cwd: path });
      const trivyResults = JSON.parse(trivyOutput.toString());

      for (const vuln of trivyResults.Vulnerabilities || []) {
        findings.push({
          id: `TRIVY-${vuln.VulnerabilityID}`,
          title: vuln.Title,
          description: vuln.Description,
          severity: this.mapTrivySeverity(vuln.Severity),
          category: 'container',
          cvss: vuln.CVSS ? {
            score: vuln.CVSS.Score,
            vector: vuln.CVSS.Vector
          } : undefined,
          references: vuln.References,
          remediation: vuln.FixedVersion ? `Upgrade to version ${vuln.FixedVersion}` : undefined,
          metadata: {
            package: vuln.PkgName,
            version: vuln.InstalledVersion,
            fixedIn: vuln.FixedVersion
          }
        });
      }

    } catch (error) {
      logger.error('Container scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }

    const scan: SecurityScan = {
      id: `container-${Date.now()}`,
      type: 'container',
      target: path,
      timestamp: new Date().toISOString(),
      findings,
      metadata: {
        tool: 'trivy',
        version: '1.0.0',
        duration: Date.now() - startTime
      }
    };

    await this.storeScanResults(scan);
    await this.updateComplianceEvidence(scan);

    return scan;
  }

  public async scanInfrastructure(path: string): Promise<SecurityScan> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // Run tfsec
      const tfsecOutput = execSync('tfsec --format json .', { cwd: path });
      const tfsecResults = JSON.parse(tfsecOutput.toString());

      for (const result of tfsecResults.results || []) {
        findings.push({
          id: `TFSEC-${result.id}`,
          title: result.title,
          description: result.description,
          severity: this.mapTfsecSeverity(result.severity),
          category: 'infrastructure',
          location: {
            file: result.location.filename,
            startLine: result.location.start_line,
            endLine: result.location.end_line
          },
          references: [result.link],
          remediation: result.resolution,
          metadata: {
            rule: result.rule_id,
            impact: result.impact
          }
        });
      }

    } catch (error) {
      logger.error('Infrastructure scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }

    const scan: SecurityScan = {
      id: `infra-${Date.now()}`,
      type: 'infrastructure',
      target: path,
      timestamp: new Date().toISOString(),
      findings,
      metadata: {
        tool: 'tfsec',
        version: '1.0.0',
        duration: Date.now() - startTime
      }
    };

    await this.storeScanResults(scan);
    await this.updateComplianceEvidence(scan);

    return scan;
  }

  private async storeScanResults(scan: SecurityScan): Promise<void> {
    const scanPath = join(
      this.reportsPath,
      `${scan.type}-${scan.timestamp}.json`
    );

    await retry.retry(async () => {
      writeFileSync(scanPath, JSON.stringify(scan, null, 2));
    });

    logger.info('Stored security scan results', {
      metadata: {
        scanId: scan.id,
        type: scan.type,
        findings: scan.findings.length,
        critical: scan.findings.filter(f => f.severity === 'critical').length,
        high: scan.findings.filter(f => f.severity === 'high').length
      }
    });
  }

  private async updateComplianceEvidence(scan: SecurityScan): Promise<void> {
    // Map scan types to compliance rule IDs
    const ruleMap: Record<string, string> = {
      dependency: 'SEC-DEP-001',
      secret: 'SEC-SCR-001',
      container: 'SEC-CNT-001',
      infrastructure: 'SEC-INF-001'
    };

    const ruleId = ruleMap[scan.type];
    if (!ruleId) return;

    await compliance.collectEvidence(
      ruleId,
      'log',
      Buffer.from(JSON.stringify(scan, null, 2))
    );
  }

  private mapNpmSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'moderate':
        return 'medium';
      default:
        return 'low';
    }
  }

  private mapSnykSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  private mapTrivySeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  private mapTfsecSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }
}

export const security = SecurityScanner.getInstance();
