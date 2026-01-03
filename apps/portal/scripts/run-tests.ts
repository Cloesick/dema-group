import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

interface TestResult {
  title: string;
  state: 'passed' | 'failed' | 'pending';
  duration?: number;
  error?: {
    message?: string;
    stack?: string;
    screenshot?: string;
  };
}

interface TestSuite {
  title: string;
  tests: TestResult[];
}

interface TestRun {
  suites: TestSuite[];
  stats: {
    suites: number;
    tests: number;
    passes: number;
    failures: number;
    pending: number;
    duration: number;
    start: Date;
    end?: Date;
  };
}

class TestRunner {
  private currentRun: TestRun = {
    suites: [],
    stats: {
      suites: 0,
      tests: 0,
      passes: 0,
      failures: 0,
      pending: 0,
      duration: 0,
      start: new Date()
    }
  };

  private spinner = ora('Starting tests...');

  async run(options: { spec?: string; browser?: string; headed?: boolean } = {}) {
    const args = ['cypress', 'run'];
    
    if (options.spec) {
      args.push('--spec', options.spec);
    }
    
    if (options.browser) {
      args.push('--browser', options.browser);
    }
    
    if (options.headed) {
      args.push('--headed');
    }

    this.spinner.start();

    try {
      await this.executeTests(args);
      await this.sendFinalReport();
      this.spinner.succeed('Tests completed');
    } catch (error) {
      this.spinner.fail('Tests failed');
      console.error(error);
      process.exit(1);
    }
  }

  private async executeTests(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const cypress = spawn('npx', ['cypress', ...args.slice(1)], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: 'true' }
      });

      let buffer = '';

      cypress.stdout.on('data', (data) => {
        buffer += data.toString();
        this.processOutput(buffer);
      });

      cypress.stderr.on('data', (data) => {
        console.error(chalk.red(data.toString()));
      });

      cypress.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Tests failed with code ${code}`));
        }
      });
    });
  }

  private processOutput(output: string) {
    // Look for test results
    const testMatch = output.match(/✓|✖|⚠\s+(.+?)(?=\n|$)/g);
    if (testMatch) {
      testMatch.forEach(line => {
        const status = line.startsWith('✓') ? 'passed' :
                      line.startsWith('✖') ? 'failed' : 'pending';
        const title = line.slice(2).trim();
        
        this.addTestResult({
          title,
          state: status,
          duration: Date.now() - this.currentRun.stats.start.getTime()
        });
      });
    }

    // Look for errors
    const errorMatch = output.match(/Error:\s+(.+?)(?=\n|$)/);
    if (errorMatch) {
      const lastTest = this.getLastTest();
      if (lastTest) {
        lastTest.error = {
          message: errorMatch[1],
          stack: output.slice(errorMatch.index)
        };
      }
    }

    // Look for screenshots
    const screenshotMatch = output.match(/Screenshot:\s+(.+?)(?=\n|$)/);
    if (screenshotMatch && screenshotMatch[1]) {
      const lastTest = this.getLastTest();
      if (lastTest) {
        lastTest.error = lastTest.error || {};
        lastTest.error.screenshot = screenshotMatch[1];
      }
    }

    // Update spinner text
    this.updateSpinner();
  }

  private addTestResult(result: TestResult) {
    let suite = this.currentRun.suites[this.currentRun.suites.length - 1];
    if (!suite) {
      suite = { title: 'Default Suite', tests: [] };
      this.currentRun.suites.push(suite);
      this.currentRun.stats.suites++;
    }

    suite.tests.push(result);
    this.currentRun.stats.tests++;

    switch (result.state) {
      case 'passed':
        this.currentRun.stats.passes++;
        break;
      case 'failed':
        this.currentRun.stats.failures++;
        break;
      case 'pending':
        this.currentRun.stats.pending++;
        break;
    }

    // Send real-time update to chat
    this.sendTestUpdate(result);
  }

  private getLastTest(): TestResult | undefined {
    const lastSuite = this.currentRun.suites[this.currentRun.suites.length - 1];
    return lastSuite?.tests[lastSuite.tests.length - 1];
  }

  private updateSpinner() {
    const { tests, passes, failures, pending } = this.currentRun.stats;
    const duration = Date.now() - this.currentRun.stats.start.getTime();
    
    this.spinner.text = chalk.blue(
      `Running tests... ${tests} total, ${passes} passed, ${failures} failed, ${pending} pending (${duration / 1000}s)`
    );
  }

  private async sendTestUpdate(result: TestResult) {
    const status = result.state === 'passed' ? '✅' :
                  result.state === 'failed' ? '❌' : '⚠️';
    
    const message = `${status} ${result.title} (${result.duration}ms)`;
    
    if (result.error) {
      const error = `
❌ Error: ${result.error.message}
${result.error.stack ? `\`\`\`\n${result.error.stack}\n\`\`\`` : ''}
${result.error.screenshot ? `📸 [Screenshot](${result.error.screenshot})` : ''}
`;
      await this.sendToChat(error);
    }

    await this.sendToChat(message);
  }

  private async sendFinalReport() {
    this.currentRun.stats.end = new Date();
    this.currentRun.stats.duration = 
      this.currentRun.stats.end.getTime() - this.currentRun.stats.start.getTime();

    const summary = `
# Test Run Summary

## Stats
- Total Suites: ${this.currentRun.stats.suites}
- Total Tests: ${this.currentRun.stats.tests}
- Passed: ${this.currentRun.stats.passes} ✅
- Failed: ${this.currentRun.stats.failures} ❌
- Pending: ${this.currentRun.stats.pending} ⚠️
- Duration: ${this.currentRun.stats.duration / 1000}s

## Results
${this.currentRun.suites.map(suite => `
### ${suite.title}
${suite.tests.map(test => {
  const status = test.state === 'passed' ? '✅' :
                 test.state === 'failed' ? '❌' : '⚠️';
  return `- ${status} ${test.title} (${test.duration}ms)`;
}).join('\n')}
`).join('\n')}
`;

    await this.sendToChat(summary);
  }

  private async sendToChat(message: string) {
    try {
      await fetch('http://localhost:3000/api/chat/cypress-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
          runId: process.env.CYPRESS_RUN_ID
        })
      });
    } catch (error) {
      console.error('Failed to send message to chat:', error);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: { [key: string]: string } = {};

for (let i = 0; i < args.length; i += 2) {
  if (args[i].startsWith('--')) {
    options[args[i].slice(2)] = args[i + 1];
  }
}

// Run tests
const runner = new TestRunner();
runner.run({
  spec: options.spec,
  browser: options.browser,
  headed: options.headed === 'true'
});
