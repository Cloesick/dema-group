'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      // TODO: Implement actual authentication
      if (email === 'admin@dema-group.com' && password === 'admin123') {
        router.push('/compliance/deployments');
      } else {
        setFormError('Invalid email or password');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
          aria-label="Login form"
          aria-describedby="form-description"
          noValidate
          role="form"
        >
          <div id="form-description" className="sr-only">
            Sign in to your DEMA Group account to access your personalized dashboard, order history, and preferences.
          </div>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email-input"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`block w-full rounded-lg border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${emailError ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-blue-500'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                aria-label="Email address"
              />
              {emailError && (
                <div
                  className="mt-1 text-sm text-red-600"
                  id="email-error"
                  role="alert"
                  aria-live="polite"
                >
                  {emailError}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`block w-full rounded-lg border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${passwordError ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-blue-500'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
                aria-label="Password"
              />
              {passwordError && (
                <div id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {passwordError}
                </div>
              )}
            </div>
          </div>

          <div>
            {formError && (
              <div 
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" 
                role="alert"
                id="form-error"
                aria-describedby="form-error-desc"
              >
                <p id="form-error-desc" className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!email || !password}
              aria-label="Sign in to your account"
              aria-describedby={formError ? 'form-error' : undefined}
            >
              Sign in
            </button>
            <div id="email-description" className="sr-only">
              Enter the email address associated with your account
            </div>
            <div id="password-description" className="sr-only">
              Enter your account password
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
