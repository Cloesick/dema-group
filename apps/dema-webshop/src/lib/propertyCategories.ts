/**
 * Property Categorization System
 * Groups properties into logical categories with color coding
 */

export type PropertyCategory = 'specifications' | 'dimensions' | 'performance' | 'application';

export interface CategoryConfig {
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const CATEGORY_CONFIGS: Record<PropertyCategory, CategoryConfig> = {
  specifications: {
    label: 'Specifications',
    icon: '🔧',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  dimensions: {
    label: 'Dimensions',
    icon: '📏',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  performance: {
    label: 'Performance',
    icon: '⚡',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  application: {
    label: 'Application',
    icon: '🎯',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
};

// Property name patterns for each category
const CATEGORY_PATTERNS: Record<PropertyCategory, string[]> = {
  specifications: [
    'type', 'material', 'materiaal', 'housing', 'behuizing',
    'spec_housing', 'spec_product_title', 'spec_product_variant',
    'variant', 'model', 'cable', 'kabel', 'thread', 'draad',
    'connection', 'aansluiting', 'piston', 'zuiger', 'cylinder', 'cilinder',
  ],
  
  dimensions: [
    'diameter', 'maat', 'length', 'lengte', 'width', 'breedte',
    'height', 'hoogte', 'thickness', 'dikte', 'angle', 'hoek',
    'depth', 'diepte', 'size', 'afmeting', 'mm', 'cm', 'm',
    'wall_thickness', 'wanddikte',
  ],
  
  performance: [
    'power', 'vermogen', 'voltage', 'spanning', 'pressure', 'werkdruk',
    'flow', 'debiet', 'rpm', 'speed', 'toeren', 'capacity', 'inhoud',
    'volume', 'tank', 'output', 'intake', 'outtake', 'bar', 'psi',
    'kw', 'hp', 'watt', 'amperage', 'stroom', 'liter', 'noise', 'db',
    'geluid', 'opv_hoogte', 'aanzuigdiepte', 'delivery', 'suction',
  ],
  
  application: [
    'application', 'toepassing', 'gebruik', 'spec_application',
    'spec_temp', 'spec_liquid', 'temperature', 'temperatuur',
    'temp_range', 'catalog_group', 'product_type',
  ],
};

/**
 * Categorize a property based on its name
 */
export function categorizeProperty(propertyName: string): PropertyCategory {
  const normalized = propertyName.toLowerCase().trim();
  
  // Check each category's patterns
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern) || pattern.includes(normalized)) {
        return category as PropertyCategory;
      }
    }
  }
  
  // Default to specifications if no match
  return 'specifications';
}

/**
 * Group properties by category
 */
export interface CategorizedProperties {
  category: PropertyCategory;
  properties: Array<{ key: string; value: any }>;
}

export function groupPropertiesByCategory(
  properties: Record<string, any>,
  excludeKeys: string[] = ['_enriched', 'source_pdf', 'page', 'sku', 'series_id', 'series_name', 'series_image', 'image', 'images']
): CategorizedProperties[] {
  const grouped = new Map<PropertyCategory, Array<{ key: string; value: any }>>();
  
  // Initialize all categories
  Object.keys(CATEGORY_CONFIGS).forEach(cat => {
    grouped.set(cat as PropertyCategory, []);
  });
  
  // Categorize each property
  Object.entries(properties).forEach(([key, value]) => {
    // Skip excluded keys and null/undefined/empty values
    if (excludeKeys.includes(key) || value === null || value === undefined || value === '') {
      return;
    }
    
    const category = categorizeProperty(key);
    grouped.get(category)?.push({ key, value });
  });
  
  // Convert to array and filter empty categories
  return Array.from(grouped.entries())
    .filter(([_, props]) => props.length > 0)
    .map(([category, properties]) => ({
      category,
      properties,
    }));
}

/**
 * Get configuration for a category
 */
export function getCategoryConfig(category: PropertyCategory): CategoryConfig {
  return CATEGORY_CONFIGS[category];
}
