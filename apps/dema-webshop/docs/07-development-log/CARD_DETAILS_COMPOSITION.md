# 📍 Where Card Details Are Composed

## Quick Reference Map

```
src/components/
├── products/
│   ├── ProductCard.tsx ⭐ MAIN PRODUCT CARD
│   │   └── Lines 75-356: Individual product display logic
│   ├── ProductCardEnhanced.tsx
│   └── ProductDetailsCard.tsx
│
├── EnhancedProductGroupCard.tsx ⭐ NEW GROUP CARD (with SKU properties)
│   └── Lines 52-323: Product group with variants
│
├── ProductGroupCard.tsx (Original group card)
│   └── Lines 30-333: Variant groups
│
└── CatalogProductCard.tsx (Simple catalog card)
    └── Lines 25-367: Basic catalog products
```

---

## 🎯 Main Card: `ProductCard.tsx`

**File:** `src/components/products/ProductCard.tsx`

### Card Details Composition

#### **Setup & Data Processing (Lines 75-113)**
```tsx
// Line 75: Component declaration
export default function ProductCard({ product, className, viewMode }) {

  // Lines 82-90: Product display data
  const productType = product.name || vm.title || '';
  const productName = product.sku + (productType ? ` - ${productType}` : '');
  const categoryDisplay = product.category || product.product_category || '';
  
  // Lines 92-100: IMAGE RESOLUTION (Priority order)
  const imageUrl = product.imageUrl ||                          // 1. Server-side PDF extraction
                   product.media?.find(m => m.role === 'main')?.url ||  // 2. Media with 'main' role
                   product.image_paths?.[0] ||                   // 3. First image path
                   vm.image;                                     // 4. Fallback placeholder
  
  // Lines 102-105: Price formatting
  const isRequestQuote = product.priceMode === 'request_quote';
  const price = vm.priceLabel;
  const showPrice = !isRequestQuote && price !== 'Price on request';
  
  // Lines 107-113: Stock and dimensions
  const stockStatus = product.stock?.status || (product.inStock ? 'in_stock' : 'unknown');
  const hasDimensions = product.dimensions_mm_list && product.dimensions_mm_list.length > 0;
```

#### **LIST VIEW (Lines 126-204)**
```tsx
if (viewMode === 'list') {
  return (
    <div>
      {/* Lines 135-144: IMAGE SECTION */}
      <ImageWithFallback
        src={imageUrl}
        alt={productName}
        fallbackText={categoryDisplay}
      />
      
      {/* Lines 146-154: TITLE & CATEGORY */}
      <h3>{productName}</h3>
      <p>{categoryDisplay}</p>
      
      {/* Lines 155-159: BADGES */}
      <span>In Stock / Custom Badge</span>
      
      {/* Lines 160-175: PDF LINK */}
      <a href={product.pdf_source}>View PDF</a>
      
      {/* Lines 177-201: PRICE & ACTIONS */}
      <p>{price}</p>
      <Link>View Details</Link>
      <Button>Add to Cart / Request Quote</Button>
    </div>
  );
}
```

#### **GRID VIEW (Lines 208-356)**
```tsx
// Default grid view
return (
  <div>
    {/* Lines 216-225: IMAGE */}
    <ImageWithFallback src={imageUrl} />
    
    {/* Lines 228-236: TITLE & CATEGORY */}
    <h3>{productName}</h3>
    <p>{categoryDisplay}</p>
    
    {/* Lines 238-253: PDF LINK & BADGES */}
    <a href={product.pdf_source}>View PDF</a>
    <span>Badges</span>
    
    {/* Lines 266-284: DIMENSIONS SELECTOR ⚠️ */}
    <Select>
      <SelectItem>{dimension}mm</SelectItem>
    </Select>
    
    {/* Lines 286-294: PRODUCT SPECS ⭐ KEY SECTION */}
    <div className="mt-2 space-y-1">
      {vm.specs.slice(0,3).map(spec => (
        <div className="flex justify-between">
          <span>{translateSpecLabel(spec.label, t)}:</span>
          <span>{spec.value}</span>
        </div>
      ))}
    </div>
    
    {/* Lines 296-303: PRICE & CART ICON */}
    <p>{price}</p>
    <button>Cart Icon</button>
    
    {/* Lines 306-323: FULL SPECS GRID (hidden initially) */}
    <div className="grid grid-cols-2 gap-2">
      {vm.specs.map(s => (
        <div>
          <span>{s.label}:</span>
          <span>{s.value}</span>
        </div>
      ))}
      {product.dimensions_mm_list && (
        <div>Available sizes: {dimensions}</div>
      )}
    </div>
    
    {/* Lines 325-353: ACTION BUTTONS */}
    <Link>View Details</Link>
    <button>Add to Cart / Request Quote</button>
  </div>
);
```

