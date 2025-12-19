import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.demashop.be';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quote-request`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic catalog pages
  const catalogPages: MetadataRoute.Sitemap = [];
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'products_all_grouped.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const products = JSON.parse(data);
    
    // Get unique catalogs
    const catalogSet = new Set<string>();
    products.forEach((p: any) => catalogSet.add(p.catalog));
    const catalogs = Array.from(catalogSet);
    
    for (const catalog of catalogs) {
      catalogPages.push({
        url: `${baseUrl}/products?catalog=${catalog}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticPages, ...catalogPages];
}
