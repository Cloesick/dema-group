'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Bell, 
  Settings,
  LogOut,
  ChevronRight,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  FileText,
  Download,
  Eye,
  RotateCcw
} from 'lucide-react'
import type { Customer, Order, ShoppingList } from '@/types'

// =============================================================================
// CUSTOMER ACCOUNT DASHBOARD - BLUEPRINT
// =============================================================================
// Features:
// - Account overview with quick stats
// - Recent orders with status
// - Shopping lists / favorites
// - Address management
// - Payment methods
// - Notification preferences
// - Account settings
// =============================================================================

// Mock customer data - Replace with auth context/API
const mockCustomer: Customer = {
  id: 'cust-001',
  type: 'business',
  email: 'john.doe@company.be',
  passwordHash: '',
  status: 'active',
  company: {
    name: 'ABC Industries BVBA',
    vatNumber: 'BE0123456789',
    chamberOfCommerce: '0123.456.789',
    industry: 'Manufacturing',
    employeeCount: '50-100'
  },
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+32 123 45 67 89',
    mobile: '+32 456 78 90 12',
    position: 'Purchasing Manager'
  },
  addresses: [
    {
      id: 'addr-1',
      type: 'both',
      name: 'Hoofdkantoor',
      company: 'ABC Industries BVBA',
      street: 'Industrielaan 100',
      city: 'Antwerpen',
      postalCode: '2000',
      country: 'Belgium',
      countryCode: 'BE',
      phone: '+32 123 45 67 89',
      isDefault: true
    },
    {
      id: 'addr-2',
      type: 'shipping',
      name: 'Magazijn',
      company: 'ABC Industries BVBA',
      street: 'Havenweg 50',
      city: 'Antwerpen',
      postalCode: '2030',
      country: 'Belgium',
      countryCode: 'BE',
      isDefault: false
    }
  ],
  defaultBillingAddressId: 'addr-1',
  defaultShippingAddressId: 'addr-2',
  priceGroup: 'dealer-a',
  creditLimit: 50000,
  paymentTerms: 'NET30',
  preferences: {
    language: 'nl',
    currency: 'EUR',
    emailNotifications: {
      orders: true,
      shipping: true,
      promotions: false,
      priceChanges: true,
      backInStock: true
    },
    defaultShippingMethod: 'standard'
  },
  createdAt: '2023-01-15',
  updatedAt: '2024-01-10',
  lastLoginAt: '2024-01-10T14:30:00Z'
}

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-2024-0001',
    customerId: 'cust-001',
    companyId: 'dema',
    status: 'delivered',
    orderDate: '2024-01-08',
    estimatedDeliveryDate: '2024-01-10',
    actualDeliveryDate: '2024-01-10',
    items: [
      { id: '1', productId: 'pump-001', sku: 'DEMA-CP-100', name: 'Centrifugal Pump CP-100', quantity: 2, quantityShipped: 2, unitPrice: 1250, discount: 0, total: 2500, status: 'delivered' },
      { id: '2', productId: 'seal-001', sku: 'DEMA-SEAL-01', name: 'Mechanical Seal Kit', quantity: 4, quantityShipped: 4, unitPrice: 85, discount: 0, total: 340, status: 'delivered' },
    ],
    subtotal: 2840,
    discount: 142,
    shipping: 25,
    tax: 571.38,
    total: 3294.38,
    currency: 'EUR',
    billingAddress: mockCustomer.addresses[0],
    shippingAddress: mockCustomer.addresses[1],
    shippingMethod: 'standard',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    paymentMethod: 'invoice',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2024-0001',
    invoiceUrl: '/invoices/INV-2024-0001.pdf',
    customerReference: 'PO-12345',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-10T16:30:00Z'
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-2024-0002',
    customerId: 'cust-001',
    companyId: 'dema',
    status: 'shipped',
    orderDate: '2024-01-12',
    estimatedDeliveryDate: '2024-01-15',
    items: [
      { id: '1', productId: 'valve-001', sku: 'FLX-BV-50', name: 'Ball Valve DN50', quantity: 10, quantityShipped: 10, unitPrice: 125, discount: 10, total: 1125, status: 'shipped' },
    ],
    subtotal: 1125,
    discount: 112.50,
    shipping: 15,
    tax: 215.78,
    total: 1243.28,
    currency: 'EUR',
    billingAddress: mockCustomer.addresses[0],
    shippingAddress: mockCustomer.addresses[1],
    shippingMethod: 'express',
    trackingNumber: '1Z999AA10123456785',
    carrier: 'DHL',
    paymentMethod: 'invoice',
    paymentStatus: 'pending',
    customerReference: 'PO-12346',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z'
  },
  {
    id: 'ord-003',
    orderNumber: 'ORD-2024-0003',
    customerId: 'cust-001',
    companyId: 'dema',
    status: 'processing',
    orderDate: '2024-01-14',
    estimatedDeliveryDate: '2024-01-18',
    items: [
      { id: '1', productId: 'hose-001', sku: 'DEMA-IH-25', name: 'Industrial Hose 25mm', quantity: 50, quantityShipped: 0, unitPrice: 12.50, discount: 0, total: 625, status: 'pending' },
      { id: '2', productId: 'coupling-001', sku: 'DEMA-QC-25', name: 'Quick Coupling 25mm', quantity: 20, quantityShipped: 0, unitPrice: 18.75, discount: 0, total: 375, status: 'pending' },
    ],
    subtotal: 1000,
    discount: 0,
    shipping: 20,
    tax: 214.20,
    total: 1234.20,
    currency: 'EUR',
    billingAddress: mockCustomer.addresses[0],
    shippingAddress: mockCustomer.addresses[1],
    shippingMethod: 'standard',
    paymentMethod: 'invoice',
    paymentStatus: 'pending',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T14:00:00Z'
  }
]

