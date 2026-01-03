declare namespace google.maps {
  class Geocoder {
    geocode(request: GeocoderRequest): Promise<GeocoderResponse>;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng;
    placeId?: string;
    bounds?: LatLngBounds;
    componentRestrictions?: GeocoderComponentRestrictions;
    region?: string;
  }

  interface GeocoderResponse {
    results: GeocoderResult[];
    status: GeocoderStatus;
  }

  interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: GeocoderGeometry;
    place_id: string;
    types: string[];
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface GeocoderGeometry {
    location: LatLng;
    location_type: GeocoderLocationType;
    viewport: LatLngBounds;
    bounds?: LatLngBounds;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(point: LatLng): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    isEmpty(): boolean;
  }

  enum GeocoderStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }

  enum GeocoderLocationType {
    ROOFTOP = 'ROOFTOP',
    RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
    GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
    APPROXIMATE = 'APPROXIMATE'
  }

  interface GeocoderComponentRestrictions {
    administrativeArea?: string;
    country?: string | string[];
    locality?: string;
    postalCode?: string;
    route?: string;
  }

  namespace places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(eventName: string, handler: Function): MapsEventListener;
      getBounds(): LatLngBounds;
      getPlace(): PlaceResult;
      setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      setComponentRestrictions(restrictions: ComponentRestrictions): void;
      setFields(fields: string[]): void;
      setOptions(options: AutocompleteOptions): void;
      setTypes(types: string[]): void;
    }

    interface AutocompleteOptions {
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      placeIdOnly?: boolean;
      strictBounds?: boolean;
      types?: string[];
    }

    interface ComponentRestrictions {
      country: string | string[];
    }

    interface PlaceResult {
      address_components?: GeocoderAddressComponent[];
      adr_address?: string;
      formatted_address?: string;
      geometry?: PlaceGeometry;
      icon?: string;
      name?: string;
      place_id?: string;
      types?: string[];
      url?: string;
      utc_offset?: number;
      vicinity?: string;
    }

    interface PlaceGeometry {
      location: LatLng;
      viewport: LatLngBounds;
    }
  }

  interface MapsEventListener {
    remove(): void;
  }

  namespace event {
    function addDomListener(instance: object, eventName: string, handler: Function, capture?: boolean): MapsEventListener;
    function addDomListenerOnce(instance: object, eventName: string, handler: Function, capture?: boolean): MapsEventListener;
    function addListener(instance: object, eventName: string, handler: Function): MapsEventListener;
    function addListenerOnce(instance: object, eventName: string, handler: Function): MapsEventListener;
    function clearInstanceListeners(instance: object): void;
    function clearListeners(instance: object, eventName: string): void;
    function removeListener(listener: MapsEventListener): void;
    function trigger(instance: object, eventName: string, ...args: any[]): void;
  }
}
