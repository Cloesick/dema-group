/**
 * Product Groups Configuration
 *
 * Industry-standard product categorization based on:
 * - Kramp (agricultural/industrial parts)
 * - TVH/Bepco (forklift/material handling)
 * - Eriks (industrial components)
 * - Sodeco Valves (fluid control)
 *
 * Supports: EN, NL, FR translations
 */

// =============================================================================
// INTERFACES
// =============================================================================

export interface PropertyDefinition {
  key: string;
  labels: {
    en: string;
    nl: string;
    fr: string;
  };
  unit?: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  filterable?: boolean;
  primaryDisplay?: boolean;
  sortOrder?: number;
  xmlElement?: string;
  options?: Array<{
    value: string;
    labels: {
      en: string;
      nl: string;
      fr: string;
    };
  }>;
}

export interface SpecificationGroup {
  key: string;
  labels: {
    en: string;
    nl: string;
    fr: string;
  };
  properties: string[];
  sortOrder: number;
}

export interface ProductGroup {
  id: string;
  labels: {
    en: string;
    nl: string;
    fr: string;
  };
  descriptions?: {
    en: string;
    nl: string;
    fr: string;
  };
  icon: string;
  properties: PropertyDefinition[];
  specificationGroups: SpecificationGroup[];
}

// =============================================================================
// COMMON PROPERTIES (shared across multiple product groups)
// =============================================================================

export const commonProperties: PropertyDefinition[] = [
  {
    key: 'manufacturer',
    labels: {
      en: 'Manufacturer',
      nl: 'Fabrikant',
      fr: 'Fabricant'
    },
    type: 'text',
    filterable: true,
    primaryDisplay: true,
    sortOrder: 1,
    xmlElement: 'manufacturer'
  },
  {
    key: 'partNumber',
    labels: {
      en: 'Part Number',
      nl: 'Artikelnummer',
      fr: 'Numéro de pièce'
    },
    type: 'text',
    filterable: true,
    primaryDisplay: true,
    sortOrder: 2,
    xmlElement: 'partNumber'
  },
  {
    key: 'material',
    labels: {
      en: 'Material',
      nl: 'Materiaal',
      fr: 'Matériau'
    },
    type: 'select',
    filterable: true,
    primaryDisplay: false,
    sortOrder: 10,
    xmlElement: 'material',
    options: [
      {
        value: 'steel',
        labels: {
          en: 'Steel',
          nl: 'Staal',
          fr: 'Acier'
        }
      },
      {
        value: 'stainless-steel',
        labels: {
          en: 'Stainless Steel',
          nl: 'Roestvrij Staal',
          fr: 'Acier Inoxydable'
        }
      },
      {
        value: 'brass',
        labels: {
          en: 'Brass',
          nl: 'Messing',
          fr: 'Laiton'
        }
      },
      {
        value: 'bronze',
        labels: {
          en: 'Bronze',
          nl: 'Brons',
          fr: 'Bronze'
        }
      },
      {
        value: 'aluminum',
        labels: {
          en: 'Aluminum',
          nl: 'Aluminium',
          fr: 'Aluminium'
        }
      },
      {
        value: 'cast-iron',
        labels: {
          en: 'Cast Iron',
          nl: 'Gietijzer',
          fr: 'Fonte'
        }
      },
      {
        value: 'plastic',
        labels: {
          en: 'Plastic',
          nl: 'Kunststof',
          fr: 'Plastique'
        }
      },
      {
        value: 'rubber',
        labels: {
          en: 'Rubber',
          nl: 'Rubber',
          fr: 'Caoutchouc'
        }
      }
    ]
  },
  {
    key: 'weight',
    labels: {
      en: 'Weight',
      nl: 'Gewicht',
      fr: 'Poids'
    },
    unit: 'kg',
    type: 'number',
    filterable: false,
    primaryDisplay: false,
    sortOrder: 50,
    xmlElement: 'weight'
  }
]

// =============================================================================
// PRODUCT GROUPS
// =============================================================================

