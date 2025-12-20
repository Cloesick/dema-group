// =============================================================================
// PIM (Product Information Management) - PLUG & PLAY MODULE
// =============================================================================
// This module handles:
// 1. PDF parsing and product extraction
// 2. Mapping to portal Product type
// 3. Export to dema-webshop compatible formats (JSON, XML)
// 4. Data enrichment and validation
// =============================================================================

import type { Product, ProductSpecification, ProductImage } from '@/types'

// -----------------------------------------------------------------------------
// PIM Product Types (from PDF extraction)
// -----------------------------------------------------------------------------

export interface PIMExtractedProduct {
  // Core identifiers
  sku: string
  bestelnr?: string
  series_id?: string
  series_name: string
  
  // Source info
  source_pdf: string
  page: number
  catalog?: string
  
  // Properties extracted from PDF
  maat?: string
  werkdruk?: string
  type?: string
  angle?: string
  material?: string
  diameter?: string
  connection?: string
  
  // Spec fields
  spec_product_title?: string
  spec_product_variant?: string
  application?: string
  
  // Dynamic properties stored separately
  properties?: Record<string, string | number>
}

export interface PIMEnrichedProduct {
  // Core identifiers
  sku: string
  bestelnr: string
  series_id?: string
  series_name: string
  
  // Source info
  source_pdf: string
  page: number
  catalog: string
  pdf_source: string
  
  // Properties extracted from PDF
  maat?: string
  werkdruk?: string
  type?: string
  angle?: string
  material?: string
  diameter?: string
  connection?: string
  
  // Spec fields
  spec_product_title?: string
  spec_product_variant?: string
  application?: string
  
  // Enriched data
  _enriched: {
    series_raw: string
    series: string
    catalog_group: string
    product_type: string
    material: string
    family_id: string
    sku_series: string
    diameter_mm?: number
  }
  
  // Images
  image: string
  images: string[]
  imageUrl: string
  
  // Dynamic properties
  properties?: Record<string, string | number>
}

// -----------------------------------------------------------------------------
// Dema-Webshop Compatible Format
// -----------------------------------------------------------------------------

export interface DemaWebshopProduct {
  sku: string
  series_id: string
  series_name: string
  source_pdf: string
  page: number
  bestelnr: string
  maat?: string
  werkdruk?: string
  type?: string
  angle?: string
  spec_product_title?: string
  spec_product_variant?: string
  application?: string
  _enriched: {
    series_raw: string
    series: string
    catalog_group: string
    product_type: string
    material: string
    family_id: string
    sku_series: string
    diameter_mm?: number
  }
  image: string
  images: string[]
  imageUrl: string
  catalog: string
  pdf_source: string
}

// -----------------------------------------------------------------------------
// Product Enrichment
// -----------------------------------------------------------------------------

export function enrichProduct(product: PIMExtractedProduct): PIMEnrichedProduct {
  const seriesRaw = product.series_name || 'Unknown'
  const series = slugify(seriesRaw)
  const catalog = product.catalog || product.source_pdf.replace('.pdf', '')
  const catalogSlug = slugify(catalog)
  
  // Detect product type from series name or properties
  const productType = detectProductType(product)
  const catalogGroup = detectCatalogGroup(productType)
  const material = detectMaterial(product)
  
  // Extract diameter from maat field
  const diameterMm = extractDiameter(product.maat)
  
  // Generate SKU series prefix
  const skuSeries = product.sku.replace(/[0-9]/g, '').toLowerCase()
  
  // Generate family ID
  const familyId = generateFamilyId(catalogGroup, productType, series, product.maat, product.sku)
  
  // Generate image paths
  const imageBase = `/api/images/${catalogSlug}/${catalogSlug}__p${product.page}__${series}`
  const image = `${imageBase}__v1.webp`
  const images = [`${imageBase}__v1.webp`, `${imageBase}__v2.webp`]
  
  return {
    ...product,
    bestelnr: product.bestelnr || product.sku,
    catalog: catalogSlug,
    pdf_source: product.source_pdf,
    image,
    images,
    imageUrl: image,
    _enriched: {
      series_raw: seriesRaw,
      series,
      catalog_group: catalogGroup,
      product_type: productType,
      material,
      family_id: familyId,
      sku_series: skuSeries,
      diameter_mm: diameterMm,
    },
  }
}

// -----------------------------------------------------------------------------
// Convert to Portal Product Type
// -----------------------------------------------------------------------------

