// =============================================================================
// DEMA GROUP PORTAL - CORE TYPE DEFINITIONS
// =============================================================================
// This file contains all TypeScript interfaces for the portal architecture.
// Fill in actual data later - these are the blueprints.
// =============================================================================

// -----------------------------------------------------------------------------
// PRODUCT TYPES
// -----------------------------------------------------------------------------

export interface Product {
  id: string
  sku: string
  name: string
  name_nl: string
  name_fr: string
  slug: string
  
  // Categorization
  categoryId: string
  subcategoryId: string
  brandId?: string
  
  // Descriptions
  shortDescription: string
  shortDescription_nl: string
  shortDescription_fr: string
  longDescription: string
  longDescription_nl: string
  longDescription_fr: string
  
  // Pricing (B2B - prices shown after login)
  pricing: ProductPricing
  
  // Media
  images: ProductImage[]
  documents: ProductDocument[]
  videos: ProductVideo[]
  
  // Technical Specifications
  specifications: ProductSpecification[]
  
  // Cross-references
  crossReferences: CrossReference[]
  
  // Compatibility
  compatibility: ProductCompatibility[]
  
  // Related Products
  relatedProducts: string[] // Product IDs
  accessories: string[] // Product IDs
  alternatives: string[] // Product IDs
  
  // Stock & Availability
  stockStatus: StockStatus
  leadTime?: number // Days if not in stock
  minOrderQuantity: number
  orderMultiple: number
  
  // Dimensions & Weight
  dimensions?: ProductDimensions
  weight?: number // kg
  
  // Companies that sell this product
  companies: string[] // Company IDs
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  
  // Status
  status: 'active' | 'discontinued' | 'coming_soon' | 'draft'
  createdAt: string
  updatedAt: string
}

export interface ProductPricing {
  currency: 'EUR'
  listPrice: number
  // Tiered pricing
  tiers: PriceTier[]
  // Customer-specific pricing loaded separately
}

export interface PriceTier {
  minQuantity: number
  price: number
  discount?: number // Percentage
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  sortOrder: number
  type: 'product' | 'technical' | 'application' | 'packaging'
}

export interface ProductDocument {
  id: string
  type: 'datasheet' | 'manual' | 'certificate' | 'drawing' | 'safety' | 'brochure'
  title: string
  title_nl: string
  title_fr: string
  url: string
  fileSize: number // bytes
  language: 'en' | 'nl' | 'fr' | 'de' | 'multi'
}

export interface ProductVideo {
  id: string
  type: 'product' | 'installation' | 'tutorial' | 'application'
  title: string
  title_nl: string
  url: string // YouTube/Vimeo embed URL
  thumbnailUrl: string
  duration: number // seconds
}

export interface ProductSpecification {
  id: string
  groupId: string // For grouping specs (e.g., "Dimensions", "Performance")
  groupName: string
  groupName_nl: string
  name: string
  name_nl: string
  name_fr: string
  value: string
  unit?: string
  sortOrder: number
  isFilterable: boolean // Can be used in search filters
  filterType?: 'range' | 'exact' | 'multi' // How to filter
}

export interface CrossReference {
  type: 'oem' | 'competitor' | 'superseded' | 'equivalent'
  brand: string
  partNumber: string
  notes?: string
}

export interface ProductCompatibility {
  machineType: string // e.g., "Tractor", "Pump", "Compressor"
  brand: string
  model: string
  yearFrom?: number
  yearTo?: number
  notes?: string
}

export interface ProductDimensions {
  length: number // mm
  width: number // mm
  height: number // mm
  diameter?: number // mm (for round products)
}

export interface StockStatus {
  inStock: boolean
  quantity: number
  warehouses: WarehouseStock[]
  nextDeliveryDate?: string
  nextDeliveryQuantity?: number
}

export interface WarehouseStock {
  warehouseId: string
  warehouseName: string
  quantity: number
  reserved: number
  available: number
}

// -----------------------------------------------------------------------------
// CATEGORY TYPES
// -----------------------------------------------------------------------------

