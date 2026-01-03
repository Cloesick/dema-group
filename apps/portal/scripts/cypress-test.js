const cypress = require('cypress');

cypress.run({
  spec: process.argv[2] || 'cypress/e2e/**/*.cy.ts',
  headed: true,
  config: {
    baseUrl: 'http://localhost:3001',
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'spec',
    env: {
      CYPRESS_SHELL: 'cmd.exe'
    }
  }
}).then((results) => {
  console.log('Test Results:', results);
  process.exit(results.totalFailed ? 1 : 0);
}).catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
