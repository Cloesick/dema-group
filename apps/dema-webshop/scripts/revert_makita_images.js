const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('public/data/products_all_grouped.json'));

// Minimum file size in bytes for a "good" product image (5KB)
const MIN_IMAGE_SIZE = 5 * 1024;

// Get list of available images per page, preferring larger images (actual product photos)
function getAvailableImages(catalog) {
  const dir = `public/images/${catalog}`;
  if (!fs.existsSync(dir)) return {};
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp') && !f.includes('rendered'));
  const byPage = {};
  
  files.forEach(file => {
    const match = file.match(/__p(\d+)__/);
    if (match) {
      const page = parseInt(match[1]);
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Only include images larger than minimum size (filter out tiny icons)
      if (stat.size >= MIN_IMAGE_SIZE) {
        if (!byPage[page]) byPage[page] = [];
        byPage[page].push({ file, size: stat.size });
      }
    }
  });
  
  // Sort each page's images by file size (largest first = best quality product image)
  Object.keys(byPage).forEach(page => {
    byPage[page].sort((a, b) => b.size - a.size);
  });
  
  return byPage;
}

const catalogImages = {
  'makita-catalogus-2022-nl': getAvailableImages('makita-catalogus-2022-nl'),
  'makita-tuinfolder-2022-nl': getAvailableImages('makita-tuinfolder-2022-nl'),
};

let updated = 0;
let noImage = 0;
data.forEach(group => {
  if (group.catalog && group.catalog.toLowerCase().includes('makita') && group.media && group.media.length > 0) {
    const page = group.variants && group.variants[0] ? (group.variants[0].page || group.variants[0].page_in_pdf) : null;
    if (page) {
      const pdfStem = group.catalog;
      const pageImages = catalogImages[pdfStem]?.[page] || [];
      
      if (pageImages.length > 0) {
        // Use the largest image (best quality product photo)
        const bestImage = pageImages[0].file;
        const newUrl = `images/${pdfStem}/${bestImage}`;
        group.media[0].url = newUrl;
        updated++;
      } else {
        noImage++;
        console.log(`  No good image for page ${page} in ${pdfStem}`);
      }
    }
  }
});

fs.writeFileSync('public/data/products_all_grouped.json', JSON.stringify(data, null, 2));
console.log(`Updated ${updated} Makita product groups to use best quality images`);
console.log(`${noImage} products have no good image (page has only tiny icons)`);
