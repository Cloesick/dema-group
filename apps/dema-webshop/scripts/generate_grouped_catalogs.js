const fs = require('fs');
const path = require('path');

// Configuration
const PDF_JSON_DIR = path.join(__dirname, '..', 'documents', 'Product_pdfs', 'json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const IMAGES_BASE_PATH = 'documents/Product_pdfs/images';

// Catalog mapping
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

// Helper to clean and normalize strings
function cleanString(str) {
  if (!str) return '';
  return str.toString().trim();
}

// Group products by IMAGE primarily (to merge all SKUs under same image)
// This ensures 1 card per unique image with all related SKUs in the dropdown
function groupProducts(products, catalogName) {
  const groups = {};
  
  products.forEach(product => {
    // Use image path as PRIMARY grouping key
    // This merges all products sharing the same image into one group
    const imagePath = product.image || '';
    const pageNum = product.page || 0;
    
    // Fallback grouping for products without images: use series + page
    const seriesId = product.series_id || 
                     product.series_name || 
                     product.type || 
                     product.family_id || 
                     'ungrouped';
    
    // Primary key is image path; fallback to series+page if no image
    let groupKey;
    if (imagePath) {
      groupKey = imagePath.replace(/[^a-z0-9]+/gi, '-');
    } else {
      groupKey = cleanString(seriesId).toLowerCase().replace(/[^a-z0-9]+/g, '-') + `__page-${pageNum}`;
    }
    
    if (!groups[groupKey]) {
      const seriesName = product.series_name || product.type || seriesId;
      const displayName = pageNum > 0 ? `${seriesName} (Page ${pageNum})` : seriesName;
      groups[groupKey] = {
        group_id: `${catalogName.replace('.json', '')}-${groupKey}`,
        name: displayName,
        series_id: seriesId,
        series_name: seriesName,
        series_names: [seriesName], // Track all series names for merged groups
        family: product.family_id || product.series_id || 'General',
        catalog: catalogName.replace('.json', ''),
        source_pdf: product.source_pdf || catalogName,
        brand: extractBrand(catalogName),
        category: product.catalog_group || product.application || 'Products',
        variants: [],
        images: []
      };
    } else {
      // Track additional series names when merging groups
      const seriesName = product.series_name || product.type || seriesId;
      if (!groups[groupKey].series_names.includes(seriesName)) {
        groups[groupKey].series_names.push(seriesName);
        // Update display name to show all merged series
        const pageNum = product.page || 0;
        groups[groupKey].name = groups[groupKey].series_names.join(' / ') + (pageNum > 0 ? ` (Page ${pageNum})` : '');
      }
    }
    
    // Add variant
    const variant = {
      sku: product.sku,
      label: product.series_name || product.type || product.sku,
      page: product.page,
      page_in_pdf: product.page,
      properties: extractProperties(product),
      attributes: extractAttributes(product)
    };
    
    groups[groupKey].variants.push(variant);
    
    // Collect images
    if (product.image) {
      const imgPath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
      if (!groups[groupKey].images.includes(imgPath)) {
        groups[groupKey].images.push(imgPath);
      }
    }
    if (product.series_image) {
      const seriesImagePath = product.series_image.startsWith('/') ? product.series_image.substring(1) : product.series_image;
      if (!groups[groupKey].images.includes(seriesImagePath)) {
        groups[groupKey].images.unshift(seriesImagePath); // Series image first
      }
    }
  });
  
  // Convert to array and calculate stats
  return Object.values(groups).map(group => ({
    ...group,
    variant_count: group.variants.length,
    default_variant_sku: group.variants[0]?.sku,
    media: group.images.length > 0 ? [{
      role: 'main',
      url: group.images[0]
    }] : []
  }));
}

// Extract brand from catalog name
function extractBrand(catalogName) {
  const name = catalogName.toLowerCase();
  if (name.includes('makita')) return 'Makita';
  if (name.includes('airpress')) return 'Airpress';
  if (name.includes('kranzle') || name.includes('kränzle')) return 'Kränzle';
  if (name.includes('dema')) return 'Dema';
  return 'Various';
}

// Extract product properties
function extractProperties(product) {
  const props = {};
  
  // Common properties to extract - expanded list
  const propertyFields = [
    // Basic info
    'type', 'maat', 'size', 'werkdruk', 'angle', 'bestelnr',
    // Pump properties
    'debiet_m3_h', 'aansluiting', 'aanzuigdiepte_m', 'aanzuig', 'steek',
    'opv_hoogte_m', 'opvoerhoogte_m',
    'lengte', 'spanning_v', 'vermogen_kw', 'vermogen_w', 'stroom_a', 'pomp_dia_mm',
    'vermogen_pk',
    // Technical specs
    'pressure_max_bar', 'pressure_bar', 'flow_lpm', 'flow_m3_h',
    'power_w', 'voltage_v', 'rpm', 'weight_kg', 'dimensions_mm',
    'material', 'connection_size', 'diameter_mm', 'length_m',
    'width_mm', 'height_mm', 'depth_mm', 'capacity_l',
    // Pipe/fitting properties
    'dn', 'od', 'id', 'wall_thickness', 'thread_size', 'thread_type',
    'pressure_rating', 'temperature_range', 'color', 'finish',
    // Additional fields from PDFs
    'buitendiameter', 'binnendiameter', 'wanddikte', 'lengte_mm',
    'gewicht', 'inhoud', 'capaciteit', 'vermogen', 'spanning',
    'frequentie', 'toerental', 'aansluitmaat', 'materiaal',
    // Normalized fields from analyze_product_pdfs.py
    'length_mm', 'width_mm', 'height_mm', 'thickness_mm', 'wall_thickness_mm',
    'pressure_bar', 'max_pressure_bar', 'connection', 'thread', 'thread_female', 'thread_male',
    'flow_rate', 'capacity', 'volume', 'volume_l', 'socket_sizes',
    'material_name', 'seal_material', 'seal_material_name', 'connection_type', 'sku_series',
    // PU slangen / hose properties
    'binnen_dia_mm', 'wanddikte_mm', 'vacu_m_bar', 'buigradius', 'gewicht_g_m', 'rollengte',
    // Generic diameter/dimension fields
    'diameter', 'diameter_mm', 'inner_diameter', 'outer_diameter', 'wall_thickness',
    'vacuum_bar', 'bend_radius', 'weight_g_m', 'roll_length',
    // Price fields
    'price_excl_btw', 'price_incl_btw',
    // Makita-specific properties
    'voltage_v', 'voltage_total_v', 'power_kw', 'power_w', 'torque_nm', 'battery_model', 'charger_model',
    // Makita tool specs from PDF
    'model', 'nagelkop', 'doorsnede_nagel', 'lengte_nagel', 'spanning', 'toerental', 'slagkracht',
    'boorkop', 'max_koppel', 'boordiameter', 'schroefdiameter', 'zaagblad', 'snijdiepte',
    'zaagcapaciteit', 'slijpschijf', 'afkortzaag', 'kettingzaag', 'bladlengte', 'snijbreedte',
    'maaibreedte', 'maailengte', 'opvangzak', 'luchtsnelheid', 'luchtvolume', 'zuigkracht',
    'werkdruk', 'max_druk', 'tankinhoud', 'debiet', 'opvoerhoogte', 'aanzuigdiepte',
    'accu', 'lader', 'eleverde_accu_s', 'bijgeleverde_lader', 'gewicht',
    'agdiepte_90', 'gbreedte_90', 'dxt', 'aws'
  ];
  
  propertyFields.forEach(field => {
    if (product[field] !== undefined && product[field] !== null && product[field] !== '') {
      props[field] = product[field];
    }
  });

  // Collapse dynamic PDF headers that include sample values into stable keys.
  // Example keys seen in zuigerpompen.json: spanning_v_1x230v, vermogen_kw_0_37, debiet_m3_h_1_5_m3_h
  const dynamicKeyToStable = [
    { re: /^spanning_v_.+/i, stable: 'spanning_v' },
    { re: /^vermogen_kw_.+/i, stable: 'vermogen_kw' },
    { re: /^debiet_m3_h_.+/i, stable: 'debiet_m3_h' },
    { re: /^opv_hoogte_.+/i, stable: 'opv_hoogte_m' },
    { re: /^type_.+/i, stable: 'type' },
  ];

  for (const [k, v] of Object.entries(product)) {
    if (v === undefined || v === null || v === '') continue;
    for (const rule of dynamicKeyToStable) {
      if (rule.re.test(k)) {
        if (!props[rule.stable]) {
          props[rule.stable] = v;
        }
        break;
      }
    }
  }

  const normalizeUnitValue = (key, value) => {
    if (value === undefined || value === null) return value;
    let s = String(value).trim();
    if (!s) return s;

    const hasUnitLike = (re) => re.test(s);
    const isMostlyNumeric = /^[-+]?\d+(?:[\.,]\d+)?(?:\s*[-–]\s*\d+(?:[\.,]\d+)?)?$/.test(s);

    // Voltage
    if (key === 'spanning_v') {
      // Values often come like "1x230V" or "3x400V" (no word boundary), so treat any 'V' as already-unit.
      if (!hasUnitLike(/v|volt/i) && /\d/.test(s)) return `${s} V`;
      return s;
    }

    // Power
    if (key === 'vermogen_kw') {
      if (!hasUnitLike(/\bkW\b/i) && isMostlyNumeric) return `${s} kW`;
      return s;
    }

    // Horsepower
    if (key === 'vermogen_pk') {
      if (!hasUnitLike(/\bpk\b/i) && isMostlyNumeric) return `${s} pk`;
      return s;
    }

    // Flow
    if (key === 'debiet_m3_h') {
      if (!hasUnitLike(/m\s*3\s*\/?\s*h|m³\s*\/?\s*h/i) && /\d/.test(s)) return `${s} m3/h`;
      return s;
    }

    // Heights/depths
    if (key === 'opvoerhoogte_m' || key === 'aanzuigdiepte_m' || key === 'opv_hoogte_m') {
      if (!hasUnitLike(/\bm\b/i) && isMostlyNumeric) return `${s} m`;
      return s;
    }

    // Connections (inch)
    if (key === 'aanzuig' || key === 'steek') {
      // Many PDFs already contain inch symbol (" or ”). Only add if it's numeric and unit-less.
      if (!hasUnitLike(/["”′]|\binch\b/i) && isMostlyNumeric) return `${s}"`;
      return s;
    }

    return s;
  };

  for (const [k, v] of Object.entries(props)) {
    props[k] = normalizeUnitValue(k, v);
  }

  // Compatibility: some outputs used length_mm to represent suction depth in meters for pumps.
  if (props.length_mm && !props.aanzuigdiepte_m) {
    props.aanzuigdiepte_m = props.length_mm;
    delete props.length_mm;
  }
  
  // Also extract from _enriched if present
  if (product._enriched) {
    const enrichedFields = ['diameter_mm', 'material', 'sku_series'];
    enrichedFields.forEach(field => {
      if (product._enriched[field] !== undefined && !props[field]) {
        props[field] = product._enriched[field];
      }
    });
  }
  
  return props;
}

// Extract product attributes
function extractAttributes(product) {
  const attrs = {};
  
  // Specification fields
  const specFields = [
    'spec_liquid_temp_range', 'spec_temp_range', 'spec_max_pressure',
    'spec_application_desc', 'spec_housing', 'spec_product_variant',
    'application', 'color', 'finish', 'thread_type', 'pressure_rating'
  ];
  
  specFields.forEach(field => {
    if (product[field] !== undefined && product[field] !== null && product[field] !== '') {
      attrs[field] = product[field];
    }
  });
  
  return attrs;
}

// Main processing function
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
    
    // Group the products
    const grouped = groupProducts(products, catalogFile);
    
    console.log(`   Created ${grouped.length} product groups`);
    
    // Generate output filename
    const baseName = catalogFile.replace('.json', '');
    const outputFile = `${baseName.replace(/-/g, '_')}_grouped.json`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    
    // Write grouped data
    fs.writeFileSync(outputPath, JSON.stringify(grouped, null, 2), 'utf-8');
    
    console.log(`   ✅ Saved: ${outputFile}`);
    
    return {
      catalog: catalogFile,
      products: products.length,
      groups: grouped.length,
      outputFile
    };
  } catch (error) {
    console.error(`   ❌ Error processing ${catalogFile}:`, error.message);
    return null;
  }
}

// Process all catalogs
async function main() {
  console.log('🚀 Starting catalog grouping process...\n');
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
  console.log(`Total products: ${results.reduce((sum, r) => sum + r.products, 0).toLocaleString()}`);
  console.log(`Total groups created: ${results.reduce((sum, r) => sum + r.groups, 0).toLocaleString()}`);
  console.log('='.repeat(60));
  
  // Create combined products_all_grouped.json
  console.log('\n📦 Creating combined products_all_grouped.json...');
  const allGroups = [];
  
  for (const result of results) {
    const groupedPath = path.join(OUTPUT_DIR, result.outputFile);
    const groupedData = JSON.parse(fs.readFileSync(groupedPath, 'utf-8'));
    allGroups.push(...groupedData);
  }
  
  const allOutputPath = path.join(OUTPUT_DIR, 'products_all_grouped.json');
  fs.writeFileSync(allOutputPath, JSON.stringify(allGroups, null, 2), 'utf-8');
  
  console.log(`✅ Saved combined file with ${allGroups.length} groups`);
  console.log('\n✨ Done! Restart your dev server to see the changes.');
}

// Run
main().catch(console.error);