const mockShoppingLists: ShoppingList[] = [
  {
    id: 'list-001',
    customerId: 'cust-001',
    name: 'Standaard onderdelen',
    description: 'Regelmatig bestelde onderdelen',
    isDefault: true,
    items: [
      { id: '1', productId: 'seal-001', quantity: 10, addedAt: '2024-01-01' },
      { id: '2', productId: 'gasket-001', quantity: 20, addedAt: '2024-01-01' },
      { id: '3', productId: 'oring-001', quantity: 50, addedAt: '2024-01-05' },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-05'
  },
  {
    id: 'list-002',
    customerId: 'cust-001',
    name: 'Project Nieuwbouw',
    description: 'Onderdelen voor nieuwbouwproject',
    isDefault: false,
    items: [
      { id: '1', productId: 'pump-002', quantity: 5, addedAt: '2024-01-10' },
      { id: '2', productId: 'valve-002', quantity: 15, addedAt: '2024-01-10' },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  }
]

const menuItems = [
  { id: 'overview', label: 'Overview', label_nl: 'Overzicht', icon: User },
  { id: 'orders', label: 'Orders', label_nl: 'Bestellingen', icon: Package },
  { id: 'lists', label: 'Shopping Lists', label_nl: 'Bestellijsten', icon: Heart },
  { id: 'addresses', label: 'Addresses', label_nl: 'Adressen', icon: MapPin },
  { id: 'payment', label: 'Payment', label_nl: 'Betaling', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', label_nl: 'Meldingen', icon: Bell },
  { id: 'settings', label: 'Settings', label_nl: 'Instellingen', icon: Settings },
]

const orderStatusConfig = {
  pending: { label: 'Pending', label_nl: 'In afwachting', color: 'bg-slate-100 text-slate-700', icon: Clock },
  confirmed: { label: 'Confirmed', label_nl: 'Bevestigd', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'Processing', label_nl: 'In behandeling', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  picking: { label: 'Picking', label_nl: 'Wordt verzameld', color: 'bg-orange-100 text-orange-700', icon: Package },
  packed: { label: 'Packed', label_nl: 'Ingepakt', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', label_nl: 'Verzonden', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', label_nl: 'Geleverd', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', label_nl: 'Geannuleerd', color: 'bg-red-100 text-red-700', icon: Clock },
  returned: { label: 'Returned', label_nl: 'Geretourneerd', color: 'bg-gray-100 text-gray-700', icon: RotateCcw },
}

export default function AccountPage() {
  const [language] = useState<'en' | 'nl'>('nl')
  const [activeSection, setActiveSection] = useState('overview')
  
  const customer = mockCustomer
  const orders = mockOrders
  const shoppingLists = mockShoppingLists
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'nl' ? 'nl-BE' : 'en-GB', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {language === 'nl' ? 'Mijn Account' : 'My Account'}
              </h1>
              <p className="text-slate-500">
                {language === 'nl' ? 'Welkom terug,' : 'Welcome back,'} {customer.contact.firstName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-900">{customer.company?.name}</p>
              <p className="text-sm text-slate-500">{customer.email}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="bg-white rounded-xl border sticky top-24">
              <ul className="divide-y">
                {menuItems.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">
                        {language === 'nl' ? item.label_nl : item.label}
                      </span>
                    </button>
                  </li>
                ))}
                <li>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">
                      {language === 'nl' ? 'Uitloggen' : 'Log out'}
                    </span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                        <p className="text-sm text-slate-500">
                          {language === 'nl' ? 'Bestellingen' : 'Orders'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {orders.filter(o => o.status === 'shipped').length}
                        </p>
                        <p className="text-sm text-slate-500">
                          {language === 'nl' ? 'Onderweg' : 'In Transit'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{shoppingLists.length}</p>
                        <p className="text-sm text-slate-500">
                          {language === 'nl' ? 'Bestellijsten' : 'Lists'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(customer.creditLimit || 0)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {language === 'nl' ? 'Kredietlimiet' : 'Credit Limit'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Orders */}
                <div className="bg-white rounded-xl border">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-slate-900">
                      {language === 'nl' ? 'Recente bestellingen' : 'Recent Orders'}
                    </h2>
                    <button 
                      onClick={() => setActiveSection('orders')}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {language === 'nl' ? 'Bekijk alle' : 'View all'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y">
                    {orders.slice(0, 3).map(order => {
                      const status = orderStatusConfig[order.status]
                      return (
                        <div key={order.id} className="p-4 hover:bg-slate-50 transition">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-medium text-slate-900">
                                {order.orderNumber}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                {language === 'nl' ? status.label_nl : status.label}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>{formatDate(order.orderDate)}</span>
                            <span>{order.items.length} {language === 'nl' ? 'artikelen' : 'items'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Account Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Company Info */}
                  <div className="bg-white rounded-xl border p-4">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      {language === 'nl' ? 'Bedrijfsgegevens' : 'Company Info'}
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{language === 'nl' ? 'Bedrijf' : 'Company'}</dt>
                        <dd className="font-medium text-slate-900">{customer.company?.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{language === 'nl' ? 'BTW-nummer' : 'VAT Number'}</dt>
                        <dd className="font-medium text-slate-900">{customer.company?.vatNumber}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{language === 'nl' ? 'Betalingstermijn' : 'Payment Terms'}</dt>
                        <dd className="font-medium text-slate-900">{customer.paymentTerms}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{language === 'nl' ? 'Prijsgroep' : 'Price Group'}</dt>
                        <dd className="font-medium text-slate-900">{customer.priceGroup}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {/* Default Address */}
                  <div className="bg-white rounded-xl border p-4">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      {language === 'nl' ? 'Standaard leveradres' : 'Default Shipping Address'}
                    </h3>
                    {customer.addresses.find(a => a.id === customer.defaultShippingAddressId) && (
                      <address className="not-italic text-sm text-slate-600">
                        <p className="font-medium text-slate-900">
                          {customer.addresses.find(a => a.id === customer.defaultShippingAddressId)?.name}
                        </p>
                        <p>{customer.addresses.find(a => a.id === customer.defaultShippingAddressId)?.street}</p>
                        <p>
                          {customer.addresses.find(a => a.id === customer.defaultShippingAddressId)?.postalCode}{' '}
                          {customer.addresses.find(a => a.id === customer.defaultShippingAddressId)?.city}
                        </p>
                        <p>{customer.addresses.find(a => a.id === customer.defaultShippingAddressId)?.country}</p>
                      </address>
                    )}
                    <button 
                      onClick={() => setActiveSection('addresses')}
                      className="mt-3 text-sm text-blue-600 hover:underline"
                    >
                      {language === 'nl' ? 'Adressen beheren' : 'Manage addresses'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="bg-white rounded-xl border">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-slate-900">
                    {language === 'nl' ? 'Mijn bestellingen' : 'My Orders'}
                  </h2>
                </div>
                <div className="divide-y">
                  {orders.map(order => {
                    const status = orderStatusConfig[order.status]
                    const StatusIcon = status.icon
                    return (
                      <div key={order.id} className="p-4">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono font-bold text-slate-900">
                                {order.orderNumber}
                              </span>
                              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {language === 'nl' ? status.label_nl : status.label}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">
                              {language === 'nl' ? 'Besteld op' : 'Ordered on'} {formatDate(order.orderDate)}
                              {order.customerReference && (
                                <span className="ml-2">• Ref: {order.customerReference}</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-slate-900">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {order.items.length} {language === 'nl' ? 'artikelen' : 'items'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        <div className="bg-slate-50 rounded-lg p-3 mb-4">
                          {order.items.slice(0, 2).map(item => (
                            <div key={item.id} className="flex items-center justify-between py-1 text-sm">
                              <span className="text-slate-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium">{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-slate-500 pt-1">
                              +{order.items.length - 2} {language === 'nl' ? 'meer artikelen' : 'more items'}
                            </p>
                          )}
                        </div>
                        
                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 mb-4 text-sm">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-500">
                              {order.carrier}: 
                            </span>
                            <a href="#" className="text-blue-600 hover:underline font-mono">
                              {order.trackingNumber}
                            </a>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition text-sm">
                            <Eye className="w-4 h-4" />
                            {language === 'nl' ? 'Details bekijken' : 'View Details'}
                          </button>
                          {order.invoiceUrl && (
                            <a 
                              href={order.invoiceUrl}
                              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition text-sm"
                            >
                              <Download className="w-4 h-4" />
                              {language === 'nl' ? 'Factuur' : 'Invoice'}
                            </a>
                          )}
                          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition text-sm">
                            <RotateCcw className="w-4 h-4" />
                            {language === 'nl' ? 'Opnieuw bestellen' : 'Reorder'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Shopping Lists Section */}
            {activeSection === 'lists' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    {language === 'nl' ? 'Mijn bestellijsten' : 'My Shopping Lists'}
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    + {language === 'nl' ? 'Nieuwe lijst' : 'New List'}
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {shoppingLists.map(list => (
                    <div key={list.id} className="bg-white rounded-xl border p-4 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{list.name}</h3>
                          {list.description && (
                            <p className="text-sm text-slate-500">{list.description}</p>
                          )}
                        </div>
                        {list.isDefault && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {language === 'nl' ? 'Standaard' : 'Default'}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-4">
                        {list.items.length} {language === 'nl' ? 'artikelen' : 'items'}
                        {' • '}
                        {language === 'nl' ? 'Bijgewerkt' : 'Updated'} {formatDate(list.updatedAt)}
                      </p>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          {language === 'nl' ? 'Alles toevoegen' : 'Add All to Cart'}
                        </button>
                        <button className="px-3 py-2 border rounded-lg hover:bg-slate-50 transition text-sm">
                          {language === 'nl' ? 'Bewerken' : 'Edit'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Addresses Section */}
            {activeSection === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    {language === 'nl' ? 'Mijn adressen' : 'My Addresses'}
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    + {language === 'nl' ? 'Nieuw adres' : 'New Address'}
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {customer.addresses.map(address => (
                    <div key={address.id} className="bg-white rounded-xl border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="font-semibold text-slate-900">{address.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {address.isDefault && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              {language === 'nl' ? 'Standaard' : 'Default'}
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            {address.type === 'both' 
                              ? (language === 'nl' ? 'Factuur & Levering' : 'Billing & Shipping')
                              : address.type === 'billing'
                              ? (language === 'nl' ? 'Factuur' : 'Billing')
                              : (language === 'nl' ? 'Levering' : 'Shipping')
                            }
                          </span>
                        </div>
                      </div>
                      
                      <address className="not-italic text-sm text-slate-600 mb-4">
                        {address.company && <p className="font-medium">{address.company}</p>}
                        <p>{address.street}</p>
                        <p>{address.postalCode} {address.city}</p>
                        <p>{address.country}</p>
                        {address.phone && <p className="mt-1">{address.phone}</p>}
                      </address>
                      
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:underline">
                          {language === 'nl' ? 'Bewerken' : 'Edit'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button className="text-sm text-red-600 hover:underline">
                          {language === 'nl' ? 'Verwijderen' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Placeholder for other sections */}
            {['payment', 'notifications', 'settings'].includes(activeSection) && (
              <div className="bg-white rounded-xl border p-8 text-center">
                <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {menuItems.find(m => m.id === activeSection)?.[language === 'nl' ? 'label_nl' : 'label']}
                </h2>
                <p className="text-slate-500">
                  {language === 'nl' 
                    ? 'Deze sectie wordt nog ontwikkeld. Vul hier de specifieke functionaliteit in.'
                    : 'This section is under development. Fill in specific functionality here.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
