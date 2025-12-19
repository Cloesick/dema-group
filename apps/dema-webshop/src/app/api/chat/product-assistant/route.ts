import { NextRequest, NextResponse } from 'next/server';
import { 
  CATALOG_MAPPINGS, 
  APPLICATION_CATALOG_MAP, 
  QUICK_RESPONSES,
  USE_CASE_PATTERNS,
  INDUSTRY_PROFILES,
  TECHNICAL_PATTERNS,
  PRODUCT_TERM_DICTIONARY,
  CATEGORY_HIERARCHY,
  CategoryHierarchy,
  CategorySubcategory,
} from '@/config/productKnowledgeBase';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// Supported languages
type Language = 'nl' | 'en' | 'fr';

interface ProductGroup {
  group_id: string;
  name: string;
  series_name?: string;
  catalog: string;
  images?: string[];
  variant_count?: number;
  variants?: Array<{
    sku: string;
    label?: string;
    properties?: Record<string, any>;
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuoteItem {
  sku: string;
  name: string;
  category?: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  language?: Language;
  quoteItems?: QuoteItem[];
}

// Normalize query using product term dictionary (handles plurals and translations)
function normalizeQueryTerms(message: string): { normalizedTerms: string[]; matchedCatalogs: Set<string> } {
  const messageLower = message.toLowerCase();
  const matchedCatalogs = new Set<string>();
  const normalizedTerms: string[] = [];
  
  // Check each term in the dictionary
  for (const [termKey, termData] of Object.entries(PRODUCT_TERM_DICTIONARY)) {
    // Check all language variants (nl, en, fr)
    const allTerms = [...termData.nl, ...termData.en, ...termData.fr];
    
    for (const term of allTerms) {
      // Use word boundary matching for better accuracy
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(messageLower)) {
        // Add the canonical term key
        normalizedTerms.push(termKey);
        // Add related catalogs
        termData.catalogs.forEach(c => matchedCatalogs.add(c));
        break; // Found a match for this term group
      }
    }
  }
  
  return { normalizedTerms, matchedCatalogs };
}

// Find matching category and its subcategories
function findMatchingCategory(message: string): CategoryHierarchy | null {
  const messageLower = message.toLowerCase();
  
  for (const category of CATEGORY_HIERARCHY) {
    for (const keyword of category.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  return null;
}

// Format subcategory suggestions for chat response
function formatSubcategorySuggestions(
  category: CategoryHierarchy,
  language: Language
): string {
  const headers: Record<Language, string> = {
    nl: `🗂️ **${category.name}** - Kies een subcategorie:\n\n`,
    en: `🗂️ **${category.nameEN}** - Choose a subcategory:\n\n`,
    fr: `🗂️ **${category.nameFR}** - Choisissez une sous-catégorie:\n\n`,
  };

  const subcategoryList = category.subcategories.map(sub => {
    const name = language === 'nl' ? sub.name : language === 'fr' ? sub.nameFR : sub.nameEN;
    const desc = language === 'nl' ? sub.description : language === 'fr' ? sub.descriptionFR : sub.descriptionEN;
    return `• **${name}**\n  ${desc}`;
  }).join('\n\n');

  return headers[language] + subcategoryList;
}

// Detect language from message content
function detectLanguage(message: string): Language {
  const messageLower = message.toLowerCase();
  
  // French indicators - expanded list with common phrases and product terms
  const frenchWords = [
    'bonjour', 'bonsoir', 'salut', 'je cherche', 'avez-vous', 'besoin', 'avec', 'dans', 'comment', 
    'quel', 'quelle', 'quels', 'quelles', 'où', 'merci', 's\'il vous plaît', 'je voudrais', 'j\'ai besoin',
    'pompe', 'pompes', 'tuyau', 'tuyaux', 'raccord', 'raccords', 'outil', 'outils', 'outillage',
    'pression', 'débit', 'diamètre', 'longueur', 'inox', 'laiton', 'caoutchouc', 'flexible',
    'compresseur', 'nettoyeur', 'perceuse', 'scie', 'meuleuse', 'tondeuse', 'souffleur',
    'irrigation', 'jardin', 'piscine', 'cave', 'atelier', 'garage', 'chantier', 'agriculture',
    'devis', 'prix', 'catalogue', 'produit', 'produits', 'disponible', 'livraison'
  ];
  const frenchCount = frenchWords.filter(w => messageLower.includes(w)).length;
  
  // Dutch indicators - expanded list
  const dutchWords = [
    'hallo', 'goedemorgen', 'goedemiddag', 'ik zoek', 'heeft u', 'nodig', 'met', 'hoe', 
    'welke', 'waar', 'bedankt', 'alstublieft', 'ik wil', 'ik heb nodig',
    'pomp', 'pompen', 'buis', 'buizen', 'fitting', 'fittingen', 'gereedschap', 'slang', 'slangen',
    'druk', 'debiet', 'diameter', 'lengte', 'rvs', 'messing', 'rubber', 'flexibel',
    'compressor', 'hogedrukreiniger', 'boormachine', 'zaag', 'slijper', 'grasmaaier', 'bladblazer',
    'beregening', 'tuin', 'zwembad', 'kelder', 'werkplaats', 'garage', 'bouw', 'landbouw',
    'offerte', 'prijs', 'catalogus', 'product', 'producten', 'beschikbaar', 'levering'
  ];
  const dutchCount = dutchWords.filter(w => messageLower.includes(w)).length;
  
  // English indicators - expanded list
  const englishWords = [
    'hello', 'hi', 'good morning', 'i need', 'do you have', 'looking for', 'how', 
    'which', 'where', 'thank', 'please', 'i want', 'i would like',
    'pump', 'pumps', 'pipe', 'pipes', 'fitting', 'fittings', 'tool', 'tools', 'hose', 'hoses',
    'pressure', 'flow', 'diameter', 'length', 'stainless', 'brass', 'rubber', 'flexible',
    'compressor', 'pressure washer', 'drill', 'saw', 'grinder', 'mower', 'blower',
    'irrigation', 'garden', 'pool', 'basement', 'workshop', 'garage', 'construction', 'agriculture',
    'quote', 'price', 'catalog', 'product', 'products', 'available', 'delivery'
  ];
  const englishCount = englishWords.filter(w => messageLower.includes(w)).length;
  
  if (frenchCount > dutchCount && frenchCount > englishCount) return 'fr';
  if (englishCount > dutchCount && englishCount > frenchCount) return 'en';
  return 'nl'; // Default to Dutch
}

// Context extracted from conversation
interface ConversationContext {
  industry?: string;
  useCase?: { catalogs: string[]; response: { nl: string; en: string; fr: string } };
  technicalSpecs: Array<{ type: string; value: number; unit: string }>;
  mentionedCatalogs: string[];
  previousTopics: string[];
}

// Extract context from conversation history and current message
function extractConversationContext(message: string, history: ChatMessage[] = []): ConversationContext {
  const context: ConversationContext = {
    technicalSpecs: [],
    mentionedCatalogs: [],
    previousTopics: [],
  };
  
  // Combine current message with history for context extraction
  const allText = [
    ...history.map(h => h.content),
    message,
  ].join(' ').toLowerCase();
  
  // Extract industry from conversation
  for (const [industry, profile] of Object.entries(INDUSTRY_PROFILES)) {
    if (allText.includes(industry)) {
      context.industry = industry;
      break;
    }
  }
  
  // Match use case patterns
  for (const useCase of USE_CASE_PATTERNS) {
    for (const pattern of useCase.patterns) {
      if (pattern.test(allText)) {
        context.useCase = { catalogs: useCase.catalogs, response: useCase.response };
        break;
      }
    }
    if (context.useCase) break;
  }
  
  // Extract technical specifications
  for (const techPattern of TECHNICAL_PATTERNS) {
    const match = allText.match(techPattern.pattern);
    if (match) {
      const spec = techPattern.extract(match);
      context.technicalSpecs.push(spec);
    }
  }
  
  // Track previously mentioned catalogs from history
  for (const msg of history) {
    for (const catalog of CATALOG_MAPPINGS) {
      if (msg.content.toLowerCase().includes(catalog.nameNL.toLowerCase()) ||
          msg.content.toLowerCase().includes(catalog.name.toLowerCase())) {
        if (!context.mentionedCatalogs.includes(catalog.id)) {
          context.mentionedCatalogs.push(catalog.id);
        }
      }
    }
  }
  
  return context;
}

// Load product data from grouped JSON files
async function loadProductData(catalogIds: string[]): Promise<ProductGroup[]> {
  const products: ProductGroup[] = [];
  
  for (const catalogId of catalogIds) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', `${catalogId}_grouped.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const groups: ProductGroup[] = JSON.parse(data);
      products.push(...groups.slice(0, 10)); // Limit to 10 per catalog for performance
    } catch (error) {
      // Catalog file not found, skip
    }
  }
  
  return products;
}

// Find relevant catalogs based on user message and conversation context
function findRelevantCatalogs(message: string, context: ConversationContext): string[] {
  const messageLower = message.toLowerCase();
  const relevantCatalogs = new Set<string>();
  const matchScores = new Map<string, number>();
  
  // Helper to check word boundary match (prevents "pe" in "pompen" matching "pe" keyword)
  const wordBoundaryMatch = (text: string, keyword: string): boolean => {
    // For short keywords (2-3 chars), require word boundaries
    if (keyword.length <= 3) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(text);
    }
    // For longer keywords, simple includes is fine
    return text.includes(keyword.toLowerCase());
  };
  
