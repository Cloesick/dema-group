'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse } from '@/types'

// =============================================================================
// REACT HOOKS FOR API DATA FETCHING - BLUEPRINT
// =============================================================================
// Custom hooks for managing API state, loading, errors, and caching.
// =============================================================================

// -----------------------------------------------------------------------------
// Generic API Hook
// -----------------------------------------------------------------------------

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean // Fetch immediately on mount
  cache?: boolean // Cache results
  cacheKey?: string // Custom cache key
  cacheTtl?: number // Cache TTL in ms
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, cache: useCache = false, cacheKey, cacheTtl = 60000 } = options
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })
  
  const execute = useCallback(async () => {
    // Check cache first
    if (useCache && cacheKey) {
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cacheTtl) {
        setState({ data: cached.data as T, loading: false, error: null })
        return cached.data as T
      }
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetcher()
      
      if (response.success && response.data) {
        // Update cache
        if (useCache && cacheKey) {
          cache.set(cacheKey, { data: response.data, timestamp: Date.now() })
        }
        
        setState({ data: response.data, loading: false, error: null })
        return response.data
      } else {
        const errorMessage = response.error?.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setState({ data: null, loading: false, error: errorMessage })
      return null
    }
  }, [fetcher, useCache, cacheKey, cacheTtl])
  
  // Fetch on mount if immediate
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])
  
  return {
    ...state,
    refetch: execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  }
}

// -----------------------------------------------------------------------------
// Mutation Hook (for POST/PUT/DELETE)
// -----------------------------------------------------------------------------

interface UseMutationState<T> {
  data: T | null
  loading: boolean
  error: string | null
  success: boolean
}

export function useMutation<T, V = unknown>(
  mutator: (variables: V) => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  })
  
  const mutate = useCallback(async (variables: V) => {
    setState({ data: null, loading: true, error: null, success: false })
    
    try {
      const response = await mutator(variables)
      
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null, success: true })
        return response.data
      } else {
        const errorMessage = response.error?.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage, success: false })
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setState({ data: null, loading: false, error: errorMessage, success: false })
      return null
    }
  }, [mutator])
  
  return {
    ...state,
    mutate,
    reset: () => setState({ data: null, loading: false, error: null, success: false }),
  }
}

// -----------------------------------------------------------------------------
// Paginated Data Hook
// -----------------------------------------------------------------------------

interface UsePaginatedState<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
  loading: boolean
  error: string | null
  hasNext: boolean
  hasPrevious: boolean
}

export function usePaginated<T>(
  fetcher: (page: number, limit: number) => Promise<ApiResponse<{ items: T[]; page: number; totalPages: number; total: number; hasNext: boolean; hasPrevious: boolean }>>,
  initialLimit = 20
) {
  const [state, setState] = useState<UsePaginatedState<T>>({
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: true,
    error: null,
    hasNext: false,
    hasPrevious: false,
  })
  const [limit] = useState(initialLimit)
  
  const fetchPage = useCallback(async (page: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetcher(page, limit)
      
      if (response.success && response.data) {
        setState({
          items: response.data.items,
          page: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.total,
          loading: false,
          error: null,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        })
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error?.message || 'An error occurred',
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      }))
    }
  }, [fetcher, limit])
  
  // Initial fetch
  useEffect(() => {
    fetchPage(1)
  }, [fetchPage])
  
  return {
    ...state,
    goToPage: fetchPage,
    nextPage: () => state.hasNext && fetchPage(state.page + 1),
    prevPage: () => state.hasPrevious && fetchPage(state.page - 1),
    refresh: () => fetchPage(state.page),
  }
}

// -----------------------------------------------------------------------------
// Infinite Scroll Hook
// -----------------------------------------------------------------------------

interface UseInfiniteState<T> {
  items: T[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
}

export function useInfinite<T>(
  fetcher: (page: number, limit: number) => Promise<ApiResponse<{ items: T[]; hasNext: boolean }>>,
  limit = 20
) {
  const [state, setState] = useState<UseInfiniteState<T>>({
    items: [],
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: true,
  })
  const [page, setPage] = useState(1)
  
  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) return
    
    setState(prev => ({ ...prev, loadingMore: true }))
    
    try {
      const response = await fetcher(page, limit)
      
      if (response.success && response.data) {
        setState(prev => ({
          items: [...prev.items, ...response.data!.items],
          loading: false,
          loadingMore: false,
          error: null,
          hasMore: response.data!.hasNext,
        }))
        setPage(p => p + 1)
      } else {
        setState(prev => ({
          ...prev,
          loadingMore: false,
          error: response.error?.message || 'An error occurred',
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        loadingMore: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      }))
    }
  }, [fetcher, page, limit, state.loadingMore, state.hasMore])
  
  // Initial load
  useEffect(() => {
    loadMore()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const reset = useCallback(() => {
    setState({
      items: [],
      loading: true,
      loadingMore: false,
      error: null,
      hasMore: true,
    })
    setPage(1)
  }, [])
  
  return {
    ...state,
    loadMore,
    reset,
  }
}

// -----------------------------------------------------------------------------
// Debounced Search Hook
// -----------------------------------------------------------------------------

export function useDebouncedSearch<T>(
  searcher: (query: string) => Promise<ApiResponse<T>>,
  delay = 300
) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  
  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [query, delay])
  
  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setState({ data: null, loading: false, error: null })
      return
    }
    
    const search = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const response = await searcher(debouncedQuery)
        
        if (response.success) {
          setState({ data: response.data || null, loading: false, error: null })
        } else {
          setState({ data: null, loading: false, error: response.error?.message || 'Search failed' })
        }
      } catch (err) {
        setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Search failed' })
      }
    }
    
    search()
  }, [debouncedQuery, searcher])
  
  return {
    query,
    setQuery,
    ...state,
    clear: () => {
      setQuery('')
      setState({ data: null, loading: false, error: null })
    },
  }
}

// -----------------------------------------------------------------------------
// Local Storage Persistence Hook
// -----------------------------------------------------------------------------

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }, [key, storedValue])
  
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }, [key, initialValue])
  
  return [storedValue, setValue, removeValue] as const
}
