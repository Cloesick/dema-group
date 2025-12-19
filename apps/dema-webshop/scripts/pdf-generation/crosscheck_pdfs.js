const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const DATA_JSON = path.resolve(__dirname, '..', 'public', 'data', 'Product_pdfs_analysis_v2.json');
const PDF_DIR = path.resolve(__dirname, '..', 'public', 'documents', 'Product_pdfs');
const REPORT_OUT = path.resolve(__dirname, '..', 'public', 'data', 'Product_pdfs_crosscheck_report.json');

function normText(s) {
  return String(s || '')
    // unify whitespace
    .replace(/[\u00A0\u202F\u2007]/g, ' ')
    // remove soft hyphens
    .replace(/[\u00AD]/g, '')
    // collapse spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function numberVariants(n) {
  // return canonical with dot and with comma for decimals
  if (n == null) return [];
  const s = String(n);
  if (!s.includes('.')) return [s];
  return [s, s.replace('.', ',')];
}

async function extractPagesText(pdfPath, pageNumbers) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const parser = new PDFParse(data);
  await parser.load();
  const wanted = (pageNumbers || []).map(n => Math.max(0, n - 1));
  const set = new Set(wanted);
  const pagesToFetch = wanted.length ? wanted : Array.from({ length: parser.document.numPages }, (_, i) => i);
  const chunks = [];
  for (const idx of pagesToFetch) {
    try {
      const txt = await parser.getPageText(idx);
      // getPageText may return array or string depending on lib; normalize
      chunks.push(Array.isArray(txt) ? txt.join(' ') : String(txt));
    } catch (_) { /* ignore page errors */ }
  }
  await parser.destroy();
  return chunks.join('\n');
}

function matchAnyRegex(text, regexes) {
  const t = normText(text);
  return regexes.some(rx => rx && rx.test(t));
}

