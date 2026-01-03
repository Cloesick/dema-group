#!/usr/bin/env node
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import Table from 'ink-table';
import { spawn } from 'child_process';
import { program } from 'commander';
import path from 'path';
import fs from 'fs/promises';

interface TestResult {
  suite: string;
  spec: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  duration: number;
  error?: string;
  retries: number;
}

interface TestSuite {
  name: string;
  specs: number;
  running: number;
  passed: number;
  failed: number;
  duration: number;
}

let PARALLEL_RUNS = 4; // Number of parallel test runs

const Dashboard = () => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [activeTests, setActiveTests] = useState<TestResult[]>([]);
  const [completedTests, setCompletedTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const { exit } = useApp();

  useInput((input: string, key: { escape: boolean }) => {
    if (input === 'q' || key.escape) {
      exit();
    }
  });

  const updateTestStatus = (test: TestResult) => {
    setActiveTests(prev => {
      const filtered = prev.filter(t => t.spec !== test.spec);
      return [...filtered, test];
    });

    if (test.status === 'passed' || test.status === 'failed') {
      setCompletedTests(prev => [...prev, test]);
    }

    setSuites(prev => {
      return prev.map(suite => {
        if (suite.name === test.suite) {
          return {
            ...suite,
            running: suite.running - (test.status === 'running' ? 0 : 1),
            passed: suite.passed + (test.status === 'passed' ? 1 : 0),
            failed: suite.failed + (test.status === 'failed' ? 1 : 0),
          };
        }
        return suite;
      });
    });
  };

  const runTest = async (spec: string, suite: string) => {
    updateTestStatus({
      suite,
      spec,
      status: 'running',
      duration: 0,
      retries: 0,
    });

    return new Promise<void>((resolve) => {
      const start = Date.now();
      const cypressProcess = spawn('pnpm', ['cypress', 'run', '--spec', spec], {
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: 'true' },
      });

      let output = '';
      cypressProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      cypressProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      cypressProcess.on('close', (code) => {
        const duration = Date.now() - start;
        updateTestStatus({
          suite,
          spec,
          status: code === 0 ? 'passed' : 'failed',
          duration,
          error: code !== 0 ? output : undefined,
          retries: 0,
        });
        resolve();
      });
    });
  };

  const runTestsInParallel = async (specs: string[]) => {
    const chunks = [];
    for (let i = 0; i < specs.length; i += PARALLEL_RUNS) {
      chunks.push(specs.slice(i, i + PARALLEL_RUNS));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(spec => {
        const suite = path.dirname(spec).split(path.sep).pop() || '';
        return runTest(spec, suite);
      }));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    const findSpecs = async () => {
      const cypressFolder = path.join(process.cwd(), 'cypress', 'e2e');
      const suites = await fs.readdir(cypressFolder);
      
      const allSpecs: string[] = [];
      const suiteStats: TestSuite[] = [];

      for (const suite of suites) {
        const suitePath = path.join(cypressFolder, suite);
        const stats = await fs.stat(suitePath);
        
        if (stats.isDirectory()) {
          const specs = await fs.readdir(suitePath);
          const specPaths = specs
            .filter(spec => spec.endsWith('.cy.ts'))
            .map(spec => path.join(suitePath, spec));
          
          allSpecs.push(...specPaths);
          suiteStats.push({
            name: suite,
            specs: specPaths.length,
            running: specPaths.length,
            passed: 0,
            failed: 0,
            duration: 0,
          });
        }
      }

      setSuites(suiteStats);
      runTestsInParallel(allSpecs);
    };

    findSpecs().catch(console.error);
  }, []);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Cypress Test Dashboard</Text>
        {isRunning && (
          <Text color="yellow">
            {' '}
            <Spinner type="dots" />
          </Text>
        )}
      </Box>

      <Box marginBottom={1}>
        <Table data={suites.map(suite => ({
          Suite: suite.name,
          Total: suite.specs,
          Running: suite.running,
          Passed: suite.passed,
          Failed: suite.failed,
        }))} />
      </Box>

      <Box marginBottom={1}>
        <Text bold>Active Tests:</Text>
      </Box>
      {activeTests.map(test => (
        <Box key={test.spec}>
          <Text>
            {test.status === 'running' && <Spinner type="dots" />}{' '}
            {test.spec}: {test.status}
            {test.duration > 0 && ` (${(test.duration / 1000).toFixed(2)}s)`}
          </Text>
        </Box>
      ))}

      {!isRunning && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Summary:</Text>
          <Text>
            Total: {completedTests.length}
            {' | '}
            Passed: <Text color="green">{completedTests.filter(t => t.status === 'passed').length}</Text>
            {' | '}
            Failed: <Text color="red">{completedTests.filter(t => t.status === 'failed').length}</Text>
          </Text>
          <Text>Press 'q' to exit</Text>
        </Box>
      )}
    </Box>
  );
};

// CLI setup
program
  .option('-p, --parallel <number>', 'Number of parallel test runs', '4')
  .option('-m, --mode <mode>', 'Test mode (run or watch)', 'run')
  .option('-r, --reporter <type>', 'Reporter type (spec, dot, or dashboard)', 'dashboard')
  .parse(process.argv);

const options = program.opts();
PARALLEL_RUNS = parseInt(options.parallel, 10);

render(<Dashboard />);
