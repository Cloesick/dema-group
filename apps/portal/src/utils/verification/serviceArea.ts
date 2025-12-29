import { VerifiedAddress } from './googleVerification';

export interface ServiceArea {
  id: string;
  name: string;
  country: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in kilometers
  restrictions?: {
    customerTypes: ('B2B' | 'B2C')[];
    minimumOrderValue?: number;
    maximumDistance?: number;
    excludedPostalCodes?: string[];
    requiredIndustries?: string[];
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  serviceAreaId: string;
  deliveryDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
  cutoffTime: string; // HH:mm format
  leadTimeDays: number;
  minimumOrderValue: number;
  deliveryCost: number;
  freeDeliveryThreshold?: number;
}

export const serviceAreas: ServiceArea[] = [
  {
    id: 'be-flanders',
    name: 'Flanders',
    country: 'BE',
    center: { lat: 51.0500, lng: 3.7167 }, // Ghent
    radius: 100,
    restrictions: {
      customerTypes: ['B2B', 'B2C'],
      minimumOrderValue: 50,
      excludedPostalCodes: []
    }
  },
  {
    id: 'be-wallonia',
    name: 'Wallonia',
    country: 'BE',
    center: { lat: 50.4667, lng: 4.8667 }, // Namur
    radius: 100,
    restrictions: {
      customerTypes: ['B2B', 'B2C'],
      minimumOrderValue: 50,
      excludedPostalCodes: []
    }
  },
  {
    id: 'nl-randstad',
    name: 'Randstad',
    country: 'NL',
    center: { lat: 52.0907, lng: 4.7444 }, // Center of Randstad
    radius: 75,
    restrictions: {
      customerTypes: ['B2B'],
      minimumOrderValue: 100,
      requiredIndustries: ['manufacturing', 'construction']
    }
  }
];

export const deliveryZones: DeliveryZone[] = [
  {
    id: 'be-flanders-next-day',
    name: 'Flanders Next Day Delivery',
    serviceAreaId: 'be-flanders',
    deliveryDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    cutoffTime: '16:00',
    leadTimeDays: 1,
    minimumOrderValue: 50,
    deliveryCost: 10,
    freeDeliveryThreshold: 500
  },
  {
    id: 'be-wallonia-standard',
    name: 'Wallonia Standard Delivery',
    serviceAreaId: 'be-wallonia',
    deliveryDays: ['MON', 'WED', 'FRI'],
    cutoffTime: '15:00',
    leadTimeDays: 2,
    minimumOrderValue: 50,
    deliveryCost: 15,
    freeDeliveryThreshold: 750
  }
];

export class ServiceAreaValidator {
  /**
   * Check if address is within any service area
   */
  static async validateServiceArea(
    address: VerifiedAddress,
    customerType: 'B2B' | 'B2C',
    industry?: string
  ): Promise<{
    valid: boolean;
    serviceArea?: ServiceArea;
    deliveryZone?: DeliveryZone;
    restrictions?: string[];
  }> {
    const restrictions: string[] = [];
    
    // Find matching service area
    const serviceArea = serviceAreas.find(area => {
      // Check country
      if (area.country !== address.countryCode) {
        return false;
      }

      // Check customer type
      if (!area.restrictions?.customerTypes.includes(customerType)) {
        restrictions.push(`${customerType} customers not served in this area`);
        return false;
      }

      // Check postal code exclusions
      if (area.restrictions?.excludedPostalCodes?.includes(address.postalCode)) {
        restrictions.push(`Postal code ${address.postalCode} not served`);
        return false;
      }

      // Check industry requirements
      if (industry && area.restrictions?.requiredIndustries?.length) {
        if (!area.restrictions.requiredIndustries.includes(industry)) {
          restrictions.push(`Industry ${industry} not served in this area`);
          return false;
        }
      }

      // Check distance
      const distance = this.calculateDistance(
        area.center.lat,
        area.center.lng,
        address.coordinates.lat,
        address.coordinates.lng
      );

      if (distance > area.radius) {
        restrictions.push(`Address is outside service radius`);
        return false;
      }

      return true;
    });

    if (!serviceArea) {
      return {
        valid: false,
        restrictions
      };
    }

    // Find matching delivery zone
    const deliveryZone = deliveryZones.find(zone => 
      zone.serviceAreaId === serviceArea.id
    );

    return {
      valid: true,
      serviceArea,
      deliveryZone,
      restrictions: restrictions.length ? restrictions : undefined
    };
  }

  /**
   * Get delivery options for an address
   */
  static getDeliveryOptions(
    serviceAreaId: string,
    orderValue: number
  ): {
    nextDeliveryDate: Date;
    deliveryCost: number;
    leadTime: number;
  } {
    const zone = deliveryZones.find(z => z.serviceAreaId === serviceAreaId);
    if (!zone) {
      throw new Error('No delivery zone found');
    }

    const now = new Date();
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(zone.cutoffTime.split(':')[0]),
      parseInt(zone.cutoffTime.split(':')[1])
    );

    // Calculate next delivery date
    let nextDelivery = new Date(now);
    nextDelivery.setDate(nextDelivery.getDate() + zone.leadTimeDays);

    // Adjust for cutoff time
    if (now > cutoff) {
      nextDelivery.setDate(nextDelivery.getDate() + 1);
    }

    // Adjust for delivery days
    while (!zone.deliveryDays.includes(this.getDayCode(nextDelivery))) {
      nextDelivery.setDate(nextDelivery.getDate() + 1);
    }

    // Calculate delivery cost
    let deliveryCost = zone.deliveryCost;
    if (zone.freeDeliveryThreshold && orderValue >= zone.freeDeliveryThreshold) {
      deliveryCost = 0;
    }

    return {
      nextDeliveryDate: nextDelivery,
      deliveryCost,
      leadTime: zone.leadTimeDays
    };
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

  private static getDayCode(date: Date): 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' {
    const days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[] = [
      'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
    ];
    return days[date.getDay()];
  }
}
