// =============================================================================
// PRODUCT GROUP / SERIES CONFIGURATION
// =============================================================================
// Defines which properties are applicable to each product type/group.
// Properties not in the schema for a product type should NEVER be rendered.
// =============================================================================

// -----------------------------------------------------------------------------
// Property Definition
// -----------------------------------------------------------------------------

export interface PropertyDefinition {
  key: string                    // Property key in product data
  label: string                  // Display label (EN)
  label_nl: string               // Display label (NL)
  label_fr: string               // Display label (FR)
  unit?: string                  // Unit of measurement
  type: 'text' | 'number' | 'range' | 'boolean' | 'list'
  isFilterable: boolean          // Can be used in search filters
  isPrimary: boolean             // Show in product card/list view
  sortOrder: number              // Display order
}

// -----------------------------------------------------------------------------
// Product Group Definition
// -----------------------------------------------------------------------------

export interface ProductGroup {
  id: string                     // Unique group identifier
  name: string                   // Group name (EN)
  name_nl: string                // Group name (NL)
  name_fr: string                // Group name (FR)
  description?: string           // Group description
  icon?: string                  // Icon identifier
  properties: PropertyDefinition[] // Properties applicable to this group
  specGroups: SpecificationGroup[] // Grouped specifications
}

export interface SpecificationGroup {
  id: string
  name: string
  name_nl: string
  name_fr: string
  sortOrder: number
  properties: string[]           // Property keys in this group
}

// -----------------------------------------------------------------------------
// Common Properties (shared across multiple groups)
// -----------------------------------------------------------------------------

const COMMON_PROPERTIES: Record<string, PropertyDefinition> = {
  sku: {
    key: 'sku',
    label: 'Article Number',
    label_nl: 'Artikelnummer',
    label_fr: 'Numéro d\'article',
    type: 'text',
    isFilterable: false,
    isPrimary: true,
    sortOrder: 0,
  },
  bestelnr: {
    key: 'bestelnr',
    label: 'Order Number',
    label_nl: 'Bestelnummer',
    label_fr: 'Numéro de commande',
    type: 'text',
    isFilterable: false,
    isPrimary: true,
    sortOrder: 1,
  },
  series_name: {
    key: 'series_name',
    label: 'Series',
    label_nl: 'Serie',
    label_fr: 'Série',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 2,
  },
  material: {
    key: 'material',
    label: 'Material',
    label_nl: 'Materiaal',
    label_fr: 'Matériau',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 3,
  },
  maat: {
    key: 'maat',
    label: 'Size',
    label_nl: 'Maat',
    label_fr: 'Taille',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 4,
  },
  diameter_mm: {
    key: 'diameter_mm',
    label: 'Diameter',
    label_nl: 'Diameter',
    label_fr: 'Diamètre',
    unit: 'mm',
    type: 'number',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 5,
  },
}

// -----------------------------------------------------------------------------
// Pipe & Fitting Properties
// -----------------------------------------------------------------------------

const PIPE_FITTING_PROPERTIES: PropertyDefinition[] = [
  COMMON_PROPERTIES.sku,
  COMMON_PROPERTIES.bestelnr,
  COMMON_PROPERTIES.series_name,
  COMMON_PROPERTIES.material,
  COMMON_PROPERTIES.maat,
  COMMON_PROPERTIES.diameter_mm,
  {
    key: 'werkdruk',
    label: 'Working Pressure',
    label_nl: 'Werkdruk',
    label_fr: 'Pression de travail',
    unit: 'bar',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 6,
  },
  {
    key: 'angle',
    label: 'Angle',
    label_nl: 'Hoek',
    label_fr: 'Angle',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 7,
  },
  {
    key: 'connection',
    label: 'Connection Type',
    label_nl: 'Aansluiting',
    label_fr: 'Type de connexion',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 8,
  },
  {
    key: 'wall_thickness',
    label: 'Wall Thickness',
    label_nl: 'Wanddikte',
    label_fr: 'Épaisseur de paroi',
    unit: 'mm',
    type: 'number',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 9,
  },
  {
    key: 'length',
    label: 'Length',
    label_nl: 'Lengte',
    label_fr: 'Longueur',
    unit: 'mm',
    type: 'number',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 10,
  },
  {
    key: 'temp_range',
    label: 'Temperature Range',
    label_nl: 'Temperatuurbereik',
    label_fr: 'Plage de température',
    unit: '°C',
    type: 'range',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 11,
  },
]

