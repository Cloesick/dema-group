import { stringSimilarity, tokenizeQuery, fuzzySearchProducts, highlightMatches } from '@/lib/fuzzySearch';

describe('fuzzySearch', () => {
  describe('stringSimilarity', () => {
    it('returns 1 for exact matches', () => {
      expect(stringSimilarity('hello', 'hello')).toBe(1);
      expect(stringSimilarity('HELLO', 'hello')).toBe(1);
    });

    it('returns high score for substring matches', () => {
      expect(stringSimilarity('hello world', 'hello')).toBe(0.9);
      expect(stringSimilarity('bronpompen', 'pomp')).toBe(0.9);
    });

    it('returns lower score for partial matches', () => {
      const score = stringSimilarity('hello', 'helo');
      expect(score).toBeGreaterThan(0.5);
      expect(score).toBeLessThan(1);
    });

    it('returns 0 for empty strings', () => {
      expect(stringSimilarity('', 'hello')).toBe(0);
      expect(stringSimilarity('hello', '')).toBe(0);
    });
  });

  describe('tokenizeQuery', () => {
    it('splits query into lowercase terms', () => {
      expect(tokenizeQuery('Hello World')).toEqual(['hello', 'world']);
    });

    it('filters out short terms', () => {
      expect(tokenizeQuery('a b cd efg')).toEqual(['cd', 'efg']);
    });

    it('removes special characters', () => {
      expect(tokenizeQuery('hello-world!')).toEqual(['hello', 'world']);
    });
  });

  describe('fuzzySearchProducts', () => {
    const testProducts = [
      { name: 'Bronpompen 4 inch', catalog: 'bronpompen', variants: [{ sku: 'BP001', label: 'Bronpomp 4"' }] },
      { name: 'Dompelpompen vuil water', catalog: 'dompelpompen', variants: [{ sku: 'DP001', label: 'Dompelpomp' }] },
      { name: 'PE Buizen 50mm', catalog: 'pe_buizen', variants: [{ sku: 'PE001', label: 'PE Buis' }] },
      { name: 'RVS Fittingen', catalog: 'rvs_fittingen', variants: [{ sku: 'RVS001', label: 'RVS Fitting' }] },
    ];

    it('finds exact matches', () => {
      const results = fuzzySearchProducts(testProducts, 'bronpompen', ['name', 'catalog']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toContain('Bronpompen');
    });

    it('finds partial matches', () => {
      const results = fuzzySearchProducts(testProducts, 'pomp', ['name', 'catalog']);
      expect(results.length).toBe(2); // bronpompen and dompelpompen
    });

    it('handles typos', () => {
      const results = fuzzySearchProducts(testProducts, 'bronpomepn', ['name', 'catalog'], { threshold: 0.3 });
      expect(results.length).toBeGreaterThan(0);
    });

    it('searches in variants', () => {
      const results = fuzzySearchProducts(testProducts, 'BP001', ['name']);
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for no matches', () => {
      const results = fuzzySearchProducts(testProducts, 'xyz123nonexistent', ['name', 'catalog']);
      expect(results.length).toBe(0);
    });

    it('respects maxResults config', () => {
      const results = fuzzySearchProducts(testProducts, 'pomp', ['name'], { maxResults: 1 });
      expect(results.length).toBe(1);
    });
  });

  describe('highlightMatches', () => {
    it('wraps matched terms in mark tags', () => {
      const result = highlightMatches('Hello World', 'hello');
      expect(result).toContain('<mark>');
      expect(result).toContain('Hello');
    });

    it('returns original text for empty query', () => {
      expect(highlightMatches('Hello World', '')).toBe('Hello World');
    });
  });
});
