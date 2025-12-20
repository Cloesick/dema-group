'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  Play, 
  Clock, 
  Users, 
  Star,
  Award,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  ChevronRight,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import type { Course, CourseCategory } from '@/types'

// =============================================================================
// ACADEMY / TRAINING PAGE - BLUEPRINT
// =============================================================================
// Features:
// - Course catalog with categories
// - Search and filter courses
// - Course cards with progress
// - Video/text/quiz content types
// - Certification tracking
// - My learning dashboard
// =============================================================================

// Mock courses - Replace with API
const mockCourses: Course[] = [
  {
    id: 'pump-basics',
    slug: 'pump-basics',
    title: 'Pump Fundamentals',
    title_nl: 'Pomp Basiskennis',
    title_fr: 'Fondamentaux des Pompes',
    description: 'Learn the basics of pump technology, selection, and maintenance.',
    description_nl: 'Leer de basis van pomptechnologie, selectie en onderhoud.',
    description_fr: 'Apprenez les bases de la technologie des pompes.',
    category: 'product_training',
    level: 'beginner',
    thumbnail: '/images/subcategories/centrifugal-pump.svg',
    duration: 120,
    modules: [
      {
        id: 'mod-1',
        title: 'Introduction to Pumps',
        title_nl: 'Introductie tot Pompen',
        description: 'Overview of pump types and applications',
        sortOrder: 1,
        duration: 30,
        lessons: [
          { id: 'les-1', title: 'What is a Pump?', title_nl: 'Wat is een Pomp?', type: 'video', duration: 10, sortOrder: 1, content: { videoUrl: 'https://youtube.com/embed/xxx' } },
          { id: 'les-2', title: 'Pump Types Overview', title_nl: 'Overzicht Pomptypes', type: 'video', duration: 15, sortOrder: 2, content: { videoUrl: 'https://youtube.com/embed/xxx' } },
          { id: 'les-3', title: 'Module Quiz', title_nl: 'Module Quiz', type: 'quiz', duration: 5, sortOrder: 3, content: { quizQuestions: [] } },
        ]
      },
      {
        id: 'mod-2',
        title: 'Centrifugal Pumps',
        title_nl: 'Centrifugaalpompen',
        description: 'Deep dive into centrifugal pump technology',
        sortOrder: 2,
        duration: 45,
        lessons: []
      },
      {
        id: 'mod-3',
        title: 'Pump Selection',
        title_nl: 'Pompselectie',
        description: 'How to select the right pump for your application',
        sortOrder: 3,
        duration: 45,
        lessons: []
      }
    ],
    type: 'online',
    isFree: true,
    prerequisites: [],
    targetAudience: ['Technicians', 'Engineers', 'Sales'],
    hasCertificate: true,
    certificateValidityMonths: 24,
    status: 'published',
    publishedAt: '2024-01-01',
    enrollmentCount: 1250,
    averageRating: 4.7,
    reviewCount: 89
  },
  {
    id: 'valve-installation',
    slug: 'valve-installation',
    title: 'Industrial Valve Installation',
    title_nl: 'Industriële Afsluiter Installatie',
    title_fr: 'Installation de Vannes Industrielles',
    description: 'Complete guide to installing industrial valves safely and correctly.',
    description_nl: 'Complete gids voor het veilig en correct installeren van industriële afsluiters.',
    description_fr: 'Guide complet pour installer des vannes industrielles.',
    category: 'installation',
    level: 'intermediate',
    thumbnail: '/images/subcategories/ball-valve.svg',
    duration: 180,
    modules: [],
    type: 'online',
    isFree: false,
    price: 149,
    prerequisites: ['Basic mechanical knowledge'],
    targetAudience: ['Installers', 'Maintenance staff'],
    hasCertificate: true,
    certificateValidityMonths: 36,
    status: 'published',
    publishedAt: '2024-01-15',
    enrollmentCount: 456,
    averageRating: 4.9,
    reviewCount: 34
  },
  {
    id: 'conveyor-maintenance',
    slug: 'conveyor-maintenance',
    title: 'Conveyor Belt Maintenance',
    title_nl: 'Transportband Onderhoud',
    title_fr: 'Maintenance des Bandes Transporteuses',
    description: 'Learn preventive and corrective maintenance for conveyor systems.',
    description_nl: 'Leer preventief en correctief onderhoud voor transportsystemen.',
    description_fr: 'Apprenez la maintenance préventive et corrective.',
    category: 'maintenance',
    level: 'intermediate',
    thumbnail: '/images/subcategories/conveyor-belt.svg',
    duration: 240,
    modules: [],
    type: 'hybrid',
    isFree: false,
    price: 299,
    prerequisites: ['Safety certification'],
    targetAudience: ['Maintenance technicians', 'Plant operators'],
    hasCertificate: true,
    certificateValidityMonths: 24,
    status: 'published',
    publishedAt: '2024-02-01',
    enrollmentCount: 234,
    averageRating: 4.8,
    reviewCount: 21
  },
  {
    id: 'irrigation-design',
    slug: 'irrigation-design',
    title: 'Irrigation System Design',
    title_nl: 'Beregeningssysteem Ontwerp',
    title_fr: 'Conception de Systèmes d\'Irrigation',
    description: 'Design efficient irrigation systems for various applications.',
    description_nl: 'Ontwerp efficiënte beregeningssystemen voor diverse toepassingen.',
    description_fr: 'Concevez des systèmes d\'irrigation efficaces.',
    category: 'technical_skills',
    level: 'advanced',
    thumbnail: '/images/subcategories/sprinkler.svg',
    duration: 360,
    modules: [],
    type: 'onsite',
    isFree: false,
    price: 499,
    prerequisites: ['Pump Fundamentals', 'Basic hydraulics'],
    targetAudience: ['Designers', 'Project managers'],
    hasCertificate: true,
    certificateValidityMonths: 48,
    status: 'published',
    publishedAt: '2024-01-20',
    enrollmentCount: 89,
    averageRating: 4.6,
    reviewCount: 12
  },
  {
    id: 'safety-basics',
    slug: 'safety-basics',
    title: 'Workplace Safety Essentials',
    title_nl: 'Basis Veiligheid op de Werkplek',
    title_fr: 'Essentiels de Sécurité au Travail',
    description: 'Essential safety training for industrial environments.',
    description_nl: 'Essentiële veiligheidstraining voor industriële omgevingen.',
    description_fr: 'Formation essentielle à la sécurité.',
    category: 'safety',
    level: 'beginner',
    thumbnail: '/images/products/dema-tools.svg',
    duration: 60,
    modules: [],
    type: 'online',
    isFree: true,
    prerequisites: [],
    targetAudience: ['All employees'],
    hasCertificate: true,
    certificateValidityMonths: 12,
    status: 'published',
    publishedAt: '2024-01-05',
    enrollmentCount: 2340,
    averageRating: 4.5,
    reviewCount: 156
  },
  {
    id: 'product-sales',
    slug: 'product-sales',
    title: 'DEMA Product Sales Training',
    title_nl: 'DEMA Product Verkooptraining',
    title_fr: 'Formation Vente Produits DEMA',
    description: 'Learn to effectively sell DEMA Group products.',
    description_nl: 'Leer DEMA Group producten effectief verkopen.',
    description_fr: 'Apprenez à vendre efficacement les produits DEMA.',
    category: 'sales',
    level: 'beginner',
    thumbnail: '/images/logos/dema-logo.svg',
    duration: 90,
    modules: [],
    type: 'online',
    isFree: true,
    prerequisites: [],
    targetAudience: ['Sales representatives', 'Dealers'],
    hasCertificate: true,
    certificateValidityMonths: 12,
    status: 'published',
    publishedAt: '2024-02-10',
    enrollmentCount: 567,
    averageRating: 4.4,
    reviewCount: 45
  }
]

