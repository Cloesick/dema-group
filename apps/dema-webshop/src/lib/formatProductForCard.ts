import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

export interface CardSpec {
  label: string;
  value: string;
}

export interface ProductCardVM {
  title: string;
  subtitle: string;
  image: string;
  priceLabel: string;
  badges: string[];
  specs: CardSpec[];
  pdfLabel?: string;
  pdfHref?: string;
  categoryLabel?: string;
}

function firstSentence(text?: string, maxLen = 140): string {
  if (!text) return '';
  const s = text.split(/\.|\n|\r/)[0].trim();
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
}

function placeholderFor(category: string, title: string): string {
  const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, '-');
  const text = (title || category || 'Product');
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#9ca3af" dy=".3em">${text}</text></svg>`;
  // Use UTF-8 data URL to avoid btoa Unicode issues
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function fmtNumber(n?: number, unit?: string) {
  if (n === undefined || n === null || Number.isNaN(n)) return undefined;
  return unit ? `${n} ${unit}` : String(n);
}

function deriveType(p: Product): string {
  const cat = (p.product_category || '').toLowerCase();
  if (cat) return cat.replace(/[^a-z0-9]+/g, ' ').trim();
  const d = (p.description || '').toLowerCase();
  const keywords: Array<[RegExp, string]> = [
    [/hogedruk|pressure\s*washer|drukreiniger|kränzle|kranzle/, 'pressurewasher'],
    [/schroef|screw\s*driver|schroevendraaier/, 'screwdriver'],
    [/compressor|luchtcompressor/, 'compressor'],
    [/pomp|pump/, 'pump'],
    [/slang|hose/, 'hose'],
    [/koppeling|fitting|connector/, 'fitting'],
  ];
  for (const [rx, name] of keywords) { if (rx.test(d)) return name; }
  return 'product';
}

export function formatProductForCard(p: Product): ProductCardVM {
  const type = deriveType(p);
  const title = `${type} ${p.sku || ''}`.trim();
  const subtitle = '';
  const image = (p as any).image || p.imageUrl || placeholderFor(p.product_category || 'product', title);

  // Price: prefer numeric; else "Price on request"
  const priceLabel = typeof p.price === 'number' ? formatCurrency(p.price) : 'Price on request';

  const badges: string[] = [];
  if (p.inStock) badges.push('In Stock');
  if ((p as any).product_type) badges.push(String((p as any).product_type));

  // Category-aware top specs
  const specs: CardSpec[] = [];
  // Pressure
  if (typeof p.pressure_min_bar === 'number' || typeof p.pressure_max_bar === 'number') {
    const min = p.pressure_min_bar; const max = p.pressure_max_bar;
    const val = [min, max].filter(v => typeof v === 'number').join('–');
    if (val) specs.push({ label: 'Pressure', value: `${val} bar` });
  }
  if (typeof (p as any).overpressure_bar === 'number' || typeof (p as any).overpressure_mpa === 'number') {
    const bar = (p as any).overpressure_bar;
    const mpa = (p as any).overpressure_mpa;
    const val = [bar ? `${bar} bar` : undefined, mpa ? `${mpa} MPa` : undefined].filter(Boolean).join(' ');
    if (val) specs.push({ label: 'Overpressure', value: val });
  }
  if (typeof p.flow_l_min === 'number' || typeof (p as any).flow_l_h === 'number') {
    const parts = [
      typeof p.flow_l_min === 'number' ? `${p.flow_l_min} L/min` : undefined,
      typeof (p as any).flow_l_h === 'number' ? `${(p as any).flow_l_h} L/h` : undefined,
    ].filter(Boolean).join(' • ');
    if (parts) specs.push({ label: 'Flow', value: parts });
  } else if (Array.isArray(p.flow_l_min_list) && p.flow_l_min_list.length) {
    specs.push({ label: 'Flow', value: `${p.flow_l_min_list[0]} L/min` });
  } else if (typeof p.debiet_m3_h === 'number') {
    specs.push({ label: 'Flow', value: `${p.debiet_m3_h} m³/h` });
  }
  if (typeof p.power_input_kw === 'number' || typeof p.power_output_kw === 'number') {
    const pin = typeof p.power_input_kw === 'number' ? p.power_input_kw : undefined;
    const pout = typeof p.power_output_kw === 'number' ? p.power_output_kw : undefined;
    const val = [pin, pout].filter(v => typeof v === 'number').join(' / ');
    if (val) specs.push({ label: 'Power In/Out', value: `${val} kW` });
  } else if (typeof p.power_kw === 'number') {
    specs.push({ label: 'Power', value: fmtNumber(p.power_kw, 'kW')! });
  } else if (typeof p.power_hp === 'number') {
    specs.push({ label: 'Power', value: fmtNumber(p.power_hp, 'HP')! });
  }
  if (typeof p.voltage_v === 'number' || typeof p.frequency_hz === 'number' || typeof p.current_a === 'number') {
    const v = typeof p.voltage_v === 'number' ? `${p.voltage_v}V` : undefined;
    const ph = typeof p.phase_count === 'number' ? `~${p.phase_count}` : undefined;
    const hz = typeof p.frequency_hz === 'number' ? `${p.frequency_hz}Hz` : undefined;
    const a = typeof p.current_a === 'number' ? `${p.current_a}A` : undefined;
    const val = [v, ph, hz, a].filter(Boolean).join(' ');
    if (val) specs.push({ label: 'Electrical', value: val });
  }
  if (typeof p.rpm === 'number') specs.push({ label: 'RPM', value: String(p.rpm) });
  if (typeof p.cable_length_m === 'number') specs.push({ label: 'Cable', value: fmtNumber(p.cable_length_m, 'm')! });
  if (typeof p.length_mm === 'number' || typeof p.width_mm === 'number' || typeof p.height_mm === 'number') {
    const L = typeof p.length_mm === 'number' ? p.length_mm : undefined;
    const W = typeof p.width_mm === 'number' ? p.width_mm : undefined;
    const H = typeof p.height_mm === 'number' ? p.height_mm : undefined;
    const parts = [L, W, H].filter(v => typeof v === 'number').join('×');
    if (parts) specs.push({ label: 'Dimensions', value: `${parts} mm` });
  }
  // Sizes
  if (Array.isArray(p.dimensions_mm_list) && p.dimensions_mm_list.length) {
    const shown = p.dimensions_mm_list.slice(0, 3).join(', ');
    specs.push({ label: 'Sizes', value: `${shown}mm${p.dimensions_mm_list.length > 3 ? '…' : ''}` });
  }
  // Weight
  if (typeof p.weight_kg === 'number') specs.push({ label: 'Weight', value: fmtNumber(p.weight_kg, 'kg')! });

  const pdfHref = p.pdf_source ? p.pdf_source : undefined;
  const pdfLabel = pdfHref ? 'Datasheet' : undefined;

  return {
    title,
    subtitle,
    image,
    priceLabel,
    badges,
    specs: specs.slice(0, 7),
    pdfHref,
    pdfLabel,
    categoryLabel: p.product_category,
  };
}
