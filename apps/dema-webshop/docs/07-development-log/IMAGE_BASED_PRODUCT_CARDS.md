# 🎨 Image-Based Product Cards - Complete Implementation

## ✅ What Was Built

A new product card system with:
- ✅ **Image-based SKU grouping** - Products sharing the same image are grouped together
- ✅ **Icon-based property display** - Each property has a visual emoji icon
- ✅ **Smart categorization** - Properties automatically grouped by type with color coding
- ✅ **Flexible layout** - Shows only properties that exist for each product
- ✅ **Fixed header section** - SKU dropdown, PDF links, page numbers
- ✅ **855 product groups** from 14,395 individual products

---

## 📁 Files Created

### **1. Utilities**
```
src/lib/propertyIcons.ts          - Icon mapping for 100+ property types
src/lib/propertyCategories.ts     - Smart categorization system
```

### **2. Component**
```
src/components/ImageBasedProductCard.tsx  - Main product card component
```

### **3. Data Generation**
```
scripts/generate_image_based_products.js  - Groups products by image
public/data/*_products.json               - 25 catalog files generated
```

### **4. Demo Page**
```
src/app/catalog/abs-products-demo/page.tsx  - Test page for ABS products
```

---

## 🎯 Product Card Structure

### **Fixed Section 1** (Always Displayed):
```
┌─────────────────────────────────┐
│      [Product Image]            │
├─────────────────────────────────┤
│ 🏷️ SKU: [Dropdown ▼]          │
│         ABSB02090               │
│         ABSB02590               │
│         ABSB03290               │
│                                 │
│ 📄 abs-persluchtbuizen.pdf      │
│ 📖 Page: 5                      │
└─────────────────────────────────┘
```

### **Dynamic Sections** (Based on Available Properties):

#### **🔧 Specifications** (Blue Background)
```
Properties like:
🧱 Type: compressed_air_pipe
🏠 Housing: ABS
🔖 Variant: LIJMMOF - GLAD
```

#### **📏 Dimensions** (Green Background)
```
Properties like:
⭕ Diameter: 20 mm
📐 Angle: 90°
📏 Length: 0.5 m
```

#### **⚡ Performance** (Orange Background)
```
Properties like:
🔧 Werkdruk: 10 bar
💨 Flow: 1.92 m3/h
⚡ Power: 800W
```

#### **🎯 Application** (Purple Background)
```
Properties like:
🎯 Application: Industry, Agriculture
🌡️ Temperature: -20°C to 60°C
```

---

## 🎨 Icon Mapping System

### **Property Icons (100+ mappings)**

| Property Type | Icon | Examples |
|--------------|------|----------|
| **SKU/Product** | 🏷️ | sku, model, bestelnr |
| **Power** | ⚡ | power, vermogen, power_w |
| **Electrical** | 🔌 | voltage, spanning, connection |
| **Flow** | 🌬️💨 | debiet, flow, intake, output |
| **Pressure** | 🔧 | werkdruk, pressure, bar, psi |
| **Diameter** | ⭕ | diameter, maat, dia |
| **Length** | 📏 | length, lengte |
| **Width** | ↔️ | width, breedte |
| **Height** | ↕️ | height, hoogte |
| **Thickness** | 📐 | thickness, dikte, wall_thickness |
| **Volume** | 🗜️📦 | volume, capacity, tank, liter |
| **Material** | 🧱 | material, type, housing |
| **Temperature** | 🌡️ | temperature, temp, temp_range |
| **Mechanical** | 🔄⚙️🔩 | rpm, cylinder, piston |
| **Sound** | 🔊 | noise, db |
| **Weight** | ⚖️ | weight, gewicht |
| **Angle** | 📐 | angle, hoek |
| **Application** | 🎯 | application, toepassing |

### **Smart Matching**
- Exact match first
- Partial match second
- Fallback: 🔹 (generic icon)

---

## 📊 Color Coding System

| Category | Background | Text | Border | Properties |
|----------|-----------|------|--------|------------|
| **Specifications** | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Type, Material, Housing |
| **Dimensions** | `bg-green-50` | `text-green-700` | `border-green-200` | Size, Length, Diameter |
| **Performance** | `bg-orange-50` | `text-orange-700` | `border-orange-200` | Power, Pressure, Flow |
| **Application** | `bg-purple-50` | `text-purple-700` | `border-purple-200` | Usage, Temperature |

---

## 🔧 How It Works

### **1. Data Flow**

```
Original JSON (documents/Product_pdfs/json/)
    ↓
generate_image_based_products.js
    ↓
Group by "image" field
    ↓
public/data/*_products.json
    ↓
ImageBasedProductCard component
    ↓
Display with icons and categories
```

### **2. Image-Based Grouping**