export function convertToPortalProduct(
  pimProduct: PIMEnrichedProduct,
  companyId: string = 'dema'
): Partial<Product> {
  const specs: ProductSpecification[] = []
  let specOrder = 0
  
  // Add specifications from PIM data
  if (pimProduct.maat) {
    specs.push({
      id: `spec-${pimProduct.sku}-size`,
      groupId: 'dimensions',
      groupName: 'Dimensions',
      groupName_nl: 'Afmetingen',
      name: 'Size',
      name_nl: 'Maat',
      name_fr: 'Taille',
      value: pimProduct.maat,
      sortOrder: specOrder++,
      isFilterable: true,
      filterType: 'exact',
    })
  }
  
  if (pimProduct.werkdruk) {
    specs.push({
      id: `spec-${pimProduct.sku}-pressure`,
      groupId: 'performance',
      groupName: 'Performance',
      groupName_nl: 'Prestaties',
      name: 'Working Pressure',
      name_nl: 'Werkdruk',
      name_fr: 'Pression de travail',
      value: pimProduct.werkdruk,
      sortOrder: specOrder++,
      isFilterable: true,
      filterType: 'range',
    })
  }
  
  if (pimProduct._enriched.material) {
    specs.push({
      id: `spec-${pimProduct.sku}-material`,
      groupId: 'materials',
      groupName: 'Materials',
      groupName_nl: 'Materialen',
      name: 'Material',
      name_nl: 'Materiaal',
      name_fr: 'Matériau',
      value: pimProduct._enriched.material,
      sortOrder: specOrder++,
      isFilterable: true,
      filterType: 'exact',
    })
  }
  
  if (pimProduct._enriched.diameter_mm) {
    specs.push({
      id: `spec-${pimProduct.sku}-diameter`,
      groupId: 'dimensions',
      groupName: 'Dimensions',
      groupName_nl: 'Afmetingen',
      name: 'Diameter',
      name_nl: 'Diameter',
      name_fr: 'Diamètre',
      value: String(pimProduct._enriched.diameter_mm),
      unit: 'mm',
      sortOrder: specOrder++,
      isFilterable: true,
      filterType: 'range',
    })
  }
  
  if (pimProduct.angle) {
    specs.push({
      id: `spec-${pimProduct.sku}-angle`,
      groupId: 'dimensions',
      groupName: 'Dimensions',
      groupName_nl: 'Afmetingen',
      name: 'Angle',
      name_nl: 'Hoek',
      name_fr: 'Angle',
      value: pimProduct.angle,
      sortOrder: specOrder++,
      isFilterable: true,
      filterType: 'exact',
    })
  }
  
  // Build images array
  const images: ProductImage[] = (pimProduct.images || []).map((url, i) => ({
    id: `img-${pimProduct.sku}-${i}`,
    url,
    alt: `${pimProduct.series_name} - ${pimProduct.sku}`,
    isPrimary: i === 0,
    sortOrder: i,
    type: 'product' as const,
  }))
  
  // Map category from catalog group
  const categoryId = mapCatalogGroupToCategory(pimProduct._enriched.catalog_group)
  
  return {
    id: pimProduct.sku.toLowerCase(),
    sku: pimProduct.sku,
    name: `${pimProduct.series_name} ${pimProduct.maat || ''}`.trim(),
    name_nl: `${pimProduct.series_name} ${pimProduct.maat || ''}`.trim(),
    name_fr: `${pimProduct.series_name} ${pimProduct.maat || ''}`.trim(),
    slug: slugify(`${pimProduct.series_name}-${pimProduct.sku}`),
    categoryId,
    subcategoryId: pimProduct._enriched.product_type,
    shortDescription: pimProduct.spec_product_title || pimProduct.series_name,
    shortDescription_nl: pimProduct.spec_product_title || pimProduct.series_name,
    shortDescription_fr: pimProduct.spec_product_title || pimProduct.series_name,
    longDescription: buildLongDescription(pimProduct),
    longDescription_nl: buildLongDescription(pimProduct, 'nl'),
    longDescription_fr: buildLongDescription(pimProduct, 'fr'),
    images,
    specifications: specs,
    documents: [
      {
        id: `doc-${pimProduct.sku}-catalog`,
        type: 'brochure',
        title: `${pimProduct.catalog} Catalog`,
        title_nl: `${pimProduct.catalog} Catalogus`,
        title_fr: `Catalogue ${pimProduct.catalog}`,
        url: `/catalogs/${pimProduct.source_pdf}`,
        fileSize: 0,
        language: 'multi',
      },
    ],
    videos: [],
    crossReferences: [],
    compatibility: [],
    relatedProducts: [],
    accessories: [],
    alternatives: [],
    companies: [companyId],
    keywords: buildKeywords(pimProduct),
    status: 'active',
    minOrderQuantity: 1,
    orderMultiple: 1,
    pricing: {
      currency: 'EUR',
      listPrice: 0, // To be filled from ERP
      tiers: [],
    },
    stockStatus: {
      inStock: true, // To be updated from inventory API
      quantity: 0,
      warehouses: [],
    },
  }
}