// -----------------------------------------------------------------------------
// Pump Properties
// -----------------------------------------------------------------------------

const PUMP_PROPERTIES: PropertyDefinition[] = [
  COMMON_PROPERTIES.sku,
  COMMON_PROPERTIES.bestelnr,
  COMMON_PROPERTIES.series_name,
  COMMON_PROPERTIES.material,
  {
    key: 'pump_type',
    label: 'Pump Type',
    label_nl: 'Pomptype',
    label_fr: 'Type de pompe',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 4,
  },
  {
    key: 'debiet_m3_h',
    label: 'Flow Rate',
    label_nl: 'Debiet',
    label_fr: 'Débit',
    unit: 'm³/h',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 5,
  },
  {
    key: 'opvoerhoogte_m',
    label: 'Head',
    label_nl: 'Opvoerhoogte',
    label_fr: 'Hauteur de refoulement',
    unit: 'm',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 6,
  },
  {
    key: 'aanzuigdiepte_m',
    label: 'Suction Depth',
    label_nl: 'Aanzuigdiepte',
    label_fr: 'Profondeur d\'aspiration',
    unit: 'm',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 7,
  },
  {
    key: 'power_kw',
    label: 'Power',
    label_nl: 'Vermogen',
    label_fr: 'Puissance',
    unit: 'kW',
    type: 'number',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 8,
  },
  {
    key: 'voltage',
    label: 'Voltage',
    label_nl: 'Spanning',
    label_fr: 'Tension',
    unit: 'V',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 9,
  },
  {
    key: 'connection',
    label: 'Connection',
    label_nl: 'Aansluiting',
    label_fr: 'Connexion',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 10,
  },
  {
    key: 'weight_kg',
    label: 'Weight',
    label_nl: 'Gewicht',
    label_fr: 'Poids',
    unit: 'kg',
    type: 'text',
    isFilterable: false,
    isPrimary: false,
    sortOrder: 11,
  },
  {
    key: 'spec_liquid_temp_range',
    label: 'Liquid Temperature',
    label_nl: 'Vloeistoftemperatuur',
    label_fr: 'Température du liquide',
    type: 'text',
    isFilterable: false,
    isPrimary: false,
    sortOrder: 12,
  },
  {
    key: 'spec_max_pressure',
    label: 'Max Pressure',
    label_nl: 'Max. druk',
    label_fr: 'Pression max.',
    unit: 'bar',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 13,
  },
]

// -----------------------------------------------------------------------------
// Hose Properties
// -----------------------------------------------------------------------------

