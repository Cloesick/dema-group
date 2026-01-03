import { evidence } from '../../compliance/evidence-collector';
import { readFileSync, writeFileSync } from 'node:fs';
import { logger } from '../../utils/logger';
import AWS from 'aws-sdk';
import { Octokit } from '@octokit/rest';
import { WebClient } from '@slack/web-api';

jest.mock('node:fs');
jest.mock('../../utils/logger');
jest.mock('aws-sdk');
jest.mock('@octokit/rest');
jest.mock('@slack/web-api');

describe('EvidenceCollector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AWS CloudWatch Collection', () => {
    it('should collect logs from configured log groups', async () => {
      const mockCloudWatch = {
        describeLogGroups: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            logGroups: [{ logGroupName: 'test-group' }]
          })
        }),
        describeLogStreams: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            logStreams: [{ logStreamName: 'test-stream' }]
          })
        }),
        getLogEvents: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            events: [
              { message: 'test log', timestamp: Date.now() }
            ]
          })
        })
      };

      (AWS.CloudWatchLogs as jest.Mock).mockImplementation(() => mockCloudWatch);

      const source = {
        id: 'aws-1',
        type: 'aws',
        enabled: true,
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test'
        }
      };

      await evidence.collectAWSLogs(source);

      expect(mockCloudWatch.describeLogGroups).toHaveBeenCalled();
      expect(mockCloudWatch.describeLogStreams).toHaveBeenCalled();
      expect(mockCloudWatch.getLogEvents).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
    });
  });

  describe('GitHub Collection', () => {
    it('should collect audit logs and security alerts', async () => {
      const mockOctokit = {
        orgs: {
          getAuditLog: jest.fn().mockResolvedValue({
            data: [{ action: 'test', actor: 'user' }]
          })
        },
        repos: {
          listRepoSecurityAlerts: jest.fn().mockResolvedValue({
            data: [{ alert: 'test', severity: 'high' }]
          })
        }
      };

      (Octokit as jest.Mock).mockImplementation(() => mockOctokit);

      const source = {
        id: 'github-1',
        type: 'github',
        enabled: true,
        credentials: {
          token: 'test',
          organization: 'test-org'
        }
      };

      await evidence.collectGitHubEvidence(source);

      expect(mockOctokit.orgs.getAuditLog).toHaveBeenCalled();
      expect(mockOctokit.repos.listRepoSecurityAlerts).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Slack Collection', () => {
    it('should collect workspace audit logs', async () => {
      const mockSlack = {
        team: {
          accessLogs: jest.fn().mockResolvedValue({
            entries: [{ user_id: 'test', action: 'login' }],
            team_id: 'test-team'
          })
        }
      };

      (WebClient as jest.Mock).mockImplementation(() => mockSlack);

      const source = {
        id: 'slack-1',
        type: 'slack',
        enabled: true,
        credentials: {
          token: 'test'
        }
      };

      await evidence.collectSlackEvidence(source);

      expect(mockSlack.team.accessLogs).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Evidence Storage', () => {
    it('should store evidence with correct metadata', async () => {
      const mockEvidence = {
        id: 'test-1',
        sourceId: 'aws-1',
        type: 'cloudwatch-logs',
        content: 'test content',
        metadata: {
          source: 'aws',
          collector: 'cloudwatch'
        }
      };

      await evidence.storeEvidence(mockEvidence);

      expect(writeFileSync).toHaveBeenCalled();
      const [filePath, content] = (writeFileSync as jest.Mock).mock.calls[0];
      const storedEvidence = JSON.parse(content);

      expect(storedEvidence).toMatchObject({
        id: mockEvidence.id,
        sourceId: mockEvidence.sourceId,
        type: mockEvidence.type,
        metadata: mockEvidence.metadata
      });
      expect(storedEvidence.timestamp).toBeDefined();
    });

    it('should handle evidence storage errors', async () => {
      (writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Write failed');
      });

      const mockEvidence = {
        id: 'test-2',
        sourceId: 'aws-1',
        type: 'cloudwatch-logs',
        content: 'test content',
        metadata: {
          source: 'aws',
          collector: 'cloudwatch'
        }
      };

      await expect(evidence.storeEvidence(mockEvidence)).rejects.toThrow('Write failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Collection Scheduling', () => {
    it('should respect collection frequency settings', async () => {
      jest.useFakeTimers();

      const source = {
        id: 'test-1',
        type: 'aws',
        enabled: true,
        config: {
          frequency: 'hourly'
        }
      };

      evidence.startCollection();

      jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour

      expect(logger.info).toHaveBeenCalledWith('Starting evidence collection');
      
      jest.useRealTimers();
    });

    it('should handle collection failures gracefully', async () => {
      const mockError = new Error('Collection failed');
      (AWS.CloudWatchLogs as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      const source = {
        id: 'aws-1',
        type: 'aws',
        enabled: true
      };

      await evidence.collectAWSLogs(source);

      expect(logger.error).toHaveBeenCalledWith('AWS CloudWatch collection failed', {
        metadata: {
          sourceId: source.id,
          error: mockError.message
        }
      });
    });
  });
});
