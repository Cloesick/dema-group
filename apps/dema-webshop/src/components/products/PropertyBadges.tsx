import React from 'react';
import { getPropertyDisplay } from '@/config/propertyIcons';

interface PropertyBadgesProps {
  properties: Record<string, any>;
  maxDisplay?: number;
  showLabels?: boolean;
  compact?: boolean;
}

// Unit mappings based on property key patterns
const UNIT_MAPPINGS: Record<string, string> = {
  // Length/Distance
  'length_m': 'm',
  'length_mm': 'mm',
  'length_cm': 'cm',
  'lengte': 'm',
  // Diameter (Dutch and English)
  'diameter_mm': 'mm',
  'diameter': 'mm',
  'inner_diameter': 'mm',
  'outer_diameter': 'mm',
  'binnendiameter': 'mm',
  'buitendiameter': 'mm',
  'binnen_dia_mm': 'mm',
  'buiten_dia_mm': 'mm',
  'binnen_dia': 'mm',
  'buiten_dia': 'mm',
  // Pressure
  'pressure_bar': 'bar',
  'pressure_max_bar': 'bar',
  'werkdruk': 'bar',
  'druk': 'bar',
  'max_druk': 'bar',
  'barstdruk': 'bar',
  // Weight
  'weight_kg': 'kg',
  'gewicht': 'kg',
  'gewicht_kg': 'kg',
  'gewicht_g_m': 'g/m',
  'massa': 'kg',
  // Power
  'power_kw': 'kW',
  'vermogen': 'kW',
  'power_hp': 'HP',
  // Voltage
  'voltage_v': 'V',
  'spanning': 'V',
  'volt': 'V',
  // Flow
  'flow_l_min': 'L/min',
  'debiet': 'L/min',
  'capaciteit': 'L/min',
  'flow_m3_per_h': 'm³/h',
  // Temperature
  'temp_c': '°C',
  'temperatuur': '°C',
  'min_temp': '°C',
  'max_temp': '°C',
  // Speed
  'rpm': 'RPM',
  'toerental': 'RPM',
  // Volume
  'volume_l': 'L',
  'inhoud': 'L',
  // Wall thickness
  'wanddikte': 'mm',
  'dikte': 'mm',
  // Sound
  'geluid': 'dB(A)',
  'lwa': 'dB(A)',
  'lpa': 'dB(A)',
  // Bend radius
  'buigradius': 'mm',
  'buigstraal': 'mm',
};

// Get unit for a property key
const getUnitForProperty = (key: string, value: string): string => {
  const keyLower = key.toLowerCase();
  const valueLower = value.toLowerCase();
  
  // Check if value already contains a unit - don't duplicate
  if (/\b(mm|cm|kg|bar|kw|hp|rpm|db|g\/m|l\/min|m³\/h)\b/i.test(valueLower)) return '';
  if (valueLower.includes('°c')) return '';
  
  // Check exact match first
  if (UNIT_MAPPINGS[keyLower]) {
    return UNIT_MAPPINGS[keyLower];
  }
  
  // Check partial matches
  for (const [pattern, unit] of Object.entries(UNIT_MAPPINGS)) {
    if (keyLower.includes(pattern)) {
      return unit;
    }
  }
  
  // Infer from key suffix
  if (keyLower.endsWith('_mm') || keyLower.endsWith('mm')) return 'mm';
  if (keyLower.endsWith('_m') && !keyLower.endsWith('_mm')) return 'm';
  if (keyLower.endsWith('_cm')) return 'cm';
  if (keyLower.endsWith('_bar') || keyLower.endsWith('bar')) return 'bar';
  if (keyLower.endsWith('_kg') || keyLower.endsWith('kg')) return 'kg';
  if (keyLower.endsWith('_kw') || keyLower.endsWith('kw')) return 'kW';
  if (keyLower.endsWith('_v') || keyLower.includes('volt')) return 'V';
  if (keyLower.endsWith('_l') || keyLower.includes('liter')) return 'L';
  
  return '';
};

