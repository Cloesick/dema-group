import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

interface Product {
  sku: string;
  description: string;
  product_category: string;
  [key: string]: any;
}

interface ErrorResponse {
  error: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase();
  const limit = Math.min(Number(searchParams.get('limit')) || 15, 20); // Max 20 suggestions

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  try {
    // Read the JSON file
    const jsonDirectory = path.join(process.cwd(), 'public', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/Product_pdfs_analysis_v2.json', 'utf8');
    const products: Product[] = JSON.parse(fileContents);

    // Interface for search suggestions
    interface SearchSuggestion {
      type: string;
      value: string;
      highlight: string;
      priority: number;
    }

    // Function to get unique values from an array of suggestions
    const getUniqueValues = <T extends { value: string }>(items: T[]): T[] => {
      const seen = new Set<string>();
      return items.filter(item => {
        if (!item || !item.value) return false;
        const lowerValue = item.value.toLowerCase();
        if (seen.has(lowerValue)) return false;
        seen.add(lowerValue);
        return true;
      });
    };

    // Get matching SKUs with highlights and include category
    const skuMatches = getUniqueValues(
      products
        .filter(p => p.sku?.toLowerCase().includes(query))
        .map(p => ({
          type: 'sku',
          value: p.sku,
          category: p.product_category || '',
          highlight: p.sku.replace(
            new RegExp(`(${query})`, 'gi'), 
            '<span class="font-semibold text-blue-600">$1</span>'
          )
        }))
    ).slice(0, 5);

    // Get matching product categories with highlights and count of products
    const categoryCounts = products.reduce((acc, p) => {
      const cat = p.product_category;
      if (cat) {
        acc[cat] = (acc[cat] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const categoryMatches = Object.entries(categoryCounts)
      .filter(([cat]) => cat.toLowerCase().includes(query))
      .map(([cat, count]) => ({
        type: 'category' as const,
        value: cat,
        highlight: cat.replace(
          new RegExp(`(${query})`, 'gi'),
          '<span class="font-semibold text-green-600">$1</span>'
        ),
        count
      }))
      .sort((a, b) => b.count - a.count) // Sort by product count
      .slice(0, 5);

    // Get matching descriptions with highlights and include SKU
    const descriptionMatches = products
      .filter(p => p.description?.toLowerCase().includes(query))
      .map(p => {
        const desc = p.description || '';
        const startIndex = desc.toLowerCase().indexOf(query);
        if (startIndex === -1) return null;
        
        const start = Math.max(0, startIndex - 20);
        const end = Math.min(desc.length, startIndex + query.length + 20);
        let snippet = desc.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < desc.length) snippet = snippet + '...';
        
        return {
          type: 'description' as const,
          value: p.sku, // Use SKU as the value for the description match
          display: snippet, // Display the snippet to the user
          highlight: snippet.replace(
            new RegExp(`(${query})`, 'gi'), 
            '<span class="font-semibold text-purple-600">$1</span>'
          ),
          category: p.product_category || ''
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 5);

    // Combine all matches with priorities and ensure we have the right types
    const allSuggestions = [
      ...skuMatches.map(m => ({
        type: 'sku' as const,
        value: m.value,
        highlight: m.highlight,
        priority: 1
      })),
      ...categoryMatches.map(m => ({
        type: 'category' as const,
        value: m.value,
        highlight: m.highlight,
        priority: 2,
        count: m.count
      })),
      ...descriptionMatches.map(m => ({
        type: 'description' as const,
        value: m.value,
        display: m.display,
        highlight: m.highlight,
        category: m.category,
        priority: 3
      }))
    ];

    // Remove duplicates and sort by priority
    const uniqueSuggestions = allSuggestions
      .filter((s, i, self) => 
        i === self.findIndex(t => 
          t.type === s.type && 
          t.value.toLowerCase() === s.value.toLowerCase()
        )
      )
      .sort((a, b) => a.priority - b.priority || a.value.localeCompare(b.value));

    // Return the limited number of suggestions
    return NextResponse.json(uniqueSuggestions.slice(0, limit));
  } catch (error) {
    console.error('Search suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}
