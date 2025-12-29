import { LoadScript, GoogleMap, Autocomplete } from '@react-google-maps/api';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const phoneUtil = PhoneNumberUtil.getInstance();

export interface VerifiedAddress {
  street: string;
  number: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
  formatted: string;
  placeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface VerifiedPhone {
  originalNumber: string;
  e164Format: string;
  nationalFormat: string;
  countryCode: string;
  valid: boolean;
}

export class GoogleVerification {
  /**
   * Initialize Google Maps libraries
   */
  static getGoogleMapsLibraries(): ['places'] {
    return ['places'] as const;
  }

  /**
   * Get Google Maps script loading options
   */
  static getLoadScriptProps() {
    return {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY!,
      libraries: this.getGoogleMapsLibraries(),
      language: 'en', // Can be dynamically set based on user's language
      region: 'BE'    // Default to Belgium
    };
  }

  /**
   * Get Autocomplete options for address input
   */
  static getAutocompleteOptions(countryRestrictions: string[] = ['BE', 'NL', 'FR', 'DE']) {
    return {
      componentRestrictions: { country: countryRestrictions },
      types: ['address'],
      fields: [
        'address_components',
        'formatted_address',
        'geometry',
        'place_id'
      ]
    };
  }

  /**
   * Parse Google Places result into VerifiedAddress
   */
  static parseGoogleAddress(place: google.maps.places.PlaceResult): VerifiedAddress {
    let street = '';
    let number = '';
    let city = '';
    let postalCode = '';
    let country = '';
    let countryCode = '';

    // Parse address components
    place.address_components?.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        number = component.long_name;
      }
      if (types.includes('route')) {
        street = component.long_name;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
      if (types.includes('country')) {
        country = component.long_name;
        countryCode = component.short_name;
      }
    });

    return {
      street,
      number,
      city,
      postalCode,
      country,
      countryCode,
      formatted: place.formatted_address || '',
      placeId: place.place_id || '',
      coordinates: {
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0
      }
    };
  }

  /**
   * Verify and format phone number
   */
  static verifyPhoneNumber(phoneNumber: string, defaultCountry = 'BE'): VerifiedPhone {
    try {
      // Parse phone number
      const number = phoneUtil.parse(phoneNumber, defaultCountry);

      // Check if valid
      if (!phoneUtil.isValidNumber(number)) {
        throw new Error('Invalid phone number');
      }

      return {
        originalNumber: phoneNumber,
        e164Format: phoneUtil.format(number, PhoneNumberFormat.E164),
        nationalFormat: phoneUtil.format(number, PhoneNumberFormat.NATIONAL),
        countryCode: number.getCountryCode()?.toString() || '',
        valid: true
      };
    } catch (error) {
      return {
        originalNumber: phoneNumber,
        e164Format: '',
        nationalFormat: '',
        countryCode: '',
        valid: false
      };
    }
  }

  /**
   * Get address verification status
   */
  static getAddressVerificationStatus(address: VerifiedAddress): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = ['street', 'number', 'city', 'postalCode', 'country'];
    const missingFields = requiredFields.filter(field => !address[field as keyof VerifiedAddress]);

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Format address for display
   */
  static formatAddress(address: VerifiedAddress, format: 'short' | 'full' = 'full'): string {
    if (format === 'short') {
      return `${address.street} ${address.number}, ${address.city}`;
    }
    return `${address.street} ${address.number}, ${address.postalCode} ${address.city}, ${address.country}`;
  }

  /**
   * Get coordinates from address
   */
  static async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results[0]?.geometry?.location) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Validate delivery area
   */
  static async isInDeliveryArea(
    address: VerifiedAddress,
    serviceArea: { lat: number; lng: number; radiusKm: number }
  ): Promise<boolean> {
    try {
      const { lat, lng } = address.coordinates;
      const distance = this.calculateDistance(
        lat,
        lng,
        serviceArea.lat,
        serviceArea.lng
      );
      return distance <= serviceArea.radiusKm;
    } catch (error) {
      console.error('Delivery area check failed:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
