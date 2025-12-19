'use client';

import { useState, useEffect } from 'react';
import { useQuote } from '@/contexts/QuoteContext';
import { FileText, Send, CheckCircle, Trash2, Plus, Minus, Package, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Product categories for quick selection
const PRODUCT_CATEGORIES = [
  { id: 'pumps', name: 'Pompen', nameEN: 'Pumps', icon: '💧' },
  { id: 'pipes', name: 'Buizen & Fittingen', nameEN: 'Pipes & Fittings', icon: '🔧' },
  { id: 'hoses', name: 'Slangen & Koppelingen', nameEN: 'Hoses & Couplings', icon: '🔗' },
  { id: 'tools', name: 'Gereedschap', nameEN: 'Tools', icon: '🛠️' },
  { id: 'compressors', name: 'Perslucht', nameEN: 'Compressed Air', icon: '💨' },
  { id: 'other', name: 'Andere', nameEN: 'Other', icon: '📦' },
];

// Business sectors
const BUSINESS_SECTORS = [
  { id: 'agriculture', name: 'Landbouw & Tuinbouw', nameEN: 'Agriculture & Horticulture' },
  { id: 'construction', name: 'Bouw & Renovatie', nameEN: 'Construction & Renovation' },
  { id: 'industry', name: 'Industrie & Productie', nameEN: 'Industry & Manufacturing' },
  { id: 'plumbing', name: 'Sanitair & Installatie', nameEN: 'Plumbing & Installation' },
  { id: 'food', name: 'Voeding & Horeca', nameEN: 'Food & Hospitality' },
  { id: 'municipal', name: 'Gemeente & Overheid', nameEN: 'Municipal & Government' },
  { id: 'retail', name: 'Retail & Handel', nameEN: 'Retail & Trade' },
  { id: 'other', name: 'Andere', nameEN: 'Other' },
];

export default function QuoteRequestPage() {
  const { quoteItems, clearQuote } = useQuote();
  const [formData, setFormData] = useState({
    // Customer type
    customerType: 'business',
    existingCustomer: 'no',
    
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Business info (if applicable)
    companyName: '',
    vatNumber: '',
    businessSector: '',
    
    // Product interest (for quotes without cart items)
    productCategory: '',
    productDescription: '',
    estimatedQuantity: '',
    urgency: 'normal',
    
    // Address
    address: '',
    postalCode: '',
    city: '',
    country: 'Belgium',
    
    // Comments
    comments: '',
    preferredContact: 'email',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // User search state
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<Array<{ email: string; name: string; company: string; phone: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ email: string; name: string; company: string; phone: string } | null>(null);

  // Auto-populate form with logged-in user data and localStorage
  useEffect(() => {
    // Load saved profile from localStorage (works for both logged-in and guest users)
    const savedName = localStorage.getItem('profile:name');
    const savedPhone = localStorage.getItem('profile:phone');
    const savedCompany = localStorage.getItem('profile:company');
    const savedAddress = localStorage.getItem('profile:address');
    const savedVatNumber = localStorage.getItem('profile:vatNumber');
    const savedPostalCode = localStorage.getItem('profile:postalCode');
    const savedCity = localStorage.getItem('profile:city');
    const savedCountry = localStorage.getItem('profile:country');
    const savedBusinessSector = localStorage.getItem('profile:businessSector');
    const savedPreferredContact = localStorage.getItem('profile:preferredContact');
    const savedCustomerType = localStorage.getItem('profile:customerType');
    
    if (session?.user) {
      const userPhone = (session.user as any)?.phone;
      const userCompany = (session.user as any)?.company;
      
      const fullName = savedName || session.user?.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: session.user?.email || '',
        phone: savedPhone || userPhone || '',
        companyName: savedCompany || userCompany || '',
        vatNumber: savedVatNumber || '',
        address: savedAddress || '',
        postalCode: savedPostalCode || '',
        city: savedCity || '',
        country: savedCountry || 'Belgium',
        businessSector: savedBusinessSector || '',
        preferredContact: savedPreferredContact || 'email',
        customerType: savedCustomerType || (savedCompany || userCompany) ? 'business' : prev.customerType,
      }));
    } else if (savedName || savedPhone || savedCompany) {
      // Load from localStorage for guest users
      const nameParts = (savedName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        phone: savedPhone || '',
        companyName: savedCompany || '',
        vatNumber: savedVatNumber || '',
        address: savedAddress || '',
        postalCode: savedPostalCode || '',
        city: savedCity || '',
        country: savedCountry || 'Belgium',
        businessSector: savedBusinessSector || '',
        preferredContact: savedPreferredContact || 'email',
        customerType: savedCustomerType || (savedCompany ? 'business' : prev.customerType),
      }));
    }
  }, [session]);

  // Search for existing users (admin only)
  useEffect(() => {
    if (!isAdmin || formData.existingCustomer !== 'yes' || userSearchQuery.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(userSearchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setUserSearchResults(data.users || []);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [userSearchQuery, isAdmin, formData.existingCustomer]);

  // Handle user selection
  const handleSelectUser = (user: { email: string; name: string; company: string; phone: string }) => {
    setSelectedUser(user);
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setFormData(prev => ({
      ...prev,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      companyName: user.company,
      customerType: user.company ? 'business' : 'private',
    }));
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Save form data to localStorage for future use
    if (formData.firstName && formData.lastName) {
      localStorage.setItem('profile:name', `${formData.firstName} ${formData.lastName}`);
    }
    if (formData.phone) localStorage.setItem('profile:phone', formData.phone);
    if (formData.companyName) localStorage.setItem('profile:company', formData.companyName);
    if (formData.address) localStorage.setItem('profile:address', formData.address);
    if (formData.vatNumber) localStorage.setItem('profile:vatNumber', formData.vatNumber);
    if (formData.postalCode) localStorage.setItem('profile:postalCode', formData.postalCode);
    if (formData.city) localStorage.setItem('profile:city', formData.city);
    if (formData.country) localStorage.setItem('profile:country', formData.country);
    if (formData.businessSector) localStorage.setItem('profile:businessSector', formData.businessSector);
    if (formData.preferredContact) localStorage.setItem('profile:preferredContact', formData.preferredContact);
    if (formData.customerType) localStorage.setItem('profile:customerType', formData.customerType);

    try {
      const response = await fetch('/api/quote/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          products: quoteItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const result = await response.json();
      
      setIsSuccess(true);
      clearQuote();
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          customerType: 'private',
          existingCustomer: 'no',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          companyName: '',
          vatNumber: '',
          businessSector: '',
          productCategory: '',
          productDescription: '',
          estimatedQuantity: '',
          urgency: 'normal',
          address: '',
          postalCode: '',
          city: '',
          country: 'Belgium',
          comments: '',
          preferredContact: 'email',
        });
        setIsSuccess(false);
      }, 5000);
      
    } catch (err) {
      setError('Failed to submit quote request. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Sent!</h2>
          <p className="text-gray-600 mb-4">
            Your quote request has been successfully submitted. We'll send you a detailed quote via email shortly.
          </p>
          <p className="text-sm text-gray-500">
            You will receive a copy at: <strong>{formData.email}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Request a Quote</h1>
              <p className="text-blue-100">Get a customized quote for your selected products</p>
            </div>
          </div>
          
          {quoteItems.length > 0 && (
            <div className="bg-white/10 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">Products in your quote ({quoteItems.length}):</h3>
              <div className="space-y-1">
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    • {item.name} - Quantity: {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Customer Type */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Customer Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type *
                </label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="private">Private Customer</option>
                  <option value="business">Business Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Customer?
                </label>
                <select
                  name="existingCustomer"
                  value={formData.existingCustomer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            {/* User Search (Admin only, when Existing Customer = Yes) */}
            {isAdmin && formData.existingCustomer === 'yes' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-600" />
                  Search Existing Customer
                </h3>
                {selectedUser ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedUser.name}</p>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        {selectedUser.company && (
                          <p className="text-sm text-gray-500">{selectedUser.company}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setFormData(prev => ({
                          ...prev,
                          firstName: '',
                          lastName: '',
                          email: '',
                          phone: '',
                          companyName: '',
                        }));
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or company..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {userSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {userSearchResults.map((user) => (
                          <button
                            key={user.email}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.company && (
                              <p className="text-sm text-gray-400">{user.company}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {userSearchQuery.length >= 2 && !isSearching && userSearchResults.length === 0 && (
                      <p className="mt-2 text-sm text-gray-500">No customers found matching "{userSearchQuery}"</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Business Info */}
            {formData.customerType === 'business' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required={formData.customerType === 'business'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleInputChange}
                      placeholder="BE 0123.456.789"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Sector
                    </label>
                    <select
                      name="businessSector"
                      value={formData.businessSector}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select sector...</option>
                      {BUSINESS_SECTORS.map(sector => (
                        <option key={sector.id} value={sector.id}>{sector.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Product Interest - shown when no cart items */}
          {quoteItems.length === 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                <Package className="inline-block w-5 h-5 mr-2" />
                Product Interest
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                No products in your quote basket? Tell us what you're looking for and we'll prepare a custom quote.
              </p>
              
              {/* Product Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, productCategory: cat.id }))}
                      className={`p-3 rounded-lg border-2 text-left transition ${
                        formData.productCategory === cat.id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <p className="font-medium text-sm mt-1">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you need *
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  rows={3}
                  required={quoteItems.length === 0}
                  placeholder="E.g., I need a submersible pump for agricultural irrigation, 50m³/h capacity..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Quantity
                  </label>
                  <input
                    type="text"
                    name="estimatedQuantity"
                    value={formData.estimatedQuantity}
                    onChange={handleInputChange}
                    placeholder="E.g., 10 units, 100 meters..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low - Within a month</option>
                    <option value="normal">Normal - Within 2 weeks</option>
                    <option value="high">High - Within a week</option>
                    <option value="urgent">Urgent - ASAP</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments / Special Requests
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Any additional information or special requests..."
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (quoteItems.length === 0 && !formData.productDescription)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating Quote...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Request Quote
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            By submitting this form, you agree to receive a quote via email from DEMA-SHOP
          </p>
        </form>
      </div>
    </div>
  );
}
