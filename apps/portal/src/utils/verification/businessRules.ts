import { CompanyVerification } from './companyVerification';
import { ServiceAreaValidator } from './serviceArea';
import { VerifiedAddress } from './googleVerification';

export interface BusinessRuleContext {
  customerType: 'B2B' | 'B2C';
  country: string;
  industry?: string;
  creditLimit?: number;
  orderValue?: number;
  address?: VerifiedAddress;
  vatNumber?: string;
  companyName?: string;
}

export interface RuleResult {
  passed: boolean;
  message: string;
  code: string;
  details?: any;
}

export class BusinessRules {
  /**
   * Validate all applicable business rules
   */
  static async validateRules(context: BusinessRuleContext): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Validate service area if address provided
    if (context.address) {
      const serviceAreaResult = await this.validateServiceArea(context);
      results.push(serviceAreaResult);
    }

    // Validate company details for B2B
    if (context.customerType === 'B2B') {
      const companyResults = await this.validateCompany(context);
      results.push(...companyResults);
    }

    // Validate credit and order limits
    if (context.orderValue) {
      const creditResults = await this.validateCredit(context);
      results.push(...creditResults);
    }

    return results;
  }

  /**
   * Validate service area rules
   */
  private static async validateServiceArea(
    context: BusinessRuleContext
  ): Promise<RuleResult> {
    if (!context.address) {
      return {
        passed: false,
        message: 'Address is required',
        code: 'ADDRESS_REQUIRED'
      };
    }

    const result = await ServiceAreaValidator.validateServiceArea(
      context.address,
      context.customerType,
      context.industry
    );

    return {
      passed: result.valid,
      message: result.valid
        ? 'Service area validation passed'
        : `Service area validation failed: ${result.restrictions?.join(', ')}`,
      code: result.valid ? 'SERVICE_AREA_VALID' : 'SERVICE_AREA_INVALID',
      details: result
    };
  }

  /**
   * Validate company rules
   */
  private static async validateCompany(
    context: BusinessRuleContext
  ): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Validate VAT number
    if (context.vatNumber) {
      const vatValid = await CompanyVerification.verifyVAT(
        context.vatNumber,
        context.country as any
      );
      results.push({
        passed: vatValid,
        message: vatValid ? 'VAT number valid' : 'Invalid VAT number',
        code: vatValid ? 'VAT_VALID' : 'VAT_INVALID'
      });
    }

    // Validate sanctions
    if (context.companyName && context.vatNumber) {
      const sanctions = await CompanyVerification.verifySanctions(
        context.companyName,
        context.vatNumber,
        context.country
      );
      results.push({
        passed: sanctions.clear,
        message: sanctions.clear
          ? 'Sanctions check passed'
          : 'Company found in sanctions list',
        code: sanctions.clear ? 'SANCTIONS_CLEAR' : 'SANCTIONS_FOUND',
        details: sanctions
      });
    }

    return results;
  }

  /**
   * Validate credit rules
   */
  private static async validateCredit(
    context: BusinessRuleContext
  ): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Validate minimum order value
    const minOrderValue = context.customerType === 'B2B' ? 100 : 50;
    if (context.orderValue! < minOrderValue) {
      results.push({
        passed: false,
        message: `Order value below minimum (${minOrderValue})`,
        code: 'MIN_ORDER_VALUE',
        details: { minimum: minOrderValue, actual: context.orderValue }
      });
    }

    // Validate credit limit for B2B
    if (context.customerType === 'B2B' && context.vatNumber) {
      const credit = await CompanyVerification.verifyCreditRating(
        context.vatNumber,
        context.country
      );

      const withinLimit = !context.creditLimit || 
        context.orderValue! <= context.creditLimit;

      results.push({
        passed: withinLimit,
        message: withinLimit
          ? 'Credit check passed'
          : 'Order exceeds credit limit',
        code: withinLimit ? 'CREDIT_VALID' : 'CREDIT_EXCEEDED',
        details: {
          rating: credit,
          limit: context.creditLimit,
          orderValue: context.orderValue
        }
      });
    }

    return results;
  }

  /**
   * Get rule description
   */
  static getRuleDescription(code: string): string {
    const descriptions: Record<string, string> = {
      ADDRESS_REQUIRED: 'A valid delivery address is required',
      SERVICE_AREA_VALID: 'Address is within our service area',
      SERVICE_AREA_INVALID: 'Address is outside our service area',
      VAT_VALID: 'VAT number is valid',
      VAT_INVALID: 'VAT number is invalid or not found',
      SANCTIONS_CLEAR: 'No sanctions found',
      SANCTIONS_FOUND: 'Company is on sanctions list',
      MIN_ORDER_VALUE: 'Order must meet minimum value requirement',
      CREDIT_VALID: 'Order is within credit limit',
      CREDIT_EXCEEDED: 'Order exceeds available credit limit'
    };

    return descriptions[code] || 'Unknown rule';
  }

  /**
   * Check if rules are blocking
   */
  static isBlocking(code: string): boolean {
    const blockingRules = [
      'ADDRESS_REQUIRED',
      'SERVICE_AREA_INVALID',
      'VAT_INVALID',
      'SANCTIONS_FOUND',
      'MIN_ORDER_VALUE',
      'CREDIT_EXCEEDED'
    ];

    return blockingRules.includes(code);
  }
}
