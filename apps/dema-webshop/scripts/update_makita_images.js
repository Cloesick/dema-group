const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/products_all_grouped.json'));

let updated = 0;
data.forEach(group => {
  if (group.catalog && group.catalog.toLowerCase().includes('makita') && group.media && group.media.length > 0) {
    // Get page number from first variant
    const page = group.variants && group.variants[0] ? (group.variants[0].page || group.variants[0].page_in_pdf) : null;
    if (page) {
      const pdfStem = group.catalog;
      const newUrl = `images/${pdfStem}/${pdfStem}__p${page}__rendered.webp`;
      group.media[0].url = newUrl;
      updated++;
    }
  }
});

fs.writeFileSync('public/data/products_all_grouped.json', JSON.stringify(data, null, 2));
console.log(`Updated ${updated} Makita product groups to use rendered images`);
