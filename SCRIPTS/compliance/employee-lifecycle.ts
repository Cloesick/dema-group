import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import { compliance } from './compliance-monitor';
import { WebClient } from '@slack/web-api';
import { Octokit } from '@octokit/rest';
import { google } from 'googleapis';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  startDate: string;
  endDate?: string;
  manager: string;
  status: 'active' | 'onboarding' | 'offboarding' | 'inactive';
  accessGroups: string[];
  equipment: Array<{
    type: string;
    id: string;
    assignedDate: string;
    returnedDate?: string;
  }>;
  training: Array<{
    id: string;
    name: string;
    status: 'pending' | 'completed' | 'expired';
    completedDate?: string;
    expiryDate?: string;
  }>;
  compliance: {
    backgroundCheck?: {
      status: 'pending' | 'completed' | 'failed';
      completedDate?: string;
      expiryDate?: string;
    };
    policies: Array<{
      id: string;
      name: string;
      acknowledged: boolean;
      acknowledgedDate?: string;
    }>;
  };
  metadata: Record<string, unknown>;
}

interface ServiceAccess {
  service: string;
  username?: string;
  email?: string;
  groups?: string[];
  roles?: string[];
  status: 'active' | 'inactive';
  createdDate?: string;
  deactivatedDate?: string;
}