### Where Specs/Properties Come From

**Line 82:**
```tsx
const vm = formatProductForCard(product);
```

This helper formats product data into `vm.specs` array:
```tsx
vm.specs = [
  { label: "Pressure", value: "2-4 bar" },
  { label: "Flow", value: "1.92 m3/h" },
  { label: "Power", value: "800W" },
  // ... more specs
]
```

**Helper file:** `src/lib/formatProductForCard.ts`

---

## 🎯 New Enhanced Card: `EnhancedProductGroupCard.tsx`

**File:** `src/components/EnhancedProductGroupCard.tsx`

### Card Details Composition

#### **Property Extraction (Lines 52-77) ⭐ MOST IMPORTANT**
```tsx
// Lines 52-77: Extract and prioritize properties
const getKeyProperties = (variant: any) => {
  const props = variant.properties || {};     // From our generated JSON
  const attrs = variant.attributes || {};     // From our generated JSON
  
  // PRIORITY PROPERTIES (shown first)
  const priorityKeys = [
    'type',              // Product type
    'material',          // Material (brass, stainless steel, etc.)
    'diameter_mm',       // Diameter in mm
    'length_m',          // Length in meters
    'connection_size',   // Connection/thread size
    'pressure_max_bar',  // Maximum pressure
    'flow_m3_h',         // Flow rate
    'power_w',           // Power in watts
    'voltage_v'          // Voltage
  ];
  
  const allProps = { ...props, ...attrs };
  const keyProps = [];
  
  // Add priority properties first
  priorityKeys.forEach(key => {
    if (allProps[key]) {
      keyProps.push({ key, value: allProps[key] });
    }
  });
  
  // Add remaining properties (up to 6 total)
  Object.entries(allProps).forEach(([key, value]) => {
    if (!priorityKeys.includes(key) && value && keyProps.length < 6) {
      keyProps.push({ key, value });
    }
  });
  
  return keyProps.slice(0, 6);  // Maximum 6 properties shown
};
```

#### **Property Name Formatting (Lines 40-50)**
```tsx
const formatPropertyName = (key: string): string => {
  return key
    .replace(/_/g, ' ')              // pressure_max_bar → pressure max bar
    .replace(/([A-Z])/g, ' $1')      // maxPressure → max Pressure
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize
    .join(' ')
    .trim();
};

// Examples:
// 'pressure_max_bar' → 'Pressure Max Bar'
// 'diameter_mm' → 'Diameter Mm'
// 'type' → 'Type'
```

#### **LIST VIEW Properties Display (Lines 145-159)**
```tsx
{/* Lines 145-159: PROPERTIES GRID */}
{keyProperties.length > 0 && (
  <div className="grid grid-cols-2 gap-3 mb-4">
    {keyProperties.map(({ key, value }) => (
      <div key={key} className="flex flex-col">
        <span className="text-xs text-gray-500 uppercase">
          {formatPropertyName(key)}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {String(value)}
        </span>
      </div>
    ))}
  </div>
)}
```

#### **GRID VIEW Properties Display (Lines 277-286)**
```tsx
{/* Lines 277-286: KEY PROPERTIES (shows 4 in grid) */}
{keyProperties.length > 0 && (
  <div className="space-y-2 mb-4 text-sm">
    {keyProperties.slice(0, 4).map(({ key, value }) => (
      <div key={key} className="flex justify-between">
        <span className="text-gray-600">{formatPropertyName(key)}:</span>
        <span className="font-semibold text-gray-900 text-right ml-2">
          {String(value)}
        </span>
      </div>
    ))}
  </div>
)}
```

