export type UserRole = 
  | 'employee'           // DEMA Group employees
  | 'partner'           // Official business partners
  | 'supplier'          // Product/service suppliers
  | 'customer.b2b'      // Business customers
  | 'customer.b2c'      // Individual customers
  | 'admin'             // System administrators
  | 'support'           // Customer support
  | 'manager';          // Department managers

export type DepartmentType =
  | 'sales'
  | 'support'
  | 'logistics'
  | 'finance'
  | 'hr'
  | 'it'
  | 'management'
  | 'operations';

export type CompanyBrand = 'dema' | 'fluxer' | 'beltz247' | 'devisschere' | 'accu';

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language: 'en' | 'nl' | 'fr';
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee extends BaseUser {
  role: 'employee';
  employeeId: string;
  department: DepartmentType;
  company: CompanyBrand;
  accessLevel: 1 | 2 | 3 | 4 | 5; // 5 highest
  supervisor?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications: string[];
  systemAccess: {
    erp: boolean;
    crm: boolean;
    warehouse: boolean;
    finance: boolean;
  };
}

export interface Partner extends BaseUser {
  role: 'partner';
  partnerId: string;
  companyName: string;
  vatNumber: string;
  partnerType: 'reseller' | 'installer' | 'distributor' | 'service';
  territory: string[];
  contractNumber: string;
  contractValidUntil: Date;
  creditLimit: number;
  paymentTerms: number; // days
  certifications: string[];
  assignedProducts: string[];
  performanceMetrics: {
    salesVolume: number;
    customerSatisfaction: number;
    responseTime: number;
  };
}

export interface Supplier extends BaseUser {
  role: 'supplier';
  supplierId: string;
  companyName: string;
  vatNumber: string;
  supplierCategory: string[];
  qualityRating: number;
  iso9001Certified: boolean;
  deliveryPerformance: number;
  bankDetails: {
    iban: string;
    swift: string;
    bankName: string;
  };
  insurancePolicy: {
    provider: string;
    policyNumber: string;
    coverage: number;
    expiryDate: Date;
  };
  suppliedProducts: {
    productId: string;
    leadTime: number;
    minimumOrder: number;
  }[];
}

export interface B2BCustomer extends BaseUser {
  role: 'customer.b2b';
  customerId: string;
  companyName: string;
  vatNumber: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  creditLimit: number;
  paymentTerms: number;
  preferredPaymentMethod: 'bank_transfer' | 'credit_card' | 'direct_debit';
  billingAddress: Address;
  shippingAddresses: Address[];
  purchaseHistory: {
    total: number;
    lastOrder: Date;
    averageOrderValue: number;
  };
  assignedSalesRep?: string;
  specialPricing: boolean;
  taxExempt: boolean;
}

export interface B2CCustomer extends BaseUser {
  role: 'customer.b2c';
  customerId: string;
  shippingAddress: Address;
  billingAddress: Address;
  marketingPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  purchaseHistory: {
    total: number;
    lastOrder: Date;
    averageOrderValue: number;
  };
}

export interface Address {
  street: string;
  number: string;
  box?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

export interface SecurityClearance {
  level: number;
  areas: string[];
  expiryDate: Date;
  issuedBy: string;
  documents: {
    type: string;
    verified: boolean;
    verificationDate: Date;
  }[];
}
