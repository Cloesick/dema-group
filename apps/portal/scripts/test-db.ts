import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import os from 'os';

interface TestResult {
  id: string;
  suite: string;
  spec: string;
  status: 'passed' | 'failed' | 'pending';
  duration: number;
  error?: string;
  timestamp: string;
  branch: string;
  commit: string;
  screenshots?: string[];
  performance: {
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

interface TestCache {
  lastRun: {
    [key: string]: {
      hash: string;
      result: TestResult;
    };
  };
  performanceBaseline: {
    [key: string]: {
      avgDuration: number;
      p95Duration: number;
      failureRate: number;
    };
  };
}

interface TestHistory {
  results: TestResult[];
  stats: {
    totalRuns: number;
    passRate: number;
    avgDuration: number;
    flakiness: number;
  };
}

interface DB {
  cache: TestCache;
  history: TestHistory;
  performance: {
    trends: Array<{
      date: string;
      avgDuration: number;
      passRate: number;
      parallelism: number;
    }>;
  };
}

class TestDB {
  private db: Low<DB>;
  private static instance: TestDB;

  private constructor() {
    const file = path.join(os.tmpdir(), 'cypress-test-db.json');
    const adapter = new JSONFile<DB>(file);
    this.db = new Low(adapter, {
      cache: { lastRun: {}, performanceBaseline: {} },
      history: {
        results: [],
        stats: {
          totalRuns: 0,
          passRate: 0,
          avgDuration: 0,
          flakiness: 0
        }
      },
      performance: {
        trends: []
      }
    });
  }

  static getInstance(): TestDB {
    if (!TestDB.instance) {
      TestDB.instance = new TestDB();
    }
    return TestDB.instance;
  }

  async init() {
    await this.db.read();
  }

  async getCachedResult(spec: string, hash: string): Promise<TestResult | null> {
    const cached = this.db.data.cache.lastRun[spec];
    return cached && cached.hash === hash ? cached.result : null;
  }

  async cacheResult(spec: string, hash: string, result: TestResult) {
    this.db.data.cache.lastRun[spec] = { hash, result };
    await this.db.write();
  }

  async addResult(result: TestResult) {
    this.db.data.history.results.push(result);
    this.updateStats();
    await this.db.write();
  }

  async getFlakiness(spec: string): Promise<number> {
    const results = this.db.data.history.results.filter(r => r.spec === spec);
    if (results.length < 2) return 0;

    let changes = 0;
    for (let i = 1; i < results.length; i++) {
      if (results[i].status !== results[i - 1].status) changes++;
    }
    return changes / (results.length - 1);
  }

  async getOptimalParallelism(): Promise<number> {
    const cpus = os.cpus().length;
    const results = this.db.data.history.results;
    if (results.length === 0) return cpus;

    // Calculate average test duration
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    // Consider memory usage
    const avgMemoryUsage = results.reduce((sum, r) => sum + r.performance.memoryUsage, 0) / results.length;
    const totalMemory = os.totalmem();
    const memoryBasedParallelism = Math.floor(totalMemory / (avgMemoryUsage * 1.5)); // 1.5x safety factor

    // Consider CPU usage
    const avgCpuUsage = results.reduce((sum, r) => sum + r.performance.cpuUsage, 0) / results.length;
    const cpuBasedParallelism = Math.floor(cpus / avgCpuUsage);

    return Math.min(cpus, memoryBasedParallelism, cpuBasedParallelism);
  }

  async getTestPriority(spec: string): Promise<number> {
    const results = this.db.data.history.results.filter(r => r.spec === spec);
    if (results.length === 0) return 1;

    const factors = {
      recentFailures: 0,
      duration: 0,
      flakiness: 0,
      frequency: 0
    };

    // Recent failures (last 5 runs)
    const recent = results.slice(-5);
    factors.recentFailures = recent.filter(r => r.status === 'failed').length / recent.length;

    // Duration (normalized)
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const maxDuration = Math.max(...this.db.data.history.results.map(r => r.duration));
    factors.duration = avgDuration / maxDuration;

    // Flakiness
    factors.flakiness = await this.getFlakiness(spec);

    // Run frequency
    const allSpecs = new Set(this.db.data.history.results.map(r => r.spec));
    factors.frequency = results.length / this.db.data.history.results.length * allSpecs.size;

    // Calculate priority (higher is more important)
    return (
      factors.recentFailures * 0.4 +
      factors.duration * 0.2 +
      factors.flakiness * 0.3 +
      factors.frequency * 0.1
    );
  }

  async updateStats() {
    const results = this.db.data.history.results;
    const stats = this.db.data.history.stats;
    
    stats.totalRuns = results.length;
    stats.passRate = results.filter(r => r.status === 'passed').length / results.length;
    stats.avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    // Calculate overall flakiness
    let totalFlakiness = 0;
    const specs = new Set(results.map(r => r.spec));
    for (const spec of specs) {
      totalFlakiness += await this.getFlakiness(spec);
    }
    stats.flakiness = totalFlakiness / specs.size;
  }

  async addPerformanceDataPoint(data: {
    date: string;
    avgDuration: number;
    passRate: number;
    parallelism: number;
  }) {
    this.db.data.performance.trends.push(data);
    await this.db.write();
  }

  async getPerformanceBaseline(spec: string) {
    return this.db.data.cache.performanceBaseline[spec];
  }

  async updatePerformanceBaseline(spec: string, result: TestResult) {
    const baseline = this.db.data.cache.performanceBaseline[spec] || {
      avgDuration: result.duration,
      p95Duration: result.duration,
      failureRate: result.status === 'failed' ? 1 : 0
    };

    // Update moving averages
    const alpha = 0.1; // Smoothing factor
    baseline.avgDuration = alpha * result.duration + (1 - alpha) * baseline.avgDuration;
    
    // Update p95
    const durations = this.db.data.history.results
      .filter(r => r.spec === spec)
      .map(r => r.duration)
      .sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    baseline.p95Duration = durations[p95Index] || result.duration;

    // Update failure rate
    const recentResults = this.db.data.history.results
      .filter(r => r.spec === spec)
      .slice(-100);
    baseline.failureRate = recentResults.filter(r => r.status === 'failed').length / recentResults.length;

    this.db.data.cache.performanceBaseline[spec] = baseline;
    await this.db.write();
  }
}

export const testDB = TestDB.getInstance();
