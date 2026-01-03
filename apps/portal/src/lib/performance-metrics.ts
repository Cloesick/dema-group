interface BuildMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  buildSteps: {
    name: string;
    duration: number;
    memoryUsage: number;
  }[];
  errors: number;
  warnings: number;
  buildSize: {
    js: number;
    css: number;
    images: number;
    total: number;
  };
}

class PerformanceTracker {
  private currentBuild: BuildMetrics | null = null;
  private buildHistory: BuildMetrics[] = [];

  startBuild() {
    this.currentBuild = {
      startTime: Date.now(),
      buildSteps: [],
      errors: 0,
      warnings: 0,
      buildSize: {
        js: 0,
        css: 0,
        images: 0,
        total: 0
      }
    };
  }

  recordStep(name: string) {
    if (!this.currentBuild) return;

    const memoryUsage = process.memoryUsage();
    this.currentBuild.buildSteps.push({
      name,
      duration: Date.now() - this.currentBuild.startTime,
      memoryUsage: memoryUsage.heapUsed
    });
  }

  recordBuildSize(type: keyof BuildMetrics['buildSize'], size: number) {
    if (!this.currentBuild) return;
    this.currentBuild.buildSize[type] = size;
    this.currentBuild.buildSize.total = Object.values(this.currentBuild.buildSize).reduce((a, b) => a + b, 0);
  }

  endBuild() {
    if (!this.currentBuild) return;
    
    this.currentBuild.endTime = Date.now();
    this.currentBuild.duration = this.currentBuild.endTime - this.currentBuild.startTime;
    
    this.buildHistory.push(this.currentBuild);
    this.reportMetrics();
    this.currentBuild = null;
  }

  private async reportMetrics() {
    if (!this.currentBuild) return;

    const metrics = this.formatMetrics();
    await fetch('http://localhost:3000/api/windsurf/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: metrics,
        source: 'performance',
        type: 'metrics'
      })
    });
  }

  private formatMetrics(): string {
    if (!this.currentBuild) return '';

    const { duration, buildSteps, buildSize, errors, warnings } = this.currentBuild;
    const durationSec = (duration || 0) / 1000;

    return \`# 📊 Build Performance Metrics

## Build Overview
- **Duration:** ${durationSec.toFixed(1)}s
- **Status:** ${errors === 0 ? '✅ Success' : '❌ Failed'}
- **Errors:** ${errors}
- **Warnings:** ${warnings}

## Build Steps
${buildSteps.map(step => \`- **${step.name}:** ${(step.duration / 1000).toFixed(1)}s (${(step.memoryUsage / 1024 / 1024).toFixed(1)} MB)\`).join('\\n')}

## Build Size
- **JavaScript:** ${(buildSize.js / 1024).toFixed(1)} KB
- **CSS:** ${(buildSize.css / 1024).toFixed(1)} KB
- **Images:** ${(buildSize.images / 1024).toFixed(1)} KB
- **Total:** ${(buildSize.total / 1024).toFixed(1)} KB

## Performance Analysis
${this.analyzePerformance()}\`;
  }

  private analyzePerformance(): string {
    if (!this.currentBuild) return '';

    const analysis: string[] = [];
    const { duration, buildSize } = this.currentBuild;

    // Check build duration
    if (duration && duration > 120000) {
      analysis.push('⚠️ Build time exceeds 2 minutes. Consider optimizing:');
      analysis.push('- Use build caching');
      analysis.push('- Optimize dependencies');
      analysis.push('- Use incremental builds');
    }

    // Check bundle size
    if (buildSize.js > 500 * 1024) {
      analysis.push('⚠️ JavaScript bundle size is large. Consider:');
      analysis.push('- Code splitting');
      analysis.push('- Tree shaking unused code');
      analysis.push('- Dynamic imports');
    }

    return analysis.join('\\n');
  }
}

export const performanceTracker = new PerformanceTracker();
