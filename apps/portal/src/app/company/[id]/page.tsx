'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { getCompanyById, companies } from '@/config/brands'
import { getProductsByCompanyId } from '@/config/products'
import { Phone, Mail, MapPin, ExternalLink, ArrowLeft } from 'lucide-react'

export default function CompanyPage() {
  const params = useParams()
  const companyId = params.id as string
  const company = getCompanyById(companyId)
  const products = getProductsByCompanyId(companyId)

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section with Company Branding */}
      <section 
        className="py-16 text-white relative overflow-hidden"
        style={{ backgroundColor: company.colors.primary }}
      >
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `url(${company.hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={20} />
            Back to DEMA Group
          </Link>
          
          <div className="flex items-center gap-6 mb-6">
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl bg-white/20 backdrop-blur"
            >
              {company.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
              <p className="text-xl text-white/90">{company.tagline}</p>
            </div>
          </div>
          
          <p className="text-lg text-white/80 max-w-3xl mb-8">
            {company.description}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
            >
              Visit Website
              <ExternalLink size={18} />
            </a>
            <Link 
              href={`/company/${company.id}/products`}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info Bar */}
      <section 
        className="py-4 border-b"
        style={{ backgroundColor: company.colors.background }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            {company.contact.phone && (
              <a 
                href={`tel:${company.contact.phone}`}
                className="flex items-center gap-2 hover:opacity-70 transition"
                style={{ color: company.colors.primary }}
              >
                <Phone size={16} />
                {company.contact.phone}
              </a>
            )}
            {company.contact.email && (
              <a 
                href={`mailto:${company.contact.email}`}
                className="flex items-center gap-2 hover:opacity-70 transition"
                style={{ color: company.colors.primary }}
              >
                <Mail size={16} />
                {company.contact.email}
              </a>
            )}
            {company.contact.address && (
              <span 
                className="flex items-center gap-2"
                style={{ color: company.colors.text }}
              >
                <MapPin size={16} />
                {company.contact.address}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Our Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group"
                >
                  <div className="aspect-square bg-slate-50 p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4">
                    <h3 
                      className="font-semibold mb-1"
                      style={{ color: company.colors.primary }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-600">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Categories */}
      <section className="py-16" style={{ backgroundColor: company.colors.background }}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Product Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.categories.map((category) => (
              <div 
                key={category}
                className="p-4 rounded-lg border bg-white hover:shadow-md transition cursor-pointer"
                style={{ borderColor: `${company.colors.primary}30` }}
              >
                <div 
                  className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: company.colors.primary }}
                >
                  {company.icon}
                </div>
                <h3 className="font-semibold" style={{ color: company.colors.text }}>
                  {category.split(' (')[0]}
                </h3>
                {category.includes('(') && (
                  <p className="text-sm text-slate-500">
                    {category.match(/\(([^)]+)\)/)?.[1]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section 
        className="py-16"
        style={{ backgroundColor: company.colors.background }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.services.map((service) => (
              <div 
                key={service}
                className="p-4 bg-white rounded-lg shadow-sm"
              >
                <div 
                  className="w-2 h-2 rounded-full mb-3"
                  style={{ backgroundColor: company.colors.primary }}
                />
                <h3 className="font-semibold" style={{ color: company.colors.text }}>
                  {service.split(' (')[0]}
                </h3>
                {service.includes('(') && (
                  <p className="text-sm text-slate-500">
                    {service.match(/\(([^)]+)\)/)?.[1]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Markets */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Industries We Serve</h2>
          <div className="flex flex-wrap gap-3">
            {company.targetMarkets.map((market) => (
              <span 
                key={market}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${company.colors.primary}15`,
                  color: company.colors.primary,
                }}
              >
                {market}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Other Companies */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Other DEMA Group Companies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies
              .filter((c) => c.id !== company.id)
              .map((otherCompany) => (
                <Link
                  key={otherCompany.id}
                  href={`/company/${otherCompany.id}`}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition group"
                >
                  <div 
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-lg"
                    style={{ backgroundColor: otherCompany.colors.primary }}
                  >
                    {otherCompany.icon}
                  </div>
                  <h3 className="font-semibold group-hover:text-blue-600 transition">
                    {otherCompany.name}
                  </h3>
                  <p className="text-sm text-slate-500">{otherCompany.tagline}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-8 text-white"
        style={{ backgroundColor: company.colors.secondary }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            © 2024 {company.name} - Part of DEMA Group. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
