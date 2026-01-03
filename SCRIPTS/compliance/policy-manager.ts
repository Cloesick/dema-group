import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';

interface Policy {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  category: 'security' | 'privacy' | 'operational' | 'hr' | 'financial';
  content: string;
  approvers: string[];
  reviewCycle: 'monthly' | 'quarterly' | 'annually';
  nextReview?: string;
  metadata?: Record<string, unknown>;
}

interface PolicyVersion {
  version: string;
  timestamp: string;
  author: string;
  changes: string[];
  content: string;
  approvals: {
    approver: string;
    timestamp: string;
    status: 'approved' | 'rejected';
    comments?: string;
  }[];
}

interface PolicyAcknowledgment {
  policyId: string;
  version: string;
  userId: string;
  timestamp: string;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

export class PolicyManager {
  private static instance: PolicyManager;
  private readonly policiesPath: string;
  private readonly versionsPath: string;
  private readonly acknowledgementsPath: string;
  private policies: Map<string, Policy>;
  private versions: Map<string, PolicyVersion[]>;
  private acknowledgments: Map<string, PolicyAcknowledgment[]>;

  private constructor() {
    const rootPath = process.cwd();
    this.policiesPath = join(rootPath, 'policies');
    this.versionsPath = join(rootPath, 'policies', 'versions');
    this.acknowledgementsPath = join(rootPath, 'policies', 'acknowledgments');
    this.policies = new Map();
    this.versions = new Map();
    this.acknowledgments = new Map();
    this.initialize();
  }

  public static getInstance(): PolicyManager {
    if (!PolicyManager.instance) {
      PolicyManager.instance = new PolicyManager();
    }
    return PolicyManager.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.policiesPath, this.versionsPath, this.acknowledgementsPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load existing policies
    this.loadPolicies();
    this.loadVersions();
    this.loadAcknowledgments();
  }

