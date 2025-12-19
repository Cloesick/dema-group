import fs from 'fs/promises';
import path from 'path';

export interface PdfItem {
  name: string;
  href: string;
}

export interface PdfCategory {
  slug: string;
  label: string;
  count: number;
}

export interface SubcategoryInfo {
  slug: string;
  label: string;
}

const baseRel = path.join('public', 'documents', 'Product_pdfs');

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Define taxonomy (main categories with subcategories) based on user's list
const TAXONOMY: { slug: string; label: string; sub: { slug: string; label: string; keywords: RegExp[] }[] }[] = [
  {
    label: 'Pompen & toebehoren',
    slug: toSlug('Pompen & toebehoren'),
    sub: [
      { label: 'Dompelpompen', slug: toSlug('Dompelpompen'), keywords: [/dompelpomp/i] },
      { label: 'Centrifugaalpompen', slug: toSlug('Centrifugaalpompen'), keywords: [/centrifug/i] },
      { label: 'Bronpompen', slug: toSlug('Bronpompen'), keywords: [/bronpomp/i] },
      { label: 'Zuigerpompen', slug: toSlug('Zuigerpompen'), keywords: [/zuigerpomp/i] },
      { label: 'Pomp specials', slug: toSlug('Pomp specials'), keywords: [/pomp.*special/i] },
      { label: 'Toebehoren', slug: toSlug('Toebehoren'), keywords: [/toebehoren|accessoire/i] },
    ],
  },
  {
    label: 'Kunststof leidingsystemen',
    slug: toSlug('Kunststof leidingsystemen'),
    sub: [
      { label: 'ABS persluchtbuizen, fittingen en toebehoren', slug: toSlug('ABS persluchtbuizen, fittingen en toebehoren'), keywords: [/abs\b.*(buis|fitt)/i] },
      { label: 'PE buizen & hulpstukken', slug: toSlug('PE buizen & hulpstukken'), keywords: [/\bpe\b.*(buis|hulpstuk|fitt)/i] },
      { label: 'Kunststof afvoerleidingen', slug: toSlug('Kunststof afvoerleidingen'), keywords: [/afvoerleid/i] },
      { label: 'PVC-U drukbuizen & fittingen', slug: toSlug('PVC-U drukbuizen & fittingen'), keywords: [/pvc-?u.*(druk|buis|fitt)/i] },
    ],
  },
  {
    label: 'Metalen leidingsystemen',
    slug: toSlug('Metalen leidingsystemen'),
    sub: [
      { label: 'Verzinkte buizen & fittingen', slug: toSlug('Verzinkte buizen & fittingen'), keywords: [/verzinkt/i] },
      { label: 'Zwarte draad- & lasfittingen', slug: toSlug('Zwarte draad- & lasfittingen'), keywords: [/zwarte.*(draad|las)fitt/i] },
      { label: 'Messing draadfittingen', slug: toSlug('Messing draadfittingen'), keywords: [/messing.*fitt/i] },
      { label: 'RVS draad- & lasfittingen', slug: toSlug('RVS draad- & lasfittingen'), keywords: [/(rvs|inox).*fitt/i] },
    ],
  },
  {
    label: 'Industriële slangen & koppelingen',
    slug: toSlug('Industriële slangen & koppelingen'),
    sub: [
      { label: 'Mengmestverdelers', slug: toSlug('Mengmestverdelers'), keywords: [/mengmestverdel/i] },
      { label: 'Kunststof slangen', slug: toSlug('Kunststof slangen'), keywords: [/kunststof.*slang/i] },
      { label: 'Plat oprolbare slangen', slug: toSlug('Plat oprolbare slangen'), keywords: [/plat.*oprolbaar.*slang/i] },
      { label: 'Rubber slangen', slug: toSlug('Rubber slangen'), keywords: [/rubber.*slang/i] },
      { label: 'PU afzuigslangen', slug: toSlug('PU afzuigslangen'), keywords: [/pu.*afzuig.*slang/i] },
      { label: 'Slangkoppelingen', slug: toSlug('Slangkoppelingen'), keywords: [/slangkoppeling/i] },
      { label: 'Slangklemmen', slug: toSlug('Slangklemmen'), keywords: [/slangklem/i] },
      { label: 'Dichtingen voor slangkoppelingen', slug: toSlug('Dichtingen voor slangkoppelingen'), keywords: [/dichting.*slangkoppeling/i] },
      { label: 'Slangtrommels', slug: toSlug('Slangtrommels'), keywords: [/slangtrommel/i] },
    ],
  },
  {
    label: 'Aandrijftechniek',
    slug: toSlug('Aandrijftechniek'),
    sub: [
      { label: 'Oliekeerringen', slug: toSlug('Oliekeerringen'), keywords: [/oliekeer/i] },
      { label: 'Aandrijfriemen', slug: toSlug('Aandrijfriemen'), keywords: [/aandrijf.*riem/i] },
      { label: 'Nylon stafmateriaal', slug: toSlug('Nylon stafmateriaal'), keywords: [/nylon.*staf/i] },
      { label: 'Trillingsdempers', slug: toSlug('Trillingsdempers'), keywords: [/trilling.*demper/i] },
      { label: 'Aandrijfassen', slug: toSlug('Aandrijfassen'), keywords: [/aandrijf.*as/i] },
      { label: 'Kettingaandrijvingen', slug: toSlug('Kettingaandrijvingen'), keywords: [/ketting.*aandrijf/i] },
      { label: 'Lagers & lagerhuizen', slug: toSlug('Lagers & lagerhuizen'), keywords: [/lager/i] },
    ],
  },
  {
    label: 'Afsluiters & appendages',
    slug: toSlug('Afsluiters & appendages'),
    sub: [
      { label: 'Mofafsluiters', slug: toSlug('Mofafsluiters'), keywords: [/mofafsluit/i] },
      { label: 'Kogelkranen', slug: toSlug('Kogelkranen'), keywords: [/kogelkran/i] },
      { label: 'Vlinderkleppen', slug: toSlug('Vlinderkleppen'), keywords: [/vlinderklep/i] },
      { label: 'Dubbeldienstkranen', slug: toSlug('Dubbeldienstkranen'), keywords: [/dubbeldienst/i] },
      { label: 'Plaatafsluiters', slug: toSlug('Plaatafsluiters'), keywords: [/plaatafsluit/i] },
      { label: 'Membraanafsluiters', slug: toSlug('Membraanafsluiters'), keywords: [/membraan.*afsluit/i] },
      { label: 'Schuifafsluiters', slug: toSlug('Schuifafsluiters'), keywords: [/schuif.*afsluit/i] },
      { label: 'Mengmestafsluiters en -appendages', slug: toSlug('Mengmestafsluiters en -appendages'), keywords: [/mengmest.*(afsluit|appendage)/i] },
      { label: 'Vlotterafsluiters', slug: toSlug('Vlotterafsluiters'), keywords: [/vlotter.*afsluit/i] },
      { label: 'Brandkranen', slug: toSlug('Brandkranen'), keywords: [/brandkran/i] },
      { label: 'Terugslagkleppen', slug: toSlug('Terugslagkleppen'), keywords: [/terugslag.*klep/i] },
    ],
  },
  {
    label: 'Meet- & regeltechniek',
    slug: toSlug('Meet- & regeltechniek'),
    sub: [
      { label: 'Watermeters & vloeistofmeters', slug: toSlug('Watermeters & vloeistofmeters'), keywords: [/watermeter|vloeistofmeter/i] },
      { label: 'Filtratie', slug: toSlug('Filtratie'), keywords: [/filtratie|filter/i] },
      { label: 'Manometers', slug: toSlug('Manometers'), keywords: [/manometer/i] },
      { label: 'Drukreduceerventielen', slug: toSlug('Drukreduceerventielen'), keywords: [/drukreduceer.*ventiel/i] },
    ],
  },
  {
    label: 'Beregening',
    slug: toSlug('Beregening'),
    sub: [
      { label: 'Serreberegening', slug: toSlug('Serreberegening'), keywords: [/serre.*beregen/i] },
      { label: 'Beregeningshaspels & sectorsproeiers', slug: toSlug('Beregeningshaspels & sectorsproeiers'), keywords: [/haspel|sectorsproeier/i] },
      { label: 'Tuinberegening', slug: toSlug('Tuinberegening'), keywords: [/tuin.*beregen/i] },
      { label: 'Beregeningsbuizen & koppelingen', slug: toSlug('Beregeningsbuizen & koppelingen'), keywords: [/beregen.*(buis|koppeling)/i] },
    ],
  },
  {
    label: 'Bevestigingsmaterialen',
    slug: toSlug('Bevestigingsmaterialen'),
    sub: [
      { label: 'Bouten, moeren & ringen', slug: toSlug('Bouten, moeren & ringen'), keywords: [/bout|moer|ring\b/i] },
      { label: 'Schroeven', slug: toSlug('Schroeven'), keywords: [/schroef/i] },
      { label: 'Asborgingen', slug: toSlug('Asborgingen'), keywords: [/asborg/i] },
      { label: 'Sluitingen', slug: toSlug('Sluitingen'), keywords: [/sluiting/i] },
      { label: 'Bandijzer', slug: toSlug('Bandijzer'), keywords: [/bandijzer/i] },
      { label: 'Nagels, nieten, brads & krammen', slug: toSlug('Nagels, nieten, brads & krammen'), keywords: [/nagel|nieten|brads|krammen/i] },
      { label: 'Touw', slug: toSlug('Touw'), keywords: [/touw/i] },
      { label: 'Borgveren', slug: toSlug('Borgveren'), keywords: [/borgveer/i] },
      { label: 'Kabelbinders', slug: toSlug('Kabelbinders'), keywords: [/kabelbinder/i] },
      { label: 'Spieën', slug: toSlug('Spieën'), keywords: [/spie(?!l)/i] },
      { label: 'Klemmen', slug: toSlug('Klemmen'), keywords: [/klem\b/i] },
      { label: 'Draadstangen & draadeinden', slug: toSlug('Draadstangen & draadeinden'), keywords: [/draadstang|draadeind/i] },
      { label: 'Bouwverankering', slug: toSlug('Bouwverankering'), keywords: [/bouwveranker/i] },
      { label: 'Blindklinknagels & blindklinkmoeren', slug: toSlug('Blindklinknagels & blindklinkmoeren'), keywords: [/blindklink/i] },
    ],
  },
  {
    label: 'Machines',
    slug: toSlug('Machines'),
    sub: [],
  },
  {
    label: 'Gereedschappen',
    slug: toSlug('Gereedschappen'),
    sub: [
      { label: 'Knipex', slug: toSlug('Knipex'), keywords: [/knipex/i] },
      { label: 'Wiha', slug: toSlug('Wiha'), keywords: [/wiha/i] },
      { label: 'Facom', slug: toSlug('Facom'), keywords: [/facom/i] },
      { label: 'Rigid', slug: toSlug('Rigid'), keywords: [/rigid/i] },
      { label: 'Solide', slug: toSlug('Solide'), keywords: [/solide/i] },
      { label: 'Force', slug: toSlug('Force'), keywords: [/\bforce\b/i] },
      { label: 'Stanley', slug: toSlug('Stanley'), keywords: [/stanley/i] },
    ],
  },
];

