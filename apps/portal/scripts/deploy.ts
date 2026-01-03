import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

const ENV_SCHEMA = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  API_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string()
});

interface DeployConfig {
  environment: 'development' | 'staging' | 'production';
  branch: string;
  requireApproval: boolean;
  autoRevert: boolean;
}

const CONFIGS: Record<string, DeployConfig> = {
  development: {
    environment: 'development',
    branch: 'develop',
    requireApproval: false,
    autoRevert: true
  },
  staging: {
    environment: 'staging',
    branch: 'staging',
    requireApproval: true,
    autoRevert: true
  },
  production: {
    environment: 'production',
    branch: 'main',
    requireApproval: true,
    autoRevert: false
  }
};

class Deployer {
  private config: DeployConfig;
  private startTime: number;

  constructor(environment: string) {
    this.config = CONFIGS[environment];
    if (!this.config) {
      throw new Error(`Invalid environment: ${environment}`);
    }
    this.startTime = Date.now();
  }

  async deploy() {
    try {
      this.log('Starting deployment...');

      // 1. Environment validation
      await this.validateEnvironment();

      // 2. Pre-deployment checks
      await this.runPreDeploymentChecks();

      // 3. Database migrations
      await this.runDatabaseMigrations();

      // 4. Build and deploy
      await this.buildAndDeploy();

      // 5. Post-deployment checks
      await this.runPostDeploymentChecks();

      this.log('Deployment completed successfully!');
    } catch (error) {
      this.log('Deployment failed:', error);
      if (this.config.autoRevert) {
        await this.revert();
      }
      process.exit(1);
    }
  }

  private async validateEnvironment() {
    this.log('Validating environment...');

    // Check required env vars
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      API_URL: process.env.API_URL,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    };

    try {
      ENV_SCHEMA.parse(env);
    } catch (error) {
      const err = error as z.ZodError;
      throw new Error(`Environment validation failed: ${err.message}`);
    }

    // Check git branch
    const currentBranch = execSync('git branch --show-current')
      .toString()
      .trim();
    
    if (currentBranch !== this.config.branch) {
      throw new Error(
        `Wrong branch: expected ${this.config.branch}, got ${currentBranch}`
      );
    }

    // Check for uncommitted changes
    const status = execSync('git status --porcelain').toString();
    if (status) {
      throw new Error('Working directory is not clean');
    }
  }

  private async runPreDeploymentChecks() {
    this.log('Running pre-deployment checks...');

    // Run tests
    execSync('pnpm test', { stdio: 'inherit' });

    // Type check
    execSync('pnpm tsc --noEmit', { stdio: 'inherit' });

    // Lint
    execSync('pnpm lint', { stdio: 'inherit' });

    // Build check
    execSync('pnpm build', { stdio: 'inherit' });

    // Security audit
    execSync('pnpm audit', { stdio: 'inherit' });

    if (this.config.requireApproval) {
      await this.requestApproval();
    }
  }

  private async runDatabaseMigrations() {
    this.log('Running database migrations...');

    try {
      execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
    } catch (error) {
      const err = error as Error;
      throw new Error(`Migration failed: ${err.message}`);
    }
  }

  private async buildAndDeploy() {
    this.log('Building and deploying...');

    // Create deployment record
    const deployment = {
      id: `deploy_${Date.now()}`,
      environment: this.config.environment,
      startTime: this.startTime,
      git: {
        branch: this.config.branch,
        commit: execSync('git rev-parse HEAD').toString().trim()
      }
    };

    writeFileSync(
      join(process.cwd(), 'deployment.json'),
      JSON.stringify(deployment, null, 2)
    );

    // Build
    execSync('pnpm build', { stdio: 'inherit' });

    // Deploy based on environment
    switch (this.config.environment) {
      case 'production':
        execSync('pnpm deploy:prod', { stdio: 'inherit' });
        break;
      case 'staging':
        execSync('pnpm deploy:staging', { stdio: 'inherit' });
        break;
      case 'development':
        execSync('pnpm deploy:dev', { stdio: 'inherit' });
        break;
    }
  }

  private async runPostDeploymentChecks() {
    this.log('Running post-deployment checks...');

    // Health check
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

    // Smoke tests
    execSync('pnpm test:e2e', { stdio: 'inherit' });

    // Performance check
    const metrics = JSON.parse(
      execSync('curl -s localhost:3000/api/metrics').toString()
    );

    if (metrics.responseTime.p95 > 1000) {
      throw new Error('Performance check failed');
    }
  }

  private async revert() {
    this.log('Reverting deployment...');

    try {
      // Get last successful deployment
      const deployment = JSON.parse(
        readFileSync(
          join(process.cwd(), 'deployment.json'),
          'utf8'
        )
      );

      // Revert to last commit
      execSync(`git checkout ${deployment.git.commit}`);

      // Redeploy
      await this.buildAndDeploy();

      this.log('Revert completed successfully');
    } catch (error) {
      this.log('Revert failed:', error);
      process.exit(1);
    }
  }

  private async requestApproval(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (process.env.CI) {
        // In CI, check for approval status
        const approved = process.env.DEPLOYMENT_APPROVED === 'true';
        if (approved) {
          resolve();
        } else {
          reject(new Error('Deployment not approved'));
        }
      } else {
        // In terminal, ask for confirmation
        process.stdout.write(
          'Type "yes" to approve deployment: '
        );

        process.stdin.once('data', (data) => {
          const input = data.toString().trim();
          if (input === 'yes') {
            resolve();
          } else {
            reject(new Error('Deployment not approved'));
          }
        });
      }
    });
  }

  private log(...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...args);
  }
}

// Run deployment
const environment = process.argv[2];
if (!environment) {
  console.error('Please specify environment');
  process.exit(1);
}

const deployer = new Deployer(environment);
deployer.deploy();
