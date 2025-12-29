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
// UTILITY FUNCTIONS
// =============================================================================

export function getProductGroup(id: string): ProductGroup | undefined {
  return productGroups.find(group => group.id === id)
}

export function getPrimaryProperties(groupId: string): PropertyDefinition[] {
  const group = getProductGroup(groupId)
  if (!group) return []
  return group.properties
    .filter(prop => prop.primaryDisplay)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function getFilterableProperties(groupId: string): PropertyDefinition[] {
  const group = getProductGroup(groupId)
  if (!group) return []
  return group.properties.filter(prop => prop.filterable)
}

export function getGroupedSpecifications(
  product: Record<string, unknown>,
  groupId: string,
  language: 'en' | 'nl' | 'fr' = 'en'
) {
  const group = getProductGroup(groupId)
  if (!group) return []

  return group.specificationGroups
    .map(specGroup => ({
      group: {
        id: specGroup.key,
        name: specGroup.labels[language]
      },
      specs: specGroup.properties
        .map(propKey => {
          const prop = group.properties.find(p => p.key === propKey)
          if (!prop) return null
          const value = product[propKey]
          if (value === undefined || value === null || value === '') return null
          return {
            label: prop.labels[language],
            value: String(value),
            unit: prop.unit
          }
        })
        .filter((spec): spec is NonNullable<typeof spec> => spec !== null)
    }))
    .filter(group => group.specs.length > 0)
}
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
    xmlElement: 'Manufacturer'
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
    xmlElement: 'PartNumber'
  },
  {
    key: 'fastenerType',
    labels: {
      en: 'Fastener Type',
      nl: 'Type Bevestigingsmiddel',
      fr: 'Type de fixation'
    },
    type: 'select',
    filterable: true,
    primaryDisplay: true,
    sortOrder: 10,
    xmlElement: 'FastenerType',
    options: [
      {
        value: 'bolt',
        labels: {
          en: 'Bolt',
          nl: 'Bout',
          fr: 'Boulon'
        }
      },
      {
        value: 'nut',
        labels: {
          en: 'Nut',
          nl: 'Moer',
          fr: 'Écrou'
        }
      },
      {
        value: 'washer',
        labels: {
          en: 'Washer',
          nl: 'Ring',
          fr: 'Rondelle'
        }
      },
      {
        value: 'rivet',
        labels: {
          en: 'Rivet',
          nl: 'Klinknagel',
          fr: 'Rivet'
        }
      },
      {
        value: 'pin',
        labels: {
          en: 'Pin',
          nl: 'Pin',
          fr: 'Goupille'
        }
      }
    ]
  },
  {
    key: 'material',
    labels: {
      en: 'Material',
      nl: 'Materiaal',
      fr: 'Matériau'
    },
    type: 'select',
    filterable: false,
    primaryDisplay: false,
    sortOrder: 12,
    xmlElement: 'Material',
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
    key: 'size',
    labels: {
      en: 'Size',
      nl: 'Afmeting',
      fr: 'Taille'
    },
    type: 'text',
    filterable: true,
    primaryDisplay: true,
    sortOrder: 13,
    xmlElement: 'Size'
  },
  {
    key: 'thread',
    labels: {
      en: 'Thread',
      nl: 'Schroefdraad',
      fr: 'Filetage'
    },
    type: 'text',
    filterable: true,
    primaryDisplay: false,
    sortOrder: 14,
    xmlElement: 'Thread'
  },
  {
    key: 'finish',
    labels: {
      en: 'Finish',
      nl: 'Afwerking',
      fr: 'Finition'
    },
    type: 'select',
    filterable: true,
    primaryDisplay: false,
    sortOrder: 20,
    xmlElement: 'Finish',
    options: [
      {
        value: 'zinc-plated',
        labels: {
          en: 'Zinc Plated',
          nl: 'Verzinkt',
          fr: 'Zingué'
        }
      },
      {
        value: 'black-oxide',
        labels: {
          en: 'Black Oxide',
          nl: 'Zwart Geoxideerd',
          fr: 'Oxyde Noir'
        }
      },
      {
        value: 'galvanized',
        labels: {
          en: 'Galvanized',
          nl: 'Gegalvaniseerd',
          fr: 'Galvanisé'
        }
      },
      {
        value: 'passivated',
        labels: {
          en: 'Passivated',
          nl: 'Gepassiveerd',
          fr: 'Passivé'
        }
      }
    ]
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
        xmlElement: 'BoreDiameter'
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
        xmlElement: 'RodDiameter'
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
        xmlElement: 'Stroke'
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
        xmlElement: 'MaxPressure'
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
        xmlElement: 'CylinderType',
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
        xmlElement: 'MountingStyle',
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
        xmlElement: 'PortSize'
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
        xmlElement: 'PortThread',
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
        xmlElement: 'TubeMaterial',
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
        xmlElement: 'RodMaterial',
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
        xmlElement: 'SealMaterial',
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
        xmlElement: 'TempRangeMin'
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
        xmlElement: 'TempRangeMax'
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
        xmlElement: 'ClosedLength'
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
        xmlElement: 'Weight'
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
  },
  {
    id: 'pneumatics',
    labels: {
      en: 'Pneumatics',
      nl: 'Pneumatica',
      fr: 'Pneumatique'
    },
    descriptions: {
      en: 'Air cylinders, valves, fittings, and accessories for compressed air systems',
      nl: 'Luchtcilinders, kleppen, fittingen en accessoires voor persluchtsystemen',
      fr: 'Vérins pneumatiques, vannes et accessoires pour systèmes d\'air comprimé'
    },
    icon: 'pneumatic',
    properties: [
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
        xmlElement: 'Manufacturer'
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
        xmlElement: 'PartNumber'
      },
      {
        key: 'pneumaticType',
        labels: {
          en: 'Type',
          nl: 'Type',
          fr: 'Type'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 10,
        xmlElement: 'PneumaticType',
        options: [
          {
            value: 'cylinder',
            labels: {
              en: 'Cylinder',
              nl: 'Cilinder',
              fr: 'Vérin'
            }
          },
          {
            value: 'valve',
            labels: {
              en: 'Valve',
              nl: 'Klep',
              fr: 'Vanne'
            }
          },
          {
            value: 'filter-regulator',
            labels: {
              en: 'Filter Regulator',
              nl: 'Filter Regelaar',
              fr: 'Filtre Régulateur'
            }
          },
          {
            value: 'fitting',
            labels: {
              en: 'Fitting',
              nl: 'Fitting',
              fr: 'Raccord'
            }
          }
        ]
      },
      {
        key: 'portSize',
        labels: {
          en: 'Port Size',
          nl: 'Poortmaat',
          fr: 'Taille du port'
        },
        type: 'text',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 11,
        xmlElement: 'PortSize'
      },
      {
        key: 'maxPressure',
        labels: {
          en: 'Max Pressure',
          nl: 'Max Druk',
          fr: 'Pression max'
        },
        unit: 'bar',
        type: 'number',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 12,
        xmlElement: 'MaxPressure'
      },
      {
        key: 'flowCapacity',
        labels: {
          en: 'Flow Capacity',
          nl: 'Debietcapaciteit',
          fr: 'Capacité de débit'
        },
        unit: 'l/min',
        type: 'number',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 13,
        xmlElement: 'FlowCapacity'
      },
      {
        key: 'actuation',
        labels: {
          en: 'Actuation',
          nl: 'Aansturing',
          fr: 'Activation'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 14,
        xmlElement: 'Actuation',
        options: [
          {
            value: 'manual',
            labels: {
              en: 'Manual',
              nl: 'Handmatig',
              fr: 'Manuel'
            }
          },
          {
            value: 'electric',
            labels: {
              en: 'Electric',
              nl: 'Elektrisch',
              fr: 'Électrique'
            }
          },
          {
            value: 'air-pilot',
            labels: {
              en: 'Air Pilot',
              nl: 'Luchtgestuurd',
              fr: 'Pilote pneumatique'
            }
          },
          {
            value: 'solenoid',
            labels: {
              en: 'Solenoid',
              nl: 'Magneetklep',
              fr: 'Solénoïde'
            }
          }
        ]
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
        key: 'performance',
        labels: {
          en: 'Performance',
          nl: 'Prestaties',
          fr: 'Performance'
        },
        properties: ['pneumaticType', 'maxPressure', 'flowCapacity'],
        sortOrder: 2
      },
      {
        key: 'connections',
        labels: {
          en: 'Connections',
          nl: 'Aansluitingen',
          fr: 'Connexions'
        },
        properties: ['portSize', 'actuation'],
        sortOrder: 3
      }
    ]
  },
  {
    id: 'fasteners',
    labels: {
      en: 'Fasteners & Hardware',
      nl: 'Bevestigingsmiddelen & Hardware',
      fr: 'Fixations & Matériel'
    },
    descriptions: {
      en: 'Bolts, nuts, washers, rivets and installation hardware for industrial assembly',
      nl: 'Bouten, moeren, ringen, klinknagels en installatiemateriaal',
      fr: 'Boulons, écrous, rondelles, rivets et quincaillerie'
    },
    icon: 'fastener',
    properties: [
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
        xmlElement: 'Manufacturer'
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
        xmlElement: 'PartNumber'
      },
      {
        key: 'fastenerType',
        labels: {
          en: 'Fastener Type',
          nl: 'Fastener Type',
          fr: 'Type de fixation'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 10,
        xmlElement: 'FastenerType',
        options: [
          {
            value: 'bolt',
            labels: {
              en: 'Bolt',
              nl: 'Bout',
              fr: 'Boulon'
            }
          },
          {
            value: 'nut',
            labels: {
              en: 'Nut',
              nl: 'Moer',
              fr: 'Écrou'
            }
          },
          {
            value: 'washer',
            labels: {
              en: 'Washer',
              nl: 'Ring',
              fr: 'Rondelle'
            }
          },
          {
            value: 'rivet',
            labels: {
              en: 'Rivet',
              nl: 'Klinknagel',
              fr: 'Rivet'
            }
          },
          {
            value: 'pin',
            labels: {
              en: 'Pin',
              nl: 'Pin',
              fr: 'Goupille'
            }
          }
        ]
      },
      {
        key: 'material',
        labels: {
          en: 'Material',
          nl: 'Materiaal',
          fr: 'Matériau'
        },
        type: 'select',
        filterable: false,
        primaryDisplay: false,
        sortOrder: 12,
        xmlElement: 'Material',
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
        key: 'size',
        labels: {
          en: 'Size',
          nl: 'Afmeting',
          fr: 'Taille'
        },
        type: 'text',
        filterable: true,
        primaryDisplay: true,
        sortOrder: 13,
        xmlElement: 'Size'
      },
      {
        key: 'thread',
        labels: {
          en: 'Thread',
          nl: 'Schroefdraad',
          fr: 'Filetage'
        },
        type: 'text',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 14,
        xmlElement: 'Thread'
      },
      {
        key: 'finish',
        labels: {
          en: 'Finish',
          nl: 'Afwerking',
          fr: 'Finition'
        },
        type: 'select',
        filterable: true,
        primaryDisplay: false,
        sortOrder: 20,
        xmlElement: 'Finish',
        options: [
          {
            value: 'zinc-plated',
            labels: {
              en: 'Zinc Plated',
              nl: 'Verzinkt',
              fr: 'Zingué'
            }
          },
          {
            value: 'black-oxide',
            labels: {
              en: 'Black Oxide',
              nl: 'Zwart Geoxideerd',
              fr: 'Oxyde Noir'
            }
          },
          {
            value: 'galvanized',
            labels: {
              en: 'Galvanized',
              nl: 'Gegalvaniseerd',
              fr: 'Galvanisé'
            }
          },
          {
            value: 'passivated',
            labels: {
              en: 'Passivated',
              nl: 'Gepassiveerd',
              fr: 'Passivé'
            }
          }
        ]
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
        key: 'performance',
        labels: {
          en: 'Performance',
          nl: 'Prestaties',
          fr: 'Performance'
        },
        properties: ['fastenerType', 'size', 'thread'],
        sortOrder: 2
      },
      {
        key: 'materials',
        labels: {
          en: 'Materials',
          nl: 'Materialen',
          fr: 'Matériaux'
        },
        properties: ['material', 'finish'],
        sortOrder: 3
      }
    ]
  }
]
