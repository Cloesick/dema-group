import { CloudWatch as AWSCloudWatch, S3, CloudFront, ACM, WAF } from 'aws-sdk';
import config from './deployment';

const cloudwatch = new AWSCloudWatch();
const s3 = new S3();
const cloudfront = new CloudFront();
const acm = new ACM();
const waf = new WAF();

interface AlarmConfig {
  metric: CloudWatchMetric;
  threshold: number;
  evaluationPeriods: number;
  comparisonOperator: string;
}

export const checkS3Bucket = async (bucket: string): Promise<boolean> => {
  try {
    await s3.headBucket({ Bucket: bucket }).promise();
    return true;
  } catch (error) {
    console.error(`Error checking S3 bucket ${bucket}:`, error);
    return false;
  }
};

export const checkCloudFront = async (distributionId: string): Promise<boolean> => {
  try {
    await cloudfront.getDistribution({ Id: distributionId }).promise();
    return true;
  } catch (error) {
    console.error(`Error checking CloudFront distribution ${distributionId}:`, error);
    return false;
  }
};

export const checkSSLCertificate = async (certificateArn: string): Promise<boolean> => {
  try {
    await acm.describeCertificate({ CertificateArn: certificateArn }).promise();
    return true;
  } catch (error) {
    console.error(`Error checking SSL certificate ${certificateArn}:`, error);
    return false;
  }
};

export const checkWAFRules = async (ruleIds: string[]): Promise<boolean> => {
  try {
    await Promise.all(
      ruleIds.map(ruleId =>
        waf.getRule({ RuleId: ruleId }).promise()
      )
    );
    return true;
  } catch (error) {
    console.error('Error checking WAF rules:', error);
    return false;
  }
};

export const createAlarm = async (config: AlarmConfig): Promise<void> => {
  const { metric, threshold, evaluationPeriods, comparisonOperator } = config;

  try {
    const awsMetric = metric.toAWSMetric();
    await cloudwatch.putMetricAlarm({
      AlarmName: `Portal-${metric.name}`,
      MetricName: awsMetric.MetricName,
      Namespace: awsMetric.Namespace,
      Statistic: 'Average',
      Period: 60,
      EvaluationPeriods: evaluationPeriods,
      Threshold: threshold,
      ComparisonOperator: comparisonOperator,
      AlarmActions: [process.env.SNS_ALARM_TOPIC!],
      OKActions: [process.env.SNS_ALARM_TOPIC!]
    }).promise();
  } catch (error) {
    console.error(`Error creating alarm for ${metric.name}:`, error);
    throw error;
  }
};

export class CloudWatchMetric {
  toAWSMetric(): AWSCloudWatch.Metric {
    return {
      MetricName: this.name,
      Namespace: this.namespace,
      Dimensions: this.dimensions
    };
  }
  constructor(
    public namespace: string,
    public name: string,
    public dimensions?: AWSCloudWatch.Dimension[]
  ) {}

  static create(params: { namespace: string; name: string }): CloudWatchMetric {
    return new CloudWatchMetric(params.namespace, params.name);
  }
}

export const monitorDeployment = async (env: string): Promise<void> => {
  const envConfig = config.environments[env];
  if (!envConfig) throw new Error(`Unknown environment: ${env}`);

  // Create CloudWatch dashboard
  const dashboard = {
    widgets: [
      {
        type: 'metric',
        properties: {
          metrics: [
            ['Portal', 'ResponseTime', 'Environment', env],
            ['Portal', 'ErrorRate', 'Environment', env],
            ['Portal', 'CPUUtilization', 'Environment', env]
          ],
          period: 300,
          stat: 'Average',
          region: envConfig.region,
          title: `Portal Metrics - ${envConfig.name}`
        }
      },
      {
        type: 'log',
        properties: {
          query: `fields @timestamp, @message
            | filter @logStream like /portal-${env}/
            | sort @timestamp desc
            | limit 100`,
          region: envConfig.region,
          title: `Portal Logs - ${envConfig.name}`
        }
      }
    ]
  };

  try {
    await cloudwatch.putDashboard({
      DashboardName: `Portal-${env}`,
      DashboardBody: JSON.stringify(dashboard)
    }).promise();
  } catch (error) {
    console.error(`Error creating dashboard for ${env}:`, error);
    throw error;
  }
};
