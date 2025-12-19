'use client';

import Navbar from '@/components/layout/Navbar';
import ProductFilters from '@/components/products/ProductFilters';
import ProductList from '@/components/products/ProductList';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types/product';
import { useLocale } from '@/contexts/LocaleContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Localized verbatim copy extracted/summarized from demashop.be (EN; NL/FR fallback to EN for now)
type LocalizedCopy = {
  en: { title: string; paragraphs: string[]; items?: string[]; downloadLabel?: string; downloadHref?: string };
  nl: { title: string; paragraphs: string[]; items?: string[]; downloadLabel?: string; downloadHref?: string };
  fr: { title: string; paragraphs: string[]; items?: string[]; downloadLabel?: string; downloadHref?: string };
};

const CATEGORY_CONTENT: Record<string, LocalizedCopy> = {
  'pumps-accessories': {
    en: {
      title: 'Pumps & accessories',
      paragraphs: [
        'For professional, industrial and domestic applications Dema has the right pump for you. In addition to our range of Grundfos well pumps and Dab submersible pumps, we have various alternatives to meet everyone\'s requirements and budget.',
        'Our team of product experts would be happy to assist you in selecting your pump and the corresponding hoses and couplings.'
      ],
      items: ['Submersible pumps','Centrifugal pumps','Well pumps','Piston pumps','Pump specials'],
      downloadLabel: 'Catalogus Pompen & toebehoren',
      downloadHref: 'https://www.demashop.be/data/documents/categories/digitale-versie-pompentoebehoren-compressed.pdf'
    },
    nl: { title: 'Pompen & toebehoren', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined },
    fr: { title: 'Pompes & accessoires', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined }
  },
  'plastic-piping': {
    en: {
      title: 'Plastic piping',
      paragraphs: [
        'The extensive product range and the specialized technical knowledge of our employees make DEMA a reliable partner for plastic pipe systems.',
        'Due to our large stock, we usually succeed in providing you with the necessary products for your technical challenge.'
      ],
      items: ['ABS compressed air pipes, fittings and accessories','PE pipes & fittings','Plastic drain pipes','Pressure pipes & fittings'],
      downloadLabel: 'Catalogus kunststof leidingsystemen',
      downloadHref: 'https://www.demashop.be/data/documents/categories/digitale-versie-kunststof-leidingsystemen-compressed-1.pdf'
    },
    nl: { title: 'Kunststof leidingsystemen', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined },
    fr: { title: 'Systèmes de canalisations synthétiques', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined }
  },
  'metal-piping': {
    en: {
      title: 'Metal piping',
      paragraphs: [
        'Thanks to its extensive stock and wide range, DEMA has become a strong reference in metal pipe systems.',
        'Find the right metal fittings and pipes in galvanised, black, brass or stainless steel, always supported with the necessary technical advice.'
      ],
      items: ['Galvanised pipes & fittings','Threaded & socket weld black pipe fittings','Brass threaded fittings','SS threaded & socket weld pipe fittings'],
      downloadLabel: 'Catalogus metalen leidingen & fittingen',
      downloadHref: 'https://www.demashop.be/data/documents/categories/dema-catalogus-metalen-leidingen-fittingen-06102023-compressed-2.pdf'
    },
    nl: { title: 'Metalen leidingsystemen', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined },
    fr: { title: 'Système de canalisations métalliques', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined }
  },
  'industrial-hoses-and-couplings': {
    en: {
      title: 'Industrial hoses and couplings',
      paragraphs: [
        'In a few decades DEMA has built up a large stock of hoses and couplings suitable for fluid, air or powder transport.',
        'Combined with strong know-how across agro-industry, agriculture, food transport, horticulture, manure processing and more, DEMA is a reliable partner.',
        'You are always served with correct, technically sound advice – ensuring the most suitable hose and/or coupling for your application.'
      ],
      items: ['Synthetic hoses','Lay flat hoses','Rubber hoses','PU suction hoses','Hose couplings','Hose clamps','Hose reels'],
      downloadLabel: 'Catalogus industriële slangen koppelingen',
      downloadHref: 'https://www.demashop.be/data/documents/categories/dema-catalogus-industriele-slangen-koppelingen-300323.pdf'
    },
    nl: { title: 'Industriële slangen en koppelingen', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined },
    fr: { title: 'Tuyaux et raccords industriels', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined }
  },
  'transmission': {
    en: {
      title: 'Transmission',
      paragraphs: [
        'Drives transfer power and energy from tool carriers (such as a tractor) to implements. Drive technology is the collective name for everything needed to drive.',
        'Dema offers drive chains, gear drive shafts, bearings and bearing housings, and more. Brands include SKF, NTN-SNR, Bondioli&Pavesi and Walterscheid.'
      ],
      items: ['Drive shafts','Chain drives','Bearings & bearing housings'],
      downloadLabel: 'Catalogus aandrijftechniek',
      downloadHref: 'https://www.demashop.be/data/documents/categories/catalogus-aandrijftechniek-150922.pdf'
    },
    nl: { title: 'Aandrijftechniek', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined },
    fr: { title: 'Entraînement', paragraphs: [], items: [], downloadLabel: undefined, downloadHref: undefined }
  },
  'valves-and-fittings': {
    en: {
      title: 'Valves and fittings',
      paragraphs: [
        'DEMA has a diverse product range of valves suitable for the process industry and the agricultural sector (e.g. fertilization and irrigation applications).',
        'Globe sealed valves, gate valves, ball valves, diaphragm valves and non-return valves are just a few examples from our comprehensive range.'
      ]
    },
    nl: { title: 'Afsluiters & appendages', paragraphs: [], items: [] },
    fr: { title: 'Vannes et raccords', paragraphs: [], items: [] }
  },
  'measurement-control': {
    en: {
      title: 'Measurement & control',
      paragraphs: [
        'Flow and pressure are two factors that play an important role when transporting media (e.g. water, chemicals,...) through piping systems.',
        'Dema offers a professional range of water and pressure meters, filter technology and pressure reducing valves with brands such as Amiad, Cintropur, Arad and others.'
      ]
    },
    nl: { title: 'Meet- & regeltechniek', paragraphs: [], items: [] },
    fr: { title: 'Mesure et contrôle', paragraphs: [], items: [] }
  },
  'irrigation': {
    en: {
      title: 'Irrigation',
      paragraphs: [
        'Since 1985 DEMA is known as the specialist in irrigation, sprinkling and drainage in Roeselare and surroundings.',
        'In consultation we make the right choices regarding the type of pump, sprinkler, nebulizer, drip irrigation or sprinkler reel and control, as well as fittings and meters.'
      ]
    },
    nl: { title: 'Beregening', paragraphs: [], items: [] },
    fr: { title: 'Irrigation', paragraphs: [], items: [] }
  },
  'fasteners': {
    en: { title: 'Fasteners', paragraphs: ['Fasteners assortment and accessories for professional applications.'] },
    nl: { title: 'Bevestigingsmiddelen', paragraphs: [] },
    fr: { title: 'Fixations', paragraphs: [] }
  },
  'power-tools': {
    en: { title: 'Power tools', paragraphs: ['Selection of professional power tools such as Makita electric tools and Kränzle high-pressure cleaners, among other quality brands.'] },
    nl: { title: 'Elektrisch gereedschap', paragraphs: [] },
    fr: { title: 'Outils électriques', paragraphs: [] }
  },
  'tools': {
    en: { title: 'Tools', paragraphs: ['Hand tools and gardening tools for professional and hobby use.'] },
    nl: { title: 'Gereedschap', paragraphs: [] },
    fr: { title: 'Outils', paragraphs: [] }
  }
};