  // 1. Use case patterns have highest priority (score: 20)
  if (context.useCase) {
    context.useCase.catalogs.forEach(c => {
      relevantCatalogs.add(c);
      matchScores.set(c, (matchScores.get(c) || 0) + 20);
    });
  }
  
  // 2. Industry profile catalogs (score: 15)
  if (context.industry && INDUSTRY_PROFILES[context.industry]) {
    INDUSTRY_PROFILES[context.industry].catalogs.forEach(c => {
      relevantCatalogs.add(c);
      matchScores.set(c, (matchScores.get(c) || 0) + 15);
    });
  }
  
  // 3. Technical specs filtering (score: 12)
  for (const spec of context.technicalSpecs) {
    const techPattern = TECHNICAL_PATTERNS.find(p => {
      const match = messageLower.match(p.pattern);
      return match && p.extract(match).type === spec.type;
    });
    if (techPattern) {
      const filteredCatalogs = techPattern.catalogFilter(spec.value, spec.unit);
      filteredCatalogs.forEach(c => {
        relevantCatalogs.add(c);
        matchScores.set(c, (matchScores.get(c) || 0) + 12);
      });
    }
  }
  
  // 4. Previously mentioned catalogs from conversation (score: 5)
  context.mentionedCatalogs.forEach(c => {
    relevantCatalogs.add(c);
    matchScores.set(c, (matchScores.get(c) || 0) + 5);
  });
  
