const assert = require('assert');

// Test suite
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected);
    }
  };
}

// Tests
test('should pass', () => {
  expect(true).toBe(true);
});

// Run tests
console.log('Running tests...\n');
let passed = 0;
let failed = 0;

tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(`  ${err.message}\n`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
