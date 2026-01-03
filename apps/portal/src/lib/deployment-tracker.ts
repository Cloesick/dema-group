import { deploymentManager } from './deployment-manager';
import { parseTypeScriptError } from './parse-build-error';
import type { BuildError } from '@/types/deployment';

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

  async trackBuildStart(buildId: string) {
    this.currentBuildId = buildId;
    this.errorCount = 0;
    this.buildStartTime = Date.now();

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
    this.errorCount++;
    
    if (log.payload.text?.includes('Type error:')) {
      const error = parseTypeScriptError(log.payload.text);
      await this.reportTypeScriptError(error);
    } else {
      await deploymentManager.logBuildStep(log.payload.text || 'Unknown error', 'error');
    }
  }

  protected async handleBuildComplete(log: VercelBuildLog) {
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

  async reportTypeScriptError(error: BuildError) {
    const suggestions = await this.generateTypescriptSuggestions(error);
    error.suggestion = suggestions;
    await deploymentManager.handleBuildError(error);
  }

  private async generateTypescriptSuggestions(error: BuildError): Promise<string> {
    // Common TypeScript error patterns and their fixes
    const errorPatterns = {
      'Cannot find module': 'Run pnpm add -D for the missing package',
      'Property .* does not exist on type': 'Add the missing property to the type definition',
      'Type .* is not assignable to type': 'Ensure the types match or add type assertion',
      'Parameter .* implicitly has an any type': 'Add explicit type annotation to the parameter'
    };

    for (const [pattern, fix] of Object.entries(errorPatterns)) {
      if (new RegExp(pattern).test(error.message)) {
        return fix;
      }
    }

    return 'Review the type definitions and ensure all types are properly declared';
  }
}

// Export singleton instance
export const deploymentTracker = new DeploymentTracker();
