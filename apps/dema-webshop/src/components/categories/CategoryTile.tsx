'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';

// Format a slug into a readable label (e.g., "messing-draadfittingen" -> "Messing Draadfittingen")
function formatSlugAsLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get localized label without triggering i18n warnings
function getLocalizedLabel(slug: string, label: string, translations: Record<string, string>): string {
  const key = `categories.labels.${slug}`;
  // Check if translation exists in the translations object directly
  if (translations[key] && translations[key] !== key) {
    return translations[key];
  }
  // Fallback to provided label, or format the slug nicely
  return label || formatSlugAsLabel(slug);
}

export default function CategoryTile({ slug, label, count, pdfs, subcategories }: { slug: string; label: string; count: number; pdfs?: { name: string; href: string }[]; subcategories?: { slug: string; label: string }[] }) {
  const router = useRouter();
  const { t, translations } = useLocale();

  const localizedLabel = getLocalizedLabel(slug, label, translations);

  return (
    <div
      role="button"
      tabIndex={0}
      className="block rounded-md border border-gray-200 bg-white p-4 hover:shadow-card-hover transition-shadow cursor-pointer select-none"
      onClick={(e) => {
        e.preventDefault();
        // Left click -> open PDFs page for the category
        router.push(`/categories/${slug}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/categories/${slug}`);
        }
      }}
      onContextMenu={(e) => {
        // Right click -> show PDFs page for the category
        e.preventDefault();
        router.push(`/categories/${slug}`);
      }}
      title={`${t('categories.hints.left_products')} • ${t('categories.hints.right_documents')}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{localizedLabel}</span>
        <span className="inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {count}
        </span>
      </div>
      {Array.isArray(subcategories) && subcategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {subcategories.map((s) => (
            <Link
              key={s.slug}
              href={`/categories/${s.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[12px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {getLocalizedLabel(s.slug, s.label, translations)}
            </Link>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-gray-500 break-words">/categories/{slug}</p>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Strict filter by category
            router.push(`/products?category=${encodeURIComponent(label)}`);
          }}
        >
          {t('categories.view_products')}
        </button>
      </div>
      {Array.isArray(pdfs) && pdfs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">{t('categories.documents')}</p>
          <ul className="space-y-1">
            {pdfs.slice(0, 3).map((pdf) => (
              <li key={pdf.href}>
                <Link
                  href={pdf.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[13px] text-blue-600 hover:underline line-clamp-1 break-all"
                  title={pdf.name}
                >
                  {pdf.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
