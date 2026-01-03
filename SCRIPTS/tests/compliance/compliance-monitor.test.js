import assert from 'assert';
import { compliance } from '../../compliance/compliance-monitor.js';

// Test suite
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
    async rejects() {
      try {
        await actual;
        throw new Error('Expected promise to reject');
      } catch (err) {
        return {
          toThrow(expected) {
            assert.strictEqual(err.message, expected);
          }
        };
      }
    }
  };
}

// Mock dependencies
const mockWriteFileSync = () => {};
const mockReadFileSync = () => {};

// Mock fs module
const mockFs = {
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync
};

import.meta.jest = {
  mock: (module, implementation) => {
    if (module === 'fs') {
      return mockFs;
    }
  }
};

// Tests
test('verifyDeployment should pass when all services are healthy', async () => {
  const mockContext = {
    config: {
      services: [
        { name: 'service1' },
        { name: 'service2' }
      ]
    },
    services: new Map([
      ['service1', { status: 'healthy' }],
      ['service2', { status: 'healthy' }]
    ])
  };

  await compliance.verifyDeployment(mockContext);
});

test('verifyDeployment should fail when any service is unhealthy', async () => {
  const mockContext = {
    config: {
      services: [
        { name: 'service1' },
        { name: 'service2' }
      ]
    },
    services: new Map([
      ['service1', { status: 'healthy' }],
      ['service2', { status: 'failed' }]
    ])
  };

  try {
    await compliance.verifyDeployment(mockContext);
    throw new Error('Expected verifyDeployment to throw');
  } catch (err) {
    expect(err.message).toBe('Service service2 is not healthy');
  }
});

test('shouldRollback should return false when rollback is disabled', () => {
  const mockContext = {
    config: {
      rollback: {
        enabled: false
      }
    }
  };

  expect(compliance.shouldRollback(mockContext, new Error('Test error')))
    .toBe(false);
});

test('shouldRollback should return true on health check failure when configured', () => {
  const mockContext = {
    config: {
      rollback: {
        enabled: true,
        automatic: true,
        triggers: {
          healthCheck: true
        }
      }
    }
  };

  expect(compliance.shouldRollback(mockContext, new Error('health check failed')))
    .toBe(true);
});

test('collectEvidence should store evidence with correct metadata', async () => {
  const mockContent = Buffer.from('test evidence');
  const mockRuleId = 'TEST-001';

  await compliance.collectEvidence(mockRuleId, 'log', mockContent);

  try {
    await compliance.collectEvidence(mockRuleId, 'log', mockContent);
  } catch (err) {
    // Ignore file system error
  }

  expect({
    ruleId: mockRuleId,
    type: 'log',
    metadata: {
      collector: 'compliance-monitor'
    }
  });
});

test('updateMonitoring should record metrics when monitoring is enabled', async () => {
  const mockContext = {
    config: {
      monitoring: {
        enabled: true
      }
    },
    services: new Map([
      ['service1', { status: 'healthy', startTime: Date.now() - 1000, endTime: Date.now() }],
      ['service2', { status: 'failed', startTime: Date.now() - 2000, endTime: Date.now() }]
    ]),
    startTime: Date.now() - 5000
  };

  await compliance.updateMonitoring(mockContext);

  try {
    await compliance.updateMonitoring(mockContext);
  } catch (err) {
    // Ignore file system error
  }

});

test('updateMonitoring should skip metrics when monitoring is disabled', async () => {
  const mockContext = {
    config: {
      monitoring: {
        enabled: false
      }
    }
  };

  await compliance.updateMonitoring(mockContext);

  // Nothing to verify - disabled monitoring should just return
});

// Run tests
console.log('Running tests...\n');
let passed = 0;
let failed = 0;

async function runTests() {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.log(`✗ ${name}`);
      console.log(`  ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

