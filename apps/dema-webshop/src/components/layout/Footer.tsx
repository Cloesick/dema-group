"use client";

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { useLocale } from '@/contexts/LocaleContext';

const navigation = {
  main: [
    { key: 'nav.home', href: '/' },
    { key: 'nav.products', href: '/products' },
    { key: 'nav.categories', href: '/categories' },
    { key: 'nav.about', href: '/about' },
    { key: 'contact', href: '/contact' },
    { key: 'footer.privacy', href: '/privacy' },
    { key: 'footer.terms', href: '/terms' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: FaFacebook,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: FaTwitter,
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: FaLinkedin,
    },
    {
      name: 'YouTube',
      href: '#',
      icon: FaYoutube,
    },
  ],
};

const Footer = () => {
  const { t } = useLocale();
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.key} className="px-5 py-2">
              <Link
                href={item.href}
                className="text-base text-gray-500 hover:text-gray-900"
              >
                {t(item.key)}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} DemaShop. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