// Human-readable property descriptions for tooltips
const PROPERTY_DESCRIPTIONS: Record<string, string> = {
  // Diameter
  'diameter_mm': 'Diameter',
  'diameter': 'Diameter',
  'binnen_dia_mm': 'Inner Diameter',
  'binnen_dia': 'Inner Diameter',
  'binnendiameter': 'Inner Diameter',
  'buiten_dia_mm': 'Outer Diameter',
  'buiten_dia': 'Outer Diameter',
  'buitendiameter': 'Outer Diameter',
  'inner_diameter': 'Inner Diameter',
  'outer_diameter': 'Outer Diameter',
  // Length/Size
  'length_m': 'Length',
  'length_mm': 'Length',
  'lengte': 'Length',
  'size': 'Size',
  'maat': 'Size',
  // Pressure
  'pressure_bar': 'Pressure',
  'pressure_max_bar': 'Max Pressure',
  'werkdruk': 'Working Pressure',
  'druk': 'Pressure',
  'max_druk': 'Max Pressure',
  'barstdruk': 'Burst Pressure',
  // Weight
  'weight_kg': 'Weight',
  'gewicht': 'Weight',
  'gewicht_kg': 'Weight',
  'gewicht_g_m': 'Weight per Meter',
  'massa': 'Mass',
  // Wall thickness
  'wanddikte': 'Wall Thickness',
  'dikte': 'Thickness',
  // Bend radius
  'buigradius': 'Bend Radius',
  'buigstraal': 'Bend Radius',
  // Power
  'power_kw': 'Power',
  'vermogen': 'Power',
  'power_hp': 'Horsepower',
  // Voltage
  'voltage_v': 'Voltage',
  'spanning': 'Voltage',
  'volt': 'Voltage',
  // Flow
  'flow_l_min': 'Flow Rate',
  'debiet': 'Flow Rate',
  'capaciteit': 'Capacity',
  'flow_m3_per_h': 'Flow Rate',
  // Temperature
  'temp_c': 'Temperature',
  'temperatuur': 'Temperature',
  'min_temp': 'Min Temperature',
  'max_temp': 'Max Temperature',
  // Speed
  'rpm': 'RPM',
  'toerental': 'RPM',
  // Volume
  'volume_l': 'Volume',
  'inhoud': 'Volume/Capacity',
  // Sound
  'geluid': 'Sound Level',
  'lwa': 'Sound Power Level',
  'lpa': 'Sound Pressure Level',
  // Material
  'material': 'Material',
  'materiaal': 'Material',
  'seal_material': 'Seal Material',
  // Connection
  'connection_type': 'Connection Type',
  'connection_size': 'Connection Size',
  'aansluiting': 'Connection',
};

// Get human-readable description for tooltip
const getPropertyDescription = (key: string): string => {
  const keyLower = key.toLowerCase();
  
  // Check exact match
  if (PROPERTY_DESCRIPTIONS[keyLower]) {
    return PROPERTY_DESCRIPTIONS[keyLower];
  }
  
  // Check partial matches
  for (const [pattern, desc] of Object.entries(PROPERTY_DESCRIPTIONS)) {
    if (keyLower.includes(pattern)) {
      return desc;
    }
  }
  
  // Fallback to formatted key
  return formatPropertyKey(key);
};

// Format property key for display
const formatPropertyKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b(mm|bar|kg|m|cm|l|w|v|hz)\b/gi, (match) => match.toUpperCase())
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Priority keys to show first
const PRIORITY_KEYS = [
  'spec_liquid_temp_range', 'spec_max_pressure', 'spec_water_pollution', 'spec_application_desc',
  'type', 'material', 'diameter', 'length', 'connection', 'size', 'maat',
  'pressure', 'druk', 'flow', 'power', 'voltage', 'weight', 'gewicht'
];

export const PropertyBadges: React.FC<PropertyBadgesProps> = ({ 
  properties, 
  maxDisplay = 6,
  showLabels = false,
  compact = false
}) => {
  if (!properties || Object.keys(properties).length === 0) {
    return null;
  }

  // Filter out duplicates and redundant properties
  const allEntries = Object.entries(properties);
  const filteredEntries = allEntries.filter(([key, value]) => {
    if (value == null || value === '') return false;
    
    // Skip internal/redundant fields
    if (key.includes('_mm') || key.includes('_bar') || key.includes('_kg')) {
      const displayKey = key.replace(/_mm|_bar|_kg/, '');
      if (properties[displayKey] || properties[`${displayKey}_display`]) {
        return false;
      }
    }
    
    // Skip raw numeric versions if display version exists
    if (key.endsWith('_m') || key.endsWith('_cm')) {
      const baseKey = key.replace(/_m$|_cm$/, '');
      if (properties[`${baseKey}_display`] || properties[baseKey]) {
        return false;
      }
    }
    
    // Skip metadata fields and duplicate properties
    if (['page_in_pdf', 'pdf_source', 'source_pages', 'catalog', 'brand', 'category', 'sku', 'bestelnr', 'type', 'sku_series', 'seal_material_name'].includes(key)) {
      return false;
    }
    
    return true;
  });

  // Sort by priority
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aKey = a[0].toLowerCase();
    const bKey = b[0].toLowerCase();
    const aPriority = PRIORITY_KEYS.findIndex(p => aKey.includes(p));
    const bPriority = PRIORITY_KEYS.findIndex(p => bKey.includes(p));
    
    if (aPriority !== -1 && bPriority === -1) return -1;
    if (aPriority === -1 && bPriority !== -1) return 1;
    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    return 0;
  });

  // Limit display
  const entries = sortedEntries.slice(0, maxDisplay);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'mb-2' : 'mb-3'}>
      {!compact && (
        <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Properties</div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([key, value]) => {
          const displayValue = String(value);
          const { icon, bg, text } = getPropertyDisplay(key, displayValue);
          const description = getPropertyDescription(key);
          const unit = getUnitForProperty(key, displayValue);
          const valueWithUnit = unit ? `${displayValue} ${unit}` : displayValue;
          
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-black/5 ${bg} ${text} cursor-help`}
              title={description}
            >
              <span className="text-sm leading-none">{icon}</span>
              {showLabels && (
                <span className="text-[10px] opacity-70 uppercase">{description}:</span>
              )}
              <span className="truncate max-w-[100px]">{valueWithUnit}</span>
            </span>
          );
        })}
        {filteredEntries.length > maxDisplay && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
            +{filteredEntries.length - maxDisplay} more
          </span>
        )}
      </div>
    </div>
  );
};

export default PropertyBadges;