  private loadPolicies(): void {
    try {
      const files = readFileSync(join(this.policiesPath, 'policies.json'), 'utf8');
      const policies = JSON.parse(files);
      for (const policy of policies) {
        this.policies.set(policy.id, policy);
      }
      logger.info(`Loaded ${this.policies.size} policies`);
    } catch (error) {
      logger.error('Failed to load policies', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private loadVersions(): void {
    try {
      const files = readFileSync(join(this.versionsPath, 'versions.json'), 'utf8');
      const versions = JSON.parse(files);
      for (const [policyId, policyVersions] of Object.entries(versions)) {
        this.versions.set(policyId, policyVersions as PolicyVersion[]);
      }
      logger.info(`Loaded versions for ${this.versions.size} policies`);
    } catch (error) {
      logger.error('Failed to load policy versions', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private loadAcknowledgments(): void {
    try {
      const files = readFileSync(join(this.acknowledgementsPath, 'acknowledgments.json'), 'utf8');
      const acknowledgments = JSON.parse(files);
      for (const [policyId, policyAcks] of Object.entries(acknowledgments)) {
        this.acknowledgments.set(policyId, policyAcks as PolicyAcknowledgment[]);
      }
      logger.info(`Loaded acknowledgments for ${this.acknowledgments.size} policies`);
    } catch (error) {
      logger.error('Failed to load policy acknowledgments', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  public async createPolicy(policy: Omit<Policy, 'version' | 'lastUpdated'>): Promise<Policy> {
    const newPolicy: Policy = {
      ...policy,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };

    // Validate policy
    this.validatePolicy(newPolicy);

    // Store policy
    this.policies.set(newPolicy.id, newPolicy);
    await this.savePolicies();

    // Create initial version
    const version: PolicyVersion = {
      version: newPolicy.version,
      timestamp: newPolicy.lastUpdated,
      author: 'system',
      changes: ['Initial version'],
      content: newPolicy.content,
      approvals: []
    };

    const versions = this.versions.get(newPolicy.id) || [];
    versions.push(version);
    this.versions.set(newPolicy.id, versions);
    await this.saveVersions();

    logger.info('Created new policy', {
      metadata: {
        policyId: newPolicy.id,
        name: newPolicy.name,
        category: newPolicy.category
      }
    });

    return newPolicy;
  }

  public async updatePolicy(
    id: string,
    updates: Partial<Omit<Policy, 'id' | 'version' | 'lastUpdated'>>,
    author: string,
    changes: string[]
  ): Promise<Policy> {
    const policy = this.policies.get(id);
    if (!policy) {
      throw new Error(`Policy not found: ${id}`);
    }

    // Create new version
    const [major, minor, patch] = policy.version.split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;

    const updatedPolicy: Policy = {
      ...policy,
      ...updates,
      version: newVersion,
      lastUpdated: new Date().toISOString()
    };

    // Validate updated policy
    this.validatePolicy(updatedPolicy);

    // Store updated policy
    this.policies.set(id, updatedPolicy);
    await this.savePolicies();

    // Create new version
    const version: PolicyVersion = {
      version: newVersion,
      timestamp: updatedPolicy.lastUpdated,
      author,
      changes,
      content: updatedPolicy.content,
      approvals: []
    };

    const versions = this.versions.get(id) || [];
    versions.push(version);
    this.versions.set(id, versions);
    await this.saveVersions();

    logger.info('Updated policy', {
      metadata: {
        policyId: id,
        newVersion,
        author,
        changes
      }
    });

    return updatedPolicy;
  }

  public async approvePolicy(
    id: string,
    version: string,
    approver: string,
    approved: boolean,
    comments?: string
  ): Promise<void> {
    const policy = this.policies.get(id);
    if (!policy) {
      throw new Error(`Policy not found: ${id}`);
    }

    if (!policy.approvers.includes(approver)) {
      throw new Error(`User ${approver} is not an authorized approver for policy ${id}`);
    }

    const versions = this.versions.get(id) || [];
    const policyVersion = versions.find(v => v.version === version);
    if (!policyVersion) {
      throw new Error(`Version ${version} not found for policy ${id}`);
    }

    // Add approval
    policyVersion.approvals.push({
      approver,
      timestamp: new Date().toISOString(),
      status: approved ? 'approved' : 'rejected',
      comments
    });

    // Update policy status if all approvers have approved
    const uniqueApprovers = new Set(
      policyVersion.approvals
        .filter(a => a.status === 'approved')
        .map(a => a.approver)
    );

    if (uniqueApprovers.size === policy.approvers.length) {
      policy.status = 'approved';
      await this.savePolicies();
    }

    await this.saveVersions();

    logger.info(`Policy ${approved ? 'approved' : 'rejected'}`, {
      metadata: {
        policyId: id,
        version,
        approver,
        status: approved ? 'approved' : 'rejected'
      }
    });
  }

  public async acknowledgePolicy(
    id: string,
    version: string,
    userId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const policy = this.policies.get(id);
    if (!policy) {
      throw new Error(`Policy not found: ${id}`);
    }

    const versions = this.versions.get(id) || [];
    const policyVersion = versions.find(v => v.version === version);
    if (!policyVersion) {
      throw new Error(`Version ${version} not found for policy ${id}`);
    }

    const acknowledgment: PolicyAcknowledgment = {
      policyId: id,
      version,
      userId,
      timestamp: new Date().toISOString(),
      acknowledged: true,
      metadata
    };

    const acknowledgments = this.acknowledgments.get(id) || [];
    acknowledgments.push(acknowledgment);
    this.acknowledgments.set(id, acknowledgments);
    await this.saveAcknowledgments();

    logger.info('Policy acknowledged', {
      metadata: {
        policyId: id,
        version,
        userId
      }
    });
  }

  public getPolicy(id: string): Policy | undefined {
    return this.policies.get(id);
  }

  public getPolicyVersion(id: string, version: string): PolicyVersion | undefined {
    const versions = this.versions.get(id) || [];
    return versions.find(v => v.version === version);
  }

  public getPolicyAcknowledgments(id: string): PolicyAcknowledgment[] {
    return this.acknowledgments.get(id) || [];
  }

  public async archivePolicy(id: string): Promise<void> {
    const policy = this.policies.get(id);
    if (!policy) {
      throw new Error(`Policy not found: ${id}`);
    }

    policy.status = 'archived';
    await this.savePolicies();

    logger.info('Policy archived', {
      metadata: {
        policyId: id,
        name: policy.name
      }
    });
  }

  private validatePolicy(policy: Policy): void {
    if (!policy.id) throw new Error('Policy ID is required');
    if (!policy.name) throw new Error('Policy name is required');
    if (!policy.content) throw new Error('Policy content is required');
    if (!policy.approvers?.length) throw new Error('At least one approver is required');
    if (!policy.category) throw new Error('Policy category is required');
    if (!policy.reviewCycle) throw new Error('Review cycle is required');
  }

  private async savePolicies(): Promise<void> {
    const policiesPath = join(this.policiesPath, 'policies.json');
    await retry.retry(async () => {
      writeFileSync(
        policiesPath,
        JSON.stringify(Array.from(this.policies.values()), null, 2)
      );
    });
  }

  private async saveVersions(): Promise<void> {
    const versionsPath = join(this.versionsPath, 'versions.json');
    await retry.retry(async () => {
      writeFileSync(
        versionsPath,
        JSON.stringify(Object.fromEntries(this.versions), null, 2)
      );
    });
  }

  private async saveAcknowledgments(): Promise<void> {
    const acknowledgementsPath = join(this.acknowledgementsPath, 'acknowledgments.json');
    await retry.retry(async () => {
      writeFileSync(
        acknowledgementsPath,
        JSON.stringify(Object.fromEntries(this.acknowledgments), null, 2)
      );
    });
  }
}

export const policies = PolicyManager.getInstance();
