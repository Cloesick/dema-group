import { z } from 'zod';

export interface VerifiedCompany {
  vatNumber: string;
  name: string;
  address: string;
  country: string;
  isValid: boolean;
  registrationNumber: string;
  legalForm: string;
  status: 'active' | 'inactive' | 'liquidation' | 'bankrupt';
}

export interface VerifiedBank {
  iban: string;
  bic: string;
  bankName: string;
  country: string;
  isValid: boolean;
}

export class CompanyVerification {
  private static readonly VAT_PATTERNS = {
    BE: /^(BE)?0?\d{9}$/,
    NL: /^(NL)?\d{9}B\d{2}$/,
    FR: /^(FR)?\d{2}\d{9}$/,
    DE: /^(DE)?\d{9}$/
  };

  private static readonly IBAN_PATTERNS = {
    BE: /^BE\d{2}(?:\d{4}){3}$/,
    NL: /^NL\d{2}[A-Z]{4}\d{10}$/,
    FR: /^FR\d{2}\d{10}[A-Z0-9]{11}\d{2}$/,
    DE: /^DE\d{2}\d{8}(?:\d{10})$/
  };

  /**
   * Verify VAT number format and validate with VIES API
   */
  static async verifyVAT(vatNumber: string, country: keyof typeof CompanyVerification.VAT_PATTERNS): Promise<boolean> {
    const pattern = this.VAT_PATTERNS[country];
    if (!pattern.test(vatNumber)) {
      return false;
    }

    try {
      // Here you would integrate with VIES API
      // For demo, we're just validating the format
      return true;
    } catch (error) {
      console.error('VAT verification failed:', error);
      return false;
    }
  }

  /**
   * Verify IBAN and BIC
   */
  static async verifyBank(iban: string, bic: string): Promise<VerifiedBank> {
    const country = iban.slice(0, 2) as keyof typeof CompanyVerification.IBAN_PATTERNS;
    const pattern = this.IBAN_PATTERNS[country];

    if (!pattern?.test(iban)) {
      throw new Error('Invalid IBAN format');
    }

    if (!/^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(bic)) {
      throw new Error('Invalid BIC format');
    }

    // Here you would integrate with a bank verification API
    // For demo, we're returning mock data
    return {
      iban,
      bic,
      bankName: 'Demo Bank',
      country,
      isValid: true
    };
  }

  /**
   * Verify company registration
   */
  static async verifyCompany(
    registrationNumber: string,
    country: string
  ): Promise<VerifiedCompany> {
    // Here you would integrate with company registry APIs
    // For demo, we're validating format and returning mock data
    const schema = z.object({
      registrationNumber: z.string().min(5),
      country: z.enum(['BE', 'NL', 'FR', 'DE'])
    });

    try {
      schema.parse({ registrationNumber, country });

      return {
        vatNumber: 'BE0123456789',
        name: 'Demo Company',
        address: '123 Demo Street',
        country,
        isValid: true,
        registrationNumber,
        legalForm: 'BV',
        status: 'active'
      };
    } catch (error) {
      throw new Error('Invalid company registration data');
    }
  }

  /**
   * Verify credit rating
   */
  static async verifyCreditRating(
    vatNumber: string,
    country: string
  ): Promise<{
    score: number;
    rating: 'A' | 'B' | 'C' | 'D';
    limit: number;
    risk: 'low' | 'medium' | 'high';
  }> {
    // Here you would integrate with credit rating APIs
    // For demo, we're returning mock data
    return {
      score: 75,
      rating: 'B',
      limit: 50000,
      risk: 'medium'
    };
  }

  /**
   * Verify sanctions and compliance
   */
  static async verifySanctions(
    companyName: string,
    vatNumber: string,
    country: string
  ): Promise<{
    clear: boolean;
    sanctions: string[];
    lastChecked: Date;
  }> {
    // Here you would integrate with sanctions databases
    // For demo, we're returning mock data
    return {
      clear: true,
      sanctions: [],
      lastChecked: new Date()
    };
  }

  /**
   * Format VAT number
   */
  static formatVAT(vatNumber: string, country: keyof typeof CompanyVerification.VAT_PATTERNS): string {
    // Remove all non-alphanumeric characters
    const cleaned = vatNumber.replace(/[^A-Z0-9]/g, '');

    // Add country prefix if missing
    if (!cleaned.startsWith(country)) {
      return `${country}${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Format IBAN
   */
  static formatIBAN(iban: string): string {
    // Remove all non-alphanumeric characters
    const cleaned = iban.replace(/[^A-Z0-9]/g, '');
    
    // Add spaces every 4 characters
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }
}
