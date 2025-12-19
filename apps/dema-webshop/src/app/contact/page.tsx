'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getFirebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebaseClient';
import { FiSend, FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, FiDollarSign, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import { useLocale } from '@/contexts/LocaleContext';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCode?: string;
  company: string;
  vatNumber: string;
  clientType: 'retail' | 'wholesale' | 'business';
  inquiryType: string;
  message: string;
  budget: string;
  timeline: string;
  heardAbout: string;
  privacyPolicy: boolean;
  termsAndConditions: boolean;
  address?: string;
};

export default function ContactPage() {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVatField, setShowVatField] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [phoneVerifySending, setPhoneVerifySending] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneCodeInput, setPhoneCodeInput] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ description: string; place_id: string }>>([]);
  const [addressValidated, setAddressValidated] = useState<string | null>(null);
  const [placesReady, setPlacesReady] = useState(false);
  const [placesSessionToken, setPlacesSessionToken] = useState<any>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  
  // Initialize with empty string to prevent hydration mismatch
  const [currentTime, setCurrentTime] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (data.phone && !phoneVerified) {
        setIsSubmitting(false);
        setSubmitStatus({ success: false, message: t('contact.errors.verify_phone_first') });
        return;
      }
      if (addressQuery && !addressValidated) {
        setIsSubmitting(false);
        setSubmitStatus({ success: false, message: t('contact.errors.select_valid_address') });
        return;
      }
      let token = recaptchaToken;
      try {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (window && (window as any).grecaptcha && siteKey) {
          await (window as any).grecaptcha.ready(async () => {
            try {
              const t = await (window as any).grecaptcha.execute(siteKey, { action: 'contact' });
              token = t;
              setRecaptchaToken(t);
            } catch {}
          });
        }
      } catch {}

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            phoneCode: data.phone ? phoneCodeInput : undefined,
            address: addressValidated || undefined,
            recaptchaToken: token || undefined,
            firebaseIdToken: firebaseIdToken || undefined,
            name: `${data.firstName} ${data.lastName}`.trim(),
          }),
        });

        if (response.ok) {
          setSubmitStatus({
            success: true,
            message: t('contact.success.submit')
          });
          reset();
        } else {
          throw new Error('Failed to submit form');
        }
      } catch (error) {
        setSubmitStatus({
          success: false,
          message: t('contact.errors.submit_failed')
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: t('contact.errors.submit_failed')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update time on client side only
  useEffect(() => {
    const updateTime = () => {
      const brusselsTime = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Brussels',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(brusselsTime);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show VAT field when company has at least 1 character
  const companyValue = watch('company');
  useEffect(() => {
    setShowVatField(!!companyValue && companyValue.trim().length >= 1);
  }, [companyValue]);

  // Load reCAPTCHA v3 script
  useEffect(() => {
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && typeof window !== 'undefined' && !(window as any).grecaptcha) {
        const s = document.createElement('script');
        s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        s.async = true;
        s.onload = () => setRecaptchaReady(true);
        document.head.appendChild(s);
      } else if ((window as any).grecaptcha) {
        setRecaptchaReady(true);
      }
    } catch {}
  }, []);

  // Load Google Maps Places script
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || typeof window === 'undefined') return;
    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      setPlacesReady(true);
      setPlacesSessionToken(new (window as any).google.maps.places.AutocompleteSessionToken());
      return;
    }
    const scriptId = 'gmaps-places';
    if (document.getElementById(scriptId)) return;
    const s = document.createElement('script');
    s.id = scriptId;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly`;
    s.async = true;
    s.onload = () => {
      setPlacesReady(true);
      setPlacesSessionToken(new (window as any).google.maps.places.AutocompleteSessionToken());
    };
    document.head.appendChild(s);
  }, []);

  // Update address suggestions as user types
  useEffect(() => {
    if (!placesReady) return;
    if (!addressQuery) { setAddressSuggestions([]); setAddressValidated(null); return; }
    try {
      const svc = new (window as any).google.maps.places.AutocompleteService();
      svc.getPlacePredictions(
        { input: addressQuery, sessionToken: placesSessionToken, types: ['address'], componentRestrictions: { country: ['be', 'nl', 'fr'] } },
        (preds: any[]) => {
          const list = Array.isArray(preds) ? preds.map(p => ({ description: p.description, place_id: p.place_id })) : [];
          setAddressSuggestions(list);
        }
      );
    } catch {}
  }, [addressQuery, placesReady]);

  const handleSelectAddress = async (p: { description: string; place_id: string }) => {
    try {
      const map = document.createElement('div');
      const g = (window as any).google;
      const svc = new g.maps.places.PlacesService(map);
      await new Promise<void>((resolve) => {
        svc.getDetails({ placeId: p.place_id, sessionToken: placesSessionToken, fields: ['formatted_address', 'geometry'] }, (res: any, status: any) => {
          if (status === g.maps.places.PlacesServiceStatus.OK && res) {
            setAddressValidated(res.formatted_address);
            setAddressQuery(res.formatted_address);
            setAddressSuggestions([]);
          }
          resolve();
        });
      });
    } catch {}
  };

  const ensureFirebaseRecaptcha = () => {
    const auth = getFirebaseAuth();
    if (!(window as any)._recaptchaVerifier) {
      (window as any)._recaptchaVerifier = new RecaptchaVerifier(auth, 'firebase-recaptcha-container', { size: 'invisible' });
    }
    return (window as any)._recaptchaVerifier as RecaptchaVerifier;
  };

  const sendPhoneCode = async () => {
    try {
      const phoneVal = (document.getElementById('phone') as HTMLInputElement | null)?.value || '';
      if (!phoneVal) { setSubmitStatus({ success: false, message: t('contact.phone.enter_first') }); return; }
      setPhoneVerifySending(true);
      setSubmitStatus(null);
      const verifier = ensureFirebaseRecaptcha();
      const auth = getFirebaseAuth();
      const result = await signInWithPhoneNumber(auth, phoneVal, verifier);
      confirmationRef.current = result;
      setSubmitStatus({ success: true, message: t('contact.phone.code_sent') });
    } catch (e) {
      setSubmitStatus({ success: false, message: t('contact.phone.send_failed') });
    } finally {
      setPhoneVerifySending(false);
    }
  };

  const checkPhoneCode = async () => {
    try {
      if (!confirmationRef.current || !phoneCodeInput) { setSubmitStatus({ success: false, message: t('contact.phone.enter_code') }); return; }
      const cred = await confirmationRef.current.confirm(phoneCodeInput);
      const tkn = await cred.user.getIdToken();
      setFirebaseIdToken(tkn);
      setPhoneVerified(true);
      setSubmitStatus({ success: true, message: t('contact.phone.verified') });
    } catch {
      setPhoneVerified(false);
      setFirebaseIdToken(null);
      setSubmitStatus({ success: false, message: t('contact.phone.invalid_code') });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('contact.title')}
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            {t('contact.subtitle')}
            <br />
            <span className="text-sm text-gray-400">
              {t('contact.current_time')} {currentTime}
            </span>
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
            <div className="bg-white p-4 rounded-lg shadow">
              <FiPhone className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-medium text-gray-900">+32 (0)51 20 51 41</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <FiMail className="mx-auto h-6 w-6 text-primary" />
              <a href="mailto:info@demashop.be" className="mt-2 text-sm font-medium text-primary hover:text-blue-800">
                info@demashop.be
              </a>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <FiMapPin className="mx-auto h-6 w-6 text-primary" />
              <a
                href="https://www.google.com/maps/place/Ovenstraat+11+8800+Roeselare"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm font-medium text-primary hover:text-blue-800"
              >
                Ovenstraat 11, 8800 Roeselare
              </a>
            </div>
          </div>
        </div>

        {submitStatus && (
          <div
            className={`mb-8 p-4 rounded-md ${
              submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {submitStatus.success ? (
                  <FiSend className="h-5 w-5 text-green-400" />
                ) : (
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{submitStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <p className="mb-4 text-sm text-gray-500">
              {t('contact.required_note')} <span className="text-red-500">*</span>
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    {t('contact.first_name')} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      maxLength={50}
                      {...register('firstName', {
                        required: t('contact.validation.first_name_required'),
                        maxLength: { value: 50, message: t('contact.validation.max_50') },
                      })}
                      className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder={t('contact.placeholders.first_name')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    {t('contact.last_name')} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400 opacity-0" />
                    </div>
                    <input
                      type="text"
                      id="lastName"
                      maxLength={50}
                      {...register('lastName', {
                        required: t('contact.validation.last_name_required'),
                        maxLength: { value: 50, message: t('contact.validation.max_50') },
                      })}
                      className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder={t('contact.placeholders.last_name')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('contact.email')} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: t('contact.validation.email_required'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('contact.validation.email_invalid'),
                        },
                        maxLength: { value: 254, message: t('contact.validation.max_254') },
                      })}
                      maxLength={254}
                      className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder={t('contact.placeholders.email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    {t('contact.phone.label')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone', {
                        maxLength: { value: 25, message: t('contact.validation.max_25') },
                        pattern: {
                          value: /(\+32|0)[1-9](\s?\d{2}){3,4}$/,
                          message: t('contact.validation.phone_be')
                        }
                      })}
                      maxLength={25}
                      className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder={t('contact.placeholders.phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={sendPhoneCode} disabled={phoneVerifySending} className="px-3 py-2 rounded bg-primary text-white disabled:opacity-50">{phoneVerifySending ? t('contact.phone.sending') : t('contact.phone.send_code')}</button>
                    <input type="text" value={phoneCodeInput} onChange={(e) => setPhoneCodeInput(e.target.value)} maxLength={8} className="border rounded px-2 py-2 text-sm" placeholder={t('contact.phone.code_placeholder')} />
                    <button type="button" onClick={checkPhoneCode} className="px-3 py-2 rounded bg-emerald-600 text-white">{t('contact.phone.verify')}</button>
                    {phoneVerified && <span className="text-sm text-emerald-600">{t('contact.phone.verified_short')}</span>}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    {t('contact.address')}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="address"
                      value={addressQuery}
                      onChange={(e) => { setAddressQuery(e.target.value); setAddressValidated(null); }}
                      autoComplete="off"
                      className="focus:ring-primary focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 border"
                      placeholder={t('contact.placeholders.address')}
                    />
                    {addressSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-60 overflow-auto">
                        {addressSuggestions.map((sug) => (
                          <li key={sug.place_id} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectAddress(sug)}>
                            {sug.description}
                          </li>
                        ))}
                      </ul>
                    )}
                    {addressValidated && (
                      <p className="mt-2 text-sm text-emerald-600">{addressValidated}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    {t('contact.company')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBriefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      maxLength={100}
                      className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder={t('contact.placeholders.company')}
                      spellCheck={false}
                      {...register('company')}
                    />
                  </div>
                </div>

                {showVatField && (
                  <div>
                    <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">
                      {t('contact.vat')}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiBriefcase className="h-5 w-5 text-gray-400 opacity-0" />
                      </div>
                      <input
                        type="text"
                        id="vatNumber"
                        maxLength={20}
                        className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder={t('contact.placeholders.vat')}
                        spellCheck={false}
                        {...register('vatNumber')}
                      />
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    {t('contact.message')} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <textarea
                      id="message"
                      rows={4}
                      maxLength={2000}
                      className="shadow-sm focus:ring-primary focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder={t('contact.placeholders.message')}
                      spellCheck={false}
                      {...register('message', {
                        required: t('contact.validation.message_required'),
                        minLength: {
                          value: 10,
                          message: t('contact.validation.message_min_10'),
                        },
                        maxLength: { value: 2000, message: t('contact.validation.max_2000') },
                      })}
                    />
                  </div>
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="privacyPolicy"
                        type="checkbox"
                        {...register('privacyPolicy', {
                          required: t('contact.validation.accept_privacy'),
                        })}
                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="privacyPolicy" className="font-medium text-gray-700">
                        {t('contact.privacy.agree_prefix')}{' '}
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                          {t('contact.privacy.link')}
                        </a>
                        . <span className="text-red-500">*</span>
                      </label>
                      {errors.privacyPolicy && (
                        <p className="mt-1 text-sm text-red-600">{errors.privacyPolicy.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="termsAndConditions"
                        type="checkbox"
                        {...register('termsAndConditions', {
                          required: t('contact.validation.accept_terms'),
                        })}
                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="termsAndConditions" className="font-medium text-gray-700">
                        {t('contact.terms.agree_prefix')}{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                          {t('contact.terms.link')}
                        </a>
                        . <span className="text-red-500">*</span>
                      </label>
                      {errors.termsAndConditions && (
                        <p className="mt-1 text-sm text-red-600">{errors.termsAndConditions.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    t('contact.sending')
                  ) : (
                    <>
                      <FiSend className="-ml-1 mr-2 h-5 w-5" />
                      {t('contact.send_message')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FiMail className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('contact.info.email_us')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('contact.info.respond_24h')}</p>
                <p className="mt-1 text-sm font-medium text-primary">info@demashop.be</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FiPhone className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('contact.info.call_us')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('contact.info.hours')}</p>
                <p className="mt-1 text-sm font-medium text-primary">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FiBriefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('contact.info.visit_us')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('contact.info.address_line1')}</p>
                <p className="text-sm text-gray-500">{t('contact.info.address_line2')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
