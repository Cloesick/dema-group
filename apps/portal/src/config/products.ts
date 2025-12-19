// Product images configuration for each company

export interface ProductImage {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface CompanyProducts {
  companyId: string;
  products: ProductImage[];
}

export const companyProducts: CompanyProducts[] = [
  {
    companyId: 'dema',
    products: [
      {
        id: 'pump',
        name: 'Centrifugal Pumps',
        image: '/images/products/dema-pump.svg',
        description: 'Submersible, centrifugal, and well pumps for all applications',
      },
      {
        id: 'pipes',
        name: 'Pipes and Fittings',
        image: '/images/products/dema-pipes.svg',
        description: 'PE, PVC, and galvanized pipe systems with fittings',
      },
      {
        id: 'tools',
        name: 'Power Tools',
        image: '/images/products/dema-tools.svg',
        description: 'Makita cordless drills, grinders, and professional tools',
      },
      {
        id: 'compressor',
        name: 'Air Compressors',
        image: '/images/products/dema-compressor.svg',
        description: 'Airpress piston and screw compressors',
      },
    ],
  },
  {
    companyId: 'fluxer',
    products: [
      {
        id: 'valve',
        name: 'Industrial Valves',
        image: '/images/products/fluxer-valve.svg',
        description: 'Ball, butterfly, gate, and control valves',
      },
      {
        id: 'actuator',
        name: 'Actuators',
        image: '/images/products/fluxer-actuator.svg',
        description: 'Pneumatic and electric actuators for valve automation',
      },
      {
        id: 'instrumentation',
        name: 'Instrumentation',
        image: '/images/products/fluxer-instrumentation.svg',
        description: 'Pressure, flow, level, and temperature measurement',
      },
    ],
  },
  {
    companyId: 'beltz247',
    products: [
      {
        id: 'conveyor',
        name: 'Conveyor Belts',
        image: '/images/products/beltz247-conveyor.svg',
        description: 'FDA/HACCP certified industrial conveyor belts',
      },
    ],
  },
  {
    companyId: 'devisschere',
    products: [
      {
        id: 'sprinkler',
        name: 'Irrigation Systems',
        image: '/images/products/devisschere-sprinkler.svg',
        description: 'Pop-up sprinklers, rotors, and controllers',
      },
      {
        id: 'drip',
        name: 'Drip Irrigation',
        image: '/images/products/devisschere-drip.svg',
        description: 'Drip lines, emitters, and micro-irrigation',
      },
    ],
  },
  {
    companyId: 'accu',
    products: [
      {
        id: 'screws',
        name: 'Precision Components',
        image: '/images/products/accu-screws.svg',
        description: 'Screws, bolts, nuts, washers, and standoffs',
      },
    ],
  },
];

export const getProductsByCompanyId = (companyId: string): ProductImage[] => {
  const company = companyProducts.find((c) => c.companyId === companyId);
  return company?.products || [];
};
