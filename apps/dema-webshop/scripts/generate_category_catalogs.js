const fs = require('fs');
const path = require('path');

// Configuration
const PDF_JSON_DIR = path.join(__dirname, '..', 'documents', 'Product_pdfs', 'json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'categories');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Category definitions with better descriptions
const CATEGORIES = {
  'pumps': {
    name: 'Pumps',
    icon: '💧',
    description: 'Submersible pumps, centrifugal pumps, well pumps, drainage pumps',
    keywords: ['pump', 'pomp', 'submersible', 'centrifugal', 'well_pump', 'drainage', 'bronpomp', 'dompelpomp', 'zuigerpomp', 'centrifugaalpomp']
  },
  'pipes': {
    name: 'Pipes & Tubes',
    icon: '🔧',
    description: 'PE pipes, PVC pipes, pressure pipes, drainage pipes, plastic tubes',
    keywords: ['pipe', 'tube', 'buizen', 'buis', 'leiding', 'drukbuis', 'afvoerleiding', 'kunststof']
  },
  'hoses': {
    name: 'Hoses & Flexible Tubes',
    icon: '🌀',
    description: 'Rubber hoses, suction hoses, PU hoses, spiral hoses, flat hoses',
    keywords: ['hose', 'slang', 'slangen', 'afzuigslang', 'rubber', 'spiral', 'flat', 'oprolbare']
  },
  'fittings': {
    name: 'Fittings & Connections',
    icon: '🔩',
    description: 'Brass fittings, stainless steel fittings, pipe connections, adapters',
    keywords: ['fitting', 'koppeling', 'connector', 'adapter', 'elbow', 'tee', 'draadfitting', 'lasfitting', 'messing', 'rvs']
  },
  'clamps': {
    name: 'Clamps & Fasteners',
    icon: '🔗',
    description: 'Hose clamps, pipe clamps, fastening systems',
    keywords: ['clamp', 'klem', 'klemmen', 'slangklem']
  },
  'compressors': {
    name: 'Compressors & Air Equipment',
    icon: '⚙️',
    description: 'Air compressors, compressed air equipment, pneumatic tools',
    keywords: ['compressor', 'compressed_air', 'air_compressor', 'luchtcompressor', 'abs', 'perslucht']
  },
  'pressure_washers': {
    name: 'Pressure Washers',
    icon: '🚿',
    description: 'High-pressure cleaners, pressure washing equipment, accessories',
    keywords: ['pressure_washer', 'hogedrukreiniger', 'kranzle', 'kränzle']
  },
  'power_tools': {
    name: 'Power Tools',
    icon: '🔨',
    description: 'Drills, saws, grinders, sanders, impact drivers, cordless tools',
    keywords: ['drill', 'saw', 'grinder', 'sander', 'polisher', 'router', 'planer', 'trimmer', 'impact', 'hammer', 'screwdriver', 'wrench', 'makita']
  },
  'garden_tools': {
    name: 'Garden Tools & Equipment',
    icon: '🌱',
    description: 'Lawn mowers, hedge trimmers, chainsaws, garden pumps',
    keywords: ['lawn', 'mower', 'hedge', 'trimmer', 'blower', 'chainsaw', 'grass', 'garden', 'cultivator', 'tiller']
  },
  'accessories': {
    name: 'Accessories & Parts',
    icon: '🔧',
    description: 'Spare parts, batteries, chargers, cases, pump accessories',
    keywords: ['accessory', 'toebehoren', 'battery', 'accu', 'charger', 'case', 'bag', 'spare', 'onderdeel']
  }
};

function categorizeProduct(product) {
  const searchText = [
    product.type,
    product.product_type,
    product.catalog_group,
    product.application,
    product.series_name,
    product.source_pdf,
    product.material
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Check each category
  for (const [categoryKey, category] of Object.entries(CATEGORIES)) {
    if (category.keywords.some(keyword => searchText.includes(keyword))) {
      return categoryKey;
    }
  }
  
  return null; // Uncategorized
}

async function generateCategoryCatalogs() {
  console.log('🚀 Generating category-based catalogs...\n');
  
  const categoryProducts = {};
  
  // Initialize categories
  for (const key of Object.keys(CATEGORIES)) {
    categoryProducts[key] = [];
  }
  categoryProducts['uncategorized'] = [];
  
  // Read all product files
  const files = fs.readdirSync(PDF_JSON_DIR).filter(f => f.endsWith('.json'));
  let totalProducts = 0;
  
  for (const file of files) {
    console.log(`📦 Processing: ${file}...`);
    const filePath = path.join(PDF_JSON_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!Array.isArray(data)) continue;
    
    for (const product of data) {
      totalProducts++;
      const category = categorizeProduct(product);
      
      const productData = {
        sku: product.sku,
        name: product.series_name || product.type || product.sku,
        type: product.type || product.product_type,
        brand: product.brand,
        catalog: file.replace('.json', ''),
        source_pdf: product.source_pdf,
        page: product.page,
        image: product.image,
        images: product.images || [],
        properties: extractProperties(product),
        attributes: extractAttributes(product),
        material: product.material,
        description: product.spec_application_desc || product.application
      };
      
      if (category) {
        categoryProducts[category].push(productData);
      } else {
        categoryProducts['uncategorized'].push(productData);
      }
    }
  }
  
  // Generate catalog file for each category
  console.log('\n📝 Writing category catalogs...\n');
  
  const categoryStats = {};
  
  for (const [categoryKey, products] of Object.entries(categoryProducts)) {
    if (products.length === 0) continue;
    
    const category = CATEGORIES[categoryKey] || {
      name: 'Uncategorized',
      icon: '📦',
      description: 'Products not yet categorized'
    };
    
    // Group products by image or series for better presentation
    const grouped = groupProductsByImage(products);
    
    const catalogData = {
      category: categoryKey,
      name: category.name,
      icon: category.icon,
      description: category.description,
      total_products: products.length,
      total_groups: grouped.length,
      groups: grouped
    };
    
    const outputFile = `${categoryKey}.json`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(catalogData, null, 2));
    
    categoryStats[categoryKey] = {
      name: category.name,
      products: products.length,
      groups: grouped.length
    };
    
    console.log(`   ✅ ${category.icon} ${category.name}: ${products.length} products → ${grouped.length} groups`);
  }
  
  // Create category index
  const categoryIndex = {
    total_products: totalProducts,
    categories: Object.entries(categoryStats).map(([key, stats]) => ({
      key,
      ...stats,
      ...CATEGORIES[key]
    })).sort((a, b) => b.products - a.products)
  };
  
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(categoryIndex, null, 2));
  console.log(`\n   ✅ Created category index`);
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total products: ${totalProducts}`);
  console.log(`Categories created: ${Object.keys(categoryStats).length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('\n✨ Done! Category catalogs are ready.');
}

function groupProductsByImage(products) {
  const groups = {};
  const usedIds = new Set();
  
  for (const product of products) {
    // Create group key from image or series name
    const groupKey = product.image || product.name || 'no-image';
    
    if (!groups[groupKey]) {
      // Generate unique group_id
      let baseId = `${product.catalog}-${sanitize(groupKey)}`;
      let group_id = baseId;
      let counter = 1;
      
      // Ensure uniqueness by appending counter if needed
      while (usedIds.has(group_id)) {
        group_id = `${baseId}-${counter}`;
        counter++;
      }
      usedIds.add(group_id);
      
      groups[groupKey] = {
        group_id,
        name: product.name,
        catalog: product.catalog,
        image: product.image,
        images: product.images,
        source_pdf: product.source_pdf,
        brand: product.brand,
        material: product.material,
        variants: []
      };
    }
    
    // Create a meaningful label for the variant
    // Priority: type (specific) > name (general) > SKU
    let variantLabel = product.sku;
    if (product.type && product.type !== product.name) {
      variantLabel = `${product.sku} - ${product.type}`;
    } else if (product.name) {
      variantLabel = `${product.sku} - ${product.name}`;
    }
    
    groups[groupKey].variants.push({
      sku: product.sku,
      label: variantLabel,
      page: product.page,
      properties: product.properties,
      attributes: product.attributes
    });
  }
  
  return Object.values(groups).map(group => ({
    ...group,
    variant_count: group.variants.length,
    default_variant_sku: group.variants[0]?.sku,
    media: group.image ? [{ role: 'main', url: group.image }] : []
  }));
}

function extractProperties(product) {
  const props = {};
  const propertyFields = [
    'debiet_m3_h', 'aansluiting', 'aanzuigdiepte_m', 'opv_hoogte_m',
    'lengte', 'spanning_v', 'vermogen_w', 'stroom_a', 'pomp_dia_mm',
    'pressure_max_bar', 'pressure_bar', 'flow_lpm', 'flow_m3_h',
    'power_w', 'voltage_v', 'rpm', 'weight_kg', 'dimensions_mm',
    'connection_size', 'diameter_mm', 'length_m', 'width_mm', 'height_mm'
  ];
  
  propertyFields.forEach(field => {
    if (product[field]) props[field] = product[field];
  });
  
  return props;
}

function extractAttributes(product) {
  const attrs = {};
  const attrFields = [
    'spec_liquid_temp_range', 'spec_temp_range', 'spec_max_pressure',
    'spec_application_desc', 'spec_housing', 'spec_product_variant',
    'application', 'color', 'finish', 'thread_type'
  ];
  
  attrFields.forEach(field => {
    if (product[field]) attrs[field] = product[field];
  });
  
  return attrs;
}

function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
}

generateCategoryCatalogs().catch(console.error);
