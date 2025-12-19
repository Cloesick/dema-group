export interface Product {
  sku: string;
  pdf_source: string;
  source_pages: number[];
  product_category: string;
  description: string;
  absk_codes?: string[];
  pressure_min_bar?: number;
  pressure_max_bar?: number;
  dimensions_mm_list?: number[];
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  power_hp?: number;
  power_kw?: number;
  voltage_v?: number;
  flow_l_min_list?: number[];
  // Additional fields we'll add
  name?: string;
  shortDescription?: string;
  price?: number;
  imageUrl?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

// Extract structured specs from a free-text description using robust regexes.
// Only fields present in this file's Product interface are returned.
const extractSpecsFromDescription = (description: string): Partial<Product> => {
  const out: Partial<Product> = {};
  const desc = description ?? '';

  // Helpers
  const toNum = (s?: string) => {
    if (!s) return undefined;
    const n = parseFloat(s.replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  };

  // Patterns
  const num = '(\\d+(?:[.,]\\d+)?)';
  const rangeSep = '(?:\\s*(?:–|-|to)\\s*)';

  // Pressure (bar)
  const pressureRangeRe = new RegExp(`${num}${rangeSep}${num}\\s*bar\\b`, 'i');
  const pressureSingleRe = new RegExp(`${num}\\s*bar\\b`, 'i');
  const mPr = desc.match(pressureRangeRe);
  if (mPr) {
    const a = toNum(mPr[1]);
    const b = toNum(mPr[2]);
    if (a !== undefined) out.pressure_min_bar = a;
    if (b !== undefined) out.pressure_max_bar = b;
  } else {
    const mPs = desc.match(pressureSingleRe);
    if (mPs) {
      const v = toNum(mPs[1]);
      if (v !== undefined) out.pressure_max_bar = v;
    }
  }

  // Power (kW, HP)
  const kwRe = new RegExp(`${num}\\s*kW\\b`, 'i');
  const hpRe = new RegExp(`${num}\\s*HP\\b`, 'i');
  const mKw = desc.match(kwRe);
  if (mKw) out.power_kw = toNum(mKw[1]);
  const mHp = desc.match(hpRe);
  if (!mKw && mHp) out.power_hp = toNum(mHp[1]);

  // Voltage (V)
  const voltRe = /(\d{2,4})\s*V\b/i;
  const mV = desc.match(voltRe);
  if (mV) out.voltage_v = toNum(mV[1]);

  // PN rating -> treat as nominal pressure in bar (e.g., PN10 => 10 bar, PN7,5 => 7.5 bar)
  {
    const pnRe = /\bPN\s*([0-9]+(?:[.,][0-9]+)?)\b/gi;
    let m: RegExpExecArray | null;
    const pnVals: number[] = [];
    while ((m = pnRe.exec(desc)) !== null) {
      const v = toNum(m[1]);
      if (typeof v === 'number') pnVals.push(v);
    }
    if (pnVals.length) {
      const maxPN = Math.max(...pnVals);
      if (out.pressure_max_bar === undefined || (typeof out.pressure_max_bar === 'number' && maxPN > out.pressure_max_bar)) {
        out.pressure_max_bar = maxPN;
      }
      const minPN = Math.min(...pnVals);
      if (out.pressure_min_bar === undefined) out.pressure_min_bar = minPN;
    }
  }

  // ABSK pattern extraction: ^(ABSK\d+) (\d+ mm) (\d+ bar) (ABSK\d+) (\d+ mm) (\d+ bar)
  // Also support single entries anywhere in text
  const extraDims: number[] = [];
  const barsFromAbsk: number[] = [];
  const abskCodes: string[] = [];
  {
    const pairRe = /(?:^|\n)\s*(ABSK\d+)\s+(\d+)\s*mm\s+(\d+)\s*bar\s+(ABSK\d+)\s+(\d+)\s*mm\s+(\d+)\s*bar/gi;
    let m: RegExpExecArray | null;
    while ((m = pairRe.exec(desc)) !== null) {
      if (m[1]) abskCodes.push(m[1]);
      if (m[4]) abskCodes.push(m[4]);
      const d1 = toNum(m[2]);
      const b1 = toNum(m[3]);
      const d2 = toNum(m[5]);
      const b2 = toNum(m[6]);
      if (typeof d1 === 'number') extraDims.push(d1);
      if (typeof d2 === 'number') extraDims.push(d2);
      if (typeof b1 === 'number') barsFromAbsk.push(b1);
      if (typeof b2 === 'number') barsFromAbsk.push(b2);
    }
    const singleRe = /(ABSK\d+)\s+(\d+)\s*mm\s+(\d+)\s*bar/gi;
    while ((m = singleRe.exec(desc)) !== null) {
      if (m[1]) abskCodes.push(m[1]);
      const d = toNum(m[2]);
      const b = toNum(m[3]);
      if (typeof d === 'number') extraDims.push(d);
      if (typeof b === 'number') barsFromAbsk.push(b);
    }
    if (barsFromAbsk.length) {
      const minB = Math.min(...barsFromAbsk);
      const maxB = Math.max(...barsFromAbsk);
      if (out.pressure_min_bar === undefined) out.pressure_min_bar = minB;
      if (out.pressure_max_bar === undefined) out.pressure_max_bar = maxB;
    }
    if (abskCodes.length && !('absk_codes' in out)) {
      const uniqueCodes = Array.from(new Set(abskCodes));
      (out as any).absk_codes = uniqueCodes;
    }
  }

  // Dimensions L×W×H in mm
  const lwhRe = new RegExp(`${num}\\s*mm\\s*[x×]\\s*${num}\\s*mm(?:\\s*[x×]\\s*${num}\\s*mm)?`, 'i');
  const mLwh = desc.match(lwhRe);
  if (mLwh) {
    const a = toNum(mLwh[1]);
    const b = toNum(mLwh[2]);
    const c = toNum(mLwh[3]);
    if (a !== undefined) out.length_mm = a;
    if (b !== undefined) out.width_mm = b;
    if (c !== undefined) out.height_mm = c;
  }

  // Dimensions list (collect all ... mm)
  const mmAll: number[] = [];
  {
    const mmRe = new RegExp(`${num}\\s*mm\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = mmRe.exec(desc)) !== null) {
      const v = toNum(m[1]);
      if (typeof v === 'number') mmAll.push(v);
    }
  }
  // Merge ABSK-derived dimensions
  for (const d of extraDims) mmAll.push(d);
  if (mmAll.length && !out.dimensions_mm_list) {
    // Deduplicate and sort ascending
    const unique = Array.from(new Set(mmAll));
    unique.sort((a, b) => a - b);
    out.dimensions_mm_list = unique;
  }

  // Flow list (L/min) collect common values
  const lminAll: number[] = [];
  {
    const lminRe = new RegExp(`${num}\\s*(?:L\\/?min|l\\/?min)\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = lminRe.exec(desc)) !== null) {
      const v = toNum(m[1]);
      if (typeof v === 'number') lminAll.push(v);
    }
  }
  if (lminAll.length) out.flow_l_min_list = Array.from(new Set(lminAll));

  return out;
};

export const normalizeProduct = (product: any): Product => {
  // Return a minimal valid product if input is invalid
  if (!product || typeof product !== 'object') {
    return {
      sku: 'unknown',
      pdf_source: '',
      source_pages: [],
      product_category: 'unknown',
      description: 'Invalid product data',
      name: 'Unknown Product',
      shortDescription: 'No description available',
      price: 0,
      imageUrl: getImageUrl(undefined),
      inStock: false,
      rating: 0,
      reviewCount: 0
    };
  }
  
  try {
    const description = product.description || 'No description available';

    let derivedName: string | undefined;
    let derivedRemainder: string | undefined;
    const needsHogedruk =
      typeof product.product_category === 'string' && /hogedrukreiniger/i.test(product.product_category || '')
      || /hogedrukreiniger|hogedrukreinigers?/i.test(description);
    if (needsHogedruk) {
      const re = /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s./|~-]+?)\s+([^\s].*)$/;
      const m = description.match(re);
      if (m) {
        derivedName = m[1].trim();
        derivedRemainder = m[2].trim();
      }
    }

    const baseLine = description.split('\n')[0] || 'Unnamed Product';
    const computedNameSource = derivedName || baseLine;
    const name = computedNameSource.length > 50
      ? `${computedNameSource.substring(0, 47)}...`
      : computedNameSource;

    const rawShort = derivedRemainder || description;
    const shortDescription = rawShort.length > 150
      ? `${rawShort.substring(0, 147)}...`
      : rawShort;

    // Generate a placeholder price based on SKU and category
    const sku = product.sku || 'unknown';
    let category = product.product_category || '';

    // Try to infer category from uppercase heading line in description if missing
    if (!category) {
      const lines = description.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean) as string[];
      const upperLine = lines.find((l: string) => l.length >= 5 && l.length <= 90 && l === l.toUpperCase());
      if (upperLine) category = upperLine;
    }
    if (!category) category = 'unknown';
    const price = generatePrice(sku, category);

    // Parse description into structured fields (do not override explicit input fields)
    const parsed = extractSpecsFromDescription(description);

    // Collect matched SKUs from description (does not override main sku)
    const matchedSkus: string[] = (() => {
      const acc = new Set<string>();
      const patterns: RegExp[] = [
        /(ABSK|ABST|ABSM|ABSVM|ABSP|ABSI|ABSRI|ABSBK|ABSV|ABSW|ABSON)[0-9A-Z]+/g,
        /\bDB[0-9]{5}\b/g,
        /\bHDBU[HR][0-9A-Z]+\b/g,
        /\b[0-9]{10}\b/g,
      ];
      for (const re of patterns) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(description)) !== null) {
          acc.add(m[0]);
        }
      }
      const list = Array.from(acc);
      return list.length ? list : [];
    })();

    return {
      sku,
      pdf_source: product.pdf_source || '',
      source_pages: Array.isArray(product.source_pages) ? product.source_pages : [],
      product_category: category,
      description: description,
      ...(matchedSkus.length ? { matched_skus: matchedSkus } : {}),
      ...(Array.isArray(product.absk_codes) && { absk_codes: product.absk_codes }),
      ...(
        !Array.isArray(product.absk_codes) && Array.isArray((parsed as any).absk_codes)
          ? { absk_codes: (parsed as any).absk_codes as string[] }
          : {}
      ),
      // Prefer explicit fields from input, else parsed values
      ...(product.pressure_min_bar !== undefined && { pressure_min_bar: Number(product.pressure_min_bar) }),
      ...(product.pressure_max_bar !== undefined && { pressure_max_bar: Number(product.pressure_max_bar) }),
      ...(
        product.pressure_min_bar === undefined && parsed.pressure_min_bar !== undefined
          ? { pressure_min_bar: parsed.pressure_min_bar }
          : {}
      ),
      ...(
        product.pressure_max_bar === undefined && parsed.pressure_max_bar !== undefined
          ? { pressure_max_bar: parsed.pressure_max_bar }
          : {}
      ),
      ...(product.dimensions_mm_list && { dimensions_mm_list: product.dimensions_mm_list }),
      ...(
        !product.dimensions_mm_list && parsed.dimensions_mm_list
          ? { dimensions_mm_list: parsed.dimensions_mm_list }
          : {}
      ),
      ...(product.length_mm !== undefined && { length_mm: Number(product.length_mm) }),
      ...(product.width_mm !== undefined && { width_mm: Number(product.width_mm) }),
      ...(product.height_mm !== undefined && { height_mm: Number(product.height_mm) }),
      ...(
        product.length_mm === undefined && parsed.length_mm !== undefined
          ? { length_mm: parsed.length_mm }
          : {}
      ),
      ...(
        product.width_mm === undefined && parsed.width_mm !== undefined
          ? { width_mm: parsed.width_mm }
          : {}
      ),
      ...(
        product.height_mm === undefined && parsed.height_mm !== undefined
          ? { height_mm: parsed.height_mm }
          : {}
      ),
      ...(product.power_hp !== undefined && { power_hp: Number(product.power_hp) }),
      ...(product.power_kw !== undefined && { power_kw: Number(product.power_kw) }),
      ...(
        product.power_kw === undefined && parsed.power_kw !== undefined
          ? { power_kw: parsed.power_kw }
          : {}
      ),
      ...(
        product.power_kw === undefined && product.power_hp === undefined && parsed.power_hp !== undefined
          ? { power_hp: parsed.power_hp }
          : {}
      ),
      ...(product.voltage_v !== undefined && { voltage_v: Number(product.voltage_v) }),
      ...(
        product.voltage_v === undefined && parsed.voltage_v !== undefined
          ? { voltage_v: parsed.voltage_v }
          : {}
      ),
      ...(product.flow_l_min_list && { flow_l_min_list: product.flow_l_min_list }),
      ...(
        !product.flow_l_min_list && parsed.flow_l_min_list
          ? { flow_l_min_list: parsed.flow_l_min_list }
          : {}
      ),
      name,
      shortDescription,
      price,
      imageUrl: getImageUrl(product),
      inStock: true, // Default to true, could be calculated based on inventory
      rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
      reviewCount: Math.floor(Math.random() * 50) // Random review count up to 50
    };
  } catch (error) {
    console.error('Error normalizing product:', error, product);
    // Return a minimal valid product in case of any error
    return {
      sku: product?.sku || 'error',
      pdf_source: product?.pdf_source || '',
      source_pages: Array.isArray(product?.source_pages) ? product.source_pages : [],
      product_category: product?.product_category || 'error',
      description: 'Error loading product data',
      name: product?.name || 'Error Loading Product',
      shortDescription: 'There was an error loading this product',
      price: 0,
      imageUrl: getImageUrl(undefined),
      inStock: false,
      rating: 0,
      reviewCount: 0
    };
  }
};

