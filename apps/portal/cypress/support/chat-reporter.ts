export {};

declare global {
  interface Window {
    Cypress: Cypress.Cypress;
  }
}

interface TestResult {
  title: string;
  state: 'failed' | 'passed' | 'pending';
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

interface RunResult {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  totalDuration: number;
  suites: TestSuite[];
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  nodeVersion: string;
  cypressVersion: string;
  startedAt: string;
  endedAt: string;
}

interface DOMSnapshot {
  html: string;
  selector: string;
  exists: boolean;
  visible: boolean;
  attributes: Record<string, string>;
}

const captureElementState = (selector: string): DOMSnapshot | null => {
  try {
    const el = Cypress.$(selector);
    if (el.length === 0) return null;
    return {
      html: el.prop('outerHTML'),
      selector,
      exists: el.length > 0,
      visible: el.is(':visible'),
      attributes: el.prop('attributes') ? Array.from(el.prop('attributes')).reduce<Record<string, string>>((acc, attr: { name: string; value: string }) => ({ ...acc, [attr.name]: attr.value }), {}) : {}
    };
  } catch (e) {
    return null;
  }
};

const formatError = (err: any, test?: any) => {
  if (!err) return '';

  let errorMessage = `\n### 🐛 Error\n\`\`\`\n${err.message || err}\n${err.stack || ''}\n\`\`\`\n`;

  const domSnapshot = err.selector ? captureElementState(err.selector) : null;
  if (domSnapshot) {
    errorMessage += `\n### 🔍 Element State\n- Selector: \`${domSnapshot.selector}\`\n- Exists: ${domSnapshot.exists}\n- Visible: ${domSnapshot.visible}\n- HTML:\n\`\`\`html\n${domSnapshot.html}\n\`\`\`\n`;
  }

  const commonFixes = {
    'is not visible': 'cy.get(selector).should("be.visible").click()',
    'timed out waiting': 'cy.get(selector, { timeout: 10000 })',
    'detached from the DOM': 'cy.get(selector).should("be.attached").click()'
  };

  const suggestedFix = Object.entries(commonFixes).find(([pattern]) => err.message.includes(pattern))?.[1];
  if (suggestedFix) {
    errorMessage += `\n### 💡 Quick Fix\n\`\`\`typescript\n${suggestedFix}\n\`\`\`\n`;
  }

  return errorMessage;
};

const formatTest = (test: TestResult) => {
  const error = test.error ? `\n❌ **Error:**${formatError(test.error)}` : '';
  const duration = test.duration ? `\n⏱️ Duration: ${test.duration}ms` : '';
  const screenshot = test.error?.screenshot ? `\n📸 [View Screenshot](${test.error.screenshot})` : '';

  
  return `
### ${test.title}
📝 **Status:** ${test.state === 'failed' ? '❌ Failed' : test.state === 'pending' ? '⏳ Pending' : '✅ Passed'}${duration}${error}${screenshot}
`;
};

const formatSuite = (suite: TestSuite) => {
  if (!suite.tests || suite.tests.length === 0) return '';
  
  const tests = suite.tests.map(formatTest).join('\n');
  return `\n## ${suite.title}\n${tests}`;
};

const sendToChat = async (results: RunResult) => {
  const timestamp = new Date().toISOString();
  const summary = `# 🔍 Cypress Test Report (${timestamp})

## 📊 Summary
- Total Tests: ${results.totalTests}
- Passed: ${results.totalPassed} ✅
- Failed: ${results.totalFailed} ❌
- Pending: ${results.totalPending} ⏳
- Total Duration: ${results.totalDuration}ms

## 🖥️ Environment
- Browser: ${results.browserName} ${results.browserVersion}
- OS: ${results.osName} ${results.osVersion}
- Node: ${results.nodeVersion}
- Cypress: ${results.cypressVersion}

## ⏰ Timing
- Started: ${new Date(results.startedAt).toLocaleString()}
- Ended: ${new Date(results.endedAt).toLocaleString()}

${results.suites.map(formatSuite).join('\n')}

[View Full Test Report](${Cypress.config().baseUrl}/cypress/reports)
`;

  try {
    Cypress.log({
      name: 'windsurf',
      message: 'Sending test summary',
      consoleProps: () => ({ summary })
    });
    await fetch('http://localhost:3000/api/windsurf/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: summary,
        runId: Cypress.env('CYPRESS_RUN_ID'),
        status: results.totalFailed === 0 ? 'success' : 'failure',
        source: 'cypress'
      })
    });
  } catch (error) {
    Cypress.log({
      name: 'windsurf',
      message: '❌ Failed to send report',
      consoleProps: () => ({
        Error: error,
        Endpoint: '/api/windsurf/chat',
        'Error Message': error instanceof Error ? error.message : String(error)
      })
    });
  }
};

