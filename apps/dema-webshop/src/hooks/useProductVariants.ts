import { useMemo, useCallback } from 'react';
import variantsData from '../../public/data/product_variants.json';

interface VariantGroup {
  image_url: string;
  variant_count: number;
  primary_sku: string;
  variants: Array<{
    sku: string;
    name: string;
    category?: string;
    catalog?: string;
    price?: number | null;
    specs?: Array<{ name: string; value: string }>;
  }>;
}

interface Product {
  sku: string;
  imageUrl?: string;
  media?: Array<{ url: string }>;
  [key: string]: any;
}

export function useProductVariants() {
  // Create a map of imageUrl -> variant group for quick lookup
  const imageToGroupMap = useMemo(() => {
    const map = new Map<string, VariantGroup>();
    
    variantsData.groups.forEach((group: any) => {
      map.set(group.image_url, group as VariantGroup);
    });
    
    return map;
  }, []);
  
  // Create a map of SKU -> variant group for quick lookup
  const skuToGroupMap = useMemo(() => {
    const map = new Map<string, VariantGroup>();
    
    variantsData.groups.forEach((group: any) => {
      group.variants.forEach((variant: any) => {
        map.set(variant.sku, group as VariantGroup);
      });
    });
    
    return map;
  }, []);
  
  /**
   * Get variant group for a product
   */
  const getVariantGroup = (product: Product): VariantGroup | null => {
    const imageUrl = product.imageUrl || product.media?.[0]?.url;
    
    if (!imageUrl) return null;
    
    return imageToGroupMap.get(imageUrl) || null;
  };
  
  /**
   * Check if a product has variants
   */
  const hasVariants = (product: Product): boolean => {
    const group = getVariantGroup(product);
    return group ? group.variant_count > 1 : false;
  };
  
  /**
   * Get variant group by SKU
   */
  const getGroupBySku = (sku: string): VariantGroup | null => {
    return skuToGroupMap.get(sku) || null;
  };
  
  /**
   * Process products list to group variants
   * Returns a mixed array of individual products and variant groups
   */
  const processProductsWithVariants = (products: Product[]) => {
    const processed: Array<Product | { type: 'variant'; group: VariantGroup; processed: boolean }> = [];
    const processedImages = new Set<string>();
    
    products.forEach(product => {
      const imageUrl = product.imageUrl || product.media?.[0]?.url;
      
      if (!imageUrl) {
        // No image, add as regular product
        processed.push(product);
        return;
      }
      
      // Skip if we already processed this image (variant group)
      if (processedImages.has(imageUrl)) {
        return;
      }
      
      const group = imageToGroupMap.get(imageUrl);
      
      if (group && group.variant_count > 1) {
        // This is a variant group
        processed.push({
          type: 'variant',
          group,
          processed: true
        });
        processedImages.add(imageUrl);
      } else {
        // Regular product
        processed.push(product);
      }
    });
    
    return processed;
  };
  
  /**
   * Group live products by shared image URL using EXACT product data
   * Returns array of products and variant groups with full product objects
   */
  const groupProductsByImage = useCallback((products: Product[]) => {
    const imageMap = new Map<string, Product[]>();
    const processedImages = new Set<string>();
    const result: Array<Product | { type: 'variant'; imageUrl: string; variants: Product[]; primarySku: string }> = [];
    
    // Group products by image URL
    products.forEach(product => {
      const imageUrl = product.imageUrl || product.media?.[0]?.url;
      
      if (!imageUrl) {
        return; // Skip products without images
      }
      
      if (!imageMap.has(imageUrl)) {
        imageMap.set(imageUrl, []);
      }
      imageMap.get(imageUrl)!.push(product);
    });
    
    // Log grouping statistics
    const groupsWithMultipleProducts = Array.from(imageMap.entries()).filter(([_, prods]) => prods.length > 1);
    console.log(`🔗 Grouping ${products.length} products by image`);
    console.log(`📊 Found ${groupsWithMultipleProducts.length} images with multiple products`);
    console.log(`📦 Total variant groups: ${groupsWithMultipleProducts.length}`);
    
    // Debug: Check for ABSK products specifically
    const abskProducts = products.filter(p => p.sku?.startsWith('ABSK'));
    if (abskProducts.length > 0) {
      console.log(`\n🔍 DEBUG: Found ${abskProducts.length} ABSK products in this batch:`);
      const abskImages = new Set(abskProducts.map(p => p.imageUrl || p.media?.[0]?.url));
      console.log(`   Images used: ${abskImages.size} unique image(s)`);
      abskImages.forEach(img => {
        const productsWithImage = abskProducts.filter(p => (p.imageUrl || p.media?.[0]?.url) === img);
        console.log(`   - ${img?.substring(img.lastIndexOf('/') + 1)}: ${productsWithImage.length} products`);
        console.log(`     SKUs: ${productsWithImage.map(p => p.sku).join(', ')}`);
      });
    }
    
    // Process each product
    products.forEach(product => {
      const imageUrl = product.imageUrl || product.media?.[0]?.url;
      
      if (!imageUrl) {
        result.push(product);
        return;
      }
      
      // Skip if already processed this image
      if (processedImages.has(imageUrl)) {
        return;
      }
      
      const variantsForImage = imageMap.get(imageUrl) || [];
      
      if (variantsForImage.length > 1) {
        // Multiple products share this image - create variant group
        console.log(`✅ Grouping ${variantsForImage.length} products with image: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
        console.log(`   SKUs: ${variantsForImage.map(p => p.sku).slice(0, 5).join(', ')}${variantsForImage.length > 5 ? '...' : ''}`);
        
        result.push({
          type: 'variant',
          imageUrl,
          variants: variantsForImage, // EXACT product objects, unmodified
          primarySku: variantsForImage[0].sku
        });
        processedImages.add(imageUrl);
      } else {
        // Single product with this image
        result.push(product);
      }
    });
    
    console.log(`📋 Final result: ${result.length} items (${result.filter(r => typeof r === 'object' && 'type' in r && r.type === 'variant').length} variant groups, ${result.filter(r => !('type' in r)).length} individual products)`);
    
    return result;
  }, []);
  
  /**
   * Get statistics about variants
   */
  const getStats = () => {
    return {
      totalGroups: variantsData.total_groups,
      totalVariants: variantsData.total_variants,
      uniqueImages: variantsData.groups.length,
      imagesSaved: variantsData.groups.reduce((sum: number, g: any) => sum + (g.variant_count - 1), 0),
    };
  };
  
  return {
    getVariantGroup,
    hasVariants,
    getGroupBySku,
    processProductsWithVariants,
    groupProductsByImage, // NEW: Use EXACT product data
    getStats,
    allGroups: variantsData.groups as VariantGroup[],
  };
}
