const cypress = require('cypress');
const { exec } = require('child_process');

// Start dev server
exec('pnpm dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Dev server error: ${error}`);
    return;
  }
});

// Wait for dev server to start
setTimeout(() => {
  // Run Cypress
  cypress.run({
    headed: true,
    spec: process.argv[2] || 'cypress/e2e/**/*.cy.ts',
    config: {
      baseUrl: 'http://localhost:3001'
    }
  }).then((results) => {
    console.log(results);
    process.exit(results.totalFailed ? 1 : 0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}, 5000);
