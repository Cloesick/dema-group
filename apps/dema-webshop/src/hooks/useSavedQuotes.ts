'use client';

import { useState, useEffect, useCallback } from 'react';

interface QuoteItem {
  sku: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  category?: string;
  [key: string]: any;
}

interface SavedQuote {
  id: string;
  name: string;
  items: QuoteItem[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'dema_saved_quotes';

export function useSavedQuotes() {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedQuotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading saved quotes:', e);
    }
  }, []);

  // Save a new quote
  const saveQuote = useCallback((name: string, items: QuoteItem[]): SavedQuote => {
    const newQuote: SavedQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      items,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setSavedQuotes(prev => {
      const updated = [newQuote, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving quote:', e);
      }
      return updated;
    });

    return newQuote;
  }, []);

  // Update an existing quote
  const updateQuote = useCallback((id: string, items: QuoteItem[]) => {
    setSavedQuotes(prev => {
      const updated = prev.map(q => 
        q.id === id 
          ? { ...q, items, updatedAt: Date.now() }
          : q
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating quote:', e);
      }
      return updated;
    });
  }, []);

  // Rename a quote
  const renameQuote = useCallback((id: string, newName: string) => {
    setSavedQuotes(prev => {
      const updated = prev.map(q => 
        q.id === id 
          ? { ...q, name: newName, updatedAt: Date.now() }
          : q
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error renaming quote:', e);
      }
      return updated;
    });
  }, []);

  // Delete a quote
  const deleteQuote = useCallback((id: string) => {
    setSavedQuotes(prev => {
      const updated = prev.filter(q => q.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error deleting quote:', e);
      }
      return updated;
    });
  }, []);

  // Get a quote by ID
  const getQuote = useCallback((id: string): SavedQuote | undefined => {
    return savedQuotes.find(q => q.id === id);
  }, [savedQuotes]);

  return {
    savedQuotes,
    saveQuote,
    updateQuote,
    renameQuote,
    deleteQuote,
    getQuote
  };
}
