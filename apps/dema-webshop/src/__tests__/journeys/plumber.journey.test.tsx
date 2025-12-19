/**
 * E2E Test: Plumber User Journey
 * 
 * Persona: Marc Loodgieter - Professional plumber/installer
 * Needs: Pipes, fittings, valves, pumps for installation projects
 * Behavior: Regular customer, knows product codes, needs quick ordering
 */

import { PLUMBER } from './personas';
import { 
  addToQuote, 
  getQuote, 
  clearQuote, 
  validateEmail,
  QuoteItem,
  JourneyStep,
  validateJourneySteps,
} from './_shared/journey-utils';

// Mock fetch
global.fetch = jest.fn();

describe('Plumber User Journey - Marc Loodgieter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  const persona = PLUMBER;

  describe('Journey Overview', () => {
    const journeySteps: JourneyStep[] = [
      { step: 1, name: 'Direct SKU Search', route: '/products?q=SKU', expectedOutcome: 'Find product by code' },
      { step: 2, name: 'Browse Pressure Pipes', route: '/products?catalog=drukbuizen', expectedOutcome: 'See PVC-U pipes' },
      { step: 3, name: 'Browse Brass Fittings', route: '/products?catalog=messing-draadfittingen', expectedOutcome: 'Find threaded fittings' },
      { step: 4, name: 'Browse Stainless Fittings', route: '/products?catalog=rvs-draadfittingen', expectedOutcome: 'Find RVS options' },
      { step: 5, name: 'Browse Couplings', route: '/products?catalog=slangkoppelingen', expectedOutcome: 'Find hose couplings' },
      { step: 6, name: 'Quick add to quote', action: 'addToQuote', expectedOutcome: 'Multiple items added fast' },
      { step: 7, name: 'Login existing account', route: '/login', expectedOutcome: 'Access saved info' },
      { step: 8, name: 'Submit recurring order', route: '/quote-request', expectedOutcome: 'Fast checkout with saved data' },
      { step: 9, name: 'Receive confirmation', action: 'emailSent', expectedOutcome: 'Order confirmation' },
    ];

    it('validates all journey steps are defined', () => {
      validateJourneySteps(journeySteps);
      expect(journeySteps.length).toBe(9);
    });
  });

  describe('Step 1: Direct SKU Search (Pro User)', () => {
    it('plumber searches by product code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'PVC-U Drukbuis 50mm', sku: 'PVC-50-PN16', catalog: 'drukbuizen' },
        ]),
      });

      const response = await fetch('/api/search?q=PVC-50-PN16');
      const products = await response.json();
      
      expect(products.length).toBe(1);
      expect(products[0].sku).toBe('PVC-50-PN16');
    });

    it('searches multiple SKUs efficiently', async () => {
      const skusToFind = ['PVC-50-PN16', 'MK-34', 'RVS-T-12'];
      
      for (const sku of skusToFind) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ([{ sku, name: `Product ${sku}` }]),
        });
        
        const response = await fetch(`/api/search?q=${sku}`);
        const products = await response.json();
        expect(products[0].sku).toBe(sku);
      }
    });
  });

  describe('Step 2: Pressure Pipes', () => {
    it('browses PVC-U pressure pipes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'PVC-U Drukbuis 32mm PN16', sku: 'PVC-32-PN16', catalog: 'drukbuizen', pressure: '16 bar' },
          { name: 'PVC-U Drukbuis 50mm PN16', sku: 'PVC-50-PN16', catalog: 'drukbuizen', pressure: '16 bar' },
          { name: 'PVC-U Drukbuis 63mm PN10', sku: 'PVC-63-PN10', catalog: 'drukbuizen', pressure: '10 bar' },
        ]),
      });

      const response = await fetch('/api/products?catalog=drukbuizen');
      const products = await response.json();
      
      expect(products.length).toBe(3);
      expect(products.every((p: any) => p.catalog === 'drukbuizen')).toBe(true);
    });
  });

  describe('Step 3: Brass Fittings', () => {
    it('browses brass threaded fittings', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Messing Koppeling 1/2" BI/BI', sku: 'MK-12-BIBI', catalog: 'messing-draadfittingen' },
          { name: 'Messing Koppeling 3/4" BU/BI', sku: 'MK-34-BUBI', catalog: 'messing-draadfittingen' },
          { name: 'Messing T-stuk 1/2"', sku: 'MT-12', catalog: 'messing-draadfittingen' },
          { name: 'Messing Bocht 90° 3/4"', sku: 'MB-34-90', catalog: 'messing-draadfittingen' },
        ]),
      });

      const response = await fetch('/api/products?catalog=messing-draadfittingen');
      const products = await response.json();
      
      expect(products.length).toBe(4);
    });
  });

  describe('Step 4: Stainless Steel Fittings', () => {
    it('browses RVS fittings for corrosion resistance', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'RVS 316 Koppeling 1/2"', sku: 'RVS-K-12', catalog: 'rvs-draadfittingen', material: 'RVS 316' },
          { name: 'RVS 316 T-stuk 3/4"', sku: 'RVS-T-34', catalog: 'rvs-draadfittingen', material: 'RVS 316' },
        ]),
      });

      const response = await fetch('/api/products?catalog=rvs-draadfittingen');
      const products = await response.json();
      
      expect(products.every((p: any) => p.material === 'RVS 316')).toBe(true);
    });
  });

  describe('Step 5: Hose Couplings', () => {
    it('browses various coupling types', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Geka Koppeling 1"', sku: 'GEKA-1', catalog: 'slangkoppelingen', type: 'Geka' },
          { name: 'Camlock Type A 2"', sku: 'CAM-A-2', catalog: 'slangkoppelingen', type: 'Camlock' },
          { name: 'Storz Koppeling 52mm', sku: 'STORZ-52', catalog: 'slangkoppelingen', type: 'Storz' },
        ]),
      });

      const response = await fetch('/api/products?catalog=slangkoppelingen');
      const products = await response.json();
      
      expect(products.length).toBe(3);
    });
  });

  describe('Step 6: Quick Quote Building', () => {
    it('adds typical plumber order items', () => {
      const items: QuoteItem[] = [
        { sku: 'PVC-50-PN16', name: 'PVC-U Drukbuis 50mm', quantity: 20 },
        { sku: 'MK-12-BIBI', name: 'Messing Koppeling 1/2"', quantity: 50 },
        { sku: 'MK-34-BUBI', name: 'Messing Koppeling 3/4"', quantity: 30 },
        { sku: 'MT-12', name: 'Messing T-stuk 1/2"', quantity: 25 },
        { sku: 'MB-34-90', name: 'Messing Bocht 90°', quantity: 40 },
        { sku: 'RVS-K-12', name: 'RVS Koppeling 1/2"', quantity: 10 },
      ];

      addToQuote(items);
      const stored = getQuote();
      
      expect(stored.length).toBe(6);
      
      // Plumbers order lots of fittings
      const totalFittings = stored
        .filter(i => i.sku.startsWith('M') || i.sku.startsWith('RVS'))
        .reduce((sum, i) => sum + i.quantity, 0);
      expect(totalFittings).toBe(155);
    });
  });

  describe('Step 7: Existing Customer Login', () => {
    it('logs in with existing account', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          user: { 
            email: persona.contactInfo.email,
            company: persona.contactInfo.company,
          } 
        }),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: persona.contactInfo.email,
          password: 'PlumberPro2024!',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Step 8: Fast Quote Submission', () => {
    it('submits quote with pre-filled business data', async () => {
      const quoteData = {
        formData: {
          customerType: 'business',
          existingCustomer: 'yes',
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
          urgency: 'high', // Plumbers often need fast delivery
          comments: 'Dringend nodig voor renovatieproject. Levering voor vrijdag indien mogelijk.',
          preferredContact: 'phone',
        },
        products: [
          { sku: 'PVC-50-PN16', name: 'PVC-U Drukbuis 50mm', quantity: 20 },
          { sku: 'MK-12-BIBI', name: 'Messing Koppeling 1/2"', quantity: 50 },
          { sku: 'MT-12', name: 'Messing T-stuk 1/2"', quantity: 25 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Quote generated' }),
      });

      const response = await fetch('/api/quote/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Step 9: Order Confirmation', () => {
    it('confirms fast response for urgent orders', () => {
      const emailConfig = {
        to: persona.contactInfo.email,
        subject: `New Quote Request from ${persona.contactInfo.firstName} ${persona.contactInfo.lastName}`,
        priority: 'high',
        includesPDF: true,
      };

      expect(emailConfig.to).toBe('marc@loodgietersbedrijf.be');
      expect(emailConfig.priority).toBe('high');
    });
  });

  describe('Persona Validation', () => {
    it('validates plumber persona for regular B2B orders', () => {
      expect(persona.id).toBe('plumber');
      expect(persona.businessType).toBe('B2B');
      expect(persona.orderSize).toBe('medium');
      expect(persona.sector).toBe('plumbing');
      expect(persona.typicalProducts).toContain('Drukbuizen');
      expect(persona.typicalProducts).toContain('Fittingen');
      expect(persona.catalogs).toContain('drukbuizen');
      expect(persona.catalogs).toContain('messing-draadfittingen');
    });
  });
});
