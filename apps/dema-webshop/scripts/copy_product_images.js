const fs = require('fs');
const path = require('path');

/**
 * Copy product images from documents/Product_pdfs/images to public/images
 * This makes them accessible to the web server
 */

const SOURCE_DIR = path.join(__dirname, '..', 'documents', 'Product_pdfs', 'images');
const TARGET_DIR = path.join(__dirname, '..', 'public', 'images');

/**
 * Recursively copy directory
 */
function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Read source directory
  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Copying product images...\n');
  console.log(`📁 Source: ${SOURCE_DIR}`);
  console.log(`📁 Target: ${TARGET_DIR}\n`);

  try {
    // Check if source exists
    if (!fs.existsSync(SOURCE_DIR)) {
      console.error('❌ Source directory not found!');
      process.exit(1);
    }

    // Count items before
    const catalogs = fs.readdirSync(SOURCE_DIR);
    console.log(`📂 Found ${catalogs.length} catalog image folders\n`);

    // Copy all images
    console.log('⏳ Copying images...');
    copyDirectory(SOURCE_DIR, TARGET_DIR);

    // Count results
    let totalImages = 0;
    catalogs.forEach(catalog => {
      const catalogPath = path.join(TARGET_DIR, catalog);
      if (fs.existsSync(catalogPath)) {
        const images = fs.readdirSync(catalogPath);
        console.log(`  ✅ ${catalog}: ${images.length} images`);
        totalImages += images.length;
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Copied ${catalogs.length} catalog folders`);
    console.log(`✅ Total images: ${totalImages.toLocaleString()}`);
    console.log(`📁 Images now available at: /images/[catalog]/[image].webp`);
    console.log('='.repeat(60));
    console.log('\n🎉 Product images are now accessible to the web server!');

  } catch (error) {
    console.error('❌ Error copying images:', error.message);
    process.exit(1);
  }
}

// Run
main().catch(console.error);
