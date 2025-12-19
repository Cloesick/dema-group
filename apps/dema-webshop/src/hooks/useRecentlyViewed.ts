'use client';

import { useState, useEffect, useCallback } from 'react';

interface RecentProduct {
  group_id: string;
  name: string;
  imageUrl: string | null;
  catalog: string;
  variant_count: number;
  viewedAt: number;
}

const STORAGE_KEY = 'dema_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentProducts(parsed);
      }
    } catch (e) {
      console.error('Error loading recently viewed:', e);
    }
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = useCallback((product: Omit<RecentProduct, 'viewedAt'>) => {
    setRecentProducts(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.group_id !== product.group_id);
      
      // Add to front with timestamp
      const updated = [
        { ...product, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recently viewed:', e);
      }
      
      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentProducts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing recently viewed:', e);
    }
  }, []);

  return {
    recentProducts,
    addToRecentlyViewed,
    clearRecentlyViewed
  };
}