Products with the same `image` field are grouped:
```json
{
  "image": "images/abs-persluchtbuizen/abs-bocht-90__v1.webp",
  "products": [
    { "sku": "ABSB02090", "properties": {...} },  // 20mm
    { "sku": "ABSB02590", "properties": {...} },  // 25mm
    { "sku": "ABSB03290", "properties": {...} }   // 32mm
  ]
}
```

All three SKUs appear in the dropdown because they share the same product image.

### **3. Property Categorization**

The system automatically categorizes properties:

```typescript
// Input
{
  "maat": "20 mm",
  "werkdruk": "10 bar",
  "type": "compressed_air_pipe",
  "angle": "90°"
}

// Output (categorized)
Dimensions: { maat: "20 mm", angle: "90°" }
Performance: { werkdruk: "10 bar" }
Specifications: { type: "compressed_air_pipe" }
```

---

## 🚀 Usage

### **Basic Usage**
```tsx
import ImageBasedProductCard from '@/components/ImageBasedProductCard';

<ImageBasedProductCard
  productGroup={productGroup}
  viewMode="grid"  // or "list"
/>
```

### **Load Data**
```tsx
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('/data/abs_persluchtbuizen_products.json')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

### **Display in Grid**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {products.map((group, index) => (
    <ImageBasedProductCard
      key={index}
      productGroup={group}
      viewMode="grid"
    />
  ))}
</div>
```

---

## 📝 Demo Page

Visit the demo page to see it in action:
```
http://localhost:3000/catalog/abs-products-demo
```

**Features demonstrated:**
- ✅ Grid and List view modes
- ✅ SKU dropdown with multiple products
- ✅ Icon-based property display
- ✅ Color-coded categories
- ✅ PDF links
- ✅ Add to Quote functionality

---

## 🔍 Generated Data Files

All generated files in `public/data/`:

| Catalog | Products | Groups | File |
|---------|----------|--------|------|
| ABS Persluchtbuizen | 238 | 10 | `abs_persluchtbuizen_products.json` |
| Pomp Specials | 153 | 18 | `pomp_specials_products.json` |
| Messing Draadfittingen | 210 | 71 | `messing_draadfittingen_products.json` |
| RVS Draadfittingen | 526 | 93 | `rvs_draadfittingen_products.json` |
| Makita Catalogus | 1,455 | 105 | `makita_catalogus_2022_nl_products.json` |
| ... 20 more catalogs | ... | ... | ... |
| **TOTAL** | **14,395** | **855** | **25 files** |

---

## 🛠️ Customization

### **Add New Property Icons**

Edit `src/lib/propertyIcons.ts`:
```typescript
export const PROPERTY_ICONS: Record<string, string> = {
  // Add your property
  my_custom_property: '🎁',
  ...
};
```

### **Adjust Category Patterns**

Edit `src/lib/propertyCategories.ts`:
```typescript
const CATEGORY_PATTERNS: Record<PropertyCategory, string[]> = {
  specifications: [
    'my_spec_property',  // Add here
    ...
  ],
};
```

### **Change Colors**

Edit category configs in `src/lib/propertyCategories.ts`:
```typescript
export const CATEGORY_CONFIGS = {
  specifications: {
    bgColor: 'bg-blue-50',     // Change background
    textColor: 'text-blue-700', // Change text
    borderColor: 'border-blue-200', // Change border
  },
};
```

---

## 📋 Next Steps

### **To Use in Production:**

1. **Apply to all catalog pages**
   ```tsx
   // Replace old component
   import ImageBasedProductCard from '@/components/ImageBasedProductCard';
   
   // Use image-based data
   fetch('/data/[catalog]_products.json')
   ```

2. **Update navigation**
   - Create routes for all catalogs
   - Use image-based data files

3. **Regenerate data when PDFs change**
   ```bash
   node scripts/generate_image_based_products.js
   ```

### **Potential Enhancements:**
- [ ] Search within product properties
- [ ] Filter by category
- [ ] Sort by property values
- [ ] Property comparison view
- [ ] Image gallery (use `all_images` array)
- [ ] Property tooltips with descriptions
- [ ] Export properties to CSV
- [ ] Print-friendly view

---

## 🎯 Key Benefits

1. **Visual Clarity** - Icons make properties instantly recognizable
2. **Flexible Display** - Adapts to any product type
3. **Smart Grouping** - Related products appear together
4. **Color Organization** - Easy to scan and understand
5. **Complete Data** - All properties shown, no information hidden
6. **PDF Integration** - Direct links to source documents

---

## ✅ Summary

Created a complete icon-based product card system with:
- 🎨 100+ property icons
- 📊 4 color-coded categories
- 🏷️ Image-based SKU grouping
- 📄 PDF integration
- 🔄 Grid/List view modes
- 💾 855 product groups ready to use

**Everything is ready for production use!** 🚀

Test it at: `http://localhost:3000/catalog/abs-products-demo`
