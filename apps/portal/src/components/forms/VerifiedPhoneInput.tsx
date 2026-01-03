import { useState, useEffect } from 'react';
import { GoogleVerification, VerifiedPhone } from '@/utils/verification/googleVerification';

interface VerifiedPhoneInputProps {
  onPhoneVerify: (phone: VerifiedPhone) => void;
  defaultCountry?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function VerifiedPhoneInput({
  onPhoneVerify,
  defaultCountry = 'BE',
  label = 'Phone Number',
  required = false,
  error,
  className = ''
}: VerifiedPhoneInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [formattedNumber, setFormattedNumber] = useState('');

  // Verify phone number on input change
  useEffect(() => {
    if (!inputValue) {
      setIsValid(false);
      setFormattedNumber('');
      return;
    }

    const result = GoogleVerification.verifyPhoneNumber(inputValue, defaultCountry);
    setIsValid(result.valid);
    setFormattedNumber(result.nationalFormat);

    if (result.valid) {
      onPhoneVerify(result);
    }
  }, [inputValue, defaultCountry, onPhoneVerify]);

  // Format the input as the user types
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-numeric characters except + at the start
    value = value.replace(/[^\d+]/g, '');
    
    // Ensure only one + at the start
    if (value.startsWith('+')) {
      value = '+' + value.substring(1).replace(/\+/g, '');
    }

    setInputValue(value);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="tel"
          value={inputValue}
          onChange={handleInput}
          className={`
            w-full px-4 py-2 border rounded-lg shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isValid ? 'pr-10' : ''}
          `}
          placeholder={`e.g., +32 123 45 67 89`}
        />

        {/* Validation status icon */}
        {inputValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Show formatted number */}
      {isValid && formattedNumber && (
        <p className="mt-1 text-sm text-green-600">
          Formatted: {formattedNumber}
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      <p className="mt-1 text-xs text-gray-500">
        Enter phone number with country code (e.g., +32 for Belgium)
      </p>
    </div>
  );
}