const categoryConfig: Record<CourseCategory, { label: string; label_nl: string; icon: React.ReactNode; color: string }> = {
  product_training: { label: 'Product Training', label_nl: 'Producttraining', icon: <BookOpen className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
  technical_skills: { label: 'Technical Skills', label_nl: 'Technische Vaardigheden', icon: <FileText className="w-5 h-5" />, color: 'bg-purple-100 text-purple-700' },
  installation: { label: 'Installation', label_nl: 'Installatie', icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'Maintenance', label_nl: 'Onderhoud', icon: <Clock className="w-5 h-5" />, color: 'bg-orange-100 text-orange-700' },
  safety: { label: 'Safety', label_nl: 'Veiligheid', icon: <Award className="w-5 h-5" />, color: 'bg-red-100 text-red-700' },
  sales: { label: 'Sales', label_nl: 'Verkoop', icon: <Users className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-700' },
}

const levelConfig = {
  beginner: { label: 'Beginner', label_nl: 'Beginner', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermediate', label_nl: 'Gemiddeld', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Advanced', label_nl: 'Gevorderd', color: 'bg-red-100 text-red-700' },
}

export default function AcademyPage() {
  const [language] = useState<'en' | 'nl'>('nl')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | ''>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter courses
  const filteredCourses = mockCourses.filter(course => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        course.title.toLowerCase().includes(query) ||
        course.title_nl.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }
    
    if (selectedCategory && course.category !== selectedCategory) return false
    if (selectedLevel && course.level !== selectedLevel) return false
    if (showFreeOnly && !course.isFree) return false
    
    return true
  })
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8" />
            <span className="text-emerald-200 font-medium">DEMA Academy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'nl' ? 'Leer van de experts' : 'Learn from the Experts'}
          </h1>
          <p className="text-emerald-100 max-w-2xl mb-8">
            {language === 'nl' 
              ? 'Ontwikkel uw vaardigheden met onze professionele trainingen. Van productkennis tot technische installatie - wij hebben de cursus voor u.'
              : 'Develop your skills with our professional training courses. From product knowledge to technical installation - we have the course for you.'
            }
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-300" />
              <span>{mockCourses.length} {language === 'nl' ? 'Cursussen' : 'Courses'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-300" />
              <span>{mockCourses.reduce((acc, c) => acc + c.enrollmentCount, 0).toLocaleString()}+ {language === 'nl' ? 'Deelnemers' : 'Learners'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-300" />
              <span>{mockCourses.filter(c => c.hasCertificate).length} {language === 'nl' ? 'Certificeringen' : 'Certifications'}</span>
            </div>
          </div>
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
                placeholder={language === 'nl' ? 'Zoek cursussen...' : 'Search courses...'}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CourseCategory | '')}
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">{language === 'nl' ? 'Alle categorieën' : 'All categories'}</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {language === 'nl' ? config.label_nl : config.label}
                </option>
              ))}
            </select>
            
            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">{language === 'nl' ? 'Alle niveaus' : 'All levels'}</option>
              {Object.entries(levelConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {language === 'nl' ? config.label_nl : config.label}
                </option>
              ))}
            </select>
            
            {/* Free Only Toggle */}
            <label className="flex items-center gap-2 px-4 py-3 border rounded-xl cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm whitespace-nowrap">
                {language === 'nl' ? 'Alleen gratis' : 'Free only'}
              </span>
            </label>
            
            {/* View Toggle */}
            <div className="flex border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Catalog */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{filteredCourses.length}</span>
            {' '}{language === 'nl' ? 'cursussen gevonden' : 'courses found'}
          </p>
        </div>
        
        {/* Course Grid */}
        <div className={viewMode === 'grid' 
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredCourses.map(course => {
            const catConfig = categoryConfig[course.category]
            const lvlConfig = levelConfig[course.level]
            
            return (
              <Link
                key={course.id}
                href={`/academy/${course.slug}`}
                className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Thumbnail */}
                <div className={`relative ${
                  viewMode === 'grid' ? 'aspect-video' : 'w-48 flex-shrink-0'
                } bg-slate-100 flex items-center justify-center`}>
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={viewMode === 'grid' ? 300 : 150}
                    height={viewMode === 'grid' ? 170 : 100}
                    className="w-24 h-24 object-contain group-hover:scale-110 transition"
                  />
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-5 h-5 text-emerald-600 ml-1" />
                    </div>
                  </div>
                  
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(course.duration)}
                  </div>
                  
                  {/* Free badge */}
                  {course.isFree && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded font-medium">
                      {language === 'nl' ? 'GRATIS' : 'FREE'}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Category & Level */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${catConfig.color}`}>
                      {language === 'nl' ? catConfig.label_nl : catConfig.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${lvlConfig.color}`}>
                      {language === 'nl' ? lvlConfig.label_nl : lvlConfig.label}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition mb-2 line-clamp-2">
                    {language === 'nl' ? course.title_nl : course.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {language === 'nl' ? course.description_nl : course.description}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrollmentCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {course.averageRating}
                      </span>
                    </div>
                    
                    {/* Price */}
                    {!course.isFree && course.price && (
                      <span className="font-semibold text-emerald-600">
                        €{course.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Certificate badge */}
                  {course.hasCertificate && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-slate-500">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'nl' ? 'Certificaat inbegrepen' : 'Certificate included'}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        
        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {language === 'nl' ? 'Geen cursussen gevonden' : 'No courses found'}
            </h3>
            <p className="text-slate-500">
              {language === 'nl' 
                ? 'Probeer andere zoektermen of filters.'
                : 'Try different search terms or filters.'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* CTA Section */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {language === 'nl' ? 'Training op locatie nodig?' : 'Need on-site training?'}
              </h2>
              <p className="text-slate-300 mb-6">
                {language === 'nl'
                  ? 'Wij bieden ook maatwerk trainingen aan op uw locatie. Neem contact op voor meer informatie.'
                  : 'We also offer customized training at your location. Contact us for more information.'
                }
              </p>
              <Link
                href="/contact?subject=training"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
              >
                {language === 'nl' ? 'Neem contact op' : 'Contact Us'}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-4">
                <Video className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Online cursussen' : 'Online Courses'}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === 'nl' ? 'Leer op uw eigen tempo' : 'Learn at your own pace'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <Users className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Groepstraining' : 'Group Training'}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === 'nl' ? 'Op uw locatie' : 'At your location'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <Award className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Certificering' : 'Certification'}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === 'nl' ? 'Erkende diploma\'s' : 'Recognized diplomas'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <BookOpen className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="font-semibold mb-1">
                  {language === 'nl' ? 'Maatwerk' : 'Custom'}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === 'nl' ? 'Op maat gemaakt' : 'Tailored to your needs'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
