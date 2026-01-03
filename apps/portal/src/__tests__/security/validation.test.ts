import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserValidationService } from '@/utils/validation/userValidation';
import { CompanyVerification } from '@/utils/verification/companyVerification';
import { GoogleVerification } from '@/utils/verification/googleVerification';
import { ServiceAreaValidator } from '@/utils/verification/serviceArea';
import type { UserRole } from '@/types/user';
import type { VerifiedAddress } from '@/types/address';

describe('Validation Security', () => {
  describe('User Data Validation', () => {
    it('validates B2B customer data', async () => {
      const data = {
        email: 'test@company.com',
        vatNumber: 'BE0123456789',
        companyName: 'Test Company',
        address: {
          street: 'Test Street',
          number: '123',
          city: 'Brussels',
          postalCode: '1000',
          country: 'BE'
        }
      };

      // Mock company verification
      vi.spyOn(CompanyVerification, 'verifyVAT').mockResolvedValue(true);
      vi.spyOn(GoogleVerification, 'getAddressVerificationStatus').mockReturnValue({
        isValid: true,
        missingFields: []
      });

      // Mock validations
      vi.spyOn(CompanyVerification, 'verifyVAT').mockResolvedValue(true);
      vi.spyOn(GoogleVerification, 'getAddressVerificationStatus').mockReturnValue({
        isValid: true,
        missingFields: []
      });

      const result = await UserValidationService.validateUser(data, 'B2B' as UserRole);
      expect(result.isValid).toEqual(true);
    });

    it('blocks invalid VAT numbers', async () => {
      const data = {
        vatNumber: 'INVALID',
        companyName: 'Test Company'
      };

      // Mock VAT validation
      vi.spyOn(CompanyVerification, 'verifyVAT').mockResolvedValue(false);

      const result = await CompanyVerification.verifyVAT(
        data.vatNumber,
        'BE'
      );
      expect(result).toEqual(false);
    });

    it('validates service area restrictions', async () => {
      const address = {
        street: 'Test Street',
        number: '123',
        city: 'Amsterdam',
        postalCode: '1000',
        countryCode: 'NL',
        coordinates: {
          lat: 52.3676,
          lng: 4.9041
        }
      };

      // Mock address verification
      vi.spyOn(GoogleVerification, 'isInDeliveryArea').mockResolvedValue(false);

      // Mock service area validation
      vi.spyOn(ServiceAreaValidator, 'validateServiceArea').mockResolvedValue({
        isValid: false,
        errors: ['Address is outside service radius']
      });

      const result = await ServiceAreaValidator.validateServiceArea(
        {
          ...address,
          country: 'Netherlands',
          formatted: 'Test Street 123, 1000 Amsterdam, Netherlands',
          placeId: 'test_place_id'
        } as VerifiedAddress,
        'B2B',
        'manufacturing'
      );

      expect(result.isValid).toEqual(false);
      expect(result.errors).toContain('Address is outside service radius');
    });
  });

  describe('Address Validation', () => {
    it('validates complete address', () => {
      const address = {
        street: 'Test Street',
        number: '123',
        city: 'Brussels',
        postalCode: '1000',
        country: 'Belgium',
        countryCode: 'BE',
        formatted: '123 Test Street, 1000 Brussels, Belgium',
        placeId: 'test_place_id',
        coordinates: {
          lat: 50.8503,
          lng: 4.3517
        }
      };

      // Mock address verification
      vi.spyOn(GoogleVerification, 'getAddressVerificationStatus').mockReturnValue({
        isValid: true,
        missingFields: []
      });

      const result = GoogleVerification.getAddressVerificationStatus(address);
      expect(result.isValid).toEqual(true);
      expect(result.missingFields).toEqual([]);
    });

    it('detects missing address fields', () => {
      const address = {
        street: 'Test Street',
        number: '',
        city: 'Brussels',
        postalCode: '',
        country: 'Belgium',
        countryCode: 'BE',
        formatted: 'Test Street, Brussels, Belgium',
        placeId: 'test_place_id',
        coordinates: {
          lat: 50.8503,
          lng: 4.3517
        }
      };

      // Mock address verification
      vi.spyOn(GoogleVerification, 'getAddressVerificationStatus').mockReturnValue({
        isValid: false,
        missingFields: ['number', 'postalCode']
      });

      const result = GoogleVerification.getAddressVerificationStatus(address);
      expect(result.isValid).toEqual(false);
      expect(result.missingFields).toEqual(['number', 'postalCode']);
    });
  });
});
