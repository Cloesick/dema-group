import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { testDB } from './test-db';
import os from 'os';

interface TestFile {
  path: string;
  priority: number;
  hash: string;
}

class SmartRunner {
  private maxParallel: number;
  private runningTests: Set<string> = new Set();
  private testQueue: TestFile[] = [];
  private results: Map<string, boolean> = new Map();

  constructor(maxParallel?: number) {
    this.maxParallel = maxParallel || os.cpus().length;
  }

  private async getFileHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private async getDependencyHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    const importRegex = /import.*from\s+['"](.+)['"]/g;
    const deps = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(content)) !== null) {
      deps.add(match[1]);
    }

    const depsContent = await Promise.all(
      Array.from(deps).map(async dep => {
        try {
          const resolvedPath = require.resolve(dep, { paths: [path.dirname(filePath)] });
          return await fs.readFile(resolvedPath, 'utf-8');
        } catch {
          return '';
        }
      })
    );

    return crypto
      .createHash('md5')
      .update(content)
      .update(depsContent.join(''))
      .digest('hex');
  }

  private async findTestFiles(): Promise<TestFile[]> {
    const cypressFolder = path.join(process.cwd(), 'cypress', 'e2e');
    const files: TestFile[] = [];

    const processDirectory = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else if (entry.name.endsWith('.cy.ts')) {
          const hash = await this.getDependencyHash(fullPath);
          const priority = await testDB.getTestPriority(fullPath);
          files.push({ path: fullPath, priority, hash });
        }
      }
    };

    await processDirectory(cypressFolder);
    return files;
  }

  private async shouldRunTest(file: TestFile): Promise<boolean> {
    const cachedResult = await testDB.getCachedResult(file.path, file.hash);
    if (cachedResult) {
      const baseline = await testDB.getPerformanceBaseline(file.path);
      if (baseline) {
        const isStable = baseline.failureRate < 0.01;
        const isPerformant = cachedResult.duration <= baseline.p95Duration;
        if (isStable && isPerformant) {
          return false;
        }
      }
    }
    return true;
  }

  private optimizeTestOrder(files: TestFile[]): TestFile[] {
    return files.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      const aDir = path.dirname(a.path);
      const bDir = path.dirname(b.path);
      if (aDir !== bDir) {
        return aDir.localeCompare(bDir);
      }

      return a.path.localeCompare(b.path);
    });
  }

  private async runSingleTest(file: TestFile): Promise<void> {
    this.runningTests.add(file.path);

    const startTime = Date.now();
    const startUsage = process.cpuUsage();
    const startMemory = process.memoryUsage().heapUsed;

    return new Promise((resolve) => {
      const cypressProcess = spawn('pnpm', ['cypress', 'run', '--spec', file.path], {
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: 'true' },
      });

      let output = '';
      cypressProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      cypressProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });

      cypressProcess.on('close', async (code) => {
        const duration = Date.now() - startTime;
        const cpuUsage = process.cpuUsage(startUsage);
        const memoryUsed = process.memoryUsage().heapUsed - startMemory;

        const result = {
          id: crypto.randomUUID(),
          suite: path.basename(path.dirname(file.path)),
          spec: file.path,
          status: code === 0 ? 'passed' as const : 'failed' as const,
          duration,
          error: code !== 0 ? output : undefined,
          timestamp: new Date().toISOString(),
          branch: 'master',
          commit: 'HEAD',
          performance: {
            loadTime: duration,
            cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000,
            memoryUsage: memoryUsed,
          },
        };

        await testDB.addResult(result);
        await testDB.cacheResult(file.path, file.hash, result);
        await testDB.updatePerformanceBaseline(file.path, result);

        this.results.set(file.path, code === 0);
        this.runningTests.delete(file.path);
        resolve();
      });
    });
  }

  public async runTests(): Promise<Map<string, boolean>> {
    await testDB.init();

    console.log('🔍 Finding test files...');
    const files = await this.findTestFiles();
    console.log(`📊 Found ${files.length} test files`);

    console.log('⚡ Optimizing test execution order...');
    this.testQueue = this.optimizeTestOrder(files);

    const optimalParallel = await testDB.getOptimalParallelism();
    this.maxParallel = Math.min(this.maxParallel, optimalParallel);
    console.log(`🚀 Running tests with ${this.maxParallel} parallel processes`);

    while (this.testQueue.length > 0 || this.runningTests.size > 0) {
      while (this.runningTests.size < this.maxParallel && this.testQueue.length > 0) {
        const nextTest = this.testQueue.shift()!;
        if (await this.shouldRunTest(nextTest)) {
          this.runSingleTest(nextTest).catch(console.error);
        } else {
          console.log(`⏩ Skipping ${nextTest.path} (cached)`);
          this.results.set(nextTest.path, true);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.results;
  }
}

export const smartRunner = new SmartRunner();
