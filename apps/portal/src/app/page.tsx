'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronRight, Building2 } from 'lucide-react'
import { companies } from '@/config/brands'
import { productCategories, searchProducts, type Product } from '@/config/catalog'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function HomePage() {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      const results = searchProducts(query)
      setSearchResults(results.slice(0, 8))
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || companyId
  }

  const getCategoryName = (category: typeof productCategories[0]) => {
    if (language === 'nl') return category.name_nl
    if (language === 'fr') return category.name_fr
    return category.name
  }

  const getSubcategoryName = (subcategory: typeof productCategories[0]['subcategories'][0]) => {
    if (language === 'nl') return subcategory.name_nl
    if (language === 'fr') return subcategory.name_fr
    return subcategory.name
  }

  const getProductName = (product: Product) => {
    if (language === 'nl') return product.name_nl
    if (language === 'fr') return product.name_fr
    return product.name
  }

  return (
    <main className="min-h-screen">
      {/* Language Switcher Header */}
      <div className="bg-slate-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white">Admin</Link>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t.home.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              {t.home.subtitle}
            </p>
            
            {/* Product Search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'nl' ? 'Zoek producten, categorieën of merken...' : language === 'fr' ? 'Rechercher produits, catégories ou marques...' : 'Search products, categories or brands...'}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 text-lg focus:ring-4 focus:ring-blue-500/50 outline-none"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border overflow-hidden z-50">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{getProductName(product)}</p>
                        <p className="text-sm text-slate-500">
                          {product.companies.map(getCompanyName).join(', ')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  ))}
                  <Link
                    href={`/products?q=${encodeURIComponent(searchQuery)}`}
                    className="block px-4 py-3 bg-slate-50 text-blue-600 font-medium hover:bg-slate-100 text-center"
                  >
                    {language === 'nl' ? 'Alle resultaten bekijken' : language === 'fr' ? 'Voir tous les résultats' : 'View all results'} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories - Full Expanded View */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              {language === 'nl' ? 'Onze Producten' : language === 'fr' ? 'Nos Produits' : 'Our Products'}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              {language === 'nl' 
                ? 'Ontdek ons uitgebreid gamma van meer dan 50.000 producten verdeeld over 8 hoofdcategorieën' 
                : language === 'fr' 
                ? 'Découvrez notre large gamme de plus de 50 000 produits répartis en 8 catégories principales'
                : 'Explore our extensive range of over 50,000 products across 8 main categories'}
            </p>
          </div>

          {/* All Categories with Full Details */}
          <div className="space-y-12">
            {productCategories.map((category, categoryIndex) => (
              <div 
                key={category.id} 
                className={`rounded-2xl overflow-hidden ${categoryIndex % 2 === 0 ? 'bg-slate-50' : 'bg-gradient-to-r from-blue-50 to-slate-50'}`}
              >
                {/* Category Header */}
                <div className="p-6 border-b bg-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-3xl">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {getCategoryName(category)}
                        </h3>
                        <p className="text-slate-500">
                          {language === 'nl' ? category.description_nl : category.description}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          {language === 'nl' ? 'Beschikbaar bij' : language === 'fr' ? 'Disponible chez' : 'Available at'}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {category.companies.map((companyId) => (
                            <Link
                              key={companyId}
                              href={`/company/${companyId}`}
                              className="px-2 py-0.5 bg-white rounded text-xs font-medium text-blue-600 hover:bg-blue-50 border"
                            >
                              {getCompanyName(companyId)}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/products?category=${category.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                      >
                        {language === 'nl' ? 'Bekijk alles' : language === 'fr' ? 'Voir tout' : 'View all'}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Subcategories Grid */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.subcategories.map((subcategory) => (
                      <div 
                        key={subcategory.id} 
                        className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition group"
                      >
                        {/* Subcategory Header */}
                        <div className="p-4 border-b bg-slate-50/50">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {getSubcategoryName(subcategory)}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {subcategory.products.length} {language === 'nl' ? 'producten' : language === 'fr' ? 'produits' : 'products'}
                          </p>
                        </div>

                        {/* Products List */}
                        <div className="p-4">
                          <ul className="space-y-2">
                            {subcategory.products.map((product) => (
                              <li key={product.id}>
                                <Link
                                  href={`/products/${product.id}`}
                                  className="flex items-start gap-2 text-sm text-slate-600 hover:text-blue-600 transition"
                                >
                                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-300" />
                                  <span>{getProductName(product)}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Subcategory Footer - Companies */}
                        <div className="px-4 pb-4">
                          <div className="flex flex-wrap gap-1">
                            {subcategory.products[0]?.companies.slice(0, 2).map((companyId) => (
                              <span 
                                key={companyId}
                                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded"
                              >
                                {getCompanyName(companyId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile View All Button */}
                  <div className="md:hidden mt-4 flex justify-center">
                    <Link
                      href={`/products?category=${category.id}`}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      {language === 'nl' ? 'Bekijk alle producten' : language === 'fr' ? 'Voir tous les produits' : 'View all products'}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section - Now Secondary */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {language === 'nl' ? 'Onze Bedrijven' : language === 'fr' ? 'Nos Entreprises' : 'Our Companies'}
            </h2>
            <p className="text-slate-500">
              {language === 'nl' ? '5 gespecialiseerde bedrijven voor al uw behoeften' : language === 'fr' ? '5 entreprises spécialisées pour tous vos besoins' : '5 specialized companies for all your needs'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {companies.map((company) => {
              const companyKey = company.id as keyof typeof t.companies
              const translations = t.companies[companyKey]
              return (
                <Link
                  key={company.id}
                  href={`/company/${company.id}`}
                  className="bg-slate-50 hover:bg-white rounded-xl p-4 text-center group transition border hover:border-blue-200 hover:shadow-md"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-sm group-hover:text-blue-600 transition">{company.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {translations?.tagline || company.tagline}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-blue-100 text-sm">{t.home.stats.products}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5</div>
              <div className="text-blue-100 text-sm">{t.home.stats.companies}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">25+</div>
              <div className="text-blue-100 text-sm">{t.home.stats.yearsExperience}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-blue-100 text-sm">{t.home.stats.serviceAvailable}</div>
            </div>
          </div>
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
                {companies.map((c) => (
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
