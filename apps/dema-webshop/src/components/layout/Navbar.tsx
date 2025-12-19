'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { FileText } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useLocale } from '@/contexts/LocaleContext';
import { useQuote } from '@/contexts/QuoteContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const toggleCart = useCartStore(s => s.toggleCart);
  const count = useCartStore(s => s.items.reduce((t, i) => t + i.quantity, 0));
  const { quoteItems, toggleQuote } = useQuote();
  const { t } = useLocale();

  const navigation = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.products', href: '/products' },
    { key: 'nav.about', href: '/about' },
    { key: 'contact', href: '/contact' },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  DemaShop
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`${pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {(item as any).literal ? item.key : t(item.key)}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center gap-3">
              {/* Request Quote Button */}
              <button
                type="button"
                onClick={toggleQuote}
                className="p-1 rounded-full text-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 relative"
                title="Request Quote"
              >
                <span className="sr-only">Request Quote</span>
                <FileText className="h-6 w-6" aria-hidden="true" />
                {quoteItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {quoteItems.length}
                  </span>
                )}
              </button>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={toggleCart}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
              >
                <span className="sr-only">{t('cart')}</span>
                <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>

              {/* User Account Link */}
              <Link
                href="/auth/signin"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">{t('account')}</span>
                <UserIcon className="h-6 w-6" aria-hidden="true" />
              </Link>
            </div>
            <div className="-mr-2 flex items-center sm:hidden gap-3">
              {/* Request Quote Button - Mobile */}
              <button
                type="button"
                onClick={toggleQuote}
                className="p-1 rounded-full text-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 relative"
                title="Request Quote"
              >
                <span className="sr-only">Request Quote</span>
                <FileText className="h-6 w-6" aria-hidden="true" />
                {quoteItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {quoteItems.length}
                  </span>
                )}
              </button>
              
              {/* Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => {
                  console.log('Hamburger clicked, isOpen:', isOpen);
                  setIsOpen(!isOpen);
                }}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded={isOpen}
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden bg-white border-t border-gray-200`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`${pathname === item.href
                  ? 'bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {(item as any).literal ? item.key : t(item.key)}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4 space-x-3">
              <button
                type="button"
                onClick={() => {
                  toggleQuote();
                  setIsOpen(false);
                }}
                className="flex-shrink-0 p-1 rounded-full text-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 relative"
              >
                <span className="sr-only">Request Quote</span>
                <FileText className="h-6 w-6" aria-hidden="true" />
                {quoteItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {quoteItems.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleCart();
                  setIsOpen(false);
                }}
                className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
              >
                <span className="sr-only">{t('cart')}</span>
                <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <Link
                href="/auth/signin"
                className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">View profile</span>
                <UserIcon className="h-6 w-6" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
