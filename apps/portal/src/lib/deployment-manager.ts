import { DeploymentStatus, BuildLog, BuildError } from '@/types/deployment';

class DeploymentManager {
  private currentDeployment: DeploymentStatus | null = null;
  private buildLogs: BuildLog[] = [];

  async startDeployment(id: string) {
    this.currentDeployment = {
      id,
      status: 'building',
      logs: [],
      startTime: new Date().toISOString()
    };

    await this.notify(`# 🚀 Starting Deployment ${id}

## Initial Setup
- Checking configuration...
- Validating dependencies...
- Preparing build environment...

I'll guide you through the deployment process and help fix any issues that come up.`);
  }

  async logBuildStep(message: string, type: BuildLog['type'] = 'info') {
    const log: BuildLog = {
      timestamp: new Date().toISOString(),
      type,
      message
    };

    this.buildLogs.push(log);
    
    if (type === 'error' || type === 'warning') {
      await this.notify(`## ${type === 'error' ? '❌' : '⚠️'} Build ${type}
${message}`);
    }
  }

  async handleBuildError(error: BuildError) {
    if (!this.currentDeployment) return;

    this.currentDeployment.status = 'error';
    this.currentDeployment.error = error;
    this.currentDeployment.endTime = new Date().toISOString();

    const suggestion = await this.generateSuggestion(error);
    
    await this.notify(`# ❌ Build Failed

## Error Details
- **Type:** ${error.type}
- **File:** ${error.file}
- **Location:** Line ${error.line}, Column ${error.column}

## Error Message
\`\`\`
${error.message}
\`\`\`

## Suggested Fix
${suggestion}

## Next Steps
1. Apply the suggested fix
2. Commit and push the changes
3. I'll monitor the next deployment attempt

Would you like me to help implement the fix?`);
  }

  async deploymentSuccess(url: string) {
    if (!this.currentDeployment) return;

    this.currentDeployment.status = 'success';
    this.currentDeployment.url = url;
    this.currentDeployment.endTime = new Date().toISOString();

    const duration = this.calculateDuration();
    
    await this.notify(`# ✅ Deployment Successful!

## Details
- **URL:** ${url}
- **Duration:** ${duration}
- **Status:** Live

## Build Summary
${this.formatBuildSummary()}

## Next Steps
1. Verify the deployment at ${url}
2. Run smoke tests
3. Check performance metrics

Let me know if you need help with any of these steps!`);
  }

  private async generateSuggestion(error: BuildError): Promise<string> {
    if (error.message.includes('Cannot find module')) {
      const moduleName = error.message.match(/'([^']+)'/)?.[1];
      if (moduleName) {
        return `Run this command to install the missing dependency:
\`\`\`bash
pnpm add -D ${moduleName}
\`\`\``;
      }
    }

    // Add more error patterns and suggestions here
    return error.suggestion || 'Analyzing error pattern...';
  }

  private calculateDuration(): string {
    if (!this.currentDeployment?.startTime || !this.currentDeployment?.endTime) {
      return 'unknown';
    }

    const start = new Date(this.currentDeployment.startTime).getTime();
    const end = new Date(this.currentDeployment.endTime).getTime();
    const seconds = Math.round((end - start) / 1000);

    return seconds < 60 ? `${seconds} seconds` : `${Math.round(seconds / 60)} minutes`;
  }

  private formatBuildSummary(): string {
    const warnings = this.buildLogs.filter(log => log.type === 'warning').length;
    const infos = this.buildLogs.filter(log => log.type === 'info').length;

    return `- ${infos} info messages
- ${warnings} warnings
- All steps completed successfully`;
  }

  private async notify(message: string) {
    try {
      await fetch('http://localhost:3000/api/windsurf/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          source: 'deployment',
          deploymentId: this.currentDeployment?.id,
          status: this.currentDeployment?.status
        })
      });
    } catch (e) {
      console.error('Failed to send deployment update to Windsurf:', e);
    }
  }
}

// Export singleton instance
export const deploymentManager = new DeploymentManager();
