import { spawn } from 'child_process';
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

interface TestOptions {
  suite?: string;
  browser?: 'chrome' | 'firefox' | 'electron';
  mode?: 'run' | 'open';
  env?: string;
  headed?: boolean;
  grep?: string;
  record?: boolean;
}

class TestRunner {
  private spinner = ora();

  async run(options: TestOptions) {
    const {
      suite = 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      browser = 'chrome',
      mode = 'run',
      env = 'development',
      headed = false,
      grep,
      record = false
    } = options;

    const args = [
      'cypress',
      mode,
      '--browser', browser,
      '--spec', suite
    ];

    if (headed) {
      args.push('--headed');
    }

    if (grep) {
      args.push('--grep', grep);
    }

    if (record) {
      args.push('--record');
    }

    // Add environment variables
    process.env.CYPRESS_ENVIRONMENT = env;
    const envVars = { NODE_ENV: env };

    this.spinner.start(chalk.blue(`Running tests in ${env} environment...`));

    try {
      await this.executeCommand('pnpm', args);
      this.spinner.succeed(chalk.green('Tests completed successfully! 🎉'));
    } catch (error) {
      this.spinner.fail(chalk.red('Tests failed! ❌'));
      console.error(error);
      process.exit(1);
    }
  }

  private executeCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        stdio: 'inherit',
        shell: true
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// CLI Configuration
program
  .name('test-runner')
  .description('Cypress Test Runner CLI')
  .version('1.0.0');

program
  .option('-s, --suite <path>', 'Test suite to run (glob pattern)')
  .option('-b, --browser <name>', 'Browser to run tests in (chrome, firefox, electron)')
  .option('-m, --mode <mode>', 'Test mode (run or open)')
  .option('-e, --env <environment>', 'Environment to run tests in')
  .option('--headed', 'Run tests in headed mode')
  .option('-g, --grep <pattern>', 'Run tests matching a pattern')
  .option('-r, --record', 'Record test results')
  .parse(process.argv);

const runner = new TestRunner();
runner.run(program.opts() as TestOptions).catch(console.error);
