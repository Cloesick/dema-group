const cypress = require('cypress');
const path = require('path');

// Set environment variables
process.env.CYPRESS_SHELL = 'cmd.exe';
process.env.FORCE_COLOR = '1';

// Run Cypress
cypress.run({
  headed: true,
  spec: path.resolve(__dirname, '..', 'cypress/e2e/smoke.cy.ts'),
  config: {
    baseUrl: 'http://localhost:3001'
  }
}).then((results) => {
  console.log('Test Results:', results);
  process.exit(results.totalFailed ? 1 : 0);
}).catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
