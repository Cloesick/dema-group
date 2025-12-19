import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Cart from '@/components/cart/Cart';
import QuoteList from '@/components/QuoteListSimplified';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { QuoteProvider } from '@/contexts/QuoteContext';
import { CompareProvider } from '@/contexts/CompareContext';
import { ToastProvider } from '@/contexts/ToastContext';
import CompareBar from '@/components/CompareBar';
import CookieConsentWrapper from '@/components/layout/CookieConsentWrapper';
import { cookies } from 'next/headers';
import { Providers } from './providers';
import ProductAssistant from '@/components/chat/ProductAssistant';
import Analytics from '@/components/Analytics';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get('locale')?.value as 'en'|'nl'|'fr') ?? 'nl';
  const locales = {
    en: await import('@/locales/en.json').then(m => m.default),
    nl: await import('@/locales/nl.json').then(m => m.default),
    fr: await import('@/locales/fr.json').then(m => m.default),
  } as const;
  const dict = (locales as any)[initialLocale] || locales.nl;
  
  return {
    title: {
      default: dict['metadata.title'] || 'DEMA - Pompen, Buizen & Industriële Toebehoren',
      template: '%s | DEMA Shop',
    },
    description: dict['metadata.description'] || 'DEMA is uw specialist voor pompen, buizen, fittingen, slangen en industrieel gereedschap. Professionele B2B oplossingen met deskundig advies.',
    metadataBase: new URL('https://www.demashop.be'),
    alternates: { 
      canonical: '/',
      languages: {
        'nl-BE': '/',
        'en': '/en',
        'fr': '/fr',
      },
    },
    icons: { 
      icon: '/favicon.ico',
      apple: '/icons/icon-192x192.png',
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: initialLocale === 'nl' ? 'nl_BE' : initialLocale === 'fr' ? 'fr_BE' : 'en_US',
      url: 'https://www.demashop.be',
      siteName: 'DEMA Shop',
      title: dict['metadata.title'] || 'DEMA - Pompen, Buizen & Industriële Toebehoren',
      description: dict['metadata.description'] || 'DEMA is uw specialist voor pompen, buizen, fittingen, slangen en industrieel gereedschap.',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'DEMA Shop - Industriële Toebehoren',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict['metadata.title'] || 'DEMA Shop',
      description: dict['metadata.description'] || 'Specialist voor pompen, buizen en industrieel gereedschap.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
    other: { 
      'theme-color': '#00adef',
    },
    keywords: ['pompen', 'buizen', 'fittingen', 'slangen', 'gereedschap', 'B2B', 'industrieel', 'DEMA', 'België'],
  };
}

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get('locale')?.value as 'en'|'nl'|'fr') ?? 'en';
  return (
    <html lang={initialLocale} className="h-full light" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Additional meta tags */}
        <meta name="google-site-verification" content="" />
        <meta name="google-site-verification" content="" />
      </head>
      <body className={`${inter.variable} font-sans bg-white text-gray-900 flex flex-col min-h-screen`}>
        <Analytics />
        <Providers>
          <CookieConsentProvider>
            <LocaleProvider>
              <QuoteProvider>
                <CompareProvider>
                <ToastProvider>
                  <Header />
                  <main className="flex-grow pb-20">
                    {children}
                  </main>
                  <Footer />
                  <CookieConsentWrapper />
                  <Cart />
                  <QuoteList />
                  <ProductAssistant language="nl" />
                  <CompareBar />
                </ToastProvider>
                </CompareProvider>
              </QuoteProvider>
            </LocaleProvider>
          </CookieConsentProvider>
        </Providers>
      </body>
    </html>
  );
}