export interface Category {
  id: string
  name: string
  name_nl: string
  name_fr: string
  slug: string
  description: string
  description_nl: string
  description_fr: string
  icon: string
  image: string
  color: string
  parentId?: string // For nested categories
  sortOrder: number
  isActive: boolean
  productCount: number
  subcategories: Subcategory[]
  filters: CategoryFilter[] // Available filters for this category
}

export interface Subcategory {
  id: string
  name: string
  name_nl: string
  name_fr: string
  slug: string
  description: string
  description_nl: string
  image: string
  parentId: string
  sortOrder: number
  isActive: boolean
  productCount: number
}

export interface CategoryFilter {
  id: string
  name: string
  name_nl: string
  type: 'checkbox' | 'range' | 'select'
  specificationId: string // Links to ProductSpecification
  options?: FilterOption[] // For checkbox/select
  range?: { min: number; max: number; unit: string } // For range
}

export interface FilterOption {
  value: string
  label: string
  label_nl: string
  count: number // Number of products with this value
}

// -----------------------------------------------------------------------------
// BRAND TYPES
// -----------------------------------------------------------------------------

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  description_nl: string
  website?: string
  isOwnBrand: boolean // DEMA Group brand vs third-party
  isFeatured: boolean
  productCount: number
}

// -----------------------------------------------------------------------------
// COMPANY/DEALER TYPES
// -----------------------------------------------------------------------------

export interface Company {
  id: string
  name: string
  slug: string
  type: 'subsidiary' | 'dealer' | 'distributor' | 'partner'
  
  // Branding
  logo: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  
  // Contact
  contact: CompanyContact
  
  // Location
  location: CompanyLocation
  
  // Business Info
  description: string
  description_nl: string
  tagline: string
  tagline_nl: string
  
  // Categories/Services
  categories: string[] // Category IDs they specialize in
  services: string[]
  certifications: string[]
  
  // Operating Hours
  openingHours: OpeningHours[]
  
  // Social
  socialMedia: SocialMedia
  
  // Status
  isActive: boolean
  isFeatured: boolean
}

export interface CompanyContact {
  phone: string
  phoneSecondary?: string
  email: string
  emailSales?: string
  emailSupport?: string
  fax?: string
  website: string
}

export interface CompanyLocation {
  address: string
  city: string
  postalCode: string
  province?: string
  country: string
  countryCode: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface OpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  open: string // "08:00"
  close: string // "17:00"
  isClosed: boolean
}

export interface SocialMedia {
  linkedin?: string
  facebook?: string
  instagram?: string
  youtube?: string
  twitter?: string
}

// -----------------------------------------------------------------------------
// CUSTOMER/USER TYPES
// -----------------------------------------------------------------------------

export interface Customer {
  id: string
  type: 'business' | 'individual'
  
  // Account
  email: string
  passwordHash: string // Never expose
  status: 'pending' | 'active' | 'suspended' | 'closed'
  
  // Business Info
  company?: CustomerCompany
  
  // Contact Person
  contact: CustomerContact
  
  // Addresses
  addresses: CustomerAddress[]
  defaultBillingAddressId?: string
  defaultShippingAddressId?: string
  
  // Pricing
  priceGroup: string // For customer-specific pricing
  creditLimit?: number
  paymentTerms: string // e.g., "NET30"
  
  // Preferences
  preferences: CustomerPreferences
  
  // Relations
  assignedSalesRep?: string // Employee ID
  parentCompanyId?: string // For subsidiaries
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface CustomerCompany {
  name: string
  vatNumber: string
  chamberOfCommerce?: string
  industry?: string
  employeeCount?: string
}

export interface CustomerContact {
  firstName: string
  lastName: string
  phone: string
  mobile?: string
  position?: string
}

export interface CustomerAddress {
  id: string
  type: 'billing' | 'shipping' | 'both'
  name: string // "Main Warehouse", "Head Office"
  company?: string
  street: string
  street2?: string
  city: string
  postalCode: string
  province?: string
  country: string
  countryCode: string
  phone?: string
  isDefault: boolean
}

export interface CustomerPreferences {
  language: 'en' | 'nl' | 'fr'
  currency: 'EUR'
  emailNotifications: {
    orders: boolean
    shipping: boolean
    promotions: boolean
    priceChanges: boolean
    backInStock: boolean
  }
  defaultShippingMethod?: string
}

// -----------------------------------------------------------------------------
// ORDER TYPES
// -----------------------------------------------------------------------------

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  companyId: string // Which DEMA company fulfills this
  
