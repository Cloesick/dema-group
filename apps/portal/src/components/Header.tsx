'use client'

import { useState } from 'react'
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
  const [isWebsitesMenuOpen, setIsWebsitesMenuOpen] = useState(false)

  return (
    <header className="border-b bg-white" role="banner" aria-label="Site header">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <nav className="flex items-center space-x-6" role="navigation" aria-label="Primary navigation">
              <h1 className="sr-only">DEMA Group Portal</h1>
              <div className="sr-only">Main menu</div>
              {mainNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-sm hover:text-orange-300 focus:text-orange-300 transition"
                >
                  {t.navigation[item.key]}
                </Link>
              ))}
              <button 
                className="text-sm flex items-center hover:text-orange-300 focus:text-orange-300 transition"
                aria-label="Open websites menu"
                aria-expanded={isWebsitesMenuOpen ? "true" : "false"}
                onClick={() => setIsWebsitesMenuOpen(!isWebsitesMenuOpen)}
              >
                All websites <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
              </button>
              {isWebsitesMenuOpen && (
                <div
                  role="dialog"
                  aria-label="Websites menu"
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2"
                >
                  <a href="https://dema-group.com" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">DEMA Group</a>
                  <a href="https://fluxer.eu" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Fluxer</a>
                  <a href="https://devisschere.be" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">De Visschere</a>
                </div>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/myportal" 
                className="text-sm hover:text-orange-400 transition flex items-center"
                aria-label="Open MyDEMA menu"
              >
                MyDEMA <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
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
            <nav className="flex items-center space-x-8" role="navigation" aria-label="Secondary navigation">
              <div className="sr-only">Secondary menu</div>
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-slate-900 hover:text-orange-600 focus:text-orange-600 transition"
                >
                  {t.navigation[item.key]}
                </Link>
              ))}
            </nav>

            {/* Search and Contact */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative" role="search" aria-label="Header search">
                <input
                  type="search"
                  placeholder={t.common.search}
                  className="pl-10 pr-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-600"
                  aria-label="Header search"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
              </div>

              {/* Contact Button */}
              <Link
                href="/contact"
                className="flex items-center text-slate-900 hover:text-orange-600 focus:text-orange-600 transition"
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
