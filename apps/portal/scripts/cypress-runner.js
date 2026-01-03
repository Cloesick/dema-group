const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.CYPRESS_SHELL = 'cmd.exe';
process.env.NODE_OPTIONS = '--require ts-node/register';

// Run Cypress
const cypress = spawn('npx', ['cypress', 'run', '--spec', process.argv[2]], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

cypress.on('exit', (code) => {
  process.exit(code);
});
