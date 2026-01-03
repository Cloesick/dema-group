import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AuditLogger } from '../src/utils/monitoring/logger';
import { MetricsCollector } from '../src/utils/monitoring/metrics';

interface DeploymentRecord {
  id: string;
  environment: string;
  timestamp: number;
  git: {
    branch: string;
    commit: string;
  };
  config: {
    database: string;
    migrations: string[];
  };
  artifacts: {
    build: string;
    assets: string;
  };
}

class Rollback {
  private deploymentHistory: DeploymentRecord[] = [];
  private currentDeployment?: DeploymentRecord;
  private metrics: MetricsCollector;

  constructor() {
    this.loadDeploymentHistory();
    this.metrics = MetricsCollector.getInstance();
  }

  private loadDeploymentHistory() {
    try {
      const history = readFileSync(
        join(process.cwd(), 'deployment-history.json'),
        'utf8'
      );
      this.deploymentHistory = JSON.parse(history);
    } catch (error) {
      console.error('No deployment history found');
      this.deploymentHistory = [];
    }
  }

  private saveDeploymentHistory() {
    writeFileSync(
      join(process.cwd(), 'deployment-history.json'),
      JSON.stringify(this.deploymentHistory, null, 2)
    );
  }

  async initiateRollback(deploymentId?: string) {
    try {
      // 1. Identify target deployment
      const targetDeployment = deploymentId
        ? this.findDeployment(deploymentId)
        : this.findLastStableDeployment();

      if (!targetDeployment) {
        throw new Error('No suitable deployment found for rollback');
      }

      // 2. Verify rollback is possible
      await this.verifyRollbackFeasibility(targetDeployment);

      // 3. Take snapshot of current state
      await this.snapshotCurrentState();

      // 4. Execute rollback
      await this.executeRollback(targetDeployment);

      // 5. Verify rollback success
      await this.verifyRollback(targetDeployment);

      // 6. Update deployment history
      this.updateDeploymentHistory(targetDeployment);

      AuditLogger.logBusinessEvent({
        type: 'rollback',
        userId: 'system',
        details: {
          status: 'success',
          deploymentId: targetDeployment.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      AuditLogger.logError(error as Error, {
        action: 'rollback',
        path: `rollback/${deploymentId || 'latest'}`
      });
      throw error;
    }
  }

  private findDeployment(id: string): DeploymentRecord | undefined {
    return this.deploymentHistory.find(d => d.id === id);
  }

  private findLastStableDeployment(): DeploymentRecord | undefined {
    return this.deploymentHistory
      .slice()
      .reverse()
      .find(d => this.isDeploymentStable(d));
  }

  private async verifyRollbackFeasibility(
    deployment: DeploymentRecord
  ): Promise<void> {
    // 1. Check if build artifacts exist
    if (!this.verifyArtifacts(deployment)) {
      throw new Error('Build artifacts not found');
    }

    // 2. Check database compatibility
    if (!await this.verifyDatabaseCompatibility(deployment)) {
      throw new Error('Database incompatible');
    }

    // 3. Check dependencies
    if (!this.verifyDependencies(deployment)) {
      throw new Error('Dependencies incompatible');
    }
  }

  private verifyArtifacts(deployment: DeploymentRecord): boolean {
    try {
      const buildExists = execSync(
        `test -d ${deployment.artifacts.build}`
      ).toString().length === 0;
      
      const assetsExist = execSync(
        `test -d ${deployment.artifacts.assets}`
      ).toString().length === 0;

      return buildExists && assetsExist;
    } catch {
      return false;
    }
  }

  private async verifyDatabaseCompatibility(
    deployment: DeploymentRecord
  ): Promise<boolean> {
    try {
      // Check if we can rollback migrations
      const currentMigration = execSync(
        'pnpm prisma migrate status'
      ).toString();

      const targetMigration = deployment.config.migrations.slice(-1)[0];

      return currentMigration.includes(targetMigration);
    } catch {
      return false;
    }
  }

  private verifyDependencies(deployment: DeploymentRecord): boolean {
    try {
      // Check package versions
      execSync(
        `git checkout ${deployment.git.commit} package.json`
      );
      execSync('pnpm install --dry-run');
      return true;
    } catch {
      return false;
    } finally {
      // Restore current package.json
      execSync('git checkout HEAD package.json');
    }
  }

  private async snapshotCurrentState() {
    const timestamp = Date.now();
    
    // 1. Database snapshot
    execSync(
      `pg_dump $DATABASE_URL > snapshots/db_${timestamp}.sql`
    );

    // 2. File system snapshot
    execSync(
      `tar -czf snapshots/fs_${timestamp}.tar.gz .next public`
    );

    // 3. Configuration snapshot
    const config = {
      env: process.env,
      timestamp,
      git: {
        branch: execSync('git branch --show-current').toString().trim(),
        commit: execSync('git rev-parse HEAD').toString().trim()
      }
    };

    writeFileSync(
      `snapshots/config_${timestamp}.json`,
      JSON.stringify(config, null, 2)
    );
  }

  private async executeRollback(deployment: DeploymentRecord) {
    // 1. Switch to target commit
    execSync(`git checkout ${deployment.git.commit}`);

    // 2. Restore dependencies
    execSync('pnpm install');

    // 3. Rollback database
    execSync(
      `pnpm prisma migrate reset --to ${deployment.config.migrations.slice(-1)[0]}`
    );

    // 4. Restore build artifacts
    execSync(`rm -rf .next`);
    execSync(`cp -r ${deployment.artifacts.build} .next`);
    execSync(`cp -r ${deployment.artifacts.assets} public`);

    // 5. Update environment
    execSync(
      `cp .env.${deployment.environment} .env.production.local`
    );
  }

  private async verifyRollback(deployment: DeploymentRecord) {
    // 1. Health check
    const healthCheck = async () => {
      const response = await fetch(
        `${process.env.API_URL}/health`
      );
      if (!response.ok) {
        throw new Error('Health check failed');
      }
    };

    // Retry health check
    for (let i = 0; i < 5; i++) {
      try {
        await healthCheck();
        break;
      } catch (error) {
        if (i === 4) throw error;
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    // 2. Check critical metrics
    const metrics = await this.metrics.getMetricStats(
      'error_rate',
      300000 // 5 minutes
    );

    if (metrics.p95 > 0.01) {
      throw new Error('Error rate too high after rollback');
    }
  }

  private isDeploymentStable(deployment: DeploymentRecord): boolean {
    // Check if deployment is older than 1 hour
    const age = Date.now() - deployment.timestamp;
    if (age < 3600000) return false;

    // Check if deployment has been verified
    try {
      const metrics = readFileSync(
        join(process.cwd(), `metrics/${deployment.id}.json`),
        'utf8'
      );
      
      const { error_rate, response_time } = JSON.parse(metrics);
      return error_rate < 0.01 && response_time.p95 < 1000;
    } catch {
      return false;
    }
  }

  private updateDeploymentHistory(deployment: DeploymentRecord) {
    this.currentDeployment = deployment;
    this.saveDeploymentHistory();
  }
}

// Usage:
// const rollback = new Rollback();
// await rollback.initiateRollback('deploy_123');