export class EmployeeLifecycle {
  private static instance: EmployeeLifecycle;
  private readonly configPath: string;
  private readonly employeesPath: string;
  private readonly accessPath: string;
  private employees: Map<string, Employee>;
  private access: Map<string, ServiceAccess[]>;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'employees');
    this.employeesPath = join(rootPath, 'data', 'employees');
    this.accessPath = join(rootPath, 'data', 'access');
    this.employees = new Map();
    this.access = new Map();
    this.initialize();
  }

  public static getInstance(): EmployeeLifecycle {
    if (!EmployeeLifecycle.instance) {
      EmployeeLifecycle.instance = new EmployeeLifecycle();
    }
    return EmployeeLifecycle.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.employeesPath, this.accessPath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load data
    this.loadEmployees();
    this.loadAccess();
  }

  private loadEmployees(): void {
    try {
      const files = readFileSync(join(this.employeesPath, 'employees.json'), 'utf8');
      const employees = JSON.parse(files);
      for (const employee of employees) {
        this.employees.set(employee.id, employee);
      }
      logger.info(`Loaded ${this.employees.size} employees`);
    } catch (error) {
      logger.error('Failed to load employees', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private loadAccess(): void {
    try {
      const files = readFileSync(join(this.accessPath, 'access.json'), 'utf8');
      const access = JSON.parse(files);
      for (const [employeeId, services] of Object.entries(access)) {
        this.access.set(employeeId, services as ServiceAccess[]);
      }
      logger.info(`Loaded access for ${this.access.size} employees`);
    } catch (error) {
      logger.error('Failed to load access data', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  public async startOnboarding(employee: Omit<Employee, 'id' | 'status'>): Promise<Employee> {
    const id = `emp-${Date.now()}`;
    const newEmployee: Employee = {
      ...employee,
      id,
      status: 'onboarding'
    };

    // Store employee
    this.employees.set(id, newEmployee);
    await this.saveEmployees();

    // Start onboarding process
    await this.provisionAccess(newEmployee);
    await this.assignTraining(newEmployee);
    await this.initiateBackgroundCheck(newEmployee);
    await this.assignEquipment(newEmployee);

    // Update compliance evidence
    await compliance.collectEvidence(
      'SEC-EMP-001',
      'log',
      Buffer.from(JSON.stringify({
        type: 'employee-onboarding',
        timestamp: new Date().toISOString(),
        employee: {
          id: newEmployee.id,
          email: newEmployee.email,
          department: newEmployee.department,
          role: newEmployee.role
        }
      }, null, 2))
    );

    logger.info('Started employee onboarding', {
      metadata: {
        employeeId: newEmployee.id,
        email: newEmployee.email,
        department: newEmployee.department
      }
    });

    return newEmployee;
  }

  public async completeOnboarding(employeeId: string): Promise<void> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }

    // Verify onboarding requirements
    const access = this.access.get(employeeId) || [];
    const pendingAccess = access.filter(a => !a.createdDate);
    if (pendingAccess.length > 0) {
      throw new Error('Access provisioning incomplete');
    }

    const pendingTraining = employee.training.filter(t => t.status === 'pending');
    if (pendingTraining.length > 0) {
      throw new Error('Required training incomplete');
    }

    if (employee.compliance.backgroundCheck?.status !== 'completed') {
      throw new Error('Background check incomplete');
    }

    const pendingPolicies = employee.compliance.policies.filter(p => !p.acknowledged);
    if (pendingPolicies.length > 0) {
      throw new Error('Policy acknowledgments incomplete');
    }

    // Update status
    employee.status = 'active';
    await this.saveEmployees();

    // Update compliance evidence
    await compliance.collectEvidence(
      'SEC-EMP-002',
      'log',
      Buffer.from(JSON.stringify({
        type: 'employee-onboarding-complete',
        timestamp: new Date().toISOString(),
        employee: {
          id: employee.id,
          email: employee.email,
          department: employee.department,
          role: employee.role
        }
      }, null, 2))
    );

    logger.info('Completed employee onboarding', {
      metadata: {
        employeeId: employee.id,
        email: employee.email,
        department: employee.department
      }
    });
  }

  public async startOffboarding(employeeId: string, endDate: string): Promise<void> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }

    // Update employee status
    employee.status = 'offboarding';
    employee.endDate = endDate;
    await this.saveEmployees();

    // Start offboarding process
    await this.revokeAccess(employee);
    await this.collectEquipment(employee);
    await this.archiveData(employee);
    await this.scheduleExitInterview(employee);

    // Update compliance evidence
    await compliance.collectEvidence(
      'SEC-EMP-003',
      'log',
      Buffer.from(JSON.stringify({
        type: 'employee-offboarding',
        timestamp: new Date().toISOString(),
        employee: {
          id: employee.id,
          email: employee.email,
          department: employee.department,
          role: employee.role,
          endDate
        }
      }, null, 2))
    );

    logger.info('Started employee offboarding', {
      metadata: {
        employeeId: employee.id,
        email: employee.email,
        endDate
      }
    });
  }

  public async completeOffboarding(employeeId: string): Promise<void> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }

    // Verify offboarding requirements
    const access = this.access.get(employeeId) || [];
    const activeAccess = access.filter(a => a.status === 'active');
    if (activeAccess.length > 0) {
      throw new Error('Access revocation incomplete');
    }

    const unreturned = employee.equipment.filter(e => !e.returnedDate);
    if (unreturned.length > 0) {
      throw new Error('Equipment return incomplete');
    }

    // Update status
    employee.status = 'inactive';
    await this.saveEmployees();

    // Update compliance evidence
    await compliance.collectEvidence(
      'SEC-EMP-004',
      'log',
      Buffer.from(JSON.stringify({
        type: 'employee-offboarding-complete',
        timestamp: new Date().toISOString(),
        employee: {
          id: employee.id,
          email: employee.email,
          department: employee.department,
          role: employee.role,
          endDate: employee.endDate
        }
      }, null, 2))
    );

    logger.info('Completed employee offboarding', {
      metadata: {
        employeeId: employee.id,
        email: employee.email,
        endDate: employee.endDate
      }
    });
  }

  private async provisionAccess(employee: Employee): Promise<void> {
    const services: ServiceAccess[] = [];

    // GSuite account
    try {
      const auth = new google.auth.JWT({
        email: process.env.GSUITE_CLIENT_EMAIL,
        key: process.env.GSUITE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/admin.directory.user']
      });

      const admin = google.admin({ version: 'directory_v1', auth });
      await admin.users.insert({
        requestBody: {
          primaryEmail: employee.email,
          name: {
            givenName: employee.firstName,
            familyName: employee.lastName
          },
          password: this.generateTempPassword(),
          changePasswordAtNextLogin: true,
          orgUnitPath: `/Staff/${employee.department}`
        }
      });

      services.push({
        service: 'gsuite',
        email: employee.email,
        status: 'active',
        createdDate: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to provision GSuite account', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }

    // Slack workspace
    try {
      const slack = new WebClient(process.env.SLACK_TOKEN);
      await slack.users.admin.invite({
        email: employee.email,
        channel_ids: this.getSlackChannels(employee),
        is_restricted: false,
        is_ultra_restricted: false
      });

      services.push({
        service: 'slack',
        email: employee.email,
        status: 'active',
        createdDate: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to provision Slack account', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }

    // GitHub organization
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });

      await octokit.orgs.setMembershipForUser({
        org: process.env.GITHUB_ORG || '',
        username: employee.email.split('@')[0],
        role: 'member'
      });

      services.push({
        service: 'github',
        username: employee.email.split('@')[0],
        status: 'active',
        createdDate: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to provision GitHub account', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }

    // Store access
    this.access.set(employee.id, services);
    await this.saveAccess();
  }

  private async revokeAccess(employee: Employee): Promise<void> {
    const services = this.access.get(employee.id) || [];

    // GSuite account
    try {
      const auth = new google.auth.JWT({
        email: process.env.GSUITE_CLIENT_EMAIL,
        key: process.env.GSUITE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/admin.directory.user']
      });

      const admin = google.admin({ version: 'directory_v1', auth });
      await admin.users.suspend({
        userKey: employee.email
      });

      const gsuiteAccess = services.find(s => s.service === 'gsuite');
      if (gsuiteAccess) {
        gsuiteAccess.status = 'inactive';
        gsuiteAccess.deactivatedDate = new Date().toISOString();
      }
    } catch (error) {
      logger.error('Failed to suspend GSuite account', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }

    // Slack workspace
    try {
      const slack = new WebClient(process.env.SLACK_TOKEN);
      await slack.users.admin.setInactive({
        user: employee.email
      });

      const slackAccess = services.find(s => s.service === 'slack');
      if (slackAccess) {
        slackAccess.status = 'inactive';
        slackAccess.deactivatedDate = new Date().toISOString();
      }
    } catch (error) {
      logger.error('Failed to deactivate Slack account', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }

    // GitHub organization
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });

      await octokit.orgs.removeMembershipForUser({
        org: process.env.GITHUB_ORG || '',
        username: employee.email.split('@')[0]
      });

      const githubAccess = services.find(s => s.service === 'github');
      if (githubAccess) {
        githubAccess.status = 'inactive';
        githubAccess.deactivatedDate = new Date().toISOString();
      }
    } catch (error) {
      logger.error('Failed to remove GitHub access', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }

    // Store access
    await this.saveAccess();
  }

  private async assignTraining(employee: Employee): Promise<void> {
    const training = [
      {
        id: 'SEC-101',
        name: 'Security Awareness Training',
        status: 'pending' as const
      },
      {
        id: 'COMP-101',
        name: 'Compliance Fundamentals',
        status: 'pending' as const
      },
      {
        id: 'POL-101',
        name: 'Company Policies Overview',
        status: 'pending' as const
      }
    ];

    // Add role-specific training
    if (employee.role.toLowerCase().includes('developer')) {
      training.push({
        id: 'SEC-201',
        name: 'Secure Development Practices',
        status: 'pending' as const
      });
    }

    if (employee.role.toLowerCase().includes('manager')) {
      training.push({
        id: 'HR-201',
        name: 'Manager Compliance Training',
        status: 'pending' as const
      });
    }

    employee.training = training;
    await this.saveEmployees();
  }

  private async initiateBackgroundCheck(employee: Employee): Promise<void> {
    employee.compliance.backgroundCheck = {
      status: 'pending'
    };
    await this.saveEmployees();
  }

  private async assignEquipment(employee: Employee): Promise<void> {
    const equipment = [
      {
        type: 'laptop',
        id: `LT-${Date.now()}`,
        assignedDate: new Date().toISOString()
      }
    ];

    if (employee.role.toLowerCase().includes('developer')) {
      equipment.push({
        type: 'monitor',
        id: `MON-${Date.now()}`,
        assignedDate: new Date().toISOString()
      });
    }

    employee.equipment = equipment;
    await this.saveEmployees();
  }

  private async collectEquipment(employee: Employee): Promise<void> {
    for (const item of employee.equipment) {
      if (!item.returnedDate) {
        item.returnedDate = new Date().toISOString();
      }
    }
    await this.saveEmployees();
  }

  private async archiveData(employee: Employee): Promise<void> {
    // Archive GSuite data
    try {
      const auth = new google.auth.JWT({
        email: process.env.GSUITE_CLIENT_EMAIL,
        key: process.env.GSUITE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/admin.directory.user']
      });

      const vault = google.vault({ version: 'v1', auth });
      await vault.matters.create({
        requestBody: {
          name: `Archive - ${employee.email}`,
          description: `Data archive for ${employee.email}`,
          state: 'OPEN'
        }
      });
    } catch (error) {
      logger.error('Failed to create GSuite archive', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  private async scheduleExitInterview(employee: Employee): Promise<void> {
    // Send notification to HR
    logger.info('Exit interview required', {
      metadata: {
        employeeId: employee.id,
        email: employee.email,
        endDate: employee.endDate
      }
    });
  }

  private async saveEmployees(): Promise<void> {
    const employeesPath = join(this.employeesPath, 'employees.json');
    await retry.retry(async () => {
      writeFileSync(
        employeesPath,
        JSON.stringify(Array.from(this.employees.values()), null, 2)
      );
    });
  }

  private async saveAccess(): Promise<void> {
    const accessPath = join(this.accessPath, 'access.json');
    await retry.retry(async () => {
      writeFileSync(
        accessPath,
        JSON.stringify(Object.fromEntries(this.access), null, 2)
      );
    });
  }

  private generateTempPassword(): string {
    return `Welcome${Date.now()}!`;
  }

  private getSlackChannels(employee: Employee): string[] {
    const channels = ['general', 'announcements'];

    if (employee.department) {
      channels.push(employee.department.toLowerCase());
    }

    if (employee.role.toLowerCase().includes('developer')) {
      channels.push('engineering');
      channels.push('tech-discussions');
    }

    return channels;
  }
}

export const employees = EmployeeLifecycle.getInstance();