  // Status
  status: OrderStatus
  
  // Dates
  orderDate: string
  requestedDeliveryDate?: string
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  
  // Items
  items: OrderItem[]
  
  // Pricing
  subtotal: number
  discount: number
  discountCode?: string
  shipping: number
  tax: number
  total: number
  currency: 'EUR'
  
  // Addresses
  billingAddress: CustomerAddress
  shippingAddress: CustomerAddress
  
  // Shipping
  shippingMethod: string
  trackingNumber?: string
  carrier?: string
  
  // Payment
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed'
  invoiceNumber?: string
  invoiceUrl?: string
  
  // Notes
  customerNotes?: string
  internalNotes?: string
  
  // Reference
  customerReference?: string // PO number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'picking'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export interface OrderItem {
  id: string
  productId: string
  sku: string
  name: string
  quantity: number
  quantityShipped: number
  unitPrice: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'backordered' | 'shipped' | 'delivered' | 'cancelled'
  backorderDate?: string
}

// -----------------------------------------------------------------------------
// SHOPPING LIST / FAVORITES TYPES
// -----------------------------------------------------------------------------

export interface ShoppingList {
  id: string
  customerId: string
  name: string
  description?: string
  isDefault: boolean
  items: ShoppingListItem[]
  createdAt: string
  updatedAt: string
}

export interface ShoppingListItem {
  id: string
  productId: string
  quantity: number
  notes?: string
  addedAt: string
}

// -----------------------------------------------------------------------------
// CART TYPES
// -----------------------------------------------------------------------------

export interface Cart {
  id: string
  customerId?: string // Optional for guest carts
  sessionId: string
  items: CartItem[]
  subtotal: number
  estimatedShipping?: number
  estimatedTax?: number
  total: number
  currency: 'EUR'
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export interface CartItem {
  id: string
  productId: string
  sku: string
  name: string
  image: string
  quantity: number
  unitPrice: number
  total: number
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder'
}

// -----------------------------------------------------------------------------
// SEARCH TYPES
// -----------------------------------------------------------------------------

export interface SearchQuery {
  q: string // Search term
  category?: string
  subcategory?: string
  brand?: string
  company?: string
  filters?: Record<string, string | string[] | { min?: number; max?: number }>
  sort?: SearchSort
  page?: number
  limit?: number
}

export type SearchSort = 
  | 'relevance'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'bestseller'

export interface SearchResult {
  query: SearchQuery
  products: Product[]
  totalCount: number
  page: number
  totalPages: number
  facets: SearchFacet[]
  suggestions?: string[]
  didYouMean?: string
}

export interface SearchFacet {
  id: string
  name: string
  name_nl: string
  type: 'checkbox' | 'range'
  values: SearchFacetValue[]
}

export interface SearchFacetValue {
  value: string
  label: string
  count: number
  isSelected: boolean
}

// -----------------------------------------------------------------------------
// CONFIGURATOR TYPES
// -----------------------------------------------------------------------------

export interface ConfiguratorProduct {
  id: string
  type: 'hose_assembly' | 'pipe_system' | 'pump_system' | 'valve_assembly'
  name: string
  name_nl: string
  description: string
  
  // Configuration steps
  steps: ConfiguratorStep[]
  
  // Pricing rules
  pricingRules: ConfiguratorPricingRule[]
  
  // Validation rules
  validationRules: ConfiguratorValidationRule[]
}

export interface ConfiguratorStep {
  id: string
  name: string
  name_nl: string
  description: string
  type: 'select' | 'input' | 'multi_select'
  isRequired: boolean
  sortOrder: number
  
