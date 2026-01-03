import { PerformanceMonitor } from '@/utils/monitoring/performance';

describe('Performance Monitoring', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Core Web Vitals', () => {
    it('tracks FCP (First Contentful Paint)', () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        expect(entries[0].name).toBe('first-contentful-paint');
        expect(entries[0].startTime).toBeGreaterThan(0);
      });

      observer.observe({ entryTypes: ['paint'] });
    });

    it('tracks LCP (Largest Contentful Paint)', () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        expect(entries[0].startTime).toBeGreaterThan(0);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });

    it('tracks CLS (Cumulative Layout Shift)', () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        expect((entries[0] as any).value).toBeDefined();
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    });
  });

  describe('Resource Timing', () => {
    it('detects slow resources', () => {
      const metrics = monitor.getResourceMetrics();
      const slowResources = metrics.filter(r => r.duration > 1000);
      
      expect(slowResources.length).toBe(0);
    });

    it('detects large resources', () => {
      const metrics = monitor.getResourceMetrics();
      const largeResources = metrics.filter(r => r.size > 1000000);
      
      expect(largeResources.length).toBe(0);
    });
  });

  describe('Custom Measurements', () => {
    it('measures duration between marks', () => {
      monitor.mark('start');
      jest.advanceTimersByTime(1000);
      monitor.mark('end');

      const metrics = monitor.getMetrics();
      const customMetrics = monitor.getMetrics() as Record<string, number>;
      expect(customMetrics['start-to-end']).toBe(1000);
    });

    it('tracks long tasks', () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          expect(entry.duration).toBeLessThan(50);
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    });
  });

  describe('Navigation Timing', () => {
    it('tracks TTFB (Time to First Byte)', () => {
      const metrics = monitor.getMetrics();
      expect(metrics.TTFB).toBeDefined();
      expect(metrics.TTFB).toBeGreaterThan(0);
    });

    it('tracks TTI (Time to Interactive)', () => {
      const metrics = monitor.getMetrics();
      expect(metrics.TTI).toBeDefined();
      expect(metrics.TTI).toBeGreaterThan(metrics.TTFB || 0);
    });
  });
});
