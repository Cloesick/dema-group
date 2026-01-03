interface BuildStep {
  name: string;
  duration: number;
  memoryUsage: number;
  cpuUsage?: number;
  timestamp: number;
}

interface BuildSize {
  js: number;
  css: number;
  images: number;
  total: number;
  chunks: {
    name: string;
    size: number;
  }[];
}

interface BuildMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  buildSteps: BuildStep[];
  errors: number;
  warnings: number;
  buildSize: BuildSize;
  performance: {
    firstBuildTime: number;
    incrementalBuildTime: number;
    cacheHitRate: number;
    parallelization: number;
  };
}

class PerformanceTracker {
  private currentBuild: BuildMetrics | null = null;
  private buildHistory: BuildMetrics[] = [];

  private readonly PERFORMANCE_THRESHOLDS = {
    buildTime: 120000, // 2 minutes
    bundleSize: 500 * 1024, // 500KB
    memoryUsage: 1024 * 1024 * 1024, // 1GB
    cacheHitRate: 0.8 // 80%
  };

  private lastBuildTime?: number;

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
        total: 0,
        chunks: []
      },
      performance: {
        firstBuildTime: this.lastBuildTime ? 0 : Date.now(),
        incrementalBuildTime: this.lastBuildTime ? Date.now() - this.lastBuildTime : 0,
        cacheHitRate: 0,
        parallelization: 0
      }
    };
  }

  recordStep(name: string, metadata?: { [key: string]: any }) {
    const cpuUsage = process.cpuUsage();
    const timestamp = Date.now();
    if (!this.currentBuild) return;

    const memoryUsage = process.memoryUsage();
    this.currentBuild.buildSteps.push({
      name,
      duration: Date.now() - this.currentBuild.startTime,
      memoryUsage: memoryUsage.heapUsed,
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to ms
      timestamp,
      ...metadata
    });
  }

  recordBuildSize(type: keyof Omit<BuildSize, 'chunks' | 'total'>, size: number) {
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

    const stepsList = buildSteps
      .map(s => `- **${s.name}:** ${(s.duration / 1000).toFixed(1)}s (${(s.memoryUsage / 1024 / 1024).toFixed(1)} MB)`)
      .join('\n');

    const analysis = this.analyzePerformance();

    return [
      '# 📊 Build Performance Metrics',
      '',
      '## Build Overview',
      `- **Duration:** ${durationSec.toFixed(1)}s`,
      `- **Status:** ${errors === 0 ? '✅ Success' : '❌ Failed'}`,
      `- **Errors:** ${errors}`,
      `- **Warnings:** ${warnings}`,
      '',
      '## Build Steps',
      stepsList,
      '',
      '## Build Size',
      `- **JavaScript:** ${(buildSize.js / 1024).toFixed(1)} KB`,
      `- **CSS:** ${(buildSize.css / 1024).toFixed(1)} KB`,
      `- **Images:** ${(buildSize.images / 1024).toFixed(1)} KB`,
      `- **Total:** ${(buildSize.total / 1024).toFixed(1)} KB`,
      '',
      '## Performance Analysis',
      analysis
    ].join('\n');
  }

  recordCacheHit(hit: boolean) {
    if (!this.currentBuild) return;
    const totalHits = this.currentBuild.buildSteps.filter(step => step.name.includes('cache hit')).length;
    const totalMisses = this.currentBuild.buildSteps.filter(step => step.name.includes('cache miss')).length;
    this.currentBuild.performance.cacheHitRate = totalHits / (totalHits + totalMisses || 1);
  }

  recordParallelization(parallelTasks: number) {
    if (!this.currentBuild) return;
    this.currentBuild.performance.parallelization = parallelTasks;
  }

  private analyzePerformance(): string {
    if (!this.currentBuild) return '';

    const analysis: string[] = [];
    const { duration, buildSize, performance } = this.currentBuild;
    const { buildTime, bundleSize, memoryUsage, cacheHitRate } = this.PERFORMANCE_THRESHOLDS;

    // Check build duration
    if (duration && duration > buildTime) {
      analysis.push('⚠️ Build time exceeds 2 minutes. Consider optimizing:');
      analysis.push('- Use build caching');
      analysis.push('- Optimize dependencies');
      analysis.push('- Use incremental builds');
    }

    // Check bundle size
    if (buildSize.js > bundleSize) {
      analysis.push(' JavaScript bundle size is large. Consider:');
      analysis.push('- Code splitting');
      analysis.push('- Tree shaking unused code');
      analysis.push('- Dynamic imports');
    }

    // Check cache performance
    if (performance.cacheHitRate < cacheHitRate) {
      analysis.push(' Low cache hit rate. Consider:');
      analysis.push('- Review cache configuration');
      analysis.push('- Add more cache layers');
      analysis.push('- Optimize cache keys');
    }

    // Check memory usage
    const maxMemoryUsage = Math.max(...this.currentBuild.buildSteps.map(s => s.memoryUsage));
    if (maxMemoryUsage > memoryUsage) {
      analysis.push(' High memory usage. Consider:');
      analysis.push('- Optimize memory-intensive operations');
      analysis.push('- Increase garbage collection frequency');
      analysis.push('- Split build into smaller chunks');
    }

    // Check parallelization
    if (performance.parallelization < 2) {
      analysis.push(' Optimization opportunity:');
      analysis.push('- Enable parallel processing');
      analysis.push('- Use worker threads for CPU-intensive tasks');
      analysis.push('- Split build into parallel jobs');
    }

    return analysis.join('\n');
  }
}

export const performanceTracker = new PerformanceTracker();
