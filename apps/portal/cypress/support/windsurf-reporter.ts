interface TestResult {
  title: string;
  state: 'failed' | 'passed' | 'pending';
  duration?: number;
  err?: {
    message?: string;
    stack?: string;
  };
}

interface Suite {
  title: string;
  tests: TestResult[];
}

interface RunResult {
  spec: {
    relative: string;
  };
  tests: TestResult[];
  suites: Suite[];
}

interface TestResults {
  totalTests: number;
  totalFailed: number;
  totalPassed: number;
  totalPending: number;
  totalDuration: number;
  runs: RunResult[];
}

import { defineConfig } from 'cypress';

const formatError = (err: any) => {
  if (!err) return '';
  return `
\`\`\`
${err.message || err}
${err.stack || ''}
\`\`\`
`;
};

const formatTest = (test: any) => {
  const error = test.err ? `\n❌ **Error:**${formatError(test.err)}` : '';
  const duration = test.duration ? `\n⏱️ Duration: ${test.duration}ms` : '';
  
  return `
### ${test.title}
📝 **Status:** ${test.state === 'failed' ? '❌ Failed' : '✅ Passed'}${duration}${error}
`;
};

const formatSuite = (suite: any) => {
  if (!suite.tests || suite.tests.length === 0) return '';
  
  const tests = suite.tests
    .filter((test: any) => test.state === 'failed')
    .map(formatTest)
    .join('\n');
    
  return tests ? `\n## ${suite.title}\n${tests}` : '';
};

Cypress.on('test:after:run', (test) => {
  if (test.state === 'failed') {
    // Take a screenshot on failure
    cy.screenshot(`failure-${test.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`);
  }
});

Cypress.on('run:end', async (results) => {
  if (results.totalFailed === 0) return;

  const timestamp = new Date().toISOString();
  const summary = `# 🚨 Cypress Test Failures (${timestamp})

## Summary
- Total Tests: ${results.totalTests}
- Failed: ${results.totalFailed}
- Passed: ${results.totalPassed}
- Pending: ${results.totalPending}
- Duration: ${results.totalDuration}ms

${results.runs
  .map((run: RunResult) => run.tests.some((t: TestResult) => t.state === 'failed') ? 
    `## File: ${run.spec.relative}
    ${run.suites.map(formatSuite).join('\n')}` : '')
  .filter(Boolean)
  .join('\n')}

[View Test Run Details](${Cypress.config().baseUrl}/cypress/reports)
`;

  // Send to Windsurf chat
  try {
    await fetch('http://localhost:3000/api/chat/cypress-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: summary,
        screenshots: Cypress.config('screenshotsFolder'),
        runId: Cypress.env('CYPRESS_RUN_ID')
      })
    });
  } catch (error) {
    console.error('Failed to send report to Windsurf:', error);
  }
});
