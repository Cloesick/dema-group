/**
 * Multi-language utilities for products
 * Works with the existing LocaleContext
 */

export type Language = 'nl' | 'en' | 'fr';

interface MultiLanguageName {
  nl?: string;
  en?: string;
  fr?: string;
}

interface Product {
  name?: string;
  name_multilang?: MultiLanguageName;
  sku?: string;
  product_category?: string;
  [key: string]: any;
}

/**
 * Get product name in specified language
 * Falls back to: specified lang → Dutch → English → French → SKU
 */
export function getProductName(product: Product, language: Language = 'nl'): string {
  if (!product) return 'Unknown Product';

  // Try multi-language name first
  if (product.name_multilang) {
    // Try requested language
    if (product.name_multilang[language]) {
      return product.name_multilang[language];
    }
    
    // Fallback order: nl → en → fr → any available
    if (product.name_multilang.nl) return product.name_multilang.nl;
    if (product.name_multilang.en) return product.name_multilang.en;
    if (product.name_multilang.fr) return product.name_multilang.fr;
  }

  // Fallback to regular name
  if (product.name) return product.name;

  // Last resort: SKU
  return product.sku || 'Unknown Product';
}

/**
 * Get category name in specified language
 */
export function getCategoryName(category: string, language: Language = 'nl'): string {
  const categoryTranslations: Record<string, MultiLanguageName> = {
    'Elektrisch Gereedschap Makita': {
      nl: 'Elektrisch Gereedschap Makita',
      en: 'Makita Power Tools',
      fr: 'Outils Électriques Makita',
    },
    'Slangkoppelingen': {
      nl: 'Slangkoppelingen',
      en: 'Hose Couplings',
      fr: 'Raccords de Tuyaux',
    },
    'Compressoren & Accessoires': {
      nl: 'Compressoren & Accessoires',
      en: 'Compressors & Accessories',
      fr: 'Compresseurs et Accessoires',
    },
    'RVS Fittingen': {
      nl: 'RVS Fittingen',
      en: 'Stainless Steel Fittings',
      fr: 'Raccords en Acier Inoxydable',
    },
    'Pomp Toebehoren': {
      nl: 'Pomp Toebehoren',
      en: 'Pump Accessories',
      fr: 'Accessoires de Pompe',
    },
    'Drukbuizen': {
      nl: 'Drukbuizen',
      en: 'Pressure Pipes',
      fr: 'Tuyaux de Pression',
    },
    'PE Buizen & Hulpstukken': {
      nl: 'PE Buizen & Hulpstukken',
      en: 'PE Pipes & Fittings',
      fr: 'Tuyaux PE et Raccords',
    },
    'Aandrijftechniek': {
      nl: 'Aandrijftechniek',
      en: 'Drive Technology',
      fr: 'Technologie d\'Entraînement',
    },
    'Bronpompen': {
      nl: 'Bronpompen',
      en: 'Well Pumps',
      fr: 'Pompes de Puits',
    },
    'Verzinkte Buizen': {
      nl: 'Verzinkte Buizen',
      en: 'Galvanized Pipes',
      fr: 'Tuyaux Galvanisés',
    },
    'Kunststof Afvoerleidingen': {
      nl: 'Kunststof Afvoerleidingen',
      en: 'Plastic Drainage Pipes',
      fr: 'Tuyaux de Drainage en Plastique',
    },
  };

  const translations = categoryTranslations[category];
  if (translations) {
    return translations[language] || translations.nl || category;
  }

  return category;
}

/**
 * Get property/attribute name in specified language
 */
export function getPropertyName(property: string, language: Language = 'nl'): string {
  const propertyTranslations: Record<string, MultiLanguageName> = {
    // Common properties
    'diameter': { nl: 'Diameter', en: 'Diameter', fr: 'Diamètre' },
    'lengte': { nl: 'Lengte', en: 'Length', fr: 'Longueur' },
    'druk': { nl: 'Druk', en: 'Pressure', fr: 'Pression' },
    'materiaal': { nl: 'Materiaal', en: 'Material', fr: 'Matériau' },
    'spanning': { nl: 'Spanning', en: 'Voltage', fr: 'Tension' },
    'vermogen': { nl: 'Vermogen', en: 'Power', fr: 'Puissance' },
    'gewicht': { nl: 'Gewicht', en: 'Weight', fr: 'Poids' },
    'capaciteit': { nl: 'Capaciteit', en: 'Capacity', fr: 'Capacité' },
    'afmetingen': { nl: 'Afmetingen', en: 'Dimensions', fr: 'Dimensions' },
    'kleur': { nl: 'Kleur', en: 'Color', fr: 'Couleur' },
    'merk': { nl: 'Merk', en: 'Brand', fr: 'Marque' },
    'model': { nl: 'Model', en: 'Model', fr: 'Modèle' },
    'type': { nl: 'Type', en: 'Type', fr: 'Type' },
  };

  const translations = propertyTranslations[property.toLowerCase()];
  if (translations) {
    return translations[language] || translations.nl || property;
  }

  return property;
}

/**
 * Common UI translations
 */
export const UI_TRANSLATIONS = {
  'add_to_cart': {
    nl: 'In Winkelwagen',
    en: 'Add to Cart',
    fr: 'Ajouter au Panier',
  },
  'view_details': {
    nl: 'Details Bekijken',
    en: 'View Details',
    fr: 'Voir les Détails',
  },
  'price': {
    nl: 'Prijs',
    en: 'Price',
    fr: 'Prix',
  },
  'in_stock': {
    nl: 'Op Voorraad',
    en: 'In Stock',
    fr: 'En Stock',
  },
  'out_of_stock': {
    nl: 'Niet Op Voorraad',
    en: 'Out of Stock',
    fr: 'Rupture de Stock',
  },
  'search': {
    nl: 'Zoeken',
    en: 'Search',
    fr: 'Rechercher',
  },
  'categories': {
    nl: 'Categorieën',
    en: 'Categories',
    fr: 'Catégories',
  },
  'products': {
    nl: 'Producten',
    en: 'Products',
    fr: 'Produits',
  },
  'specifications': {
    nl: 'Specificaties',
    en: 'Specifications',
    fr: 'Spécifications',
  },
  'description': {
    nl: 'Beschrijving',
    en: 'Description',
    fr: 'Description',
  },
};

/**
 * Get UI translation
 */
export function getUIText(key: keyof typeof UI_TRANSLATIONS, language: Language = 'nl'): string {
  const translations = UI_TRANSLATIONS[key];
  if (translations) {
    return translations[language] || translations.nl || key;
  }
  return key;
}
