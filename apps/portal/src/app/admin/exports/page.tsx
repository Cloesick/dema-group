'use client'

import { useState, useEffect } from 'react'
import { Download, FileJson, FileCode, FileText, Clock, CheckCircle } from 'lucide-react'

interface ExportHistory {
  id: string
  filename: string
  format: 'json' | 'xml' | 'properties'
  productCount: number
  timestamp: string
}

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportHistory[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const storedExports = localStorage.getItem('pim_exports')
    if (storedExports) {
      setExports(JSON.parse(storedExports))
    }
    const storedProducts = localStorage.getItem('pim_products')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  const exportAll = (format: 'json' | 'xml' | 'properties') => {
    if (products.length === 0) {
      alert('No products to export. Import some PDFs first.')
      return
    }

    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case 'json':
        content = JSON.stringify(products, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break

      case 'xml':
        content = generateXML(products)
        mimeType = 'application/xml'
        extension = 'xml'
        break

      case 'properties':
        content = generateProperties(products)
        mimeType = 'text/plain'
        extension = 'properties'
        break
    }

    const filename = `dema_products_${Date.now()}.${extension}`
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    // Save to history
    const newExport: ExportHistory = {
      id: Date.now().toString(),
      filename,
      format,
      productCount: products.length,
      timestamp: new Date().toISOString(),
    }
    const updatedExports = [newExport, ...exports].slice(0, 20)
    setExports(updatedExports)
    localStorage.setItem('pim_exports', JSON.stringify(updatedExports))
  }

  const generateXML = (products: any[]): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<catalog>\n'
    xml += '  <metadata>\n'
    xml += `    <generated>${new Date().toISOString()}</generated>\n`
    xml += `    <productCount>${products.length}</productCount>\n`
    xml += '    <source>DEMA Group PIM</source>\n'
    xml += '  </metadata>\n'
    xml += '  <products>\n'

    for (const product of products) {
      xml += '    <product>\n'
      for (const [key, value] of Object.entries(product)) {
        if (value !== undefined && value !== null) {
          const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_')
          xml += `      <${safeKey}>${escapeXml(String(value))}</${safeKey}>\n`
        }
      }
      xml += '    </product>\n'
    }

    xml += '  </products>\n'
    xml += '</catalog>'
    return xml
  }

  const generateProperties = (products: any[]): string => {
    let props = '# DEMA Group Product Catalog\n'
    props += `# Generated: ${new Date().toISOString()}\n`
    props += `# Total Products: ${products.length}\n\n`

    for (const product of products) {
      const sku = product.sku || 'UNKNOWN'
      props += `# Product: ${sku}\n`

      for (const [key, value] of Object.entries(product)) {
        if (value !== undefined && value !== null) {
          const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_')
          const safeValue = String(value).replace(/\n/g, '\\n').replace(/=/g, '\\=')
          props += `${sku}.${safeKey}=${safeValue}\n`
        }
      }
      props += '\n'
    }

    return props
  }

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Export Products</h1>
          <p className="text-gray-600 mt-1">
            Export your product catalog in various formats
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* JSON Export */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileJson className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">JSON Format</h3>
                <p className="text-sm text-gray-500">For web applications</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Standard JSON format compatible with web apps, APIs, and databases.
              Includes all product properties and enriched data.
            </p>
            <button
              onClick={() => exportAll('json')}
              disabled={products.length === 0}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>

          {/* XML Export */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileCode className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">XML Format</h3>
                <p className="text-sm text-gray-500">For ERP systems</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Structured XML format for enterprise systems, ERP integration,
              and legacy applications.
            </p>
            <button
              onClick={() => exportAll('xml')}
              disabled={products.length === 0}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export XML
            </button>
          </div>

          {/* Properties Export */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Properties Format</h3>
                <p className="text-sm text-gray-500">Key-value pairs</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Java-style properties format with SKU-prefixed keys.
              Easy to parse and human-readable.
            </p>
            <button
              onClick={() => exportAll('properties')}
              disabled={products.length === 0}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Properties
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Current Catalog</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Unique Series</p>
              <p className="text-2xl font-bold">
                {new Set(products.map((p) => p.series_name)).size}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Source PDFs</p>
              <p className="text-2xl font-bold">
                {new Set(products.map((p) => p.source_pdf)).size}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Exports</p>
              <p className="text-2xl font-bold">{exports.length}</p>
            </div>
          </div>
        </div>

        {/* Export History */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Export History</h2>
          </div>
          {exports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No exports yet. Export your products above.
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Format
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Products
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp) => (
                  <tr key={exp.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{exp.filename}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          exp.format === 'json'
                            ? 'bg-blue-100 text-blue-700'
                            : exp.format === 'xml'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {exp.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">{exp.productCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(exp.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
