import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import AWS from 'aws-sdk';
import { DefaultAzureCredential } from '@azure/identity';
import { SecurityCenter } from '@azure/arm-security';
import { google } from 'googleapis';
import { Octokit } from '@octokit/rest';
import { WebClient } from '@slack/web-api';
import { Version3Client } from 'jira.js';
import { compliance } from './compliance-monitor';

interface EvidenceSource {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'github' | 'slack' | 'jira' | 'gsuite' | 'custom';
  enabled: boolean;
  credentials?: {
    [key: string]: string;
  };
  config: {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    retention: number; // days
    filters?: {
      resources?: string[];
      events?: string[];
      severity?: string[];
    };
  };
  metadata?: Record<string, unknown>;
}

interface Evidence {
  id: string;
  sourceId: string;
  timestamp: string;
  type: string;
  content: string | Buffer;
  metadata: {
    source: string;
    collector: string;
    hash?: string;
    signature?: string;
    related?: {
      type: string;
      id: string;
    }[];
    [key: string]: unknown;
  };
  tags?: string[];
}

export class EvidenceCollector {
  private static instance: EvidenceCollector;
  private readonly configPath: string;
  private readonly evidencePath: string;
  private readonly sources: Map<string, EvidenceSource>;
  private readonly collectors: Map<string, () => Promise<void>>;
  private isRunning: boolean;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'evidence');
    this.evidencePath = join(rootPath, 'evidence');
    this.sources = new Map();
    this.collectors = new Map();
    this.isRunning = false;
    this.initialize();
  }

  public static getInstance(): EvidenceCollector {
    if (!EvidenceCollector.instance) {
      EvidenceCollector.instance = new EvidenceCollector();
    }
    return EvidenceCollector.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.evidencePath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load sources
    this.loadSources();

    // Initialize collectors
    this.initializeCollectors();
  }

  private loadSources(): void {
    try {
      const files = readFileSync(join(this.configPath, 'sources.json'), 'utf8');
      const sources = JSON.parse(files);
      for (const source of sources) {
        this.sources.set(source.id, source);
      }
      logger.info(`Loaded ${this.sources.size} evidence sources`);
    } catch (error) {
      logger.error('Failed to load evidence sources', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private initializeCollectors(): void {
    // AWS CloudWatch Logs
    this.collectors.set('aws-cloudwatch', async () => {
      const sources = Array.from(this.sources.values())
        .filter(s => s.type === 'aws' && s.enabled);

      for (const source of sources) {
        try {
          const cloudwatch = new AWS.CloudWatchLogs({
            credentials: new AWS.Credentials(
              source.credentials?.accessKeyId || '',
              source.credentials?.secretAccessKey || ''
            ),
            region: source.credentials?.region || 'us-east-1'
          });

          const now = new Date();
          const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

          const logGroups = await cloudwatch.describeLogGroups().promise();
          for (const group of logGroups.logGroups || []) {
            if (!group.logGroupName) continue;

            const streams = await cloudwatch.describeLogStreams({
              logGroupName: group.logGroupName,
              orderBy: 'LastEventTime',
              descending: true,
              limit: 5
            }).promise();

            for (const stream of streams.logStreams || []) {
              const events = await cloudwatch.getLogEvents({
                logGroupName: group.logGroupName,
                logStreamName: stream.logStreamName || '',
                startTime: startTime.getTime(),
                endTime: now.getTime()
              }).promise();

              if (events.events?.length) {
                await this.storeEvidence({
                  id: `aws-logs-${Date.now()}`,
                  sourceId: source.id,
                  timestamp: new Date().toISOString(),
                  type: 'aws-cloudwatch-logs',
                  content: JSON.stringify(events.events),
                  metadata: {
                    source: 'aws',
                    collector: 'cloudwatch',
                    logGroup: group.logGroupName,
                    logStream: stream.logStreamName
                  }
                });
              }
            }
          }
        } catch (error) {
          logger.error('AWS CloudWatch collection failed', {
            metadata: {
              sourceId: source.id,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    });

    // GitHub Audit Logs
    this.collectors.set('github-audit', async () => {
      const sources = Array.from(this.sources.values())
        .filter(s => s.type === 'github' && s.enabled);

      for (const source of sources) {
        try {
          const octokit = new Octokit({
            auth: source.credentials?.token
          });

          const org = source.credentials?.organization;
          if (!org) continue;

          // Get audit log entries
          const auditLog = await octokit.orgs.getAuditLog({
            org,
            phrase: 'created:>24h'
          });

          if (auditLog.data.length) {
            await this.storeEvidence({
              id: `github-audit-${Date.now()}`,
              sourceId: source.id,
              timestamp: new Date().toISOString(),
              type: 'github-audit-log',
              content: JSON.stringify(auditLog.data),
              metadata: {
                source: 'github',
                collector: 'audit-log',
                organization: org
              }
            });
          }

          // Get security alerts
          const alerts = await octokit.repos.listRepoSecurityAlerts({
            owner: org,
            repo: '*'
          });

          if (alerts.data.length) {
            await this.storeEvidence({
              id: `github-security-${Date.now()}`,
              sourceId: source.id,
              timestamp: new Date().toISOString(),
              type: 'github-security-alerts',
              content: JSON.stringify(alerts.data),
              metadata: {
                source: 'github',
                collector: 'security-alerts',
                organization: org
              }
            });
          }

        } catch (error) {
          logger.error('GitHub audit collection failed', {
            metadata: {
              sourceId: source.id,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    });

    // Slack Audit Logs
    this.collectors.set('slack-audit', async () => {
      const sources = Array.from(this.sources.values())
        .filter(s => s.type === 'slack' && s.enabled);

      for (const source of sources) {
        try {
          const slack = new WebClient(source.credentials?.token);

          // Get audit logs
          const logs = await slack.team.accessLogs();
          
          if (logs.entries?.length) {
            await this.storeEvidence({
              id: `slack-audit-${Date.now()}`,
              sourceId: source.id,
              timestamp: new Date().toISOString(),
              type: 'slack-audit-log',
              content: JSON.stringify(logs.entries),
              metadata: {
                source: 'slack',
                collector: 'audit-log',
                workspace: logs.team_id
              }
            });
          }

        } catch (error) {
          logger.error('Slack audit collection failed', {
            metadata: {
              sourceId: source.id,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    });

    // Jira Audit Logs
    this.collectors.set('jira-audit', async () => {
      const sources = Array.from(this.sources.values())
        .filter(s => s.type === 'jira' && s.enabled);

      for (const source of sources) {
        try {
          const client = new Version3Client({
            host: source.credentials?.host || '',
            authentication: {
              basic: {
                email: source.credentials?.email || '',
                apiToken: source.credentials?.apiToken || ''
              }
            }
          });

          // Get audit records
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);

          const records = await client.auditing.getAuditRecords({
            from: startDate.toISOString(),
            limit: 1000
          });

          if (records.records?.length) {
            await this.storeEvidence({
              id: `jira-audit-${Date.now()}`,
              sourceId: source.id,
              timestamp: new Date().toISOString(),
              type: 'jira-audit-log',
              content: JSON.stringify(records.records),
              metadata: {
                source: 'jira',
                collector: 'audit-log',
                host: source.credentials?.host
              }
            });
          }

        } catch (error) {
          logger.error('Jira audit collection failed', {
            metadata: {
              sourceId: source.id,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    });

    // GSuite Admin Reports
    this.collectors.set('gsuite-admin', async () => {
      const sources = Array.from(this.sources.values())
        .filter(s => s.type === 'gsuite' && s.enabled);

      for (const source of sources) {
        try {
          const auth = new google.auth.JWT({
            email: source.credentials?.clientEmail,
            key: source.credentials?.privateKey,
            scopes: ['https://www.googleapis.com/auth/admin.reports.audit.readonly']
          });

          const admin = google.admin({ version: 'reports_v1', auth });

          // Get admin activity
          const startTime = new Date();
          startTime.setDate(startTime.getDate() - 1);

          const activities = await admin.activities.list({
            userKey: 'all',
            applicationName: 'admin',
            startTime: startTime.toISOString()
          });

          if (activities.data.items?.length) {
            await this.storeEvidence({
              id: `gsuite-admin-${Date.now()}`,
              sourceId: source.id,
              timestamp: new Date().toISOString(),
              type: 'gsuite-admin-activity',
              content: JSON.stringify(activities.data.items),
              metadata: {
                source: 'gsuite',
                collector: 'admin-reports',
                domain: source.credentials?.domain
              }
            });
          }

        } catch (error) {
          logger.error('GSuite admin collection failed', {
            metadata: {
              sourceId: source.id,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    });
  }

  private async storeEvidence(evidence: Evidence): Promise<void> {
    const evidencePath = join(
      this.evidencePath,
      evidence.type,
      `${evidence.id}.json`
    );

    await retry.retry(async () => {
      writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    });

    // Update compliance evidence
    await compliance.collectEvidence(
      'SEC-EVD-001',
      'log',
      Buffer.from(JSON.stringify({
        type: 'evidence-collection',
        timestamp: new Date().toISOString(),
        evidence: {
          id: evidence.id,
          type: evidence.type,
          source: evidence.metadata.source,
          collector: evidence.metadata.collector
        }
      }, null, 2))
    );

    logger.info('Stored evidence', {
      metadata: {
        evidenceId: evidence.id,
        type: evidence.type,
        source: evidence.metadata.source
      }
    });
  }

  public async startCollection(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    logger.info('Starting evidence collection');

    // Run collectors based on their configured frequency
    for (const [name, collector] of this.collectors.entries()) {
      const sources = Array.from(this.sources.values())
        .filter(s => s.enabled && this.collectors.has(name));

      for (const source of sources) {
        const interval = this.getCollectionInterval(source.config.frequency);
        if (interval) {
          setInterval(async () => {
            try {
              await collector();
            } catch (error) {
              logger.error(`Evidence collector ${name} failed`, {
                metadata: {
                  sourceId: source.id,
                  error: error instanceof Error ? error.message : String(error)
                }
              });
            }
          }, interval);
        }
      }
    }
  }

  public async stopCollection(): Promise<void> {
    this.isRunning = false;
    logger.info('Stopped evidence collection');
  }

  private getCollectionInterval(frequency: string): number | null {
    switch (frequency) {
      case 'hourly':
        return 60 * 60 * 1000;
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'realtime':
        return 5 * 60 * 1000; // Every 5 minutes
      default:
        return null;
    }
  }
}

export const evidence = EvidenceCollector.getInstance();
