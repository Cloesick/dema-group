'use client';

import dynamic from 'next/dynamic';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

// Dynamically import the CookieConsent component with no SSR
const CookieConsent = dynamic(
  () => import('./CookieConsent'),
  { ssr: false }
);

export default function CookieConsentWrapper() {
  const { isConsentGiven, updateConsent, consent, forceOpen, closeConsent } = useCookieConsent();

  if (isConsentGiven && !forceOpen) {
    return null;
  }

  return (
    <CookieConsent
      onAccept={(c) => {
        updateConsent(c);
        if (forceOpen) closeConsent();
      }}
      initialConsent={consent}
      alwaysOpen={forceOpen}
    />
  );
}