const MAIN_BY_SLUG = new Map(TAXONOMY.map(m => [m.slug, m]));
const SUB_BY_SLUG = new Map(
  TAXONOMY.flatMap(m => m.sub.map(s => [s.slug, { ...s, parent: m.slug, parentLabel: m.label }]))
);

function categorizeFileToSubcategory(filename: string): string | undefined {
  const text = filename.toLowerCase();
  for (const main of TAXONOMY) {
    for (const sub of main.sub) {
      if (sub.keywords.some(re => re.test(text))) return sub.slug;
    }
  }
  return undefined;
}

// Build a catalog keyed by subcategory slug
export async function getPdfCatalog(): Promise<Record<string, PdfItem[]>> {
  const root = path.resolve(process.cwd(), baseRel);
  const out: Record<string, PdfItem[]> = {};
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folder = path.join(root, entry.name);
        const files = await fs.readdir(folder, { withFileTypes: true });
        for (const f of files) {
          if (f.isFile() && f.name.toLowerCase().endsWith('.pdf')) {
            const key = categorizeFileToSubcategory(`${entry.name} ${f.name}`) || 'uncategorized';
            if (!out[key]) out[key] = [];
            out[key].push({
              name: f.name,
              href: `/documents/Product_pdfs/${encodeURIComponent(entry.name)}/${encodeURIComponent(f.name)}`,
            });
          }
        }
      }
    }
    const rootFiles = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.pdf'));
    for (const f of rootFiles) {
      const key = categorizeFileToSubcategory(f.name) || 'uncategorized';
      if (!out[key]) out[key] = [];
      out[key].push({ name: f.name, href: `/documents/Product_pdfs/${encodeURIComponent(f.name)}` });
    }
  } catch {
    return {};
  }
  return out;
}

// Return only MAIN categories with aggregated counts of their subcategories
export async function getPdfCategories(): Promise<PdfCategory[]> {
  const subCatalog = await getPdfCatalog();
  const res: PdfCategory[] = [];
  for (const main of TAXONOMY) {
    const subSlugs = main.sub.map(s => s.slug);
    const count = subSlugs.reduce((acc, s) => acc + (subCatalog[s]?.length || 0), 0);
    res.push({ slug: main.slug, label: main.label, count });
  }
  return res;
}

export async function getPdfsByCategory(slug: string): Promise<PdfItem[]> {
  const subCatalog = await getPdfCatalog();
  if (MAIN_BY_SLUG.has(slug)) {
    const main = MAIN_BY_SLUG.get(slug)!;
    return main.sub.flatMap(s => subCatalog[s.slug] || []);
  }
  if (SUB_BY_SLUG.has(slug)) {
    return subCatalog[slug] || [];
  }
  return [];
}

export function getSubcategoriesForMain(slug: string): SubcategoryInfo[] {
  const main = MAIN_BY_SLUG.get(slug);
  if (!main) return [];
  return main.sub.map(s => ({ slug: s.slug, label: s.label }));
}
