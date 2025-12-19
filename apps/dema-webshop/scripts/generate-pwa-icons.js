const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, '../public/assets/front/favicon/dema/favicon.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from:', inputPath);
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }
  
  // Also create apple-touch-icon
  const appleTouchPath = path.join(__dirname, '../public/apple-touch-icon.png');
  await sharp(inputPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(appleTouchPath);
  console.log('✓ Generated: apple-touch-icon.png');
  
  console.log('\nAll PWA icons generated successfully!');
}

generateIcons().catch(console.error);