  // Options for select/multi_select
  options?: ConfiguratorOption[]
  
  // Constraints for input
  constraints?: {
    min?: number
    max?: number
    step?: number
    unit?: string
  }
  
  // Dependencies on other steps
  dependsOn?: {
    stepId: string
    values: string[]
  }
}

export interface ConfiguratorOption {
  id: string
  name: string
  name_nl: string
  image?: string
  price: number
  sku?: string
  specifications?: Record<string, string>
}

export interface ConfiguratorPricingRule {
  id: string
  type: 'base' | 'per_unit' | 'multiplier' | 'fixed'
  stepId?: string
  optionId?: string
  value: number
}

export interface ConfiguratorValidationRule {
  id: string
  type: 'compatibility' | 'range' | 'required_if'
  message: string
  message_nl: string
  condition: Record<string, unknown>
}

export interface ConfiguratorConfiguration {
  id: string
  productId: string
  customerId?: string
  name?: string
  selections: Record<string, string | number | string[]>
  calculatedPrice: number
  generatedSku: string
  isValid: boolean
  validationErrors: string[]
  createdAt: string
}

// -----------------------------------------------------------------------------
// ACADEMY / TRAINING TYPES
// -----------------------------------------------------------------------------

export interface Course {
  id: string
  slug: string
  title: string
  title_nl: string
  title_fr: string
  description: string
  description_nl: string
  description_fr: string
  
  // Categorization
  category: CourseCategory
  level: 'beginner' | 'intermediate' | 'advanced'
  
  // Content
  thumbnail: string
  duration: number // minutes
  modules: CourseModule[]
  
  // Delivery
  type: 'online' | 'onsite' | 'hybrid'
  
  // Pricing
  isFree: boolean
  price?: number
  
  // Requirements
  prerequisites?: string[]
  targetAudience: string[]
  
  // Certification
  hasCertificate: boolean
  certificateValidityMonths?: number
  
  // Status
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  
  // Stats
  enrollmentCount: number
  averageRating: number
  reviewCount: number
}

export type CourseCategory = 
  | 'product_training'
  | 'technical_skills'
  | 'installation'
  | 'maintenance'
  | 'safety'
  | 'sales'

export interface CourseModule {
  id: string
  title: string
  title_nl: string
  description: string
  sortOrder: number
  duration: number // minutes
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: string
  title: string
  title_nl: string
  type: 'video' | 'text' | 'quiz' | 'download' | 'interactive'
  duration: number // minutes
  sortOrder: number
  
  // Content based on type
  content: {
    videoUrl?: string
    textContent?: string
    textContent_nl?: string
    quizQuestions?: QuizQuestion[]
    downloadUrl?: string
    interactiveUrl?: string
  }
}

export interface QuizQuestion {
  id: string
  question: string
  question_nl: string
  type: 'multiple_choice' | 'true_false' | 'multi_select'
  options: QuizOption[]
  correctAnswers: string[] // Option IDs
  explanation?: string
  explanation_nl?: string
}

export interface QuizOption {
  id: string
  text: string
  text_nl: string
}

export interface CourseEnrollment {
  id: string
  courseId: string
  customerId: string
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired'
  progress: number // Percentage
  completedModules: string[]
  completedLessons: string[]
  quizScores: Record<string, number>
  certificateUrl?: string
  enrolledAt: string
  completedAt?: string
  expiresAt?: string
}

// -----------------------------------------------------------------------------
// NOTIFICATION TYPES
// -----------------------------------------------------------------------------

export interface Notification {
  id: string
  customerId: string
  type: NotificationType
  title: string
  title_nl: string
  message: string
  message_nl: string
  link?: string
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'back_in_stock'
  | 'price_drop'
  | 'new_product'
  | 'course_reminder'
  | 'certificate_expiring'
  | 'promotion'
  | 'system'

// -----------------------------------------------------------------------------
// API RESPONSE TYPES
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