// Register the reporter with Cypress
if (typeof window !== 'undefined' && window.Cypress) {
  Cypress.on('test:after:run', async (test, runnable) => {
    // Take screenshot and report immediately on failure
    if (test.state === 'failed') {
      const screenshotPath = `cypress/screenshots/${Cypress.spec.name}/${runnable.parent?.title || 'Unknown Suite'} -- ${test.title} (failed).png`;
      cy.screenshot();
      test.error = test.error || {};
      test.error.screenshot = screenshotPath;

      // Send immediate failure notification
      const failureMessage = `# ❌ Test Failed: ${test.title}

## 📄 Details
- **Suite:** ${runnable.parent?.title || 'Unknown Suite'}
- **Spec:** ${Cypress.spec.name}
- **Duration:** ${test.duration}ms

## 🐛 Error
${formatError(test.error)}

## 📸 Screenshot
![Test Failure](${screenshotPath})

## 🔍 Quick Actions
- [Re-run this test](${Cypress.config().baseUrl}/cypress?spec=${Cypress.spec.name}&grep=${encodeURIComponent(test.title)})
- [View in IDE](vscode://file/${Cypress.spec.relative})
- [Debug in Browser](${Cypress.config().baseUrl}/__cypress/runner?spec=${Cypress.spec.name})`;

      try {
        Cypress.log({
          name: 'windsurf',
          message: '🔴 Test Failed',
          consoleProps: () => ({
            'Test Title': test.title,
            'Suite': runnable.parent?.title,
            'Error': test.error,
            'Screenshot': screenshotPath,
            'Message': failureMessage
          })
        });
        await fetch('http://localhost:3000/api/windsurf/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: failureMessage,
            runId: Cypress.env('CYPRESS_RUN_ID'),
            status: 'failure',
            type: 'immediate',
            source: 'cypress',
            test: {
              title: test.title,
              suite: runnable.parent?.title,
              spec: Cypress.spec.name,
              error: test.error,
              screenshot: screenshotPath
            }
          })
        });
      } catch (error) {
        Cypress.log({
          name: 'windsurf',
          message: '❌ Failed to send failure report',
          consoleProps: () => ({
            Error: error,
            'Test Title': test.title,
            'Error Message': error instanceof Error ? error.message : String(error)
          })
        });
      }
    }
  });

  Cypress.on('run:end', async () => {
  const results: RunResult = {
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalPending: 0,
    totalDuration: 0,
    suites: [],
    browserName: Cypress.browser.name,
    browserVersion: Cypress.browser.version,
    osName: Cypress.platform,
    osVersion: Cypress.platform,
    nodeVersion: process.version,
    cypressVersion: Cypress.version,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString()
  };

  // Collect test results
  const runner = (cy as any).state('runnable');
  if (runner) {
    results.totalTests = runner.ctx.test.total;
    results.totalPassed = runner.ctx.test.passes;
    results.totalFailed = runner.ctx.test.failures;
    results.totalPending = runner.ctx.test.pending;
    results.totalDuration = runner.ctx.test.duration;

    // Collect suite results
    const suites = runner.parent.suites;
    results.suites = suites.map((suite: any) => ({
      title: suite.title,
      tests: suite.tests.map((test: any) => ({
        title: test.title,
        state: test.state,
        duration: test.duration,
        error: test.err
      }))
    }));
  }

    await sendToChat(results);
  });
}