  // 5. Check application/context mappings (score: 10)
  for (const [ctx, catalogs] of Object.entries(APPLICATION_CATALOG_MAP)) {
    if (wordBoundaryMatch(messageLower, ctx)) {
      catalogs.forEach(c => {
        relevantCatalogs.add(c);
        matchScores.set(c, (matchScores.get(c) || 0) + 10);
      });
    }
  }
  
  // 6. Check catalog keywords (score: 1)
  for (const catalog of CATALOG_MAPPINGS) {
    for (const keyword of catalog.keywords) {
      if (wordBoundaryMatch(messageLower, keyword)) {
        relevantCatalogs.add(catalog.id);
        matchScores.set(catalog.id, (matchScores.get(catalog.id) || 0) + 1);
        break;
      }
    }
  }
  
  // Sort by match score (higher = more relevant)
  return Array.from(relevantCatalogs).sort((a, b) => 
    (matchScores.get(b) || 0) - (matchScores.get(a) || 0)
  );
}

// Search products within loaded data
function searchProducts(products: ProductGroup[], query: string): ProductGroup[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  
  return products
    .map(product => {
      let score = 0;
      const searchText = [
        product.name,
        product.series_name,
        product.catalog,
        ...(product.variants?.map(v => v.label) || []),
      ].filter(Boolean).join(' ').toLowerCase();
      
      for (const term of queryTerms) {
        if (searchText.includes(term)) {
          score += 1;
        }
      }
      
      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ product }) => product);
}

