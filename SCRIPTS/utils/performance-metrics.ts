import { logger } from './logger';

class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();
  private startTime: number | null = null;
  private isCollecting = false;

  startCollection(): void {
    if (this.isCollecting) {
      logger.warn('Performance metrics collection already started');
      return;
    }

    this.startTime = Date.now();
    this.isCollecting = true;
    this.metrics.clear();

    logger.info('Started performance metrics collection');
  }

  stopCollection(): void {
    if (!this.isCollecting) {
      logger.warn('Performance metrics collection not started');
      return;
    }

    this.isCollecting = false;
    this.startTime = null;

    logger.info('Stopped performance metrics collection');
  }

  recordMetric(name: string, value: number): void {
    if (!this.isCollecting) {
      logger.warn('Cannot record metric: collection not started');
      return;
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(value);
  }

  getMetrics(): Map<string, { avg: number; min: number; max: number }> {
    const result = new Map();

    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;

      result.set(name, {
        avg: values.reduce((a, b) => a + b) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      });
    }

    return result;
  }

  getCollectionDuration(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }
}

export const performance = new PerformanceMetrics();
