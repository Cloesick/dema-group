'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiHeadphones, FiShield, FiTruck } from 'react-icons/fi';
import { useLocale } from '@/contexts/LocaleContext';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import type { Product } from '@/types/product';
import FAQ from '@/components/home/FAQ';

// Placeholder image component to handle loading states
const InlinePlaceholderImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  return (
    <div className={`relative bg-gray-100 overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
      <div className="relative h-full flex items-center justify-center p-4">
        <span className="text-gray-400 text-sm text-center">{alt}</span>
      </div>
    </div>
  );
};

// Feature component
const Feature = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full text-primary">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{children}</p>
    </div>
  </div>
);

// Default highlights (can be tailored if preference cookies are allowed)
const defaultHighlights = [
  {
    name: 'Pro Air Compressor X200',
    description: 'Bestseller for workshops needing reliable continuous duty',
    image: '/images/compressors.jpg',
    tag: 'Bestseller',
    category: 'Compressors',
  },
  {
    name: 'Titan Pneumatic Impact Wrench',
    description: 'High torque with low vibration for daily professional use',
    image: '/images/tools.jpg',
    tag: 'Pro pick',
    category: 'Pneumatic Tools',
  },
  {
    name: 'UltraClean FRL System',
    description: 'Keep your air lines pristine with premium filtration',
    image: '/images/air-treatment.jpg',
    tag: 'New',
    category: 'Air Treatment',
  },
  {
    name: 'Flexi-Hose Kit 10m',
    description: 'Durable, kink-resistant hose with quick-connect fittings',
    image: '/images/hoses.jpg',
    tag: 'Staff pick',
    category: 'Hoses & Fittings',
  },
];

const features = [
  { key: 'free_shipping', icon: FiTruck },
  { key: 'warranty', icon: FiShield },
  { key: 'support', icon: FiHeadphones },
];

export default function Home() {
  const { consent } = useCookieConsent();
  const { t } = useLocale();
  const [highlights, setHighlights] = useState(defaultHighlights);
  const [personalized, setPersonalized] = useState(false);
  const [highlightProducts, setHighlightProducts] = useState<Product[]>([]);

  // Simple personalization: if preference cookies are allowed and a preferredCategory exists,
  // prioritize items from that category
  useEffect(() => {
    try {
      if (consent?.preferences) {
        const preferredCategory = localStorage.getItem('preferredCategory');
        if (preferredCategory) {
          const prioritized = [
            ...defaultHighlights.filter(h => h.category === preferredCategory),
            ...defaultHighlights.filter(h => h.category !== preferredCategory),
          ];
          setHighlights(prioritized);
          setPersonalized(true);
          return;
        }
      }
    } catch (_) {
      // ignore personalization if localStorage is unavailable
    }
    setHighlights(defaultHighlights);
    setPersonalized(false);
  }, [consent?.preferences]);

  // Server recommendations when analytics or marketing consent is granted
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Prefer profile-based marketing personalization if user opted in
      let usedMarketingSuggestions = false;
      try {
        const profileMarketing = typeof window !== 'undefined' && localStorage.getItem('profile:marketing') === 'true';
        if (profileMarketing) {
          const clientId = (() => {
            try {
              let id: string = localStorage.getItem('client:id') || '';
              if (!id) {
                id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : String(Math.random());
                localStorage.setItem('client:id', id);
              }
              return id;
            } catch (_) {
              return '';
            }
          })();
          if (clientId) {
            const r = await fetch(`/api/marketing/suggestions?clientId=${encodeURIComponent(clientId)}&limit=4`, { cache: 'no-store' });
            if (r.ok) {
              const contentType = r.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const data = await r.json();
                if (!cancelled && Array.isArray(data.items)) {
                  setHighlightProducts(data.items as Product[]);
                  setPersonalized(Boolean(data.personalized));
                  usedMarketingSuggestions = true;
                }
              }
            }
          }
        }
      } catch (_) {}

      if (usedMarketingSuggestions) return;

      if (!(consent?.analytics || consent?.marketing)) {
        return;
      }
      try {
        let preferredCategory = '';
        try {
          if (consent?.preferences) {
            preferredCategory = localStorage.getItem('preferredCategory') || '';
          }
        } catch (_) {}
        const params = new URLSearchParams();
        params.set('limit', '4');
        if (preferredCategory) params.set('preferredCategory', preferredCategory);
        params.set('personalized', preferredCategory ? 'true' : 'false');
        const res = await fetch(`/api/recommendations?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.items) && data.items.length) {
          setHighlightProducts(data.items as Product[]);
          setPersonalized(Boolean(data.personalized));
        }
      } catch (_) {
        // ignore
      }
    };
    run();
    return () => { cancelled = false; };
  }, [consent?.analytics, consent?.marketing, consent?.preferences]);
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative text-white overflow-hidden bg-gradient-to-r from-primary to-primary-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-90 bg-gradient-to-r from-primary to-primary-dark"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-3xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">{t('home.hero.title_line1')}</span>
                <span className="block text-blue-200">{t('home.hero.title_line2')}</span>
              </h1>
              <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                <div className="rounded-md shadow">
                  <Link
                    href="/products"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-dark bg-yellow-400 hover:bg-yellow-500 md:py-4 md:text-lg md:px-10"
                  >
                    {t('common.shop_now')}
                  </Link>
                </div>
                <div className="rounded-md shadow">
                  <Link
                    href="/about"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-dark bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    {t('common.learn_more')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">{t('home.features.heading')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('home.features.title')}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <Feature
                  key={feature.key}
                  icon={feature.icon}
                  title={t(`home.features.${feature.key}.title`)}
                >
                  {t(`home.features.${feature.key}.desc`)}
                </Feature>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Makita Featured Section */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-12 flex flex-col justify-center">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold mb-4 w-fit">
                  ⚡ New Addition
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Makita XGT Battery Products
                </h2>
                <p className="text-xl text-white/90 mb-6">
                  Professional 40V MAX batteries, chargers, and accessories. 
                  19 products now available with detailed specifications.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/makita"
                    className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg inline-flex items-center gap-2"
                  >
                    <span>Explore Makita</span>
                    <FiArrowRight />
                  </Link>
                  <Link 
                    href="/products?catalog=makita"
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition border-2 border-white/30"
                  >
                    View in Catalog
                  </Link>
                </div>
              </div>

              {/* Image Grid */}
              <div className="relative h-full min-h-[400px]">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-6xl">🔋</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-6xl">⚡</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-6xl">🔌</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center bg-yellow-400/80">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">19</div>
                      <div className="text-sm font-semibold text-gray-700">Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Hidden from homepage, available at /faq */}
      {/* <FAQ /> */}

      {/* CTA Section */}
      <div className="bg-primary-dark">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">{t('home.cta.title_line1')}</span>
            <span className="block">{t('home.cta.title_line2')}</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            {t('home.cta.subtitle')}
          </p>
          <Link
            href="/products"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-blue-50 sm:w-auto"
          >
            {t('common.shop_now')}
          </Link>
        </div>
      </div>
    </div>
  );
}
