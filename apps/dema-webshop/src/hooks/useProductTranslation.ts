/**
 * Hook for translating product names using LocaleContext
 */

import { useLocale } from '@/contexts/LocaleContext';
import { getProductName, getCategoryName, getPropertyName, getUIText } from '@/lib/multilanguage';
import type { Language } from '@/lib/multilanguage';

export function useProductTranslation() {
  const { locale } = useLocale();
  
  // Map locale to language type
  const language = locale as Language;

  return {
    language,
    /**
     * Get product name in current language
     */
    productName: (product: any) => getProductName(product, language),
    
    /**
     * Get category name in current language
     */
    categoryName: (category: string) => getCategoryName(category, language),
    
    /**
     * Get property/attribute name in current language
     */
    propertyName: (property: string) => getPropertyName(property, language),
    
    /**
     * Get UI text in current language
     */
    uiText: (key: Parameters<typeof getUIText>[0]) => getUIText(key, language),
  };
}
