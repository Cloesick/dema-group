/**
 * Shared utilities for user journey tests
 */

// Mock fetch helper
export const mockFetch = (responses: Record<string, any>) => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    const matchedKey = Object.keys(responses).find(key => url.includes(key));
    if (matchedKey) {
      return Promise.resolve({
        ok: true,
        json: async () => responses[matchedKey],
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ success: true }),
    });
  });
};

// Quote storage helpers
export const addToQuote = (items: QuoteItem[]) => {
  localStorage.setItem('dema-quote-items', JSON.stringify(items));
};

export const getQuote = (): QuoteItem[] => {
  return JSON.parse(localStorage.getItem('dema-quote-items') || '[]');
};

export const clearQuote = () => {
  localStorage.removeItem('dema-quote-items');
};

// Types
export interface QuoteItem {
  sku: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  category?: string;
}

export interface UserPersona {
  id: string;
  name: string;
  businessType: 'B2B' | 'B2C' | 'B2B/B2C';
  sector: string;
  typicalProducts: string[];
  catalogs: string[];
  orderSize: 'small' | 'medium' | 'large';
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    vatNumber?: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export interface JourneyStep {
  step: number;
  name: string;
  route?: string;
  action?: string;
  expectedOutcome: string;
}

// Journey validation
export const validateJourneySteps = (steps: JourneyStep[]) => {
  expect(steps.length).toBeGreaterThan(0);
  steps.forEach((step, index) => {
    expect(step.step).toBe(index + 1);
    expect(step.name).toBeTruthy();
    expect(step.expectedOutcome).toBeTruthy();
  });
};

// Product search simulation
export const searchProducts = async (query: string, catalog?: string) => {
  const url = catalog 
    ? `/api/products?catalog=${catalog}&q=${query}`
    : `/api/search?q=${query}`;
  const response = await fetch(url);
  return response.json();
};

// Quote submission simulation
export const submitQuoteRequest = async (persona: UserPersona, products: QuoteItem[]) => {
  const response = await fetch('/api/quote/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formData: {
        customerType: persona.businessType === 'B2C' ? 'private' : 'business',
        firstName: persona.contactInfo.firstName,
        lastName: persona.contactInfo.lastName,
        email: persona.contactInfo.email,
        phone: persona.contactInfo.phone,
        companyName: persona.contactInfo.company,
        vatNumber: persona.contactInfo.vatNumber,
        businessSector: persona.sector,
        address: persona.contactInfo.address,
        postalCode: persona.contactInfo.postalCode,
        city: persona.contactInfo.city,
        country: persona.contactInfo.country,
        preferredContact: 'email',
      },
      products,
    }),
  });
  return response.json();
};

// Password validation
export const validatePassword = (password: string) => {
  const requirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Contains number', test: (p: string) => /\d/.test(p) },
  ];
  return requirements.every(req => req.test(password));
};

// Email validation
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
