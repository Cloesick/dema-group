'use client'

import Link from 'next/link'
import Image from 'next/image'
import { companies } from '@/config/brands'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function HomePage() {
  const { t, language } = useLanguage()

  const companyCards = companies.map((company) => {
    const companyKey = company.id as keyof typeof t.companies
    const translations = t.companies[companyKey]
    return {
      id: company.id,
      name: company.name,
      tagline: translations?.tagline || company.tagline,
      description: translations?.description || company.description,
      icon: company.icon,
      logo: company.logo,
      primaryColor: company.colors.primary,
      categories: company.categories.slice(0, 4),
      website: company.website,
    }
  })

  return (
    <main className="min-h-screen">
      {/* Language Switcher Header */}
      <div className="bg-slate-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-end">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t.home.title}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              {t.home.subtitle}
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/products" 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
              >
                {t.home.browseAllProducts}
              </Link>
              <Link 
                href="/contact" 
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition"
              >
                {t.common.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">5</div>
              <div className="text-slate-600">{t.home.stats.companies}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50,000+</div>
              <div className="text-slate-600">{t.home.stats.products}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">25+</div>
              <div className="text-slate-600">{t.home.stats.yearsExperience}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-slate-600">{t.home.stats.serviceAvailable}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t.home.ourCompanies}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyCards.map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 group"
              >
                <div className="w-16 h-16 rounded-xl mb-4 overflow-hidden shadow-md">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition">
                  {company.name}
                </h3>
                <p className="text-sm text-slate-500 mb-2">{company.tagline}</p>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{company.description}</p>
                <div className="flex flex-wrap gap-2">
                  {company.categories.map((category: string) => (
                    <span
                      key={category}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                    >
                      {category.split(' (')[0]}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.home.needHelp}</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.home.helpDescription}
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            {t.home.startChat}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">DEMA Group</h3>
              <p className="text-slate-400 text-sm">
                {t.footer.description}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.companies}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                {companyCards.map((c) => (
                  <li key={c.id}>
                    <Link href={`/company/${c.id}`} className="hover:text-white transition">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.contact}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Ovenstraat 11</li>
                <li>8800 Roeselare, Belgium</li>
                <li>+32 (0)51 20 51 41</li>
                <li>info@demagroup.be</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.common.languages}</h4>
              <LanguageSwitcher />
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            © 2024 DEMA Group. {t.footer.allRightsReserved}
          </div>
        </div>
      </footer>
    </main>
  )
}
