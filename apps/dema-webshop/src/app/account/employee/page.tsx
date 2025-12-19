'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: string;
  employeeId?: string;
}

interface VerificationStatus {
  verified: boolean;
  employee: EmployeeData | null;
  canUploadPdfs: boolean;
}

export default function EmployeeVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  // Check verification status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, [session]);

  async function checkVerificationStatus() {
    if (!session) {
      setChecking(false);
      return;
    }

    try {
      const response = await fetch('/api/employee/verify');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();
      setVerificationStatus(data);
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setChecking(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/employee/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Verification failed');
        } else {
          throw new Error('Verification failed');
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Employee verified successfully!');
        setVerificationStatus({
          verified: true,
          employee: data.employee,
          canUploadPdfs: data.canUploadPdfs
        });
        
        // Redirect to PDF upload page after 2 seconds
        setTimeout(() => {
          router.push('/account/pdfs');
        }, 2000);
      } else {
        setError(data.error || data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Failed to verify employee ID. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to verify your employee status.</p>
          <Link 
            href="/login"
            className="block w-full text-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // Already verified
  if (verificationStatus?.verified) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Employee Verified ✅</h2>
                <p className="text-gray-600">You have access to employee features</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-lg text-gray-900">{verificationStatus.employee?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-lg text-gray-900">{verificationStatus.employee?.email}</dd>
                </div>
                {verificationStatus.employee?.department && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="mt-1 text-lg text-gray-900">{verificationStatus.employee.department}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {verificationStatus.employee?.role}
                    </span>
                  </dd>
                </div>
                {verificationStatus.employee?.employeeId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                    <dd className="mt-1 text-lg font-mono text-gray-900">{verificationStatus.employee.employeeId}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Available Features</h3>
              <div className="space-y-3">
                <Link
                  href="/account/pdfs"
                  className="block w-full bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark text-center font-medium transition-colors"
                >
                  📄 Upload & Manage PDFs
                </Link>
                <Link
                  href="/account"
                  className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 text-center font-medium transition-colors"
                >
                  ← Back to Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not verified yet - show verification form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Verification</h2>
            <p className="text-gray-600">Enter your Dema employee ID to verify your account</p>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g., DEMA2024001"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Contact your manager if you don't know your employee ID
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !employeeId}
              className="w-full bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Employee ID'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/account"
              className="text-sm text-primary hover:text-primary-dark"
            >
              ← Back to Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
