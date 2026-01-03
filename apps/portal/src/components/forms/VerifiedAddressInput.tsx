import { useEffect, useRef, useState } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { GoogleVerification, VerifiedAddress } from '@/utils/verification/googleVerification';

interface VerifiedAddressInputProps {
  onAddressSelect: (address: VerifiedAddress) => void;
  defaultCountry?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function VerifiedAddressInput({
  onAddressSelect,
  defaultCountry = 'BE',
  label = 'Address',
  required = false,
  error,
  className = ''
}: VerifiedAddressInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Handle place selection
  const onPlaceSelect = () => {
    if (!autocompleteRef.current) return;

    setIsLoadingPlace(true);
    const place = autocompleteRef.current.getPlace();
    
    if (place.geometry && place.address_components) {
      const verifiedAddress = GoogleVerification.parseGoogleAddress(place);
      const { isValid, missingFields } = GoogleVerification.getAddressVerificationStatus(verifiedAddress);
      
      if (isValid) {
        onAddressSelect(verifiedAddress);
        setInputValue(GoogleVerification.formatAddress(verifiedAddress, 'full'));
      } else {
        console.warn('Missing address fields:', missingFields);
      }
    }
    setIsLoadingPlace(false);
  };

  // Initialize autocomplete when component mounts
  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current) return;

    const autocomplete = autocompleteRef.current;
    autocomplete.setFields([
      'address_components',
      'formatted_address',
      'geometry',
      'place_id'
    ]);

    // Set initial restrictions
    autocomplete.setComponentRestrictions({
      country: [defaultCountry]
    });

    // Add place_changed listener
    const listener = autocomplete.addListener('place_changed', onPlaceSelect);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [isLoaded, defaultCountry]);

  return (
    <LoadScript
      {...GoogleVerification.getLoadScriptProps()}
      onLoad={() => setIsLoaded(true)}
    >
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <Autocomplete
            onLoad={autocomplete => {
              autocompleteRef.current = autocomplete;
            }}
            restrictions={{
              country: defaultCountry
            }}
            options={GoogleVerification.getAutocompleteOptions([defaultCountry])}
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className={`
                w-full px-4 py-2 border rounded-lg shadow-sm
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${error ? 'border-red-500' : 'border-gray-300'}
                ${isLoadingPlace ? 'bg-gray-100' : 'bg-white'}
              `}
              placeholder="Start typing your address..."
              disabled={isLoadingPlace}
            />
          </Autocomplete>

          {isLoadingPlace && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}

        <p className="mt-1 text-xs text-gray-500">
          Start typing and select an address from the suggestions
        </p>
      </div>
    </LoadScript>
  );
}