// Static sample products (same content/layout as /products)
const SAMPLE_PRODUCTS: Product[] = [
  {
    sku: 'DEMO-1001',
    name: 'Aluminium Air Pipe 20mm',
    description: 'High-quality aluminium compressed air pipe, 20mm diameter',
    product_category: 'plastic-piping',
    pdf_source: '/documents/catalog.pdf',
    source_pages: [12, 13],
    pressure_max_bar: 16,
    flow_l_min: 1200,
    weight_kg: 2.4
  },
  {
    sku: 'DEMO-2001',
    name: 'Industrial Hose Connector',
    description: 'Durable hose connector for industrial applications',
    product_category: 'industrial-hoses-and-couplings',
    pdf_source: '/documents/hose-connector.pdf',
    source_pages: [4, 5],
    pressure_max_bar: 10,
    power_kw: 7.5,
    voltage_v: 400,
    flow_l_min: 980,
    weight_kg: 180,
  },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = (Array.isArray((params as any).slug) ? (params as any).slug[0] : (params as any).slug || '').toString();
  const { locale, t } = useLocale();
  const title = slug ? slug.replace(/-/g, ' ') : 'Category';
  const copy = CATEGORY_CONTENT[slug]?.[locale] || CATEGORY_CONTENT[slug]?.en;

  const [pdfs, setPdfs] = useState<{ name: string; href: string }[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingPdfs(true);
        setPdfError(null);
        const res = await fetch(`/api/pdf-catalog/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON response');
        }
        const data = await res.json();
        if (!cancelled) setPdfs(Array.isArray(data?.pdfs) ? data.pdfs : []);
      } catch (e: any) {
        if (!cancelled) setPdfError('Failed to load documents');
      } finally {
        if (!cancelled) setLoadingPdfs(false);
      }
    };
    if (slug) load();
    return () => { cancelled = true; };
  }, [slug]);

  const Icon = (() => {
    switch (slug) {
      case 'pumps-accessories':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h6l3 3V9l-3 3H3z" />
            <circle cx="17" cy="12" r="3" />
          </svg>
        );
      case 'plastic-piping':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="8" width="18" height="8" rx="2" />
            <path d="M3 12h18" />
          </svg>
        );
      case 'metal-piping':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10h16v4H4z" />
            <path d="M8 10V6m8 8v4" />
          </svg>
        );
      case 'industrial-hoses-and-couplings':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 8c4-4 12 4 16 0" />
            <path d="M4 16c4-4 12 4 16 0" />
          </svg>
        );
      case 'transmission':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a7.97 7.97 0 0 0 .4-3l2-1-2-3-2 1a8 8 0 0 0-2-2l1-2-3-2-1 2a7.97 7.97 0 0 0-3 0L8 2 5 4l1 2a8 8 0 0 0-2 2l-2-1-2 3 2 1a8 8 0 0 0 0 3l-2 1 2 3 2-1a8 8 0 0 0 2 2l-1 2 3 2 1-2a7.97 7.97 0 0 0 3 0l1 2 3-2-1-2a8 8 0 0 0 2-2l2 1 2-3-2-1z" />
          </svg>
        );
      case 'valves-and-fittings':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M12 3v18" />
          </svg>
        );
      case 'measurement-control':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21a9 9 0 1 0-9-9" />
            <path d="M12 12l4-2" />
          </svg>
        );
      case 'irrigation':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C9 6 7 8 7 11a5 5 0 0 0 10 0c0-3-2-5-5-9z" />
          </svg>
        );
      case 'fasteners':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 2h10v4H7z" />
            <path d="M12 6v16" />
          </svg>
        );
      case 'power-tools':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h13l5 5-5 5H3z" />
          </svg>
        );
      case 'tools':
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 7l-7 7 3 3 7-7" />
            <path d="M5 12l-3 3 4 4 3-3" />
          </svg>
        );
      default:
        return () => (
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>
        );
    }
  })();

  // Local filtering: if slug provided, filter; otherwise show all sample products
  const products = slug
    ? SAMPLE_PRODUCTS.filter(p => !p.product_category || p.product_category === slug)
    : SAMPLE_PRODUCTS;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumbs and back link */}
        <nav className="mb-4 text-sm text-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="hover:text-gray-900">{t('nav.home')}</a>
            <span>/</span>
            <a href="/categories" className="hover:text-gray-900">{t('nav.categories')}</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{copy?.title || title}</span>
          </div>
          <a href="/categories" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            {t('breadcrumbs.back_to_categories')}
          </a>
        </nav>
        {/* Hero */}
        <section className="mb-6 rounded-lg bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Icon />
              {copy?.title || title}
            </h1>
          </div>
          {copy?.downloadHref && (
            <div className="mt-3">
              <a href={copy.downloadHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-800">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                {copy.downloadLabel || t('categories.download_catalog')}
              </a>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-6" />

        {/* Documents discovered from folder */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Documents</h2>
          {loadingPdfs ? (
            <div className="text-sm text-gray-600">Loading documents…</div>
          ) : pdfError ? (
            <div className="text-sm text-red-600">{pdfError}</div>
          ) : pdfs.length === 0 ? (
            <div className="text-sm text-gray-600">No documents found for this category.</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {pdfs.map((p) => (
                <li key={p.href} className="">
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="block rounded border border-gray-200 bg-white p-3 text-sm text-blue-700 hover:underline truncate">
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {copy && (
          <section className="mb-8 space-y-3">
            {copy.paragraphs?.map((p, i) => (
              <p key={i} className="text-gray-700">{p}</p>
            ))}
            {copy.items && copy.items.length > 0 && (
              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {copy.items.map((label, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <span className="text-gray-800">{label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <ProductFilters
              products={SAMPLE_PRODUCTS as any}
              onFilterChange={() => {}}
              onSearch={() => {}}
            />
          </aside>
          <section className="md:col-span-3">
            {products.length === 0 ? (
              <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-6">
                {t('categories.empty')}
              </div>
            ) : (
              <ProductList
                products={products}
                renderProduct={(p) => <ProductCard product={p} viewMode="grid" />}
                className=""
                itemClassName=""
                layout="grid"
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