const HOSE_PROPERTIES: PropertyDefinition[] = [
  COMMON_PROPERTIES.sku,
  COMMON_PROPERTIES.bestelnr,
  COMMON_PROPERTIES.series_name,
  COMMON_PROPERTIES.material,
  COMMON_PROPERTIES.diameter_mm,
  {
    key: 'inner_diameter',
    label: 'Inner Diameter',
    label_nl: 'Binnendiameter',
    label_fr: 'Diamètre intérieur',
    unit: 'mm',
    type: 'number',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 5,
  },
  {
    key: 'outer_diameter',
    label: 'Outer Diameter',
    label_nl: 'Buitendiameter',
    label_fr: 'Diamètre extérieur',
    unit: 'mm',
    type: 'number',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 6,
  },
  {
    key: 'werkdruk',
    label: 'Working Pressure',
    label_nl: 'Werkdruk',
    label_fr: 'Pression de travail',
    unit: 'bar',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 7,
  },
  {
    key: 'burst_pressure',
    label: 'Burst Pressure',
    label_nl: 'Barstdruk',
    label_fr: 'Pression d\'éclatement',
    unit: 'bar',
    type: 'number',
    isFilterable: false,
    isPrimary: false,
    sortOrder: 8,
  },
  {
    key: 'bend_radius',
    label: 'Bend Radius',
    label_nl: 'Buigradius',
    label_fr: 'Rayon de courbure',
    unit: 'mm',
    type: 'number',
    isFilterable: false,
    isPrimary: false,
    sortOrder: 9,
  },
  {
    key: 'temp_range',
    label: 'Temperature Range',
    label_nl: 'Temperatuurbereik',
    label_fr: 'Plage de température',
    unit: '°C',
    type: 'range',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 10,
  },
  {
    key: 'application',
    label: 'Application',
    label_nl: 'Toepassing',
    label_fr: 'Application',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 11,
  },
  {
    key: 'reinforcement',
    label: 'Reinforcement',
    label_nl: 'Versterking',
    label_fr: 'Renforcement',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 12,
  },
]

// -----------------------------------------------------------------------------
// Valve Properties
// -----------------------------------------------------------------------------

const VALVE_PROPERTIES: PropertyDefinition[] = [
  COMMON_PROPERTIES.sku,
  COMMON_PROPERTIES.bestelnr,
  COMMON_PROPERTIES.series_name,
  COMMON_PROPERTIES.material,
  COMMON_PROPERTIES.maat,
  {
    key: 'valve_type',
    label: 'Valve Type',
    label_nl: 'Kleptype',
    label_fr: 'Type de vanne',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 5,
  },
  {
    key: 'werkdruk',
    label: 'Working Pressure',
    label_nl: 'Werkdruk',
    label_fr: 'Pression de travail',
    unit: 'bar',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 6,
  },
  {
    key: 'connection',
    label: 'Connection Type',
    label_nl: 'Aansluiting',
    label_fr: 'Type de connexion',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 7,
  },
  {
    key: 'actuation',
    label: 'Actuation',
    label_nl: 'Bediening',
    label_fr: 'Actionnement',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 8,
  },
  {
    key: 'flow_coefficient',
    label: 'Flow Coefficient (Kv)',
    label_nl: 'Doorstroomcoëfficiënt (Kv)',
    label_fr: 'Coefficient de débit (Kv)',
    type: 'number',
    isFilterable: false,
    isPrimary: false,
    sortOrder: 9,
  },
  {
    key: 'temp_range',
    label: 'Temperature Range',
    label_nl: 'Temperatuurbereik',
    label_fr: 'Plage de température',
    unit: '°C',
    type: 'range',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 10,
  },
  {
    key: 'seal_material',
    label: 'Seal Material',
    label_nl: 'Afdichtingsmateriaal',
    label_fr: 'Matériau d\'étanchéité',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 11,
  },
]

// -----------------------------------------------------------------------------
// Coupling Properties
// -----------------------------------------------------------------------------

const COUPLING_PROPERTIES: PropertyDefinition[] = [
  COMMON_PROPERTIES.sku,
  COMMON_PROPERTIES.bestelnr,
  COMMON_PROPERTIES.series_name,
  COMMON_PROPERTIES.material,
  COMMON_PROPERTIES.maat,
  {
    key: 'coupling_type',
    label: 'Coupling Type',
    label_nl: 'Koppelingstype',
    label_fr: 'Type de raccord',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 5,
  },
  {
    key: 'werkdruk',
    label: 'Working Pressure',
    label_nl: 'Werkdruk',
    label_fr: 'Pression de travail',
    unit: 'bar',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 6,
  },
  {
    key: 'connection_a',
    label: 'Connection A',
    label_nl: 'Aansluiting A',
    label_fr: 'Connexion A',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 7,
  },
  {
    key: 'connection_b',
    label: 'Connection B',
    label_nl: 'Aansluiting B',
    label_fr: 'Connexion B',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 8,
  },
  {
    key: 'thread_type',
    label: 'Thread Type',
    label_nl: 'Draadtype',
    label_fr: 'Type de filetage',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 9,
  },
]

