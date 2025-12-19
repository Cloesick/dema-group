'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Edit2, Trash2, Plus } from 'lucide-react'

interface Product {
  sku: string
  series_name: string
  source_pdf: string
  page: number
  [key: string]: string | number | undefined
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  // Load products from localStorage (in production, this would be from a database)
  useEffect(() => {
    const stored = localStorage.getItem('pim_products')
    if (stored) {
      setProducts(JSON.parse(stored))
    }
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.series_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSelect = (sku: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(sku)) {
      newSelected.delete(sku)
    } else {
      newSelected.add(sku)
    }
    setSelectedProducts(newSelected)
  }

  const selectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.sku)))
    }
  }

  const exportSelected = (format: 'json' | 'xml') => {
    const selected = products.filter((p) => selectedProducts.has(p.sku))
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(selected, null, 2)], {
        type: 'application/json',
      })
      downloadBlob(blob, 'products_export.json')
    } else {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n'
      for (const product of selected) {
        xml += '  <product>\n'
        for (const [key, value] of Object.entries(product)) {
          if (value !== undefined) {
            xml += `    <${key}>${escapeXml(String(value))}</${key}>\n`
          }
        }
        xml += '  </product>\n'
      }
      xml += '</products>'
      const blob = new Blob([xml], { type: 'application/xml' })
      downloadBlob(blob, 'products_export.xml')
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const deleteSelected = () => {
    if (confirm(`Delete ${selectedProducts.size} products?`)) {
      const remaining = products.filter((p) => !selectedProducts.has(p.sku))
      setProducts(remaining)
      localStorage.setItem('pim_products', JSON.stringify(remaining))
      setSelectedProducts(new Set())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                {products.length} products imported
              </p>
            </div>
            <div className="flex gap-2">
              {selectedProducts.size > 0 && (
                <>
                  <button
                    onClick={() => exportSelected('json')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON ({selectedProducts.size})
                  </button>
                  <button
                    onClick={() => exportSelected('xml')}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export XML
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SKU or series name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 mb-4">No products imported yet</p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Import from PIM
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Series
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Source PDF
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Page
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Properties
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.sku}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.sku)}
                        onChange={() => toggleSelect(product.sku)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3">{product.series_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {product.source_pdf}
                    </td>
                    <td className="px-4 py-3 text-sm">{product.page}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {Object.keys(product).length} fields
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
