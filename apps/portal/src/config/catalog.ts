// DEMA Group Product Catalog Configuration
// Products first, then companies that specialize in them

export interface ProductCategory {
  id: string
  name: string
  name_nl: string
  name_fr: string
  icon: string
  image: string
  color: string
  description: string
  description_nl: string
  subcategories: ProductSubcategory[]
  companies: string[] // Company IDs that specialize in this category
}

export interface ProductSubcategory {
  id: string
  name: string
  name_nl: string
  name_fr: string
  products: Product[]
}

export interface Product {
  id: string
  name: string
  name_nl: string
  name_fr: string
  sku_prefix?: string
  image?: string
  companies: string[] // Company IDs that sell this product
  keywords: string[]
}

export const productCategories: ProductCategory[] = [
  {
    id: 'pumps',
    name: 'Pumps & Accessories',
    name_nl: 'Pompen & Toebehoren',
    name_fr: 'Pompes & Accessoires',
    icon: '💧',
    image: '/images/products/dema-pump.svg',
    color: '#3B82F6',
    description: 'Complete range of pumps for agriculture, industry, and domestic use',
    description_nl: 'Compleet gamma pompen voor landbouw, industrie en huishoudelijk gebruik',
    companies: ['dema', 'devisschere'],
    subcategories: [
      {
        id: 'centrifugal-pumps',
        name: 'Centrifugal Pumps',
        name_nl: 'Centrifugaalpompen',
        name_fr: 'Pompes Centrifuges',
        products: [
          { id: 'self-priming', name: 'Self-priming Pumps', name_nl: 'Zelfaanzuigende pompen', name_fr: 'Pompes auto-amorçantes', companies: ['dema'], keywords: ['pump', 'self-priming', 'water'] },
          { id: 'mono-block', name: 'Mono-block Pumps', name_nl: 'Monoblokpompen', name_fr: 'Pompes monobloc', companies: ['dema'], keywords: ['pump', 'mono-block'] },
          { id: 'multi-stage', name: 'Multi-stage Pumps', name_nl: 'Meertraps pompen', name_fr: 'Pompes multicellulaires', companies: ['dema'], keywords: ['pump', 'multi-stage', 'pressure'] },
        ],
      },
      {
        id: 'submersible-pumps',
        name: 'Submersible Pumps',
        name_nl: 'Dompelpompen',
        name_fr: 'Pompes Submersibles',
        products: [
          { id: 'drainage', name: 'Drainage Pumps', name_nl: 'Drainagepompen', name_fr: 'Pompes de drainage', companies: ['dema'], keywords: ['drainage', 'water', 'flood'] },
          { id: 'sewage', name: 'Sewage Pumps', name_nl: 'Vuilwaterpompen', name_fr: 'Pompes à eaux usées', companies: ['dema'], keywords: ['sewage', 'waste', 'dirty water'] },
          { id: 'well-pumps', name: 'Well Pumps', name_nl: 'Bronpompen', name_fr: 'Pompes de puits', companies: ['dema'], keywords: ['well', 'deep', 'borehole'] },
        ],
      },
      {
        id: 'piston-pumps',
        name: 'Piston Pumps',
        name_nl: 'Zuigerpompen',
        name_fr: 'Pompes à Piston',
        products: [
          { id: 'hand-pumps', name: 'Hand Pumps', name_nl: 'Handpompen', name_fr: 'Pompes manuelles', companies: ['dema'], keywords: ['hand', 'manual', 'portable'] },
          { id: 'diaphragm', name: 'Diaphragm Pumps', name_nl: 'Membraanpompen', name_fr: 'Pompes à membrane', companies: ['dema'], keywords: ['diaphragm', 'chemical'] },
        ],
      },
      {
        id: 'pump-accessories',
        name: 'Pump Accessories',
        name_nl: 'Pomptoebehoren',
        name_fr: 'Accessoires de Pompe',
        products: [
          { id: 'pressure-tanks', name: 'Pressure Tanks', name_nl: 'Drukvaten', name_fr: 'Réservoirs sous pression', companies: ['dema'], keywords: ['tank', 'pressure', 'expansion'] },
          { id: 'controllers', name: 'Pump Controllers', name_nl: 'Pompbesturingen', name_fr: 'Contrôleurs de pompe', companies: ['dema'], keywords: ['controller', 'automatic', 'switch'] },
          { id: 'foot-valves', name: 'Foot Valves', name_nl: 'Voetklappen', name_fr: 'Clapets de pied', companies: ['dema'], keywords: ['valve', 'foot', 'suction'] },
        ],
      },
    ],
  },
  {
    id: 'pipes-fittings',
    name: 'Pipes & Fittings',
    name_nl: 'Buizen & Fittingen',
    name_fr: 'Tuyaux & Raccords',
    icon: '🔧',
    image: '/images/products/dema-pipes.svg',
    color: '#6366F1',
    description: 'Plastic and metal piping systems for all applications',
    description_nl: 'Kunststof en metalen leidingsystemen voor alle toepassingen',
    companies: ['dema', 'fluxer'],
    subcategories: [
      {
        id: 'plastic-pipes',
        name: 'Plastic Pipes',
        name_nl: 'Kunststof Buizen',
        name_fr: 'Tuyaux Plastiques',
        products: [
          { id: 'pe-pipes', name: 'PE Pipes', name_nl: 'PE Buizen', name_fr: 'Tuyaux PE', companies: ['dema'], keywords: ['PE', 'polyethylene', 'water', 'irrigation'] },
          { id: 'pvc-pipes', name: 'PVC Pipes', name_nl: 'PVC Buizen', name_fr: 'Tuyaux PVC', companies: ['dema'], keywords: ['PVC', 'pressure', 'drainage'] },
          { id: 'abs-pipes', name: 'ABS Compressed Air Pipes', name_nl: 'ABS Persluchtbuizen', name_fr: 'Tuyaux ABS Air Comprimé', companies: ['dema'], keywords: ['ABS', 'compressed air', 'pneumatic'] },
          { id: 'pp-pipes', name: 'PP Drainage Pipes', name_nl: 'PP Afvoerbuizen', name_fr: 'Tuyaux PP Évacuation', companies: ['dema'], keywords: ['PP', 'drainage', 'sewage'] },
        ],
      },
      {
        id: 'metal-pipes',
        name: 'Metal Pipes',
        name_nl: 'Metalen Buizen',
        name_fr: 'Tuyaux Métalliques',
        products: [
          { id: 'galvanized', name: 'Galvanized Pipes', name_nl: 'Verzinkte Buizen', name_fr: 'Tuyaux Galvanisés', companies: ['dema'], keywords: ['galvanized', 'steel', 'threaded'] },
          { id: 'stainless', name: 'Stainless Steel Pipes', name_nl: 'RVS Buizen', name_fr: 'Tuyaux Inox', companies: ['dema', 'fluxer'], keywords: ['stainless', 'inox', 'food grade'] },
          { id: 'black-steel', name: 'Black Steel Pipes', name_nl: 'Zwarte Stalen Buizen', name_fr: 'Tuyaux Acier Noir', companies: ['dema'], keywords: ['black', 'steel', 'gas'] },
        ],
      },
      {
        id: 'fittings',
        name: 'Fittings',
        name_nl: 'Fittingen',
        name_fr: 'Raccords',
        products: [
          { id: 'brass-fittings', name: 'Brass Fittings', name_nl: 'Messing Fittingen', name_fr: 'Raccords Laiton', companies: ['dema'], keywords: ['brass', 'threaded', 'compression'] },
          { id: 'stainless-fittings', name: 'Stainless Fittings', name_nl: 'RVS Fittingen', name_fr: 'Raccords Inox', companies: ['dema', 'fluxer'], keywords: ['stainless', 'inox', 'hygienic'] },
          { id: 'pe-fittings', name: 'PE Fittings', name_nl: 'PE Fittingen', name_fr: 'Raccords PE', companies: ['dema'], keywords: ['PE', 'compression', 'electrofusion'] },
        ],
      },
    ],
  },
  {
    id: 'hoses-couplings',
    name: 'Hoses & Couplings',
    name_nl: 'Slangen & Koppelingen',
    name_fr: 'Flexibles & Raccords',
    icon: '🔄',
    image: '/images/products/dema-hoses.svg',
    color: '#10B981',
    description: 'Industrial hoses and quick couplings for every application',
    description_nl: 'Industriële slangen en snelkoppelingen voor elke toepassing',
    companies: ['dema'],
    subcategories: [
      {
        id: 'industrial-hoses',
        name: 'Industrial Hoses',
        name_nl: 'Industriële Slangen',
        name_fr: 'Flexibles Industriels',
        products: [
          { id: 'rubber-hoses', name: 'Rubber Hoses', name_nl: 'Rubber Slangen', name_fr: 'Flexibles Caoutchouc', companies: ['dema'], keywords: ['rubber', 'water', 'air', 'oil'] },
          { id: 'pvc-hoses', name: 'PVC Hoses', name_nl: 'PVC Slangen', name_fr: 'Flexibles PVC', companies: ['dema'], keywords: ['PVC', 'transparent', 'food'] },
          { id: 'suction-hoses', name: 'Suction Hoses', name_nl: 'Zuigslangen', name_fr: 'Flexibles d\'Aspiration', companies: ['dema'], keywords: ['suction', 'spiral', 'heavy duty'] },
          { id: 'layflat-hoses', name: 'Layflat Hoses', name_nl: 'Plat Oprolbare Slangen', name_fr: 'Flexibles Plats', companies: ['dema'], keywords: ['layflat', 'irrigation', 'fire'] },
        ],
      },
      {
        id: 'couplings',
        name: 'Couplings',
        name_nl: 'Koppelingen',
        name_fr: 'Raccords Rapides',
        products: [
          { id: 'camlock', name: 'Camlock Couplings', name_nl: 'Camlock Koppelingen', name_fr: 'Raccords Camlock', companies: ['dema'], keywords: ['camlock', 'quick', 'industrial'] },
          { id: 'guillemin', name: 'Guillemin Couplings', name_nl: 'Guillemin Koppelingen', name_fr: 'Raccords Guillemin', companies: ['dema'], keywords: ['guillemin', 'symmetric', 'fire'] },
          { id: 'storz', name: 'Storz Couplings', name_nl: 'Storz Koppelingen', name_fr: 'Raccords Storz', companies: ['dema'], keywords: ['storz', 'fire', 'emergency'] },
          { id: 'hose-clamps', name: 'Hose Clamps', name_nl: 'Slangklemmen', name_fr: 'Colliers de Serrage', companies: ['dema'], keywords: ['clamp', 'worm', 'heavy duty'] },
        ],
      },
    ],
  },
  {
    id: 'valves-controls',
    name: 'Valves & Controls',
    name_nl: 'Afsluiters & Besturingen',
    name_fr: 'Vannes & Contrôles',
    icon: '⚙️',
    image: '/images/products/fluxer-valve.svg',
    color: '#0066B3',
    description: 'Industrial valves, actuators and process control equipment',
    description_nl: 'Industriële afsluiters, actuatoren en procesbesturingsapparatuur',
    companies: ['fluxer', 'dema'],
    subcategories: [
      {
        id: 'ball-valves',
        name: 'Ball Valves',
        name_nl: 'Kogelkranen',
        name_fr: 'Vannes à Bille',
        products: [
          { id: 'brass-ball', name: 'Brass Ball Valves', name_nl: 'Messing Kogelkranen', name_fr: 'Vannes à Bille Laiton', companies: ['dema', 'fluxer'], keywords: ['ball', 'brass', 'quarter turn'] },
          { id: 'stainless-ball', name: 'Stainless Ball Valves', name_nl: 'RVS Kogelkranen', name_fr: 'Vannes à Bille Inox', companies: ['fluxer'], keywords: ['ball', 'stainless', 'hygienic'] },
          { id: 'pvc-ball', name: 'PVC Ball Valves', name_nl: 'PVC Kogelkranen', name_fr: 'Vannes à Bille PVC', companies: ['dema'], keywords: ['ball', 'PVC', 'chemical'] },
        ],
      },
      {
        id: 'butterfly-valves',
        name: 'Butterfly Valves',
        name_nl: 'Vlinderklepen',
        name_fr: 'Vannes Papillon',
        products: [
          { id: 'wafer-butterfly', name: 'Wafer Butterfly Valves', name_nl: 'Wafer Vlinderklepen', name_fr: 'Vannes Papillon Wafer', companies: ['fluxer'], keywords: ['butterfly', 'wafer', 'large diameter'] },
          { id: 'lug-butterfly', name: 'Lug Butterfly Valves', name_nl: 'Lug Vlinderklepen', name_fr: 'Vannes Papillon Lug', companies: ['fluxer'], keywords: ['butterfly', 'lug', 'end of line'] },
        ],
      },
      {
        id: 'check-valves',
        name: 'Check Valves',
        name_nl: 'Terugslagkleppen',
        name_fr: 'Clapets Anti-retour',
        products: [
          { id: 'swing-check', name: 'Swing Check Valves', name_nl: 'Swing Terugslagkleppen', name_fr: 'Clapets à Battant', companies: ['fluxer', 'dema'], keywords: ['check', 'swing', 'non-return'] },
          { id: 'spring-check', name: 'Spring Check Valves', name_nl: 'Veer Terugslagkleppen', name_fr: 'Clapets à Ressort', companies: ['fluxer'], keywords: ['check', 'spring', 'inline'] },
        ],
      },
      {
        id: 'actuators',
        name: 'Actuators',
        name_nl: 'Actuatoren',
        name_fr: 'Actionneurs',
        products: [
          { id: 'pneumatic-actuators', name: 'Pneumatic Actuators', name_nl: 'Pneumatische Actuatoren', name_fr: 'Actionneurs Pneumatiques', companies: ['fluxer'], keywords: ['pneumatic', 'air', 'automation'] },
          { id: 'electric-actuators', name: 'Electric Actuators', name_nl: 'Elektrische Actuatoren', name_fr: 'Actionneurs Électriques', companies: ['fluxer'], keywords: ['electric', 'motor', 'automation'] },
        ],
      },
    ],
  },
  {
    id: 'irrigation',
    name: 'Irrigation Systems',
    name_nl: 'Beregeningssystemen',
    name_fr: 'Systèmes d\'Irrigation',
    icon: '🌱',
    image: '/images/products/devisschere-sprinkler.svg',
    color: '#22C55E',
    description: 'Complete irrigation solutions for gardens, sports fields and agriculture',
    description_nl: 'Complete beregeningsoplossingen voor tuinen, sportvelden en landbouw',
    companies: ['devisschere', 'dema'],
    subcategories: [
      {
        id: 'sprinklers',
        name: 'Sprinklers',
        name_nl: 'Sproeiers',
        name_fr: 'Arroseurs',
        products: [
          { id: 'pop-up', name: 'Pop-up Sprinklers', name_nl: 'Pop-up Sproeiers', name_fr: 'Arroseurs Escamotables', companies: ['devisschere', 'dema'], keywords: ['pop-up', 'lawn', 'garden'] },
          { id: 'rotary', name: 'Rotary Sprinklers', name_nl: 'Roterende Sproeiers', name_fr: 'Arroseurs Rotatifs', companies: ['devisschere', 'dema'], keywords: ['rotary', 'large area', 'sports'] },
          { id: 'impact', name: 'Impact Sprinklers', name_nl: 'Slagsproeiers', name_fr: 'Arroseurs à Impact', companies: ['dema'], keywords: ['impact', 'agriculture', 'field'] },
        ],
      },
      {
        id: 'drip-irrigation',
        name: 'Drip Irrigation',
        name_nl: 'Druppelbevloeiing',
        name_fr: 'Irrigation Goutte à Goutte',
        products: [
          { id: 'drip-lines', name: 'Drip Lines', name_nl: 'Druppelslangen', name_fr: 'Lignes de Goutte', companies: ['devisschere', 'dema'], keywords: ['drip', 'line', 'water saving'] },
          { id: 'drippers', name: 'Drippers', name_nl: 'Druppelaars', name_fr: 'Goutteurs', companies: ['devisschere'], keywords: ['dripper', 'emitter', 'precision'] },
          { id: 'micro-sprinklers', name: 'Micro Sprinklers', name_nl: 'Microsproeiers', name_fr: 'Micro-arroseurs', companies: ['devisschere'], keywords: ['micro', 'greenhouse', 'nursery'] },
        ],
      },
      {
        id: 'irrigation-controls',
        name: 'Controllers',
        name_nl: 'Besturingen',
        name_fr: 'Programmateurs',
        products: [
          { id: 'timers', name: 'Irrigation Timers', name_nl: 'Beregeningstimers', name_fr: 'Programmateurs', companies: ['devisschere', 'dema'], keywords: ['timer', 'automatic', 'schedule'] },
          { id: 'smart-controllers', name: 'Smart Controllers', name_nl: 'Slimme Besturingen', name_fr: 'Contrôleurs Intelligents', companies: ['devisschere'], keywords: ['smart', 'wifi', 'app'] },
          { id: 'solenoid-valves', name: 'Solenoid Valves', name_nl: 'Magneetventielen', name_fr: 'Électrovannes', companies: ['devisschere', 'dema'], keywords: ['solenoid', 'electric', 'zone'] },
        ],
      },
    ],
  },
  {
    id: 'conveyor-belts',
    name: 'Conveyor Belts',
    name_nl: 'Transportbanden',
    name_fr: 'Bandes Transporteuses',
    icon: '🏭',
    image: '/images/products/beltz247-conveyor.svg',
    color: '#FF6B00',
    description: '24/7 support for industrial conveyor belts and mechanical maintenance',
    description_nl: '24/7 ondersteuning voor industriële transportbanden en mechanisch onderhoud',
    companies: ['beltz247'],
    subcategories: [
      {
        id: 'industrial-belts',
        name: 'Industrial Belts',
        name_nl: 'Industriële Banden',
        name_fr: 'Bandes Industrielles',
        products: [
          { id: 'pvc-belts', name: 'PVC Conveyor Belts', name_nl: 'PVC Transportbanden', name_fr: 'Bandes PVC', companies: ['beltz247'], keywords: ['PVC', 'general purpose', 'logistics'] },
          { id: 'pu-belts', name: 'PU Conveyor Belts', name_nl: 'PU Transportbanden', name_fr: 'Bandes PU', companies: ['beltz247'], keywords: ['PU', 'food', 'hygienic'] },
          { id: 'rubber-belts', name: 'Rubber Conveyor Belts', name_nl: 'Rubber Transportbanden', name_fr: 'Bandes Caoutchouc', companies: ['beltz247'], keywords: ['rubber', 'heavy duty', 'mining'] },
        ],
      },
      {
        id: 'food-grade-belts',
        name: 'Food Grade Belts',
        name_nl: 'Voedselveilige Banden',
        name_fr: 'Bandes Alimentaires',
        products: [
          { id: 'fda-belts', name: 'FDA Certified Belts', name_nl: 'FDA Gecertificeerde Banden', name_fr: 'Bandes Certifiées FDA', companies: ['beltz247'], keywords: ['FDA', 'food safe', 'certified'] },
          { id: 'haccp-belts', name: 'HACCP Belts', name_nl: 'HACCP Banden', name_fr: 'Bandes HACCP', companies: ['beltz247'], keywords: ['HACCP', 'hygienic', 'easy clean'] },
        ],
      },
      {
        id: 'belt-accessories',
        name: 'Belt Accessories',
        name_nl: 'Band Accessoires',
        name_fr: 'Accessoires de Bande',
        products: [
          { id: 'belt-scrapers', name: 'Belt Scrapers', name_nl: 'Bandschrapers', name_fr: 'Racleurs de Bande', companies: ['beltz247'], keywords: ['scraper', 'cleaning', 'maintenance'] },
          { id: 'belt-guides', name: 'Belt Guides', name_nl: 'Bandgeleiders', name_fr: 'Guides de Bande', companies: ['beltz247'], keywords: ['guide', 'tracking', 'alignment'] },
        ],
      },
    ],
  },
  {
    id: 'fasteners',
    name: 'Fasteners & Components',
    name_nl: 'Bevestigingsmaterialen & Componenten',
    name_fr: 'Fixations & Composants',
    icon: '🔩',
    image: '/images/products/accu-screws.svg',
    color: '#6366F1',
    description: 'Precision components - from 1 piece to millions',
    description_nl: 'Precisie componenten - van 1 stuk tot miljoenen',
    companies: ['accu', 'dema'],
    subcategories: [
      {
        id: 'screws',
        name: 'Screws',
        name_nl: 'Schroeven',
        name_fr: 'Vis',
        products: [
          { id: 'machine-screws', name: 'Machine Screws', name_nl: 'Machineschroeven', name_fr: 'Vis Mécaniques', companies: ['accu', 'dema'], keywords: ['machine', 'metric', 'precision'] },
          { id: 'self-tapping', name: 'Self-tapping Screws', name_nl: 'Zelftappende Schroeven', name_fr: 'Vis Autotaraudeuses', companies: ['accu', 'dema'], keywords: ['self-tapping', 'sheet metal'] },
          { id: 'set-screws', name: 'Set Screws', name_nl: 'Stelschroeven', name_fr: 'Vis Sans Tête', companies: ['accu'], keywords: ['set', 'grub', 'headless'] },
        ],
      },
      {
        id: 'nuts-washers',
        name: 'Nuts & Washers',
        name_nl: 'Moeren & Ringen',
        name_fr: 'Écrous & Rondelles',
        products: [
          { id: 'hex-nuts', name: 'Hex Nuts', name_nl: 'Zeskantmoeren', name_fr: 'Écrous Hexagonaux', companies: ['accu', 'dema'], keywords: ['hex', 'nut', 'standard'] },
          { id: 'lock-nuts', name: 'Lock Nuts', name_nl: 'Borgmoeren', name_fr: 'Écrous Frein', companies: ['accu'], keywords: ['lock', 'nylon', 'prevailing torque'] },
          { id: 'flat-washers', name: 'Flat Washers', name_nl: 'Vlakke Ringen', name_fr: 'Rondelles Plates', companies: ['accu', 'dema'], keywords: ['flat', 'washer', 'spacer'] },
          { id: 'spring-washers', name: 'Spring Washers', name_nl: 'Veerringen', name_fr: 'Rondelles Grower', companies: ['accu'], keywords: ['spring', 'lock', 'vibration'] },
        ],
      },
      {
        id: 'standoffs-spacers',
        name: 'Standoffs & Spacers',
        name_nl: 'Afstandhouders',
        name_fr: 'Entretoises',
        products: [
          { id: 'hex-standoffs', name: 'Hex Standoffs', name_nl: 'Zeskant Afstandhouders', name_fr: 'Entretoises Hexagonales', companies: ['accu'], keywords: ['standoff', 'PCB', 'electronics'] },
          { id: 'round-spacers', name: 'Round Spacers', name_nl: 'Ronde Afstandsbussen', name_fr: 'Entretoises Rondes', companies: ['accu'], keywords: ['spacer', 'round', 'sleeve'] },
        ],
      },
    ],
  },
  {
    id: 'tools-machines',
    name: 'Tools & Machines',
    name_nl: 'Gereedschap & Machines',
    name_fr: 'Outils & Machines',
    icon: '🛠️',
    image: '/images/products/dema-tools.svg',
    color: '#E31E24',
    description: 'Professional tools and machines for every job',
    description_nl: 'Professioneel gereedschap en machines voor elke klus',
    companies: ['dema'],
    subcategories: [
      {
        id: 'power-tools',
        name: 'Power Tools',
        name_nl: 'Elektrisch Gereedschap',
        name_fr: 'Outils Électriques',
        products: [
          { id: 'drills', name: 'Drills', name_nl: 'Boormachines', name_fr: 'Perceuses', companies: ['dema'], keywords: ['drill', 'cordless', 'hammer'] },
          { id: 'grinders', name: 'Grinders', name_nl: 'Slijpmachines', name_fr: 'Meuleuses', companies: ['dema'], keywords: ['grinder', 'angle', 'cutting'] },
          { id: 'saws', name: 'Saws', name_nl: 'Zagen', name_fr: 'Scies', companies: ['dema'], keywords: ['saw', 'circular', 'reciprocating'] },
        ],
      },
      {
        id: 'pressure-washers',
        name: 'Pressure Washers',
        name_nl: 'Hogedrukreinigers',
        name_fr: 'Nettoyeurs Haute Pression',
        products: [
          { id: 'cold-water', name: 'Cold Water Pressure Washers', name_nl: 'Koudwater Hogedrukreinigers', name_fr: 'Nettoyeurs Eau Froide', companies: ['dema'], keywords: ['pressure', 'cold', 'cleaning'] },
          { id: 'hot-water', name: 'Hot Water Pressure Washers', name_nl: 'Warmwater Hogedrukreinigers', name_fr: 'Nettoyeurs Eau Chaude', companies: ['dema'], keywords: ['pressure', 'hot', 'industrial'] },
        ],
      },
      {
        id: 'compressors',
        name: 'Compressors',
        name_nl: 'Compressoren',
        name_fr: 'Compresseurs',
        products: [
          { id: 'piston-compressors', name: 'Piston Compressors', name_nl: 'Zuigercompressoren', name_fr: 'Compresseurs à Piston', companies: ['dema'], keywords: ['piston', 'air', 'workshop'] },
          { id: 'screw-compressors', name: 'Screw Compressors', name_nl: 'Schroefcompressoren', name_fr: 'Compresseurs à Vis', companies: ['dema'], keywords: ['screw', 'industrial', 'continuous'] },
        ],
      },
    ],
  },
]

// Helper functions
export const getAllProducts = (): Product[] => {
  const products: Product[] = []
  for (const category of productCategories) {
    for (const subcategory of category.subcategories) {
      products.push(...subcategory.products)
    }
  }
  return products
}

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase()
  return getAllProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.name_nl.toLowerCase().includes(q) ||
      p.name_fr.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q))
  )
}

export const getProductsByCompany = (companyId: string): Product[] => {
  return getAllProducts().filter((p) => p.companies.includes(companyId))
}

export const getCategoriesByCompany = (companyId: string): ProductCategory[] => {
  return productCategories.filter((c) => c.companies.includes(companyId))
}
