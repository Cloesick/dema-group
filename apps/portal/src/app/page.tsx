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

      {/* Product Categories - Full Expanded View with Images */}
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
          <div className="space-y-16">
            {productCategories.map((category, categoryIndex) => (
              <div 
                key={category.id} 
                className="relative"
              >
                {/* Category Hero Banner */}
                <div 
                  className="relative rounded-2xl overflow-hidden mb-6"
                  style={{ backgroundColor: `${category.color}10` }}
                >
                  <div className="absolute inset-0 opacity-5">
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        backgroundImage: `radial-gradient(circle at 30% 50%, ${category.color}40 0%, transparent 50%)`,
                      }}
                    />
                  </div>
                  
                  <div className="relative flex flex-col md:flex-row items-center gap-6 p-8">
                    {/* Category Image */}
                    <div 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      <Image
                        src={category.image}
                        alt={getCategoryName(category)}
                        width={120}
                        height={120}
                        className="w-24 h-24 md:w-28 md:h-28 object-contain filter brightness-0 invert"
                      />
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <span className="text-4xl">{category.icon}</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                          {getCategoryName(category)}
                        </h3>
                      </div>
                      <p className="text-slate-600 mb-4 max-w-xl">
                        {language === 'nl' ? category.description_nl : category.description}
                      </p>
                      
                      {/* Company Badges */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                        <span className="text-sm text-slate-500">
                          {language === 'nl' ? 'Beschikbaar bij:' : language === 'fr' ? 'Disponible chez:' : 'Available at:'}
                        </span>
                        {category.companies.map((companyId) => (
                          <Link
                            key={companyId}
                            href={`/company/${companyId}`}
                            className="px-3 py-1 bg-white rounded-full text-sm font-medium hover:shadow-md transition border"
                            style={{ color: category.color }}
                          >
                            {getCompanyName(companyId)}
                          </Link>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                        <div>
                          <span className="font-bold text-lg" style={{ color: category.color }}>
                            {category.subcategories.length}
                          </span>
                          <span className="text-slate-500 ml-1">
                            {language === 'nl' ? 'subcategorieën' : language === 'fr' ? 'sous-catégories' : 'subcategories'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-lg" style={{ color: category.color }}>
                            {category.subcategories.reduce((acc, sub) => acc + sub.products.length, 0)}
                          </span>
                          <span className="text-slate-500 ml-1">
                            {language === 'nl' ? 'producten' : language === 'fr' ? 'produits' : 'products'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View All Button */}
                    <div className="hidden md:block">
                      <Link
                        href={`/products?category=${category.id}`}
                        className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition flex items-center gap-2 font-semibold shadow-lg"
                        style={{ backgroundColor: category.color }}
                      >
                        {language === 'nl' ? 'Bekijk alles' : language === 'fr' ? 'Voir tout' : 'View all'}
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Subcategories Grid - Card Style with Images */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.subcategories.map((subcategory, subIndex) => {
                    // Map subcategory to image
                    const subcategoryImages: Record<string, string> = {
                      'centrifugal-pumps': '/images/subcategories/centrifugal-pump.svg',
                      'submersible-pumps': '/images/subcategories/submersible-pump.svg',
                      'piston-pumps': '/images/subcategories/centrifugal-pump.svg',
                      'pump-accessories': '/images/subcategories/pressure-gauge.svg',
                      'plastic-pipes': '/images/subcategories/pipe-fitting.svg',
                      'metal-pipes': '/images/subcategories/pipe-fitting.svg',
                      'fittings': '/images/subcategories/pipe-fitting.svg',
                      'industrial-hoses': '/images/subcategories/hose-coupling.svg',
                      'couplings': '/images/subcategories/hose-coupling.svg',
                      'ball-valves': '/images/subcategories/ball-valve.svg',
                      'butterfly-valves': '/images/subcategories/butterfly-valve.svg',
                      'check-valves': '/images/subcategories/ball-valve.svg',
                      'actuators': '/images/subcategories/actuator.svg',
                      'sprinklers': '/images/subcategories/sprinkler.svg',
                      'drip-irrigation': '/images/subcategories/drip-irrigation.svg',
                      'irrigation-controls': '/images/subcategories/pressure-gauge.svg',
                      'industrial-belts': '/images/subcategories/conveyor-belt.svg',
                      'food-grade-belts': '/images/subcategories/conveyor-belt.svg',
                      'belt-accessories': '/images/subcategories/conveyor-belt.svg',
                      'screws': '/images/subcategories/screw-fastener.svg',
                      'nuts-washers': '/images/subcategories/screw-fastener.svg',
                      'standoffs-spacers': '/images/subcategories/screw-fastener.svg',
                      'power-tools': '/images/subcategories/power-tool.svg',
                      'pressure-washers': '/images/subcategories/power-tool.svg',
                      'compressors': '/images/subcategories/power-tool.svg',
                    }
                    const subcatImage = subcategoryImages[subcategory.id] || category.image
                    
                    return (
                      <Link
                        key={subcategory.id}
                        href={`/products?category=${category.id}&subcategory=${subcategory.id}`}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group overflow-hidden"
                      >
                        {/* Image Container */}
                        <div 
                          className="h-40 flex items-center justify-center p-6"
                          style={{ backgroundColor: `${category.color}08` }}
                        >
                          <Image
                            src={subcatImage}
                            alt={getSubcategoryName(subcategory)}
                            width={120}
                            height={120}
                            className="w-28 h-28 object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 border-t" style={{ borderTopColor: `${category.color}20` }}>
                          <h4 
                            className="font-bold text-slate-900 group-hover:text-blue-600 transition text-center"
                          >
                            {getSubcategoryName(subcategory)}
                          </h4>
                          <p className="text-sm text-slate-500 text-center mt-2 line-clamp-2">
                            {subcategory.products.map(p => getProductName(p)).slice(0, 2).join(', ')}
                            {subcategory.products.length > 2 && ` +${subcategory.products.length - 2}`}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile View All Button */}
                <div className="md:hidden mt-6 flex justify-center">
                  <Link
                    href={`/products?category=${category.id}`}
                    className="px-6 py-3 text-white rounded-xl transition flex items-center gap-2 font-semibold"
                    style={{ backgroundColor: category.color }}
                  >
                    {language === 'nl' ? 'Bekijk alle producten' : language === 'fr' ? 'Voir tous les produits' : 'View all products'}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
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
