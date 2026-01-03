import { UserValidationService } from '@/utils/validation/userValidation';
import { CompanyVerification } from '@/utils/verification/companyVerification';
import { GoogleVerification } from '@/utils/verification/googleVerification';
import { ServiceAreaValidator } from '@/utils/verification/serviceArea';

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

      const result = await UserValidationService.validateUser(data, 'b2b');
      expect(result.valid).toBe(true);
    });

    it('blocks invalid VAT numbers', async () => {
      const data = {
        vatNumber: 'INVALID',
        companyName: 'Test Company'
      };

      const result = await CompanyVerification.verifyVAT(
        data.vatNumber,
        'BE'
      );
      expect(result).toBe(false);
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

      const result = await ServiceAreaValidator.validateServiceArea(
        address,
        'B2B',
        'manufacturing'
      );

      expect(result.valid).toBe(false);
      expect(result.restrictions).toContain('Address is outside service radius');
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

      const result = GoogleVerification.getAddressVerificationStatus(address);
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
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

      const result = GoogleVerification.getAddressVerificationStatus(address);
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('number');
      expect(result.missingFields).toContain('postalCode');
    });
  });
});