// Format product results for chat response - clean and readable
function formatProductResults(products: ProductGroup[], language: Language): string {
  if (products.length === 0) {
    return '';
  }
  
  const headers: Record<Language, string> = {
    nl: '📦 **Gevonden producten:**\n\n',
    en: '📦 **Found products:**\n\n',
    fr: '📦 **Produits trouvés:**\n\n',
  };
  
  const variantLabels: Record<Language, string> = {
    nl: 'variant(en)',
    en: 'variant(s)',
    fr: 'variante(s)',
  };
  
  const viewLabels: Record<Language, string> = {
    nl: 'Bekijk product',
    en: 'View product',
    fr: 'Voir le produit',
  };
  
  const productList = products.map(p => {
    const catalogInfo = CATALOG_MAPPINGS.find(c => c.id === p.catalog);
    const catalogName = language === 'nl' ? catalogInfo?.nameNL : 
                        language === 'fr' ? catalogInfo?.nameFR : 
                        catalogInfo?.name;
    const variantText = `${p.variant_count || 1} ${variantLabels[language]}`;
    
    // Clean product name - remove page references for display
    const cleanName = p.name.replace(/\s*\(Page\s*\d+\)/gi, '').trim();
    
    return `• **${cleanName}**\n  📁 ${catalogName || p.catalog} | ${variantText}\n  🔗 [${viewLabels[language]}](/products?catalog=${p.catalog})`;
  }).join('\n\n');
  
  return headers[language] + productList;
}

// Generate AI response using OpenAI (if available) or rule-based fallback
async function generateResponse(
  message: string,
  relevantCatalogs: string[],
  products: ProductGroup[],
  language: Language,
  context: ConversationContext,
  history: ChatMessage[] = []
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  // If OpenAI is available and configured, use it for smarter responses
  if (openaiKey && openaiKey !== 'sk-your-actual-key-here') {
    try {
      const catalogContext = relevantCatalogs
        .map(id => CATALOG_MAPPINGS.find(c => c.id === id))
        .filter(Boolean)
        .map(c => `- ${c!.nameNL}: ${c!.descriptionNL}`)
        .join('\n');
      
      const productContext = products.slice(0, 5).map(p => 
        `- ${p.name} (${p.catalog}, ${p.variant_count || 1} varianten)`
      ).join('\n');
      
      // Build context info for AI
      let contextInfo = '';
      if (context.useCase) {
        contextInfo += `\nGedetecteerde use case: ${context.useCase.response.nl}\n`;
      }
      if (context.industry) {
        contextInfo += `\nIndustrie: ${context.industry}\n`;
      }
      if (context.technicalSpecs.length > 0) {
        contextInfo += `\nTechnische specs: ${context.technicalSpecs.map(s => `${s.type}=${s.value}${s.unit}`).join(', ')}\n`;
      }
      
      const languageNames: Record<Language, string> = {
        nl: 'Nederlands',
        en: 'English', 
        fr: 'Français',
      };
      
      const systemPrompt = `You are the DEMA Product Assistant, a helpful chatbot for a B2B webshop specialized in pumps, pipes, fittings, hoses, and tools.

Available catalogs:
${catalogContext || 'No specific catalogs found'}

Found products:
${productContext || 'No specific products found'}
${contextInfo}
Rules:
1. ALWAYS respond in ${languageNames[language]} - this is critical
2. Be helpful and professional
3. When suggesting products, refer to the relevant catalog
4. If you don't know the answer, refer to the contact form or phone: +32 (0)51 20 51 41
5. Encourage customers to request a quote for larger orders
6. Remember conversation context and refer to previous messages when relevant
7. Understand product terms in Dutch (NL), English (EN), and French (FR) - e.g., "buizen" = "pipes" = "tuyaux", "pompen" = "pumps" = "pompes"
8. Recognize plural forms: buis/buizen, pomp/pompen, fitting/fittingen, slang/slangen, etc.`;

      // Build messages array with history for conversation memory
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
      ];
      
      // Add conversation history (last 6 messages max)
      const recentHistory = history.slice(-6);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
      
      // Add current message
      messages.push({ role: 'user', content: message });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }
  
  // Fallback: Rule-based response
  return generateRuleBasedResponse(message, relevantCatalogs, products, language, context);
}

