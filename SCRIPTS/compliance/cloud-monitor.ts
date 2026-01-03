import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import AWS from 'aws-sdk';
import { DefaultAzureCredential } from '@azure/identity';
import { SecurityCenter } from '@azure/arm-security';
import { google } from 'googleapis';
import { compliance } from './compliance-monitor';

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  tags: Record<string, string>;
  configuration: Record<string, unknown>;
  securityStatus: {
    compliant: boolean;
    findings: SecurityFinding[];
    lastChecked: string;
  };
  metadata: Record<string, unknown>;
}

interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  resourceId: string;
  remediation?: string;
  standard?: string;
  metadata?: Record<string, unknown>;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  provider: 'aws' | 'azure' | 'gcp';
  service: string;
  check: (resource: CloudResource) => Promise<boolean>;
  remediation?: string;
}

export class CloudMonitor {
  private static instance: CloudMonitor;
  private readonly configPath: string;
  private readonly rulesPath: string;
  private readonly findingsPath: string;
  private resources: Map<string, CloudResource>;
  private rules: Map<string, ComplianceRule>;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'cloud');
    this.rulesPath = join(rootPath, 'config', 'cloud', 'rules');
    this.findingsPath = join(rootPath, 'reports', 'cloud');
    this.resources = new Map();
    this.rules = new Map();
    this.initialize();
  }

  public static getInstance(): CloudMonitor {
    if (!CloudMonitor.instance) {
      CloudMonitor.instance = new CloudMonitor();
    }
    return CloudMonitor.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.rulesPath, this.findingsPath].forEach(dir => {
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
    try {
      const files = readFileSync(join(this.rulesPath, 'rules.json'), 'utf8');
      const rules = JSON.parse(files);
      for (const rule of rules) {
        this.rules.set(rule.id, rule);
      }
      logger.info(`Loaded ${this.rules.size} cloud compliance rules`);
    } catch (error) {
      logger.error('Failed to load cloud compliance rules', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  public async scanAWS(): Promise<void> {
    try {
      // Initialize AWS SDK
      const config = new AWS.Config({
        region: process.env.AWS_REGION || 'us-east-1'
      });

      // Scan S3 buckets
      const s3 = new AWS.S3(config);
      const buckets = await s3.listBuckets().promise();
      for (const bucket of buckets.Buckets || []) {
        const encryption = await s3.getBucketEncryption({
          Bucket: bucket.Name!
        }).promise().catch(() => null);

        const versioning = await s3.getBucketVersioning({
          Bucket: bucket.Name!
        }).promise();

        const resource: CloudResource = {
          id: bucket.Name!,
          name: bucket.Name!,
          type: 's3',
          provider: 'aws',
          region: config.region!,
          tags: {},
          configuration: {
            encryption: encryption?.ServerSideEncryptionConfiguration || null,
            versioning: versioning.Status || 'Disabled'
          },
          securityStatus: {
            compliant: true,
            findings: [],
            lastChecked: new Date().toISOString()
          },
          metadata: {
            createdAt: bucket.CreationDate
          }
        };

        // Check compliance
        await this.checkResourceCompliance(resource);
      }

      // Scan EC2 instances
      const ec2 = new AWS.EC2(config);
      const instances = await ec2.describeInstances().promise();
      for (const reservation of instances.Reservations || []) {
        for (const instance of reservation.Instances || []) {
          const resource: CloudResource = {
            id: instance.InstanceId!,
            name: instance.Tags?.find(t => t.Key === 'Name')?.Value || instance.InstanceId!,
            type: 'ec2',
            provider: 'aws',
            region: config.region!,
            tags: Object.fromEntries((instance.Tags || []).map(t => [t.Key!, t.Value!])),
            configuration: {
              type: instance.InstanceType,
              state: instance.State?.Name,
              publicIp: instance.PublicIpAddress,
              securityGroups: instance.SecurityGroups
            },
            securityStatus: {
              compliant: true,
              findings: [],
              lastChecked: new Date().toISOString()
            },
            metadata: {
              launchTime: instance.LaunchTime
            }
          };

          // Check compliance
          await this.checkResourceCompliance(resource);
        }
      }

      // Scan RDS instances
      const rds = new AWS.RDS(config);
      const dbInstances = await rds.describeDBInstances().promise();
      for (const instance of dbInstances.DBInstances || []) {
        const resource: CloudResource = {
          id: instance.DBInstanceIdentifier!,
          name: instance.DBInstanceIdentifier!,
          type: 'rds',
          provider: 'aws',
          region: config.region!,
          tags: {},
          configuration: {
            engine: instance.Engine,
            version: instance.EngineVersion,
            storage: instance.AllocatedStorage,
            encrypted: instance.StorageEncrypted,
            public: instance.PubliclyAccessible
          },
          securityStatus: {
            compliant: true,
            findings: [],
            lastChecked: new Date().toISOString()
          },
          metadata: {
            createdAt: instance.InstanceCreateTime
          }
        };

        // Check compliance
        await this.checkResourceCompliance(resource);
      }

    } catch (error) {
      logger.error('AWS scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  public async scanAzure(): Promise<void> {
    try {
      // Initialize Azure SDK
      const credential = new DefaultAzureCredential();
      const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
      if (!subscriptionId) {
        throw new Error('AZURE_SUBSCRIPTION_ID environment variable is required');
      }

      // Initialize Security Center client
      const securityCenter = new SecurityCenter(credential, subscriptionId);

      // Get security tasks
      const tasks = await securityCenter.tasks.list();
      for (const task of tasks) {
        if (task.resourceId) {
          const resource: CloudResource = {
            id: task.resourceId,
            name: task.resourceName || task.resourceId,
            type: task.resourceType || 'unknown',
            provider: 'azure',
            region: task.location || 'unknown',
            tags: {},
            configuration: {},
            securityStatus: {
              compliant: task.state === 'Completed',
              findings: [{
                id: task.name || 'unknown',
                title: task.taskParameters?.policyName || 'Security Task',
                description: task.taskParameters?.description || '',
                severity: this.mapAzureSeverity(task.taskParameters?.severity),
                category: task.taskParameters?.category || 'unknown',
                resourceId: task.resourceId,
                remediation: task.taskParameters?.recommendation
              }],
              lastChecked: new Date().toISOString()
            },
            metadata: task.taskParameters || {}
          };

          // Check compliance
          await this.checkResourceCompliance(resource);
        }
      }

    } catch (error) {
      logger.error('Azure scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  public async scanGCP(): Promise<void> {
    try {
      // Initialize GCP SDK
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      const projectId = await auth.getProjectId();

      // Initialize Security Command Center
      const scc = google.securitycenter({
        version: 'v1',
        auth: await auth.getClient()
      });

      // Get findings
      const findings = await scc.organizations.sources.findings.list({
        parent: `organizations/${projectId}/sources/-`
      });

      for (const finding of findings.data.findings || []) {
        if (finding.resourceName) {
          const resource: CloudResource = {
            id: finding.resourceName,
            name: finding.resourceName.split('/').pop() || finding.resourceName,
            type: finding.category || 'unknown',
            provider: 'gcp',
            region: 'global',
            tags: {},
            configuration: finding.sourceProperties || {},
            securityStatus: {
              compliant: finding.state === 'INACTIVE',
              findings: [{
                id: finding.name || 'unknown',
                title: finding.category || 'Security Finding',
                description: finding.description || '',
                severity: this.mapGCPSeverity(finding.severity),
                category: finding.category || 'unknown',
                resourceId: finding.resourceName,
                remediation: finding.recommendation?.recommendation || undefined
              }],
              lastChecked: new Date().toISOString()
            },
            metadata: finding.sourceProperties || {}
          };

          // Check compliance
          await this.checkResourceCompliance(resource);
        }
      }

    } catch (error) {
      logger.error('GCP scan failed', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  private async checkResourceCompliance(resource: CloudResource): Promise<void> {
    const findings: SecurityFinding[] = [];

    // Apply compliance rules
    for (const rule of this.rules.values()) {
      if (rule.provider === resource.provider) {
        try {
          const compliant = await rule.check(resource);
          if (!compliant) {
            findings.push({
              id: `${rule.id}-${Date.now()}`,
              title: rule.name,
              description: rule.description,
              severity: 'high',
              category: rule.service,
              resourceId: resource.id,
              remediation: rule.remediation
            });
          }
        } catch (error) {
          logger.error(`Rule check failed: ${rule.id}`, {
            metadata: {
              error: error instanceof Error ? error.message : String(error),
              resourceId: resource.id,
              rule: rule.id
            }
          });
        }
      }
    }

    // Update resource status
    resource.securityStatus.findings = findings;
    resource.securityStatus.compliant = findings.length === 0;
    this.resources.set(resource.id, resource);

    // Store findings
    await this.storeFindings(resource);

    // Update compliance evidence
    await this.updateComplianceEvidence(resource);
  }

  private async storeFindings(resource: CloudResource): Promise<void> {
    const findingsPath = join(
      this.findingsPath,
      `${resource.provider}-${resource.type}-${resource.id}.json`
    );

    await retry.retry(async () => {
      writeFileSync(findingsPath, JSON.stringify(resource, null, 2));
    });

    logger.info('Stored cloud resource findings', {
      metadata: {
        resourceId: resource.id,
        type: resource.type,
        provider: resource.provider,
        findings: resource.securityStatus.findings.length
      }
    });
  }

  private async updateComplianceEvidence(resource: CloudResource): Promise<void> {
    // Map providers to compliance rule IDs
    const ruleMap: Record<string, string> = {
      aws: 'SEC-AWS-001',
      azure: 'SEC-AZR-001',
      gcp: 'SEC-GCP-001'
    };

    const ruleId = ruleMap[resource.provider];
    if (!ruleId) return;

    await compliance.collectEvidence(
      ruleId,
      'log',
      Buffer.from(JSON.stringify(resource, null, 2))
    );
  }

  private mapAzureSeverity(severity?: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity?.toLowerCase()) {
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

  private mapGCPSeverity(severity?: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity?.toLowerCase()) {
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

export const cloud = CloudMonitor.getInstance();
