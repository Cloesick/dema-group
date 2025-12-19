'use client';

import { useQuote } from '@/contexts/QuoteContext';
import { X, FileText, Send, Save, FolderOpen } from 'lucide-react';
import SavedQuotesManager from './SavedQuotesManager';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiCheck } from 'react-icons/fi';

type QuoteFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  vatNumber: string;
  address: string;
  message: string;
  privacyPolicy: boolean;
  termsAndConditions: boolean;
};

export default function QuoteList() {
  const { quoteItems, isQuoteOpen, closeQuote, removeFromQuote, updateQuantity, updateNotes, clearQuote } = useQuote();
  const { data: session } = useSession();
  const [showContactForm, setShowContactForm] = useState(false);
  const [useLoginInfo, setUseLoginInfo] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Reset to product list view when quote panel opens
  useEffect(() => {
    if (isQuoteOpen) {
      setShowContactForm(false);
      setSent(false);
    }
  }, [isQuoteOpen]);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showVatField, setShowVatField] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<QuoteFormData>();

  // Auto-populate form with user data when logged in
  useEffect(() => {
    if (session?.user) {
      // Load saved profile from localStorage
      const savedName = localStorage.getItem('profile:name');
      const savedPhone = localStorage.getItem('profile:phone');
      const savedCompany = localStorage.getItem('profile:company');
      const savedAddress = localStorage.getItem('profile:address');
      const savedVatNumber = localStorage.getItem('profile:vatNumber');
      
      const userPhone = (session.user as any)?.phone;
      const userCompany = (session.user as any)?.company;
      
      const fullName = savedName || session.user?.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setValue('firstName', firstName);
      setValue('lastName', lastName);
      setValue('email', session.user?.email || '');
      setValue('phone', savedPhone || userPhone || '');
      setValue('company', savedCompany || userCompany || '');
      setValue('address', savedAddress || '');
      if (savedVatNumber) setValue('vatNumber', savedVatNumber);
    }
  }, [session, setValue]);

  // Watch company field to show/hide VAT (must be before early return)
  const companyValue = watch('company');
  useEffect(() => {
    if (companyValue && companyValue.trim().length >= 1) {
      setShowVatField(true);
    } else {
      setShowVatField(false);
    }
  }, [companyValue]);

  // Early return AFTER all hooks
  if (!isQuoteOpen) return null;

  const onSubmit: SubmitHandler<QuoteFormData> = async (data) => {
    setSending(true);
    setSubmitStatus(null);

    // Save form data to localStorage for future use
    if (data.firstName && data.lastName) {
      localStorage.setItem('profile:name', `${data.firstName} ${data.lastName}`);
    }
    if (data.phone) localStorage.setItem('profile:phone', data.phone);
    if (data.company) localStorage.setItem('profile:company', data.company);
    if (data.address) localStorage.setItem('profile:address', data.address);
    if (data.vatNumber) localStorage.setItem('profile:vatNumber', data.vatNumber);

    try {
      const emailData = {
        items: quoteItems,
        customer: useLoginInfo && session ? {
          name: session.user?.name || '',
          email: session.user?.email || '',
          phone: data.phone || '',
          company: data.company || '',
          vatNumber: data.vatNumber || '',
          address: data.address || '',
          message: data.message || ''
        } : {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone || '',
          company: data.company || '',
          vatNumber: data.vatNumber || '',
          address: data.address || '',
          message: data.message
        },
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        setSent(true);
        setSubmitStatus({ success: true, message: 'Quote request sent successfully!' });
        setTimeout(() => {
          clearQuote();
          closeQuote();
          setSent(false);
          setShowContactForm(false);
          reset();
        }, 3000);
      } else {
        throw new Error('Failed to send quote');
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: 'Failed to send quote request. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="font-bold text-lg">Request Quote</h2>
          <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-bold">
            {quoteItems.length}
          </span>
        </div>
        <button onClick={closeQuote} className="hover:bg-primary-dark p-1 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Message */}
      {submitStatus && (
        <div className={`px-4 py-3 ${submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} text-sm`}>
          {submitStatus.message}
        </div>
      )}

      {/* Items List */}
      {!showContactForm ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {quoteItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No items in quote list</p>
              </div>
            ) : (
              quoteItems.map(item => (
                <div key={item.sku} className="border rounded-lg p-3 space-y-2">
                  <div className="flex gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.sku}</p>
                    </div>
                    <button
                      onClick={() => removeFromQuote(item.sku)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Add notes..."
                    value={item.notes}
                    onChange={(e) => updateNotes(item.sku, e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs resize-none"
                    rows={2}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {quoteItems.length > 0 && (
            <div className="border-t p-4 space-y-3">
              {/* Save/Load Quotes */}
              <SavedQuotesManager />
              
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Quote Request
              </button>
              <button
                onClick={clearQuote}
                className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
              >
                Clear All
              </button>
            </div>
          )}
        </>
      ) : (
        /* Contact Form */
        <div className="flex-1 overflow-y-auto p-4">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quote Request Sent!</h3>
              <p className="text-gray-600">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {session && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLoginInfo}
                      onChange={(e) => setUseLoginInfo(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Use my account info ({session.user?.email})</span>
                  </label>
                </div>
              )}

              {(!session || !useLoginInfo) && (
                <>
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        {...register('firstName', { 
                          required: 'First name is required',
                          maxLength: { value: 50, message: 'Max 50 characters' }
                        })}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('lastName', { 
                        required: 'Last name is required',
                        maxLength: { value: 50, message: 'Max 50 characters' }
                      })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                  </div>
                </>
              )}

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                    placeholder="+32 xxx xx xx xx"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                    placeholder="Company name"
                  />
                </div>
              </div>

              {/* VAT Number */}
              {showVatField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    {...register('vatNumber')}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="BE0123456789"
                  />
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                    placeholder="Street, City, Postal Code"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Minimum 10 characters' }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="Tell us about your quote request..."
                />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
              </div>

              {/* Privacy Policy */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="quote-privacy"
                  {...register('privacyPolicy', { required: 'You must accept the privacy policy' })}
                  className="mt-1"
                />
                <label htmlFor="quote-privacy" className="text-xs text-gray-700">
                  I accept the <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.privacyPolicy && <p className="text-xs text-red-600">{errors.privacyPolicy.message}</p>}

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="quote-terms"
                  {...register('termsAndConditions', { required: 'You must accept the terms' })}
                  className="mt-1"
                />
                <label htmlFor="quote-terms" className="text-xs text-gray-700">
                  I accept the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a> <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.termsAndConditions && <p className="text-xs text-red-600">{errors.termsAndConditions.message}</p>}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-semibold disabled:opacity-50 text-sm"
                >
                  {sending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