// Rule-based response generator (fallback when OpenAI is not available)
function generateRuleBasedResponse(
  message: string,
  relevantCatalogs: string[],
  products: ProductGroup[],
  language: Language,
  context: ConversationContext
): string {
  const messageLower = message.toLowerCase();
  
  // Greeting detection (multilingual)
  if (/^(hallo|hello|hi|hey|goedemorgen|goedemiddag|goedenavond|dag|bonjour|bonsoir|salut)/i.test(messageLower)) {
    return QUICK_RESPONSES.greeting[language];
  }
  
  // Build response based on context, products and catalogs
  let response = '';
  
  // If we matched a specific use case, use its tailored response
  if (context.useCase) {
    response = context.useCase.response[language] + '\n\n';
  }
  // If we identified an industry, add industry-specific considerations
  else if (context.industry && INDUSTRY_PROFILES[context.industry]) {
    const profile = INDUSTRY_PROFILES[context.industry];
    response = profile.considerations[language] + '\n\n';
  }
  // Otherwise, list recommended catalogs
  else if (relevantCatalogs.length > 0) {
    const catalogNames = relevantCatalogs
      .map(id => CATALOG_MAPPINGS.find(c => c.id === id))
      .filter(Boolean)
      .slice(0, 3)
      .map(c => language === 'nl' ? c!.nameNL : language === 'fr' ? c!.nameFR : c!.name);
    
    const catalogIntros: Record<Language, string> = {
      nl: `Op basis van uw vraag raad ik de volgende catalogi aan: **${catalogNames.join(', ')}**.\n\n`,
      en: `Based on your question, I recommend the following catalogs: **${catalogNames.join(', ')}**.\n\n`,
      fr: `Sur la base de votre question, je recommande les catalogues suivants: **${catalogNames.join(', ')}**.\n\n`,
    };
    response = catalogIntros[language];
  }
  
  // Add technical specs interpretation if found
  if (context.technicalSpecs.length > 0) {
    const specDescriptions = context.technicalSpecs.map(spec => {
      if (language === 'nl') {
        switch (spec.type) {
          case 'depth': return `diepte: ${spec.value}m`;
          case 'pressure': return `druk: ${spec.value} bar`;
          case 'flow': return `debiet: ${spec.value} ${spec.unit}`;
          case 'diameter': return `diameter: ${spec.value}${spec.unit}`;
          default: return `${spec.type}: ${spec.value}${spec.unit}`;
        }
      } else if (language === 'fr') {
        switch (spec.type) {
          case 'depth': return `profondeur: ${spec.value}m`;
          case 'pressure': return `pression: ${spec.value} bar`;
          case 'flow': return `débit: ${spec.value} ${spec.unit}`;
          case 'diameter': return `diamètre: ${spec.value}${spec.unit}`;
          default: return `${spec.type}: ${spec.value}${spec.unit}`;
        }
      } else {
        switch (spec.type) {
          case 'depth': return `depth: ${spec.value}m`;
          case 'pressure': return `pressure: ${spec.value} bar`;
          case 'flow': return `flow rate: ${spec.value} ${spec.unit}`;
          case 'diameter': return `diameter: ${spec.value}${spec.unit}`;
          default: return `${spec.type}: ${spec.value}${spec.unit}`;
        }
      }
    });
    
    const specHeaders: Record<Language, string> = {
      nl: `📐 **Technische specificaties gedetecteerd:** ${specDescriptions.join(', ')}\n\n`,
      en: `📐 **Technical specifications detected:** ${specDescriptions.join(', ')}\n\n`,
      fr: `📐 **Spécifications techniques détectées:** ${specDescriptions.join(', ')}\n\n`,
    };
    response += specHeaders[language];
  }
  
  if (products.length > 0) {
    response += formatProductResults(products, language);
    response += '\n\n' + QUICK_RESPONSES.quotePrompt[language];
  } else if (relevantCatalogs.length === 0 && !context.useCase && !context.industry) {
    response = QUICK_RESPONSES.notFound[language];
  }
  
  return response;
}

