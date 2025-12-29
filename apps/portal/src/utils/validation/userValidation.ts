import { z } from 'zod';
import { isValidVATNumber, isValidIBAN } from './validators';
import type { UserRole, DepartmentType, CompanyBrand } from '@/types/users';

// Common validation schemas
const addressSchema = z.object({
  street: z.string().min(2),
  number: z.string(),
  box: z.string().optional(),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().length(2),
  isDefault: z.boolean().optional(),
  label: z.string().optional()
});

const baseUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
  language: z.enum(['en', 'nl', 'fr']),
  twoFactorEnabled: z.boolean(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending'])
});

// Role-specific validation schemas
export const employeeValidation = baseUserSchema.extend({
  role: z.literal('employee'),
  employeeId: z.string().regex(/^EMP[0-9]{6}$/),
  department: z.enum([
    'sales', 'support', 'logistics', 'finance', 
    'hr', 'it', 'management', 'operations'
  ]),
  company: z.enum(['dema', 'fluxer', 'beltz247', 'devisschere', 'accu']),
  accessLevel: z.number().min(1).max(5),
  supervisor: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
    relationship: z.string()
  }),
  certifications: z.array(z.string()),
  systemAccess: z.object({
    erp: z.boolean(),
    crm: z.boolean(),
    warehouse: z.boolean(),
    finance: z.boolean()
  })
});

export const partnerValidation = baseUserSchema.extend({
  role: z.literal('partner'),
  partnerId: z.string().regex(/^PTR[0-9]{6}$/),
  companyName: z.string().min(2),
  vatNumber: z.string().refine(isValidVATNumber, {
    message: 'Invalid VAT number'
  }),
  partnerType: z.enum(['reseller', 'installer', 'distributor', 'service']),
  territory: z.array(z.string()),
  contractNumber: z.string(),
  contractValidUntil: z.date().min(new Date()),
  creditLimit: z.number().min(0),
  paymentTerms: z.number().min(0).max(90),
  certifications: z.array(z.string()),
  assignedProducts: z.array(z.string()),
  performanceMetrics: z.object({
    salesVolume: z.number().min(0),
    customerSatisfaction: z.number().min(0).max(5),
    responseTime: z.number().min(0)
  })
});

export const supplierValidation = baseUserSchema.extend({
  role: z.literal('supplier'),
  supplierId: z.string().regex(/^SUP[0-9]{6}$/),
  companyName: z.string().min(2),
  vatNumber: z.string().refine(isValidVATNumber, {
    message: 'Invalid VAT number'
  }),
  supplierCategory: z.array(z.string()),
  qualityRating: z.number().min(0).max(5),
  iso9001Certified: z.boolean(),
  deliveryPerformance: z.number().min(0).max(100),
  bankDetails: z.object({
    iban: z.string().refine(isValidIBAN, {
      message: 'Invalid IBAN'
    }),
    swift: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/),
    bankName: z.string()
  }),
  insurancePolicy: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    coverage: z.number().min(1000000), // Minimum 1M coverage
    expiryDate: z.date().min(new Date())
  }),
  suppliedProducts: z.array(z.object({
    productId: z.string(),
    leadTime: z.number().min(1),
    minimumOrder: z.number().min(1)
  }))
});

export const b2bCustomerValidation = baseUserSchema.extend({
  role: z.literal('customer.b2b'),
  customerId: z.string().regex(/^B2B[0-9]{6}$/),
  companyName: z.string().min(2),
  vatNumber: z.string().refine(isValidVATNumber, {
    message: 'Invalid VAT number'
  }),
  industry: z.string(),
  size: z.enum(['small', 'medium', 'large', 'enterprise']),
  creditLimit: z.number().min(0),
  paymentTerms: z.number().min(0).max(60),
  preferredPaymentMethod: z.enum([
    'bank_transfer', 'credit_card', 'direct_debit'
  ]),
  billingAddress: addressSchema,
  shippingAddresses: z.array(addressSchema),
  purchaseHistory: z.object({
    total: z.number().min(0),
    lastOrder: z.date().optional(),
    averageOrderValue: z.number().min(0)
  }),
  assignedSalesRep: z.string().optional(),
  specialPricing: z.boolean(),
  taxExempt: z.boolean()
});

export const b2cCustomerValidation = baseUserSchema.extend({
  role: z.literal('customer.b2c'),
  customerId: z.string().regex(/^B2C[0-9]{6}$/),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  marketingPreferences: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    phone: z.boolean()
  }),
  purchaseHistory: z.object({
    total: z.number().min(0),
    lastOrder: z.date().optional(),
    averageOrderValue: z.number().min(0)
  })
});

// Security validation functions
export class SecurityValidator {
  static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  static readonly RESTRICTED_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com'];
  static readonly IP_WHITELIST = ['192.168.1.0/24']; // Example internal network

  static validatePassword(password: string): boolean {
    return this.PASSWORD_REGEX.test(password);
  }

  static validateEmployeeEmail(email: string, company: CompanyBrand): boolean {
    const domain = email.split('@')[1];
    const allowedDomains = {
      dema: ['demashop.be'],
      fluxer: ['fluxer.be'],
      beltz247: ['beltz247.com'],
      devisschere: ['devisscheretechnics.be'],
      accu: ['accu-components.com']
    };
    return allowedDomains[company].includes(domain);
  }

  static validateAccessLevel(
    role: UserRole,
    department: DepartmentType,
    requestedAccess: string[]
  ): boolean {
    const accessMatrix = {
      'employee.sales': ['crm', 'products'],
      'employee.finance': ['erp', 'invoicing'],
      'employee.it': ['all'],
      'partner': ['products', 'orders'],
      'supplier': ['inventory', 'orders'],
      'customer.b2b': ['catalog', 'orders'],
      'customer.b2c': ['catalog', 'orders']
    };

    const allowedAccess = accessMatrix[`${role}${department ? `.${department}` : ''}`];
    return allowedAccess === ['all'] || 
           requestedAccess.every(access => allowedAccess.includes(access));
  }

  static validateIPAccess(ip: string, role: UserRole): boolean {
    // Implement IP range checking
    return true; // Placeholder
  }

  static validateSession(
    sessionData: {
      lastActivity: Date;
      ipAddress: string;
      userAgent: string;
    }
  ): boolean {
    const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutes
    return (new Date().getTime() - sessionData.lastActivity.getTime()) < MAX_IDLE_TIME;
  }

  static validateDocument(
    document: {
      type: string;
      content: Buffer;
      mimeType: string;
    }
  ): boolean {
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    return ALLOWED_MIME_TYPES.includes(document.mimeType) && 
           document.content.length <= MAX_FILE_SIZE;
  }
}

// Validation service
export class UserValidationService {
  static async validateUser(
    userData: any,
    role: UserRole
  ): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const validationSchema = {
        'employee': employeeValidation,
        'partner': partnerValidation,
        'supplier': supplierValidation,
        'customer.b2b': b2bCustomerValidation,
        'customer.b2c': b2cCustomerValidation
      }[role];

      await validationSchema.parseAsync(userData);

      // Additional security checks
      if (!SecurityValidator.validatePassword(userData.password)) {
        throw new Error('Password does not meet security requirements');
      }

      if (role === 'employee' && !SecurityValidator.validateEmployeeEmail(
        userData.email,
        userData.company
      )) {
        throw new Error('Invalid employee email domain');
      }

      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message)
        };
      }
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }
}
