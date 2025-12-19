'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PdfUpload {
  id: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  uploadedAt: string;
  status: string;
  publicUrl: string;
}

export default function PdfManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploads, setUploads] = useState<PdfUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    checkVerification();
    fetchUploads();
  }, [session]);

  async function checkVerification() {
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
      setVerified(data.verified && data.canUploadPdfs);
      
      if (!data.verified) {
        setTimeout(() => {
          router.push('/account/employee');
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUploads() {
    try {
      const response = await fetch('/api/pdf/upload');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();
      if (data.uploads) {
        setUploads(data.uploads);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  async function handleFile(file: File) {
    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('compressionLevel', compressionLevel);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        } else {
          throw new Error('Upload failed');
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${file.name} uploaded successfully!`);
        await fetchUploads(); // Refresh list
        
        // Reset after 3 seconds
        setTimeout(() => {
          setMessage('');
          setUploadProgress(0);
        }, 3000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload PDF. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (status === 'loading' || loading) {
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
          <p className="text-gray-600 mb-6">Please log in to manage PDFs.</p>
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

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold">Verification Required</h2>
            <p className="mt-2 text-gray-600">
              You must verify your employee status before uploading PDFs.
            </p>
            <p className="mt-4 text-sm text-gray-500">Redirecting to verification page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="text-primary hover:text-primary-dark text-sm mb-2 inline-block">
            ← Back to Account
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">PDF Management</h1>
          <p className="text-gray-600 mt-2">Upload and compress PDF catalogs</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Upload New PDF</h2>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
              disabled={uploading}
            />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag & drop your PDF here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <button
                  type="button"
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Select PDF File
                </button>
                <p className="text-xs text-gray-400 mt-4">Maximum file size: 50MB</p>
              </div>
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Compression Options (for future implementation) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Compression Level (Coming Soon)
            </label>
            <div className="flex gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="compression"
                    value={level}
                    checked={compressionLevel === level}
                    onChange={(e) => setCompressionLevel(e.target.value)}
                    disabled
                    className="mr-2"
                  />
                  <span className="text-sm capitalize text-gray-400">{level}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Automatic compression will be available in the next update
            </p>
          </div>
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Upload History</h2>
          
          {uploads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No PDFs uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{upload.filename}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>📄 {formatFileSize(upload.originalSize)}</span>
                        <span>📅 {formatDate(upload.uploadedAt)}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          upload.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {upload.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={upload.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
                      >
                        View
                      </a>
                      <a
                        href={upload.publicUrl}
                        download
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
