import { z } from 'zod';

// Customer Type Definitions
export type CustomerType = 'b2b' | 'b2c';

export interface CustomerValidationResult {
  isValid: boolean;
  type: CustomerType | null;
  errors: string[];
  companyInfo?: B2BCompanyInfo;
}

export interface B2BCompanyInfo {
  vatNumber: string;
  companyName: string;
  industryType: string;
  creditLine?: number;
}

// Validation Schemas
const b2bValidationSchema = z.object({
  vatNumber: z.string()
    .regex(/^[A-Z]{2}[0-9]{9,10}$/, 'Invalid VAT number format')
    .min(11)
    .max(12),
  companyName: z.string().min(2),
  industryType: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string().length(2) // ISO country code
  })
});

const b2cValidationSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string().length(2)
  })
});

// Customer Validation Functions
export class CustomerValidator {
  private static readonly B2B_INDICATORS = [
    'vatNumber',
    'companyName',
    'industryType'
  ];

  /**
   * Determines if the form data indicates a B2B or B2C customer
   */
  static detectCustomerType(formData: Record<string, any>): CustomerType {
    const hasB2BFields = this.B2B_INDICATORS.some(field => 
      formData[field] && formData[field].toString().trim().length > 0
    );
    return hasB2BFields ? 'b2b' : 'b2c';
  }

  /**
   * Validates customer data and determines customer type
   */
  static async validateCustomer(
    formData: Record<string, any>
  ): Promise<CustomerValidationResult> {
    try {
      const customerType = this.detectCustomerType(formData);
      const schema = customerType === 'b2b' ? b2bValidationSchema : b2cValidationSchema;
      
      await schema.parseAsync(formData);

      const result: CustomerValidationResult = {
        isValid: true,
        type: customerType,
        errors: []
      };

      if (customerType === 'b2b') {
        result.companyInfo = {
          vatNumber: formData.vatNumber,
          companyName: formData.companyName,
          industryType: formData.industryType
        };
      }

      return result;

    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          type: null,
          errors: error.errors.map(e => e.message)
        };
      }
      return {
        isValid: false,
        type: null,
        errors: ['Unexpected validation error']
      };
    }
  }

  /**
   * Validates VAT number format and existence
   */
  static async validateVATNumber(vatNumber: string): Promise<boolean> {
    try {
      // Here you would integrate with VIES VAT validation service
      // For now, just basic format validation
      const vatRegex = /^[A-Z]{2}[0-9]{9,10}$/;
      return vatRegex.test(vatNumber);
    } catch (error) {
      console.error('VAT validation error:', error);
      return false;
    }
  }

  /**
   * Checks if customer has required fields before form submission
   */
  static validateRequiredFields(
    formData: Record<string, any>, 
    customerType: CustomerType
  ): string[] {
    const errors: string[] = [];
    const requiredFields = customerType === 'b2b' 
      ? ['vatNumber', 'companyName', 'email'] 
      : ['firstName', 'lastName', 'email'];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim().length === 0) {
        errors.push(`${field} is required`);
      }
    });

    return errors;
  }

  /**
   * Validates customer credit eligibility (B2B only)
   */
  static async validateCreditEligibility(
    companyInfo: B2BCompanyInfo
  ): Promise<{ eligible: boolean; creditLine?: number }> {
    try {
      // Here you would integrate with credit check service
      // For now, basic validation based on industry type
      const eligibleIndustries = ['manufacturing', 'construction', 'wholesale'];
      const eligible = eligibleIndustries.includes(companyInfo.industryType.toLowerCase());
      
      return {
        eligible,
        creditLine: eligible ? 10000 : 0 // Example credit line
      };
    } catch (error) {
      console.error('Credit eligibility check error:', error);
      return { eligible: false };
    }
  }
}

// Usage Example:
/*
const formData = {
  vatNumber: 'BE0123456789',
  companyName: 'DEMA Customer Ltd',
  industryType: 'manufacturing',
  email: 'contact@customer.com',
  phoneNumber: '+32123456789',
  billingAddress: {
    street: 'Customer Street 1',
    city: 'Brussels',
    postalCode: '1000',
    country: 'BE'
  }
};

const validation = await CustomerValidator.validateCustomer(formData);
if (validation.isValid && validation.type === 'b2b') {
  const creditCheck = await CustomerValidator.validateCreditEligibility(validation.companyInfo!);
  // Handle credit check result
}
*/
