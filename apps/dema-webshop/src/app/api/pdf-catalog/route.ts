import { NextResponse } from 'next/server';
import { getPdfCategories, getPdfsByCategory, getSubcategoriesForMain } from '@/lib/pdfCatalog';

export async function GET() {
  try {
    const categories = await getPdfCategories();
    const enriched = await Promise.all(
      categories.map(async ({ slug, label, count }) => {
        const pdfs = await getPdfsByCategory(slug);
        const subcategories = getSubcategoriesForMain(slug);
        return { slug, label, count, pdfs, subcategories };
      })
    );
    return NextResponse.json({ categories: enriched });
  } catch (e) {
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
