const fs = require('fs');
const path = require('path');

const SOURCE_JSON_DIR = path.resolve(process.cwd(), 'documents', 'Product_pdfs', 'json');

// Extract SKUs from image filename
// Pattern: __SKU1-SKU2-SKU3__v1.webp or __SKU1-SKU2-SKU3.webp
function extractSkusFromImagePath(imagePath) {
  if (!imagePath) return [];
  
  const filename = path.basename(imagePath);
  
  // Find the SKU segment (usually after series name, before version)
  // Examples:
  //   abs-bocht-90__ABSB02090-ABSB02590-ABSB03290__v1.webp
  //   pomp-specials__huishoudelijk-landbouw-in__02350025-X1106034.webp
  
  // Try pattern with version suffix
  let match = filename.match(/__([A-Z0-9][A-Z0-9+-]+)__v\d+\.webp$/i);
  if (!match) {
    // Try pattern without version suffix
    match = filename.match(/__([A-Z0-9][A-Z0-9+-]+)\.webp$/i);
  }
  
  if (match) {
    // Split by - but be careful with SKUs that contain -
    // SKUs are typically alphanumeric, split on - that separates SKUs
    const skuPart = match[1];
    return skuPart.split('-').map(s => s.trim().toUpperCase()).filter(Boolean);
  }
  
  return [];
}

// Check if a SKU is present in the image's SKU list
function skuInImage(sku, imagePath) {
  if (!sku || !imagePath) return false;
  
  const imageSkus = extractSkusFromImagePath(imagePath);
  const skuUpper = sku.toUpperCase();
  
  // Direct match
  if (imageSkus.includes(skuUpper)) return true;
  
  // Partial match (SKU might be truncated in filename)
  for (const imgSku of imageSkus) {
    if (imgSku.includes(skuUpper) || skuUpper.includes(imgSku)) return true;
  }
  
  // Also check if SKU appears anywhere in the filename
  const filenameUpper = imagePath.toUpperCase();
  if (filenameUpper.includes(skuUpper)) return true;
  
  return false;
}

// Check if SKU belongs to the same series as the image
function skuMatchesImageSeries(product, imagePath) {
  if (!imagePath) return false;
  
  const seriesId = (product.series_id || '').toLowerCase();
  const seriesName = (product.series_name || '').toLowerCase().replace(/[°\s]+/g, '-');
  const filename = path.basename(imagePath).toLowerCase();
  
  // Check if series appears in filename
  if (seriesId) {
    const seriesPart = seriesId.split('__').pop(); // Get last part after __
    if (seriesPart && filename.includes(seriesPart)) return true;
  }
  
  return false;
}

function validateProducts() {
  const issues = [];
  const stats = {
    totalProducts: 0,
    productsWithImages: 0,
    skuNotInImage: 0,
    multipleImages: 0
  };
  
  const jsonFiles = fs.readdirSync(SOURCE_JSON_DIR).filter(f => f.endsWith('.json'));
  
  console.log('Validating SKU-to-Image mapping...\n');
  
  for (const file of jsonFiles) {
    const filePath = path.join(SOURCE_JSON_DIR, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) continue;
      
      for (const product of data) {
        stats.totalProducts++;
        
        if (!product.sku) continue;
        
        const imagePath = product.image;
        if (!imagePath) continue;
        
        stats.productsWithImages++;
        
        // Rule 1: SKU should be in the image filename (same table)
        if (!skuInImage(product.sku, imagePath)) {
          // Check if at least the series matches
          const seriesMatches = skuMatchesImageSeries(product, imagePath);
          
          issues.push({
            type: 'SKU_NOT_IN_IMAGE',
            catalog: file,
            sku: product.sku,
            series_id: product.series_id,
            series_name: product.series_name,
            image: imagePath,
            image_skus: extractSkusFromImagePath(imagePath),
            series_matches: seriesMatches,
            message: seriesMatches 
              ? `SKU ${product.sku} not in image filename, but series matches`
              : `SKU ${product.sku} not in image filename and series doesn't match`
          });
          stats.skuNotInImage++;
        }
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
  
  return { issues, stats };
}

function main() {
  console.log('=== SKU-Image Mapping Validation ===\n');
  
  const { issues, stats } = validateProducts();
  
  console.log('Statistics:');
  console.log(`  Total products: ${stats.totalProducts}`);
  console.log(`  Products with images: ${stats.productsWithImages}`);
  console.log(`  SKU not in image filename: ${stats.skuNotInImage}`);
  
  if (issues.length === 0) {
    console.log('\n✅ All SKUs correctly mapped to their table images!');
    return;
  }
  
  // Separate critical issues (series doesn't match) from warnings (series matches but SKU not in filename)
  const critical = issues.filter(i => !i.series_matches);
  const warnings = issues.filter(i => i.series_matches);
  
  console.log(`\n❌ Found ${critical.length} critical issues (wrong table)`);
  console.log(`⚠️  Found ${warnings.length} warnings (same series, SKU not in filename)\n`);
  
  if (critical.length > 0) {
    console.log('\n## CRITICAL: SKUs assigned to wrong table images\n');
    
    // Group by catalog and image for cleaner output
    const byImage = {};
    for (const issue of critical) {
      const key = `${issue.catalog}|${issue.image}`;
      if (!byImage[key]) {
        byImage[key] = {
          catalog: issue.catalog,
          image: issue.image,
          image_skus: issue.image_skus,
          wrong_skus: []
        };
      }
      byImage[key].wrong_skus.push({
        sku: issue.sku,
        series_name: issue.series_name
      });
    }
    
    for (const [key, data] of Object.entries(byImage)) {
      console.log(`Catalog: ${data.catalog}`);
      console.log(`Image: ${data.image}`);
      console.log(`Image contains SKUs: ${data.image_skus.join(', ') || '(none detected)'}`);
      console.log(`Wrong SKUs assigned to this image:`);
      for (const ws of data.wrong_skus.slice(0, 10)) {
        console.log(`  - ${ws.sku} (${ws.series_name})`);
      }
      if (data.wrong_skus.length > 10) {
        console.log(`  ... and ${data.wrong_skus.length - 10} more`);
      }
      console.log('');
    }
  }
  
  // Write full report to file
  const outputPath = path.join(process.cwd(), 'sku-image-mapping-issues.json');
  fs.writeFileSync(outputPath, JSON.stringify({ critical, warnings, stats }, null, 2));
  console.log(`\nFull report written to: ${outputPath}`);
}

main();
