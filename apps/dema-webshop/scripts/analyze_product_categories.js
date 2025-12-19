const fs = require('fs');
const path = require('path');

// Configuration
const PDF_JSON_DIR = path.join(__dirname, '..', 'documents', 'Product_pdfs', 'json');

// Main category definitions
const CATEGORY_MAPPINGS = {
  // Power Tools
  'power_tools': ['drill', 'saw', 'grinder', 'sander', 'polisher', 'router', 'planer', 'trimmer', 'impact', 'hammer', 'screwdriver', 'wrench'],
  
  // Garden Tools
  'garden_tools': ['lawn', 'mower', 'hedge', 'trimmer', 'blower', 'chainsaw', 'grass', 'garden', 'cultivator', 'tiller'],
  
  // Compressors & Air Tools
  'compressors': ['compressor', 'compressed_air', 'air_compressor', 'luchtcompressor'],
  
  // Pumps
  'pumps': ['pump', 'pomp', 'submersible', 'centrifugal', 'well_pump', 'drainage', 'bronpomp', 'dompelpomp', 'zuigerpomp'],
  
  // Pipes & Tubes
  'pipes': ['pipe', 'tube', 'buizen', 'buis', 'leiding', 'drukbuis', 'afvoerleiding'],
  
  // Hoses
  'hoses': ['hose', 'slang', 'slangen', 'afzuigslang'],
  
  // Fittings & Connections
  'fittings': ['fitting', 'koppeling', 'connector', 'adapter', 'elbow', 'tee', 'draadfitting'],
  
  // Clamps
  'clamps': ['clamp', 'klem', 'klemmen', 'slangklem'],
  
  // Pressure Washers
  'pressure_washers': ['pressure_washer', 'hogedrukreiniger', 'kranzle'],
  
  // Accessories
  'accessories': ['accessory', 'toebehoren', 'battery', 'accu', 'charger', 'case', 'bag']
};

// Material types
const MATERIALS = ['abs', 'pe', 'pvc', 'pp', 'pu', 'rubber', 'brass', 'messing', 'rvs', 'stainless', 'galvanized', 'verzinkt', 'zwart'];

function categorizeProduct(product) {
  const searchText = [
    product.type,
    product.product_type,
    product.catalog_group,
    product.application,
    product.series_name,
    product.source_pdf
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Check each category
  for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category;
    }
  }
  
  // Check if it's a material-based product (likely pipe/fitting)
  if (MATERIALS.some(material => searchText.includes(material))) {
    if (searchText.includes('pipe') || searchText.includes('buis')) return 'pipes';
    if (searchText.includes('fitting') || searchText.includes('draad')) return 'fittings';
  }
  
  return 'other';
}

function getMaterial(product) {
  const searchText = [
    product.material,
    product.type,
    product.product_type,
    product.source_pdf
  ].filter(Boolean).join(' ').toLowerCase();
  
  for (const material of MATERIALS) {
    if (searchText.includes(material)) {
      return material.toUpperCase();
    }
  }
  
  return null;
}

async function analyzeCategories() {
  console.log('🔍 Analyzing product categories...\n');
  
  const files = fs.readdirSync(PDF_JSON_DIR).filter(f => f.endsWith('.json'));
  const categoryCounts = {};
  const categoryExamples = {};
  const materialCounts = {};
  
  let totalProducts = 0;
  
  for (const file of files) {
    const filePath = path.join(PDF_JSON_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!Array.isArray(data)) continue;
    
    for (const product of data) {
      totalProducts++;
      const category = categorizeProduct(product);
      const material = getMaterial(product);
      
      // Count categories
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      
      // Store examples
      if (!categoryExamples[category]) {
        categoryExamples[category] = [];
      }
      if (categoryExamples[category].length < 5) {
        categoryExamples[category].push({
          sku: product.sku,
          type: product.type || product.product_type,
          source: file
        });
      }
      
      // Count materials
      if (material) {
        materialCounts[material] = (materialCounts[material] || 0) + 1;
      }
    }
  }
  
  // Print results
  console.log('📊 CATEGORY ANALYSIS');
  console.log('='.repeat(80));
  console.log(`Total Products: ${totalProducts}\n`);
  
  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [category, count] of sortedCategories) {
    const percentage = ((count / totalProducts) * 100).toFixed(1);
    console.log(`\n${category.toUpperCase()}: ${count} products (${percentage}%)`);
    console.log('-'.repeat(60));
    
    if (categoryExamples[category]) {
      categoryExamples[category].slice(0, 3).forEach(ex => {
        console.log(`  • ${ex.sku} | ${ex.type || 'N/A'} | ${ex.source}`);
      });
    }
  }
  
  console.log('\n\n📦 MATERIAL ANALYSIS');
  console.log('='.repeat(80));
  const sortedMaterials = Object.entries(materialCounts)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [material, count] of sortedMaterials) {
    const percentage = ((count / totalProducts) * 100).toFixed(1);
    console.log(`${material}: ${count} products (${percentage}%)`);
  }
  
  // Save results
  const results = {
    total_products: totalProducts,
    categories: categoryCounts,
    materials: materialCounts,
    examples: categoryExamples
  };
  
  const outputPath = path.join(__dirname, '..', 'category_analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Analysis saved to: category_analysis.json`);
}

analyzeCategories().catch(console.error);
