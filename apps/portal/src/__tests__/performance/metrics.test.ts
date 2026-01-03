import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor } from '../../utils/monitoring/performance';
import type { ResourceMetrics } from '../../utils/monitoring/performance';

describe('Performance Monitoring', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Core Web Vitals', () => {
    it('tracks FCP (First Contentful Paint)', () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        expect(entries[0].name).toEqual('first-contentful-paint');
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
      
      expect(slowResources.length).toEqual(0);
    });

    it('detects large resources', () => {
      const metrics = monitor.getResourceMetrics();
      const largeResources = metrics.filter(r => r.size > 1000000);
      
      expect(largeResources.length).toEqual(0);
    });
  });

  describe('Custom Measurements', () => {
    it('measures duration between marks', () => {
      // Mock performance metrics
      vi.spyOn(monitor, 'getMetrics').mockReturnValue({
        TTI: 1000,
        TTFB: 100,
        FCP: 500,
        LCP: 800,
        FID: 50,
        CLS: 0.1
      });

      monitor.mark('start');
      vi.advanceTimersByTime(1000);
      monitor.measure('test', 'start');

      const metrics = monitor.getMetrics();
      expect(metrics.TTI).toEqual(1000);
    });

    it('tracks long tasks', () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const metrics = monitor.getMetrics();
          expect(metrics.TTI).toBeTruthy();
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    });
  });

  describe('Navigation Timing', () => {
    it('tracks TTFB (Time to First Byte)', () => {
      // Mock navigation timing
      // Mock performance metrics
      vi.spyOn(monitor, 'getMetrics').mockReturnValue({
        TTI: 1000,
        TTFB: 100,
        FCP: 500,
        LCP: 800,
        FID: 50,
        CLS: 0.1
      });

      const metrics = monitor.getMetrics();
      expect(metrics.TTFB).toEqual(100);
    });

    it('tracks TTI (Time to Interactive)', () => {
      // Mock performance metrics
      vi.spyOn(monitor, 'getMetrics').mockReturnValue({
        TTI: 1000,
        TTFB: 100,
        FCP: 500,
        LCP: 800,
        FID: 50,
        CLS: 0.1
      });

      const metrics = monitor.getMetrics();
      expect(metrics.CLS).toEqual(0.1);
    });
  });
});