// -----------------------------------------------------------------------------
// Compressed Air Properties
// -----------------------------------------------------------------------------

const COMPRESSED_AIR_PROPERTIES: PropertyDefinition[] = [
  COMMON_PROPERTIES.sku,
  COMMON_PROPERTIES.bestelnr,
  COMMON_PROPERTIES.series_name,
  COMMON_PROPERTIES.material,
  COMMON_PROPERTIES.maat,
  COMMON_PROPERTIES.diameter_mm,
  {
    key: 'werkdruk',
    label: 'Working Pressure',
    label_nl: 'Werkdruk',
    label_fr: 'Pression de travail',
    unit: 'bar',
    type: 'text',
    isFilterable: true,
    isPrimary: true,
    sortOrder: 6,
  },
  {
    key: 'angle',
    label: 'Angle',
    label_nl: 'Hoek',
    label_fr: 'Angle',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 7,
  },
  {
    key: 'connection',
    label: 'Connection Type',
    label_nl: 'Aansluiting',
    label_fr: 'Type de connexion',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 8,
  },
  {
    key: 'application',
    label: 'Application',
    label_nl: 'Toepassing',
    label_fr: 'Application',
    type: 'text',
    isFilterable: true,
    isPrimary: false,
    sortOrder: 9,
  },
]

// -----------------------------------------------------------------------------
// Product Groups Registry
// -----------------------------------------------------------------------------

