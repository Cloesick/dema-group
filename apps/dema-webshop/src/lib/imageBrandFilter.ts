/**
 * Image Brand Filter
 * Detects and filters out images that contain brand names/logos
 */

// Known brand names to filter out
const BRAND_KEYWORDS = [
  'makita',
  'airpress',
  'kranzle',
  'kränzle',
  'metabo',
  'bosch',
  'dewalt',
  'milwaukee',
  'hilti',
  'festool',
  'ryobi',
  'black-decker',
  'stanley',
  'karcher',
  'kärcher',
  'nilfisk',
  'logo',
  'brand',
  'trademark',
];

/**
 * Check if an image path contains a brand name
 */
export function containsBrandName(imagePath: string): boolean {
  if (!imagePath) return false;
  
  const lowerPath = imagePath.toLowerCase();
  
  // Check if any brand keyword is in the path
  return BRAND_KEYWORDS.some(brand => lowerPath.includes(brand));
}

/**
 * Check if image filename suggests it's a brand/logo image
 * (Common patterns: logo, brand, cover, title page)
 */
export function isBrandImage(imagePath: string): boolean {
  if (!imagePath) return false;
  
  const lowerPath = imagePath.toLowerCase();
  const filename = lowerPath.split('/').pop() || '';
  
  // Patterns that suggest brand/logo images
  const brandPatterns = [
    'logo',
    'brand',
    'cover',
    'title',
    'front',
    'banner',
    'header',
    'trademark',
    '_p1__', // Often page 1 is a title page
    '__p1__',
  ];
  
  return brandPatterns.some(pattern => filename.includes(pattern));
}

/**
 * Check if catalog is a branded catalog that should have special handling
 */
export function isBrandedCatalog(catalogName: string): boolean {
  if (!catalogName) return false;
  
  const lowerCatalog = catalogName.toLowerCase();
  
  const brandedCatalogs = [
    'makita',
    'airpress',
    'kranzle',
    'kränzle',
  ];
  
  return brandedCatalogs.some(brand => lowerCatalog.includes(brand));
}

/**
 * Get a clean image path (non-branded) from a product group
 * Returns null if no suitable image found
 */
export function getCleanImagePath(productGroup: any): string | null {
  // Check primary image
  if (productGroup.image && !isBrandImage(productGroup.image)) {
    return productGroup.image;
  }
  
  // Check series image
  if (productGroup.series_image && !isBrandImage(productGroup.series_image)) {
    return productGroup.series_image;
  }
  
  // Check all_images array for a clean image
  if (productGroup.all_images && Array.isArray(productGroup.all_images)) {
    const cleanImage = productGroup.all_images.find(
      (img: string) => !isBrandImage(img)
    );
    if (cleanImage) return cleanImage;
  }
  
  // For branded catalogs, still return the image but mark it
  if (isBrandedCatalog(productGroup.catalog)) {
    return productGroup.image || productGroup.series_image || null;
  }
  
  // No clean image found
  return null;
}

/**
 * Filter product groups to only include those with non-branded images
 */
export function filterNonBrandedProducts(productGroups: any[]): any[] {
  return productGroups.filter(group => {
    const cleanImage = getCleanImagePath(group);
    return cleanImage !== null;
  });
}

/**
 * Get image display preference
 * Returns object with image path and whether to show it
 */
export function getImageDisplayInfo(productGroup: any): {
  imagePath: string | null;
  shouldDisplay: boolean;
  isBranded: boolean;
  fallbackReason?: string;
} {
  const cleanImage = getCleanImagePath(productGroup);
  
  if (!cleanImage) {
    return {
      imagePath: null,
      shouldDisplay: false,
      isBranded: true,
      fallbackReason: 'No non-branded image available',
    };
  }
  
  const isBranded = isBrandImage(cleanImage);
  
  return {
    imagePath: cleanImage,
    shouldDisplay: !isBranded,
    isBranded,
  };
}
