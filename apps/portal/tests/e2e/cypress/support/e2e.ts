import '@testing-library/cypress/add-commands';
import './chat-reporter';
import 'cypress-axe';
import 'cypress-real-events';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

// Initialize image snapshot commands
addMatchImageSnapshotCommand({
  failureThreshold: 0.03,
  failureThresholdType: 'percent',
  customDiffConfig: { threshold: 0.1 }
});

// Declare custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      tab(subject?: any): Chainable<void>;
    }
  }
}

// Add login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    // Wait for any redirects to complete
    cy.wait(1000);
  });
});

// Add tab command
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { keyCode: 9 });
  } else {
    cy.focused().trigger('keydown', { keyCode: 9 });
  }
});

import 'cypress-file-upload';

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

// Add custom commands to the global Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}


Cypress.on('test:after:run', (test) => {
  if (test.state === 'failed') {
    // Take a screenshot on failure
    cy.screenshot(`failure-${test.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`);
  }
});

Cypress.on('run:end', async (results: any) => {
  // Always send results, not just failures

  const timestamp = new Date().toISOString();
  const emoji = results.totalFailed === 0 ? '✅' : '🚨';
  const summary = `# ${emoji} Cypress Test Results (${timestamp})

## Summary
- Total Tests: ${results.totalTests}
- Failed: ${results.totalFailed}
- Passed: ${results.totalPassed}
- Pending: ${results.totalPending}
- Duration: ${results.totalDuration}ms

${results.runs
  .map((run: RunResult) => 
    `## File: ${run.spec.relative}
    ${run.suites.map(suite => {
      const tests = suite.tests
        .map(formatTest)
        .join('\n');
      return tests ? `\n## ${suite.title}\n${tests}` : '';
    }).join('\n')}`
  )
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
