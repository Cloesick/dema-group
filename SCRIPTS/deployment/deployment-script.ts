import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import { backup } from './backup-system';
import { performance } from '../utils/performance-metrics';
import { monitoring } from '../utils/monitoring-dashboard';
import { DashboardConfig } from '../monitoring/monitoring-dashboard';

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  services: ServiceConfig[];
  dependencies: DependencyConfig[];
  database: DatabaseConfig;
  cache: CacheConfig;
  monitoring: MonitoringConfig;
  notifications: NotificationConfig;
  rollback: RollbackConfig;
}

interface ServiceConfig {
  name: string;
  type: 'frontend' | 'backend' | 'database';
  source: string;
  destination: string;
  build: {
    command: string;
    env: Record<string, string>;
    artifacts: string[];
  };
  healthCheck: {
    endpoint: string;
    timeout: number;
    interval: number;
    retries: number;
  };
  scaling: {
    min: number;
    max: number;
    target: number;
  };
}

interface DependencyConfig {
  name: string;
  version: string;
  type: 'system' | 'package' | 'service';
  optional: boolean;
}

interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'mongodb';
  host: string;
  port: number;
  name: string;
  migrations: {
    dir: string;
    table: string;
    enabled: boolean;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

interface CacheConfig {
  type: 'redis' | 'memcached';
  host: string;
  port: number;
  ttl: number;
}

interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  dashboard: {
    enabled: boolean;
    port: number;
  };
}

interface AlertConfig {
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  duration: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
}

interface NotificationConfig {
  channels: {
    email?: string[];
    slack?: string;
    teams?: string;
  };
  events: {
    start: boolean;
    success: boolean;
    failure: boolean;
    rollback: boolean;
  };
}

interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  maxAttempts: number;
  triggers: {
    healthCheck: boolean;
    errors: boolean;
    metrics: boolean;
  };
}

interface DeploymentContext {
  startTime: number;
  config: DeploymentConfig;
  environment: Record<string, string>;
  services: Map<string, {
    status: 'pending' | 'building' | 'deploying' | 'healthy' | 'failed';
    startTime?: number;
    endTime?: number;
    error?: Error;
  }>;
  metrics: Map<string, number>;
}