export const productGroups: ProductGroup[] = [
  {
    id: 'hydraulic-cylinders',
    labels: {
      en: 'Hydraulic Cylinders',
      nl: 'Hydraulische Cilinders',
      fr: 'Vérins Hydrauliques'
    },
    descriptions: {
      en: 'Single and double acting hydraulic cylinders for industrial applications',
      nl: 'Enkel- en dubbelwerkende hydraulische cilinders voor industriële toepassingen',
      fr: 'Vérins hydrauliques simple et double effet pour applications industrielles'
    },
    icon: 'cylinder',
    properties: [
      // Common Properties
      ...commonProperties,
      // Technical Specifications
      {
        key: 'identification',
        labels: {
          en: 'Identification',
          nl: 'Identificatie',
          fr: 'Identification'
        },
        type: 'text',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 1,
        xmlElement: 'manufacturer'
      },
      {
        key: 'partNumber',
        labels: {
          en: 'Part Number',
          nl: 'Artikelnummer',
          fr: 'Numéro de pièce'
        },
        type: 'text',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 2,
        xmlElement: 'partNumber'
      },
      // Technical Specifications
      {
        key: 'boreDiameter',
        labels: {
          en: 'Bore Diameter',
          nl: 'Boring Diameter',
          fr: 'Diamètre d\'alésage'
        },
        unit: 'mm',
        type: 'number',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 10,
        xmlElement: 'boreDiameter'
      },
      {
        key: 'rodDiameter',
        labels: {
          en: 'Rod Diameter',
          nl: 'Stang Diameter',
          fr: 'Diamètre de tige'
        },
        unit: 'mm',
        type: 'number',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 11,
        xmlElement: 'rodDiameter'
      },
      {
        key: 'stroke',
        labels: {
          en: 'Stroke',
          nl: 'Slag',
          fr: 'Course'
        },
        unit: 'mm',
        type: 'number',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 12,
        xmlElement: 'stroke'
      },
      {
        key: 'maxPressure',
        labels: {
          en: 'Max Working Pressure',
          nl: 'Max Werkdruk',
          fr: 'Pression de travail max'
        },
        unit: 'bar',
        type: 'number',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 13,
        xmlElement: 'maxPressure'
      },
      {
        key: 'cylinderType',
        labels: {
          en: 'Cylinder Type',
          nl: 'Cilinder Type',
          fr: 'Type de vérin'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 14,
        xmlElement: 'cylinderType',
        options: [
          {
            value: 'single-acting',
            labels: {
              en: 'Single Acting',
              nl: 'Enkelwerkend',
              fr: 'Simple effet'
            }
          },
          {
            value: 'double-acting',
            labels: {
              en: 'Double Acting',
              nl: 'Dubbelwerkend',
              fr: 'Double effet'
            }
          },
          {
            value: 'telescopic',
            labels: {
              en: 'Telescopic',
              nl: 'Telescopisch',
              fr: 'Télescopique'
            }
          },
          {
            value: 'plunger',
            labels: {
              en: 'Plunger',
              nl: 'Plunjer',
              fr: 'Plongeur'
            }
          }
        ]
      },
      {
        key: 'mountingStyle',
        labels: {
          en: 'Mounting Style',
          nl: 'Bevestigingsstijl',
          fr: 'Style de montage'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 15,
        xmlElement: 'mountingStyle',
        options: [
          {
            value: 'clevis',
            labels: {
              en: 'Clevis',
              nl: 'Gaffel',
              fr: 'Chape'
            }
          },
          {
            value: 'flange',
            labels: {
              en: 'Flange',
              nl: 'Flens',
              fr: 'Bride'
            }
          },
          {
            value: 'trunnion',
            labels: {
              en: 'Trunnion',
              nl: 'Tap',
              fr: 'Tourillon'
            }
          },
          {
            value: 'foot',
            labels: {
              en: 'Foot',
              nl: 'Voet',
              fr: 'Pied'
            }
          },
          {
            value: 'side-lug',
            labels: {
              en: 'Side Lug',
              nl: 'Zijbevestiging',
              fr: 'Fixation latérale'
            }
          },
          {
            value: 'center-trunnion',
            labels: {
              en: 'Center Trunnion',
              nl: 'Centrale Tap',
              fr: 'Tourillon central'
            }
          }
        ]
      },
      {
        key: 'portSize',
        labels: {
          en: 'Port Size',
          nl: 'Poort Maat',
          fr: 'Taille du port'
        },
        type: 'text',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 16,
        xmlElement: 'portSize'
      },
      {
        key: 'portThread',
        labels: {
          en: 'Port Thread',
          nl: 'Poort Schroefdraad',
          fr: 'Filetage du port'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 17,
        xmlElement: 'portThread',
        options: [
          {
            value: 'bsp',
            labels: {
              en: 'BSP',
              nl: 'BSP',
              fr: 'BSP'
            }
          },
          {
            value: 'npt',
            labels: {
              en: 'NPT',
              nl: 'NPT',
              fr: 'NPT'
            }
          },
          {
            value: 'metric',
            labels: {
              en: 'Metric',
              nl: 'Metrisch',
              fr: 'Métrique'
            }
          },
          {
            value: 'sae',
            labels: {
              en: 'SAE',
              nl: 'SAE',
              fr: 'SAE'
            }
          },
          {
            value: 'jic',
            labels: {
              en: 'JIC',
              nl: 'JIC',
              fr: 'JIC'
            }
          }
        ]
      },
      // Materials
      {
        key: 'tubeMaterial',
        labels: {
          en: 'Tube Material',
          nl: 'Buis Materiaal',
          fr: 'Matériau du tube'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 20,
        xmlElement: 'tubeMaterial',
        options: [
          {
            value: 'steel',
            labels: {
              en: 'Steel',
              nl: 'Staal',
              fr: 'Acier'
            }
          },
          {
            value: 'stainless-steel',
            labels: {
              en: 'Stainless Steel',
              nl: 'Roestvrij Staal',
              fr: 'Acier Inoxydable'
            }
          },
          {
            value: 'aluminum',
            labels: {
              en: 'Aluminum',
              nl: 'Aluminium',
              fr: 'Aluminium'
            }
          }
        ]
      },
      {
        key: 'rodMaterial',
        labels: {
          en: 'Rod Material',
          nl: 'Stang Materiaal',
          fr: 'Matériau de tige'
        },
        type: 'select',
        filterable: false,
        primaryDisplay: false,
        sortOrder: 21,
        xmlElement: 'rodMaterial',
        options: [
          {
            value: 'chrome-plated-steel',
            labels: {
              en: 'Chrome Plated Steel',
              nl: 'Verchroomd Staal',
              fr: 'Acier Chromé'
            }
          },
          {
            value: 'stainless-steel',
            labels: {
              en: 'Stainless Steel',
              nl: 'Roestvrij Staal',
              fr: 'Acier Inoxydable'
            }
          },
          {
            value: 'induction-hardened',
            labels: {
              en: 'Induction Hardened',
              nl: 'Inductie Gehard',
              fr: 'Trempé par Induction'
            }
          }
        ]
      },
      {
        key: 'sealMaterial',
        labels: {
          en: 'Seal Material',
          nl: 'Afdichting Materiaal',
          fr: 'Matériau du joint'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 22,
        xmlElement: 'sealMaterial',
        options: [
          {
            value: 'nbr',
            labels: {
              en: 'NBR',
              nl: 'NBR',
              fr: 'NBR'
            }
          },
          {
            value: 'viton',
            labels: {
              en: 'Viton',
              nl: 'Viton',
              fr: 'Viton'
            }
          },
          {
            value: 'ptfe',
            labels: {
              en: 'PTFE',
              nl: 'PTFE',
              fr: 'PTFE'
            }
          },
          {
            value: 'polyurethane',
            labels: {
              en: 'Polyurethane',
              nl: 'Polyurethaan',
              fr: 'Polyuréthane'
            }
          }
        ]
      },
      // Operating Conditions
      {
        key: 'tempRangeMin',
        labels: {
          en: 'Min Temperature',
          nl: 'Min Temperatuur',
          fr: 'Température min'
        },
        unit: '°C',
        type: 'number',
        filterable: false,
        primaryDisplay: false,
        sortOrder: 30,
        xmlElement: 'tempRangeMin'
      },
      {
        key: 'tempRangeMax',
        labels: {
          en: 'Max Temperature',
          nl: 'Max Temperatuur',
          fr: 'Température max'
        },
        unit: '°C',
        type: 'number',
        filterable: false,
        primaryDisplay: false,
        sortOrder: 31,
        xmlElement: 'tempRangeMax'
      },
      // Physical
      {
        key: 'closedLength',
        labels: {
          en: 'Closed Length',
          nl: 'Gesloten Lengte',
          fr: 'Longueur fermée'
        },
        unit: 'mm',
        type: 'number',
        filterable: false,
        primaryDisplay: false,
        sortOrder: 40,
        xmlElement: 'closedLength'
      },
      {
        key: 'weight',
        labels: {
          en: 'Weight',
          nl: 'Gewicht',
          fr: 'Poids'
        },
        unit: 'kg',
        type: 'number',
        filterable: false,
        primaryDisplay: false,
        sortOrder: 50,
        xmlElement: 'weight'
      }
    ],
    specificationGroups: [
      {
        key: 'identification',
        labels: {
          en: 'Identification',
          nl: 'Identificatie',
          fr: 'Identification'
        },
        properties: ['manufacturer', 'partNumber'],
        sortOrder: 1
      },
      {
        key: 'dimensions',
        labels: {
          en: 'Dimensions',
          nl: 'Afmetingen',
          fr: 'Dimensions'
        },
        properties: ['boreDiameter', 'rodDiameter', 'stroke', 'closedLength'],
        sortOrder: 2
      },
      {
        key: 'performance',
        labels: {
          en: 'Performance',
          nl: 'Prestaties',
          fr: 'Performance'
        },
        properties: ['maxPressure', 'cylinderType'],
        sortOrder: 3
      },
      {
        key: 'connections',
        labels: {
          en: 'Connections',
          nl: 'Aansluitingen',
          fr: 'Connexions'
        },
        properties: ['mountingStyle', 'portSize', 'portThread'],
        sortOrder: 4
      },
      {
        key: 'materials',
        labels: {
          en: 'Materials',
          nl: 'Materialen',
          fr: 'Matériaux'
        },
        properties: ['tubeMaterial', 'rodMaterial', 'sealMaterial'],
        sortOrder: 5
      },
      {
        key: 'operating-conditions',
        labels: {
          en: 'Operating Conditions',
          nl: 'Bedrijfsomstandigheden',
          fr: 'Conditions de fonctionnement'
        },
        properties: ['tempRangeMin', 'tempRangeMax'],
        sortOrder: 6
      },
      {
        key: 'physical',
        labels: {
          en: 'Physical',
          nl: 'Fysiek',
          fr: 'Physique'
        },
        properties: ['weight'],
        sortOrder: 7
      }
    ]
  }
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getProductGroupById(id: string): ProductGroup | undefined {
  return productGroups.find(group => group.id === id);
}

export function getFilterableProperties(groupId: string): PropertyDefinition[] {
  const group = getProductGroupById(groupId);
  if (!group) return [];
  return group.properties.filter(prop => prop.filterable);
}

export function getPrimaryProperties(groupId: string): PropertyDefinition[] {
  const group = getProductGroupById(groupId);
  if (!group) return [];
  return group.properties
    .filter(prop => prop.primaryDisplay)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
    id: 'pneumatics',
    name: 'Pneumatics',
    name_nl: 'Pneumatica',
    name_fr: 'Pneumatique',
    description: 'Air cylinders, valves, fittings, and accessories for compressed air systems',
    description_nl: 'Luchtcilinders, kleppen, fittingen en accessoires voor persluchtsystemen',
    description_fr: 'Vérins pneumatiques, vannes et accessoires pour systèmes d’air comprimé',
    icon: 'pneumatic',
    properties: [
      { key: 'manufacturer', label: 'Manufacturer', label_nl: 'Fabrikant', label_fr: 'Fabricant', type: 'text', isFilterable: true, isPrimary: true, sortOrder: 1, xmlElement: 'Manufacturer' },
      { key: 'partNumber', label: 'Part Number', label_nl: 'Artikelnummer', label_fr: 'Numéro de pièce', type: 'text', isFilterable: true, isPrimary: true, sortOrder: 2, xmlElement: 'PartNumber' },
      { key: 'pneumaticType', label: 'Type', label_nl: 'Type', label_fr: 'Type', type: 'list', isFilterable: true, isPrimary: true, sortOrder: 10, xmlElement: 'PneumaticType', options: ['Cylinder', 'Valve', 'Filter Regulator', 'Fitting'] },
      { key: 'portSize', label: 'Port Size', label_nl: 'Poortmaat', label_fr: 'Taille du port', type: 'text', isFilterable: true, isPrimary: false, sortOrder: 11, xmlElement: 'PortSize' },
      { key: 'maxPressure', label: 'Max Pressure', label_nl: 'Max Druk', label_fr: 'Pression max', unit: 'bar', type: 'number', isFilterable: true, isPrimary: true, sortOrder: 12, xmlElement: 'MaxPressure' },
      { key: 'flowCapacity', label: 'Flow Capacity', label_nl: 'Debietcapaciteit', label_fr: 'Capacité de débit', unit: 'l/min', type: 'number', isFilterable: true, isPrimary: false, sortOrder: 13, xmlElement: 'FlowCapacity' },
      { key: 'actuation', label: 'Actuation', label_nl: 'Aansturing', label_fr: 'Activation', type: 'list', isFilterable: true, isPrimary: false, sortOrder: 14, xmlElement: 'Actuation', options: ['Manual', 'Electric', 'Air Pilot', 'Solenoid'] }
    ],
    specGroups: [
      { id: 'identification', name: 'Identification', name_nl: 'Identificatie', name_fr: 'Identification', properties: ['manufacturer', 'partNumber'], sortOrder: 1 },
      { id: 'performance', name: 'Performance', name_nl: 'Prestaties', name_fr: 'Performance', properties: ['pneumaticType', 'maxPressure', 'flowCapacity'], sortOrder: 2 },
      { id: 'connections', name: 'Connections', name_nl: 'Aansluitingen', name_fr: 'Connexions', properties: ['portSize', 'actuation'], sortOrder: 3 }
    ]
  },
  {
    id: 'fasteners',
    name: 'Fasteners & Hardware',
    name_nl: 'Bevestigingsmiddelen & Hardware',
    name_fr: 'Fixations & Matériel',
    description: 'Bolts, nuts, washers, rivets and installation hardware for industrial assembly',
    description_nl: 'Bouten, moeren, ringen, klinknagels en installatiemateriaal',
    description_fr: 'Boulons, écrous, rondelles, rivets et quincaillerie',
    icon: 'fastener',
    properties: [
      { key: 'manufacturer', label: 'Manufacturer', label_nl: 'Fabrikant', label_fr: 'Fabricant', type: 'text', isFilterable: true, isPrimary: true, sortOrder: 1, xmlElement: 'Manufacturer' },
      { key: 'partNumber', label: 'Part Number', label_nl: 'Artikelnummer', label_fr: 'Numéro de pièce', type: 'text', isFilterable: true, isPrimary: true, sortOrder: 2, xmlElement: 'PartNumber' },
      { key: 'fastenerType', label: 'Fastener Type', label_nl: 'Fastener Type', label_fr: 'Type de fixation', type: 'list', isFilterable: true, isPrimary: true, sortOrder: 10, xmlElement: 'FastenerType', options: ['Bolt', 'Nut', 'Washer', 'Rivet', 'Pin'] },
      { key: 'material', label: 'Material', label_nl: 'Materiaal', label_fr: 'Matériau', type: 'list', isFilterable: false, isPrimary: false, sortOrder: 12, xmlElement: 'Material', options: ['Steel', 'Stainless Steel', 'Brass', 'Aluminum'] },
      { key: 'size', label: 'Size', label_nl: 'Afmeting', label_fr: 'Taille', type: 'text', isFilterable: true, isPrimary: true, sortOrder: 13, xmlElement: 'Size' },
      { key: 'thread', label: 'Thread', label_nl: 'Schroefdraad', label_fr: 'Filetage', type: 'text', isFilterable: true, isPrimary: false, sortOrder: 14, xmlElement: 'Thread' },
      { key: 'finish', label: 'Finish', label_nl: 'Afwerking', label_fr: 'Finition', type: 'list', isFilterable: true, isPrimary: false, sortOrder: 20, xmlElement: 'Finish', options: ['Zinc Plated', 'Black Oxide', 'Galvanized', 'Passivated'] }
    ],
    specGroups: [
      { id: 'identification', name: 'Identification', name_nl: 'Identificatie', name_fr: 'Identification', properties: ['manufacturer', 'partNumber'], sortOrder: 1 },
      { id: 'performance', name: 'Performance', name_nl: 'Prestaties', name_fr: 'Performance', properties: ['fastenerType', 'size', 'thread'], sortOrder: 2 },
      { id: 'materials', name: 'Materials', name_nl: 'Materialen', name_fr: 'Matériaux', properties: ['material', 'finish'], sortOrder: 3 }
    ]
  }
]      {
        key: 'partNumber',
        label: 'Part Number',
        label_nl: 'Artikelnummer',
        label_fr: 'Numéro de pièce',
        type: 'text',
        isFilterable: true,
        isPrimary: true,
        sortOrder: 2,
        xmlElement: 'PartNumber'
      },
      // Technical Specifications
      {
        key: 'boreDiameter',
        label: 'Bore Diameter',
        label_nl: 'Boring Diameter',
        label_fr: 'Diamètre d\'alésage',
        unit: 'mm',
        type: 'number',
        isFilterable: true,
        isPrimary: true,
        sortOrder: 10,
        xmlElement: 'BoreDiameter'
      },
      {
        key: 'rodDiameter',
        label: 'Rod Diameter',
        label_nl: 'Stang Diameter',
        label_fr: 'Diamètre de tige',
        unit: 'mm',
        type: 'number',
        isFilterable: true,
        isPrimary: true,
        sortOrder: 11,
        xmlElement: 'RodDiameter'
      },
      {
        key: 'stroke',
        label: 'Stroke',
        label_nl: 'Slag',
        label_fr: 'Course',
        unit: 'mm',
        type: 'number',
        isFilterable: true,
        isPrimary: true,
        sortOrder: 12,
        xmlElement: 'Stroke'
      },
      {
        key: 'maxPressure',
        label: 'Max Working Pressure',
        label_nl: 'Max Werkdruk',
        label_fr: 'Pression de travail max',
        unit: 'bar',
        type: 'number',
        isFilterable: true,
        isPrimary: true,
        sortOrder: 13,
        xmlElement: 'MaxPressure'
      },
      {
        key: 'cylinderType',
        label: 'Cylinder Type',
        label_nl: 'Cilinder Type',
        label_fr: 'Type de vérin',
        type: 'list',
        isFilterable: true,
        isPrimary: true,
        sortOrder: 14,
        xmlElement: 'CylinderType',
        options: ['Single Acting', 'Double Acting', 'Telescopic', 'Plunger']
      },
      {
        key: 'mountingStyle',
        label: 'Mounting Style',
        label_nl: 'Bevestigingsstijl',
        label_fr: 'Style de montage',
        type: 'list',
        isFilterable: true,
        isPrimary: false,
        sortOrder: 15,
        xmlElement: 'MountingStyle',
        options: ['Clevis', 'Flange', 'Trunnion', 'Foot', 'Side Lug', 'Center Trunnion']
      },
      {
        key: 'portSize',
        label: 'Port Size',
        label_nl: 'Poort Maat',
        label_fr: 'Taille du port',
        type: 'text',
        isFilterable: true,
        isPrimary: false,
        sortOrder: 16,
        xmlElement: 'PortSize'
      },
      {
        key: 'portThread',
        label: 'Port Thread',
        label_nl: 'Poort Schroefdraad',
        label_fr: 'Filetage du port',
        type: 'list',
        isFilterable: true,
        isPrimary: false,
        sortOrder: 17,
        xmlElement: 'PortThread',
        options: ['BSP', 'NPT', 'Metric', 'SAE', 'JIC']
      },
      // Materials
      {
        key: 'tubeMaterial',
        label: 'Tube Material',
        label_nl: 'Buis Materiaal',
        label_fr: 'Matériau du tube',
        type: 'list',
        isFilterable: true,
        isPrimary: false,
        sortOrder: 20,
        xmlElement: 'TubeMaterial',
        options: ['Steel', 'Stainless Steel', 'Aluminum']
      },
      {
        key: 'rodMaterial',
        label: 'Rod Material',
        label_nl: 'Stang Materiaal',
        label_fr: 'Matériau de tige',
        type: 'list',
        isFilterable: false,
        isPrimary: false,
        sortOrder: 21,
        xmlElement: 'RodMaterial',
        options: ['Chrome Plated Steel', 'Stainless Steel', 'Induction Hardened']
      },
      {
        key: 'sealMaterial',
        label: 'Seal Material',
        label_nl: 'Afdichting Materiaal',
        label_fr: 'Matériau du joint',
        type: 'list',
        isFilterable: true,
        isPrimary: false,
        sortOrder: 22,
        xmlElement: 'SealMaterial',
        options: ['NBR', 'Viton', 'PTFE', 'Polyurethane']
      },
      // Operating Conditions
      {
        key: 'tempRangeMin',
        label: 'Min Temperature',
        label_nl: 'Min Temperatuur',
        label_fr: 'Température min',
        unit: '°C',
        type: 'number',
        isFilterable: false,
        isPrimary: false,
        sortOrder: 30,
        xmlElement: 'TempRangeMin'
      },
      {
        key: 'tempRangeMax',
        label: 'Max Temperature',
        label_nl: 'Max Temperatuur',
        label_fr: 'Température max',
        unit: '°C',
        type: 'number',
        isFilterable: false,
        isPrimary: false,
        sortOrder: 31,
        xmlElement: 'TempRangeMax'
      },
      // Physical
      {
        key: 'closedLength',
        label: 'Closed Length',
        label_nl: 'Gesloten Lengte',
        label_fr: 'Longueur fermée',
        unit: 'mm',
        type: 'number',
        isFilterable: false,
        isPrimary: false,
        sortOrder: 40,
        xmlElement: 'ClosedLength'
      },
      {
        key: 'weight',
        label: 'Weight',
        label_nl: 'Gewicht',
        label_fr: 'Poids',
        unit: 'kg',
        type: 'number',
        isFilterable: false,
        isPrimary: false,
        sortOrder: 50,
        xmlElement: 'Weight'
      }
    ],
    specGroups: [
      {
        id: 'identification',
        name: 'Identification',
        name_nl: 'Identificatie',
        name_fr: 'Identification',
        properties: ['manufacturer', 'partNumber'],
        sortOrder: 1
      },
      {
        id: 'dimensions',
        name: 'Dimensions',
        name_nl: 'Afmetingen',
        name_fr: 'Dimensions',
        properties: ['boreDiameter', 'rodDiameter', 'stroke', 'closedLength'],
        sortOrder: 2
      },
      {
        id: 'performance',
        name: 'Performance',
        name_nl: 'Prestaties',
        name_fr: 'Performance',
        properties: ['maxPressure', 'cylinderType'],
        sortOrder: 3
      },
      {
        id: 'connections',
        name: 'Connections',
        name_nl: 'Aansluitingen',
        name_fr: 'Connexions',
        properties: ['mountingStyle', 'portSize', 'portThread'],
        sortOrder: 4
      },
      {
        id: 'materials',
        name: 'Materials',
        name_nl: 'Materialen',
        name_fr: 'Matériaux',
        properties: ['tubeMaterial', 'rodMaterial', 'sealMaterial'],
        sortOrder: 5
      },
      {
        id: 'operating-conditions',
        name: 'Operating Conditions',
        name_nl: 'Bedrijfsomstandigheden',
        name_fr: 'Conditions de fonctionnement',
        properties: ['tempRangeMin', 'tempRangeMax'],
        sortOrder: 6
      },
      {
        id: 'physical',
        name: 'Physical',
        name_nl: 'Fysiek',
        name_fr: 'Physique',
        properties: ['weight'],
        sortOrder: 7
      }
    ]
  }

  // =========================================================================
  // ADD MORE PRODUCT GROUPS BELOW FOLLOWING THE SAME PATTERN
  // Categories to add:
  // - hydraulic-pumps
  // - hydraulic-valves
  // - hydraulic-hoses
  // - bearings
  // - seals
  // - filters
  // - transmission
  // - pneumatics
  // - fasteners
  // =========================================================================
]
