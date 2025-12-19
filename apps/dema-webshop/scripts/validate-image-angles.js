const fs = require('fs');
const path = require('path');

const SOURCE_JSON_DIR = path.resolve(process.cwd(), 'documents', 'Product_pdfs', 'json');

// Extract angle from image filename or series name
function extractAngleFromPath(imagePath) {
  if (!imagePath) return null;
  const lower = imagePath.toLowerCase();
  
  // Look for angle patterns in the path
  if (lower.includes('bocht-90') || lower.includes('bocht_90') || lower.includes('-90__') || lower.includes('_90_')) {
    return 90;
  }
  if (lower.includes('bocht-45') || lower.includes('bocht_45') || lower.includes('-45__') || lower.includes('_45_')) {
    return 45;
  }
  if (lower.includes('bocht-30') || lower.includes('bocht_30') || lower.includes('-30__') || lower.includes('_30_')) {
    return 30;
  }
  if (lower.includes('bocht-60') || lower.includes('bocht_60') || lower.includes('-60__') || lower.includes('_60_')) {
    return 60;
  }
  return null;
}

// Extract angle from SKU (last 2 digits if they're 30, 45, 60, or 90)
function extractAngleFromSku(sku) {
  if (!sku || typeof sku !== 'string') return null;
  const upper = sku.toUpperCase();
  
  // Pattern: SKU ends with angle (e.g., ABSB02090 -> 90)
  const match = upper.match(/(\d{2})$/);
  if (match) {
    const angle = parseInt(match[1], 10);
    if ([30, 45, 60, 90].includes(angle)) {
      return angle;
    }
  }
  return null;
}

// Extract angle from series_name or series_id
function extractAngleFromSeries(product) {
  const seriesName = (product.series_name || '').toLowerCase();
  const seriesId = (product.series_id || '').toLowerCase();
  const angle = product.angle;
  
  // Direct angle field
  if (angle) {
    const match = String(angle).match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  
  // From series name/id
  for (const text of [seriesName, seriesId]) {
    if (text.includes('90')) return 90;
    if (text.includes('45')) return 45;
    if (text.includes('30')) return 30;
    if (text.includes('60')) return 60;
  }
  
  return null;
}

// Check if product is an angled pipe (bocht)
function isAngledPipe(product) {
  const seriesName = (product.series_name || '').toLowerCase();
  const seriesId = (product.series_id || '').toLowerCase();
  
  return seriesName.includes('bocht') || seriesId.includes('bocht');
}

// Extract SKUs from image filename
function extractSkusFromImagePath(imagePath) {
  if (!imagePath) return [];
  
  // Pattern: __SKU1-SKU2-SKU3__v1.webp
  const filename = path.basename(imagePath);
  const match = filename.match(/__([A-Z0-9]+-[A-Z0-9-]+)__v?\d*\.webp$/i) ||
                filename.match(/__([A-Z0-9]+)__v?\d*\.webp$/i) ||
                filename.match(/__([A-Z0-9]+-[A-Z0-9-]+)\.webp$/i) ||
                filename.match(/__([A-Z0-9]+)\.webp$/i);
  
  if (match) {
    return match[1].split('-').map(s => s.trim().toUpperCase()).filter(Boolean);
  }
  return [];
}

function validateProducts() {
  const issues = [];
  const jsonFiles = fs.readdirSync(SOURCE_JSON_DIR).filter(f => f.endsWith('.json'));
  
  console.log('Validating image-to-SKU angle consistency...\n');
  
  for (const file of jsonFiles) {
    const filePath = path.join(SOURCE_JSON_DIR, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) continue;
      
      for (const product of data) {
        if (!isAngledPipe(product)) continue;
        
        const productAngle = extractAngleFromSeries(product);
        const skuAngle = extractAngleFromSku(product.sku);
        const imagePath = product.image;
        const imageAngle = extractAngleFromPath(imagePath);
        
        if (!imagePath || !productAngle) continue;
        
        // Check 1: Image angle vs Product series angle
        if (imageAngle && imageAngle !== productAngle) {
          issues.push({
            type: 'IMAGE_SERIES_MISMATCH',
            catalog: file,
            sku: product.sku,
            series_name: product.series_name,
            product_angle: productAngle,
            image_angle: imageAngle,
            image: imagePath,
            message: `Image shows ${imageAngle}° but product series is ${productAngle}°`
          });
        }
        
        // Check 2: SKUs in image filename should match the angle
        const imageSkus = extractSkusFromImagePath(imagePath);
        for (const imgSku of imageSkus) {
          const imgSkuAngle = extractAngleFromSku(imgSku);
          if (imgSkuAngle && imageAngle && imgSkuAngle !== imageAngle) {
            issues.push({
              type: 'IMAGE_SKU_ANGLE_MISMATCH',
              catalog: file,
              sku: product.sku,
              image_sku: imgSku,
              image_sku_angle: imgSkuAngle,
              image_path_angle: imageAngle,
              image: imagePath,
              message: `Image filename contains SKU ${imgSku} (${imgSkuAngle}°) but image path indicates ${imageAngle}°`
            });
          }
        }
        
        // Check 3: Product SKU angle vs series angle
        if (skuAngle && productAngle && skuAngle !== productAngle) {
          issues.push({
            type: 'SKU_SERIES_MISMATCH',
            catalog: file,
            sku: product.sku,
            sku_angle: skuAngle,
            series_angle: productAngle,
            series_name: product.series_name,
            message: `SKU ${product.sku} ends with ${skuAngle}° but series is ${productAngle}°`
          });
        }
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
  
  return issues;
}

function main() {
  console.log('=== Image Angle Validation ===\n');
  
  const issues = validateProducts();
  
  if (issues.length === 0) {
    console.log('✅ No angle mismatches found!');
    return;
  }
  
  console.log(`❌ Found ${issues.length} potential issues:\n`);
  
  // Group by type
  const byType = {};
  for (const issue of issues) {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  }
  
  for (const [type, typeIssues] of Object.entries(byType)) {
    console.log(`\n## ${type} (${typeIssues.length} issues)\n`);
    
    // Deduplicate by image path for cleaner output
    const seen = new Set();
    for (const issue of typeIssues) {
      const key = `${issue.image}|${issue.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      console.log(`- ${issue.message}`);
      console.log(`  Catalog: ${issue.catalog}`);
      console.log(`  SKU: ${issue.sku}`);
      if (issue.series_name) console.log(`  Series: ${issue.series_name}`);
      console.log(`  Image: ${issue.image}`);
      console.log('');
    }
  }
  
  // Write to file for reference
  const outputPath = path.join(process.cwd(), 'image-angle-issues.json');
  fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
  console.log(`\nFull report written to: ${outputPath}`);
}

main();