export class DeploymentScript {
  private static instance: DeploymentScript;
  private readonly configPath: string;
  private readonly logsPath: string;
  private readonly artifactsPath: string;
  private context: DeploymentContext | null;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'deployment.json');
    this.logsPath = join(rootPath, 'logs', 'deployment');
    this.artifactsPath = join(rootPath, 'artifacts');
    this.context = null;
    this.initializeDeployment();
  }

  public static getInstance(): DeploymentScript {
    if (!DeploymentScript.instance) {
      DeploymentScript.instance = new DeploymentScript();
    }
    return DeploymentScript.instance;
  }

  private initializeDeployment(): void {
    // Create required directories
    [this.logsPath, this.artifactsPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });
  }

  private async loadConfig(
    environment: string,
    version: string
  ): Promise<DeploymentConfig> {
    const config = JSON.parse(readFileSync(this.configPath, 'utf8'));
    return {
      ...config[environment],
      environment,
      version
    };
  }

  public async deploy(
    environment: string,
    version: string
  ): Promise<void> {
    try {
      // 1. Load and validate configuration
      const config = await this.loadConfig(environment, version);

      // 2. Initialize deployment context
      this.context = this.createContext(config);

      // 3. Start monitoring
      await this.startMonitoring();

      // 4. Create backup
      await this.createBackup();

      // 5. Check dependencies
      await this.checkDependencies();

      // 6. Deploy services
      await this.deployServices();

      // 7. Run database migrations
      await this.runMigrations();

      // 8. Verify deployment
      await this.verifyDeployment();

      // 9. Update monitoring
      await this.updateMonitoring();

      // 10. Send notifications
      await this.sendNotifications('success');

      logger.info('Deployment completed successfully', {
        metadata: {
          environment,
          version,
          duration: Date.now() - this.context!.startTime
        }
      });

    } catch (error) {
      if (this.context) {
        // Attempt rollback if enabled
        if (this.shouldRollback(error)) {
          await this.rollback(error);
        }

        // Send failure notification
        await this.sendNotifications('failure', error);
      }

      logger.error('Deployment failed', {
        metadata: {
          environment: this.context?.config.environment,
          version: this.context?.config.version,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    } finally {
      // Stop monitoring
      await this.stopMonitoring();
    }
  }

  private createContext(config: DeploymentConfig): DeploymentContext {
    return {
      startTime: Date.now(),
      config,
      environment: this.buildEnvironment(config),
      services: new Map(),
      metrics: new Map()
    };
  }

  private buildEnvironment(config: DeploymentConfig): Record<string, string> {
    return {
      NODE_ENV: config.environment,
      VERSION: config.version,
      DATABASE_URL: this.getDatabaseUrl(config.database),
      CACHE_URL: this.getCacheUrl(config.cache),
      ...process.env
    };
  }

  private getDatabaseUrl(config: DatabaseConfig): string {
    switch (config.type) {
      case 'mysql':
        return `mysql://user:pass@${config.host}:${config.port}/${config.name}`;
      case 'postgresql':
        return `postgresql://user:pass@${config.host}:${config.port}/${config.name}`;
      case 'mongodb':
        return `mongodb://user:pass@${config.host}:${config.port}/${config.name}`;
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  private getCacheUrl(config: CacheConfig): string {
    return `${config.type}://${config.host}:${config.port}`;
  }

  private async startMonitoring(): Promise<void> {
    if (!this.context?.config.monitoring.enabled) return;

    // Start performance metrics collection
    performance.startCollection();

    // Initialize monitoring dashboard
    const dashboard: DashboardConfig = {
      id: `deployment-${this.context.config.environment}`,
      name: `Deployment Dashboard - ${this.context.config.environment}`,
      description: 'Real-time deployment metrics and status',
      category: 'deployment',
      refreshInterval: 10,
      defaultTimeRange: '15m',
      widgets: [
        {
          id: 'services',
          type: 'status' as const,
          title: 'Service Status',
          metrics: ['deployment.services.status'],
          timeRange: '5m',
          refreshInterval: 5,
          layout: { x: 0, y: 0, w: 12, h: 2 }
        },
        {
          id: 'health',
          type: 'gauge' as const,
          title: 'System Health',
          metrics: ['system.health'],
          timeRange: '5m',
          refreshInterval: 5,
          warning: 80,
          critical: 90,
          layout: { x: 0, y: 2, w: 4, h: 3 }
        },
        {
          id: 'response-time',
          type: 'line' as const,
          title: 'Response Time',
          metrics: ['http.response.time'],
          timeRange: '15m',
          refreshInterval: 10,
          layout: { x: 4, y: 2, w: 8, h: 3 }
        }
      ]
    };

    await monitoring.generateDashboard(dashboard);
  }

  private async updateMonitoring(): Promise<void> {
    if (!this.context?.config.monitoring.enabled) return;

    // Update service status
    const status = Array.from(this.context.services.entries())
      .map(([name, service]) => ({
        name,
        status: service.status,
        duration: service.endTime
          ? service.endTime - (service.startTime || 0)
          : undefined
      }));

    await monitoring.recordMetric('deployment.services.status', status.length, {
      healthy: status.filter(s => s.status === 'healthy').length.toString(),
      failed: status.filter(s => s.status === 'failed').length.toString()
    });

    // Update deployment duration
    await monitoring.recordMetric(
      'deployment.duration',
      Date.now() - this.context.startTime
    );
  }

  private async stopMonitoring(): Promise<void> {
    if (!this.context?.config.monitoring.enabled) return;
    performance.stopCollection();
  }

  private async verifyDeployment(): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    for (const service of this.context.config.services) {
      const status = this.context.services.get(service.name);
      if (status?.status !== 'healthy') {
        throw new Error(`Service ${service.name} is not healthy`);
      }
    }
  }

  private shouldRollback(error: unknown): boolean {
    if (!this.context?.config.rollback.enabled) return false;

    // Check if automatic rollback is enabled
    if (!this.context.config.rollback.automatic) return false;

    // Check rollback triggers
    const triggers = this.context.config.rollback.triggers;

    // Health check failures
    if (triggers.healthCheck && error instanceof Error) {
      if (error.message.includes('Health check failed')) {
        return true;
      }
    }

    // Error threshold
    if (triggers.errors) {
      const failedServices = Array.from(this.context.services.values())
        .filter(s => s.status === 'failed')
        .length;

      if (failedServices > 0) {
        return true;
      }
    }

    // Metric thresholds
    if (triggers.metrics && this.context.config.monitoring.enabled) {
      for (const alert of this.context.config.monitoring.alerts) {
        const value = this.context.metrics.get(alert.metric);
        if (
          value !== undefined &&
          value >= alert.threshold &&
          alert.severity === 'critical'
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private async rollback(error: unknown): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    logger.warn('Starting rollback', {
      metadata: {
        environment: this.context.config.environment,
        version: this.context.config.version,
        error: error instanceof Error ? error.message : String(error)
      }
    });

    try {
      // Restore from backup
      const backups = await backup.listBackups();
      const latestBackup = backups[0];

      if (latestBackup) {
        await backup.restoreBackup(latestBackup.id);
      }

      // Restart services
      for (const service of this.context.config.services) {
        await retry.retry(async () => {
          execSync(`pm2 restart ${service.name}`);
        });
      }

      // Send notification
      await this.sendNotifications('rollback');

      logger.info('Rollback completed successfully');

    } catch (rollbackError) {
      logger.error('Rollback failed', {
        metadata: {
          error: rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError)
        }
      });
      throw rollbackError;
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    const { database } = this.context.config;
    if (!database.migrations.enabled) return;

    await retry.retry(async () => {
      execSync(`npm run migrate`, {
        cwd: database.migrations.dir,
        env: {
          ...this.context!.environment,
          DATABASE_URL: this.getDatabaseUrl(database)
        }
      });
    });
  }

  private async sendEmailNotification(
    recipients: string[],
    message: string
  ): Promise<void> {
    // Implementation would use email service
  }

  private async sendSlackNotification(
    webhook: string,
    message: string
  ): Promise<void> {
    await retry.retry(async () => {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
    });
  }

  private async sendTeamsNotification(
    webhook: string,
    message: string
  ): Promise<void> {
    await retry.retry(async () => {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "text": message
        })
      });
    });
  }

  private async checkSystemDependency(dep: DependencyConfig): Promise<void> {
    await retry.retry(async () => {
      execSync(`which ${dep.name}`);
    });
  }

  private async checkPackageDependency(dep: DependencyConfig): Promise<void> {
    await retry.retry(async () => {
      execSync(`npm list ${dep.name}@${dep.version}`);
    });
  }

  private async checkServiceDependency(dep: DependencyConfig): Promise<void> {
    await retry.retry(async () => {
      execSync(`curl -f ${dep.name}`);
    });
  }

  private async createBackup(): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    const config = {
      sources: this.context.config.services.map(s => s.source),
      destination: join(this.artifactsPath, 'backups'),
      type: 'full' as const,
      compress: true,
      encrypt: false,
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 2
      },
      schedule: {
        frequency: 'daily' as const,
        time: '02:00'
      }
    };

    await backup.createBackup(config);
  }

  private async checkDependencies(): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    for (const dep of this.context.config.dependencies) {
      try {
        switch (dep.type) {
          case 'system':
            await this.checkSystemDependency(dep);
            break;
          case 'package':
            await this.checkPackageDependency(dep);
            break;
          case 'service':
            await this.checkServiceDependency(dep);
            break;
        }
      } catch (error) {
        if (!dep.optional) {
          throw error;
        }

        logger.warn(`Optional dependency ${dep.name} not available`, {
          metadata: {
            dependency: dep,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  }

  private async deployServices(): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    // Deploy services in correct order
    const order = ['database', 'backend', 'frontend'] as const;
    for (const type of order) {
      const services = this.context.config.services
        .filter(s => s.type === type);

      // Deploy services of same type in parallel
      await Promise.all(
        services.map(service => this.deployService(service))
      );
    }
  }

  private async deployService(service: ServiceConfig): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    this.context.services.set(service.name, { status: 'pending' });
    const startTime = Date.now();

    try {
      // Update status
      this.context.services.set(service.name, {
        status: 'building',
        startTime
      });

      // Build service
      await this.buildService(service);

      // Update status
      this.context.services.set(service.name, {
        status: 'deploying',
        startTime
      });

      // Deploy service
      await this.deployServiceArtifacts(service);

      // Health check
      await this.healthCheck(service);

      // Update status
      this.context.services.set(service.name, {
        status: 'healthy',
        startTime,
        endTime: Date.now()
      });

    } catch (error) {
      this.context.services.set(service.name, {
        status: 'failed',
        startTime,
        endTime: Date.now(),
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  private async buildService(service: ServiceConfig): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    await retry.retry(async () => {
      // Set environment variables
      const env = {
        ...this.context!.environment,
        ...service.build.env
      };

      // Run build command
      execSync(service.build.command, {
        cwd: service.source,
        env
      });

      // Copy artifacts
      for (const artifact of service.build.artifacts) {
        const source = join(service.source, artifact);
        const destination = join(this.artifactsPath, service.name, artifact);
        execSync(`mkdir -p ${join(destination, '..')}`);
        execSync(`cp -r ${source} ${destination}`);
      }
    });
  }

  private async deployServiceArtifacts(service: ServiceConfig): Promise<void> {
    await retry.retry(async () => {
      const source = join(this.artifactsPath, service.name);
      execSync(`mkdir -p ${service.destination}`);
      execSync(`cp -r ${source}/* ${service.destination}`);
    });
  }

  private async healthCheck(service: ServiceConfig): Promise<void> {
    await retry.retry(
      async () => {
        const response = await fetch(service.healthCheck.endpoint);
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.statusText}`);
        }
      },
      {
        maxAttempts: service.healthCheck.retries,
        initialDelay: service.healthCheck.interval,
        timeout: service.healthCheck.timeout
      }
    );
  }

  private async sendNotifications(
    type: 'start' | 'success' | 'failure' | 'rollback',
    error?: unknown
  ): Promise<void> {
    if (!this.context) throw new Error('Deployment context not initialized');

    const { notifications } = this.context.config;
    if (!notifications.events[type]) return;

    const message = this.formatNotificationMessage(type, error);

    // Send to all configured channels
    if (notifications.channels.email) {
      await this.sendEmailNotification(
        notifications.channels.email,
        message
      );
    }

    if (notifications.channels.slack) {
      await this.sendSlackNotification(
        notifications.channels.slack,
        message
      );
    }

    if (notifications.channels.teams) {
      await this.sendTeamsNotification(
        notifications.channels.teams,
        message
      );
    }
  }

  private formatNotificationMessage(
    type: 'start' | 'success' | 'failure' | 'rollback',
    error?: unknown
  ): string {
    if (!this.context) throw new Error('Deployment context not initialized');

    const { environment, version } = this.context.config;
    const duration = Date.now() - this.context.startTime;

    switch (type) {
      case 'start':
        return `Starting deployment of version ${version} to ${environment}`;

      case 'success':
        return `Successfully deployed version ${version} to ${environment} in ${duration}ms`;

      case 'failure':
        return `Failed to deploy version ${version} to ${environment} after ${duration}ms: ${error instanceof Error ? error.message : String(error)}`;

      case 'rollback':
        return `Rolled back ${environment} to previous version after failed deployment of ${version}`;

      default:
        return '';
    }
  }
}

// Export singleton instance
export const deployment = DeploymentScript.getInstance();
