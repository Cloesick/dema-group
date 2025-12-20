// =============================================================================
// API SERVICE LAYER - BLUEPRINT
// =============================================================================
// Centralized API client for all portal API calls.
// Handles authentication, error handling, and response parsing.
// =============================================================================

import type { 
  Product, 
  Category, 
  Company, 
  Customer, 
  Order, 
  ShoppingList,
  Cart,
  Course,
  SearchQuery,
  SearchResult,
  ApiResponse,
  PaginatedResponse
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// -----------------------------------------------------------------------------
// API Client Configuration
// -----------------------------------------------------------------------------

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }
  
  // Set auth token (call after login)
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`,
    }
  }
  
  // Clear auth token (call on logout)
  clearAuthToken() {
    const { Authorization, ...rest } = this.defaultHeaders as Record<string, string>
    this.defaultHeaders = rest
  }
  
  // Build URL with query params
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }
  
  // Generic request method
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config
    const url = this.buildUrl(endpoint, params)
    
    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: `HTTP_${response.status}`,
            message: response.statusText,
          },
        }
      }
      
      return data as ApiResponse<T>
      
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      }
    }
  }
  
  // Convenience methods
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>(endpoint, { method: 'GET', params })
  }
  
  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) })
  }
  
  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) })
  }
  
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL)

// -----------------------------------------------------------------------------
// Product API
// -----------------------------------------------------------------------------

export const productApi = {
  // Search/list products
  search: (query: SearchQuery) => {
    const params: Record<string, string | number | undefined> = {
      q: query.q || undefined,
      category: query.category,
      subcategory: query.subcategory,
      brand: query.brand,
      company: query.company,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    }
    
    // Add filters as separate params
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params[`filters[${key}]`] = value.join(',')
        } else if (typeof value === 'object' && value !== null) {
          // Range filter
          if (value.min !== undefined) params[`filters[${key}][min]`] = value.min
          if (value.max !== undefined) params[`filters[${key}][max]`] = value.max
        } else {
          params[`filters[${key}]`] = String(value)
        }
      })
    }
    
    return api.get<PaginatedResponse<Product>>('/api/products', params)
  },
  
  // Get single product
  getById: (id: string) => api.get<Product>(`/api/products/${id}`),
  
  // Get product by slug
  getBySlug: (slug: string) => api.get<Product>(`/api/products/${slug}`),
  
  // Get related products
  getRelated: (productId: string, limit = 4) => 
    api.get<Product[]>(`/api/products/${productId}/related`, { limit }),
  
  // Get product stock
  getStock: (productId: string) => 
    api.get<Product['stockStatus']>(`/api/products/${productId}/stock`),
}

// -----------------------------------------------------------------------------
// Category API
// -----------------------------------------------------------------------------

export const categoryApi = {
  // Get all categories
  getAll: () => api.get<Category[]>('/api/categories'),
  
  // Get single category with subcategories
  getById: (id: string) => api.get<Category>(`/api/categories/${id}`),
  
  // Get category filters/facets
  getFilters: (categoryId: string) => 
    api.get<Category['filters']>(`/api/categories/${categoryId}/filters`),
}

// -----------------------------------------------------------------------------
// Company/Dealer API
// -----------------------------------------------------------------------------

export const companyApi = {
  // Get all companies/dealers
  getAll: (params?: { type?: string; category?: string }) => 
    api.get<Company[]>('/api/companies', params),
  
  // Get single company
  getById: (id: string) => api.get<Company>(`/api/companies/${id}`),
  
  // Search dealers by location
  searchByLocation: (lat: number, lng: number, radius = 50) =>
    api.get<Company[]>('/api/companies/nearby', { lat, lng, radius }),
}

// -----------------------------------------------------------------------------
// Customer/Auth API
// -----------------------------------------------------------------------------

export const authApi = {
  // Login
  login: (email: string, password: string) =>
    api.post<{ token: string; customer: Customer }>('/api/auth/login', { email, password }),
  
  // Register
  register: (data: Partial<Customer>) =>
    api.post<{ token: string; customer: Customer }>('/api/auth/register', data),
  
  // Logout
  logout: () => api.post<void>('/api/auth/logout', {}),
  
  // Get current user
  me: () => api.get<Customer>('/api/auth/me'),
  
  // Update profile
  updateProfile: (data: Partial<Customer>) =>
    api.put<Customer>('/api/auth/profile', data),
  
  // Change password
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>('/api/auth/change-password', { currentPassword, newPassword }),
  
  // Request password reset
  requestPasswordReset: (email: string) =>
    api.post<void>('/api/auth/forgot-password', { email }),
  
  // Reset password with token
  resetPassword: (token: string, newPassword: string) =>
    api.post<void>('/api/auth/reset-password', { token, newPassword }),
}

// -----------------------------------------------------------------------------
// Order API
// -----------------------------------------------------------------------------

export const orderApi = {
  // Get customer orders
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Order>>('/api/orders', params),
  
  // Get single order
  getById: (id: string) => api.get<Order>(`/api/orders/${id}`),
  
  // Create order
  create: (data: Partial<Order>) => api.post<Order>('/api/orders', data),
  
  // Cancel order
  cancel: (id: string, reason?: string) =>
    api.post<Order>(`/api/orders/${id}/cancel`, { reason }),
  
  // Reorder (copy items to cart)
  reorder: (id: string) => api.post<Cart>(`/api/orders/${id}/reorder`, {}),
  
  // Get order tracking
  getTracking: (id: string) =>
    api.get<{ carrier: string; trackingNumber: string; events: unknown[] }>(`/api/orders/${id}/tracking`),
}

// -----------------------------------------------------------------------------
// Cart API
// -----------------------------------------------------------------------------

export const cartApi = {
  // Get current cart
  get: () => api.get<Cart>('/api/cart'),
  
  // Add item to cart
  addItem: (productId: string, quantity: number) =>
    api.post<Cart>('/api/cart/items', { productId, quantity }),
  
  // Update item quantity
  updateItem: (itemId: string, quantity: number) =>
    api.put<Cart>(`/api/cart/items/${itemId}`, { quantity }),
  
  // Remove item from cart
  removeItem: (itemId: string) => api.delete<Cart>(`/api/cart/items/${itemId}`),
  
  // Clear cart
  clear: () => api.delete<Cart>('/api/cart'),
  
  // Apply discount code
  applyDiscount: (code: string) =>
    api.post<Cart>('/api/cart/discount', { code }),
  
  // Remove discount code
  removeDiscount: () => api.delete<Cart>('/api/cart/discount'),
}

// -----------------------------------------------------------------------------
// Shopping List API
// -----------------------------------------------------------------------------

export const shoppingListApi = {
  // Get all lists
  getAll: () => api.get<ShoppingList[]>('/api/shopping-lists'),
  
  // Get single list
  getById: (id: string) => api.get<ShoppingList>(`/api/shopping-lists/${id}`),
  
  // Create list
  create: (name: string, description?: string) =>
    api.post<ShoppingList>('/api/shopping-lists', { name, description }),
  
  // Update list
  update: (id: string, data: Partial<ShoppingList>) =>
    api.put<ShoppingList>(`/api/shopping-lists/${id}`, data),
  
  // Delete list
  delete: (id: string) => api.delete<void>(`/api/shopping-lists/${id}`),
  
  // Add item to list
  addItem: (listId: string, productId: string, quantity: number) =>
    api.post<ShoppingList>(`/api/shopping-lists/${listId}/items`, { productId, quantity }),
  
  // Remove item from list
  removeItem: (listId: string, itemId: string) =>
    api.delete<ShoppingList>(`/api/shopping-lists/${listId}/items/${itemId}`),
  
  // Add all items to cart
  addAllToCart: (listId: string) =>
    api.post<Cart>(`/api/shopping-lists/${listId}/add-to-cart`, {}),
}

// -----------------------------------------------------------------------------
// Course/Academy API
// -----------------------------------------------------------------------------

export const courseApi = {
  // Get all courses
  getAll: (params?: { category?: string; level?: string; free?: boolean }) =>
    api.get<Course[]>('/api/courses', params),
  
  // Get single course
  getById: (id: string) => api.get<Course>(`/api/courses/${id}`),
  
  // Get course by slug
  getBySlug: (slug: string) => api.get<Course>(`/api/courses/slug/${slug}`),
  
  // Enroll in course
  enroll: (courseId: string) =>
    api.post<{ enrollmentId: string }>(`/api/courses/${courseId}/enroll`, {}),
  
  // Get enrollment progress
  getProgress: (courseId: string) =>
    api.get<{ progress: number; completedLessons: string[] }>(`/api/courses/${courseId}/progress`),
  
  // Mark lesson complete
  completeLesson: (courseId: string, lessonId: string) =>
    api.post<void>(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {}),
  
  // Submit quiz answers
  submitQuiz: (courseId: string, lessonId: string, answers: Record<string, string[]>) =>
    api.post<{ score: number; passed: boolean }>(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, { answers }),
}

// -----------------------------------------------------------------------------
// Inventory API
// -----------------------------------------------------------------------------

export const inventoryApi = {
  // Get stock for product
  getStock: (sku: string, companyId?: string) =>
    api.get<{ sku: string; quantity: number; warehouses: unknown[] }>('/api/inventory', { sku, companyId }),
  
  // Get stock for multiple products
  getBulkStock: (skus: string[]) =>
    api.post<Record<string, { quantity: number; inStock: boolean }>>('/api/inventory/bulk', { skus }),
  
  // Subscribe to stock notifications
  subscribeStockNotification: (productId: string, email: string) =>
    api.post<void>('/api/inventory/notify', { productId, email }),
}

// -----------------------------------------------------------------------------
// Configurator API
// -----------------------------------------------------------------------------

export const configuratorApi = {
  // Get configurator definition
  getConfigurator: (type: string) =>
    api.get<unknown>(`/api/configurator/${type}`),
  
  // Validate configuration
  validate: (type: string, selections: Record<string, unknown>) =>
    api.post<{ isValid: boolean; errors: string[] }>(`/api/configurator/${type}/validate`, { selections }),
  
  // Calculate price
  calculatePrice: (type: string, selections: Record<string, unknown>) =>
    api.post<{ price: number; breakdown: unknown[] }>(`/api/configurator/${type}/price`, { selections }),
  
  // Save configuration
  saveConfiguration: (type: string, name: string, selections: Record<string, unknown>) =>
    api.post<{ configurationId: string }>(`/api/configurator/${type}/save`, { name, selections }),
  
  // Load saved configuration
  loadConfiguration: (configurationId: string) =>
    api.get<unknown>(`/api/configurator/configurations/${configurationId}`),
  
  // Add configured product to cart
  addToCart: (type: string, selections: Record<string, unknown>, quantity: number) =>
    api.post<Cart>(`/api/configurator/${type}/add-to-cart`, { selections, quantity }),
}
