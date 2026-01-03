const { spawn } = require('child_process');
const path = require('path');

// Check if dev server is running
const isPortInUse = async (port) => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
};

// Start dev server if needed
const startServer = async () => {
  const portInUse = await isPortInUse(3001);
  if (!portInUse) {
    const server = spawn('pnpm', ['dev'], {
      stdio: 'inherit',
      shell: true
    });
    return server;
  }
  return null;
};

// Run tests
const runTests = async () => {
  const server = await startServer();

  // Run Cypress after a delay to ensure server is ready
  setTimeout(() => {
    const cypressPath = path.resolve(__dirname, '../node_modules/.bin/cypress');
    const cypress = spawn(cypressPath, [
      'run',
      '--headed',
      '--spec',
      process.argv[2] || 'cypress/e2e/**/*.cy.ts'
    ], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        CYPRESS_SHELL: 'cmd.exe',
        FORCE_COLOR: '1'
      }
    });

    cypress.on('exit', (code) => {
      if (server) server.kill();
      process.exit(code);
    });
  }, 5000);
};

// Handle process termination
process.on('SIGINT', () => {
  process.exit();
});

// Start the process
runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
    '--headed',
    '--spec',
    process.argv[2] || 'cypress/e2e/**/*.cy.ts'
  ], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      CYPRESS_SHELL: 'cmd.exe',
      FORCE_COLOR: '1'
    }
  });

  cypress.on('exit', (code) => {
    devServer.kill();
    process.exit(code);
  });
}, 5000); // Wait 5 seconds for dev server to start

// Handle process termination
process.on('SIGINT', () => {
  devServer.kill();
  process.exit();
});
