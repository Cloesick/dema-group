import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'privacy' | 'operational' | 'infrastructure';
  standard: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA';
  severity: 'critical' | 'high' | 'medium' | 'low';
  automated: boolean;
  checkFunction?: () => Promise<ComplianceCheckResult>;
  evidenceRequired: boolean;
  evidenceType?: 'document' | 'screenshot' | 'log' | 'config';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dependencies?: string[]; // IDs of other rules that must be checked first
  remediation?: string;
}

interface ComplianceCheckResult {
  ruleId: string;
  timestamp: string;
  status: 'pass' | 'fail' | 'warning' | 'error';
  details?: string;
  evidence?: {
    type: 'document' | 'screenshot' | 'log' | 'config';
    location: string;
    hash?: string;
  };
  metadata?: Record<string, unknown>;
}

interface ComplianceReport {
  id: string;
  timestamp: string;
  standard: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    errors: number;
    evidenceCollected: number;
    evidencePending: number;
  };
  results: ComplianceCheckResult[];
  metadata: {
    version: string;
    environment: string;
    generatedBy: string;
    duration: number;
  };
}

export class ComplianceMonitor {
  private static instance: ComplianceMonitor;
  private readonly configPath: string;
  private readonly evidencePath: string;
  private readonly reportsPath: string;
  private rules: Map<string, ComplianceRule>;
  private results: Map<string, ComplianceCheckResult[]>;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'compliance');
    this.evidencePath = join(rootPath, 'evidence');
    this.reportsPath = join(rootPath, 'reports', 'compliance');
    this.rules = new Map();
    this.results = new Map();
    this.initialize();
  }

  public static getInstance(): ComplianceMonitor {
    if (!ComplianceMonitor.instance) {
      ComplianceMonitor.instance = new ComplianceMonitor();
    }
    return ComplianceMonitor.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.evidencePath, this.reportsPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load compliance rules
    this.loadRules();
  }

  private loadRules(): void {
    const rulesPath = join(this.configPath, 'rules.json');
    try {
      const rules = JSON.parse(readFileSync(rulesPath, 'utf8'));
      for (const rule of rules) {
        this.rules.set(rule.id, rule);
      }
      logger.info(`Loaded ${this.rules.size} compliance rules`);
    } catch (error) {
      logger.error('Failed to load compliance rules', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  public async runChecks(
    standard?: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA',
    category?: 'security' | 'privacy' | 'operational' | 'infrastructure'
  ): Promise<ComplianceReport> {
    const startTime = Date.now();
    const results: ComplianceCheckResult[] = [];

    // Filter rules based on standard and category
    const rulesToCheck = Array.from(this.rules.values()).filter(rule => {
      if (standard && rule.standard !== standard) return false;
      if (category && rule.category !== category) return false;
      return true;
    });

    // Sort rules by dependencies
    const sortedRules = this.topologicalSort(rulesToCheck);

    // Run checks
    for (const rule of sortedRules) {
      if (rule.automated && rule.checkFunction) {
        try {
          const result = await rule.checkFunction();
          results.push(result);
        } catch (error) {
          results.push({
            ruleId: rule.id,
            timestamp: new Date().toISOString(),
            status: 'error',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      } else {
        // Manual check required
        results.push({
          ruleId: rule.id,
          timestamp: new Date().toISOString(),
          status: 'warning',
          details: 'Manual verification required'
        });
      }
    }

    // Generate report
    const report: ComplianceReport = {
      id: `${standard || 'all'}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      standard: standard || 'SOC2',
      summary: this.generateSummary(results),
      results,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        generatedBy: 'ComplianceMonitor',
        duration: Date.now() - startTime
      }
    };

    // Store results
    await this.storeResults(report);

    return report;
  }

  private topologicalSort(rules: ComplianceRule[]): ComplianceRule[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: ComplianceRule[] = [];

    function visit(rule: ComplianceRule) {
      if (temp.has(rule.id)) {
        throw new Error(`Circular dependency detected in rule ${rule.id}`);
      }
      if (visited.has(rule.id)) return;

      temp.add(rule.id);

      if (rule.dependencies) {
        for (const depId of rule.dependencies) {
          const depRule = rules.find(r => r.id === depId);
          if (depRule) {
            visit(depRule);
          }
        }
      }

      temp.delete(rule.id);
      visited.add(rule.id);
      order.push(rule);
    }

    for (const rule of rules) {
      if (!visited.has(rule.id)) {
        visit(rule);
      }
    }

    return order;
  }

  private generateSummary(results: ComplianceCheckResult[]): ComplianceReport['summary'] {
    return {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length,
      errors: results.filter(r => r.status === 'error').length,
      evidenceCollected: results.filter(r => r.evidence).length,
      evidencePending: results.filter(r => !r.evidence).length
    };
  }

  private async storeResults(report: ComplianceReport): Promise<void> {
    const reportPath = join(
      this.reportsPath,
      `${report.standard.toLowerCase()}-${report.timestamp}.json`
    );

    await retry.retry(async () => {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
    });

    logger.info('Stored compliance check results', {
      metadata: {
        reportId: report.id,
        standard: report.standard,
        passed: report.summary.passed,
        failed: report.summary.failed
      }
    });
  }

  public async collectEvidence(
    ruleId: string,
    evidenceType: 'document' | 'screenshot' | 'log' | 'config',
    content: Buffer
  ): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Unknown rule: ${ruleId}`);
    }

    if (!rule.evidenceRequired) {
      throw new Error(`Evidence not required for rule: ${ruleId}`);
    }

    const evidencePath = join(
      this.evidencePath,
      rule.standard.toLowerCase(),
      rule.category,
      `${ruleId}-${Date.now()}.${this.getEvidenceExtension(evidenceType)}`
    );

    await retry.retry(async () => {
      writeFileSync(evidencePath, content);
    });

    logger.info('Collected compliance evidence', {
      metadata: {
        ruleId,
        evidenceType,
        location: evidencePath
      }
    });
  }

  private getEvidenceExtension(type: 'document' | 'screenshot' | 'log' | 'config'): string {
    switch (type) {
      case 'document':
        return 'pdf';
      case 'screenshot':
        return 'png';
      case 'log':
        return 'log';
      case 'config':
        return 'json';
    }
  }
}

export const compliance = ComplianceMonitor.getInstance();
