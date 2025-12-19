const fs = require('fs');
const path = require('path');

// Source directories
const SOURCE_JSON_DIR = path.resolve(process.cwd(), 'documents', 'Product_pdfs', 'json');

// Target directories
const TARGET_DATA_DIR = path.resolve(process.cwd(), 'public', 'data');
const TARGET_PRODUCTS_FILE = path.join(TARGET_DATA_DIR, 'products_for_shop.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function transformImagePath(imagePath) {
  if (!imagePath) return null;
  
  // Convert "images/pomp-specials/..." to "/api/images/pomp-specials/..."
  // This serves images dynamically from documents/Product_pdfs/images/
  if (imagePath.startsWith('images/')) {
    return '/api/' + imagePath;
  }
  // Already has /images/ prefix, convert to /api/images/
  if (imagePath.startsWith('/images/')) {
    return '/api' + imagePath;
  }
  // Unknown format, assume it's a relative path within images folder
  return '/api/images/' + imagePath;
}

function loadAndMergeJsonFiles() {
  const allProducts = [];
  const jsonFiles = fs.readdirSync(SOURCE_JSON_DIR).filter(f => f.endsWith('.json'));
  
  console.log(`Found ${jsonFiles.length} JSON files to process`);
  
  for (const file of jsonFiles) {
    const filePath = path.join(SOURCE_JSON_DIR, file);
    const catalogName = path.basename(file, '.json');
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        console.warn(`  Skipping ${file}: not an array`);
        continue;
      }
      
      if (data.length === 0) {
        console.warn(`  Skipping ${file}: empty array`);
        continue;
      }
      
      let validProducts = 0;
      for (const product of data) {
        // Skip products without a valid SKU
        if (!product.sku || typeof product.sku !== 'string' || product.sku.trim() === '') {
          continue;
        }
        
        // Transform image paths
        if (product.image) {
          product.image = transformImagePath(product.image);
          product.imageUrl = product.image; // Also set imageUrl for compatibility
        }
        
        if (Array.isArray(product.images)) {
          product.images = product.images.map(transformImagePath).filter(Boolean);
        }
        
        // Add catalog source for reference
        product.catalog = catalogName;
        product.pdf_source = product.source_pdf || `${catalogName}.pdf`;
        
        allProducts.push(product);
        validProducts++;
      }
      
      console.log(`  ${file}: ${validProducts} products`);
    } catch (err) {
      console.error(`  Error processing ${file}:`, err.message);
    }
  }
  
  return allProducts;
}

function main() {
  console.log('=== Syncing Product Data ===\n');
  console.log('Images are served dynamically via /api/images/\n');
  
  // Step 1: Validate source directory
  if (!fs.existsSync(SOURCE_JSON_DIR)) {
    console.error('Source JSON directory does not exist:', SOURCE_JSON_DIR);
    process.exit(1);
  }
  
  // Step 2: Ensure target directory exists
  ensureDir(TARGET_DATA_DIR);
  
  // Step 3: Merge JSON files
  console.log('Merging product JSON files...');
  const allProducts = loadAndMergeJsonFiles();
  
  // Step 5: Deduplicate by SKU (keep first occurrence)
  const seenSkus = new Set();
  const uniqueProducts = [];
  for (const product of allProducts) {
    const sku = product.sku.trim().toUpperCase();
    if (!seenSkus.has(sku)) {
      seenSkus.add(sku);
      uniqueProducts.push(product);
    }
  }
  
  console.log(`\nTotal products: ${allProducts.length}`);
  console.log(`Unique products (by SKU): ${uniqueProducts.length}`);
  console.log(`Duplicates removed: ${allProducts.length - uniqueProducts.length}`);
  
  // Step 6: Write combined products file
  fs.writeFileSync(TARGET_PRODUCTS_FILE, JSON.stringify(uniqueProducts, null, 2), 'utf-8');
  console.log(`\nWritten to: ${TARGET_PRODUCTS_FILE}`);
  
  console.log('\n=== Sync Complete ===');
}

main();
