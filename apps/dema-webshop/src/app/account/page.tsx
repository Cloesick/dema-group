'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FiUser, FiShoppingBag, FiSettings, FiLogOut, FiChevronRight, FiFileText, FiEdit2, FiSave, FiX, FiPackage, FiMessageSquare, FiPhone, FiStar } from 'react-icons/fi';
import Link from 'next/link';
import { useQuote } from '@/contexts/QuoteContext';
import { useToast } from '@/contexts/ToastContext';
import { useLocale } from '@/contexts/LocaleContext';
import ChangePasswordModal from '@/components/account/ChangePasswordModal';
import DeleteAccountModal from '@/components/account/DeleteAccountModal';

type Order = {
  id: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferences: {
    newsletter: boolean;
    marketing: boolean;
    language: string;
    currency: string;
  };
  orders: Order[];
};

function SingleProductForm({ onSaved }: { onSaved: (msg: string) => void }) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [pdfSource, setPdfSource] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !productCategory.trim()) {
      onSaved('Please fill required fields: SKU, Name, Category');
      return;
    }
    try {
      setSubmitting(true);
      const body: any = {
        sku: sku.trim(),
        name: name.trim(),
        product_category: productCategory.trim(),
        description,
      };
      const priceNum = parseFloat(price.replace(',', '.'));
      if (!Number.isNaN(priceNum)) body.price = priceNum;
      if (pdfSource) body.pdf_source = pdfSource.trim();
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      onSaved('Product saved');
      setSku('');
      setName('');
      setProductCategory('');
      setDescription('');
      setPrice('');
      setPdfSource('');
    } catch (err: any) {
      onSaved(err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input value={sku} onChange={(e)=>setSku(e.target.value)} placeholder="SKU*" className="flex-1 border rounded p-2" />
        <button
          type="button"
          disabled={!sku || loadingExisting}
          onClick={async () => {
            try {
              setLoadingExisting(true);
              const res = await fetch(`/api/products?sku=${encodeURIComponent(sku)}`);
              const data = await res.json();
              const found = Array.isArray(data?.products) ? data.products[0] : undefined;
              if (!found) {
                onSaved('No product found for this SKU');
              } else {
                setName(found.name || '');
                setProductCategory(found.product_category || '');
                setDescription(found.description || '');
                setPrice(typeof found.price === 'number' ? String(found.price) : (found.price || ''));
                setPdfSource(found.pdf_source || '');
                onSaved('Loaded existing product');
              }
            } catch (e: any) {
              onSaved(e.message || 'Failed to load product');
            } finally {
              setLoadingExisting(false);
            }
          }}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          {loadingExisting ? 'Loading...' : 'Load'}
        </button>
      </div>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name*" className="w-full border rounded p-2" />
      <input value={productCategory} onChange={(e)=>setProductCategory(e.target.value)} placeholder="Product Category*" className="w-full border rounded p-2" />
      <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full border rounded p-2 h-24" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price (optional)" className="w-full border rounded p-2" />
        <input value={pdfSource} onChange={(e)=>setPdfSource(e.target.value)} placeholder="PDF Source URL/path (optional)" className="w-full border rounded p-2" />
      </div>
      <button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50">
        {submitting ? 'Saving...' : 'Confirm'}
      </button>
    </form>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;
  const userCompany = (session?.user as any)?.company as string | undefined;
  const userPhone = (session?.user as any)?.phone as string | undefined;
  
  // Initialize user data from session
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      newsletter: true,
      marketing: false,
      language: 'Nederlands',
      currency: 'EUR',
    },
    orders: [],
  });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    phone: '',
    address: '',
    company: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync session data to userData and load saved profile from localStorage
  React.useEffect(() => {
    if (session?.user) {
      // Load saved profile data from localStorage (overrides session defaults)
      const savedName = localStorage.getItem('profile:name');
      const savedPhone = localStorage.getItem('profile:phone');
      const savedAddress = localStorage.getItem('profile:address');
      const savedCompany = localStorage.getItem('profile:company');
      
      const name = savedName || session.user?.name || '';
      const phone = savedPhone || userPhone || '';
      const address = savedAddress || '';
      const company = savedCompany || userCompany || '';
      
      setUserData(prev => ({
        ...prev,
        name,
        email: session.user?.email || '',
        phone,
        address,
      }));
      setEditedProfile({
        name,
        phone,
        address,
        company,
      });
    }
  }, [session, userPhone, userCompany]);

  // Load preferences from localStorage
  React.useEffect(() => {
    try {
      const savedMarketing = localStorage.getItem('profile:marketing');
      const savedNewsletter = localStorage.getItem('profile:newsletter');
      const savedLanguage = localStorage.getItem('preferred-language');
      
      setUserData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          marketing: savedMarketing === 'true',
          newsletter: savedNewsletter !== 'false',
          language: savedLanguage === 'en' ? 'English' : savedLanguage === 'fr' ? 'Français' : 'Nederlands',
        },
      }));
    } catch (_) {}
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'quotes' | 'settings' | 'admin'>('overview');
  const { quoteItems, removeFromQuote, clearQuote } = useQuote();
  const { showToast } = useToast();
  const { t } = useLocale();

  const [newProductJson, setNewProductJson] = useState<string>('');
  const [bulkJson, setBulkJson] = useState<string>('');
  const [deleteSku, setDeleteSku] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  
  // Modal states
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  const handlePreferenceChange = (key: keyof UserData['preferences'], value: any) => {
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
    try {
      if (key === 'marketing') {
        localStorage.setItem('profile:marketing', value ? 'true' : 'false');
      }
      if (key === 'newsletter') {
        localStorage.setItem('profile:newsletter', value ? 'true' : 'false');
      }
      if (key === 'language') {
        const langCode = value === 'English' ? 'en' : value === 'Français' ? 'fr' : 'nl';
        localStorage.setItem('preferred-language', langCode);
      }
    } catch (_) {}
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      // Save to localStorage for now (in production, save to API/database)
      localStorage.setItem('profile:name', editedProfile.name);
      localStorage.setItem('profile:phone', editedProfile.phone);
      localStorage.setItem('profile:address', editedProfile.address);
      localStorage.setItem('profile:company', editedProfile.company);
      
      setUserData(prev => ({
        ...prev,
        name: editedProfile.name,
        phone: editedProfile.phone,
        address: editedProfile.address,
      }));
      
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      showToast('Profile updated successfully!', 'success');
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Check if user is new (no orders, no quotes)
  const isNewUser = userData.orders.length === 0 && quoteItems.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FiUser className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {session?.user?.name || userData.name || 'User'}</h1>
                  <p className="text-primary-light">{session?.user?.email || userData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {userCompany && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {userCompany}
                      </span>
                    )}
                    {userRole && (
                      <span className="text-xs uppercase tracking-wide bg-white/30 px-2 py-1 rounded font-semibold">
                        {userRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {userPhone && (
                <div className="hidden md:flex items-center text-primary-light text-sm">
                  <FiPhone className="mr-2 h-4 w-4" />
                  {userPhone}
                </div>
              )}
            </div>
          </div>

          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    activeTab === 'overview' 
                      ? 'bg-primary/10 text-primary-dark' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiUser className="mr-3 h-5 w-5" />
                  {t('account.overview')}
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    activeTab === 'orders' 
                      ? 'bg-primary/10 text-primary-dark' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiShoppingBag className="mr-3 h-5 w-5" />
                  {t('account.my_orders')}
                  {userData.orders.length > 0 && (
                    <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {userData.orders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    activeTab === 'quotes' 
                      ? 'bg-primary/10 text-primary-dark' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiFileText className="mr-3 h-5 w-5" />
                  {t('account.my_quotes')}
                  {quoteItems.length > 0 && (
                    <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {quoteItems.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    activeTab === 'settings' 
                      ? 'bg-primary/10 text-primary-dark' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiSettings className="mr-3 h-5 w-5" />
                  {t('account.settings')}
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      activeTab === 'admin' 
                        ? 'bg-primary/10 text-primary-dark' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                {status !== 'authenticated' ? (
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/account' })}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <FiLogOut className="mr-3 h-5 w-5" />
                    {t('auth.sign_in_button')}
                  </button>
                ) : (
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <FiLogOut className="mr-3 h-5 w-5" />
                    {t('auth.sign_out')}
                  </button>
                )}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Account Overview</h2>
                  
                  {/* Welcome Message for New Users */}
                  {isNewUser && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary/30 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/20 p-3 rounded-full">
                          <FiStar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DEMA Shop!</h3>
                          <p className="text-gray-600 mb-4">
                            Thank you for creating an account. Start exploring our professional equipment and request quotes for your projects.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              href="/products"
                              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition"
                            >
                              <FiPackage className="mr-2 h-4 w-4" />
                              Browse Products
                            </Link>
                            <Link
                              href="/contact"
                              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                            >
                              <FiMessageSquare className="mr-2 h-4 w-4" />
                              Contact Us
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Link
                      href="/products"
                      className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-md transition group"
                    >
                      <div className="bg-primary/20 p-3 rounded-full mb-3 group-hover:bg-primary/30 transition">
                        <FiPackage className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Browse Products</span>
                    </Link>
                    <Link
                      href="/contact?subject=quote"
                      className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition group"
                    >
                      <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:bg-green-200 transition">
                        <FiFileText className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Request Quote</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition group"
                    >
                      <div className="bg-purple-100 p-3 rounded-full mb-3 group-hover:bg-purple-200 transition">
                        <FiMessageSquare className="h-6 w-6 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Get Support</span>
                    </Link>
                    <a
                      href="tel:+3251205141"
                      className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition group"
                    >
                      <div className="bg-orange-100 p-3 rounded-full mb-3 group-hover:bg-orange-200 transition">
                        <FiPhone className="h-6 w-6 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Call Us</span>
                    </a>
                  </div>

                  {/* Profile Message */}
                  {profileMessage && (
                    <div className={`mb-4 p-3 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {profileMessage.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information - Editable */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                        {!isEditingProfile ? (
                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <FiEdit2 className="h-4 w-4" />
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={handleSaveProfile}
                              disabled={profileSaving}
                              className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                            >
                              <FiSave className="h-4 w-4" />
                              {profileSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              onClick={() => {
                                setIsEditingProfile(false);
                                setEditedProfile({
                                  name: userData.name,
                                  phone: userData.phone,
                                  address: userData.address,
                                  company: userCompany || '',
                                });
                              }}
                              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            >
                              <FiX className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {!isEditingProfile ? (
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Name</span>
                            <p className="text-gray-900 font-medium">{userData.name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
                            <p className="text-gray-700">{userData.email || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                            <p className="text-gray-700">{userData.phone || '-'}</p>
                          </div>
                          {(userCompany || editedProfile.company) && (
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Company</span>
                              <p className="text-gray-700">{editedProfile.company || userCompany}</p>
                            </div>
                          )}
                          {userData.address && (
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Address</span>
                              <p className="text-gray-700">{userData.address}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                            <input
                              type="text"
                              value={editedProfile.name}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                            <input
                              type="email"
                              value={userData.email}
                              disabled
                              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
                            <input
                              type="tel"
                              value={editedProfile.phone}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Company</label>
                            <input
                              type="text"
                              value={editedProfile.company}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, company: e.target.value }))}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shipping Address - Editable */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                        {!isEditingProfile ? (
                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <FiEdit2 className="h-4 w-4" />
                            Edit
                          </button>
                        ) : null}
                      </div>
                      
                      {!isEditingProfile ? (
                        <div>
                          {userData.address ? (
                            <p className="text-gray-700">{userData.address}</p>
                          ) : (
                            <p className="text-gray-400 italic">No address saved yet</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">Full Address</label>
                          <textarea
                            value={editedProfile.address}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            placeholder="Street, City, Postal Code, Country"
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          />
                        </div>
                      )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                      
                      {userData.orders.length === 0 && quoteItems.length === 0 ? (
                        <div className="text-center py-8">
                          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                          <p className="mt-2 text-gray-500">No recent activity</p>
                          <p className="text-sm text-gray-400">Your orders and quotes will appear here</p>
                        </div>
                      ) : (
                        <>
                          {userData.orders.slice(0, 2).map((order) => (
                            <div key={order.id} className="border-b border-gray-200 py-4 last:border-b-0 last:pb-0">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">Order #{order.id}</p>
                                  <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                  <p className="text-sm">
                                    Status: <span className="font-medium">{order.status}</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">€{order.total.toFixed(2)}</p>
                                  <Link href={`/account/orders/${order.id}`} className="text-sm text-primary hover:text-primary-dark">
                                    View Order
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {quoteItems.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">Active Quote</p>
                                  <p className="text-sm text-gray-500">{quoteItems.length} items in your quote basket</p>
                                </div>
                                <button
                                  onClick={() => setActiveTab('quotes')}
                                  className="text-sm text-primary hover:text-primary-dark"
                                >
                                  View Quote <FiChevronRight className="inline h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {userData.orders.length > 0 && (
                        <div className="mt-4">
                          <button 
                            onClick={() => setActiveTab('orders')}
                            className="text-sm text-primary hover:text-primary-dark"
                          >
                            View All Orders <FiChevronRight className="inline h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">My Orders</h2>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {userData.orders.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {userData.orders.map((order) => (
                          <div key={order.id} className="p-6 hover:bg-gray-50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div className="mb-4 sm:mb-0">
                                <p className="font-medium text-gray-900">Order #{order.id}</p>
                                <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">€{order.total.toFixed(2)}</p>
                                <p className={`text-sm ${
                                  order.status === 'Delivered' ? 'text-green-600' : 
                                  order.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {order.status}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 border-t border-gray-100 pt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                              <div className="space-y-4">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover object-center"
                                      />
                                    </div>
                                    <div className="ml-4 flex-1">
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">€{item.price.toFixed(2)}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <Link 
                                href={`/account/orders/${order.id}`}
                                className="text-sm font-medium text-primary hover:text-primary-dark"
                              >
                                View Order Details <FiChevronRight className="inline h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                        <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
                        <div className="mt-6">
                          <Link
                            href="/products"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'quotes' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-gray-900">My Quotes</h2>
                    {quoteItems.length > 0 && (
                      <button
                        onClick={() => { clearQuote(); showToast('Quote cleared', 'info'); }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Clear All Quotes
                      </button>
                    )}
                  </div>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {quoteItems.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {quoteItems.map((item) => (
                          <div key={item.sku} className="p-6">
                            <div className="flex items-start space-x-4">
                              {(item as any).image && (
                                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                                  <img
                                    src={(item as any).image}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                      {item.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                      SKU: {item.sku}
                                    </p>
                                    {item.category && (
                                      <p className="mt-1 text-sm text-gray-500">
                                        Category: {item.category}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-medium text-gray-900">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                
                                {(item as any).specifications && (item as any).specifications.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {(item as any).specifications.slice(0, 4).map((spec: any, idx: number) => (
                                        <div key={idx} className="text-sm">
                                          <span className="text-gray-500">{spec.key}:</span>{' '}
                                          <span className="text-gray-900">{spec.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 flex items-center space-x-4">
                                  <button
                                    onClick={() => removeFromQuote(item.sku)}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                  >
                                    Remove
                                  </button>
                                  <Link
                                    href={`/catalog/${item.sku.toLowerCase()}`}
                                    className="text-sm text-primary hover:text-primary-dark font-medium"
                                  >
                                    View Product
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="bg-gray-50 px-6 py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">
                                Total Items: <span className="font-semibold text-gray-900">{quoteItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Unique Products: <span className="font-semibold text-gray-900">{quoteItems.length}</span>
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <Link
                                href="/contact?subject=quote"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                Request Quote
                              </Link>
                              <button
                                onClick={() => {
                                  const quoteData = quoteItems.map(item => ({
                                    sku: item.sku,
                                    name: item.name,
                                    quantity: item.quantity,
                                    category: item.category,
                                  }));
                                  const blob = new Blob([JSON.stringify(quoteData, null, 2)], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `quote-${new Date().toISOString().split('T')[0]}.json`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                Export Quote
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes</h3>
                        <p className="mt-1 text-sm text-gray-500">You haven't added any products to your quote list yet.</p>
                        <div className="mt-6">
                          <Link
                            href="/products"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            Browse Products
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Account Settings</h2>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-base font-medium text-gray-900 mb-4">Email Preferences</h3>
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="newsletter"
                                  name="newsletter"
                                  type="checkbox"
                                  checked={userData.preferences.newsletter}
                                  onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="newsletter" className="font-medium text-gray-700">
                                  Subscribe to newsletter
                                </label>
                                <p className="text-gray-500">Get the latest news and offers</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="marketing"
                                  name="marketing"
                                  type="checkbox"
                                  checked={userData.preferences.marketing}
                                  onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="marketing" className="font-medium text-gray-700">
                                  Receive marketing communications
                                </label>
                                <p className="text-gray-500">Get personalized product recommendations and promotions</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-base font-medium text-gray-900 mb-4">Account Preferences</h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                                Language
                              </label>
                              <select
                                id="language"
                                name="language"
                                value={userData.preferences.language}
                                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                              >
                                <option>English</option>
                                <option>Nederlands</option>
                                <option>Français</option>
                                <option>Deutsch</option>
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                Currency
                              </label>
                              <select
                                id="currency"
                                name="currency"
                                value={userData.preferences.currency}
                                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                              >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="GBP">British Pound (£)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-base font-medium text-gray-900 mb-4">Account Actions</h3>
                          <div className="space-y-4">
                            <button 
                              onClick={() => setIsChangePasswordModalOpen(true)}
                              className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              Change Password
                            </button>
                            <button 
                              onClick={() => setIsDeleteAccountModalOpen(true)}
                              className="ml-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && userRole === 'admin' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Admin</h2>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6 space-y-6">
                      {message && (
                        <div className="text-sm text-green-700">{message}</div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h3 className="text-base font-medium text-gray-900">Add/Update Single Product</h3>
                          <SingleProductForm onSaved={(msg) => setMessage(msg)} />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-base font-medium text-gray-900">Bulk Add/Update (Array JSON)</h3>
                          <textarea
                            value={bulkJson}
                            onChange={(e) => setBulkJson(e.target.value)}
                            className="w-full border rounded p-2 h-40"
                            placeholder='[{"sku":"A"},{"sku":"B"}] or {"products":[...]}'
                          />
                          <button
                            onClick={async () => {
                              try {
                                setMessage('');
                                const res = await fetch('/api/products', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: bulkJson,
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Failed');
                                setMessage('Bulk saved');
                                setBulkJson('');
                              } catch (e: any) {
                                setMessage(e.message || 'Error');
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h3 className="text-base font-medium text-gray-900">Delete Product by SKU</h3>
                          <input
                            value={deleteSku}
                            onChange={(e) => setDeleteSku(e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="SKU"
                          />
                          <button
                            onClick={async () => {
                              try {
                                setMessage('');
                                if (!deleteSku) throw new Error('SKU required');
                                const res = await fetch(`/api/products/${encodeURIComponent(deleteSku)}`, {
                                  method: 'DELETE',
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Failed');
                                setMessage('Deleted');
                                setDeleteSku('');
                              } catch (e: any) {
                                setMessage(e.message || 'Error');
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-base font-medium text-gray-900">Upload PDF (goes to categories)</h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              try {
                                setUploading(true);
                                setMessage('');
                                const input = (e.currentTarget.elements.namedItem('file') as HTMLInputElement);
                                if (!input?.files || !input.files[0]) throw new Error('File required');
                                const fd = new FormData();
                                fd.set('file', input.files[0]);
                                fd.set('filename', input.files[0].name);
                                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Failed');
                                setMessage(`Uploaded: ${data.path}`);
                                input.value = '';
                              } catch (e: any) {
                                setMessage(e.message || 'Error');
                              } finally {
                                setUploading(false);
                              }
                            }}
                            className="space-y-3"
                          >
                            <input name="file" type="file" accept="application/pdf" className="w-full" />
                            <button
                              type="submit"
                              disabled={uploading}
                              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                            >
                              {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </div>
  );
}
