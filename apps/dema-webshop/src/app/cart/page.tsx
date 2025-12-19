'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiArrowLeft, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function CartPage() {
  // This would typically come from a cart context or state management
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Sample Product',
      price: 99.99,
      quantity: 1,
      image: '/assets/front/images/placeholder-product.jpg',
    },
  ]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping: number = 0; // Free shipping for now
  const tax = subtotal * 0.21; // 21% VAT
  const total = subtotal + shipping + tax;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">Start adding some products to your cart.</p>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
              {/* Cart items */}
              <div className="lg:col-span-7">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul role="list" className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="p-4 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-center object-cover"
                            />
                          </div>

                          <div className="ml-4 flex-1 flex flex-col sm:flex-row">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {item.name}
                              </h4>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                €{item.price.toFixed(2)}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center sm:mt-0 sm:ml-6">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                                >
                                  <FiMinus className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                                >
                                  <FiPlus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="ml-4 text-sm font-medium text-red-600 hover:text-red-500 sm:ml-6"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order summary */}
              <div className="mt-10 lg:mt-0 lg:col-span-5">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">€{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">
                        {shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tax (21%)</span>
                      <span className="font-medium text-gray-900">€{tax.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/checkout"
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>

                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      or{' '}
                      <Link
                        href="/products"
                        className="text-primary font-medium hover:text-primary-dark"
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
