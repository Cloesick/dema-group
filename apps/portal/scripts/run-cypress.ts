import cypress from 'cypress';
type CypressRunResult = { totalFailed: number };
import path from 'path';

// Set environment variables
process.env.CYPRESS_SHELL = 'cmd.exe';
process.env.FORCE_COLOR = '1';

// Run Cypress
async function runTests() {
  try {
    const results = await cypress.run({
      headed: true,
      spec: path.resolve(__dirname, '..', 'cypress/e2e/smoke.cy.ts'),
      config: {
        e2e: {
          baseUrl: 'http://localhost:3001'
        }
      },
      env: {
        CYPRESS_SHELL: 'cmd.exe'
      }
    });

    console.log('Test Results:', results);
    const failed = (results as CypressRunResult).totalFailed || 0;
    process.exit(failed ? 1 : 0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
}

runTests();
