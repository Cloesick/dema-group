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

      {/* Product Categories Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            {language === 'nl' ? 'Productcategorieën' : language === 'fr' ? 'Catégories de Produits' : 'Product Categories'}
          </h2>
          <p className="text-slate-500 text-center mb-8">
            {language === 'nl' ? 'Ontdek ons uitgebreid gamma producten' : language === 'fr' ? 'Découvrez notre large gamme de produits' : 'Explore our extensive range of products'}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {productCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group bg-slate-50 hover:bg-blue-50 rounded-xl p-5 transition border hover:border-blue-200"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition">
                  {getCategoryName(category)}
                </h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {language === 'nl' ? category.description_nl : category.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span key={sub.id} className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded">
                      {getSubcategoryName(sub)}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs text-slate-400">+{category.subcategories.length - 3}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products by Category */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          {productCategories.slice(0, 4).map((category) => (
            <div key={category.id} className="mb-12 last:mb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-bold">{getCategoryName(category)}</h3>
                </div>
                <Link 
                  href={`/products?category=${category.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  {language === 'nl' ? 'Alles bekijken' : language === 'fr' ? 'Voir tout' : 'View all'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.subcategories.slice(0, 4).map((subcategory) => (
                  <div key={subcategory.id} className="bg-white rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">{getSubcategoryName(subcategory)}</h4>
                    <ul className="space-y-1">
                      {subcategory.products.slice(0, 3).map((product) => (
                        <li key={product.id}>
                          <Link 
                            href={`/products/${product.id}`}
                            className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1"
                          >
                            <ChevronRight className="w-3 h-3" />
                            {getProductName(product)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {subcategory.products.length > 3 && (
                      <p className="text-xs text-slate-400 mt-2">
                        +{subcategory.products.length - 3} {language === 'nl' ? 'meer' : language === 'fr' ? 'plus' : 'more'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
