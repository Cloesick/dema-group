const cypress = require('cypress');

cypress.run({
  spec: process.argv[2],
  config: {
    e2e: {
      baseUrl: 'http://localhost:3001',
      supportFile: false
    }
  }
}).then((results) => {
  console.log(results);
  process.exit(results.status === 'failed' ? 1 : 0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