export const PRODUCT_GROUPS: Record<string, ProductGroup> = {
  'compressed_air': {
    id: 'compressed_air',
    name: 'Compressed Air',
    name_nl: 'Perslucht',
    name_fr: 'Air comprimé',
    description: 'Pipes, fittings and accessories for compressed air systems',
    icon: 'wind',
    properties: COMPRESSED_AIR_PROPERTIES,
    specGroups: [
      {
        id: 'general',
        name: 'General',
        name_nl: 'Algemeen',
        name_fr: 'Général',
        sortOrder: 0,
        properties: ['sku', 'bestelnr', 'series_name'],
      },
      {
        id: 'dimensions',
        name: 'Dimensions',
        name_nl: 'Afmetingen',
        name_fr: 'Dimensions',
        sortOrder: 1,
        properties: ['maat', 'diameter_mm', 'angle'],
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        sortOrder: 2,
        properties: ['werkdruk'],
      },
      {
        id: 'technical',
        name: 'Technical',
        name_nl: 'Technisch',
        name_fr: 'Technique',
        sortOrder: 3,
        properties: ['material', 'connection', 'application'],
      },
    ],
  },
  
  'pipes_fittings': {
    id: 'pipes_fittings',
    name: 'Pipes & Fittings',
    name_nl: 'Buizen & Fittingen',
    name_fr: 'Tuyaux & Raccords',
    description: 'Industrial pipes and fittings',
    icon: 'cylinder',
    properties: PIPE_FITTING_PROPERTIES,
    specGroups: [
      {
        id: 'general',
        name: 'General',
        name_nl: 'Algemeen',
        name_fr: 'Général',
        sortOrder: 0,
        properties: ['sku', 'bestelnr', 'series_name'],
      },
      {
        id: 'dimensions',
        name: 'Dimensions',
        name_nl: 'Afmetingen',
        name_fr: 'Dimensions',
        sortOrder: 1,
        properties: ['maat', 'diameter_mm', 'wall_thickness', 'length', 'angle'],
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        sortOrder: 2,
        properties: ['werkdruk', 'temp_range'],
      },
      {
        id: 'technical',
        name: 'Technical',
        name_nl: 'Technisch',
        name_fr: 'Technique',
        sortOrder: 3,
        properties: ['material', 'connection'],
      },
    ],
  },
  
  'pumps': {
    id: 'pumps',
    name: 'Pumps',
    name_nl: 'Pompen',
    name_fr: 'Pompes',
    description: 'Industrial and agricultural pumps',
    icon: 'droplets',
    properties: PUMP_PROPERTIES,
    specGroups: [
      {
        id: 'general',
        name: 'General',
        name_nl: 'Algemeen',
        name_fr: 'Général',
        sortOrder: 0,
        properties: ['sku', 'bestelnr', 'series_name', 'pump_type'],
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        sortOrder: 1,
        properties: ['debiet_m3_h', 'opvoerhoogte_m', 'aanzuigdiepte_m', 'spec_max_pressure'],
      },
      {
        id: 'electrical',
        name: 'Electrical',
        name_nl: 'Elektrisch',
        name_fr: 'Électrique',
        sortOrder: 2,
        properties: ['power_kw', 'voltage'],
      },
      {
        id: 'technical',
        name: 'Technical',
        name_nl: 'Technisch',
        name_fr: 'Technique',
        sortOrder: 3,
        properties: ['material', 'connection', 'weight_kg', 'spec_liquid_temp_range'],
      },
    ],
  },
  
  'hoses': {
    id: 'hoses',
    name: 'Hoses',
    name_nl: 'Slangen',
    name_fr: 'Tuyaux flexibles',
    description: 'Industrial hoses for various applications',
    icon: 'waves',
    properties: HOSE_PROPERTIES,
    specGroups: [
      {
        id: 'general',
        name: 'General',
        name_nl: 'Algemeen',
        name_fr: 'Général',
        sortOrder: 0,
        properties: ['sku', 'bestelnr', 'series_name'],
      },
      {
        id: 'dimensions',
        name: 'Dimensions',
        name_nl: 'Afmetingen',
        name_fr: 'Dimensions',
        sortOrder: 1,
        properties: ['diameter_mm', 'inner_diameter', 'outer_diameter', 'bend_radius'],
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        sortOrder: 2,
        properties: ['werkdruk', 'burst_pressure', 'temp_range'],
      },
      {
        id: 'technical',
        name: 'Technical',
        name_nl: 'Technisch',
        name_fr: 'Technique',
        sortOrder: 3,
        properties: ['material', 'reinforcement', 'application'],
      },
    ],
  },
  
  'valves': {
    id: 'valves',
    name: 'Valves',
    name_nl: 'Kleppen',
    name_fr: 'Vannes',
    description: 'Industrial valves and controls',
    icon: 'settings',
    properties: VALVE_PROPERTIES,
    specGroups: [
      {
        id: 'general',
        name: 'General',
        name_nl: 'Algemeen',
        name_fr: 'Général',
        sortOrder: 0,
        properties: ['sku', 'bestelnr', 'series_name', 'valve_type'],
      },
      {
        id: 'dimensions',
        name: 'Dimensions',
        name_nl: 'Afmetingen',
        name_fr: 'Dimensions',
        sortOrder: 1,
        properties: ['maat', 'connection'],
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        sortOrder: 2,
        properties: ['werkdruk', 'flow_coefficient', 'temp_range'],
      },
      {
        id: 'technical',
        name: 'Technical',
        name_nl: 'Technisch',
        name_fr: 'Technique',
        sortOrder: 3,
        properties: ['material', 'seal_material', 'actuation'],
      },
    ],
  },
  
  'couplings': {
    id: 'couplings',
    name: 'Couplings',
    name_nl: 'Koppelingen',
    name_fr: 'Raccords',
    description: 'Quick couplings and connectors',
    icon: 'link',
    properties: COUPLING_PROPERTIES,
    specGroups: [
      {
        id: 'general',
        name: 'General',
        name_nl: 'Algemeen',
        name_fr: 'Général',
        sortOrder: 0,
        properties: ['sku', 'bestelnr', 'series_name', 'coupling_type'],
      },
      {
        id: 'dimensions',
        name: 'Dimensions',
        name_nl: 'Afmetingen',
        name_fr: 'Dimensions',
        sortOrder: 1,
        properties: ['maat', 'connection_a', 'connection_b', 'thread_type'],
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        sortOrder: 2,
        properties: ['werkdruk'],
      },
      {
        id: 'technical',
        name: 'Technical',
        name_nl: 'Technisch',
        name_fr: 'Technique',
        sortOrder: 3,
        properties: ['material'],
      },
    ],
  },
}

