const cypress = require('cypress');
const path = require('path');

// Set environment variables
process.env.CYPRESS_VERIFY_TIMEOUT = '100000';
process.env.NO_COLOR = '1';
process.env.CYPRESS_CRASH_REPORTS = '0';

// Run Cypress
cypress.run({
  project: path.join(__dirname, '..'),
  config: {
    baseUrl: 'http://localhost:3001',
    video: false,
    trashAssetsBeforeRuns: false,
  },
  env: {
    API_URL: 'http://localhost:3001/api',
  },
}).then((results) => {
  if (results.totalFailed > 0) {
    process.exit(1);
  }
  process.exit(0);
}).catch((err) => {
  console.error('Error running Cypress:', err);
  process.exit(1);
});
