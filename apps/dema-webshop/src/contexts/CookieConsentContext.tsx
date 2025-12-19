'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

type CookieConsentContextType = {
  consent: CookieConsent;
  updateConsent: (newConsent: Partial<CookieConsent>) => void;
  isConsentGiven: boolean;
  resetConsent: () => void;
  forceOpen: boolean;
  openConsent: () => void;
  closeConsent: () => void;
};

const COOKIE_CONSENT_KEY = 'cookie-consent';

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceOpen, setForceOpen] = useState(false);

  // Load saved consent from localStorage on component mount
  useEffect(() => {
    const savedConsent = sessionStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        setIsConsentGiven(true);
      } catch (error) {
        console.error('Failed to parse saved cookie consent:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent = { ...consent, ...newConsent };
    setConsent(updatedConsent);
    sessionStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updatedConsent));
    
    // If this is the first time setting consent
    if (!isConsentGiven) {
      setIsConsentGiven(true);
    }

    // Here you can initialize analytics or other services based on consent
    if (updatedConsent.analytics) {
      // Initialize analytics
      console.log('Analytics initialized');
    }

    if (updatedConsent.marketing) {
      // Initialize marketing cookies
      console.log('Marketing cookies initialized');
    }
  };

  const resetConsent = () => {
    try {
      sessionStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch (_) {}
    setConsent(defaultConsent);
    setIsConsentGiven(false);
  };

  const openConsent = () => setForceOpen(true);
  const closeConsent = () => setForceOpen(false);

  // Don't render children until we've loaded the consent state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CookieConsentContext.Provider value={{ consent, updateConsent, isConsentGiven, resetConsent, forceOpen, openConsent, closeConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
