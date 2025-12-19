/**
 * PDF-specific property configuration
 * Defines which properties to display and in what order for each PDF source
 * Icons are looked up from propertyIcons.ts
 */

import { getPropertyIcon } from './propertyIcons';

export interface PropertyConfig {
  key: string;
  label: string;
}

export interface PdfPropertyConfig {
  displayName: string;
  properties: PropertyConfig[];
}

// Property configurations per PDF source (order matters - first properties shown first)
export const PDF_PROPERTY_CONFIGS: Record<string, PdfPropertyConfig> = {
  'abs-persluchtbuizen': {
    displayName: 'ABS Persluchtbuizen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'werkdruk', label: 'Werkdruk' },
      { key: 'type', label: 'Type' },
      { key: 'angle', label: 'Hoek' },
      { key: 'application', label: 'Toepassing' },
    ]
  },
  'pomp-specials': {
    displayName: 'Pomp Specials',
    properties: [
      { key: 'type', label: 'Type' },
      { key: 'debiet_m3_h', label: 'Debiet (m³/h)' },
      { key: 'aansluiting', label: 'Aansluiting' },
      { key: 'aanzuigdiepte_m', label: 'Aanzuigdiepte (m)' },
      { key: 'opv_hoogte_m', label: 'Opvoerhoogte (m)' },
      { key: 'lengte', label: 'Lengte' },
      { key: 'spec_max_pressure', label: 'Max Druk' },
    ]
  },
  'slangkoppelingen': {
    displayName: 'Slangkoppelingen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'werkdruk', label: 'Werkdruk' },
      { key: 'spec_thread_type', label: 'Draadtype' },
      { key: 'application', label: 'Toepassing' },
    ]
  },
  'slangklemmen': {
    displayName: 'Slangklemmen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'materiaal', label: 'Materiaal' },
      { key: 'breedte', label: 'Breedte' },
    ]
  },
  'drukbuizen': {
    displayName: 'Drukbuizen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'werkdruk', label: 'Werkdruk' },
      { key: 'wanddikte', label: 'Wanddikte' },
      { key: 'lengte', label: 'Lengte' },
    ]
  },
  'pe-buizen': {
    displayName: 'PE Buizen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'drukklasse', label: 'Drukklasse' },
      { key: 'wanddikte', label: 'Wanddikte' },
      { key: 'rollengte', label: 'Rollengte' },
    ]
  },
  'rubber-slangen': {
    displayName: 'Rubber Slangen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'werkdruk', label: 'Werkdruk' },
      { key: 'buigradius', label: 'Buigradius' },
      { key: 'temperatuur', label: 'Temperatuur' },
    ]
  },
  'pu-afzuigslangen': {
    displayName: 'PU Afzuigslangen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'wanddikte', label: 'Wanddikte' },
      { key: 'buigradius', label: 'Buigradius' },
      { key: 'vacuum', label: 'Vacuüm' },
    ]
  },
  'messing-draadfittingen': {
    displayName: 'Messing Draadfittingen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'draadmaat', label: 'Draadmaat' },
      { key: 'sleutelwijdte', label: 'Sleutelwijdte' },
      { key: 'materiaal', label: 'Materiaal' },
    ]
  },
  'rvs-draadfittingen': {
    displayName: 'RVS Draadfittingen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'draadmaat', label: 'Draadmaat' },
      { key: 'sleutelwijdte', label: 'Sleutelwijdte' },
      { key: 'materiaal', label: 'Materiaal' },
    ]
  },
  'verzinkte-buizen': {
    displayName: 'Verzinkte Buizen',
    properties: [
      { key: 'maat', label: 'Maat' },
      { key: 'type', label: 'Type' },
      { key: 'lengte', label: 'Lengte' },
      { key: 'wanddikte', label: 'Wanddikte' },
    ]
  },
  'dompelpompen': {
    displayName: 'Dompelpompen',
    properties: [
      { key: 'type', label: 'Type' },
      { key: 'debiet_m3_h', label: 'Debiet (m³/h)' },
      { key: 'opv_hoogte_m', label: 'Opvoerhoogte (m)' },
      { key: 'dompeldiepte', label: 'Dompeldiepte' },
      { key: 'vermogen', label: 'Vermogen' },
      { key: 'spanning', label: 'Spanning' },
    ]
  },
  'centrifugaalpompen': {
    displayName: 'Centrifugaalpompen',
    properties: [
      { key: 'type', label: 'Type' },
      { key: 'debiet_m3_h', label: 'Debiet (m³/h)' },
      { key: 'opv_hoogte_m', label: 'Opvoerhoogte (m)' },
      { key: 'aansluiting', label: 'Aansluiting' },
      { key: 'vermogen', label: 'Vermogen' },
    ]
  },
  'bronpompen': {
    displayName: 'Bronpompen',
    properties: [
      { key: 'type', label: 'Type' },
      { key: 'debiet_m3_h', label: 'Debiet (m³/h)' },
      { key: 'opv_hoogte_m', label: 'Opvoerhoogte (m)' },
      { key: 'pomp_diameter', label: 'Pomp Diameter' },
      { key: 'vermogen', label: 'Vermogen' },
      { key: 'spanning', label: 'Spanning' },
    ]
  },
  'kranzle-catalogus-2021-nl-1': {
    displayName: 'Kränzle Hogedrukreinigers',
    properties: [
      { key: 'model', label: 'Model' },
      { key: 'type', label: 'Type' },
      { key: 'druk_bar', label: 'Druk (bar)' },
      { key: 'debiet', label: 'Debiet' },
      { key: 'vermogen', label: 'Vermogen' },
      { key: 'gewicht', label: 'Gewicht' },
    ]
  },
  'makita-catalogus-2022-nl': {
    displayName: 'Makita Gereedschap',
    properties: [
      { key: 'model', label: 'Model' },
      { key: 'type', label: 'Type' },
      { key: 'accu', label: 'Accu' },
      { key: 'vermogen', label: 'Vermogen' },
      { key: 'toerental', label: 'Toerental' },
      { key: 'gewicht', label: 'Gewicht' },
    ]
  },
  'airpress-catalogus-eng': {
    displayName: 'Airpress Compressoren',
    properties: [
      { key: 'model', label: 'Model' },
      { key: 'type', label: 'Type' },
      { key: 'pressure', label: 'Pressure' },
      { key: 'tank', label: 'Tank' },
      { key: 'power', label: 'Power' },
      { key: 'weight', label: 'Weight' },
    ]
  },
};

