export interface Product {
  // Core product identification
  id?: string;
  sku: string;
  name?: string;
  brand?: string | null;
  catalog?: string;
  category?: string;
  description?: string | null;
  product_category?: string;
  attributes?: Record<string, unknown>;
  specs?: Array<{ label: string; value: string }>;
  media?: Array<{
    url: string;
    role: 'main' | 'thumbnail' | 'gallery';
    type: 'image' | 'video';
    format?: string;
  }>;
  image_paths?: string[];
  
  // Pricing and stock
  price?: number | null;
  priceMode?: 'request_quote' | 'fixed' | 'call_for_price';
  stock?: {
    status: 'in_stock' | 'out_of_stock' | 'unknown';
    quantity?: number | null;
  };
  inStock?: boolean | null;
  
  // SEO
  seo?: {
    slug: string;
    meta_title?: string;
    meta_description?: string;
  };
  
  // PDF and documentation
  pdf_source?: string;
  source_pages?: number[];
  source?: {
    pdf_sources?: string[];
    pages?: number[];
  };
  image_page?: number;
  image_crop_norm?: { x: number; y: number; width: number; height: number };
  absk_codes?: string[];
  product_type?: string;
  matched_skus?: string[];
  
  // Technical specifications
  pressure_max_bar?: number;
  pressure_min_bar?: number;
  power_kw?: number;
  power_hp?: number;
  voltage_v?: number;
  spanning_v?: number;
  frequency_hz?: number;
  current_a?: number;
  phase_count?: number;
  flow_l_min?: number;
  flow_l_min_list?: number[];
  flow_l_h?: number;
  debiet_m3_h?: number;
  rpm?: number;
  size_inch?: number | string;
  connection_types?: string[];
  aansluiting?: string | string[];
  length_m?: number;
  materials?: string[];
  volume_l?: number;
  vlotter?: boolean;
  overpressure_bar?: number;
  overpressure_mpa?: number;
  power_input_kw?: number;
  power_output_kw?: number;
  cable_length_m?: number;
  features?: string[];
  noise_level_db?: number;
  airflow_l_min?: number;
  tank_capacity_l?: number;
  
  // Dimensions and weight
  dimensions_mm_list?: number[];
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  weight_kg?: number;
  
  // Product details
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  
  // Additional metadata
  [key: string]: unknown;
}

export interface ProductFilters {
  // Category and search
  category?: string;
  product_category?: string;
  product_type?: string;
  pdf_source?: string;
  pdf?: string;
  searchTerm?: string;
  sku?: string;
  
  // Price range
  minPrice?: number;
  maxPrice?: number;
  
  // Technical filters
  power_kw?: number;
  minPower?: number;
  maxPower?: number;
  voltage_v?: number;
  spanning_v?: number;
  minPressure?: number;
  maxPressure?: number;
  pressure_max_bar?: number;
  pressure_min_bar?: number;
  flow_l_min_list?: number;
  debiet_m3_h?: number;
  rpm?: number;
  size_inch?: number | string;
  connection_types?: string;
  aansluiting?: string;
  length_m?: number;
  materials?: string;
  weight_kg?: number;
  volume_l?: number;
  vlotter?: boolean;
  
  // Image filter
  hasImages?: boolean;
  
  // Pagination
  limit?: number;
  skip?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductApiResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  filters: ProductFilters;
}
