interface Environment {
  name: string;
  url: string;
  region: string;
  s3Bucket: string;
  cloudFrontId: string;
  apiEndpoint: string;
  features: {
    analytics: boolean;
    monitoring: boolean;
    errorReporting: boolean;
    performanceTracking: boolean;
  };
  scaling: {
    minInstances: number;
    maxInstances: number;
    targetCPUUtilization: number;
  };
  security: {
    sslCertificate: string;
    wafRules: string[];
    ipRanges: string[];
  };
}

interface DeploymentConfig {
  environments: Record<string, Environment>;
  globalFeatures: {
    cdn: boolean;
    compression: boolean;
    caching: boolean;
    monitoring: boolean;
  };
  notifications: {
    slack: string;
    email: string[];
    teams: string;
  };
}

const config: DeploymentConfig = {
  environments: {
    development: {
      name: 'Development',
      url: 'https://dev.dema-group.com',
      region: 'eu-west-1',
      s3Bucket: 'dev-dema-group-portal',
      cloudFrontId: 'E1234ABCDEF',
      apiEndpoint: 'https://api.dev.dema-group.com',
      features: {
        analytics: true,
        monitoring: true,
        errorReporting: true,
        performanceTracking: true
      },
      scaling: {
        minInstances: 1,
        maxInstances: 2,
        targetCPUUtilization: 70
      },
      security: {
        sslCertificate: 'arn:aws:acm:eu-west-1:123456789012:certificate/dev',
        wafRules: ['AWSManagedRulesCommonRuleSet'],
        ipRanges: ['0.0.0.0/0']
      }
    },
    staging: {
      name: 'Staging',
      url: 'https://staging.dema-group.com',
      region: 'eu-west-1',
      s3Bucket: 'staging-dema-group-portal',
      cloudFrontId: 'E5678GHIJKL',
      apiEndpoint: 'https://api.staging.dema-group.com',
      features: {
        analytics: true,
        monitoring: true,
        errorReporting: true,
        performanceTracking: true
      },
      scaling: {
        minInstances: 2,
        maxInstances: 4,
        targetCPUUtilization: 60
      },
      security: {
        sslCertificate: 'arn:aws:acm:eu-west-1:123456789012:certificate/staging',
        wafRules: [
          'AWSManagedRulesCommonRuleSet',
          'AWSManagedRulesKnownBadInputsRuleSet'
        ],
        ipRanges: ['office-ip-range']
      }
    },
    production: {
      name: 'Production',
      url: 'https://portal.dema-group.com',
      region: 'eu-west-1',
      s3Bucket: 'prod-dema-group-portal',
      cloudFrontId: 'E9012MNOPQR',
      apiEndpoint: 'https://api.dema-group.com',
      features: {
        analytics: true,
        monitoring: true,
        errorReporting: true,
        performanceTracking: true
      },
      scaling: {
        minInstances: 3,
        maxInstances: 10,
        targetCPUUtilization: 50
      },
      security: {
        sslCertificate: 'arn:aws:acm:eu-west-1:123456789012:certificate/prod',
        wafRules: [
          'AWSManagedRulesCommonRuleSet',
          'AWSManagedRulesKnownBadInputsRuleSet',
          'AWSManagedRulesAmazonIpReputationList',
          'AWSManagedRulesSQLiRuleSet'
        ],
        ipRanges: ['office-ip-range', 'vpn-ip-range']
      }
    }
  },
  globalFeatures: {
    cdn: true,
    compression: true,
    caching: true,
    monitoring: true
  },
  notifications: {
    slack: '#deployments',
    email: ['devops@dema-group.com', 'tech-leads@dema-group.com'],
    teams: 'Deployments Channel'
  }
};

export const getEnvironmentConfig = (env: string): Environment => {
  const envConfig = config.environments[env];
  if (!envConfig) {
    throw new Error(`Unknown environment: ${env}`);
  }
  return envConfig;
};

import {
  checkS3Bucket,
  checkCloudFront,
  checkSSLCertificate,
  checkWAFRules,
  createAlarm,
  CloudWatchMetric
} from './aws';

export const validateDeployment = async (env: string): Promise<boolean> => {
  const config = getEnvironmentConfig(env);
  
  // Check infrastructure
  const checks = await Promise.all([
    checkS3Bucket(config.s3Bucket),
    checkCloudFront(config.cloudFrontId),
    checkSSLCertificate(config.security.sslCertificate),
    checkWAFRules(config.security.wafRules)
  ]);

  return checks.every((check: boolean) => check);
};

export const monitorDeployment = async (env: string): Promise<void> => {
  const config = getEnvironmentConfig(env);
  
  // Start monitoring
  const metrics = {
    responseTime: CloudWatchMetric.create({ namespace: 'Portal', name: 'ResponseTime' }),
    errorRate: CloudWatchMetric.create({ namespace: 'Portal', name: 'ErrorRate' }),
    cpuUtilization: CloudWatchMetric.create({ namespace: 'Portal', name: 'CPUUtilization' })
  };

  // Create alarms
  await Promise.all([
    createAlarm({
      metric: metrics.responseTime,
      threshold: 1000,
      evaluationPeriods: 3,
      comparisonOperator: 'GreaterThanThreshold'
    }),
    createAlarm({
      metric: metrics.errorRate,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: 'GreaterThanThreshold'
    }),
    createAlarm({
      metric: metrics.cpuUtilization,
      threshold: config.scaling.targetCPUUtilization,
      evaluationPeriods: 5,
      comparisonOperator: 'GreaterThanThreshold'
    })
  ]);
};

export default config;
