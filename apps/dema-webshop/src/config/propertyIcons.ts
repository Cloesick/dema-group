/**
 * Property Icon Configuration - MASTER MERGED VERSION
 * 
 * LOGIC KEY:
 * - ⚙️ vs 💿 : Teeth (Saws) vs Abrasive (Grinders).
 * - ⭕ vs ⚫ : Hollow (Inner Dia) vs Solid (Outer Dia).
 * - ⏱️ vs 🔧 : Gauge (Pressure) vs Tool (Wrench Size).
 * 
 * COLOR KEY (Tailwind classes):
 * - Power/Energy: amber, yellow, orange
 * - Pressure/Flow: red, blue, sky
 * - Dimensions: teal, green
 * - Materials: slate, zinc, stone
 * - Connections: indigo, violet, cyan
 * - Temperature: red
 */

export interface IconMapping {
  category: string;
  icon: string;
  keywords: string[];
  description: string;
  priority: number;
  color?: string;      // Tailwind bg class
  textColor?: string;  // Tailwind text class
}

export const PROPERTY_ICON_MAPPINGS: IconMapping[] = [
  // ============================================
  // 1. IDENTIFICATION (Global)
  // ============================================
  { 
    category: 'ID', 
    icon: '#️⃣', 
    keywords: ['art.nr.', 'artikelnummer', 'bestelnr', 'model', 'type', 'productcode'], 
    description: 'Product ID (Number)', 
    priority: 100 
  },
  { 
    category: 'ID', 
    icon: '🆔', 
    keywords: ['ean', 'ean-code', 'gtin', 'barcode'], 
    description: 'Barcode / EAN', 
    priority: 100 
  },
  { 
    category: 'ID', 
    icon: '📦', 
    keywords: ['verpakking', 'vpe', 'stuks per doos', 'doosinhoud'], 
    description: 'Packaging Unit', 
    priority: 95 
  },

  // ============================================
  // 2. FITTINGS (Messing & RVS Draadfittingen)
  // ============================================
  { 
    category: 'FIT_SIZE', 
    icon: '📏', // Ruler for inch/size measurements
    keywords: ['size', 'maat', 'afmeting'], 
    description: 'Size (inches)', 
    priority: 99,
    color: 'bg-indigo-100',
    textColor: 'text-indigo-700'
  },
  { 
    category: 'FIT_THREAD', 
    icon: '🔩', // Bolt represents thread clearly
    keywords: ['draad', 'draadmaat', 'schroefdraad', 'aansluitmaat'], 
    description: 'Thread Size', 
    priority: 98 
  },
  { 
    category: 'FIT_TYPE', 
    icon: '📐', // Angle ruler implies geometry/shape
    keywords: ['vorm', 'type fitting', 'bocht', 'knie', 't-stuk', 'sok', 'verloop'], 
    description: 'Fitting Shape/Geometry', 
    priority: 95 
  },
  { 
    category: 'FIT_WRENCH', 
    icon: '🔧', // Wrench for Spanner Width (SW)
    keywords: ['sleutelwijdte', 'sw'], 
    description: 'Wrench Size (SW)', 
    priority: 95 
  },
  { 
    category: 'FIT_MAT', 
    icon: '⚗️', // Alembic implies chemical composition/alloy
    keywords: ['materiaal', 'oppervlakte', 'messing', 'rvs', 'roestvast staal', 'material'], 
    description: 'Material Composition', 
    priority: 90 
  },

  // ============================================
  // 3. HOSE TECHNOLOGY
  // ============================================
  { 
    category: 'HOSE_FLEX', 
    icon: '➰', // Loop represents flexibility
    keywords: ['buigradius', 'buigstraal', 'radius'], 
    description: 'Bend Radius / Loop', 
    priority: 95 
  },
  { 
    category: 'HOSE_VAC', 
    icon: '🌀', // Spiral implies suction/vacuum
    keywords: ['vacuüm', 'vacuum', 'vacu', 'onderdruk'], 
    description: 'Vacuum Rating', 
    priority: 95 
  },
  { 
    category: 'HOSE_BURST', 
    icon: '💥', 
    keywords: ['barstdruk', 'platzen', 'burst pressure'], 
    description: 'Burst Pressure', 
    priority: 95 
  },
  { 
    category: 'HOSE_ROLL', 
    icon: '🧶', // Yarn ball looks like a rolled hose
    keywords: ['rollengte', 'lengte op rol'], 
    description: 'Roll Length', 
    priority: 90 
  },
  { 
    category: 'HOSE_WALL', 
    icon: '↕️', // Up-down arrow represents wall thickness
    keywords: ['wanddikte', 'dikte'], 
    description: 'Wall Thickness', 
    priority: 90 
  },

  // ============================================
  // 4. MAKITA GARDEN & TOOLS (SPLIT LOGIC)
  // ============================================
  { 
    category: 'GARDEN_AIR', 
    icon: '💨', // Dash implies speed/velocity
    keywords: ['luchtsnelheid', 'blaassnelheid'], 
    description: 'Air Speed', 
    priority: 95 
  },
  { 
    category: 'GARDEN_VOL', 
    icon: '☁️', // Cloud implies volume
    keywords: ['luchtvolume', 'blaasvolume'], 
    description: 'Air Volume', 
    priority: 95 
  },
  { 
    category: 'GARDEN_CUT', 
    icon: '✂️', 
    keywords: ['maaibreedte', 'snijbreedte', 'kniplengte', 'zwaardlengte'], 
    description: 'Cutting Width/Length', 
    priority: 95 
  },
  { 
    category: 'GARDEN_HEIGHT', 
    icon: '🌾', // Rice/Grass implies cutting height
    keywords: ['maaihoogte', 'snijhoogte'], 
    description: 'Cutting Height', 
    priority: 95 
  },
  { 
    category: 'GARDEN_BOX', 
    icon: '🎒', // Backpack/Bag implies collection capacity
    keywords: ['inhoud opvangbak', 'opvangzak'], 
    description: 'Collection Bag', 
    priority: 90 
  },
  // --- DISC LOGIC SPLIT START ---
  { 
    category: 'TOOL_BLADE_TEETH', 
    icon: '⚙️', // Gear represents a Toothed Blade (Saws)
    keywords: ['zaagblad', 'cirkelzaagblad', 'maaimes', 'tanden', 'teeth'], 
    description: 'Toothed Blade', 
    priority: 92 
  },
  { 
    category: 'TOOL_DISC_GRIND', 
    icon: '💿', // CD represents a Flat Abrasive Disc (Grinders)
    keywords: ['slijpschijf', 'afbraamschijf', 'diamantschijf', 'schijf', 'disc'], 
    description: 'Abrasive Disc', 
    priority: 90 
  },
  // --- DISC LOGIC SPLIT END ---
  { 
    category: 'TOOL_VIB', 
    icon: '👋', // Waving hand implies vibration
    keywords: ['trilling', 'trillingswaarde', 'vibra'], 
    description: 'Vibration', 
    priority: 85 
  },

  // ============================================
  // 5. PUMPS & HYDRAULICS
  // ============================================
  { 
    category: 'PUMP_LIFT', 
    icon: '🏗️', // Crane/Lift implies lifting height
    keywords: ['opvoerhoogte', 'max. opvoerhoogte', 'head'], 
    description: 'Max Head / Lift', 
    priority: 90 
  },
  { 
    category: 'PUMP_FLOW', 
    icon: '🚰', // Tap implies flow rate
    keywords: ['capaciteit', 'debiet', 'max. capaciteit', 'l/min', 'm³/u'], 
    description: 'Flow Rate', 
    priority: 90 
  },
  { 
    category: 'PUMP_SUB', 
    icon: '🤿', // Dive mask implies immersion
    keywords: ['dompeldiepte', 'max. dompeldiepte'], 
    description: 'Immersion Depth', 
    priority: 90 
  },
  { 
    category: 'PUMP_CASE', 
    icon: '🚇', // Tube/Tunnel implies well pump diameter
    keywords: ['pomp diameter', 'diameter pomp', 'bronpomp'], 
    description: 'Pump/Well Diameter', 
    priority: 88 
  },

  // ============================================
  // 6. ELECTRICAL & POWER
  // ============================================
  { 
    category: 'POWER_BATT', 
    icon: '🔋', 
    keywords: ['accu', 'accutype', 'platform', 'lxt', 'xgt', 'cxt', 'ah'], 
    description: 'Battery Platform', 
    priority: 95 
  },
  { 
    category: 'POWER_VOLT', 
    icon: '⚡', 
    keywords: ['volt', 'spanning', 'voltage'], 
    description: 'Voltage', 
    priority: 90 
  },
  { 
    category: 'POWER_WATT', 
    icon: '🔌', // Plug implies electric power input
    keywords: ['opgenomen vermogen', 'watt', 'kw', 'vermogen'], 
    description: 'Power Input (Electric)', 
    priority: 90 
  },
  { 
    category: 'POWER_HP', 
    icon: '🐴', 
    keywords: ['hp', 'pk', 'horsepower', 'paardenkracht'], 
    description: 'Horsepower', 
    priority: 91 
  },
  { 
    category: 'POWER_SPEED', 
    icon: '🏎️', // Race car implies speed/RPM
    keywords: ['toerental', 'onbelast toerental', 'rpm', 'slagen'], 
    description: 'RPM / Speed', 
    priority: 85 
  },

  // ============================================
  // 7. PRESSURE
  // ============================================
  { 
    category: 'PRESS_WORK', 
    icon: '🏋️', // Gauge/Stopwatch implies fluid pressure
    keywords: ['werkdruk', 'bedrijfsdruk', 'max. druk', 'bar', 'psi'], 
    description: 'Working Pressure', 
    priority: 90 
  },
  { 
    category: 'PRESS_CLASS', 
    icon: '🎓', // Grad cap implies "Class" or rating
    keywords: ['pn', 'drukklasse', 'sdr'], 
    description: 'Pressure Class', 
    priority: 90 
  },

  // ============================================
  // 8. DIMENSIONS (The Pipe View Logic)
  // ============================================
  { 
    category: 'DIM_DIA_INCH', 
    icon: '📏', // Ruler for Imperial (Professional)
    keywords: ['inch', 'inches', '"', '\'', 'zoll', 'duims'], 
    description: 'Diameter (Imperial)', 
    priority: 88 
  },
  { 
    category: 'DIM_DIA_IN', 
    icon: '⭕', // Hollow Circle = HOLE = Inner
    keywords: ['inwendig', 'binnen', 'id', 'binnendiameter', 'inner', 'innen', 'di', 'dn', 'doorlaat', 'boring', 'asgat', 'lumen'], 
    description: 'Inner Diameter / Bore', 
    priority: 85 
  },
  { 
    category: 'DIM_DIA_OUT', 
    icon: '⚫', // Solid Circle = BULK = Outer
    keywords: ['uitwendig', 'buiten', 'od', 'buitendiameter'], 
    description: 'Outer Diameter', 
    priority: 85 
  },
  { 
    category: 'DIM_LWH', 
    icon: '📐', // Dimensions format: L x W x H
    keywords: ['x', '*', 'afmetingen', 'afmeting', 'lxbxh', 'lxwxh'], 
    description: 'Dimensions (L×W×H)', 
    priority: 80 
  },
  { 
    category: 'DIM_DIA_GENERAL', 
    icon: '🔘', // Generic button for unspecified diameter
    keywords: ['diameter', 'ø', 'diam', 'dia', 'doorsnede', 'mm', 'millimeter'], 
    description: 'Diameter (General/mm)', 
    priority: 75 
  },
  { 
    category: 'DIM_L', 
    icon: '📏', // Ruler implies Length
    keywords: ['lengte', 'l', 'lang'], 
    description: 'Length', 
    priority: 60 
  },
  { 
    category: 'DIM_W', 
    icon: '↔️', // Left-Right arrow implies Width
    keywords: ['breedte', 'b', 'wijdte'], 
    description: 'Width', 
    priority: 60 
  },
  { 
    category: 'DIM_H', 
    icon: '↕️', // Up-Down arrow implies Height
    keywords: ['hoogte', 'h'], 
    description: 'Height', 
    priority: 60 
  },
  { 
    category: 'WEIGHT', 
    icon: '⚖️', 
    keywords: ['gewicht', 'netto gewicht', 'massa'], 
    description: 'Weight', 
    priority: 60 
  },
  { 
    category: 'SOUND', 
    icon: '🔊', 
    keywords: ['geluid', 'lpa', 'lwa', 'db(a)', 'decibel'], 
    description: 'Sound Level', 
    priority: 60 
  },

  // ============================================
  // 9. MAKITA TOOL PROPERTIES
  // ============================================
  { 
    category: 'TOOL_NAIL', 
    icon: '📌', 
    keywords: ['nagelkop', 'nagel', 'doorsnede_nagel', 'lengte_nagel'], 
    description: 'Nail Specs', 
    priority: 85,
    color: 'bg-orange-100',
    textColor: 'text-orange-700'
  },
  { 
    category: 'TOOL_DRILL', 
    icon: '🔩', 
    keywords: ['boorkop', 'boordiameter', 'schroefdiameter', 'boorhouder'], 
    description: 'Drill Capacity', 
    priority: 85,
    color: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  { 
    category: 'TOOL_TORQUE', 
    icon: '💪', 
    keywords: ['max_koppel', 'koppel', 'draaimoment', 'torque', 'slagkracht'], 
    description: 'Torque', 
    priority: 85,
    color: 'bg-red-100',
    textColor: 'text-red-700'
  },
  { 
    category: 'TOOL_SAW', 
    icon: '🪚', 
    keywords: ['zaagblad', 'snijdiepte', 'zaagcapaciteit', 'afkortzaag', 'bladlengte'], 
    description: 'Saw Capacity', 
    priority: 85,
    color: 'bg-amber-100',
    textColor: 'text-amber-700'
  },
  { 
    category: 'TOOL_GRIND', 
    icon: '💿', 
    keywords: ['slijpschijf', 'schijfdiameter'], 
    description: 'Grinding Disc', 
    priority: 85,
    color: 'bg-zinc-100',
    textColor: 'text-zinc-700'
  },
  { 
    category: 'TOOL_CHAIN', 
    icon: '⛓️', 
    keywords: ['kettingzaag', 'ketting', 'zwaard'], 
    description: 'Chainsaw', 
    priority: 85,
    color: 'bg-green-100',
    textColor: 'text-green-700'
  },
  { 
    category: 'TOOL_MOW', 
    icon: '🌿', 
    keywords: ['maaibreedte', 'maailengte', 'snijbreedte', 'maaihoogte'], 
    description: 'Mowing Width', 
    priority: 85,
    color: 'bg-lime-100',
    textColor: 'text-lime-700'
  },
  { 
    category: 'TOOL_BLOW', 
    icon: '💨', 
    keywords: ['luchtsnelheid', 'luchtvolume', 'zuigkracht', 'blaaskracht'], 
    description: 'Air Speed/Volume', 
    priority: 85,
    color: 'bg-sky-100',
    textColor: 'text-sky-700'
  },
  { 
    category: 'TOOL_BAG', 
    icon: '🧺', 
    keywords: ['opvangzak', 'opvangbak', 'stofzak'], 
    description: 'Collection Bag', 
    priority: 80,
    color: 'bg-emerald-100',
    textColor: 'text-emerald-700'
  },
  { 
    category: 'TOOL_TANK', 
    icon: '🛢️', 
    keywords: ['tankinhoud', 'reservoir'], 
    description: 'Tank Capacity', 
    priority: 80,
    color: 'bg-cyan-100',
    textColor: 'text-cyan-700'
  },
  { 
    category: 'TOOL_CHARGER', 
    icon: '🔌', 
    keywords: ['lader', 'bijgeleverde_lader', 'oplader'], 
    description: 'Charger', 
    priority: 80,
    color: 'bg-yellow-100',
    textColor: 'text-yellow-700'
  },
  { 
    category: 'TOOL_INCL', 
    icon: '📦', 
    keywords: ['eleverde_accu_s', 'bijgeleverd', 'inclusief', 'meegeleverd'], 
    description: 'Included Items', 
    priority: 75,
    color: 'bg-indigo-100',
    textColor: 'text-indigo-700'
  },
  { 
    category: 'PRICE', 
    icon: '💰', 
    keywords: ['price_excl_btw', 'price_incl_btw', 'prijs', 'price'], 
    description: 'Price', 
    priority: 95,
    color: 'bg-green-100',
    textColor: 'text-green-700'
  },

  // ============================================
  // 10. DEFAULT
  // ============================================
  { 
    category: 'DEFAULT', 
    icon: '▪️', 
    keywords: [], 
    description: 'Fallback', 
    priority: 0 
  }
];

// ============================================
// CATEGORY COLOR MAPPINGS
// ============================================

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  // Identification
  ID: { bg: 'bg-gray-100', text: 'text-gray-700' },
  
  // Fittings
  FIT_THREAD: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  FIT_TYPE: { bg: 'bg-pink-100', text: 'text-pink-700' },
  FIT_WRENCH: { bg: 'bg-slate-100', text: 'text-slate-700' },
  FIT_MAT: { bg: 'bg-amber-100', text: 'text-amber-800' },
  
  // Hose
  HOSE_FLEX: { bg: 'bg-purple-100', text: 'text-purple-700' },
  HOSE_VAC: { bg: 'bg-violet-100', text: 'text-violet-700' },
  HOSE_BURST: { bg: 'bg-red-100', text: 'text-red-700' },
  HOSE_ROLL: { bg: 'bg-green-100', text: 'text-green-700' },
  HOSE_WALL: { bg: 'bg-stone-100', text: 'text-stone-700' },
  
  // Garden/Tools
  GARDEN_AIR: { bg: 'bg-sky-100', text: 'text-sky-700' },
  GARDEN_VOL: { bg: 'bg-blue-100', text: 'text-blue-700' },
  GARDEN_CUT: { bg: 'bg-rose-100', text: 'text-rose-700' },
  GARDEN_HEIGHT: { bg: 'bg-lime-100', text: 'text-lime-700' },
  GARDEN_BOX: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  TOOL_BLADE_TEETH: { bg: 'bg-zinc-200', text: 'text-zinc-800' },
  TOOL_DISC_GRIND: { bg: 'bg-neutral-200', text: 'text-neutral-700' },
  TOOL_VIB: { bg: 'bg-orange-100', text: 'text-orange-700' },
  
  // Pumps
  PUMP_LIFT: { bg: 'bg-sky-100', text: 'text-sky-700' },
  PUMP_FLOW: { bg: 'bg-blue-100', text: 'text-blue-700' },
  PUMP_SUB: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  PUMP_CASE: { bg: 'bg-teal-100', text: 'text-teal-700' },
  
  // Power/Electrical
  POWER_BATT: { bg: 'bg-green-100', text: 'text-green-700' },
  POWER_VOLT: { bg: 'bg-orange-100', text: 'text-orange-700' },
  POWER_WATT: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  POWER_HP: { bg: 'bg-amber-100', text: 'text-amber-800' },
  POWER_SPEED: { bg: 'bg-rose-100', text: 'text-rose-700' },
  
  // Pressure
  PRESS_WORK: { bg: 'bg-red-100', text: 'text-red-700' },
  PRESS_CLASS: { bg: 'bg-red-50', text: 'text-red-600' },
  
  // Dimensions
  DIM_DIA_INCH: { bg: 'bg-teal-100', text: 'text-teal-700' },
  DIM_DIA_IN: { bg: 'bg-teal-100', text: 'text-teal-700' },
  DIM_DIA_OUT: { bg: 'bg-teal-200', text: 'text-teal-800' },
  DIM_LWH: { bg: 'bg-green-100', text: 'text-green-700' },
  DIM_DIA_GENERAL: { bg: 'bg-teal-50', text: 'text-teal-600' },
  DIM_L: { bg: 'bg-green-100', text: 'text-green-700' },
  DIM_W: { bg: 'bg-green-100', text: 'text-green-700' },
  DIM_H: { bg: 'bg-green-100', text: 'text-green-700' },
  
  // Other
  WEIGHT: { bg: 'bg-slate-100', text: 'text-slate-700' },
  SOUND: { bg: 'bg-purple-100', text: 'text-purple-700' },
  
  // Makita Tool Properties
  TOOL_NAIL: { bg: 'bg-orange-100', text: 'text-orange-700' },
  TOOL_DRILL: { bg: 'bg-blue-100', text: 'text-blue-700' },
  TOOL_TORQUE: { bg: 'bg-red-100', text: 'text-red-700' },
  TOOL_SAW: { bg: 'bg-amber-100', text: 'text-amber-700' },
  TOOL_GRIND: { bg: 'bg-zinc-100', text: 'text-zinc-700' },
  TOOL_CHAIN: { bg: 'bg-green-100', text: 'text-green-700' },
  TOOL_MOW: { bg: 'bg-lime-100', text: 'text-lime-700' },
  TOOL_BLOW: { bg: 'bg-sky-100', text: 'text-sky-700' },
  TOOL_BAG: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  TOOL_TANK: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  TOOL_CHARGER: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  TOOL_INCL: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  PRICE: { bg: 'bg-green-100', text: 'text-green-700' },
  
  // Default
  DEFAULT: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

/**
 * Get color classes for a category
 */
export function getCategoryColors(category: string): { bg: string; text: string } {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.DEFAULT;
}

/**
 * Get icon for a property key and/or value
 * @param key - Property key to match
 * @param value - Optional property value to match (for dimension patterns like "16 x 12 x 10")
 * @returns Emoji icon
 */
export function getPropertyIcon(key: string, value?: string): string {
  const keyLower = key.toLowerCase();
  const valueLower = value?.toLowerCase() || '';
  
  // Special case: detect dimension pattern in value (e.g., "16 mm x 12 mm x 3/8")
  if (value && /\d+\s*[x*×]\s*\d+/i.test(value)) {
    return '\u{1F4D0}'; // 📐 Dimensions icon
  }
  
  // Special case: detect simple diameter value (e.g., "20 mm", "25mm", "12.5 mm")
  if (value && /^\d+([.,]\d+)?\s*mm$/i.test(value.trim())) {
    return '\u{1F518}'; // 🔘 Diameter icon
  }
  
  // Sort by priority (highest first)
  const sortedMappings = [...PROPERTY_ICON_MAPPINGS].sort((a, b) => 
    (b.priority || 0) - (a.priority || 0)
  );
  
  // Find first matching mapping (check key first, then value)
  for (const mapping of sortedMappings) {
    if (mapping.keywords.length === 0) continue; // Skip default
    
    for (const keyword of mapping.keywords) {
      const kw = keyword.toLowerCase();
      if (keyLower.includes(kw) || valueLower.includes(kw)) {
        return mapping.icon;
      }
    }
  }
  
  // Return default icon
  return '\u25AA\uFE0F'; // ▪️
}

/**
 * Get all mappings for a specific category
 */
export function getMappingsByCategory(category: string): IconMapping[] {
  return PROPERTY_ICON_MAPPINGS.filter(m => m.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  PROPERTY_ICON_MAPPINGS.forEach(m => categories.add(m.category));
  return Array.from(categories);
}

/**
 * Get icon AND colors for a property key
 * Returns both the emoji icon and Tailwind color classes
 */
export function getPropertyDisplay(key: string, value?: string): {
  icon: string;
  bg: string;
  text: string;
  category: string;
} {
  const keyLower = key.toLowerCase();
  const valueLower = value?.toLowerCase() || '';
  
  // Special case: dimension pattern
  if (value && /\d+\s*[x*×]\s*\d+/i.test(value)) {
    const colors = getCategoryColors('DIM_LWH');
    return { icon: '\u{1F4D0}', ...colors, category: 'DIM_LWH' };
  }
  
  // Special case: simple mm value
  if (value && /^\d+([.,]\d+)?\s*mm$/i.test(value.trim())) {
    const colors = getCategoryColors('DIM_DIA_GENERAL');
    return { icon: '\u{1F518}', ...colors, category: 'DIM_DIA_GENERAL' };
  }
  
  // Sort by priority
  const sortedMappings = [...PROPERTY_ICON_MAPPINGS].sort((a, b) => 
    (b.priority || 0) - (a.priority || 0)
  );
  
  // Find matching mapping
  for (const mapping of sortedMappings) {
    if (mapping.keywords.length === 0) continue;
    
    for (const keyword of mapping.keywords) {
      const kw = keyword.toLowerCase();
      if (keyLower.includes(kw) || valueLower.includes(kw)) {
        const colors = getCategoryColors(mapping.category);
        return { icon: mapping.icon, ...colors, category: mapping.category };
      }
    }
  }
  
  // Default
  const defaultColors = getCategoryColors('DEFAULT');
  return { icon: '\u25AA\uFE0F', ...defaultColors, category: 'DEFAULT' };
}