// -----------------------------------------------------------------------------
// Export to Dema-Webshop Format
// -----------------------------------------------------------------------------

export function convertToDemaWebshopFormat(products: PIMEnrichedProduct[]): DemaWebshopProduct[] {
  return products.map(p => ({
    sku: p.sku,
    series_id: `${p.catalog}__${p._enriched.series}`,
    series_name: p.series_name,
    source_pdf: p.source_pdf,
    page: p.page,
    bestelnr: p.bestelnr || p.sku,
    maat: p.maat,
    werkdruk: p.werkdruk,
    type: p.type,
    angle: p.angle,
    spec_product_title: p.spec_product_title,
    spec_product_variant: p.spec_product_variant,
    application: p.application,
    _enriched: p._enriched,
    image: p.image || '',
    images: p.images || [],
    imageUrl: p.imageUrl || '',
    catalog: p.catalog || '',
    pdf_source: p.pdf_source,
  }))
}

// -----------------------------------------------------------------------------
// XML Export (Dema-Webshop Compatible)
// -----------------------------------------------------------------------------

export function generateDemaWebshopXML(products: DemaWebshopProduct[]): string {
  // XML structure exactly mirrors the JSON structure from products_for_shop.json
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<products>\n'

  for (const product of products) {
    xml += '  <product>\n'
    
    // Core fields - exact order from JSON
    xml += `    <sku>${escapeXml(product.sku)}</sku>\n`
    xml += `    <series_id>${escapeXml(product.series_id)}</series_id>\n`
    xml += `    <series_name>${escapeXml(product.series_name)}</series_name>\n`
    xml += `    <source_pdf>${escapeXml(product.source_pdf)}</source_pdf>\n`
    xml += `    <page>${product.page}</page>\n`
    xml += `    <bestelnr>${escapeXml(product.bestelnr)}</bestelnr>\n`
    
    // Optional properties - only if present
    if (product.maat) xml += `    <maat>${escapeXml(product.maat)}</maat>\n`
    if (product.werkdruk) xml += `    <werkdruk>${escapeXml(product.werkdruk)}</werkdruk>\n`
    if (product.type) xml += `    <type>${escapeXml(product.type)}</type>\n`
    if (product.angle) xml += `    <angle>${escapeXml(product.angle)}</angle>\n`
    if (product.spec_product_title) xml += `    <spec_product_title>${escapeXml(product.spec_product_title)}</spec_product_title>\n`
    if (product.spec_product_variant) xml += `    <spec_product_variant>${escapeXml(product.spec_product_variant)}</spec_product_variant>\n`
    if (product.application) xml += `    <application>${escapeXml(product.application)}</application>\n`
    
    // _enriched object - exact structure from JSON (using "enriched" as valid XML element)
    xml += '    <enriched>\n'
    xml += `      <series_raw>${escapeXml(product._enriched.series_raw)}</series_raw>\n`
    xml += `      <series>${escapeXml(product._enriched.series)}</series>\n`
    xml += `      <catalog_group>${escapeXml(product._enriched.catalog_group)}</catalog_group>\n`
    xml += `      <product_type>${escapeXml(product._enriched.product_type)}</product_type>\n`
    xml += `      <material>${escapeXml(product._enriched.material)}</material>\n`
    xml += `      <family_id>${escapeXml(product._enriched.family_id)}</family_id>\n`
    xml += `      <sku_series>${escapeXml(product._enriched.sku_series)}</sku_series>\n`
    if (product._enriched.diameter_mm) {
      xml += `      <diameter_mm>${product._enriched.diameter_mm}</diameter_mm>\n`
    }
    xml += '    </enriched>\n'
    
    // Image fields - exact order from JSON
    xml += `    <image>${escapeXml(product.image)}</image>\n`
    xml += '    <images>\n'
    for (const img of product.images) {
      xml += `      <item>${escapeXml(img)}</item>\n`
    }
    xml += '    </images>\n'
    xml += `    <imageUrl>${escapeXml(product.imageUrl)}</imageUrl>\n`
    xml += `    <catalog>${escapeXml(product.catalog)}</catalog>\n`
    xml += `    <pdf_source>${escapeXml(product.pdf_source)}</pdf_source>\n`
    
    xml += '  </product>\n'
  }

  xml += '</products>'
  
  return xml
}

