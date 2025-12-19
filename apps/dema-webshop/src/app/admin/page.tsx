'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';

interface DashboardStats {
  quotes: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
  };
  contacts: {
    total: number;
    today: number;
    new: number;
  };
  topProducts: Array<{ name: string; count: number; sku: string }>;
}

interface Quote {
  id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  items: Array<{ sku: string; name: string; quantity: number }>;
  status: string;
  totalItems: number;
  createdAt: any;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType?: string;
  message: string;
  status: string;
  createdAt: any;
}

const ADMIN_EMAILS = ['nicolas.cloet@gmail.com', 'info@demashop.be'];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'contacts'>('overview');
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !isAdmin) {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    fetchDashboardData();
  }, [session, status, isAdmin, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/dashboard?type=overview');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      
      setStats(data.stats);
      setRecentQuotes(data.recentQuotes || []);
      setRecentContacts(data.recentContacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/admin/dashboard?type=quotes&limit=100');
      const data = await res.json();
      if (res.ok) {
        setAllQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/dashboard?type=contacts&limit=100');
      const data = await res.json();
      if (res.ok) {
        setAllContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const updateStatus = async (collection: 'quotes' | 'contacts', id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, id, updates: { status } }),
      });
      
      if (res.ok) {
        // Refresh data
        if (collection === 'quotes') {
          fetchQuotes();
        } else {
          fetchContacts();
        }
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome, {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'quotes', label: 'Quotes', icon: FileText },
              { id: 'contacts', label: 'Contacts', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'quotes') fetchQuotes();
                  if (tab.id === 'contacts') fetchContacts();
                }}
                className={`flex items-center gap-2 py-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'overview' && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Quotes"
                value={stats.quotes.total}
                icon={FileText}
                color="blue"
                subtitle={`${stats.quotes.pending} pending`}
              />
              <StatCard
                title="Quotes Today"
                value={stats.quotes.today}
                icon={Calendar}
                color="green"
                subtitle={`${stats.quotes.thisWeek} this week`}
              />
              <StatCard
                title="Total Contacts"
                value={stats.contacts.total}
                icon={Users}
                color="purple"
                subtitle={`${stats.contacts.new} new`}
              />
              <StatCard
                title="Contacts Today"
                value={stats.contacts.today}
                icon={Mail}
                color="orange"
              />
            </div>

            {/* Top Products */}
            {stats.topProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Top Requested Products
                </h2>
                <div className="space-y-3">
                  {stats.topProducts.map((product, idx) => (
                    <div key={product.sku} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-primary-dark rounded-full font-bold text-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-primary-dark rounded-full font-bold">
                        {product.count} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Quotes */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Quotes
                </h2>
                {recentQuotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No quotes yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentQuotes.map(quote => (
                      <div key={quote.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{quote.customer.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{quote.customer.email}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{quote.totalItems} items</span>
                          <span>{formatDate(quote.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Contacts */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Recent Contacts
                </h2>
                {recentContacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No contacts yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentContacts.map(contact => (
                      <div key={contact.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{contact.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{contact.message}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatDate(contact.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'quotes' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">All Quotes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allQuotes.map(quote => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{quote.customer.name}</p>
                          <p className="text-sm text-gray-500">{quote.customer.email}</p>
                          {quote.customer.company && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {quote.customer.company}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{quote.totalItems} items</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {quote.items.slice(0, 2).map(i => i.name).join(', ')}
                          {quote.items.length > 2 && ` +${quote.items.length - 2} more`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={quote.status}
                          onChange={(e) => updateStatus('quotes', quote.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(quote.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="quoted">Quoted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(quote.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:text-blue-800">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allQuotes.length === 0 && (
                <p className="text-center py-12 text-gray-500">No quotes found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">All Contacts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </p>
                          {contact.phone && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.inquiryType || 'General'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {contact.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.status}
                          onChange={(e) => updateStatus('contacts', contact.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(contact.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allContacts.length === 0 && (
                <p className="text-center py-12 text-gray-500">No contacts found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-primary',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
