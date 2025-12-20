'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  Navigation,
  Filter,
  List,
  Map as MapIcon,
  ChevronDown,
  ExternalLink,
  Building2
} from 'lucide-react'
import type { Company } from '@/types'

// =============================================================================
// DEALER / COMPANY LOCATOR PAGE - BLUEPRINT
// =============================================================================
// Features:
// - Map view with markers (Leaflet/Google Maps ready)
// - List view with cards
// - Search by location/postal code
// - Filter by category/service
// - Distance calculation
// - Opening hours display
// - Direct contact options
// =============================================================================

// Mock dealer data - Replace with API
const mockDealers: Company[] = [
  {
    id: 'dema-roeselare',
    name: 'DEMA Roeselare',
    slug: 'dema-roeselare',
    type: 'subsidiary',
    logo: '/images/logos/dema-logo.svg',
    colors: { primary: '#E31E24', secondary: '#1A1A1A', accent: '#F5A623' },
    contact: {
      phone: '+32 51 20 51 41',
      phoneSecondary: '+32 51 20 51 42',
      email: 'info@demashop.be',
      emailSales: 'sales@demashop.be',
      emailSupport: 'support@demashop.be',
      website: 'https://www.demashop.be'
    },
    location: {
      address: 'Ovenstraat 11',
      city: 'Roeselare',
      postalCode: '8800',
      province: 'West-Vlaanderen',
      country: 'Belgium',
      countryCode: 'BE',
      coordinates: { lat: 50.9469, lng: 3.1269 }
    },
    description: 'Main DEMA headquarters and showroom with full product range.',
    description_nl: 'DEMA hoofdkantoor en showroom met volledig productgamma.',
    tagline: 'Quality products for agriculture & industry',
    tagline_nl: 'Kwaliteitsproducten voor landbouw & industrie',
    categories: ['pumps', 'pipes', 'irrigation', 'tools'],
    services: ['Sales', 'Technical Support', 'Repairs', 'Training'],
    certifications: ['ISO 9001', 'ISO 14001'],
    openingHours: [
      { day: 'monday', open: '08:00', close: '17:30', isClosed: false },
      { day: 'tuesday', open: '08:00', close: '17:30', isClosed: false },
      { day: 'wednesday', open: '08:00', close: '17:30', isClosed: false },
      { day: 'thursday', open: '08:00', close: '17:30', isClosed: false },
      { day: 'friday', open: '08:00', close: '17:00', isClosed: false },
      { day: 'saturday', open: '09:00', close: '12:00', isClosed: false },
      { day: 'sunday', open: '', close: '', isClosed: true },
    ],
    socialMedia: {
      linkedin: 'https://linkedin.com/company/dema',
      facebook: 'https://facebook.com/demashop',
    },
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'fluxer-antwerp',
    name: 'Fluxer Antwerp',
    slug: 'fluxer-antwerp',
    type: 'subsidiary',
    logo: '/images/logos/fluxer-logo.svg',
    colors: { primary: '#0066B3', secondary: '#003D6B', accent: '#00A3E0' },
    contact: {
      phone: '+32 3 123 45 67',
      email: 'info@fluxer.be',
      website: 'https://www.fluxer.be'
    },
    location: {
      address: 'Industrieweg 25',
      city: 'Antwerp',
      postalCode: '2000',
      province: 'Antwerpen',
      country: 'Belgium',
      countryCode: 'BE',
      coordinates: { lat: 51.2194, lng: 4.4025 }
    },
    description: 'Specialist in industrial valves and process control.',
    description_nl: 'Specialist in industriële afsluiters en procesbesturing.',
    tagline: 'Industrial valve solutions',
    tagline_nl: 'Industriële afsluiteroplossingen',
    categories: ['valves', 'actuators', 'instrumentation'],
    services: ['Sales', 'Engineering', 'Installation', 'Maintenance'],
    certifications: ['ISO 9001', 'ATEX'],
    openingHours: [
      { day: 'monday', open: '08:00', close: '17:00', isClosed: false },
      { day: 'tuesday', open: '08:00', close: '17:00', isClosed: false },
      { day: 'wednesday', open: '08:00', close: '17:00', isClosed: false },
      { day: 'thursday', open: '08:00', close: '17:00', isClosed: false },
      { day: 'friday', open: '08:00', close: '16:00', isClosed: false },
      { day: 'saturday', open: '', close: '', isClosed: true },
      { day: 'sunday', open: '', close: '', isClosed: true },
    ],
    socialMedia: { linkedin: 'https://linkedin.com/company/fluxer' },
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'devisschere-gent',
    name: 'De Visschere Gent',
    slug: 'devisschere-gent',
    type: 'subsidiary',
    logo: '/images/logos/devisschere-logo.svg',
    colors: { primary: '#2E7D32', secondary: '#1B5E20', accent: '#4CAF50' },
    contact: {
      phone: '+32 9 234 56 78',
      email: 'info@devisschere.be',
      website: 'https://www.devisschere.be'
    },
    location: {
      address: 'Tuinbouwlaan 100',
      city: 'Gent',
      postalCode: '9000',
      province: 'Oost-Vlaanderen',
      country: 'Belgium',
      countryCode: 'BE',
      coordinates: { lat: 51.0543, lng: 3.7174 }
    },
    description: 'Irrigation and garden equipment specialist.',
    description_nl: 'Specialist in beregening en tuinuitrusting.',
    tagline: 'Irrigation experts',
    tagline_nl: 'Beregeningsexperts',
    categories: ['irrigation', 'garden', 'pumps'],
    services: ['Sales', 'Design', 'Installation'],
    certifications: ['ISO 9001'],
    openingHours: [
      { day: 'monday', open: '08:30', close: '17:30', isClosed: false },
      { day: 'tuesday', open: '08:30', close: '17:30', isClosed: false },
      { day: 'wednesday', open: '08:30', close: '17:30', isClosed: false },
      { day: 'thursday', open: '08:30', close: '17:30', isClosed: false },
      { day: 'friday', open: '08:30', close: '17:00', isClosed: false },
      { day: 'saturday', open: '09:00', close: '12:00', isClosed: false },
      { day: 'sunday', open: '', close: '', isClosed: true },
    ],
    socialMedia: {},
    isActive: true,
    isFeatured: false,
  },
  {
    id: 'beltz247-brussels',
    name: 'Beltz247 Brussels',
    slug: 'beltz247-brussels',
    type: 'subsidiary',
    logo: '/images/logos/beltz247-logo.svg',
    colors: { primary: '#FF6B00', secondary: '#E65100', accent: '#FFB74D' },
    contact: {
      phone: '+32 2 345 67 89',
      email: 'info@beltz247.be',
      website: 'https://www.beltz247.be'
    },
    location: {
      address: 'Industriezone Noord 50',
      city: 'Brussels',
      postalCode: '1000',
      province: 'Brussels',
      country: 'Belgium',
      countryCode: 'BE',
      coordinates: { lat: 50.8503, lng: 4.3517 }
    },
    description: '24/7 conveyor belt service and maintenance.',
    description_nl: '24/7 transportband service en onderhoud.',
    tagline: '24/7 Belt Service',
    tagline_nl: '24/7 Bandservice',
    categories: ['conveyor-belts', 'maintenance'],
    services: ['Emergency Service', 'Maintenance', 'Installation', 'Repairs'],
    certifications: ['ISO 9001', 'VCA'],
    openingHours: [
      { day: 'monday', open: '00:00', close: '23:59', isClosed: false },
      { day: 'tuesday', open: '00:00', close: '23:59', isClosed: false },
      { day: 'wednesday', open: '00:00', close: '23:59', isClosed: false },
      { day: 'thursday', open: '00:00', close: '23:59', isClosed: false },
      { day: 'friday', open: '00:00', close: '23:59', isClosed: false },
      { day: 'saturday', open: '00:00', close: '23:59', isClosed: false },
      { day: 'sunday', open: '00:00', close: '23:59', isClosed: false },
    ],
    socialMedia: {},
    isActive: true,
    isFeatured: true,
  },
]

