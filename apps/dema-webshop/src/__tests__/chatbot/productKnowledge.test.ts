import { CATALOG_MAPPINGS, PRODUCT_TERM_DICTIONARY } from '@/config/productKnowledgeBase';

describe('Product Knowledge Base', () => {
  describe('CATALOG_MAPPINGS', () => {
    it('should have at least 10 catalog mappings', () => {
      expect(CATALOG_MAPPINGS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have required fields for each mapping', () => {
      CATALOG_MAPPINGS.forEach(mapping => {
        expect(mapping.id).toBeDefined();
        expect(mapping.name).toBeDefined();
        expect(mapping.nameNL).toBeDefined();
        expect(mapping.keywords).toBeDefined();
        expect(Array.isArray(mapping.keywords)).toBe(true);
      });
    });

    it('should have French translations for all mappings', () => {
      CATALOG_MAPPINGS.forEach(mapping => {
        expect(mapping.nameFR).toBeDefined();
        expect(typeof mapping.nameFR).toBe('string');
      });
    });

    it('should have unique IDs', () => {
      const ids = CATALOG_MAPPINGS.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include pump-related catalogs', () => {
      const pumpCatalogs = CATALOG_MAPPINGS.filter(m => 
        m.id.includes('pomp') || m.keywords.some(k => k.includes('pump') || k.includes('pomp'))
      );
      expect(pumpCatalogs.length).toBeGreaterThan(0);
    });

    it('should include Makita catalogs', () => {
      const makitaCatalogs = CATALOG_MAPPINGS.filter(m => 
        m.id.includes('makita') || m.keywords.some(k => k.includes('makita'))
      );
      expect(makitaCatalogs.length).toBeGreaterThan(0);
    });
  });

  describe('PRODUCT_TERM_DICTIONARY', () => {
    it('should have entries for common product types', () => {
      expect(PRODUCT_TERM_DICTIONARY).toBeDefined();
      expect(Object.keys(PRODUCT_TERM_DICTIONARY).length).toBeGreaterThan(0);
    });

    it('should have language arrays for each entry', () => {
      Object.values(PRODUCT_TERM_DICTIONARY).forEach(entry => {
        expect(entry.nl).toBeDefined();
        expect(entry.en).toBeDefined();
        expect(entry.fr).toBeDefined();
        expect(Array.isArray(entry.nl)).toBe(true);
        expect(Array.isArray(entry.en)).toBe(true);
        expect(Array.isArray(entry.fr)).toBe(true);
      });
    });

    it('should have catalog references', () => {
      Object.values(PRODUCT_TERM_DICTIONARY).forEach(entry => {
        expect(entry.catalogs).toBeDefined();
        expect(Array.isArray(entry.catalogs)).toBe(true);
        expect(entry.catalogs.length).toBeGreaterThan(0);
      });
    });

    it('should include Dutch terms', () => {
      const hasNLTerms = Object.values(PRODUCT_TERM_DICTIONARY).some(entry => 
        entry.nl && entry.nl.length > 0
      );
      expect(hasNLTerms).toBe(true);
    });

    it('should include English terms', () => {
      const hasENTerms = Object.values(PRODUCT_TERM_DICTIONARY).some(entry => 
        entry.en && entry.en.length > 0
      );
      expect(hasENTerms).toBe(true);
    });

    it('should include French terms', () => {
      const hasFRTerms = Object.values(PRODUCT_TERM_DICTIONARY).some(entry => 
        entry.fr && entry.fr.length > 0
      );
      expect(hasFRTerms).toBe(true);
    });
  });
});

describe('Language Detection Logic', () => {
  const detectLanguage = (message: string): 'nl' | 'en' | 'fr' => {
    const lowerMessage = message.toLowerCase();
    
    const nlKeywords = ['ik', 'een', 'het', 'voor', 'wat', 'welke', 'nodig', 'zoek', 'hebben', 'graag', 'wil', 'kan', 'hoe'];
    const frKeywords = ['je', 'un', 'une', 'le', 'la', 'pour', 'quel', 'quelle', 'besoin', 'cherche', 'avoir', 'veux', 'peux', 'comment'];
    const enKeywords = ['i', 'a', 'the', 'for', 'what', 'which', 'need', 'looking', 'have', 'want', 'can', 'how'];
    
    let nlCount = 0, frCount = 0, enCount = 0;
    
    nlKeywords.forEach(kw => { if (lowerMessage.includes(kw)) nlCount++; });
    frKeywords.forEach(kw => { if (lowerMessage.includes(kw)) frCount++; });
    enKeywords.forEach(kw => { if (lowerMessage.includes(kw)) enCount++; });
    
    if (nlCount > frCount && nlCount > enCount) return 'nl';
    if (frCount > nlCount && frCount > enCount) return 'fr';
    return 'en';
  };

  it('should detect Dutch language', () => {
    expect(detectLanguage('Ik zoek een pomp voor mijn tuin')).toBe('nl');
    expect(detectLanguage('Welke slangen hebben jullie?')).toBe('nl');
    expect(detectLanguage('Ik heb fittingen nodig')).toBe('nl');
  });

  it('should detect French language', () => {
    expect(detectLanguage('Je cherche une pompe pour mon jardin')).toBe('fr');
    expect(detectLanguage('Quel tuyau avez-vous?')).toBe('fr');
    expect(detectLanguage('J\'ai besoin de raccords')).toBe('fr');
  });

  it('should detect English language', () => {
    expect(detectLanguage('I need a pump for my garden')).toBe('en');
    expect(detectLanguage('What hoses do you have?')).toBe('en');
    expect(detectLanguage('I am looking for fittings')).toBe('en');
  });

  it('should default to English for ambiguous messages', () => {
    expect(detectLanguage('pump')).toBe('en');
    expect(detectLanguage('Makita')).toBe('en');
  });
});

describe('Query Normalization Logic', () => {
  const normalizeQueryTerms = (message: string, dictionary: Record<string, any>) => {
    const lowerMessage = message.toLowerCase();
    const normalizedTerms: string[] = [];
    const matchedCatalogs = new Set<string>();

    Object.entries(dictionary).forEach(([key, entry]) => {
      const allTerms = [
        ...(entry.nl || []),
        ...(entry.en || []),
        ...(entry.fr || []),
      ].map((t: string) => t.toLowerCase());

      for (const term of allTerms) {
        if (lowerMessage.includes(term)) {
          normalizedTerms.push(key);
          entry.catalogs.forEach((c: string) => matchedCatalogs.add(c));
          break;
        }
      }
    });

    return { normalizedTerms, matchedCatalogs };
  };

  const mockDictionary = {
    pipes: {
      nl: ['buis', 'buizen'],
      en: ['pipe', 'pipes'],
      fr: ['tuyau', 'tuyaux'],
      catalogs: ['pe_buizen', 'drukbuizen'],
    },
    pumps: {
      nl: ['pomp', 'pompen'],
      en: ['pump', 'pumps'],
      fr: ['pompe', 'pompes'],
      catalogs: ['bronpompen', 'dompelpompen'],
    },
  };

  it('should match Dutch singular terms', () => {
    const result = normalizeQueryTerms('Ik zoek een buis', mockDictionary);
    expect(result.normalizedTerms).toContain('pipes');
    expect(result.matchedCatalogs.has('pe_buizen')).toBe(true);
  });

  it('should match Dutch plural terms', () => {
    const result = normalizeQueryTerms('Ik zoek buizen', mockDictionary);
    expect(result.normalizedTerms).toContain('pipes');
  });

  it('should match English terms', () => {
    const result = normalizeQueryTerms('I need a pump', mockDictionary);
    expect(result.normalizedTerms).toContain('pumps');
    expect(result.matchedCatalogs.has('bronpompen')).toBe(true);
  });

  it('should match French terms', () => {
    const result = normalizeQueryTerms('Je cherche une pompe', mockDictionary);
    expect(result.normalizedTerms).toContain('pumps');
  });

  it('should match multiple terms in one message', () => {
    const result = normalizeQueryTerms('I need pipes and pumps', mockDictionary);
    expect(result.normalizedTerms).toContain('pipes');
    expect(result.normalizedTerms).toContain('pumps');
  });

  it('should return empty for no matches', () => {
    const result = normalizeQueryTerms('Hello world', mockDictionary);
    expect(result.normalizedTerms).toEqual([]);
    expect(result.matchedCatalogs.size).toBe(0);
  });
});
