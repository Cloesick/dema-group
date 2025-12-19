'use client';

import { useQuote } from '@/contexts/QuoteContext';
import { X, FileText, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { getFirebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebaseClient';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin } from 'react-icons/fi';

export default function QuoteList() {
  const { quoteItems, isQuoteOpen, closeQuote, removeFromQuote, updateQuantity, updateNotes, clearQuote } = useQuote();
  const { data: session } = useSession();
  const [showContactForm, setShowContactForm] = useState(false);
  const [useLoginInfo, setUseLoginInfo] = useState(true);

  // Reset to product list view when quote panel opens
  useEffect(() => {
    if (isQuoteOpen) {
      setShowContactForm(false);
      setSent(false);
    }
  }, [isQuoteOpen]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  // Auto-populate form with user data when logged in
  useEffect(() => {
    if (session?.user) {
      // Load saved profile from localStorage
      const savedName = localStorage.getItem('profile:name');
      const savedPhone = localStorage.getItem('profile:phone');
      const savedCompany = localStorage.getItem('profile:company');
      
      const userPhone = (session.user as any)?.phone;
      const userCompany = (session.user as any)?.company;
      
      setFormData(prev => ({
        ...prev,
        name: savedName || session.user?.name || '',
        email: session.user?.email || '',
        phone: savedPhone || userPhone || '',
        company: savedCompany || userCompany || '',
      }));
    }
  }, [session]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isQuoteOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Save form data to localStorage for future use
    if (formData.name) localStorage.setItem('profile:name', formData.name);
    if (formData.phone) localStorage.setItem('profile:phone', formData.phone);
    if (formData.company) localStorage.setItem('profile:company', formData.company);

    const emailData = {
      items: quoteItems,
      customer: useLoginInfo && session ? {
        name: session.user?.name,
        email: session.user?.email
      } : formData,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          clearQuote();
          closeQuote();
          setSent(false);
          setShowContactForm(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending quote:', error);
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
            <div className="border-t p-4 space-y-2">
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
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quote Request Sent!</h3>
              <p className="text-gray-600">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <input
                    type="text"
                    placeholder="Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </>
              )}

              <textarea
                placeholder="Additional message..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg resize-none"
                rows={4}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-semibold disabled:opacity-50"
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
