import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import { compliance } from './compliance-monitor';

interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  type: 'role' | 'group' | 'user' | 'resource';
  permissions: string[];
  conditions?: {
    timeWindow?: {
      start: string;
      end: string;
    };
    ipRange?: string[];
    mfa?: boolean;
    approvalRequired?: boolean;
  };
  metadata?: Record<string, unknown>;
}

interface AccessEvent {
  id: string;
  timestamp: string;
  type: 'grant' | 'revoke' | 'modify' | 'attempt' | 'violation';
  status: 'success' | 'failure';
  subject: {
    id: string;
    type: 'user' | 'service';
    name: string;
  };
  resource: {
    id: string;
    type: string;
    name: string;
  };
  action: string;
  policy?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

interface AccessReview {
  id: string;
  timestamp: string;
  reviewer: string;
  subject: {
    id: string;
    type: 'user' | 'service';
    name: string;
  };
  policies: string[];
  decision: 'approved' | 'revoked' | 'modified';
  reason?: string;
  changes?: {
    added: string[];
    removed: string[];
    modified: Array<{
      policy: string;
      changes: Record<string, unknown>;
    }>;
  };
  metadata?: Record<string, unknown>;
}

export class AccessMonitor {
  private static instance: AccessMonitor;
  private readonly configPath: string;
  private readonly eventsPath: string;
  private readonly reviewsPath: string;
  private policies: Map<string, AccessPolicy>;
  private events: AccessEvent[];
  private reviews: AccessReview[];

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'access');
    this.eventsPath = join(rootPath, 'logs', 'access');
    this.reviewsPath = join(rootPath, 'reports', 'access');
    this.policies = new Map();
    this.events = [];
    this.reviews = [];
    this.initialize();
  }

  public static getInstance(): AccessMonitor {
    if (!AccessMonitor.instance) {
      AccessMonitor.instance = new AccessMonitor();
    }
    return AccessMonitor.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.eventsPath, this.reviewsPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load policies and history
    this.loadPolicies();
    this.loadEvents();
    this.loadReviews();
  }

  private loadPolicies(): void {
    try {
      const files = readFileSync(join(this.configPath, 'policies.json'), 'utf8');
      const policies = JSON.parse(files);
      for (const policy of policies) {
        this.policies.set(policy.id, policy);
      }
      logger.info(`Loaded ${this.policies.size} access policies`);
    } catch (error) {
      logger.error('Failed to load access policies', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private loadEvents(): void {
    try {
      const files = readFileSync(join(this.eventsPath, 'events.json'), 'utf8');
      this.events = JSON.parse(files);
      logger.info(`Loaded ${this.events.length} access events`);
    } catch (error) {
      logger.error('Failed to load access events', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private loadReviews(): void {
    try {
      const files = readFileSync(join(this.reviewsPath, 'reviews.json'), 'utf8');
      this.reviews = JSON.parse(files);
      logger.info(`Loaded ${this.reviews.length} access reviews`);
    } catch (error) {
      logger.error('Failed to load access reviews', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  public async recordEvent(event: Omit<AccessEvent, 'id' | 'timestamp'>): Promise<AccessEvent> {
    const newEvent: AccessEvent = {
      ...event,
      id: `${event.type}-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    this.events.push(newEvent);
    await this.saveEvents();

    // Check for violations
    if (event.type === 'attempt' || event.type === 'violation') {
      await this.checkViolation(newEvent);
    }

    // Update compliance evidence
    await this.updateComplianceEvidence(newEvent);

    return newEvent;
  }

  public async createReview(
    reviewer: string,
    subject: AccessEvent['subject'],
    policies: string[]
  ): Promise<AccessReview> {
    const review: AccessReview = {
      id: `review-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reviewer,
      subject,
      policies,
      decision: 'approved',
      changes: {
        added: [],
        removed: [],
        modified: []
      }
    };

    this.reviews.push(review);
    await this.saveReviews();

    // Update compliance evidence
    await this.updateComplianceEvidence(review);

    return review;
  }

  public async updateReview(
    id: string,
    decision: 'approved' | 'revoked' | 'modified',
    changes?: AccessReview['changes'],
    reason?: string
  ): Promise<AccessReview> {
    const review = this.reviews.find(r => r.id === id);
    if (!review) {
      throw new Error(`Review not found: ${id}`);
    }

    review.decision = decision;
    if (changes) review.changes = changes;
    if (reason) review.reason = reason;

    await this.saveReviews();

    // Record event
    await this.recordEvent({
      type: 'modify',
      status: 'success',
      subject: review.subject,
      resource: {
        id: 'access-review',
        type: 'review',
        name: `Review ${review.id}`
      },
      action: 'update',
      policy: review.policies.join(','),
      reason: review.reason
    });

    return review;
  }

  public async getAccessHistory(
    subjectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AccessEvent[]> {
    let events = this.events.filter(e => e.subject.id === subjectId);

    if (startDate) {
      events = events.filter(e => new Date(e.timestamp) >= startDate);
    }

    if (endDate) {
      events = events.filter(e => new Date(e.timestamp) <= endDate);
    }

    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public async getReviewHistory(
    subjectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AccessReview[]> {
    let reviews = this.reviews.filter(r => r.subject.id === subjectId);

    if (startDate) {
      reviews = reviews.filter(r => new Date(r.timestamp) >= startDate);
    }

    if (endDate) {
      reviews = reviews.filter(r => new Date(r.timestamp) <= endDate);
    }

    return reviews.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private async checkViolation(event: AccessEvent): Promise<void> {
    if (event.policy) {
      const policy = this.policies.get(event.policy);
      if (policy) {
        // Check time window
        if (policy.conditions?.timeWindow) {
          const { start, end } = policy.conditions.timeWindow;
          const now = new Date();
          const startTime = new Date();
          const endTime = new Date();

          const [startHour, startMinute] = start.split(':').map(Number);
          const [endHour, endMinute] = end.split(':').map(Number);

          startTime.setHours(startHour, startMinute, 0);
          endTime.setHours(endHour, endMinute, 0);

          if (now < startTime || now > endTime) {
            await this.recordEvent({
              type: 'violation',
              status: 'failure',
              subject: event.subject,
              resource: event.resource,
              action: event.action,
              policy: event.policy,
              reason: 'Access attempt outside allowed time window'
            });
          }
        }

        // Check IP range
        if (policy.conditions?.ipRange && event.metadata?.ipAddress) {
          const ip = event.metadata.ipAddress as string;
          const allowed = policy.conditions.ipRange.some(range =>
            this.isIpInRange(ip, range)
          );

          if (!allowed) {
            await this.recordEvent({
              type: 'violation',
              status: 'failure',
              subject: event.subject,
              resource: event.resource,
              action: event.action,
              policy: event.policy,
              reason: 'Access attempt from unauthorized IP address'
            });
          }
        }

        // Check MFA
        if (policy.conditions?.mfa && !event.metadata?.mfaVerified) {
          await this.recordEvent({
            type: 'violation',
            status: 'failure',
            subject: event.subject,
            resource: event.resource,
            action: event.action,
            policy: event.policy,
            reason: 'Access attempt without MFA verification'
          });
        }
      }
    }
  }

  private isIpInRange(ip: string, range: string): boolean {
    // Simple CIDR check implementation
    const [rangeIp, bits = '32'] = range.split('/');
    const ipLong = this.ipToLong(ip);
    const rangeLong = this.ipToLong(rangeIp);
    const mask = -1 << (32 - parseInt(bits));
    return (ipLong & mask) === (rangeLong & mask);
  }

  private ipToLong(ip: string): number {
    return ip.split('.')
      .reduce((long, octet) => (long << 8) + parseInt(octet), 0) >>> 0;
  }

  private async saveEvents(): Promise<void> {
    const eventsPath = join(this.eventsPath, 'events.json');
    await retry.retry(async () => {
      writeFileSync(eventsPath, JSON.stringify(this.events, null, 2));
    });
  }

  private async saveReviews(): Promise<void> {
    const reviewsPath = join(this.reviewsPath, 'reviews.json');
    await retry.retry(async () => {
      writeFileSync(reviewsPath, JSON.stringify(this.reviews, null, 2));
    });
  }

  private async updateComplianceEvidence(
    item: AccessEvent | AccessReview
  ): Promise<void> {
    const evidenceType = 'event' in item ? 'event' : 'review';
    await compliance.collectEvidence(
      'SEC-ACC-001',
      'log',
      Buffer.from(JSON.stringify({
        type: evidenceType,
        timestamp: new Date().toISOString(),
        data: item
      }, null, 2))
    );
  }
}

export const access = AccessMonitor.getInstance();
