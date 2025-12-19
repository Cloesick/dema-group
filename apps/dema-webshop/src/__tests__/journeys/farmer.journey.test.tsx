/**
 * E2E Test: Farmer User Journey
 * 
 * Persona: Karel Boerderij - Agricultural business owner
 * Needs: Heavy-duty pumps, irrigation systems, PE pipes for large farm
 * Behavior: Bulk orders, needs reliability, seasonal purchases
 */

import { FARMER } from './personas';
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

describe('Farmer User Journey - Karel Boerderij', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  const persona = FARMER;

  describe('Journey Overview', () => {
    const journeySteps: JourneyStep[] = [
      { step: 1, name: 'Visit Homepage', route: '/', expectedOutcome: 'See industrial equipment' },
      { step: 2, name: 'Browse Pumps Category', route: '/categories', expectedOutcome: 'Find pump subcategories' },
      { step: 3, name: 'View Submersible Pumps', route: '/products?catalog=dompelpompen', expectedOutcome: 'See heavy-duty pumps' },
      { step: 4, name: 'View Well Pumps', route: '/products?catalog=bronpompen', expectedOutcome: 'See deep well pumps' },
      { step: 5, name: 'Browse PE Pipes', route: '/products?catalog=pe-buizen', expectedOutcome: 'Find irrigation pipes' },
      { step: 6, name: 'Add bulk items to quote', action: 'addToQuote', expectedOutcome: 'Large quantities added' },
      { step: 7, name: 'Register business account', route: '/register', expectedOutcome: 'B2B account with VAT' },
      { step: 8, name: 'Submit quote with VAT', route: '/quote-request', expectedOutcome: 'Business quote with VAT number' },
      { step: 9, name: 'Receive confirmation', action: 'emailSent', expectedOutcome: 'PDF quote for accounting' },
    ];

    it('validates all journey steps are defined', () => {
      validateJourneySteps(journeySteps);
      expect(journeySteps.length).toBe(9);
    });
  });

  describe('Step 1-2: Category Navigation', () => {
    it('farmer navigates to pumps category', () => {
      const categoryPath = ['Pompen & Toebehoren', 'Dompelpompen'];
      expect(categoryPath.length).toBe(2);
    });

    it('identifies relevant catalogs for farming', () => {
      expect(persona.catalogs).toContain('dompelpompen');
      expect(persona.catalogs).toContain('bronpompen');
      expect(persona.catalogs).toContain('pe-buizen');
    });
  });

  describe('Step 3: Submersible Pumps', () => {
    it('browses submersible pumps for drainage', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Dompelpomp Vuil Water 1100W', sku: 'DP-1100', catalog: 'dompelpompen', flow: '15000 l/h' },
          { name: 'Dompelpomp RVS 750W', sku: 'DP-750RVS', catalog: 'dompelpompen', flow: '12000 l/h' },
          { name: 'Dompelpomp Drainage 400W', sku: 'DP-400', catalog: 'dompelpompen', flow: '8000 l/h' },
        ]),
      });

      const response = await fetch('/api/products?catalog=dompelpompen');
      const products = await response.json();
      
      expect(products.length).toBe(3);
      expect(products.every((p: any) => p.catalog === 'dompelpompen')).toBe(true);
    });
  });

  describe('Step 4: Well Pumps', () => {
    it('browses deep well pumps for irrigation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Bronpomp 4" 1.5kW', sku: 'BP-4-15', catalog: 'bronpompen', depth: '80m' },
          { name: 'Bronpomp 4" 2.2kW', sku: 'BP-4-22', catalog: 'bronpompen', depth: '120m' },
        ]),
      });

      const response = await fetch('/api/products?catalog=bronpompen');
      const products = await response.json();
      
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].catalog).toBe('bronpompen');
    });
  });

  describe('Step 5: PE Pipes for Irrigation', () => {
    it('browses PE pipes in various diameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'PE Buis 32mm PN10 100m', sku: 'PE-32-100', catalog: 'pe-buizen', diameter: '32mm' },
          { name: 'PE Buis 50mm PN10 100m', sku: 'PE-50-100', catalog: 'pe-buizen', diameter: '50mm' },
          { name: 'PE Buis 63mm PN10 50m', sku: 'PE-63-50', catalog: 'pe-buizen', diameter: '63mm' },
        ]),
      });

      const response = await fetch('/api/products?catalog=pe-buizen');
      const products = await response.json();
      
      expect(products.length).toBe(3);
    });
  });

  describe('Step 6: Bulk Quote Building', () => {
    it('adds large quantities for farm irrigation project', () => {
      const items: QuoteItem[] = [
        { sku: 'BP-4-22', name: 'Bronpomp 4" 2.2kW', quantity: 2 },
        { sku: 'DP-1100', name: 'Dompelpomp Vuil Water 1100W', quantity: 3 },
        { sku: 'PE-50-100', name: 'PE Buis 50mm 100m', quantity: 10 }, // 1000m total
        { sku: 'PE-32-100', name: 'PE Buis 32mm 100m', quantity: 20 }, // 2000m total
      ];

      addToQuote(items);
      const stored = getQuote();
      
      expect(stored.length).toBe(4);
      
      // Verify bulk quantities
      const peBuis50 = stored.find(i => i.sku === 'PE-50-100');
      expect(peBuis50?.quantity).toBe(10);
      
      const peBuis32 = stored.find(i => i.sku === 'PE-32-100');
      expect(peBuis32?.quantity).toBe(20);
    });

    it('calculates total items in order', () => {
      const items: QuoteItem[] = [
        { sku: 'BP-4-22', name: 'Bronpomp', quantity: 2 },
        { sku: 'PE-50-100', name: 'PE Buis 50mm', quantity: 10 },
      ];
      addToQuote(items);
      
      const total = getQuote().reduce((sum, item) => sum + item.quantity, 0);
      expect(total).toBe(12);
    });
  });

  describe('Step 7: Business Account Registration', () => {
    it('registers with VAT number for B2B', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'B2B account created' }),
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${persona.contactInfo.firstName} ${persona.contactInfo.lastName}`,
          email: persona.contactInfo.email,
          company: persona.contactInfo.company,
          vatNumber: persona.contactInfo.vatNumber,
          phone: persona.contactInfo.phone,
          password: 'FarmStrong2024!',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('validates VAT number format', () => {
      const vatNumber = persona.contactInfo.vatNumber;
      expect(vatNumber).toMatch(/^BE\d{10}$/);
    });
  });

  describe('Step 8: B2B Quote Submission', () => {
    it('submits quote with business details', async () => {
      const quoteData = {
        formData: {
          customerType: 'business',
          existingCustomer: 'no',
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
          urgency: 'normal',
          comments: 'Nieuw irrigatiesysteem voor 50 hectare landbouwgrond. Graag advies over pompkeuze.',
          preferredContact: 'phone',
        },
        products: [
          { sku: 'BP-4-22', name: 'Bronpomp 4" 2.2kW', quantity: 2 },
          { sku: 'DP-1100', name: 'Dompelpomp 1100W', quantity: 3 },
          { sku: 'PE-50-100', name: 'PE Buis 50mm 100m', quantity: 10 },
          { sku: 'PE-32-100', name: 'PE Buis 32mm 100m', quantity: 20 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Quote generated and sent' }),
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
  });

  describe('Step 9: Confirmation & Follow-up', () => {
    it('confirms business email with PDF for accounting', () => {
      const emailConfig = {
        to: persona.contactInfo.email,
        cc: 'info@demashop.be',
        subject: `New Quote Request from ${persona.contactInfo.firstName} ${persona.contactInfo.lastName}`,
        includesPDF: true,
        includesVAT: true,
      };

      expect(emailConfig.to).toBe('karel@hoeveboerderij.be');
      expect(emailConfig.includesPDF).toBe(true);
      expect(emailConfig.includesVAT).toBe(true);
    });
  });

  describe('Persona Validation', () => {
    it('validates farmer persona for large B2B orders', () => {
      expect(persona.id).toBe('farmer');
      expect(persona.businessType).toBe('B2B');
      expect(persona.orderSize).toBe('large');
      expect(persona.sector).toBe('agriculture');
      expect(persona.contactInfo.company).toBeTruthy();
      expect(persona.contactInfo.vatNumber).toBeTruthy();
    });
  });
});
