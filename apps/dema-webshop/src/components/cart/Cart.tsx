'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';

export default function Cart() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    itemCount, 
    totalPrice 
  } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`fixed inset-0 overflow-hidden z-50 ${!isOpen ? 'hidden' : ''}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={toggleCart}
        ></div>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">{t('cart.drawer.title')}</h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={toggleCart}
                    >
                      <span className="sr-only">{t('cart.drawer.close')}</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">{t('cart.empty.title')}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t('cart.empty.subtitle')}</p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={toggleCart}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('cart.actions.continue_shopping')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {items.map((item) => (
                          <li key={item.sku} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <div className="text-center p-2">
                                  <div className="text-xs font-medium text-gray-500 truncate">
                                    {item.sku}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.description?.split(' ').slice(0, 3).join(' ') || item.sku}</h3>
                                  <p className="ml-4">€{(item.sku.length * 10 * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{item.sku}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <label htmlFor={`quantity-${item.sku}`} className="mr-2 text-gray-700">
                                    {t('cart.qty')}
                                  </label>
                                  <select
                                    id={`quantity-${item.sku}`}
                                    name={`quantity-${item.sku}`}
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value))}
                                    className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                      <option key={num} value={num}>
                                        {num}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex">
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.sku)}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                  >
                                    {t('cart.remove')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>{t('cart.subtotal')}</p>
                    <p>€{totalPrice().toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t('cart.shipping_taxes_note')}
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/checkout"
                      className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      onClick={toggleCart}
                    >
                      {t('cart.actions.checkout')}
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      {t('cart.or')}{' '}
                      <button
                        type="button"
                        className="text-blue-600 font-medium hover:text-blue-500"
                        onClick={toggleCart}
                      >
                        {t('cart.actions.continue_shopping')}<span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