const categoryFilters = [
  { id: 'pumps', name: 'Pumps', name_nl: 'Pompen', icon: '💧' },
  { id: 'valves', name: 'Valves', name_nl: 'Afsluiters', icon: '⚙️' },
  { id: 'irrigation', name: 'Irrigation', name_nl: 'Beregening', icon: '🌱' },
  { id: 'conveyor-belts', name: 'Conveyor Belts', name_nl: 'Transportbanden', icon: '🏭' },
  { id: 'tools', name: 'Tools', name_nl: 'Gereedschap', icon: '🛠️' },
]

const serviceFilters = [
  { id: 'sales', name: 'Sales', name_nl: 'Verkoop' },
  { id: 'repairs', name: 'Repairs', name_nl: 'Reparaties' },
  { id: 'installation', name: 'Installation', name_nl: 'Installatie' },
  { id: 'training', name: 'Training', name_nl: 'Opleiding' },
  { id: '24-7', name: '24/7 Service', name_nl: '24/7 Service' },
]

export default function DealersPage() {
  const [language] = useState<'en' | 'nl'>('nl')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Get current day for opening hours
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as Company['openingHours'][0]['day']
  
  // Check if dealer is currently open
  const isOpen = (dealer: Company) => {
    const today = dealer.openingHours.find(h => h.day === currentDay)
    if (!today || today.isClosed) return false
    
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    return currentTime >= today.open && currentTime <= today.close
  }
  
  // Filter dealers
  const filteredDealers = useMemo(() => {
    return mockDealers.filter(dealer => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          dealer.name.toLowerCase().includes(query) ||
          dealer.location.city.toLowerCase().includes(query) ||
          dealer.location.postalCode.includes(query) ||
          dealer.location.address.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      
      // Category filter
      if (selectedCategories.length > 0) {
        const hasCategory = selectedCategories.some(cat => dealer.categories.includes(cat))
        if (!hasCategory) return false
      }
      
      // Service filter
      if (selectedServices.length > 0) {
        const hasService = selectedServices.some(svc => 
          dealer.services.some(s => s.toLowerCase().includes(svc.toLowerCase()))
        )
        if (!hasService) return false
      }
      
      return true
    })
  }, [searchQuery, selectedCategories, selectedServices])
  
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    )
  }
  
  const toggleService = (svcId: string) => {
    setSelectedServices(prev => 
      prev.includes(svcId) ? prev.filter(s => s !== svcId) : [...prev, svcId]
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'nl' ? 'Vind een dealer' : 'Find a Dealer'}
          </h1>
          <p className="text-blue-100 max-w-2xl">
            {language === 'nl' 
              ? 'Vind de dichtstbijzijnde DEMA Group vestiging of dealer voor professioneel advies en service.'
              : 'Find the nearest DEMA Group location or dealer for professional advice and service.'
            }
          </p>
        </div>
      </div>
      
      {/* Search & Filters */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'nl' ? 'Zoek op stad, postcode of adres...' : 'Search by city, postal code or address...'}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-slate-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>{language === 'nl' ? 'Filters' : 'Filters'}</span>
              {(selectedCategories.length + selectedServices.length) > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length + selectedServices.length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* View Toggle */}
            <div className="flex border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-3 ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <List className="w-5 h-5" />
                <span className="hidden sm:inline">{language === 'nl' ? 'Lijst' : 'List'}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-3 border-l ${
                  viewMode === 'map' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <MapIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{language === 'nl' ? 'Kaart' : 'Map'}</span>
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Category Filters */}
                <div>
                  <p className="font-medium text-slate-900 mb-3">
                    {language === 'nl' ? 'Productcategorieën' : 'Product Categories'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          selectedCategories.includes(cat.id)
                            ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{language === 'nl' ? cat.name_nl : cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Service Filters */}
                <div>
                  <p className="font-medium text-slate-900 mb-3">
                    {language === 'nl' ? 'Services' : 'Services'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {serviceFilters.map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`px-3 py-2 rounded-lg text-sm transition ${
                          selectedServices.includes(svc.id)
                            ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {language === 'nl' ? svc.name_nl : svc.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <p className="text-slate-600 mb-4">
          <span className="font-semibold text-slate-900">{filteredDealers.length}</span>
          {' '}{language === 'nl' ? 'locaties gevonden' : 'locations found'}
        </p>
        
        {viewMode === 'list' ? (
          /* List View */
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDealers.map(dealer => (
              <div 
                key={dealer.id}
                className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition"
              >
                {/* Header with color accent */}
                <div 
                  className="h-2"
                  style={{ backgroundColor: dealer.colors.primary }}
                />
                
                <div className="p-6">
                  {/* Logo & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${dealer.colors.primary}10` }}
                    >
                      <Building2 
                        className="w-8 h-8" 
                        style={{ color: dealer.colors.primary }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">{dealer.name}</h3>
                        {dealer.isFeatured && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">{language === 'nl' ? dealer.tagline_nl : dealer.tagline}</p>
                    </div>
                  </div>
                  
                  {/* Open/Closed Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      isOpen(dealer) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        isOpen(dealer) ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {isOpen(dealer) 
                        ? (language === 'nl' ? 'Nu geopend' : 'Open now')
                        : (language === 'nl' ? 'Gesloten' : 'Closed')
                      }
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-sm text-slate-500">
                      {dealer.openingHours.find(h => h.day === currentDay)?.isClosed
                        ? (language === 'nl' ? 'Vandaag gesloten' : 'Closed today')
                        : `${dealer.openingHours.find(h => h.day === currentDay)?.open} - ${dealer.openingHours.find(h => h.day === currentDay)?.close}`
                      }
                    </span>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-900">{dealer.location.address}</p>
                      <p className="text-slate-500">{dealer.location.postalCode} {dealer.location.city}</p>
                    </div>
                  </div>
                  
                  {/* Contact */}
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a href={`tel:${dealer.contact.phone}`} className="text-blue-600 hover:underline">
                      {dealer.contact.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <a href={`mailto:${dealer.contact.email}`} className="text-blue-600 hover:underline">
                      {dealer.contact.email}
                    </a>
                  </div>
                  
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dealer.categories.slice(0, 4).map(catId => {
                      const cat = categoryFilters.find(c => c.id === catId)
                      return cat ? (
                        <span 
                          key={catId}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                        >
                          {cat.icon} {language === 'nl' ? cat.name_nl : cat.name}
                        </span>
                      ) : null
                    })}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.location.coordinates.lat},${dealer.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Navigation className="w-4 h-4" />
                      {language === 'nl' ? 'Route' : 'Directions'}
                    </a>
                    <a
                      href={dealer.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition"
                    >
                      <Globe className="w-4 h-4" />
                      {language === 'nl' ? 'Website' : 'Website'}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Map View - Placeholder for Leaflet/Google Maps integration */
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="h-[600px] bg-slate-100 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {language === 'nl' ? 'Kaartweergave' : 'Map View'}
                </h3>
                <p className="text-slate-500 max-w-md">
                  {language === 'nl' 
                    ? 'Integreer hier Leaflet of Google Maps voor interactieve kaartweergave met dealer markers.'
                    : 'Integrate Leaflet or Google Maps here for interactive map view with dealer markers.'
                  }
                </p>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-left max-w-md mx-auto">
                  <p className="text-sm font-mono text-slate-600">
                    {/* Map integration code placeholder */}
                    {`// Install: npm install leaflet react-leaflet`}<br/>
                    {`// Or: npm install @react-google-maps/api`}<br/><br/>
                    {`// Dealer coordinates available:`}<br/>
                    {filteredDealers.map(d => (
                      <span key={d.id}>
                        {`{ lat: ${d.location.coordinates.lat}, lng: ${d.location.coordinates.lng} }`}<br/>
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* CTA Section */}
      <div className="bg-slate-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'nl' ? 'Word dealer' : 'Become a Dealer'}
          </h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            {language === 'nl'
              ? 'Interesse om DEMA Group producten te verkopen? Neem contact met ons op voor meer informatie over ons dealerprogramma.'
              : 'Interested in selling DEMA Group products? Contact us for more information about our dealer program.'
            }
          </p>
          <Link
            href="/contact?subject=dealer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            {language === 'nl' ? 'Neem contact op' : 'Contact Us'}
          </Link>
        </div>
      </div>
    </main>
  )
}
