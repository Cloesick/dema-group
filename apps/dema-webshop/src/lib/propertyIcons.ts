/**
 * Property Icon Mapping System
 * Maps property names to emoji icons for visual display
 */

export const PROPERTY_ICONS: Record<string, string> = {
  // SKU & Product Info
  sku: '🏷️',
  model: '🏷️',
  bestelnr: '🏷️',
  artikelnr: '🏷️',
  
  // Power & Electrical
  power: '⚡',
  vermogen: '⚡',
  power_w: '⚡',
  power_kw: '⚡',
  hp: '⚡',
  voltage: '🔌',
  spanning: '🔌',
  voltage_v: '🔌',
  electrical: '🔌',
  stroom_a: '⚡',
  amperage: '⚡',
  
  // Flow & Performance
  debiet: '🌬️',
  flow: '💨',
  debiet_m3_h: '🌬️',
  flow_m3_h: '💨',
  flow_lpm: '💨',
  intake: '🌬️',
  output: '💨',
  outtake: '💨',
  
  // Pressure
  pressure: '🔧',
  werkdruk: '🔧',
  pressure_bar: '🔧',
  pressure_max_bar: '🔧',
  spec_max_pressure: '🔧',
  max_pressure: '🔧',
  bar: '🔧',
  psi: '🔧',
  
  // Dimensions - Diameter
  diameter: '⭕',
  diameter_mm: '⭕',
  maat: '⭕',
  dia: '⭕',
  
  // Dimensions - Length
  length: '📏',
  lengte: '📏',
  length_m: '📏',
  
  // Dimensions - Width
  width: '↔️',
  breedte: '↔️',
  width_mm: '↔️',
  
  // Dimensions - Height
  height: '↕️',
  hoogte: '↕️',
  height_mm: '↕️',
  opv_hoogte_m: '⬆️',
  delivery_height: '⬆️',
  
  // Dimensions - Thickness
  thickness: '📐',
  dikte: '📐',
  wall_thickness: '📐',
  wanddikte: '📐',
  
  // Dimensions - Depth
  depth: '⬇️',
  diepte: '⬇️',
  aanzuigdiepte_m: '⬇️',
  suction_depth: '⬇️',
  
  // Volume & Capacity
  volume: '🗜️',
  capacity: '📦',
  inhoud: '📦',
  tank: '🗜️',
  liter: '📦',
  capacity_l: '📦',
  
  // Material & Type
  material: '🧱',
  materiaal: '🧱',
  type: '🧱',
  housing: '🏠',
  spec_housing: '🏠',
  behuizing: '🏠',
  
  // Temperature
  temperature: '🌡️',
  temp: '🌡️',
  spec_temp_range: '🌡️',
  spec_liquid_temp_range: '🌡️',
  temperatuur: '🌡️',
  
  // Mechanical
  rpm: '🔄',
  speed: '🔄',
  toeren: '🔄',
  piston: '🔩',
  zuiger: '🔩',
  cylinder: '⚙️',
  cilinder: '⚙️',
  
  // Sound
  noise: '🔊',
  db: '🔊',
  geluid: '🔊',
  noise_level: '🔊',
  
  // Weight
  weight: '⚖️',
  gewicht: '⚖️',
  weight_kg: '⚖️',
  
  // Connection & Angle
  aansluiting: '🔌',
  connection: '🔌',
  connection_size: '🔌',
  thread: '🔌',
  draad: '🔌',
  angle: '📐',
  hoek: '📐',
  
  // Application & Usage
  application: '🎯',
  toepassing: '🎯',
  spec_application_desc: '🎯',
  gebruik: '🎯',
  
  // Product Variant & Specs
  spec_product_variant: '🔖',
  variant: '🔖',
  spec_product_title: '📋',
  
  // Cable & Cord
  cable: '🔌',
  kabel: '🔌',
  cord: '🔌',
  
  // Default for common suffixes
  spec: '📊',
};

/**
 * Get icon for a property name
 * Checks exact match first, then partial matches
 */
export function getPropertyIcon(propertyName: string): string {
  const normalized = propertyName.toLowerCase().trim();
  
  // Exact match
  if (PROPERTY_ICONS[normalized]) {
    return PROPERTY_ICONS[normalized];
  }
  
  // Partial matches (check if property name contains key)
  for (const [key, icon] of Object.entries(PROPERTY_ICONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon;
    }
  }
  
  // Default icon
  return '🔹';
}

/**
 * Format property name for display
 * Converts snake_case and camelCase to Title Case
 */
export function formatPropertyName(propertyName: string): string {
  return propertyName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}