// Default properties for unknown PDF sources
export const DEFAULT_PROPERTY_CONFIG: PropertyConfig[] = [
  { key: 'maat', label: 'Maat' },
  { key: 'type', label: 'Type' },
  { key: 'werkdruk', label: 'Werkdruk' },
  { key: 'materiaal', label: 'Materiaal' },
  { key: 'lengte', label: 'Lengte' },
  { key: 'diameter', label: 'Diameter' },
];

/**
 * Get property configuration for a PDF source
 * Returns array of {key, label} - icons are looked up separately via getPropertyIcon
 */
export function getPropertyConfig(pdfSource: string | undefined): PropertyConfig[] {
  if (!pdfSource) return DEFAULT_PROPERTY_CONFIG;
  
  // Remove .pdf extension and normalize
  const normalized = pdfSource.replace(/\.pdf$/i, '').toLowerCase();
  
  // Try exact match first
  if (PDF_PROPERTY_CONFIGS[normalized]) {
    return PDF_PROPERTY_CONFIGS[normalized].properties;
  }
  
  // Try partial match
  for (const [key, config] of Object.entries(PDF_PROPERTY_CONFIGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return config.properties;
    }
  }
  
  return DEFAULT_PROPERTY_CONFIG;
}

/**
 * Get a property with its icon from propertyIcons.ts
 */
export function getPropertyWithIcon(key: string, label: string): { key: string; label: string; icon: string } {
  return {
    key,
    label,
    icon: getPropertyIcon(key)
  };
}

/**
 * Get display name for a PDF source
 */
export function getPdfDisplayName(pdfSource: string | undefined): string {
  if (!pdfSource) return 'Unknown';
  
  const normalized = pdfSource.replace(/\.pdf$/i, '').toLowerCase();
  
  if (PDF_PROPERTY_CONFIGS[normalized]) {
    return PDF_PROPERTY_CONFIGS[normalized].displayName;
  }
  
  // Fallback: format the filename
  return pdfSource
    .replace(/\.pdf$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}
