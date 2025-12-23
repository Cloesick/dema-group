'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Mail, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

type MainNavKey = 'individuals' | 'professionals' | 'companies' | 'all-products'
type SecondaryNavKey = 'about' | 'inspiration' | 'help' | 'promotions'

const mainNavItems: Array<{ key: MainNavKey; href: string }> = [
  { key: 'individuals' as const, href: '/individuals' },
  { key: 'professionals' as const, href: '/professionals' },
  { key: 'companies' as const, href: '/companies' },
  { key: 'all-products' as const, href: '/products' }
]

const secondaryNavItems: Array<{ key: SecondaryNavKey; href: string }> = [
  { key: 'about' as const, href: '/about' },
  { key: 'inspiration' as const, href: '/inspiration' },
  { key: 'help' as const, href: '/help' },
  { key: 'promotions' as const, href: '/promotions' }
]

export function Header() {
  const { t, language } = useLanguage()

  return (
    <header className="border-b">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <nav className="flex items-center space-x-6">
              {mainNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-sm hover:text-orange-400 transition"
                >
                  {t.navigation[item.key]}
                </Link>
              ))}
              <button className="text-sm flex items-center hover:text-orange-400 transition">
                All websites <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/myportal" className="text-sm hover:text-orange-400 transition flex items-center">
                MyDEMA <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/dema-group-logo-v3.svg"
                alt="DEMA Group"
                width={400}
                height={200}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center space-x-8">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-slate-600 hover:text-orange-500 transition"
                >
                  {t.navigation[item.key]}
                </Link>
              ))}
            </nav>

            {/* Search and Contact */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="search"
                  placeholder={t.common.search}
                  className="pl-10 pr-4 py-2 rounded-full bg-slate-100 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {/* Contact Button */}
              <Link
                href="/contact"
                className="flex items-center text-slate-600 hover:text-orange-500 transition"
              >
                <Mail className="h-5 w-5 mr-2" />
                <span className="text-sm">{t.common.contactUs}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
