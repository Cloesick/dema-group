/**
 * Fuzzy search utility for product matching
 * Supports typo tolerance, partial matching, and relevance scoring
 */

// Calculate Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate similarity score (0-1) between two strings
export function stringSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  if (aLower === bLower) return 1;
  if (aLower.length === 0 || bLower.length === 0) return 0;
  
  // Exact substring match gets high score
  if (aLower.includes(bLower) || bLower.includes(aLower)) {
    return 0.9;
  }
  
  // Word-level matching
  const aWords = aLower.split(/\s+/);
  const bWords = bLower.split(/\s+/);
  let wordMatches = 0;
  for (const bWord of bWords) {
    if (aWords.some(aWord => aWord.includes(bWord) || bWord.includes(aWord))) {
      wordMatches++;
    }
  }
  if (wordMatches > 0) {
    return 0.7 + (0.2 * wordMatches / bWords.length);
  }
  
  // Levenshtein-based similarity for typo tolerance
  const maxLen = Math.max(aLower.length, bLower.length);
  const distance = levenshteinDistance(aLower, bLower);
  return Math.max(0, 1 - distance / maxLen);
}

// Tokenize search query into meaningful terms
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s\d]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length >= 2);
}

// Search result with score
export interface SearchResult<T> {
  item: T;
  score: number;
  matchedFields: string[];
}

// Fuzzy search configuration
export interface FuzzySearchConfig {
  threshold?: number;      // Minimum score to include (0-1), default 0.3
  maxResults?: number;     // Maximum results to return
  boostExact?: number;     // Boost for exact matches, default 2
  boostStartsWith?: number; // Boost for starts-with matches, default 1.5
}

// Fuzzy search function for product groups
export function fuzzySearchProducts<T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[],
  config: FuzzySearchConfig = {}
): SearchResult<T>[] {
  const {
    threshold = 0.3,
    maxResults = 100,
    boostExact = 2,
    boostStartsWith = 1.5,
  } = config;

  if (!query.trim()) {
    return items.slice(0, maxResults).map(item => ({
      item,
      score: 1,
      matchedFields: [],
    }));
  }

  const queryTerms = tokenizeQuery(query);
  const queryLower = query.toLowerCase();

  const results: SearchResult<T>[] = [];

  for (const item of items) {
    let totalScore = 0;
    const matchedFields: string[] = [];

    for (const field of searchFields) {
      const fieldValue = item[field];
      if (!fieldValue) continue;

      const fieldStr = String(fieldValue).toLowerCase();
      let fieldScore = 0;

      // Exact match boost
      if (fieldStr === queryLower) {
        fieldScore = 1 * boostExact;
      }
      // Starts with boost
      else if (fieldStr.startsWith(queryLower)) {
        fieldScore = 0.95 * boostStartsWith;
      }
      // Contains exact query
      else if (fieldStr.includes(queryLower)) {
        fieldScore = 0.85;
      }
      // Term-by-term matching
      else {
        let termMatches = 0;
        for (const term of queryTerms) {
          if (fieldStr.includes(term)) {
            termMatches++;
          } else {
            // Fuzzy match for typos
            const words = fieldStr.split(/\s+/);
            for (const word of words) {
              const similarity = stringSimilarity(word, term);
              if (similarity > 0.7) {
                termMatches += similarity;
                break;
              }
            }
          }
        }
        if (termMatches > 0) {
          fieldScore = 0.5 + (0.4 * termMatches / queryTerms.length);
        }
      }

      if (fieldScore > 0) {
        totalScore = Math.max(totalScore, fieldScore);
        matchedFields.push(String(field));
      }
    }

    // Also search in nested variants
    if (item.variants && Array.isArray(item.variants)) {
      for (const variant of item.variants) {
        const sku = variant.sku?.toLowerCase() || '';
        const label = variant.label?.toLowerCase() || '';
        
        if (sku === queryLower || label === queryLower) {
          totalScore = Math.max(totalScore, 1 * boostExact);
          matchedFields.push('variants.sku');
        } else if (sku.includes(queryLower) || label.includes(queryLower)) {
          totalScore = Math.max(totalScore, 0.8);
          matchedFields.push('variants');
        } else {
          for (const term of queryTerms) {
            if (sku.includes(term) || label.includes(term)) {
              totalScore = Math.max(totalScore, 0.6);
              matchedFields.push('variants');
              break;
            }
          }
        }
      }
    }

    if (totalScore >= threshold) {
      results.push({ item, score: totalScore, matchedFields });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

// Highlight matched terms in text
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const terms = tokenizeQuery(query);
  let result = text;
  
  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }
  
  return result;
}

// Debounce utility for search input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
