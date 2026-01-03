const cypress = require('cypress');
const path = require('path');

cypress.run({
  spec: process.argv[2] || 'cypress/e2e/**/*.cy.ts',
  headed: true,
  config: {
    baseUrl: 'http://localhost:3001',
    video: true,
    screenshotOnRunFailure: true
  },
  env: {
    CYPRESS_SHELL: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'
  }
}).then((results) => {
  console.log(results);
  process.exit(results.totalFailed ? 1 : 0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
