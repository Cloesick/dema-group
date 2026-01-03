export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VerifiedAddress {
  street: string;
  number: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
  formatted: string;
  placeId: string;
  coordinates: Coordinates;
}
