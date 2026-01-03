import { employees } from '../../compliance/employee-lifecycle';
import { readFileSync, writeFileSync } from 'node:fs';
import { logger } from '../../utils/logger';
import { google } from 'googleapis';
import { Octokit } from '@octokit/rest';
import { WebClient } from '@slack/web-api';

jest.mock('node:fs');
jest.mock('../../utils/logger');
jest.mock('googleapis');
jest.mock('@octokit/rest');
jest.mock('@slack/web-api');

describe('EmployeeLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Onboarding', () => {
    it('should create new employee record and start onboarding', async () => {
      const mockEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        accessGroups: ['engineering', 'developers']
      };

      const newEmployee = await employees.startOnboarding(mockEmployee);

      expect(newEmployee.id).toBeDefined();
      expect(newEmployee.status).toBe('onboarding');
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should provision required access', async () => {
      const mockAdmin = {
        users: {
          insert: jest.fn().mockResolvedValue({})
        }
      };

      const mockAuth = {
        getClient: jest.fn().mockResolvedValue({}),
        getProjectId: jest.fn().mockResolvedValue('test-project')
      };

      (google.auth.JWT as jest.Mock).mockImplementation(() => mockAuth);
      (google.admin as jest.Mock).mockReturnValue(mockAdmin);

      const mockEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        accessGroups: ['engineering', 'developers']
      };

      await employees.startOnboarding(mockEmployee);

      expect(mockAdmin.users.insert).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Offboarding', () => {
    it('should update employee status and start offboarding', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2023-01-15',
        endDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        status: 'active',
        accessGroups: ['engineering', 'developers'],
        equipment: [],
        training: [],
        compliance: {
          policies: []
        },
        metadata: {}
      };

      (readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify([mockEmployee])
      );

      await employees.startOffboarding('emp-1', '2024-01-15');

      expect(writeFileSync).toHaveBeenCalled();
      const savedEmployees = JSON.parse(
        (writeFileSync as jest.Mock).mock.calls[0][1]
      );
      const updatedEmployee = savedEmployees.find((e: any) => e.id === 'emp-1');
      expect(updatedEmployee.status).toBe('offboarding');
      expect(updatedEmployee.endDate).toBe('2024-01-15');
    });

    it('should revoke access when offboarding', async () => {
      const mockAdmin = {
        users: {
          suspend: jest.fn().mockResolvedValue({})
        }
      };

      const mockAuth = {
        getClient: jest.fn().mockResolvedValue({}),
        getProjectId: jest.fn().mockResolvedValue('test-project')
      };

      (google.auth.JWT as jest.Mock).mockImplementation(() => mockAuth);
      (google.admin as jest.Mock).mockReturnValue(mockAdmin);

      const mockEmployee = {
        id: 'emp-1',
        email: 'john.doe@dema-group.com',
        status: 'active'
      };

      (readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify([mockEmployee])
      );

      await employees.startOffboarding('emp-1', '2024-01-15');

      expect(mockAdmin.users.suspend).toHaveBeenCalledWith({
        userKey: 'john.doe@dema-group.com'
      });
    });
  });

  describe('Equipment Management', () => {
    it('should track assigned equipment', async () => {
      const mockEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        accessGroups: ['engineering', 'developers']
      };

      const newEmployee = await employees.startOnboarding(mockEmployee);

      expect(newEmployee.equipment).toBeDefined();
      expect(newEmployee.equipment.length).toBeGreaterThan(0);
      expect(newEmployee.equipment[0].assignedDate).toBeDefined();
      expect(newEmployee.equipment[0].returnedDate).toBeUndefined();
    });

    it('should track returned equipment during offboarding', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2023-01-15',
        endDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        status: 'active',
        accessGroups: ['engineering', 'developers'],
        equipment: [
          {
            type: 'laptop',
            id: 'LT-001',
            assignedDate: '2023-01-15'
          }
        ],
        training: [],
        compliance: {
          policies: []
        },
        metadata: {}
      };

      (readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify([mockEmployee])
      );

      await employees.startOffboarding('emp-1', '2024-01-15');

      expect(writeFileSync).toHaveBeenCalled();
      const savedEmployees = JSON.parse(
        (writeFileSync as jest.Mock).mock.calls[0][1]
      );
      const updatedEmployee = savedEmployees.find((e: any) => e.id === 'emp-1');
      expect(updatedEmployee.equipment[0].returnedDate).toBeDefined();
    });
  });

  describe('Training Management', () => {
    it('should assign required training during onboarding', async () => {
      const mockEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        accessGroups: ['engineering', 'developers']
      };

      const newEmployee = await employees.startOnboarding(mockEmployee);

      expect(newEmployee.training).toBeDefined();
      expect(newEmployee.training.length).toBeGreaterThan(0);
      expect(newEmployee.training).toContainEqual(
        expect.objectContaining({
          id: 'SEC-101',
          name: 'Security Awareness Training',
          status: 'pending'
        })
      );
    });

    it('should assign role-specific training', async () => {
      const mockEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        accessGroups: ['engineering', 'developers']
      };

      const newEmployee = await employees.startOnboarding(mockEmployee);

      expect(newEmployee.training).toContainEqual(
        expect.objectContaining({
          id: 'SEC-201',
          name: 'Secure Development Practices',
          status: 'pending'
        })
      );
    });
  });

  describe('Compliance Management', () => {
    it('should track policy acknowledgments', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        status: 'onboarding',
        accessGroups: ['engineering', 'developers'],
        equipment: [],
        training: [],
        compliance: {
          policies: []
        },
        metadata: {}
      };

      (readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify([mockEmployee])
      );

      await employees.acknowledgePolicies('emp-1', ['POL-001', 'POL-002']);

      expect(writeFileSync).toHaveBeenCalled();
      const savedEmployees = JSON.parse(
        (writeFileSync as jest.Mock).mock.calls[0][1]
      );
      const updatedEmployee = savedEmployees.find((e: any) => e.id === 'emp-1');
      expect(updatedEmployee.compliance.policies).toHaveLength(2);
      expect(updatedEmployee.compliance.policies[0].acknowledged).toBe(true);
      expect(updatedEmployee.compliance.policies[0].acknowledgedDate).toBeDefined();
    });

    it('should initiate background check during onboarding', async () => {
      const mockEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@dema-group.com',
        department: 'Engineering',
        role: 'Developer',
        startDate: '2024-01-15',
        manager: 'jane.smith@dema-group.com',
        accessGroups: ['engineering', 'developers']
      };

      const newEmployee = await employees.startOnboarding(mockEmployee);

      expect(newEmployee.compliance.backgroundCheck).toBeDefined();
      expect(newEmployee.compliance.backgroundCheck.status).toBe('pending');
    });
  });
});
