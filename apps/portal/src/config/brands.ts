// DEMA Group Company Brand Configuration
// Based on research of company websites and brand DNA

export interface CompanyBrand {
  id: string;
  name: string;
  tagline: string;
  tagline_nl: string;
  description: string;
  description_nl: string;
  website: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  logo: string;
  hero: string;
  icon: string;
  categories: string[];
  services: string[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  keywords: string[];
  targetMarkets: string[];
}

export const companies: CompanyBrand[] = [
  {
    id: 'dema',
    name: 'DEMA',
    tagline: 'Quality products for agriculture, construction & industry',
    tagline_nl: 'Kwaliteitsproducten voor land- en tuinbouw, bouw & industrie',
    description: 'DEMA delivers a wide range of quality products for agriculture, horticulture, contractors, installers and industrial customers. Experienced staff provide professional advice. Service and dedication are core values.',
    description_nl: 'DEMA levert een ruim gamma kwaliteitsproducten voor land- en tuinbouw, bouwaannemers, tuinaanleggers, installateurs en industriëlen. De ervaren medewerkers staan borg voor gericht professioneel advies.',
    website: 'https://www.demashop.be',
    colors: {
      primary: '#E31E24',      // DEMA Red
      secondary: '#1A1A1A',    // Dark Black
      accent: '#F5A623',       // Orange accent
      background: '#FFFFFF',
      text: '#333333',
    },
    logo: '/images/logos/dema-logo.svg',
    hero: '/images/heroes/dema-hero.svg',
    icon: '🔧',
    categories: [
      'Pompen & toebehoren',
      'Kunststof leidingsystemen',
      'Metalen leidingsystemen',
      'Industriële slangen & koppelingen',
      'Aandrijftechniek',
      'Afsluiters & appendages',
      'Meet- & regeltechniek',
      'Beregening',
      'Bevestigingsmaterialen',
      'Machines',
      'Gereedschappen',
    ],
    services: [
      'Professional advice',
      'Project guidance',
      'Technical support',
    ],
    contact: {
      phone: '+32 (0)51 20 51 41',
      email: 'sales@demashop.be',
      address: 'Ovenstraat 11, 8800 Roeselare',
    },
    keywords: ['pumps', 'pipes', 'tools', 'irrigation', 'agriculture', 'construction'],
    targetMarkets: ['Agriculture', 'Horticulture', 'Construction', 'Installation', 'Industry'],
  },
  {
    id: 'fluxer',
    name: 'Fluxer',
    tagline: 'Your partner in process flow',
    tagline_nl: 'Uw partner in process flow',
    description: 'Fluxer is your certified partner for products, services and solutions in industry for everything related to pipeline transport. More than a wholesaler - a long-term partnership.',
    description_nl: 'Fluxer is jouw gecertificeerde partner voor producten, diensten en oplossingen in de industrie voor alles wat met transport via leidingen te maken heeft.',
    website: 'https://www.fluxer.be',
    colors: {
      primary: '#0066B3',      // Fluxer Blue
      secondary: '#003D6B',    // Dark Blue
      accent: '#00A0E3',       // Light Blue accent
      background: '#F8FAFC',
      text: '#1E293B',
    },
    logo: '/images/logos/fluxer-logo.svg',
    hero: '/images/heroes/fluxer-hero.svg',
    icon: '🔵',
    categories: [
      'Afsluiters (Valves)',
      'Appendages',
      'Meet- & regeltechniek',
      'Aandrijvingen (Actuators)',
      'Terugslagkleppen (Check valves)',
    ],
    services: [
      'Montage op maat (Custom assembly)',
      'Opstart en indienststelling (Commissioning)',
      'Depannage (Emergency repair)',
      'Doordachte revisie (Valve overhaul)',
      'Hands-on behoefteanalyse',
      'Opleidingen (Training)',
      'Betrouwbaar transport',
    ],
    contact: {
      phone: '+32 (0)51 49 03 99',
      email: 'sales@fluxer.be',
      address: 'Industrielaan 15, 8810 Lichtervelde',
    },
    keywords: ['valves', 'actuators', 'instrumentation', 'process', 'petrochemical', 'food'],
    targetMarkets: ['Petrochemical', 'Food & Beverage', 'Transport & Storage', 'Refineries'],
  },
  {
    id: 'beltz247',
    name: 'Beltz247',
    tagline: '24/7 support in conveyor belts & mechanical maintenance',
    tagline_nl: '24/7 ondersteuning in transportbanden & mechanisch onderhoud',
    description: 'The driven team of Beltz247 is your ideal partner for quality conveyor belts. We combine this with high-quality service in mechanical maintenance. 20 years of passion and knowledge.',
    description_nl: 'Het gedreven team van Beltz247 is uw ideale partner voor kwalitatieve transportbanden. We combineren dit met hoogwaardige service in mechanisch onderhoud.',
    website: 'https://beltz247.com',
    colors: {
      primary: '#FF6B00',      // Beltz Orange
      secondary: '#2D2D2D',    // Dark Gray
      accent: '#FFB800',       // Yellow accent
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    logo: '/images/logos/beltz247-logo.svg',
    hero: '/images/heroes/beltz247-hero.svg',
    icon: '🟠',
    categories: [
      'Industriële transportbanden',
      'FDA/HACCP certified belts',
      'Custom confection',
      'Belt accessories',
    ],
    services: [
      '24/7 Emergency service',
      'Preventive maintenance',
      'Mechanical maintenance',
      'Custom manufacturing',
      'Belt installation',
    ],
    contact: {
      phone: '+32 (0)51 49 03 99',
      email: 'sales@beltz247.com',
      address: 'Industrielaan 15, 8810 Lichtervelde',
    },
    keywords: ['conveyor belts', 'maintenance', '24/7', 'food industry', 'industrial'],
    targetMarkets: ['Food Processing', 'Logistics', 'Manufacturing', 'Recycling'],
  },
  {
    id: 'devisschere',
    name: 'De Visschere Technics',
    tagline: 'Specialist in irrigation design & installation',
    tagline_nl: 'Specialist in het ontwerpen, aanleggen en onderhouden van beregening',
    description: 'De Visschere Technics is specialist in designing, installing and maintaining irrigation systems. Both private customers and companies in horticulture or industry can come to us for custom irrigation installations.',
    description_nl: 'De Visschere Technics is specialist in het ontwerpen, aanleggen en onderhouden van tuinberegeningen. Zowel particuliere klanten als bedrijven in tuinbouw of industrie kunnen bij ons terecht.',
    website: 'https://www.devisscheretechnics.be',
    colors: {
      primary: '#22C55E',      // Green (water/nature)
      secondary: '#166534',    // Dark Green
      accent: '#3B82F6',       // Blue (water)
      background: '#F0FDF4',
      text: '#14532D',
    },
    logo: '/images/logos/devisschere-logo.svg',
    hero: '/images/heroes/devisschere-hero.svg',
    icon: '💧',
    categories: [
      'Tuinberegening (Garden irrigation)',
      'Druppelbevloeiing (Drip irrigation)',
      'Watertechniek (Water technology)',
      'Tuinverlichting (Garden lighting)',
    ],
    services: [
      'Studie & Ontwerp (Design)',
      'Installatie & Opstart',
      'Onderhoud tuinberegening',
      'Water audit',
    ],
    contact: {
      phone: '+32 (0)51 15 27 12',
      email: 'sales@devisscheretechnics.be',
      address: 'Ovenstraat 11, 8800 Roeselare',
    },
    keywords: ['irrigation', 'garden', 'water', 'sprinklers', 'drip', 'lighting'],
    targetMarkets: ['Private Gardens', 'Commercial Landscaping', 'Sports Fields', 'Green Roofs'],
  },
  {
    id: 'accu',
    name: 'Accu Components',
    tagline: 'Precision components - Buy 1 or millions',
    tagline_nl: 'Precisie componenten - Koop 1 of miljoenen',
    description: 'Global precision components supplier with 500,000+ SKUs. From screws to standoffs, washers to handles. Express worldwide shipping, CAD downloads, 24/7 support.',
    description_nl: 'Wereldwijde leverancier van precisie componenten met 500.000+ SKUs. Van schroeven tot afstandhouders, ringen tot handgrepen.',
    website: 'https://accu-components.com',
    colors: {
      primary: '#6366F1',      // Indigo/Purple (tech/precision)
      secondary: '#312E81',    // Dark Indigo
      accent: '#A855F7',       // Purple accent
      background: '#F5F3FF',
      text: '#1E1B4B',
    },
    logo: '/images/logos/accu-logo.svg',
    hero: '/images/heroes/accu-hero.svg',
    icon: '🔩',
    categories: [
      'Precision Screws & Fasteners',
      'Standoffs & Spacers',
      'Washers & Shims',
      'Nuts & Inserts',
      'Pins & Dowels',
      'Handles & Knobs',
      'Feet & Bumpers',
    ],
    services: [
      'Custom components',
      'CAD downloads',
      'Technical support 24/7',
      'Express delivery',
      'API integration',
    ],
    contact: {
      phone: '',
      email: 'info@accu-components.com',
      address: '',
    },
    keywords: ['screws', 'fasteners', 'precision', 'components', 'OEM', 'prototyping'],
    targetMarkets: ['OEM Manufacturers', 'Engineering', 'Prototyping', 'R&D', 'Production'],
  },
];

export const getCompanyById = (id: string): CompanyBrand | undefined => {
  return companies.find((c) => c.id === id);
};

export const groupColors = {
  primary: '#1E40AF',      // DEMA Group Blue
  secondary: '#1E3A8A',
  accent: '#3B82F6',
  background: '#F8FAFC',
  text: '#0F172A',
};
