interface PerformanceMetrics {
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ResourceMetrics {
  name: string;
  duration: number;
  size: number;
  type: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private resourceMetrics: ResourceMetrics[] = [];
  private thresholds = {
    pageLoad: 3000,
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    timeToInteractive: 3500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1,
    memoryUsage: 50 * 1024 * 1024, // 50MB
    cpuUsage: 0.8 // 80%
  };

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async captureMetrics(): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      // Use Performance Observer for paint timing
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.push({
              ...this.metrics[this.metrics.length - 1],
              firstContentfulPaint: entry.startTime
            });
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });

      // Capture page load metrics
      cy.window().then((win) => {
        const perf = win.performance;
        const timing = perf.timing;
        const memory = (perf as any).memory;

        const metrics: PerformanceMetrics = {
          pageLoad: timing.loadEventEnd - timing.navigationStart,
          firstContentfulPaint: 0, // Will be updated by observer
          largestContentfulPaint: 0,
          timeToInteractive: timing.domInteractive - timing.navigationStart,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
          memoryUsage: memory ? memory.usedJSHeapSize : 0,
          cpuUsage: 0
        };

        this.metrics.push(metrics);
        resolve(metrics);
      });
    });
  }

  async captureResourceMetrics(): Promise<ResourceMetrics[]> {
    return new Promise((resolve) => {
      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource');
        const metrics = resources.map(resource => ({
          name: resource.name,
          duration: resource.duration,
          size: (resource as PerformanceResourceTiming).encodedBodySize,
          type: (resource as PerformanceEntryExtended).initiatorType || 'unknown'
        }));

        this.resourceMetrics = metrics;
        resolve(metrics);
      });
    });
  }

  checkThresholds(metrics: PerformanceMetrics): boolean[] {
    return [
      metrics.pageLoad <= this.thresholds.pageLoad,
      metrics.firstContentfulPaint <= this.thresholds.firstContentfulPaint,
      metrics.largestContentfulPaint <= this.thresholds.largestContentfulPaint,
      metrics.timeToInteractive <= this.thresholds.timeToInteractive,
      metrics.firstInputDelay <= this.thresholds.firstInputDelay,
      metrics.cumulativeLayoutShift <= this.thresholds.cumulativeLayoutShift,
      metrics.memoryUsage <= this.thresholds.memoryUsage,
      metrics.cpuUsage <= this.thresholds.cpuUsage
    ];
  }

  getMetricsSummary(): string {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const checks = this.checkThresholds(latestMetrics);
    
    return `
Performance Summary:
-------------------
Page Load: ${latestMetrics.pageLoad}ms ${checks[0] ? '✅' : '❌'}
FCP: ${latestMetrics.firstContentfulPaint}ms ${checks[1] ? '✅' : '❌'}
LCP: ${latestMetrics.largestContentfulPaint}ms ${checks[2] ? '✅' : '❌'}
TTI: ${latestMetrics.timeToInteractive}ms ${checks[3] ? '✅' : '❌'}
FID: ${latestMetrics.firstInputDelay}ms ${checks[4] ? '✅' : '❌'}
CLS: ${latestMetrics.cumulativeLayoutShift} ${checks[5] ? '✅' : '❌'}
Memory: ${Math.round(latestMetrics.memoryUsage / 1024 / 1024)}MB ${checks[6] ? '✅' : '❌'}
CPU: ${Math.round(latestMetrics.cpuUsage * 100)}% ${checks[7] ? '✅' : '❌'}

Resource Summary:
----------------
Total Resources: ${this.resourceMetrics.length}
Total Size: ${Math.round(this.resourceMetrics.reduce((sum, r) => sum + r.size, 0) / 1024)}KB
Avg Duration: ${Math.round(this.resourceMetrics.reduce((sum, r) => sum + r.duration, 0) / this.resourceMetrics.length)}ms
    `;
  }

  async reportMetrics(): Promise<void> {
    const metrics = await this.captureMetrics();
    const resources = await this.captureResourceMetrics();
    const summary = this.getMetricsSummary();

    // Log to console
    cy.task('log', summary);

    // Send to dashboard
    cy.request({
      method: 'POST',
      url: '/api/testing/metrics',
      body: {
        metrics,
        resources,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Add commands to Cypress
Cypress.Commands.add('measurePerformance', () => {
  // @ts-ignore - Cypress command typing issue
  const chain = cy.wrap(undefined);
  const monitor = PerformanceMonitor.getInstance();
  monitor.reportMetrics();
  return chain;
});

export const performanceMonitor = PerformanceMonitor.getInstance();
