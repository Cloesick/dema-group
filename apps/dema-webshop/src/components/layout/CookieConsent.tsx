'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'cookie-consent';

type CookieConsentProps = {
  onAccept: (preferences: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  }) => void;
  initialConsent?: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  alwaysOpen?: boolean;
};

export default function CookieConsent({ onAccept, initialConsent, alwaysOpen }: CookieConsentProps) {
  const { t } = useLocale();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true, // Always true as it's required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // If explicitly requested, open with provided initialConsent
    if (alwaysOpen) {
      if (initialConsent) setConsent(prev => ({ ...prev, ...initialConsent }));
      setShowBanner(true);
      return;
    }
    // Otherwise only show when no consent exists this session
    const savedConsent = sessionStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      setShowBanner(true);
    } else if (!initialConsent) {
      // preload toggles from saved session when user opens settings later
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(prev => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  // While banner is shown, lock page scroll to make it fully blocking
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (showBanner) {
      const prevHtmlOverflow = html.style.overflow;
      const prevBodyOverflow = body.style.overflow;
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      return () => {
        html.style.overflow = prevHtmlOverflow;
        body.style.overflow = prevBodyOverflow;
      };
    }
  }, [showBanner]);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setConsent(allAccepted);
    sessionStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allAccepted));
    onAccept(allAccepted);
    // Show settings to reflect that all are enabled
    setShowSettings(true);
    setShowBanner(true);
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true, // Necessary cookies can't be rejected
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setConsent(rejected);
    sessionStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(rejected));
    onAccept(rejected);
    // Show settings to reflect that all are disabled (except necessary)
    setShowSettings(true);
    setShowBanner(true);
  };

  const handleSavePreferences = () => {
    sessionStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    onAccept(consent);
    setShowBanner(false);
  };

  const toggleSetting = (key: keyof typeof consent) => {
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4" aria-hidden={false}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
      >
        <div className="p-6">
          <h2 id="cookie-consent-title" className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.title')}</h2>
          
          <p className="text-gray-600 mb-6">{t('cookies.intro')}</p>

          {showSettings ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('cookies.necessary.title')}</h3>
                    <p className="text-sm text-gray-500">{t('cookies.necessary.desc')}</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="necessary" 
                      id="necessary"
                      checked={consent.necessary}
                      disabled
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="necessary" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${consent.necessary ? 'bg-primary' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('cookies.analytics.title')}</h3>
                    <p className="text-sm text-gray-500">{t('cookies.analytics.desc')}</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="analytics" 
                      id="analytics"
                      checked={consent.analytics}
                      onChange={() => toggleSetting('analytics')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="analytics" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${consent.analytics ? 'bg-primary' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('cookies.marketing.title')}</h3>
                    <p className="text-sm text-gray-500">{t('cookies.marketing.desc')}</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="marketing" 
                      id="marketing"
                      checked={consent.marketing}
                      onChange={() => toggleSetting('marketing')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="marketing" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${consent.marketing ? 'bg-primary' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>

                {/* Preferences Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('cookies.preferences.title')}</h3>
                    <p className="text-sm text-gray-500">{t('cookies.preferences.desc')}</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="preferences" 
                      id="preferences"
                      checked={consent.preferences}
                      onChange={() => toggleSetting('preferences')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="preferences" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${consent.preferences ? 'bg-primary' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  {t('cookies.save')}
                </button>
                <button
                  onClick={() => { setShowSettings(false); setShowBanner(false); }}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t('cookies.close')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="w-full px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors whitespace-nowrap"
                >
                  {t('cookies.accept_all')}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="w-full px-4 py-3 bg-white border border-gray-300 font-medium rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  {t('cookies.reject_all')}
                </button>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-md transition-colors"
                >
                  {t('cookies.customize')}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {t('cookies.notice')}{' '}
                <Link href="/privacy" className="text-primary hover:underline">{t('cookies.privacy_link')}</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
