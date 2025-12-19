'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<'verify' | 'confirm' | 'final'>('verify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verification step
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Final confirmation
  const [confirmText, setConfirmText] = useState('');

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify email and phone
      const response = await fetch('/api/account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Verification failed');
        } else {
          throw new Error('Verification failed');
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();

      if (data.verified) {
        setStep('confirm');
        setError('');
      } else {
        setError('Email or phone number does not match our records');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    setStep('final');
    setError('');
  };

  const handleFinalDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          confirmation: confirmText,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Account deletion failed');
        } else {
          throw new Error('Account deletion failed');
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();

      // Sign out and redirect
      await signOut({ callbackUrl: '/?deleted=true' });
    } catch (err: any) {
      setError(err.message || 'Account deletion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('verify');
    setEmail('');
    setPhone('');
    setConfirmText('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={step !== 'final' ? handleClose : undefined}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-600">
              {step === 'verify' && 'Verify Your Identity'}
              {step === 'confirm' && 'Delete Account'}
              {step === 'final' && 'Final Confirmation'}
            </h2>
            {step !== 'final' && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Warning:</strong> Deleting your account is permanent and cannot be undone.
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                For security, please verify your email address and phone number.
              </p>

              <div>
                <label htmlFor="delete-verify-email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="delete-verify-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={session?.user?.email || ''}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="delete-verify-phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="delete-verify-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+32 XXX XX XX XX"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleDeleteConfirmation} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  This action will permanently delete:
                </h3>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Your account profile</li>
                  <li>All your order history</li>
                  <li>Your saved quotes</li>
                  <li>All personal data</li>
                  <li>Your preferences and settings</li>
                </ul>
              </div>

              <div>
                <label htmlFor="confirm-delete" className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm:
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Proceed to Delete
                </button>
              </div>
            </form>
          )}

          {step === 'final' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-red-700">
                  This is your last chance. Once you click "Delete Account", there is no way to recover your data.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel - Keep My Account
                </button>
                <button
                  onClick={handleFinalDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Deleting...' : 'Delete Account Permanently'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
