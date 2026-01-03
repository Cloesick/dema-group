const fs = require('fs');
const path = require('path');
const config = require('../cypress.config.ts').default;

fs.writeFileSync(
  path.join(__dirname, '../cypress.config.json'),
  JSON.stringify(config, null, 2)
);