function numVariantsPattern(n) {
  // allow dot or comma decimal separators
  const s = String(n);
  if (s.includes('.')) {
    const c = s.replace('.', ',');
    return `(?:${escapeRegex(s)}|${escapeRegex(c)})`;
  }
  return escapeRegex(s);
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildNumUnitRegex(n, unit) {
  const nv = numVariantsPattern(n);
  const u = unit
    .replace(/\s*\(\s*a\s*\)/i, '') // simplify dB(A) -> dB
    .toLowerCase();
  const unitPattern = u
    .replace(/l\/min/i, 'l\s*\/\s*min')
    .replace(/db/i, 'db(?:\s*\(\s*a\s*\))?')
    .replace(/mm/i, 'mm')
    .replace(/hz/i, 'hz')
    .replace(/v/i, 'v')
    .replace(/kw/i, 'kw')
    .replace(/hp/i, 'hp')
    .replace(/kg/i, 'kg')
    .replace(/bar/i, 'bar');
  return new RegExp(`(?:^|\n|\b)${nv}\s*${unitPattern}(?:\b|\n)`, 'i');
}

function buildDimensionRegex(len, wid, hei) {
  const l = numVariantsPattern(len);
  const w = numVariantsPattern(wid);
  const h = numVariantsPattern(hei);
  return new RegExp(`(?:^|\n|\b)${l}\s*[x\u00D7]\s*${w}\s*[x\u00D7]\s*${h}\s*mm(?:\b|\n)`, 'i');
}

function valueWithUnitVariants(value, unit, sep = ' ') {
  // Builds strings like "150 L/min" with whitespace normalization and comma variants
  const vals = numberVariants(value);
  return vals.map(v => `${v}${sep}${unit}`);
}

function dimTripleVariants(len, wid, hei) {
  // variants for dimensions with spaces and x separators
  const l = numberVariants(len); const w = numberVariants(wid); const h = numberVariants(hei);
  const seps = [' x ', 'x', ' x', 'x '];
  const units = [' mm', 'mm'];
  const out = [];
  for (const ls of l) for (const ws of w) for (const hs of h) {
    for (const sep1 of seps) for (const sep2 of seps) for (const u of units) {
      out.push(`${ls}${sep1}${ws}${sep2}${hs}${u}`);
    }
  }
  return out;
}

function checkFieldsAgainstText(item, pageText) {
  const checks = {};
  // Pressures
  if (item.pressure_values_bar && item.pressure_values_bar.length) {
    const regs = item.pressure_values_bar.map(v => buildNumUnitRegex(v, 'bar'));
    checks.pressure_values_bar = matchAnyRegex(pageText, regs);
  } else {
    if (item.pressure_min_bar != null) checks.pressure_min_bar = matchAnyRegex(pageText, [buildNumUnitRegex(item.pressure_min_bar, 'bar')]);
    if (item.pressure_max_bar != null) checks.pressure_max_bar = matchAnyRegex(pageText, [buildNumUnitRegex(item.pressure_max_bar, 'bar')]);
  }

  // Flow L/min
  if (item.flow_l_min_list && item.flow_l_min_list.length) {
    const regs = item.flow_l_min_list.map(v => buildNumUnitRegex(v, 'L/min'));
    checks.flow_l_min_list = matchAnyRegex(pageText, regs);
  }

  // RPM
  if (item.rpm_list && item.rpm_list.length) {
    const regs = item.rpm_list.map(v => buildNumUnitRegex(v, 'rpm'));
    checks.rpm_list = matchAnyRegex(pageText, regs);
  } else if (item.rpm != null) {
    checks.rpm = matchAnyRegex(pageText, [buildNumUnitRegex(item.rpm, 'rpm')]);
  }

  // Dimensions
  if (item.dimensions_mm && item.dimensions_mm.length) {
    const regs = item.dimensions_mm.map(d => buildDimensionRegex(d.length_mm, d.width_mm, d.height_mm));
    checks.dimensions_mm = matchAnyRegex(pageText, regs);
  } else if (item.length_mm && item.width_mm && item.height_mm) {
    checks.dimensions_mm = matchAnyRegex(pageText, [buildDimensionRegex(item.length_mm, item.width_mm, item.height_mm)]);
  }

  // Volume L (tank)
  if (item.tank_volume_l_list && item.tank_volume_l_list.length) {
    const regs = item.tank_volume_l_list.map(v => buildNumUnitRegex(v, 'L'));
    checks.tank_volume_l_list = matchAnyRegex(pageText, regs);
  } else if (item.volume_l != null) {
    checks.volume_l = matchAnyRegex(pageText, [buildNumUnitRegex(item.volume_l, 'L')]);
  }

  // Weight kg
  if (item.weight_kg_list && item.weight_kg_list.length) {
    const regs = item.weight_kg_list.map(v => buildNumUnitRegex(v, 'kg'));
    checks.weight_kg_list = matchAnyRegex(pageText, regs);
  } else if (item.weight_kg != null) {
    checks.weight_kg = matchAnyRegex(pageText, [buildNumUnitRegex(item.weight_kg, 'kg')]);
  }

  // Noise dB(A)
  if (item.noise_db_a_list && item.noise_db_a_list.length) {
    const regs = item.noise_db_a_list.map(v => buildNumUnitRegex(v, 'dB'));
    checks.noise_db_a_list = matchAnyRegex(pageText, regs);
  } else if (item.noise_db_a != null) {
    checks.noise_db_a = matchAnyRegex(pageText, [buildNumUnitRegex(item.noise_db_a, 'dB')]);
  }

  // Power hp/kW
  if (item.power_hp_list && item.power_hp_list.length) {
    const regs = item.power_hp_list.map(v => buildNumUnitRegex(v, 'hp'));
    checks.power_hp_list = matchAnyRegex(pageText, regs);
  } else if (item.power_hp != null) {
    checks.power_hp = matchAnyRegex(pageText, [buildNumUnitRegex(item.power_hp, 'hp')]);
  }
  if (item.power_kw_list && item.power_kw_list.length) {
    const regs = item.power_kw_list.map(v => buildNumUnitRegex(v, 'kW'));
    checks.power_kw_list = matchAnyRegex(pageText, regs);
  } else if (item.power_kw != null) {
    checks.power_kw = matchAnyRegex(pageText, [buildNumUnitRegex(item.power_kw, 'kW')]);
  }

  // Voltage, frequency, phase
  if (item.voltage_v_list && item.voltage_v_list.length) {
    const regs = item.voltage_v_list.map(v => buildNumUnitRegex(v, 'V'));
    checks.voltage_v_list = matchAnyRegex(pageText, regs);
  } else if (item.voltage_v != null) {
    checks.voltage_v = matchAnyRegex(pageText, [buildNumUnitRegex(item.voltage_v, 'V')]);
  }
  if (item.frequency_hz_list && item.frequency_hz_list.length) {
    const regs = item.frequency_hz_list.map(v => buildNumUnitRegex(v, 'Hz'));
    checks.frequency_hz_list = matchAnyRegex(pageText, regs);
  } else if (item.frequency_hz != null) {
    checks.frequency_hz = matchAnyRegex(pageText, [buildNumUnitRegex(item.frequency_hz, 'Hz')]);
  }
  if (item.phase_count_list && item.phase_count_list.length) {
    // look for patterns like "50 Hz / 3" with flexible spacing
    const regs = [];
    for (const f of (item.frequency_hz_list || [item.frequency_hz]).filter(Boolean)) {
      for (const ph of item.phase_count_list) {
        const fp = numVariantsPattern(f);
        regs.push(new RegExp(`${fp}\s*hz\s*\/\s*${escapeRegex(ph)}`, 'i'));
      }
    }
    checks.phase_count_list = matchAnyRegex(pageText, regs);
  }

  // Sizes
  if (item.sizes_mm_list && item.sizes_mm_list.length) {
    const regs = item.sizes_mm_list.map(v => buildNumUnitRegex(v, 'mm'));
    checks.sizes_mm_list = matchAnyRegex(pageText, regs);
  }
  if (item.sizes_inch_list && item.sizes_inch_list.length) {
    const regs = item.sizes_inch_list.map(v => new RegExp(`(?:^|\\D)${escapeRegex(String(v))}\\s*\\\"`,'i'));
    checks.sizes_inch_list = matchAnyRegex(pageText, regs);
  }

  // Connection types/materials/features keywords
  if (item.connection_types && item.connection_types.length) {
    const regs = item.connection_types.map(w => new RegExp(`\\b${escapeRegex(String(w))}\\b`, 'i'));
    checks.connection_types = matchAnyRegex(pageText, regs);
  }
  if (item.materials && item.materials.length) {
    const regs = item.materials.map(w => new RegExp(`\\b${escapeRegex(String(w))}\\b`, 'i'));
    checks.materials = matchAnyRegex(pageText, regs);
  }
  if (item.features && item.features.length) {
    const regs = item.features.map(w => new RegExp(`\\b${escapeRegex(String(w))}\\b`, 'i'));
    checks.features = matchAnyRegex(pageText, regs);
  }

  // Confidence: ratio of true checks
  const keys = Object.keys(checks);
  const trues = keys.filter(k => checks[k]).length;
  const confidence = keys.length ? trues / keys.length : 0;

  return { checks, confidence };
}

async function main() {
  const raw = fs.readFileSync(DATA_JSON, 'utf8');
  const items = JSON.parse(raw);

  const report = [];
  for (const item of items) {
    const pdfPath = path.join(PDF_DIR, item.pdf_source || '');
    const pages = Array.isArray(item.source_pages) && item.source_pages.length ? item.source_pages : [];
    const entry = {
      sku: item.sku,
      pdf_source: item.pdf_source,
      source_pages: pages,
      ok: false,
      confidence: 0,
      notes: ''
    };
    try {
      if (!fs.existsSync(pdfPath)) {
        entry.notes = 'PDF not found';
      } else if (!pages.length) {
        entry.notes = 'No source_pages';
      } else {
        const text = await extractPagesText(pdfPath, pages);
        entry.extracted_text_len = normText(text).length;
        if (!entry.extracted_text_len || entry.extracted_text_len < 80) {
          entry.notes = 'Little or no text extracted (likely image-based PDF); OCR needed for validation';
        } else {
          const { checks, confidence } = checkFieldsAgainstText(item, text);
          entry.checks = checks;
          entry.confidence = Number(confidence.toFixed(3));
          entry.ok = confidence >= 0.6; // threshold
        }
      }
    } catch (e) {
      entry.notes = 'Error: ' + e.message;
    }
    report.push(entry);
  }

  fs.writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote crosscheck report for ${report.length} items to ${REPORT_OUT}`);
}

if (require.main === module) {
  main();
}
