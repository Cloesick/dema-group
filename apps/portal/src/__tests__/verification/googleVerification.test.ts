import { GoogleVerification, VerifiedAddress, VerifiedPhone } from '../../utils/verification/googleVerification';

describe('GoogleVerification', () => {
  describe('verifyPhoneNumber', () => {
    const testCases = [
      {
        input: '+32 123 45 67 89',
        country: 'BE',
        expected: {
          valid: true,
          countryCode: '32'
        }
      },
      {
        input: '0123456789',
        country: 'BE',
        expected: {
          valid: true,
          countryCode: '32'
        }
      },
      {
        input: '+1 234 567 8900',
        country: 'BE',
        expected: {
          valid: false
        }
      }
    ];

    testCases.forEach(({ input, country, expected }) => {
      it(`should validate ${input} for ${country}`, () => {
        const result = GoogleVerification.verifyPhoneNumber(input, country);
        expect(result.valid).toBe(expected.valid);
        if (expected.valid) {
          expect(result.countryCode).toBe(expected.countryCode);
        }
      });
    });
  });

  describe('parseGoogleAddress', () => {
    it('should parse a complete address', () => {
      const mockPlace = {
        address_components: [
          {
            long_name: '123',
            short_name: '123',
            types: ['street_number']
          },
          {
            long_name: 'Test Street',
            short_name: 'Test St',
            types: ['route']
          },
          {
            long_name: 'Brussels',
            short_name: 'BXL',
            types: ['locality']
          },
          {
            long_name: '1000',
            short_name: '1000',
            types: ['postal_code']
          },
          {
            long_name: 'Belgium',
            short_name: 'BE',
            types: ['country']
          }
        ],
        formatted_address: '123 Test Street, 1000 Brussels, Belgium',
        geometry: {
          location: {
            lat: () => 50.8503,
            lng: () => 4.3517
          }
        },
        place_id: 'test_place_id'
      };

      const result = GoogleVerification.parseGoogleAddress(mockPlace as any);

      expect(result).toEqual({
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
      });
    });
  });

  describe('getAddressVerificationStatus', () => {
    it('should validate a complete address', () => {
      const address: VerifiedAddress = {
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

    it('should detect missing fields', () => {
      const address: VerifiedAddress = {
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

  describe('formatAddress', () => {
    const address: VerifiedAddress = {
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

    it('should format address in short format', () => {
      const result = GoogleVerification.formatAddress(address, 'short');
      expect(result).toBe('Test Street 123, Brussels');
    });

    it('should format address in full format', () => {
      const result = GoogleVerification.formatAddress(address, 'full');
      expect(result).toBe('Test Street 123, 1000 Brussels, Belgium');
    });
  });
});