// -----------------------------------------------------------------------------
// Portal Product XML Export
// -----------------------------------------------------------------------------

export function generatePortalProductXML(products: Partial<Product>[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<portal_catalog xmlns="http://demagroup.be/schema/portal">\n'
  xml += '  <metadata>\n'
  xml += `    <generated>${new Date().toISOString()}</generated>\n`
  xml += `    <productCount>${products.length}</productCount>\n`
  xml += '    <source>DEMA Group Portal PIM</source>\n'
  xml += '    <version>1.0</version>\n'
  xml += '  </metadata>\n'
  xml += '  <products>\n'

  for (const product of products) {
    xml += '    <product>\n'
    xml += `      <id>${escapeXml(product.id || '')}</id>\n`
    xml += `      <sku>${escapeXml(product.sku || '')}</sku>\n`
    xml += `      <name>${escapeXml(product.name || '')}</name>\n`
    xml += `      <name_nl>${escapeXml(product.name_nl || '')}</name_nl>\n`
    xml += `      <name_fr>${escapeXml(product.name_fr || '')}</name_fr>\n`
    xml += `      <slug>${escapeXml(product.slug || '')}</slug>\n`
    xml += `      <categoryId>${escapeXml(product.categoryId || '')}</categoryId>\n`
    xml += `      <subcategoryId>${escapeXml(product.subcategoryId || '')}</subcategoryId>\n`
    
    xml += '      <descriptions>\n'
    xml += `        <short>${escapeXml(product.shortDescription || '')}</short>\n`
    xml += `        <short_nl>${escapeXml(product.shortDescription_nl || '')}</short_nl>\n`
    xml += `        <long>${escapeXml(product.longDescription || '')}</long>\n`
    xml += `        <long_nl>${escapeXml(product.longDescription_nl || '')}</long_nl>\n`
    xml += '      </descriptions>\n'
    
    if (product.specifications && product.specifications.length > 0) {
      xml += '      <specifications>\n'
      for (const spec of product.specifications) {
        xml += '        <spec>\n'
        xml += `          <name>${escapeXml(spec.name)}</name>\n`
        xml += `          <name_nl>${escapeXml(spec.name_nl)}</name_nl>\n`
        xml += `          <value>${escapeXml(spec.value)}</value>\n`
        if (spec.unit) xml += `          <unit>${escapeXml(spec.unit)}</unit>\n`
        xml += `          <group>${escapeXml(spec.groupName)}</group>\n`
        xml += `          <filterable>${spec.isFilterable}</filterable>\n`
        xml += '        </spec>\n'
      }
      xml += '      </specifications>\n'
    }
    
    if (product.images && product.images.length > 0) {
      xml += '      <images>\n'
      for (const img of product.images) {
        xml += `        <image primary="${img.isPrimary}">${escapeXml(img.url)}</image>\n`
      }
      xml += '      </images>\n'
    }
    
    if (product.companies && product.companies.length > 0) {
      xml += '      <companies>\n'
      for (const company of product.companies) {
        xml += `        <company>${escapeXml(company)}</company>\n`
      }
      xml += '      </companies>\n'
    }
    
    xml += `      <status>${product.status || 'active'}</status>\n`
    xml += '    </product>\n'
  }

  xml += '  </products>\n'
  xml += '</portal_catalog>'
  
  return xml
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function detectProductType(product: PIMExtractedProduct): string {
  const seriesLower = (product.series_name || '').toLowerCase()
  const typeLower = (product.type || '').toLowerCase()
  
  if (seriesLower.includes('bocht') || seriesLower.includes('elbow')) return 'elbow'
  if (seriesLower.includes('mof') || seriesLower.includes('coupling')) return 'coupling'
  if (seriesLower.includes('buis') || seriesLower.includes('pipe')) return 'pipe'
  if (seriesLower.includes('klep') || seriesLower.includes('valve')) return 'valve'
  if (seriesLower.includes('pomp') || seriesLower.includes('pump')) return 'pump'
  if (seriesLower.includes('slang') || seriesLower.includes('hose')) return 'hose'
  if (typeLower.includes('compressed_air')) return 'compressed_air_pipe'
  
  return product.type || 'general'
}

function detectCatalogGroup(productType: string): string {
  const typeGroups: Record<string, string> = {
    'compressed_air_pipe': 'compressed_air',
    'elbow': 'fittings',
    'coupling': 'fittings',
    'pipe': 'pipes',
    'valve': 'valves',
    'pump': 'pumps',
    'hose': 'hoses',
  }
  return typeGroups[productType] || 'general'
}

function detectMaterial(product: PIMExtractedProduct): string {
  const seriesLower = (product.series_name || '').toLowerCase()
  const materialLower = (product.material || '').toLowerCase()
  
  if (seriesLower.includes('abs') || materialLower.includes('abs')) return 'ABS'
  if (seriesLower.includes('pvc') || materialLower.includes('pvc')) return 'PVC'
  if (seriesLower.includes('pe') || materialLower.includes('pe')) return 'PE'
  if (seriesLower.includes('pp') || materialLower.includes('pp')) return 'PP'
  if (seriesLower.includes('rvs') || seriesLower.includes('inox') || materialLower.includes('stainless')) return 'Stainless Steel'
  if (seriesLower.includes('messing') || materialLower.includes('brass')) return 'Brass'
  if (seriesLower.includes('gietijzer') || materialLower.includes('cast iron')) return 'Cast Iron'
  
  return product.material || 'Unknown'
}

function extractDiameter(maat?: string): number | undefined {
  if (!maat) return undefined
  const match = maat.match(/(\d+)\s*mm/i)
  return match ? parseInt(match[1]) : undefined
}

function generateFamilyId(
  catalogGroup: string,
  productType: string,
  series: string,
  maat?: string,
  sku?: string
): string {
  const parts = [catalogGroup, productType, series]
  if (maat) parts.push(maat.toLowerCase().replace(/\s+/g, '-'))
  if (sku) parts.push(sku.toLowerCase())
  
  const base = parts.join('-')
  const hash = base.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0).toString(16).slice(-6)
  
  return `${base}-${hash}`
}

function mapCatalogGroupToCategory(catalogGroup: string): string {
  const mapping: Record<string, string> = {
    'compressed_air': 'pipes-fittings',
    'fittings': 'pipes-fittings',
    'pipes': 'pipes-fittings',
    'valves': 'valves-controls',
    'pumps': 'pumps',
    'hoses': 'hoses-couplings',
    'general': 'tools-machines',
  }
  return mapping[catalogGroup] || 'tools-machines'
}

function buildLongDescription(product: PIMEnrichedProduct, lang: string = 'en'): string {
  const parts: string[] = []
  
  if (product.spec_product_title) {
    parts.push(product.spec_product_title)
  }
  
  if (product.spec_product_variant) {
    parts.push(product.spec_product_variant)
  }
  
  if (product.application) {
    const prefix = lang === 'nl' ? 'Toepassing' : lang === 'fr' ? 'Application' : 'Application'
    parts.push(`${prefix}: ${product.application}`)
  }
  
  if (product._enriched.material && product._enriched.material !== 'Unknown') {
    const prefix = lang === 'nl' ? 'Materiaal' : lang === 'fr' ? 'Matériau' : 'Material'
    parts.push(`${prefix}: ${product._enriched.material}`)
  }
  
  return parts.join('. ')
}

function buildKeywords(product: PIMEnrichedProduct): string[] {
  const keywords: string[] = []
  
  keywords.push(product.sku.toLowerCase())
  keywords.push(...product.series_name.toLowerCase().split(/\s+/))
  
  if (product._enriched.material && product._enriched.material !== 'Unknown') {
    keywords.push(product._enriched.material.toLowerCase())
  }
  
  if (product._enriched.product_type) {
    keywords.push(product._enriched.product_type)
  }
  
  if (product._enriched.catalog_group) {
    keywords.push(product._enriched.catalog_group)
  }
  
  if (product.maat) {
    keywords.push(product.maat.toLowerCase().replace(/\s+/g, ''))
  }
  
  return [...new Set(keywords)]
}

// -----------------------------------------------------------------------------
// Batch Processing
// -----------------------------------------------------------------------------

export function processPIMBatch(
  extractedProducts: PIMExtractedProduct[],
  companyId: string = 'dema'
): {
  enriched: PIMEnrichedProduct[]
  demaWebshop: DemaWebshopProduct[]
  portal: Partial<Product>[]
} {
  const enriched = extractedProducts.map(enrichProduct)
  const demaWebshop = convertToDemaWebshopFormat(enriched)
  const portal = enriched.map(p => convertToPortalProduct(p, companyId))
  
  return { enriched, demaWebshop, portal }
}
