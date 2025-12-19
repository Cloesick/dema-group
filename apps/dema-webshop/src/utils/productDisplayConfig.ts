/**
 * Dynamic Product Display Configuration
 * Maps product properties to their display metadata (icon, unit, color)
 */

export interface PropertyDisplayConfig {
  icon: string;
  unit?: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  label?: string;
  formatter?: (value: any) => string;
}

/**
 * Universal property display configuration
 * Any property from any PDF table can be mapped here
 */
export const PROPERTY_DISPLAY_CONFIG: Record<string, PropertyDisplayConfig> = {
  // Dimensions
  diameter_mm: {
    icon: '📏',
    unit: 'mm ø',
    color: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  },
  inner_diameter_mm: {
    icon: '⊙',
    unit: 'mm (inner ø)',
    color: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  },
  outer_diameter_mm: {
    icon: '◯',
    unit: 'mm (outer ø)',
    color: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  },
  width_mm: {
    icon: '↔️',
    unit: 'mm',
    color: { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-200' },
  },
  length_m: {
    icon: '📐',
    unit: 'm',
    color: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  },
  angle_degrees: {
    icon: '📐',
    unit: '° angle',
    color: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' },
  },

  // Pressure
  pressure_max_bar: {
    icon: '🔧',
    unit: 'bar',
    color: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  },
  pressure_work_bar: {
    icon: '🔧',
    unit: 'bar',
    color: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    label: 'Work pressure',
  },
  pressure_burst_bar: {
    icon: '💥',
    unit: 'bar',
    color: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    label: 'Burst',
  },
  pressure_height_m: {
    icon: '🔧',
    unit: 'm',
    color: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  },

  // Power
  power_kw: {
    icon: '⚡',
    unit: 'kW',
    color: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  },
  power_hp: {
    icon: '⚡',
    unit: 'HP',
    color: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  },
  voltage_v: {
    icon: '🔌',
    unit: 'V',
    color: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  },

  // Flow & Speed
  rpm: {
    icon: '🔄',
    unit: 'RPM',
    color: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  },
  flow_l_min: {
    icon: '💨',
    unit: 'L/min',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  },
  flow_m3_per_h: {
    icon: '💨',
    unit: 'm³/h',
    color: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  },

  // Weight & Volume
  weight_kg: {
    icon: '⚖️',
    unit: 'kg',
    color: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' },
  },
  volume_l: {
    icon: '🗜️',
    unit: 'L',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  },

  // Material & Type
  material: {
    icon: '🔬',
    unit: '',
    color: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  },
  pump_type: {
    icon: '🏭',
    unit: '',
    color: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  },
  bearing_type: {
    icon: '🏷️',
    unit: '',
    color: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
  },
  bearing_housing: {
    icon: '🏠',
    unit: '',
    color: { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200' },
  },
  pillow_block_bearing: {
    icon: '🔩',
    unit: '',
    color: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
  },

  // Temperature
  min_temp_c: {
    icon: '🌡️',
    unit: '°C',
    color: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    label: 'Min temp',
  },
  max_temp_c: {
    icon: '🌡️',
    unit: '°C',
    color: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    label: 'Max temp',
  },

  // Other
  application: {
    icon: '🔧',
    unit: '',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  },
  thread_size: {
    icon: '🔩',
    unit: '',
    color: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  },
};

/**
 * Get display configuration for a property
 * Falls back to defaults if property not found
 */
export function getPropertyDisplayConfig(propertyName: string): PropertyDisplayConfig {
  return PROPERTY_DISPLAY_CONFIG[propertyName] || {
    icon: '📋',
    unit: '',
    color: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' },
  };
}

/**
 * Get all displayable technical properties from a product
 * Filters out metadata and system properties
 */
export function getTechnicalProperties(product: any): string[] {
  const excludeKeys = [
    'id', 'sku', 'name', 'description', 'price', 'images', 'category', 'catalog',
    'pages', 'pdf_source', 'source_pages', 'page_in_pdf', 'seo', 'display_metadata',
    'createdAt', 'updatedAt', 'imageUrl'
  ];

  return Object.keys(product).filter(key => {
    // Exclude system properties
    if (excludeKeys.includes(key)) return false;
    
    // Exclude null/undefined values
    if (product[key] == null) return false;
    
    // Exclude empty strings
    if (typeof product[key] === 'string' && product[key].trim() === '') return false;
    
    // Include if it has a display config or has a value
    return true;
  });
}

/**
 * Format a property value for display
 */
export function formatPropertyValue(value: any, config: PropertyDisplayConfig): string {
  if (config.formatter) {
    return config.formatter(value);
  }
  
  // Default formatting
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return String(value);
}
