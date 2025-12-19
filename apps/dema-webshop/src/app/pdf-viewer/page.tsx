'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function PDFViewerContent() {
  const searchParams = useSearchParams();
  // Support both 'file' and 'pdf' parameters for backwards compatibility
  const fileParam = searchParams.get('file') || searchParams.get('pdf');
  const page = searchParams.get('page');

  if (!fileParam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No PDF specified</h1>
          <p className="text-gray-600">Please provide a PDF file to view.</p>
        </div>
      </div>
    );
  }

  // Normalize the file path - ensure it includes Product_pdfs/ if it's just a filename
  const pdfFile = fileParam.includes('/') ? fileParam : `Product_pdfs/${fileParam}`;
  
  // Use static file URL (files in public/documents/ are served at /documents/)
  const pdfUrl = `/documents/${pdfFile}${page ? `#page=${page}` : ''}`;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-sm font-medium hover:underline text-primary"
          >
            ← Back to Products
          </Link>
          <span className="text-gray-400">|</span>
          <h1 className="text-sm font-medium text-gray-900">{pdfFile}</h1>
          {page && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
              Page {page}
            </span>
          )}
        </div>
        <a
          href={`/documents/${pdfFile}`}
          download
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg"
        >
          Download PDF
        </a>
      </div>

      {/* PDF Embed - uses object tag for better cache control */}
      <div className="flex-1">
        <object
          key={pdfUrl}
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full"
        >
          <p className="p-4 text-center">
            Unable to display PDF. <a href={pdfUrl} className="text-primary underline">Download instead</a>
          </p>
        </object>
      </div>
    </div>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    }>
      <PDFViewerContent />
    </Suspense>
  );
}
