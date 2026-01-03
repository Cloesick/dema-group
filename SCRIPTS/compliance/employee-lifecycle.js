import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { retry } from '../utils/retry.js';
import { google } from 'googleapis';
import { Octokit } from '@octokit/rest';
import { WebClient } from '@slack/web-api';
import { compliance } from './compliance-monitor.js';

class EmployeeLifecycle {
  static #instance;
  #configPath;
  #employeesPath;
  #employees;

  constructor() {
    const rootPath = process.cwd();
    this.#configPath = join(rootPath, 'config', 'employees');
    this.#employeesPath = join(rootPath, 'data', 'employees.json');
    this.#employees = new Map();
    this.#initialize();
  }

  static getInstance() {
    if (!EmployeeLifecycle.#instance) {
      EmployeeLifecycle.#instance = new EmployeeLifecycle();
    }
    return EmployeeLifecycle.#instance;
  }

  reload() {
    this.#loadEmployees();
  }

  #initialize() {
    // Create required directories
    [this.#configPath, join(this.#employeesPath, '..')].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load employees
    this.#loadEmployees();
  }

  #loadEmployees() {
    try {
      const data = readFileSync(this.#employeesPath, 'utf8');
      const employees = JSON.parse(data);
      for (const employee of employees) {
        this.#employees.set(employee.id, employee);
      }
      logger.info(`Loaded ${this.#employees.size} employees`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, create it
        writeFileSync(this.#employeesPath, '[]');
        logger.info('Created empty employees file');
      } else {
        logger.error('Failed to load employees', {
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
      }
    }
  }

  #saveEmployees() {
    const employees = Array.from(this.#employees.values());
    writeFileSync(this.#employeesPath, JSON.stringify(employees, null, 2));
  }

  async startOnboarding(employee) {
    // Generate employee ID
    const id = `emp-${Date.now()}`;
    const newEmployee = {
      ...employee,
      id,
      status: 'onboarding',
      equipment: [],
      training: [],
      compliance: {
        ...employee.compliance,
        backgroundCheck: {
          status: 'pending',
          requestedDate: new Date().toISOString()
        }
      }
    };

    // Add required training
    newEmployee.training.push({
      id: 'SEC-101',
      name: 'Security Awareness Training',
      status: 'pending'
    });

    // Add role-specific training
    if (employee.role === 'Developer') {
      newEmployee.training.push({
        id: 'SEC-201',
        name: 'Secure Development Practices',
        status: 'pending'
      });
    }

    // Add to employee list
    this.#employees.set(id, newEmployee);
    this.#saveEmployees();

    // Provision access
    await this.#provisionAccess(newEmployee);

    // Track evidence
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

    return newEmployee;
  }

  async startOffboarding(employeeId, endDate) {
    const employee = this.#employees.get(employeeId);
    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    // Update employee status
    employee.status = 'offboarding';
    employee.endDate = endDate;
    employee.accessGroups = [];
    employee.equipment = [];
    employee.training = [];

    // Save changes
    this.#saveEmployees();

    // Revoke access
    await this.#revokeAccess(employee);

    // Track evidence
    await compliance.collectEvidence(
      'SEC-EMP-002',
      'log',
      Buffer.from(JSON.stringify({
        type: 'employee-offboarding',
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

    return employee;
  }

  async acknowledgePolicies(employeeId, policyIds) {
    const employee = this.#employees.get(employeeId);
    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    // Update policy acknowledgments
    const timestamp = new Date().toISOString();
    employee.compliance.policies = policyIds.map(id => ({
      id,
      acknowledged: true,
      acknowledgedDate: timestamp
    }));

    // Save changes
    this.#saveEmployees();

    // Track evidence
    await compliance.collectEvidence(
      'SEC-EMP-003',
      'log',
      Buffer.from(JSON.stringify({
        type: 'policy-acknowledgment',
        timestamp,
        employee: {
          id: employee.id,
          email: employee.email
        },
        policies: policyIds
      }, null, 2))
    );

    return employee;
  }

  async #provisionAccess(employee) {
    try {
      // Skip API calls in test mode
      if (process.env.NODE_ENV !== 'test') {
        // Google Workspace
        const admin = google.admin({ version: 'directory_v1' });

        await admin.users.insert({
        requestBody: {
          primaryEmail: employee.email,
          name: {
            givenName: employee.firstName,
            familyName: employee.lastName
          },
          password: Math.random().toString(36),
          changePasswordAtNextLogin: true
        }
      });
      }

      // Skip API calls in test mode
      if (process.env.NODE_ENV !== 'test') {
        // GitHub
        const octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN
        });

        await octokit.orgs.setMembershipForUser({
          org: process.env.GITHUB_ORG || '',
          username: employee.email.split('@')[0],
          role: 'member'
        });
      }

      // Skip API calls in test mode
      if (process.env.NODE_ENV !== 'test') {
        // Slack
        const slack = new WebClient(process.env.SLACK_TOKEN);

        await slack.users.admin.invite({
          email: employee.email,
          channels: employee.accessGroups
        });
      }
    } catch (error) {
      logger.error('Failed to provision access', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  async #revokeAccess(employee) {
    try {
      // Skip API calls in test mode
      if (process.env.NODE_ENV !== 'test') {
        // Google Workspace
        const admin = google.admin({ version: 'directory_v1' });

        await admin.users.suspend({
        userKey: employee.email
      });
      }

      // Skip API calls in test mode
      if (process.env.NODE_ENV !== 'test') {
        // GitHub
        const octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN
        });

        await octokit.orgs.removeMembershipForUser({
          org: process.env.GITHUB_ORG || '',
          username: employee.email.split('@')[0]
        });
      }

      // Skip API calls in test mode
      if (process.env.NODE_ENV !== 'test') {
        // Slack
        const slack = new WebClient(process.env.SLACK_TOKEN);

        await slack.users.admin.setInactive({
          user: employee.email
        });
      }
    } catch (error) {
      logger.error('Failed to revoke access', {
        metadata: {
          employeeId: employee.id,
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }
}

const employees = EmployeeLifecycle.getInstance();
export { employees };
