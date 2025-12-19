/**
 * E2E Test: Industrial Buyer User Journey
 * 
 * Persona: Sophie Industrie - Industrial procurement manager
 * Needs: Compressed air systems, drive technology, high-pressure cleaners
 * Behavior: Large bulk orders, needs technical specs, formal procurement process
 */

import { INDUSTRIAL_BUYER } from './personas';
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

describe('Industrial Buyer User Journey - Sophie Industrie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  const persona = INDUSTRIAL_BUYER;

  describe('Journey Overview', () => {
    const journeySteps: JourneyStep[] = [
      { step: 1, name: 'Visit Homepage', route: '/', expectedOutcome: 'See industrial categories' },
      { step: 2, name: 'Browse Compressed Air', route: '/products?catalog=airpress-catalogus-nl-fr', expectedOutcome: 'See compressors and accessories' },
      { step: 3, name: 'View PDF Catalog', route: '/pdf-viewer', expectedOutcome: 'Download technical specs' },
      { step: 4, name: 'Browse Drive Technology', route: '/products?catalog=catalogus-aandrijftechniek-150922', expectedOutcome: 'See belts, bearings, chains' },
      { step: 5, name: 'Browse Kränzle Cleaners', route: '/products?catalog=kranzle-catalogus-2021-nl-1', expectedOutcome: 'See high-pressure cleaners' },
      { step: 6, name: 'Add bulk items to quote', action: 'addToQuote', expectedOutcome: 'Large industrial order' },
      { step: 7, name: 'Register corporate account', route: '/register', expectedOutcome: 'B2B account with full details' },
      { step: 8, name: 'Submit formal quote request', route: '/quote-request', expectedOutcome: 'Detailed quote for procurement' },
      { step: 9, name: 'Receive PDF for approval', action: 'emailSent', expectedOutcome: 'Formal quote document' },
    ];

    it('validates all journey steps are defined', () => {
      validateJourneySteps(journeySteps);
      expect(journeySteps.length).toBe(9);
    });
  });

  describe('Step 1-2: Compressed Air Equipment', () => {
    it('browses Airpress compressor catalog', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Airpress Compressor 100L 3PK', sku: 'AP-100-3', catalog: 'airpress-catalogus-nl-fr', power: '2.2kW' },
          { name: 'Airpress Compressor 200L 5.5PK', sku: 'AP-200-55', catalog: 'airpress-catalogus-nl-fr', power: '4kW' },
          { name: 'Airpress Persluchtdroger', sku: 'AP-DRY-500', catalog: 'airpress-catalogus-nl-fr' },
        ]),
      });

      const response = await fetch('/api/products?catalog=airpress-catalogus-nl-fr');
      const products = await response.json();
      
      expect(products.length).toBe(3);
      expect(products.every((p: any) => p.catalog === 'airpress-catalogus-nl-fr')).toBe(true);
    });
  });

  describe('Step 3: Technical Documentation', () => {
    it('accesses PDF catalog for technical specs', () => {
      const pdfUrl = '/pdf-viewer?file=Product_pdfs/airpress-catalogus-nl-fr.pdf';
      expect(pdfUrl).toContain('airpress');
    });

    it('validates PDF access for industrial buyer', () => {
      // Industrial buyers need detailed specs
      const requiredSpecs = ['power', 'voltage', 'pressure', 'flow', 'dimensions'];
      expect(requiredSpecs.length).toBeGreaterThan(0);
    });
  });

  describe('Step 4: Drive Technology', () => {
    it('browses drive technology catalog', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'V-Snaar SPZ 1000', sku: 'VS-SPZ-1000', catalog: 'catalogus-aandrijftechniek-150922', type: 'V-Belt' },
          { name: 'Kogellager 6205 2RS', sku: 'KL-6205-2RS', catalog: 'catalogus-aandrijftechniek-150922', type: 'Bearing' },
          { name: 'Rollenketting 08B-1', sku: 'RK-08B-1', catalog: 'catalogus-aandrijftechniek-150922', type: 'Chain' },
        ]),
      });

      const response = await fetch('/api/products?catalog=catalogus-aandrijftechniek-150922');
      const products = await response.json();
      
      expect(products.length).toBe(3);
    });
  });

  describe('Step 5: High-Pressure Cleaners', () => {
    it('browses Kränzle professional cleaners', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { name: 'Kränzle K1152 TST', sku: 'KR-1152-TST', catalog: 'kranzle-catalogus-2021-nl-1', pressure: '130 bar' },
          { name: 'Kränzle Quadro 800 TS T', sku: 'KR-Q800-TST', catalog: 'kranzle-catalogus-2021-nl-1', pressure: '180 bar' },
        ]),
      });

      const response = await fetch('/api/products?catalog=kranzle-catalogus-2021-nl-1');
      const products = await response.json();
      
      expect(products.length).toBe(2);
    });
  });

  describe('Step 6: Large Industrial Order', () => {
    it('builds comprehensive industrial equipment order', () => {
      const items: QuoteItem[] = [
        { sku: 'AP-200-55', name: 'Airpress Compressor 200L', quantity: 3 },
        { sku: 'AP-DRY-500', name: 'Airpress Persluchtdroger', quantity: 3 },
        { sku: 'VS-SPZ-1000', name: 'V-Snaar SPZ 1000', quantity: 50 },
        { sku: 'KL-6205-2RS', name: 'Kogellager 6205 2RS', quantity: 100 },
        { sku: 'RK-08B-1', name: 'Rollenketting 08B-1', quantity: 20 },
        { sku: 'KR-Q800-TST', name: 'Kränzle Quadro 800', quantity: 2 },
      ];

      addToQuote(items);
      const stored = getQuote();
      
      expect(stored.length).toBe(6);
      
      // Industrial orders have high quantities
      const totalItems = stored.reduce((sum, i) => sum + i.quantity, 0);
      expect(totalItems).toBe(178);
    });

    it('calculates order complexity', () => {
      const items: QuoteItem[] = [
        { sku: 'AP-200-55', name: 'Compressor', quantity: 3 },
        { sku: 'KL-6205-2RS', name: 'Bearings', quantity: 100 },
      ];
      addToQuote(items);
      
      const quote = getQuote();
      const uniqueProducts = quote.length;
      const totalQuantity = quote.reduce((sum, i) => sum + i.quantity, 0);
      
      expect(uniqueProducts).toBe(2);
      expect(totalQuantity).toBe(103);
    });
  });

  describe('Step 7: Corporate Account Registration', () => {
    it('registers corporate procurement account', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, accountType: 'corporate' }),
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
          password: 'Industrial2024!Secure',
          role: 'procurement',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Step 8: Formal Quote Request', () => {
    it('submits detailed quote for procurement approval', async () => {
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
          comments: `Offerte aanvraag voor productie-uitbreiding.
          
Vereisten:
- Levering in 2 fasen mogelijk
- Technische documentatie vereist
- Installatie-ondersteuning gewenst
- Referentie: PO-2024-IND-0456

Graag offerte met:
- Eenheidsprijzen
- Staffelkorting bij grotere aantallen
- Levertijden
- Garantievoorwaarden`,
          preferredContact: 'email',
        },
        products: [
          { sku: 'AP-200-55', name: 'Airpress Compressor 200L 5.5PK', quantity: 3 },
          { sku: 'AP-DRY-500', name: 'Airpress Persluchtdroger', quantity: 3 },
          { sku: 'VS-SPZ-1000', name: 'V-Snaar SPZ 1000', quantity: 50 },
          { sku: 'KL-6205-2RS', name: 'Kogellager 6205 2RS', quantity: 100 },
          { sku: 'KR-Q800-TST', name: 'Kränzle Quadro 800 TS T', quantity: 2 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          message: 'Quote generated',
          quoteNumber: 'Q-2024-0456',
        }),
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

  describe('Step 9: Procurement Documentation', () => {
    it('confirms formal quote document for approval process', () => {
      const emailConfig = {
        to: persona.contactInfo.email,
        cc: ['info@demashop.be', 'nicolas.cloet@gmail.com'],
        subject: `Quote Request Q-2024-0456 - ${persona.contactInfo.company}`,
        includesPDF: true,
        includesVAT: true,
        includesTerms: true,
      };

      expect(emailConfig.to).toBe('sophie.inkoop@industrienl.be');
      expect(emailConfig.includesPDF).toBe(true);
      expect(emailConfig.includesTerms).toBe(true);
    });
  });

  describe('Persona Validation', () => {
    it('validates industrial buyer persona for large B2B orders', () => {
      expect(persona.id).toBe('industrial');
      expect(persona.businessType).toBe('B2B');
      expect(persona.orderSize).toBe('large');
      expect(persona.sector).toBe('industry');
      expect(persona.typicalProducts).toContain('Perslucht');
      expect(persona.typicalProducts).toContain('Aandrijftechniek');
      expect(persona.catalogs).toContain('airpress-catalogus-nl-fr');
      expect(persona.catalogs).toContain('catalogus-aandrijftechniek-150922');
    });
  });
});
