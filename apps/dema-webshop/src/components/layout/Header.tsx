'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiShoppingCart, FiUser, FiMapPin, FiMenu, FiFileText, FiX } from 'react-icons/fi';
import { useLocale } from '@/contexts/LocaleContext';
import { CONTACT } from '@/config/contact';
import { useCartStore } from '@/store/cartStore';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { useQuote } from '@/contexts/QuoteContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useLocale();
  const contact = CONTACT[locale];
  const toggleCart = useCartStore(s => s.toggleCart);
  const count = useCartStore(s => s.items.reduce((t, i) => t + i.quantity, 0));
  const { openConsent } = useCookieConsent();
  const { quoteItems, toggleQuote } = useQuote();
  const quoteCount = quoteItems.reduce((total, item) => total + item.quantity, 0);
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - Hidden on mobile, shown on tablet+ */}
      <div className="hidden sm:block bg-gray-900 text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href={`tel:${contact.phone.replace(/\s+/g,'')}`} className="hover:text-yellow-400 transition-colors">
              {t('topbar.customer_service')}: {contact.phone}
            </a>
            <span>|</span>
            <a href={`mailto:${contact.email}`} className="hover:text-yellow-400 transition-colors">
              {contact.email}
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-yellow-400 flex items-center">
              <FiUser className="mr-1" /> {t('auth.sign_in_button')}
            </Link>
            <Link href="/contact" className="hover:text-yellow-400">{t('contact')}</Link>
            <button
              onClick={openConsent}
              className="hover:text-yellow-400 underline decoration-dotted"
              aria-label="Manage Cookies"
            >
              Manage Cookies
            </button>
            <div className="flex items-center space-x-1">
              {(['en','nl','fr'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`px-2 py-0.5 text-xs rounded border ${locale===l ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-transparent text-white border-white/30 hover:bg-white/10'}`}
                >{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Top Bar - Simplified */}
      <div className="sm:hidden bg-gray-900 text-white text-xs py-2">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <a href={`tel:${contact.phone.replace(/\s+/g,'')}`} className="hover:text-yellow-400 transition-colors">
            📞 {contact.phone}
          </a>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img 
                src="/assets/front/favicon/dema/logo.png" 
                alt="DEMA Shop Logo" 
                className="h-8 sm:h-12 w-auto" 
                width={160}
                height={48}
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const container = (e.target as HTMLElement).parentElement;
                  if (container) {
                    container.innerHTML = `
                      <span className="text-2xl font-bold text-gray-900">
                        DEMA<span class="text-primary">SHOP</span>
                      </span>
                    `;
                  }
                }}
              />
            </Link>
          </div>

          {/* Search Bar removed as requested */}

          {/* Request Quote & Cart & Contact */}
          <div className="flex items-center space-x-4">
            {/* Request Quote Button */}
            <button
              onClick={toggleQuote}
              className="flex items-center text-gray-700 hover:text-orange-600 relative transition-colors"
              title="Request Quote"
            >
              <FiFileText className="h-6 w-6" />
              {quoteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {quoteCount}
                </span>
              )}
              <span className="ml-1 hidden md:inline">Quote</span>
            </button>
            
            {/* Cart Button */}
            <button onClick={toggleCart} className="flex items-center text-gray-700 hover:text-blue-600 relative">
              <FiShoppingCart className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
              <span className="ml-1 hidden md:inline">{t('cart')}</span>
            </button>
            <button 
              className="md:hidden text-gray-700 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-center mt-4">
          <ul className="flex space-x-8">
            <li><Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.home')}</Link></li>
            <li><Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.products')}</Link></li>
            <li><Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.categories')}</Link></li>
            <li><Link href="/#faq" className="text-gray-700 hover:text-blue-600 font-medium">FAQ</Link></li>
            <li><Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">{t('nav.about')}</Link></li>
            <li><Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">{t('contact')}</Link></li>
          </ul>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#faq" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ❓ FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('contact')}
                </Link>
              </li>
              <li>
                <button 
                  className="block w-full text-left py-3 px-4 text-orange-600 hover:bg-orange-50 rounded-lg font-medium"
                  onClick={() => {
                    toggleQuote();
                    setMobileMenuOpen(false);
                  }}
                >
                  📋 {t('nav.quote_request') || 'Request Quote'}
                </button>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 {t('auth.sign_in_button')}
                </Link>
              </li>
            </ul>
            
            {/* Language Switcher - Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2 px-4">Language</p>
              <div className="flex space-x-2 px-4">
                {(['en','nl','fr'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setLocale(l);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-2 text-sm rounded-lg font-medium ${locale===l ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >{l.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
