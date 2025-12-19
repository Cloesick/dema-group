import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the VariantsTable component logic for testing
// Since VariantsTable is an internal component, we test its logic directly

const EXCLUDED_KEYS = ['page_in_pdf', 'pdf_source', 'source_pages', 'sku', 'label'];

const COLUMN_PRIORITY = [
  'diameter', 'diameter_mm', 'diameter_display', 'maat', 'size',
  'length', 'length_m', 'length_display', 'lengte',
  'pressure', 'pressure_bar', 'pressure_display', 'druk',
  'wall_thickness', 'wall_thickness_mm', 'wall_thickness_display', 'wanddikte',
  'material', 'materiaal',
  'connection', 'aansluiting',
  'weight', 'gewicht', 'weight_kg',
  'power', 'vermogen', 'wattage',
  'voltage', 'spanning',
  'flow', 'debiet', 'capacity',
  'type', 'model', 'serie',
];

function formatColumnHeader(key: string): string {
  return key
    .replace(/_display$/, '')
    .replace(/_mm$/, ' (mm)')
    .replace(/_m$/, ' (m)')
    .replace(/_bar$/, ' (bar)')
    .replace(/_kg$/, ' (kg)')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function extractDisplayKeys(variants: any[]): string[] {
  const allKeys = new Set<string>();
  variants.forEach(variant => {
    const props = { ...(variant.attributes || {}), ...(variant.properties || {}) };
    Object.keys(props).forEach(key => {
      if (!EXCLUDED_KEYS.includes(key) && props[key] !== null && props[key] !== undefined && props[key] !== '') {
        allKeys.add(key);
      }
    });
  });

  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    const aIndex = COLUMN_PRIORITY.findIndex(p => a.toLowerCase().includes(p));
    const bIndex = COLUMN_PRIORITY.findIndex(p => b.toLowerCase().includes(p));
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  return sortedKeys.slice(0, 6);
}

describe('VariantsTable Logic', () => {
  describe('formatColumnHeader', () => {
    it('should format diameter_mm correctly', () => {
      expect(formatColumnHeader('diameter_mm')).toBe('Diameter (mm)');
    });

    it('should format length_m correctly', () => {
      expect(formatColumnHeader('length_m')).toBe('Length (m)');
    });

    it('should format pressure_bar correctly', () => {
      expect(formatColumnHeader('pressure_bar')).toBe('Pressure (bar)');
    });

    it('should format weight_kg correctly', () => {
      expect(formatColumnHeader('weight_kg')).toBe('Weight (kg)');
    });

    it('should remove _display suffix', () => {
      expect(formatColumnHeader('diameter_display')).toBe('Diameter');
    });

    it('should replace underscores with spaces', () => {
      expect(formatColumnHeader('wall_thickness')).toBe('Wall Thickness');
    });

    it('should capitalize each word', () => {
      expect(formatColumnHeader('material')).toBe('Material');
    });
  });

  describe('extractDisplayKeys', () => {
    it('should extract unique keys from variants', () => {
      const variants = [
        { sku: 'SKU1', properties: { diameter_mm: 25, length_m: 1.5 } },
        { sku: 'SKU2', properties: { diameter_mm: 32, length_m: 2.0 } },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys).toContain('diameter_mm');
      expect(keys).toContain('length_m');
    });

    it('should exclude page_in_pdf and other metadata keys', () => {
      const variants = [
        { sku: 'SKU1', properties: { diameter_mm: 25, page_in_pdf: 5, pdf_source: 'test.pdf' } },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys).not.toContain('page_in_pdf');
      expect(keys).not.toContain('pdf_source');
      expect(keys).not.toContain('sku');
    });

    it('should prioritize diameter over other properties', () => {
      const variants = [
        { sku: 'SKU1', properties: { zebra: 'test', diameter_mm: 25, apple: 'fruit' } },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys[0]).toBe('diameter_mm');
    });

    it('should limit to 6 columns', () => {
      const variants = [
        { 
          sku: 'SKU1', 
          properties: { 
            diameter_mm: 25, 
            length_m: 1.5, 
            pressure_bar: 10,
            material: 'PE',
            weight_kg: 2.5,
            color: 'black',
            brand: 'DEMA',
            series: 'Pro',
          } 
        },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys.length).toBeLessThanOrEqual(6);
    });

    it('should handle empty variants', () => {
      const keys = extractDisplayKeys([]);
      expect(keys).toEqual([]);
    });

    it('should handle variants with no properties', () => {
      const variants = [
        { sku: 'SKU1', properties: {} },
        { sku: 'SKU2', attributes: {} },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys).toEqual([]);
    });

    it('should merge attributes and properties', () => {
      const variants = [
        { 
          sku: 'SKU1', 
          attributes: { diameter_mm: 25 },
          properties: { length_m: 1.5 }
        },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys).toContain('diameter_mm');
      expect(keys).toContain('length_m');
    });

    it('should skip null and undefined values', () => {
      const variants = [
        { 
          sku: 'SKU1', 
          properties: { 
            diameter_mm: 25, 
            length_m: null, 
            pressure_bar: undefined,
            material: ''
          } 
        },
      ];
      
      const keys = extractDisplayKeys(variants);
      expect(keys).toContain('diameter_mm');
      expect(keys).not.toContain('length_m');
      expect(keys).not.toContain('pressure_bar');
      expect(keys).not.toContain('material');
    });
  });

  describe('COLUMN_PRIORITY ordering', () => {
    it('should order diameter before length', () => {
      const diameterIdx = COLUMN_PRIORITY.indexOf('diameter');
      const lengthIdx = COLUMN_PRIORITY.indexOf('length');
      expect(diameterIdx).toBeLessThan(lengthIdx);
    });

    it('should order length before pressure', () => {
      const lengthIdx = COLUMN_PRIORITY.indexOf('length');
      const pressureIdx = COLUMN_PRIORITY.indexOf('pressure');
      expect(lengthIdx).toBeLessThan(pressureIdx);
    });

    it('should include Dutch translations', () => {
      expect(COLUMN_PRIORITY).toContain('maat');
      expect(COLUMN_PRIORITY).toContain('lengte');
      expect(COLUMN_PRIORITY).toContain('druk');
      expect(COLUMN_PRIORITY).toContain('materiaal');
      expect(COLUMN_PRIORITY).toContain('gewicht');
    });
  });
});
