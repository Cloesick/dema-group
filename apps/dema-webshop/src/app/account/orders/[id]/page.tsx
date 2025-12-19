'use client';

import { useParams } from 'next/navigation';
import { FiArrowLeft, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  id: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
};

// Mock order data - in a real app, this would come from an API
const mockOrders: Record<string, Order> = {
  'ORD-12345': {
    id: 'ORD-12345',
    date: '2023-10-15',
    status: 'Delivered',
    subtotal: 239.97,
    shipping: 10.02,
    tax: 50.00,
    total: 249.99,
    items: [
      { 
        id: '1', 
        name: 'Professional Drill', 
        price: 129.99, 
        quantity: 1, 
        image: '/placeholder-drill.jpg' 
      },
      { 
        id: '2', 
        name: 'Screwdriver Set', 
        price: 59.99, 
        quantity: 2, 
        image: '/placeholder-screwdriver.jpg' 
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Brussels',
      postalCode: '1000',
      country: 'Belgium',
    },
    paymentMethod: 'Credit Card ending in 4242',
    trackingNumber: '1Z999AA1234567890',
  },
  'ORD-12344': {
    id: 'ORD-12344',
    date: '2023-09-28',
    status: 'Shipped',
    subtotal: 84.99,
    shipping: 5.00,
    tax: 17.85,
    total: 89.99,
    items: [
      { 
        id: '3', 
        name: 'Professional Toolbox', 
        price: 84.99, 
        quantity: 1, 
        image: '/placeholder-toolbox.jpg' 
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Brussels',
      postalCode: '1000',
      country: 'Belgium',
    },
    paymentMethod: 'Credit Card ending in 4242',
    trackingNumber: '1Z999BB1234567890',
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const order = orderId in mockOrders ? mockOrders[orderId] : undefined;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
            <p className="text-gray-600">We couldn't find an order with that ID.</p>
            <div className="mt-6">
              <Link
                href="/account/orders"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (order.status) {
      case 'Delivered':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'Shipped':
        return <FiTruck className="h-5 w-5 text-blue-500" />;
      case 'Processing':
        return <FiClock className="h-5 w-5 text-yellow-500" />;
      case 'Cancelled':
        return <FiXCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/account/orders"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg leading-6 font-medium text-gray-900">
                  Order #{order.id}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Placed on {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="ml-1">{order.status}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {order.items.map((item: OrderItem) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">€{item.price.toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-5 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>€{order.subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <p>Shipping</p>
              <p>€{order.shipping.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <p>Tax</p>
              <p>€{order.tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-lg font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
              <p>Total</p>
              <p>€{order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
                <div className="mt-1 text-sm text-gray-900">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <div className="mt-1 text-sm text-gray-900">
                  <p>{order.paymentMethod}</p>
                </div>
                
                {order.trackingNumber && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Tracking Information</h3>
                    <div className="mt-1 text-sm text-gray-900">
                      <p>Tracking #: {order.trackingNumber}</p>
                      <div className="mt-2">
                        <a
                          href={`https://www.ups.com/track?tracknum=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Track Package →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/account/orders"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Orders
          </Link>
          <button
            type="button"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Need Help?
          </button>
        </div>
      </div>
    </div>
  );
}
