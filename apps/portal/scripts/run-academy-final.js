const cypress = require('cypress');
const { spawn } = require('child_process');

// Start dev server
const devServer = spawn('pnpm', ['dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait for server to start
setTimeout(() => {
  // Run Cypress
  cypress.run({
    spec: 'cypress/e2e/academy/academy.cy.ts',
    config: {
      e2e: {
        baseUrl: 'http://localhost:3001',
        supportFile: 'cypress/support/e2e.ts'
      }
    },
    env: {
      CYPRESS_SHELL: 'cmd.exe',
      PATH: process.env.PATH
    }
  }).then((results) => {
    console.log('Test Results:', results);
    devServer.kill();
    process.exit(results.totalFailed ? 1 : 0);
  }).catch((err) => {
    console.error('Test Error:', err);
    devServer.kill();
    process.exit(1);
  });
}, 5000);
