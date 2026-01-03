const cypress = require('cypress');

cypress.run({
  spec: 'cypress/e2e/academy/academy.cy.ts',
  config: {
    e2e: {
      baseUrl: 'http://localhost:3001',
      supportFile: 'cypress/support/e2e.ts'
    }
  },
  env: {
    CYPRESS_SHELL: 'cmd.exe'
  }
}).then((results) => {
  console.log('Test Results:', results);
  process.exit(results.totalFailed ? 1 : 0);
}).catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