const generatePrice = (sku: string, category: string): number => {
  // Simple hash function to generate consistent prices based on SKU
  const hash = sku.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Base price based on category
  let basePrice = 0;
  if (category.includes('COMPRESSOR')) {
    basePrice = 500 + (hash % 5000);
  } else if (category.includes('BUIZEN')) {
    basePrice = 5 + (hash % 200);
  } else if (category.includes('TOOLS')) {
    basePrice = 20 + (hash % 1000);
  } else {
    basePrice = 10 + (hash % 200);
  }
  
  // Round to nearest 0.99
  return Math.round((basePrice - 0.01) * 100) / 100;
};

const getImageUrl = (product?: Product | null): string => {
  // Default SVG placeholder
  const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZmlGw9IiNmM2Y0ZjYiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
  
  // If product is not provided, return default placeholder
  if (!product) {
    return defaultPlaceholder;
  }
  
  // If the product has an explicit image URL, prefer it
  const possibleImage: unknown = (product as any)?.image;
  if (typeof possibleImage === 'string' && possibleImage.length > 0) {
    return possibleImage;
  }

  // Fallback to imageUrl (used by normalized products) if available
  const imageUrl: unknown = (product as any)?.imageUrl;
  if (typeof imageUrl === 'string' && imageUrl.length > 0) {
    return imageUrl;
  }

  // Fallback to media array from products_for_shop.json
  const media = (product as any)?.media;
  if (Array.isArray(media) && media.length > 0) {
    const mainMedia = media.find((m: any) => m && m.role === 'main') || media[0];
    if (mainMedia && typeof mainMedia.url === 'string' && mainMedia.url.length > 0) {
      return mainMedia.url;
    }
  }
  
  try {
    // Generate a simple SVG placeholder with the product name
    const productName = product.name || product.sku || 'Product';
    const encodedName = encodeURIComponent(productName.substring(0, 30));
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#9ca3af" dy=".3em">${encodedName}</text>
      </svg>
    `.trim().replace(/\s+/g, ' ');
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return defaultPlaceholder;
  }
};

export const filterProducts = (
  products: Product[], 
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minPressure?: number;
    maxPressure?: number;
    searchTerm?: string;
  }
): Product[] => {
  return products.filter(product => {
    // Category filter
    if (filters.category && product.product_category !== filters.category) {
      return false;
    }
    
    // Price range filter
    if (filters.minPrice && (product.price || 0) < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && (product.price || 0) > filters.maxPrice) {
      return false;
    }
    
    // Pressure range filter
    if (filters.minPressure && (product.pressure_max_bar || 0) < filters.minPressure) {
      return false;
    }
    if (filters.maxPressure && (product.pressure_min_bar || 0) > filters.maxPressure) {
      return false;
    }
    
    // Search term filter (searches in name, description, and SKU)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};

export const getUniqueCategories = (products: Product[]): string[] => {
  const categories = new Set<string>();
  products.forEach(product => {
    if (product.product_category) {
      categories.add(product.product_category);
    }
  });
  return Array.from(categories).sort();
};
