import { AuditLogger } from './logger';
import { redis } from '@/utils/redis';

interface MetricValue {
  value: number;
  timestamp: number;
}

interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  labels?: Record<string, string>;
  ttl?: number;
}

interface Alert {
  metric: string;
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private alerts: Alert[] = [];

  private constructor() {
    this.initializeAlerts();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private initializeAlerts() {
    this.alerts = [
      {
        metric: 'error_rate',
        condition: 'above',
        threshold: 0.01,
        duration: 300,
        severity: 'error'
      },
      {
        metric: 'response_time_p95',
        condition: 'above',
        threshold: 1000,
        duration: 300,
        severity: 'warning'
      },
      {
        metric: 'memory_usage',
        condition: 'above',
        threshold: 0.9,
        duration: 300,
        severity: 'critical'
      }
    ];
  }

  async recordMetric(config: MetricConfig, value: number) {
    const key = this.getMetricKey(config);
    const timestamp = Date.now();

    // Store metric
    await redis.zadd(key, timestamp, JSON.stringify({
      value,
      timestamp
    }));

    // Set TTL if specified
    if (config.ttl) {
      await redis.expire(key, config.ttl);
    }

    // Check alerts
    await this.checkAlerts(config.name, value);

    // Log metric
    AuditLogger.logBusinessEvent({
      type: 'metric',
      userId: 'system',
      details: {
        ...config,
        value,
        timestamp: new Date(timestamp).toISOString()
      }
    });
  }

  async getMetric(
    name: string,
    duration: number = 3600000
  ): Promise<MetricValue[]> {
    const now = Date.now();
    const start = now - duration;

    const values = await redis.zrangebyscore(
      `metrics:${name}`,
      start,
      now
    );

    return values.map(v => JSON.parse(v));
  }

  async getMetricStats(
    name: string,
    duration: number = 3600000
  ) {
    const values = await this.getMetric(name, duration);
    const numbers = values.map(v => v.value);

    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
      p95: this.percentile(numbers, 95),
      p99: this.percentile(numbers, 99),
      count: numbers.length
    };
  }

  private async checkAlerts(name: string, value: number) {
    const alert = this.alerts.find(a => a.metric === name);
    if (!alert) return;

    const values = await this.getMetric(
      name,
      alert.duration * 1000
    );

    const triggered = values.every(v => {
      switch (alert.condition) {
        case 'above':
          return v.value > alert.threshold;
        case 'below':
          return v.value < alert.threshold;
        case 'equals':
          return v.value === alert.threshold;
      }
    });

    if (triggered) {
      AuditLogger.logSecurity({
        type: 'system',
        severity: alert.severity === 'critical' ? 'high' : 'medium',
        details: {
          metric: name,
          value,
          threshold: alert.threshold,
          condition: alert.condition
        }
      });
    }
  }

  private getMetricKey(config: MetricConfig): string {
    let key = `metrics:${config.name}`;
    if (config.labels) {
      const labels = Object.entries(config.labels)
        .map(([k, v]) => `${k}=${v}`)
        .join(',');
      key += `:${labels}`;
    }
    return key;
  }

  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * p / 100;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }
}

// Business metrics
export const businessMetrics = {
  async recordOrder(
    amount: number,
    customerId: string,
    products: string[]
  ) {
    const metrics = MetricsCollector.getInstance();

    await metrics.recordMetric(
      {
        name: 'order_value',
        type: 'histogram',
        labels: { customer_id: customerId }
      },
      amount
    );

    await metrics.recordMetric(
      {
        name: 'order_count',
        type: 'counter'
      },
      1
    );

    for (const product of products) {
      await metrics.recordMetric(
        {
          name: 'product_sales',
          type: 'counter',
          labels: { product_id: product }
        },
        1
      );
    }
  },

  async recordPageView(
    page: string,
    duration: number,
    userId?: string
  ) {
    const metrics = MetricsCollector.getInstance();

    await metrics.recordMetric(
      {
        name: 'page_views',
        type: 'counter',
        labels: { page }
      },
      1
    );

    await metrics.recordMetric(
      {
        name: 'page_duration',
        type: 'histogram',
        labels: { page }
      },
      duration
    );

    if (userId) {
      await metrics.recordMetric(
        {
          name: 'user_engagement',
          type: 'histogram',
          labels: { user_id: userId }
        },
        duration
      );
    }
  }
};

// System metrics
export const systemMetrics = {
  async recordResponseTime(
    path: string,
    method: string,
    duration: number
  ) {
    const metrics = MetricsCollector.getInstance();

    await metrics.recordMetric(
      {
        name: 'response_time',
        type: 'histogram',
        labels: { path, method }
      },
      duration
    );
  },

  async recordError(
    type: string,
    code: string
  ) {
    const metrics = MetricsCollector.getInstance();

    await metrics.recordMetric(
      {
        name: 'error_count',
        type: 'counter',
        labels: { type, code }
      },
      1
    );
  },

  async recordMemoryUsage() {
    const metrics = MetricsCollector.getInstance();
    const used = process.memoryUsage();

    await metrics.recordMetric(
      {
        name: 'memory_heap_used',
        type: 'gauge'
      },
      used.heapUsed
    );

    await metrics.recordMetric(
      {
        name: 'memory_heap_total',
        type: 'gauge'
      },
      used.heapTotal
    );
  }
};
