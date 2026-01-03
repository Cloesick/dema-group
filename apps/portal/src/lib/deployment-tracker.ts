import { deploymentManager } from './deployment-manager';
import { parseTypeScriptError } from './parse-build-error';
import type { BuildError } from '@/types/deployment';
import { errorPatterns } from './error-patterns';
import { performanceTracker } from './performance-metrics';
import { parseBuildLogs, formatBuildErrorForWindsurf, sendToWindsurf } from './parse-build-logs';

interface VercelBuildLog {
  type: string;
  created: number;
  payload: {
    text?: string;
    state?: string;
    error?: string;
    url?: string;
  };
}

class DeploymentTracker {
  private currentBuildId: string | null = null;
  private errorCount = 0;
  private buildStartTime: number = 0;
  private deploymentTimeout: NodeJS.Timeout | null = null;
  private maxBuildDuration = 15 * 60 * 1000; // 15 minutes
  private retryCount = 0;
  private maxRetries = 3;

  private clearDeploymentTimeout() {
    if (this.deploymentTimeout) {
      clearTimeout(this.deploymentTimeout);
      this.deploymentTimeout = null;
    }
  }

  private setupDeploymentTimeout() {
    this.clearDeploymentTimeout();
    this.deploymentTimeout = setTimeout(async () => {
      if (this.currentBuildId) {
        await this.handleDeploymentTimeout();
      }
    }, this.maxBuildDuration);
  }

  private async handleDeploymentTimeout() {
    await deploymentManager.logBuildStep('⚠️ Deployment timed out after 15 minutes', 'error');
    await this.handleBuildComplete({
      type: 'build-completed',
      created: Date.now(),
      payload: { state: 'ERROR', error: 'Deployment timeout' }
    });
  }

  async trackBuildStart(buildId: string) {
    performanceTracker.startBuild();
    this.currentBuildId = buildId;
    this.errorCount = 0;
    this.buildStartTime = Date.now();
    this.retryCount = 0;
    this.setupDeploymentTimeout();

    await deploymentManager.startDeployment(buildId);
    await deploymentManager.logBuildStep('🚀 Build started', 'info');
  }

  async processVercelLog(log: VercelBuildLog) {
    if (!this.currentBuildId) return;

    switch (log.type) {
      case 'build-error':
        await this.handleBuildError(log);
        break;
      
      case 'build-completed':
        await this.handleBuildComplete(log);
        break;

      case 'command-output':
        await this.handleCommandOutput(log);
        break;
    }
  }

  private async handleBuildError(log: VercelBuildLog) {
    // Parse and send all errors to Windsurf
    const buildErrors = parseBuildLogs(log.payload.text || '');
    
    for (const error of buildErrors) {
      const formattedError = formatBuildErrorForWindsurf(error);
      await sendToWindsurf(formattedError);
    }
    this.errorCount++;
    
    if (log.payload.text?.includes('Type error:')) {
      const error = parseTypeScriptError(log.payload.text);
      await this.reportTypeScriptError(error);
    } else {
      await deploymentManager.logBuildStep(log.payload.text || 'Unknown error', 'error');
    }
  }

  protected async handleBuildComplete(log: VercelBuildLog) {
    this.clearDeploymentTimeout();
    performanceTracker.endBuild();
    const duration = ((Date.now() - this.buildStartTime) / 1000).toFixed(1);
    
    if (log.payload.state === 'ERROR') {
      await deploymentManager.logBuildStep(`❌ Build failed with ${this.errorCount} errors (${duration}s)`, 'error');
    } else if (log.payload.state === 'READY') {
      await deploymentManager.deploymentSuccess(log.payload.url || 'unknown');
      await deploymentManager.logBuildStep(`✅ Build succeeded in ${duration}s`, 'info');
    }

    this.currentBuildId = null;
  }

  async handleCommandOutput(log: VercelBuildLog) {
    if (!log.payload.text) return;

    // Filter out noisy logs
    if (
      log.payload.text.includes('info') ||
      log.payload.text.includes('Retrieving cached dependencies') ||
      log.payload.text.includes('Collecting page data')
    ) {
      return;
    }

    await deploymentManager.logBuildStep(log.payload.text, 'info');
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation);
      }
      throw error;
    }
  }

  async reportTypeScriptError(error: BuildError) {
    const suggestions = await this.generateTypescriptSuggestions(error);
    error.suggestion = suggestions;
    await this.retryOperation(() => deploymentManager.handleBuildError(error));
  }

  private async generateTypescriptSuggestions(error: BuildError): Promise<string> {
    // Check against known error patterns from error-patterns.ts
    for (const pattern of errorPatterns) {
      if (pattern.pattern.test(error.message)) {
        const match = error.message.match(pattern.pattern);
        if (match && pattern.autoFix) {
          return typeof pattern.autoFix === 'function' 
            ? pattern.autoFix(match)
            : pattern.autoFix;
        }
        return pattern.suggestion + (pattern.example ? `\n\nExample:\n\`\`\`typescript\n${pattern.example}\n\`\`\`` : '');
      }
    }

    // Fallback common error patterns
    const commonPatterns: Array<[RegExp, string]> = [
      [/Cannot find module ['"](.*?)['"]/, 'Run: pnpm add -D $1'],
      [/Property ['"](.*?)['"] does not exist on type/, 'Add the missing property to the type definition or use optional chaining'],
      [/Type ['"](.*?)['"] is not assignable to type ['"](.*?)['"]/, 'Ensure the types match or add appropriate type assertion'],
      [/Parameter ['"](.*?)['"] implicitly has an any type/, 'Add explicit type annotation to the parameter']
    ];

    for (const [pattern, fix] of commonPatterns) {
      const match = error.message.match(pattern);
      if (match) {
        return fix.replace('$1', match[1] || '');
      }
    }

    return 'Review the type definitions and ensure all types are properly declared';
  }
}

// Export singleton instance
export const deploymentTracker = new DeploymentTracker();