// Related product suggestions based on quote items
const RELATED_PRODUCTS_MAP: Record<string, { catalogs: string[]; suggestion: { nl: string; en: string; fr: string } }> = {
  'pump': {
    catalogs: ['slangkoppelingen', 'rubber-slangen', 'pe-buizen', 'digitale-versie-pompentoebehoren-compressed'],
    suggestion: {
      nl: '💡 **Tip:** Bij uw pomp raden we ook aan: slangen, koppelingen en toebehoren voor een complete installatie!',
      en: '💡 **Tip:** With your pump, we also recommend: hoses, couplings and accessories for a complete installation!',
      fr: '💡 **Conseil:** Avec votre pompe, nous recommandons aussi: tuyaux, raccords et accessoires pour une installation complète!',
    },
  },
  'hose': {
    catalogs: ['slangkoppelingen', 'slangklemmen'],
    suggestion: {
      nl: '💡 **Tip:** Vergeet niet de juiste koppelingen en klemmen voor uw slangen!',
      en: '💡 **Tip:** Don\'t forget the right couplings and clamps for your hoses!',
      fr: '💡 **Conseil:** N\'oubliez pas les bons raccords et colliers pour vos tuyaux!',
    },
  },
  'pipe': {
    catalogs: ['messing-draadfittingen', 'rvs-draadfittingen', 'slangkoppelingen'],
    suggestion: {
      nl: '💡 **Tip:** Voor uw buizen heeft u ook fittingen en koppelingen nodig!',
      en: '💡 **Tip:** For your pipes you also need fittings and couplings!',
      fr: '💡 **Conseil:** Pour vos tuyaux, vous avez aussi besoin de raccords!',
    },
  },
  'fitting': {
    catalogs: ['pe-buizen', 'verzinkte-buizen', 'rubber-slangen'],
    suggestion: {
      nl: '💡 **Tip:** Bekijk ook onze buizen en slangen die perfect passen bij uw fittingen!',
      en: '💡 **Tip:** Also check our pipes and hoses that perfectly match your fittings!',
      fr: '💡 **Conseil:** Découvrez aussi nos tuyaux qui s\'adaptent parfaitement à vos raccords!',
    },
  },
  'tool': {
    catalogs: ['makita-catalogus-2022-nl', 'makita-tuinfolder-2022-nl'],
    suggestion: {
      nl: '💡 **Tip:** Bekijk ons complete Makita assortiment voor meer professioneel gereedschap!',
      en: '💡 **Tip:** Check our complete Makita range for more professional tools!',
      fr: '💡 **Conseil:** Découvrez notre gamme complète Makita pour plus d\'outils professionnels!',
    },
  },
};

// Detect product type from quote items
function detectQuoteProductTypes(quoteItems: QuoteItem[]): string[] {
  const types: string[] = [];
  const itemText = quoteItems.map(i => `${i.name} ${i.category || ''}`).join(' ').toLowerCase();
  
  if (/pomp|pump|pompe/i.test(itemText)) types.push('pump');
  if (/slang|hose|tuyau/i.test(itemText)) types.push('hose');
  if (/buis|pipe|tuyau/i.test(itemText)) types.push('pipe');
  if (/fitting|raccord|koppel/i.test(itemText)) types.push('fitting');
  if (/makita|gereedschap|tool|outil/i.test(itemText)) types.push('tool');
  
  return types;
}

