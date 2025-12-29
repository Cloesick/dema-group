import { AuditLogger } from './logger';

interface PerformanceMetrics {
  FCP: number;  // First Contentful Paint
  LCP: number;  // Largest Contentful Paint
  FID: number;  // First Input Delay
  CLS: number;  // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  TTI: number;  // Time to Interactive
}

interface ResourceMetrics {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private resources: ResourceMetrics[] = [];
  private marks: Record<string, number> = {};

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initObservers() {
    // Core Web Vitals
    this.observeCWV();

    // Resource timing
    this.observeResources();

    // Navigation timing
    this.observeNavigation();

    // Long tasks
    this.observeLongTasks();
  }

  private observeCWV() {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.metrics.FCP = entries[0].startTime;
        this.reportMetric('FCP', this.metrics.FCP);
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.metrics.LCP = entries[entries.length - 1].startTime;
        this.reportMetric('LCP', this.metrics.LCP);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.metrics.FID = (entries[0] as PerformanceEventTiming).processingStart - entries[0].startTime;
        this.reportMetric('FID', this.metrics.FID);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let cumulativeScore = 0;
      for (const entry of entryList.getEntries()) {
        cumulativeScore += (entry as any).value;
      }
      this.metrics.CLS = cumulativeScore;
      this.reportMetric('CLS', this.metrics.CLS);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeResources() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const resource = entry as PerformanceResourceTiming;
        this.resources.push({
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize,
          type: resource.initiatorType
        });
      });
      this.analyzeResources();
    }).observe({ entryTypes: ['resource'] });
  }

  private observeNavigation() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const nav = entry as PerformanceNavigationTiming;
        this.metrics.TTFB = nav.responseStart - nav.requestStart;
        this.metrics.TTI = nav.domInteractive - nav.startTime;
        this.reportMetric('TTFB', this.metrics.TTFB);
        this.reportMetric('TTI', this.metrics.TTI);
      });
    }).observe({ entryTypes: ['navigation'] });
  }

  private observeLongTasks() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          AuditLogger.logSecurity({
            type: 'system',
            severity: 'medium',
            details: {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          }});
        }
      });
    }).observe({ entryTypes: ['longtask'] });
  }

  private analyzeResources() {
    const slowResources = this.resources.filter(r => r.duration > 1000);
    const largeResources = this.resources.filter(r => r.size > 1000000);

    if (slowResources.length > 0) {
      AuditLogger.logSecurity({
        type: 'system',
        severity: 'medium',
        details: { resources: slowResources }
      });
    }

    if (largeResources.length > 0) {
      AuditLogger.logSecurity({
        type: 'system',
        severity: 'medium',
        details: { resources: largeResources }
      });
    }
  }

  mark(name: string) {
    this.marks[name] = performance.now();
  }

  measure(name: string, startMark: string) {
    if (this.marks[startMark]) {
      const duration = performance.now() - this.marks[startMark];
      this.reportMetric(name, duration);
      delete this.marks[startMark];
    }
  }

  private reportMetric(name: string, value: number) {
    AuditLogger.logBusinessEvent({
      type: 'performance',
      userId: 'system',
      details: {
      metric: name,
      value,
      timestamp: new Date().toISOString()
    }});

    // Send to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        value
      });
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getResourceMetrics(): ResourceMetrics[] {
    return [...this.resources];
  }
}

// Usage example:
// const monitor = PerformanceMonitor.getInstance();
// monitor.mark('pageLoad');
// // ... page loads ...
// monitor.measure('totalLoadTime', 'pageLoad');
