'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ChevronRight, 
  Heart, 
  Share2, 
  Download, 
  Play,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  Shield,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { Product, ProductSpecification } from '@/types'

// =============================================================================
// PRODUCT DETAIL PAGE - BLUEPRINT
// =============================================================================
// This page displays full product details including:
// - Image gallery with zoom
// - Pricing (B2B, shown after login)
// - Specifications table
// - Documents & downloads
// - Cross-references
// - Compatibility info
// - Related products
// - Stock status per warehouse
// =============================================================================

// Mock product data - Replace with actual API call
const mockProduct: Product = {
  id: 'pump-001',
  sku: 'DEMA-CP-100',
  name: 'Centrifugal Pump CP-100',
  name_nl: 'Centrifugaalpomp CP-100',
  name_fr: 'Pompe Centrifuge CP-100',
  slug: 'centrifugal-pump-cp-100',
  categoryId: 'pumps',
  subcategoryId: 'centrifugal-pumps',
  brandId: 'dema',
  shortDescription: 'High-performance centrifugal pump for industrial applications',
  shortDescription_nl: 'Hoogwaardige centrifugaalpomp voor industriële toepassingen',
  shortDescription_fr: 'Pompe centrifuge haute performance pour applications industrielles',
  longDescription: 'The CP-100 is a robust centrifugal pump designed for demanding industrial environments. Features include a cast iron housing, stainless steel impeller, and mechanical seal for long service life.',
  longDescription_nl: 'De CP-100 is een robuuste centrifugaalpomp ontworpen voor veeleisende industriële omgevingen. Kenmerken zijn onder meer een gietijzeren behuizing, roestvrijstalen waaier en mechanische afdichting voor een lange levensduur.',
  longDescription_fr: 'La CP-100 est une pompe centrifuge robuste conçue pour les environnements industriels exigeants.',
  pricing: {
    currency: 'EUR',
    listPrice: 1250.00,
    tiers: [
      { minQuantity: 1, price: 1250.00 },
      { minQuantity: 5, price: 1187.50, discount: 5 },
      { minQuantity: 10, price: 1125.00, discount: 10 },
    ]
  },
  images: [
    { id: '1', url: '/images/products/dema-pump.svg', alt: 'Centrifugal Pump CP-100', isPrimary: true, sortOrder: 1, type: 'product' },
    { id: '2', url: '/images/subcategories/centrifugal-pump.svg', alt: 'Technical view', isPrimary: false, sortOrder: 2, type: 'technical' },
  ],
  documents: [
    { id: '1', type: 'datasheet', title: 'Technical Datasheet', title_nl: 'Technische Datasheet', title_fr: 'Fiche Technique', url: '/docs/cp-100-datasheet.pdf', fileSize: 2500000, language: 'multi' },
    { id: '2', type: 'manual', title: 'Installation Manual', title_nl: 'Installatiehandleiding', title_fr: 'Manuel d\'Installation', url: '/docs/cp-100-manual.pdf', fileSize: 5000000, language: 'multi' },
    { id: '3', type: 'certificate', title: 'CE Certificate', title_nl: 'CE Certificaat', title_fr: 'Certificat CE', url: '/docs/cp-100-ce.pdf', fileSize: 500000, language: 'en' },
  ],
  videos: [
    { id: '1', type: 'installation', title: 'Installation Guide', title_nl: 'Installatiegids', url: 'https://youtube.com/embed/xxx', thumbnailUrl: '/images/video-thumb.jpg', duration: 480 },
  ],
  specifications: [
    { id: '1', groupId: 'performance', groupName: 'Performance', groupName_nl: 'Prestaties', name: 'Flow Rate', name_nl: 'Debiet', name_fr: 'Débit', value: '100', unit: 'm³/h', sortOrder: 1, isFilterable: true, filterType: 'range' },
    { id: '2', groupId: 'performance', groupName: 'Performance', groupName_nl: 'Prestaties', name: 'Head', name_nl: 'Opvoerhoogte', name_fr: 'Hauteur', value: '50', unit: 'm', sortOrder: 2, isFilterable: true, filterType: 'range' },
    { id: '3', groupId: 'performance', groupName: 'Performance', groupName_nl: 'Prestaties', name: 'Power', name_nl: 'Vermogen', name_fr: 'Puissance', value: '7.5', unit: 'kW', sortOrder: 3, isFilterable: true, filterType: 'range' },
    { id: '4', groupId: 'dimensions', groupName: 'Dimensions', groupName_nl: 'Afmetingen', name: 'Inlet', name_nl: 'Inlaat', name_fr: 'Entrée', value: 'DN80', unit: '', sortOrder: 1, isFilterable: true, filterType: 'exact' },
    { id: '5', groupId: 'dimensions', groupName: 'Dimensions', groupName_nl: 'Afmetingen', name: 'Outlet', name_nl: 'Uitlaat', name_fr: 'Sortie', value: 'DN65', unit: '', sortOrder: 2, isFilterable: true, filterType: 'exact' },
    { id: '6', groupId: 'materials', groupName: 'Materials', groupName_nl: 'Materialen', name: 'Housing', name_nl: 'Behuizing', name_fr: 'Corps', value: 'Cast Iron GG25', unit: '', sortOrder: 1, isFilterable: true, filterType: 'exact' },
    { id: '7', groupId: 'materials', groupName: 'Materials', groupName_nl: 'Materialen', name: 'Impeller', name_nl: 'Waaier', name_fr: 'Roue', value: 'Stainless Steel 316', unit: '', sortOrder: 2, isFilterable: true, filterType: 'exact' },
    { id: '8', groupId: 'materials', groupName: 'Materials', groupName_nl: 'Materialen', name: 'Seal', name_nl: 'Afdichting', name_fr: 'Joint', value: 'Mechanical (Carbon/SiC)', unit: '', sortOrder: 3, isFilterable: false },
  ],
  crossReferences: [
    { type: 'oem', brand: 'Grundfos', partNumber: 'NK 100-200' },
    { type: 'competitor', brand: 'KSB', partNumber: 'Etanorm 100-200' },
    { type: 'equivalent', brand: 'Lowara', partNumber: 'e-NSC 100-200' },
  ],
  compatibility: [
    { machineType: 'Irrigation System', brand: 'Various', model: 'All standard systems', notes: 'Suitable for agricultural irrigation' },
    { machineType: 'Industrial Process', brand: 'Various', model: 'Water circulation', notes: 'Cooling and heating systems' },
  ],
  relatedProducts: ['pump-002', 'pump-003'],
  accessories: ['seal-kit-001', 'coupling-001', 'baseplate-001'],
  alternatives: ['pump-101', 'pump-102'],
  stockStatus: {
    inStock: true,
    quantity: 15,
    warehouses: [
      { warehouseId: 'roeselare', warehouseName: 'Roeselare (BE)', quantity: 10, reserved: 2, available: 8 },
      { warehouseId: 'nl', warehouseName: 'Netherlands', quantity: 5, reserved: 0, available: 5 },
    ],
    nextDeliveryDate: '2024-01-15',
    nextDeliveryQuantity: 20,
  },
  leadTime: 3,
  minOrderQuantity: 1,
  orderMultiple: 1,
  dimensions: { length: 450, width: 280, height: 320 },
  weight: 45,
  companies: ['dema', 'fluxer'],
  metaTitle: 'Centrifugal Pump CP-100 | DEMA Group',
  metaDescription: 'High-performance centrifugal pump for industrial applications. Flow rate 100 m³/h, head 50m.',
  keywords: ['centrifugal pump', 'industrial pump', 'water pump', 'CP-100'],
  status: 'active',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-10',
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'specs' | 'docs' | 'cross' | 'compat'>('specs')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['performance', 'dimensions', 'materials'])
  
  // TODO: Replace with actual data fetching
  const product = mockProduct
  const language = 'nl' // TODO: Get from context
  
  // Group specifications by groupId
  const specGroups = product.specifications.reduce((acc, spec) => {
    if (!acc[spec.groupId]) {
      acc[spec.groupId] = {
        name: spec.groupName,
        name_nl: spec.groupName_nl,
        specs: []
      }
    }
    acc[spec.groupId].specs.push(spec)
    return acc
  }, {} as Record<string, { name: string; name_nl: string; specs: ProductSpecification[] }>)
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    )
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  const getDocIcon = (type: string) => {
    switch (type) {
      case 'datasheet': return '📊'
      case 'manual': return '📖'
      case 'certificate': return '🏆'
      case 'drawing': return '📐'
      case 'safety': return '⚠️'
      default: return '📄'
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link href="/products" className="text-slate-500 hover:text-blue-600">
              {language === 'nl' ? 'Producten' : 'Products'}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link href={`/products?category=${product.categoryId}`} className="text-slate-500 hover:text-blue-600">
              {language === 'nl' ? 'Pompen' : 'Pumps'}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">{language === 'nl' ? product.name_nl : product.name}</span>
          </nav>
        </div>
      </div>
      
      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl p-8 border aspect-square flex items-center justify-center">
              <Image
                src={product.images[selectedImage]?.url || '/images/placeholder.svg'}
                alt={product.images[selectedImage]?.alt || product.name}
                width={500}
                height={500}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg border-2 p-2 transition ${
                      selectedImage === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={60}
                      height={60}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Video Preview */}
            {product.videos.length > 0 && (
              <button className="w-full bg-slate-900 text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-slate-800 transition">
                <Play className="w-5 h-5" />
                <span>{language === 'nl' ? 'Bekijk installatievideo' : 'Watch installation video'}</span>
              </button>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-500">SKU: {product.sku}</span>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-blue-600 font-medium">DEMA</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                {language === 'nl' ? product.name_nl : product.name}
              </h1>
              <p className="text-slate-600">
                {language === 'nl' ? product.shortDescription_nl : product.shortDescription}
              </p>
            </div>
            
            {/* Stock Status */}
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-900">
                  {language === 'nl' ? 'Beschikbaarheid' : 'Availability'}
                </span>
                {product.stockStatus.inStock ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {language === 'nl' ? 'Op voorraad' : 'In Stock'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <Clock className="w-4 h-4" />
                    {language === 'nl' ? 'Levertijd' : 'Lead time'}: {product.leadTime} {language === 'nl' ? 'dagen' : 'days'}
                  </span>
                )}
              </div>
              
              {/* Warehouse Stock */}
              <div className="space-y-2">
                {product.stockStatus.warehouses.map(wh => (
                  <div key={wh.warehouseId} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{wh.warehouseName}</span>
                    <span className={wh.available > 0 ? 'text-green-600' : 'text-slate-400'}>
                      {wh.available} {language === 'nl' ? 'beschikbaar' : 'available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pricing - B2B (requires login) */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    {language === 'nl' ? 'Uw prijs' : 'Your price'}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    €{product.pricing.listPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {language === 'nl' ? 'excl. BTW' : 'excl. VAT'}
                  </p>
                </div>
                
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(product.minOrderQuantity, quantity - 1))}
                    className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center hover:bg-slate-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.minOrderQuantity, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 text-center border rounded-lg font-medium"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center hover:bg-slate-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Tier Pricing */}
              {product.pricing.tiers.length > 1 && (
                <div className="mb-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {language === 'nl' ? 'Staffelprijzen' : 'Volume pricing'}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {product.pricing.tiers.map((tier, i) => (
                      <div key={i} className={`text-center p-2 rounded ${quantity >= tier.minQuantity ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>
                        <p className="font-medium">{tier.minQuantity}+</p>
                        <p>€{tier.price.toFixed(2)}</p>
                        {tier.discount && <p className="text-xs">-{tier.discount}%</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add to Cart */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 px-6 font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {language === 'nl' ? 'Toevoegen aan winkelwagen' : 'Add to Cart'}
                </button>
                <button className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-slate-50 transition">
                  <Heart className="w-5 h-5 text-slate-400" />
                </button>
                <button className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-slate-50 transition">
                  <Share2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Truck className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium">{language === 'nl' ? 'Snelle levering' : 'Fast delivery'}</p>
                  <p className="text-slate-500">{language === 'nl' ? 'Binnen 24-48u' : 'Within 24-48h'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium">{language === 'nl' ? '2 jaar garantie' : '2 year warranty'}</p>
                  <p className="text-slate-500">{language === 'nl' ? 'Fabrieksgarantie' : 'Factory warranty'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Phone className="w-5 h-5 text-orange-600" />
                <div className="text-sm">
                  <p className="font-medium">{language === 'nl' ? 'Technisch advies' : 'Technical advice'}</p>
                  <p className="text-slate-500">+32 51 20 51 41</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div className="text-sm">
                  <p className="font-medium">{language === 'nl' ? 'Beschikbaar bij' : 'Available at'}</p>
                  <p className="text-slate-500">{product.companies.length} {language === 'nl' ? 'bedrijven' : 'companies'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'specs', label: language === 'nl' ? 'Specificaties' : 'Specifications' },
              { id: 'docs', label: language === 'nl' ? 'Documenten' : 'Documents' },
              { id: 'cross', label: language === 'nl' ? 'Kruisverwijzingen' : 'Cross References' },
              { id: 'compat', label: language === 'nl' ? 'Compatibiliteit' : 'Compatibility' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {Object.entries(specGroups).map(([groupId, group]) => (
                  <div key={groupId} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGroup(groupId)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <span className="font-semibold text-slate-900">
                        {language === 'nl' ? group.name_nl : group.name}
                      </span>
                      {expandedGroups.includes(groupId) ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    {expandedGroups.includes(groupId) && (
                      <div className="divide-y">
                        {group.specs.map(spec => (
                          <div key={spec.id} className="flex items-center justify-between p-4">
                            <span className="text-slate-600">
                              {language === 'nl' ? spec.name_nl : spec.name}
                            </span>
                            <span className="font-medium text-slate-900">
                              {spec.value} {spec.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Documents Tab */}
            {activeTab === 'docs' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition group"
                  >
                    <span className="text-3xl">{getDocIcon(doc.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 group-hover:text-blue-600 truncate">
                        {language === 'nl' ? doc.title_nl : doc.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {doc.type.toUpperCase()} • {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </a>
                ))}
              </div>
            )}
            
            {/* Cross References Tab */}
            {activeTab === 'cross' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-slate-900">
                        {language === 'nl' ? 'Type' : 'Type'}
                      </th>
                      <th className="text-left p-3 font-semibold text-slate-900">
                        {language === 'nl' ? 'Merk' : 'Brand'}
                      </th>
                      <th className="text-left p-3 font-semibold text-slate-900">
                        {language === 'nl' ? 'Artikelnummer' : 'Part Number'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {product.crossReferences.map((ref, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ref.type === 'oem' ? 'bg-blue-100 text-blue-700' :
                            ref.type === 'competitor' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {ref.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{ref.brand}</td>
                        <td className="p-3 font-mono text-sm">{ref.partNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Compatibility Tab */}
            {activeTab === 'compat' && (
              <div className="space-y-4">
                {product.compatibility.map((comp, i) => (
                  <div key={i} className="p-4 border rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🔧</span>
                      <div>
                        <p className="font-semibold text-slate-900">{comp.machineType}</p>
                        <p className="text-sm text-slate-500">{comp.brand} - {comp.model}</p>
                      </div>
                    </div>
                    {comp.notes && (
                      <p className="text-sm text-slate-600 ml-11">{comp.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Long Description */}
        <div className="mt-8 bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {language === 'nl' ? 'Productbeschrijving' : 'Product Description'}
          </h2>
          <div className="prose prose-slate max-w-none">
            <p>{language === 'nl' ? product.longDescription_nl : product.longDescription}</p>
          </div>
        </div>
        
        {/* Related Products Placeholder */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {language === 'nl' ? 'Gerelateerde producten' : 'Related Products'}
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border p-4 hover:shadow-lg transition">
                <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl text-slate-300">📦</span>
                </div>
                <p className="font-medium text-slate-900 mb-1">Related Product {i}</p>
                <p className="text-sm text-slate-500">SKU-00{i}</p>
                <p className="text-blue-600 font-semibold mt-2">€XXX.XX</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
