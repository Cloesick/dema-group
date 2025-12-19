import { NextRequest, NextResponse } from 'next/server'

interface ExtractedProduct {
  sku: string
  series_name: string
  source_pdf: string
  page: number
  [key: string]: string | number | undefined
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Dynamic import for pdf-parse
    const pdfParse = await import('pdf-parse')
    const pdfData = await (pdfParse as any)(buffer)

    const rawText = pdfData.text
    const pageCount = pdfData.numpages
    const filename = file.name

    // Extract products from the PDF text
    const products = extractProductsFromText(rawText, filename, pageCount)

    return NextResponse.json({
      filename,
      pageCount,
      rawText: rawText.substring(0, 10000), // Limit raw text for preview
      products,
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}

function extractProductsFromText(
  text: string,
  filename: string,
  pageCount: number
): ExtractedProduct[] {
  const products: ExtractedProduct[] = []
  const lines = text.split('\n').filter((line) => line.trim())

  // Common patterns for product data extraction
  const skuPatterns = [
    /\b([A-Z]{2,6}[0-9]{3,8})\b/g, // e.g., ABSB02090, PUMP001234
    /\b([0-9]{6,12})\b/g, // Pure numeric SKUs
    /\b(Art\.?\s*[Nn]r\.?\s*[:.]?\s*([A-Z0-9-]+))/g, // Art. Nr: XXX
    /\b(Bestelnr\.?\s*[:.]?\s*([A-Z0-9-]+))/g, // Bestelnr: XXX
  ]

  // Try to detect table-like structures
  const tableRows = detectTableRows(lines)

  if (tableRows.length > 0) {
    // Process as table data
    for (const row of tableRows) {
      const product = parseTableRow(row, filename)
      if (product) {
        products.push(product)
      }
    }
  } else {
    // Fallback: Extract SKUs and surrounding context
    let currentPage = 1
    const pageMarkers = text.split(/page\s*\d+|pagina\s*\d+/i)

    for (const pattern of skuPatterns) {
      let match: RegExpExecArray | null
      while ((match = pattern.exec(text)) !== null) {
        const sku = match[2] || match[1]
        if (sku && sku.length >= 4 && !products.find((p) => p.sku === sku)) {
          // Get context around the SKU
          const context = getContextAroundMatch(text, match.index, 200)
          const properties = extractPropertiesFromContext(context)

          products.push({
            sku,
            series_name: properties.series || 'Unknown',
            source_pdf: filename,
            page: estimatePage(match.index, text.length, pageCount),
            ...properties,
          })
        }
      }
      // Reset regex lastIndex for next pattern
      pattern.lastIndex = 0
    }
  }

  return products
}

function detectTableRows(lines: string[]): string[][] {
  const rows: string[][] = []
  let headerDetected = false
  let columnCount = 0

  for (const line of lines) {
    // Detect potential table rows by consistent separators
    const cells = line.split(/\t|  +|\|/).filter((c) => c.trim())

    if (cells.length >= 3) {
      if (!headerDetected) {
        // Check if this looks like a header row
        const hasHeaderKeywords = cells.some((c) =>
          /^(sku|art|bestelnr|maat|type|prijs|price|size|code|nr)/i.test(c.trim())
        )
        if (hasHeaderKeywords) {
          headerDetected = true
          columnCount = cells.length
          rows.push(cells.map((c) => c.trim()))
          continue
        }
      }

      if (headerDetected && cells.length >= columnCount - 1) {
        rows.push(cells.map((c) => c.trim()))
      }
    }
  }

  return rows
}

function parseTableRow(row: string[], filename: string): ExtractedProduct | null {
  if (row.length < 2) return null

  // Try to identify SKU column (usually first or has specific pattern)
  let sku = ''
  const properties: Record<string, string> = {}

  for (let i = 0; i < row.length; i++) {
    const cell = row[i]

    // Check if cell looks like a SKU
    if (!sku && /^[A-Z]{2,6}[0-9]{3,8}$/.test(cell)) {
      sku = cell
    } else if (!sku && /^[0-9]{6,12}$/.test(cell)) {
      sku = cell
    } else {
      // Store as property
      properties[`col_${i}`] = cell
    }
  }

  if (!sku) return null

  return {
    sku,
    series_name: properties.col_1 || 'Unknown',
    source_pdf: filename,
    page: 1,
    ...properties,
  }
}

function getContextAroundMatch(text: string, index: number, radius: number): string {
  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + radius)
  return text.substring(start, end)
}

function extractPropertiesFromContext(context: string): Record<string, string> {
  const properties: Record<string, string> = {}

  // Common property patterns
  const patterns: [RegExp, string][] = [
    [/maat[:\s]+([0-9]+\s*mm)/i, 'maat'],
    [/size[:\s]+([0-9]+\s*mm)/i, 'size'],
    [/diameter[:\s]+([0-9]+)/i, 'diameter'],
    [/werkdruk[:\s]+([0-9]+\s*bar)/i, 'werkdruk'],
    [/pressure[:\s]+([0-9]+\s*bar)/i, 'pressure'],
    [/type[:\s]+([A-Za-z0-9-]+)/i, 'type'],
    [/materiaal[:\s]+([A-Za-z]+)/i, 'material'],
    [/material[:\s]+([A-Za-z]+)/i, 'material'],
    [/serie[:\s]+([A-Za-z0-9\s]+)/i, 'series'],
    [/series[:\s]+([A-Za-z0-9\s]+)/i, 'series'],
  ]

  for (const [pattern, key] of patterns) {
    const match = context.match(pattern)
    if (match) {
      properties[key] = match[1].trim()
    }
  }

  return properties
}

function estimatePage(charIndex: number, totalChars: number, pageCount: number): number {
  const ratio = charIndex / totalChars
  return Math.max(1, Math.ceil(ratio * pageCount))
}
