'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, X, FileJson, FileCode, Database, ArrowRight } from 'lucide-react'
import { 
  enrichProduct, 
  convertToPortalProduct, 
  convertToDemaWebshopFormat,
  generateDemaWebshopXML,
  generatePortalProductXML,
  processPIMBatch,
  type PIMExtractedProduct,
  type PIMEnrichedProduct,
  type DemaWebshopProduct
} from '@/lib/pim'
import type { Product } from '@/types'

interface ParseResult {
  filename: string
  pageCount: number
  rawText: string
  products: PIMExtractedProduct[]
  enrichedProducts: PIMEnrichedProduct[]
  portalProducts: Partial<Product>[]
  demaWebshopProducts: DemaWebshopProduct[]
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export default function AdminPIMPage() {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<ParseResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    )
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf'
      )
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const newResults: ParseResult[] = []

    for (const file of files) {
      const result: ParseResult = {
        filename: file.name,
        pageCount: 0,
        rawText: '',
        products: [],
        enrichedProducts: [],
        portalProducts: [],
        demaWebshopProducts: [],
        status: 'processing',
      }
      newResults.push(result)
      setResults([...newResults])

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/pim/parse', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to parse ${file.name}`)
        }

        const data = await response.json()
        result.pageCount = data.pageCount
        result.rawText = data.rawText
        result.products = data.products
        
        // Process through PIM pipeline - PLUG & PLAY
        const processed = processPIMBatch(data.products, 'dema')
        result.enrichedProducts = processed.enriched
        result.portalProducts = processed.portal
        result.demaWebshopProducts = processed.demaWebshop
        result.status = 'completed'

        // Save all formats to localStorage
        const existingRaw = JSON.parse(localStorage.getItem('pim_products_raw') || '[]')
        const existingEnriched = JSON.parse(localStorage.getItem('pim_products_enriched') || '[]')
        const existingPortal = JSON.parse(localStorage.getItem('pim_products_portal') || '[]')
        const existingWebshop = JSON.parse(localStorage.getItem('pim_products_webshop') || '[]')
        
        localStorage.setItem('pim_products_raw', JSON.stringify([...existingRaw, ...data.products]))
        localStorage.setItem('pim_products_enriched', JSON.stringify([...existingEnriched, ...processed.enriched]))
        localStorage.setItem('pim_products_portal', JSON.stringify([...existingPortal, ...processed.portal]))
        localStorage.setItem('pim_products_webshop', JSON.stringify([...existingWebshop, ...processed.demaWebshop]))
        
        // Keep backward compatibility
        localStorage.setItem('pim_products', JSON.stringify([...existingEnriched, ...processed.enriched]))
      } catch (error) {
        result.status = 'error'
        result.error = error instanceof Error ? error.message : 'Unknown error'
      }

      setResults([...newResults])
    }

    setIsProcessing(false)
  }

  // Export dema-webshop compatible JSON
  const exportDemaWebshopJSON = (result: ParseResult) => {
    const blob = new Blob([JSON.stringify(result.demaWebshopProducts, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename.replace('.pdf', '')}_dema_webshop.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export dema-webshop compatible XML
  const exportDemaWebshopXML = (result: ParseResult) => {
    const xml = generateDemaWebshopXML(result.demaWebshopProducts)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename.replace('.pdf', '')}_dema_webshop.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export portal-compatible JSON
  const exportPortalJSON = (result: ParseResult) => {
    const blob = new Blob([JSON.stringify(result.portalProducts, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename.replace('.pdf', '')}_portal.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export portal-compatible XML
  const exportPortalXML = (result: ParseResult) => {
    const xml = generatePortalProductXML(result.portalProducts)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename.replace('.pdf', '')}_portal.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export raw extracted data
  const exportRawJSON = (result: ParseResult) => {
    const blob = new Blob([JSON.stringify(result.products, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename.replace('.pdf', '')}_raw.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">PIM Import</h1>
          <p className="text-gray-600 mt-1">
            Upload PDF catalogs to extract and organize product data
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop PDF catalogs here
          </p>
          <p className="text-gray-500 mb-4">or</p>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border p-4">
            <h2 className="font-semibold text-gray-900 mb-4">
              Selected Files ({files.length})
            </h2>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-sm text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="mt-4 w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Process PDFs
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Results</h2>
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-xl border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="font-medium">{result.filename}</span>
                    {result.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {result.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {result.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {result.status === 'completed' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => exportDemaWebshopJSON(result)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                        title="Dema-webshop compatible JSON"
                      >
                        <FileJson className="w-4 h-4" />
                        Webshop JSON
                      </button>
                      <button
                        onClick={() => exportDemaWebshopXML(result)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1"
                        title="Dema-webshop compatible XML"
                      >
                        <FileCode className="w-4 h-4" />
                        Webshop XML
                      </button>
                      <button
                        onClick={() => exportPortalJSON(result)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                        title="Portal Product type JSON"
                      >
                        <Database className="w-4 h-4" />
                        Portal JSON
                      </button>
                      <button
                        onClick={() => exportPortalXML(result)}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 flex items-center gap-1"
                        title="Portal Product type XML"
                      >
                        <FileCode className="w-4 h-4" />
                        Portal XML
                      </button>
                      <button
                        onClick={() => exportRawJSON(result)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                        title="Raw extracted data"
                      >
                        <Download className="w-4 h-4" />
                        Raw
                      </button>
                    </div>
                  )}
                </div>

                {result.status === 'completed' && (
                  <div className="p-4">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Pages</p>
                        <p className="text-2xl font-bold">{result.pageCount}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Raw Products</p>
                        <p className="text-2xl font-bold">{result.products.length}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600">Webshop Format</p>
                        <p className="text-2xl font-bold text-blue-700">{result.demaWebshopProducts.length}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600">Portal Format</p>
                        <p className="text-2xl font-bold text-green-700">{result.portalProducts.length}</p>
                      </div>
                    </div>

                    {/* Pipeline Flow */}
                    <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-green-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-center">
                          <p className="font-medium text-gray-700">PDF</p>
                          <p className="text-gray-500">{result.filename}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <p className="font-medium text-gray-700">Extract</p>
                          <p className="text-gray-500">{result.products.length} SKUs</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <p className="font-medium text-blue-700">Enrich</p>
                          <p className="text-blue-500">+ metadata</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <p className="font-medium text-green-700">Export</p>
                          <p className="text-green-500">JSON / XML</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Preview */}
                    {result.enrichedProducts.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">
                          Enriched Products Preview (first 5)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left">SKU</th>
                                <th className="px-3 py-2 text-left">Series</th>
                                <th className="px-3 py-2 text-left">Material</th>
                                <th className="px-3 py-2 text-left">Category</th>
                                <th className="px-3 py-2 text-left">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.enrichedProducts.slice(0, 5).map((product, i) => (
                                <tr key={i} className="border-t">
                                  <td className="px-3 py-2 font-mono text-blue-600">
                                    {product.sku}
                                  </td>
                                  <td className="px-3 py-2">{product.series_name}</td>
                                  <td className="px-3 py-2">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                      {product._enriched.material}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                      {product._enriched.catalog_group}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                      {product._enriched.product_type}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700">
                    <p>{result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
