import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { retry } from '../utils/retry.js';

class ComplianceMonitor {
  static #instance;
  #configPath;
  #evidencePath;
  #metricsPath;

  constructor() {
    const rootPath = process.cwd();
    this.#configPath = join(rootPath, 'config', 'compliance');
    this.#evidencePath = join(rootPath, 'evidence');
    this.#metricsPath = join(rootPath, 'metrics');
    this.#initialize();
  }

  static getInstance() {
    if (!ComplianceMonitor.#instance) {
      ComplianceMonitor.#instance = new ComplianceMonitor();
    }
    return ComplianceMonitor.#instance;
  }

  #initialize() {
    // Create required directories
    [this.#configPath, this.#evidencePath, this.#metricsPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });
  }

  async verifyDeployment(context) {
    const { services } = context;
    const { config } = context;

    for (const service of config.services) {
      const serviceStatus = services.get(service.name);
      if (!serviceStatus || serviceStatus.status !== 'healthy') {
        throw new Error(`Service ${service.name} is not healthy`);
      }
    }
  }

  shouldRollback(context, error) {
    const { config } = context;
    if (!config.rollback?.enabled) {
      return false;
    }

    if (config.rollback.automatic && config.rollback.triggers?.healthCheck) {
      return error.message.includes('health check');
    }

    return false;
  }

  async collectEvidence(ruleId, type, content) {
    const evidence = {
      ruleId,
      type,
      content: content.toString(),
      timestamp: new Date().toISOString(),
      metadata: {
        collector: 'compliance-monitor'
      }
    };

    const evidencePath = join(
      this.#evidencePath,
      type,
      `${ruleId}-${Date.now()}.json`
    );

    await retry.retry(async () => {
      writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    });

    logger.info('Collected compliance evidence', {
      metadata: {
        ruleId,
        type,
        evidencePath
      }
    });
  }

  async updateMonitoring(context) {
    if (!context.config.monitoring?.enabled) {
      return;
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      services: Array.from(context.services.entries()).map(([name, service]) => ({
        name,
        status: service.status,
        duration: service.endTime - service.startTime
      })),
      totalDuration: Date.now() - context.startTime
    };

    const metricsPath = join(
      this.#metricsPath,
      `monitoring-${Date.now()}.json`
    );

    await retry.retry(async () => {
      writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    });

    logger.info('Updated monitoring metrics', {
      metadata: {
        services: metrics.services.length,
        totalDuration: metrics.totalDuration
      }
    });
  }
}

const compliance = ComplianceMonitor.getInstance();
export { compliance };