// Generate upselling suggestions based on quote items
function generateUpsellingSuggestions(
  quoteItems: QuoteItem[],
  language: Language
): { text: string; relatedCatalogs: string[] } {
  if (!quoteItems || quoteItems.length === 0) {
    return { text: '', relatedCatalogs: [] };
  }
  
  const productTypes = detectQuoteProductTypes(quoteItems);
  const suggestions: string[] = [];
  const relatedCatalogs: string[] = [];
  
  for (const type of productTypes) {
    const related = RELATED_PRODUCTS_MAP[type];
    if (related) {
      suggestions.push(related.suggestion[language]);
      relatedCatalogs.push(...related.catalogs);
    }
  }
  
  // Add general upselling message if quote has items
  if (quoteItems.length > 0 && suggestions.length === 0) {
    const generalSuggestions: Record<Language, string> = {
      nl: '💡 **Tip:** Bekijk ook onze andere producten om uw bestelling compleet te maken!',
      en: '💡 **Tip:** Also check our other products to complete your order!',
      fr: '💡 **Conseil:** Découvrez aussi nos autres produits pour compléter votre commande!',
    };
    suggestions.push(generalSuggestions[language]);
  }
  
  return {
    text: suggestions.slice(0, 2).join('\n\n'), // Max 2 suggestions
    relatedCatalogs: Array.from(new Set(relatedCatalogs)), // Remove duplicates
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    let { message, history = [], language, quoteItems = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Auto-detect language if not provided or detect from message
    if (!language) {
      language = detectLanguage(message);
    }
    
    // Generate upselling suggestions based on quote items
    const upselling = generateUpsellingSuggestions(quoteItems, language);
    
    // Normalize query terms using product dictionary (handles plurals & translations)
    const { normalizedTerms, matchedCatalogs } = normalizeQueryTerms(message);
    
    // Extract conversation context from history and current message
    const context = extractConversationContext(message, history);
    
    // Find relevant catalogs based on user message and context
    let relevantCatalogs = findRelevantCatalogs(message, context);
    
    // Merge catalogs from product term dictionary (higher priority for exact term matches)
    if (matchedCatalogs.size > 0) {
      const dictionaryCatalogs = Array.from(matchedCatalogs);
      // Add dictionary matches at the beginning (higher priority)
      const combined = [...dictionaryCatalogs, ...relevantCatalogs];
      relevantCatalogs = combined.filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
    }
    
    // Add related catalogs from upselling if user has items in quote
    if (upselling.relatedCatalogs.length > 0) {
      relevantCatalogs = [...relevantCatalogs, ...upselling.relatedCatalogs];
      relevantCatalogs = relevantCatalogs.filter((v, i, a) => a.indexOf(v) === i);
    }
    
    // Check if user is asking about a main category (e.g., "pompen")
    const matchedCategory = findMatchingCategory(message);
    
    // Load product data from relevant catalogs
    const catalogsToLoad = relevantCatalogs.length > 0 
      ? relevantCatalogs 
      : CATALOG_MAPPINGS.slice(0, 5).map(c => c.id); // Default to first 5 catalogs
    
    const products = await loadProductData(catalogsToLoad);
    
    // Search for specific products
    const matchedProducts = searchProducts(products, message);
    
    // Generate response with context and history
    let responseText = await generateResponse(
      message,
      relevantCatalogs,
      matchedProducts,
      language,
      context,
      history
    );
    
    // If a main category was matched and we have subcategories, prepend subcategory suggestions
    if (matchedCategory && matchedCategory.subcategories.length > 1) {
      const subcategorySuggestions = formatSubcategorySuggestions(matchedCategory, language);
      responseText = subcategorySuggestions + '\n\n' + responseText;
    }
    
    // Add upselling suggestions if user has items in quote
    if (upselling.text) {
      responseText = responseText + '\n\n---\n\n' + upselling.text;
    }
    
    // Build subcategories for response
    const suggestedSubcategories = matchedCategory ? matchedCategory.subcategories.map(sub => ({
      name: language === 'nl' ? sub.name : language === 'fr' ? sub.nameFR : sub.nameEN,
      slug: sub.slug,
      description: language === 'nl' ? sub.description : language === 'fr' ? sub.descriptionFR : sub.descriptionEN,
      catalogs: sub.catalogs,
      url: `/categories/${matchedCategory.slug}#${sub.slug}`,
    })) : [];
    
    return NextResponse.json({
      success: true,
      response: responseText,
      detectedLanguage: language,
      normalizedTerms, // Include for debugging/transparency
      matchedCategory: matchedCategory ? {
        name: language === 'nl' ? matchedCategory.name : language === 'fr' ? matchedCategory.nameFR : matchedCategory.nameEN,
        slug: matchedCategory.slug,
        url: `/categories/${matchedCategory.slug}`,
      } : null,
      suggestedSubcategories,
      suggestedCatalogs: relevantCatalogs.slice(0, 3).map(id => {
        const catalog = CATALOG_MAPPINGS.find(c => c.id === id);
        return catalog ? {
          id: catalog.id,
          name: language === 'nl' ? catalog.nameNL : language === 'fr' ? catalog.nameFR : catalog.name,
          url: `/products?catalog=${catalog.id}`,
        } : null;
      }).filter(Boolean),
      suggestedProducts: matchedProducts.slice(0, 3).map(p => {
        // Clean product name for display
        const cleanName = p.name.replace(/\s*\(Page\s*\d+\)/gi, '').trim();
        // Get first variant SKU if available
        const firstVariantSku = p.variants?.[0]?.sku || null;
        return {
          name: cleanName,
          catalog: p.catalog,
          image: p.images?.[0] || null,
          variantCount: p.variant_count || 1,
          url: `/products?catalog=${p.catalog}`,
          sku: firstVariantSku,
          groupId: p.group_id,
        };
      }),
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
