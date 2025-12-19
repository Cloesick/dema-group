'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CompareProduct {
  group_id: string;
  sku: string;
  name: string;
  imageUrl: string | null;
  catalog: string;
  properties: Record<string, any>;
}

interface CompareContextType {
  compareItems: CompareProduct[];
  addToCompare: (product: CompareProduct) => boolean;
  removeFromCompare: (sku: string) => void;
  clearCompare: () => void;
  isInCompare: (sku: string) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);

  const addToCompare = useCallback((product: CompareProduct): boolean => {
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      return false;
    }
    if (compareItems.some(p => p.sku === product.sku)) {
      return false;
    }
    setCompareItems(prev => [...prev, product]);
    return true;
  }, [compareItems]);

  const removeFromCompare = useCallback((sku: string) => {
    setCompareItems(prev => prev.filter(p => p.sku !== sku));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback((sku: string): boolean => {
    return compareItems.some(p => p.sku === sku);
  }, [compareItems]);

  const canAddMore = compareItems.length < MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