#### **Variant Selector (Lines 128-142 & 262-274)**
```tsx
{/* Dropdown to select different product variants */}
<select
  value={selectedVariantIndex}
  onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
>
  {productGroup.variants.map((variant, index) => (
    <option value={index}>
      SKU: {variant.sku || 'N/A'} - {variant.label}
    </option>
  ))}
</select>
```

---

## 📊 Data Flow for Properties

### From JSON to Card Display

```
1. Source Data (documents/Product_pdfs/json/catalog.json)
   ↓
   {
     "sku": "12345",
     "type": "Brass Fitting",
     "diameter_mm": 20,
     "pressure_max_bar": 16,
     "material": "Brass",
     ...
   }

2. Grouped by Script (scripts/generate_grouped_catalogs.js)
   ↓
   {
     "variants": [{
       "sku": "12345",
       "properties": {
         "type": "Brass Fitting",
         "diameter_mm": 20,
         "pressure_max_bar": 16
       },
       "attributes": {
         "material": "Brass"
       }
     }]
   }

3. Displayed in Card (EnhancedProductGroupCard.tsx)
   ↓
   Type: Brass Fitting
   Diameter Mm: 20
   Pressure Max Bar: 16
   Material: Brass
```

---

## 🔍 Property Sources in Generated JSON

**File:** `public/data/pomp_specials_grouped.json`

```json
{
  "variants": [
    {
      "sku": "02350025",
      "label": "Product Name",
      "properties": {          ← DISPLAYED AS KEY PROPERTIES
        "type": "Messing",
        "debiet_m3_h": "1,92 m3/h",
        "aansluiting": "1/2"",
        "aanzuigdiepte_m": "6 m",
        "opv_hoogte_m": "20 m",
        "lengte": "1,392 kg"
      },
      "attributes": {          ← ALSO DISPLAYED
        "spec_liquid_temp_range": "P-serie: max. 35°C",
        "spec_max_pressure": "2 - 4 bar",
        "spec_housing": "Kunststof / Messing",
        "application": "VARIATIES"
      }
    }
  ]
}
```

---

## 🛠️ How to Modify Card Details

### To Add More Properties

**Edit:** `src/components/EnhancedProductGroupCard.tsx`

```tsx
// Line 64: Add your property to priority list
const priorityKeys = [
  'type', 'material', 'diameter_mm',
  'your_new_property',  // ← Add here
  'pressure_max_bar', 'flow_m3_h'
];
```

### To Change Number of Properties Shown

```tsx
// Line 285 (GRID view): Change from 4 to any number
{keyProperties.slice(0, 4).map(...)}  // ← Change 4 to 6, 8, etc.

// Line 73: Change total maximum
return keyProps.slice(0, 6);  // ← Change 6 to 8, 10, etc.
```

### To Add Custom Formatting

```tsx
// Lines 277-286: Add custom rendering
{keyProperties.slice(0, 4).map(({ key, value }) => (
  <div>
    <span>{formatPropertyName(key)}:</span>
    <span>
      {key === 'pressure_max_bar' 
        ? `${value} bar` 
        : String(value)
      }
    </span>
  </div>
))}
```

---

## 📍 Summary

### Primary Locations for Card Details:

1. **ProductCard.tsx**
   - Lines 286-294: Specs display (grid)
   - Uses `vm.specs` from `formatProductForCard` helper

2. **EnhancedProductGroupCard.tsx** ⭐
   - Lines 52-77: Property extraction logic
   - Lines 145-159: List view property display
   - Lines 277-286: Grid view property display
   - **This is where SKU properties are shown!**

3. **Data Source**
   - `public/data/*_grouped.json` files
   - Generated by `scripts/generate_grouped_catalogs.js`
   - Properties in `variants[].properties` object
   - Attributes in `variants[].attributes` object

---

**To see it in action:** Visit any `/catalog/*-grouped` page after restarting your dev server!
