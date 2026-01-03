// Mock environment variables
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test_api_key';

// Mock Google Maps
const mockGeocoder = {
  geocode: jest.fn().mockResolvedValue({
    results: [
      {
        geometry: {
          location: {
            lat: () => 50.8503,
            lng: () => 4.3517
          }
        }
      }
    ]
  })
};

const mockPlaces = {
  Autocomplete: jest.fn(),
  AutocompleteService: jest.fn(),
  PlacesService: jest.fn(),
  RankBy: { DISTANCE: 0, RATING: 1 },
  PlacesServiceStatus: {
    OK: 'OK',
    ZERO_RESULTS: 'ZERO_RESULTS',
    OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
    REQUEST_DENIED: 'REQUEST_DENIED',
    INVALID_REQUEST: 'INVALID_REQUEST',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  }
} as any;

const mockEvent = {
  addDomListener: jest.fn(),
  addDomListenerOnce: jest.fn(),
  addListener: jest.fn(),
  addListenerOnce: jest.fn(),
  clearInstanceListeners: jest.fn(),
  clearListeners: jest.fn(),
  removeListener: jest.fn(),
  trigger: jest.fn()
};

global.google = {
  maps: {
    Geocoder: jest.fn(() => mockGeocoder),
    places: mockPlaces,
    event: mockEvent
                lat: () => 50.8503,
                lng: () => 4.3517
              }
            }
          }
        ]
      })
    })),
    places: {
      Autocomplete: jest.fn(),
      AutocompleteService: jest.fn(),
      PlacesService: jest.fn()
    },
    event: {
      removeListener: jest.fn()
    }
  }
};