// -----------------------------------------------------------------------------
// Catalog Group to Product Group Mapping
// -----------------------------------------------------------------------------

export const CATALOG_GROUP_MAPPING: Record<string, string> = {
  'compressed_air': 'compressed_air',
  'fittings': 'pipes_fittings',
  'pipes': 'pipes_fittings',
  'pumps': 'pumps',
  'hoses': 'hoses',
  'valves': 'valves',
  'couplings': 'couplings',
  'general': 'pipes_fittings', // Default fallback
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Get the product group for a given catalog_group
 */
export function getProductGroup(catalogGroup: string): ProductGroup {
  const groupId = CATALOG_GROUP_MAPPING[catalogGroup] || 'pipes_fittings'
  return PRODUCT_GROUPS[groupId]
}

/**
 * Get applicable properties for a product based on its catalog_group
 */
export function getApplicableProperties(catalogGroup: string): PropertyDefinition[] {
  const group = getProductGroup(catalogGroup)
  return group.properties
}

/**
 * Get primary properties (shown in list/card view)
 */
export function getPrimaryProperties(catalogGroup: string): PropertyDefinition[] {
  return getApplicableProperties(catalogGroup).filter(p => p.isPrimary)
}

/**
 * Get filterable properties for search
 */
export function getFilterableProperties(catalogGroup: string): PropertyDefinition[] {
  return getApplicableProperties(catalogGroup).filter(p => p.isFilterable)
}

/**
 * Check if a property is applicable to a product group
 */
export function isPropertyApplicable(catalogGroup: string, propertyKey: string): boolean {
  const properties = getApplicableProperties(catalogGroup)
  return properties.some(p => p.key === propertyKey)
}

/**
 * Filter product data to only include applicable properties with values
 */
export function filterProductProperties<T extends Record<string, unknown>>(
  product: T,
  catalogGroup: string
): Partial<T> {
  const applicableKeys = getApplicableProperties(catalogGroup).map(p => p.key)
  const filtered: Partial<T> = {}
  
  for (const key of applicableKeys) {
    const value = product[key]
    // Only include if value exists and is not empty
    if (value !== undefined && value !== null && value !== '') {
      filtered[key as keyof T] = value as T[keyof T]
    }
  }
  
  return filtered
}

/**
 * Get grouped specifications for display
 */
export function getGroupedSpecifications(
  product: Record<string, unknown>,
  catalogGroup: string,
  language: 'en' | 'nl' | 'fr' = 'en'
): Array<{
  group: { id: string; name: string }
  specs: Array<{ label: string; value: string; unit?: string }>
}> {
  const productGroup = getProductGroup(catalogGroup)
  const result: Array<{
    group: { id: string; name: string }
    specs: Array<{ label: string; value: string; unit?: string }>
  }> = []
  
  for (const specGroup of productGroup.specGroups) {
    const specs: Array<{ label: string; value: string; unit?: string }> = []
    
    for (const propKey of specGroup.properties) {
      const propDef = productGroup.properties.find(p => p.key === propKey)
      if (!propDef) continue
      
      const value = product[propKey]
      // Skip empty values
      if (value === undefined || value === null || value === '') continue
      
      const label = language === 'nl' ? propDef.label_nl 
                  : language === 'fr' ? propDef.label_fr 
                  : propDef.label
      
      specs.push({
        label,
        value: String(value),
        unit: propDef.unit,
      })
    }
    
    // Only include group if it has specs
    if (specs.length > 0) {
      const groupName = language === 'nl' ? specGroup.name_nl 
                      : language === 'fr' ? specGroup.name_fr 
                      : specGroup.name
      
      result.push({
        group: { id: specGroup.id, name: groupName },
        specs,
      })
    }
  }
  
  return result
}
