import { compliance } from '../../compliance/compliance-monitor';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../../utils/logger';

jest.mock('node:fs');
jest.mock('../../utils/logger');

describe('ComplianceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyDeployment', () => {
    it('should pass when all services are healthy', async () => {
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

      await expect(compliance.verifyDeployment(mockContext)).resolves.not.toThrow();
    });

    it('should fail when any service is unhealthy', async () => {
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

      await expect(compliance.verifyDeployment(mockContext)).rejects.toThrow('Service service2 is not healthy');
    });
  });

  describe('shouldRollback', () => {
    it('should return false when rollback is disabled', () => {
      const mockContext = {
        config: {
          rollback: {
            enabled: false
          }
        }
      };

      expect(compliance.shouldRollback(mockContext, new Error('Test error'))).toBe(false);
    });

    it('should return true on health check failure when configured', () => {
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

      expect(compliance.shouldRollback(mockContext, new Error('Health check failed'))).toBe(true);
    });
  });

  describe('collectEvidence', () => {
    it('should store evidence with correct metadata', async () => {
      const mockWriteFileSync = writeFileSync as jest.Mock;
      const mockContent = Buffer.from('test evidence');
      const mockRuleId = 'TEST-001';

      await compliance.collectEvidence(mockRuleId, 'log', mockContent);

      expect(mockWriteFileSync).toHaveBeenCalled();
      const [filePath, content] = mockWriteFileSync.mock.calls[0];
      const evidence = JSON.parse(content);

      expect(evidence).toMatchObject({
        ruleId: mockRuleId,
        type: 'log',
        metadata: {
          collector: 'compliance-monitor'
        }
      });
      expect(evidence.timestamp).toBeDefined();
    });
  });

  describe('updateMonitoring', () => {
    it('should record correct metrics when monitoring is enabled', async () => {
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

      expect(logger.info).toHaveBeenCalledWith('Updated monitoring metrics', expect.any(Object));
    });

    it('should skip metrics when monitoring is disabled', async () => {
      const mockContext = {
        config: {
          monitoring: {
            enabled: false
          }
        }
      };

      await compliance.updateMonitoring(mockContext);

      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
