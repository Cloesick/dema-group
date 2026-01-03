const cypress = require('cypress');

async function runTest() {
  try {
    const results = await cypress.run({
      spec: 'cypress/e2e/smoke.cy.ts',
      config: {
        e2e: {
          baseUrl: 'http://localhost:3001',
          supportFile: false
        }
      }
    });

    console.log('Test Results:', results);
    process.exit(results.status === 'failed' ? 1 : 0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
}

runTest();
