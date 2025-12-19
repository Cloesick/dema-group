const fs = require('fs');
const path = require('path');

// Configuration
const PDF_JSON_DIR = path.join(__dirname, '..', 'documents', 'Product_pdfs', 'json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');

// Catalog files to process
const catalogFiles = [
  'pomp-specials.json',
  'messing-draadfittingen.json',
  'rvs-draadfittingen.json',
  'slangkoppelingen.json',
  'pe-buizen.json',
  'rubber-slangen.json',
  'slangklemmen.json',
  'pu-afzuigslangen.json',
  'zwarte-draad-en-lasfittingen.json',
  'kunststof-afvoerleidingen.json',
  'verzinkte-buizen.json',
  'zuigerpompen.json',
  'plat-oprolbare-slangen.json',
  'makita-catalogus-2022-nl.json',
  'makita-tuinfolder-2022-nl.json',
  'kranzle-catalogus-2021-nl-1.json',
  'airpress-catalogus-eng.json',
  'airpress-catalogus-nl-fr.json',
  'bronpompen.json',
  'centrifugaalpompen.json',
  'dompelpompen.json',
  'drukbuizen.json',
  'catalogus-aandrijftechniek-150922.json',
  'digitale-versie-pompentoebehoren-compressed.json',
  'abs-persluchtbuizen.json'
];

/**
 * Group products by their primary image
 * Products sharing the same image will be grouped together for SKU dropdown
 */
function groupProductsByImage(products, catalogName) {
  const imageGroups = {};
  
  products.forEach(product => {
    // Get primary image (prefer 'image' over 'series_image')
    const primaryImage = product.image || product.series_image;
    
    if (!primaryImage) {
      console.log(`   ⚠️  No image for SKU: ${product.sku}`);
      return;
    }
    
    // Create group key from image path
    const imageKey = primaryImage.toLowerCase().trim();
    
    if (!imageGroups[imageKey]) {
      imageGroups[imageKey] = {
        image: primaryImage,
        series_image: product.series_image,
        all_images: product.images || [],
        catalog: catalogName,
        source_pdf: product.source_pdf,
        page: product.page,
        products: []
      };
    }
    
    // Add product to this image group
    imageGroups[imageKey].products.push({
      sku: product.sku,
      page: product.page,
      properties: extractProperties(product),
      raw: product // Keep original data for reference
    });
  });
  
  return Object.values(imageGroups);
}

/**
 * Extract all relevant properties from a product
 * Excludes internal/system fields
 */
function extractProperties(product) {
  const excludeKeys = [
    '_enriched', 'series_image', 'image', 'images',
    'sku', 'series_id', 'series_name', 'source_pdf', 'page'
  ];
  
  const properties = {};
  
  Object.entries(product).forEach(([key, value]) => {
    if (!excludeKeys.includes(key) && value !== null && value !== undefined && value !== '') {
      properties[key] = value;
    }
  });
  
  // Also include enriched data if useful
  if (product._enriched) {
    ['catalog_group', 'product_type', 'material', 'diameter_mm'].forEach(key => {
      if (product._enriched[key] && !properties[key]) {
        properties[key] = product._enriched[key];
      }
    });
  }
  
  return properties;
}

/**
 * Process a single catalog file
 */
async function processCatalog(catalogFile) {
  const inputPath = path.join(PDF_JSON_DIR, catalogFile);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skip: ${catalogFile} (not found)`);
    return null;
  }
  
  try {
    console.log(`📦 Processing: ${catalogFile}...`);
    
    // Read the catalog JSON
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    const products = JSON.parse(rawData);
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log(`   ⚠️  No products found in ${catalogFile}`);
      return null;
    }
    
    console.log(`   Found ${products.length} products`);
    
    // Group products by image
    const imageGroups = groupProductsByImage(products, catalogFile.replace('.json', ''));
    
    console.log(`   Created ${imageGroups.length} image-based groups`);
    
    // Generate output filename
    const baseName = catalogFile.replace('.json', '');
    const outputFile = `${baseName.replace(/-/g, '_')}_products.json`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    
    // Write grouped data
    fs.writeFileSync(outputPath, JSON.stringify(imageGroups, null, 2), 'utf-8');
    
    console.log(`   ✅ Saved: ${outputFile}`);
    
    return {
      catalog: catalogFile,
      totalProducts: products.length,
      imageGroups: imageGroups.length,
      outputFile
    };
  } catch (error) {
    console.error(`   ❌ Error processing ${catalogFile}:`, error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting image-based product grouping...\n');
  console.log(`📁 Input: ${PDF_JSON_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const results = [];
  
  for (const catalogFile of catalogFiles) {
    const result = await processCatalog(catalogFile);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total catalogs processed: ${results.length}`);
  console.log(`Total products: ${results.reduce((sum, r) => sum + r.totalProducts, 0).toLocaleString()}`);
  console.log(`Total image groups: ${results.reduce((sum, r) => sum + r.imageGroups, 0).toLocaleString()}`);
  console.log('='.repeat(60));
  
  console.log('\n✨ Done! Product groups are ready for the new card component.');
  console.log('📝 Each group contains all SKUs sharing the same product image.');
}

// Run
main().catch(console.error);
