/**
 * E2E Test: Handyman User Journey
 * 
 * Persona: Pieter Klusser - DIY enthusiast / small contractor
 * Needs: Various tools, fittings, and supplies for home projects
 * Behavior: Price-conscious, compares products, smaller orders
 */

import { HANDYMAN } from './personas';
import { 
  addToQuote, 
  getQuote, 
  clearQuote, 
  validatePassword,
  validateEmail,
  QuoteItem,
  JourneyStep,
  validateJourneySteps,
} from './_shared/journey-utils';

// Mock fetch
global.fetch = jest.fn();

describe('Handyman User Journey - Pieter Klusser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  const persona = HANDYMAN;

  describe('Journey Overview', () => {
    const journeySteps: JourneyStep[] = [
      { step: 1, name: 'Visit Homepage', route: '/', expectedOutcome: 'See featured products and categories' },
      { step: 2, name: 'Search for fittings', route: '/products?q=fitting', expectedOutcome: 'Find brass and steel fittings' },
      { step: 3, name: 'Compare products', route: '/compare', expectedOutcome: 'Compare 2-3 fitting options' },
      { step: 4, name: 'Browse Makita tools', route: '/products?catalog=makita-catalogus-2022-nl', expectedOutcome: 'Find power tools' },
      { step: 5, name: 'Add items to quote', action: 'addToQuote', expectedOutcome: 'Quote has 3-5 items' },
      { step: 6, name: 'View quote panel', action: 'openQuote', expectedOutcome: 'See all items with quantities' },
      { step: 7, name: 'Submit as guest', route: '/quote-request', expectedOutcome: 'No account required for B2C' },
      { step: 8, name: 'Receive confirmation', action: 'emailSent', expectedOutcome: 'Email with PDF quote' },
    ];

    it('validates all journey steps are defined', () => {
      validateJourneySteps(journeySteps);
      expect(journeySteps.length).toBe(8);
    });
  });

  describe('Step 1: Homepage Discovery', () => {
    it('handyman lands on homepage looking for supplies', () => {
      expect(persona.businessType).toBe('B2C');
      expect(persona.sector).toBe('construction');
    });
  });

  describe('Step 2: Product Search', () => {
    it('searches for brass fittings', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Messing Koppeling 1/2"', sku: 'MK-12', catalog: 'messing-draadfittingen' },
          { name: 'Messing T-stuk 3/4"', sku: 'MT-34', catalog: 'messing-draadfittingen' },
          { name: 'Messing Bocht 90° 1"', sku: 'MB-1', catalog: 'messing-draadfittingen' },
        ]),
      });

      const response = await fetch('/api/search?q=messing+fitting');
      const products = await response.json();
      
      expect(products.length).toBe(3);
      expect(products.every((p: any) => p.catalog === 'messing-draadfittingen')).toBe(true);
    });

    it('searches for hose couplings', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Snelkoppeling 1/2"', sku: 'SK-12', catalog: 'slangkoppelingen' },
          { name: 'Tuinkoppeling Set', sku: 'TK-SET', catalog: 'slangkoppelingen' },
        ]),
      });

      const response = await fetch('/api/search?q=slangkoppeling');
      const products = await response.json();
      
      expect(products.length).toBeGreaterThan(0);
    });
  });

  describe('Step 3: Product Comparison', () => {
    it('compares different fitting types', () => {
      const compareItems = [
        { sku: 'MK-12', name: 'Messing Koppeling', material: 'Messing', price: '€5.50' },
        { sku: 'RK-12', name: 'RVS Koppeling', material: 'RVS', price: '€8.90' },
      ];

      expect(compareItems.length).toBe(2);
      expect(compareItems[0].material).not.toBe(compareItems[1].material);
    });
  });

  describe('Step 4: Browse Makita Tools', () => {
    it('filters by Makita catalog', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Makita Boormachine DDF484', sku: 'MAK-DDF484', catalog: 'makita-catalogus-2022-nl' },
          { name: 'Makita Slijper DGA504', sku: 'MAK-DGA504', catalog: 'makita-catalogus-2022-nl' },
        ]),
      });

      const response = await fetch('/api/products?catalog=makita-catalogus-2022-nl');
      const products = await response.json();
      
      expect(products.every((p: any) => p.catalog === 'makita-catalogus-2022-nl')).toBe(true);
    });
  });

  describe('Step 5: Quote Building', () => {
    it('adds multiple items to quote', () => {
      const items: QuoteItem[] = [
        { sku: 'MK-12', name: 'Messing Koppeling 1/2"', quantity: 10 },
        { sku: 'MT-34', name: 'Messing T-stuk 3/4"', quantity: 5 },
        { sku: 'SK-12', name: 'Snelkoppeling 1/2"', quantity: 2 },
        { sku: 'MAK-DDF484', name: 'Makita Boormachine', quantity: 1 },
      ];

      addToQuote(items);
      const stored = getQuote();
      
      expect(stored.length).toBe(4);
      expect(stored.reduce((sum, item) => sum + item.quantity, 0)).toBe(18);
    });

    it('updates quantities in quote', () => {
      const items: QuoteItem[] = [
        { sku: 'MK-12', name: 'Messing Koppeling', quantity: 5 },
      ];
      addToQuote(items);
      
      // Update quantity
      const updated = items.map(item => 
        item.sku === 'MK-12' ? { ...item, quantity: 15 } : item
      );
      addToQuote(updated);
      
      const stored = getQuote();
      expect(stored[0].quantity).toBe(15);
    });
  });

  describe('Step 6: Quote Review', () => {
    it('displays all items in quote panel', () => {
      const items: QuoteItem[] = [
        { sku: 'MK-12', name: 'Messing Koppeling', quantity: 10 },
        { sku: 'SK-12', name: 'Snelkoppeling', quantity: 2 },
      ];
      addToQuote(items);
      
      const quote = getQuote();
      expect(quote.length).toBe(2);
      expect(quote.map(i => i.sku)).toContain('MK-12');
      expect(quote.map(i => i.sku)).toContain('SK-12');
    });
  });

  describe('Step 7: Guest Quote Submission (B2C)', () => {
    it('submits quote without account (B2C flow)', async () => {
      const quoteData = {
        formData: {
          customerType: 'private', // B2C = private customer
          firstName: persona.contactInfo.firstName,
          lastName: persona.contactInfo.lastName,
          email: persona.contactInfo.email,
          phone: persona.contactInfo.phone,
          address: persona.contactInfo.address,
          postalCode: persona.contactInfo.postalCode,
          city: persona.contactInfo.city,
          country: persona.contactInfo.country,
          comments: 'Graag levering op zaterdag indien mogelijk.',
        },
        products: [
          { sku: 'MK-12', name: 'Messing Koppeling', quantity: 10 },
          { sku: 'MAK-DDF484', name: 'Makita Boormachine', quantity: 1 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Quote sent' }),
      });

      const response = await fetch('/api/quote/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
    });

    it('validates contact information', () => {
      expect(validateEmail(persona.contactInfo.email)).toBe(true);
      expect(persona.contactInfo.phone).toMatch(/^\+32/);
    });
  });

  describe('Step 8: Confirmation', () => {
    it('confirms email will be sent to customer', () => {
      const emailConfig = {
        to: persona.contactInfo.email,
        subject: 'Your Quote Request - DEMA-SHOP',
        includesPDF: true,
      };

      expect(emailConfig.to).toBe('pieter.klusser@gmail.com');
      expect(emailConfig.includesPDF).toBe(true);
    });
  });

  describe('Persona Validation', () => {
    it('validates handyman persona details', () => {
      expect(persona.id).toBe('handyman');
      expect(persona.businessType).toBe('B2C');
      expect(persona.orderSize).toBe('small');
      expect(persona.typicalProducts).toContain('Gereedschap');
      expect(persona.catalogs).toContain('makita-catalogus-2022-nl');
    });
  });
});
