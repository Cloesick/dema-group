import { AuditLogger } from './logger';
import { MetricsCollector } from './metrics';
import { redis } from '@/utils/redis';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  cooldown: number;
  channels: ('slack' | 'email' | 'sms')[];
  tags: string[];
}

interface AlertState {
  id: string;
  triggeredAt: number;
  resolvedAt?: number;
  value: number;
  notifiedChannels: string[];
}

export class AlertManager {
  private static instance: AlertManager;
  private rules: AlertRule[] = [];
  private activeAlerts: Map<string, AlertState> = new Map();

  private constructor() {
    this.initializeRules();
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private initializeRules() {
    this.rules = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        metric: 'error_rate',
        condition: 'above',
        threshold: 0.01,
        duration: 300,
        severity: 'error',
        cooldown: 3600,
        channels: ['slack', 'email'],
        tags: ['reliability', 'errors']
      },
      {
        id: 'response_time_degradation',
        name: 'Response Time Degradation',
        metric: 'response_time_p95',
        condition: 'above',
        threshold: 1000,
        duration: 300,
        severity: 'warning',
        cooldown: 1800,
        channels: ['slack'],
        tags: ['performance']
      },
      {
        id: 'high_memory_usage',
        name: 'High Memory Usage',
        metric: 'memory_usage',
        condition: 'above',
        threshold: 0.9,
        duration: 300,
        severity: 'critical',
        cooldown: 1800,
        channels: ['slack', 'email', 'sms'],
        tags: ['resources', 'memory']
      },
      {
        id: 'low_success_rate',
        name: 'Low Success Rate',
        metric: 'success_rate',
        condition: 'below',
        threshold: 0.95,
        duration: 300,
        severity: 'error',
        cooldown: 1800,
        channels: ['slack', 'email'],
        tags: ['reliability']
      },
      {
        id: 'high_concurrent_users',
        name: 'High Concurrent Users',
        metric: 'concurrent_users',
        condition: 'above',
        threshold: 1000,
        duration: 300,
        severity: 'warning',
        cooldown: 3600,
        channels: ['slack'],
        tags: ['capacity']
      }
    ];
  }

  async checkAlerts() {
    const metrics = MetricsCollector.getInstance();

    for (const rule of this.rules) {
      const values = await metrics.getMetric(
        rule.metric,
        rule.duration * 1000
      );

      if (!values.length) continue;

      const triggered = this.isAlertTriggered(rule, values);
      const activeAlert = this.activeAlerts.get(rule.id);

      if (triggered && !activeAlert) {
        await this.triggerAlert(rule, values[values.length - 1].value);
      } else if (!triggered && activeAlert) {
        await this.resolveAlert(rule, activeAlert);
      }
    }
  }

  private isAlertTriggered(
    rule: AlertRule,
    values: { value: number; timestamp: number }[]
  ): boolean {
    return values.every(({ value }) => {
      switch (rule.condition) {
        case 'above':
          return value > rule.threshold;
        case 'below':
          return value < rule.threshold;
        case 'equals':
          return value === rule.threshold;
      }
    });
  }

  private async triggerAlert(rule: AlertRule, value: number) {
    const now = Date.now();
    const alertState: AlertState = {
      id: rule.id,
      triggeredAt: now,
      value,
      notifiedChannels: []
    };

    // Check cooldown
    const cooldownKey = `alert_cooldown:${rule.id}`;
    const inCooldown = await redis.get(cooldownKey);
    if (inCooldown) return;

    // Set cooldown
    await redis.set(cooldownKey, '1', 'EX', rule.cooldown);

    // Store alert state
    this.activeAlerts.set(rule.id, alertState);

    // Log alert
    AuditLogger.logSecurity({
      type: 'system',
      severity: rule.severity === 'critical' ? 'high' : 'medium',
      details: {
        alert: rule.name,
        metric: rule.metric,
        value,
        threshold: rule.threshold,
        condition: rule.condition
      }
    });

    // Notify channels
    await this.notifyChannels(rule, alertState);
  }

  private async resolveAlert(rule: AlertRule, state: AlertState) {
    const now = Date.now();
    state.resolvedAt = now;

    // Remove from active alerts
    this.activeAlerts.delete(rule.id);

    // Log resolution
    AuditLogger.logSecurity({
      type: 'system',
      severity: 'medium',
      details: {
        alert: rule.name,
        metric: rule.metric,
        duration: now - state.triggeredAt,
        resolution: 'auto'
      }
    });

    // Notify resolution
    await this.notifyResolution(rule, state);
  }

  private async notifyChannels(rule: AlertRule, state: AlertState) {
    for (const channel of rule.channels) {
      try {
        switch (channel) {
          case 'slack':
            await this.notifySlack(rule, state);
            break;
          case 'email':
            await this.notifyEmail(rule, state);
            break;
          case 'sms':
            await this.notifySMS(rule, state);
            break;
        }
        state.notifiedChannels.push(channel);
      } catch (error) {
        AuditLogger.logError(error as Error, {
          action: 'alert_notification',
          path: `alerts/${rule.id}/${channel}`
        });
      }
    }
  }

  private async notifyResolution(rule: AlertRule, state: AlertState) {
    for (const channel of state.notifiedChannels) {
      try {
        switch (channel) {
          case 'slack':
            await this.notifySlackResolution(rule, state);
            break;
          case 'email':
            await this.notifyEmailResolution(rule, state);
            break;
          case 'sms':
            await this.notifySMSResolution(rule, state);
            break;
        }
      } catch (error) {
        AuditLogger.logError(error as Error, {
          action: 'alert_resolution',
          path: `alerts/${rule.id}/${channel}`
        });
      }
    }
  }

  private async notifySlack(rule: AlertRule, state: AlertState) {
    // Implement Slack notification
    console.log('Slack notification:', {
      rule,
      state,
      color: this.getSeverityColor(rule.severity)
    });
  }

  private async notifyEmail(rule: AlertRule, state: AlertState) {
    // Implement email notification
    console.log('Email notification:', {
      rule,
      state,
      subject: `[${rule.severity.toUpperCase()}] ${rule.name} Alert`
    });
  }

  private async notifySMS(rule: AlertRule, state: AlertState) {
    // Implement SMS notification
    console.log('SMS notification:', {
      rule,
      state,
      message: `${rule.severity.toUpperCase()}: ${rule.name}`
    });
  }

  private async notifySlackResolution(rule: AlertRule, state: AlertState) {
    // Implement Slack resolution
    console.log('Slack resolution:', {
      rule,
      state,
      duration: state.resolvedAt! - state.triggeredAt
    });
  }

  private async notifyEmailResolution(rule: AlertRule, state: AlertState) {
    // Implement email resolution
    console.log('Email resolution:', {
      rule,
      state,
      subject: `[RESOLVED] ${rule.name} Alert`
    });
  }

  private async notifySMSResolution(rule: AlertRule, state: AlertState) {
    // Implement SMS resolution
    console.log('SMS resolution:', {
      rule,
      state,
      message: `RESOLVED: ${rule.name}`
    });
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#FF0000';
      case 'error':
        return '#FF4444';
      case 'warning':
        return '#FFBB33';
      default:
        return '#00C851';
    }
  }
}

// Initialize alert checking
if (typeof window === 'undefined') {
  const alertManager = AlertManager.getInstance();
  setInterval(() => {
    alertManager.checkAlerts().catch(error => {
      AuditLogger.logError(error as Error, {
        action: 'alert_check',
        path: 'alerts/check'
      });
    });
  }, 60000); // Check every minute
}
