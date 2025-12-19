'use client';

import { useEffect, useRef, useState } from 'react';

interface PDFViewerWithHighlightProps {
  pdfUrl: string;
  page: number;
  searchTerm?: string;
  fileName: string;
}

export default function PDFViewerWithHighlight({ 
  pdfUrl, 
  page, 
  searchTerm,
  fileName 
}: PDFViewerWithHighlightProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState(1.5);
  const [highlights, setHighlights] = useState<any[]>([]);

  // Sync page prop with currentPage state
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    // Load PDF.js dynamically
    const loadPdf = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Load PDF.js from CDN
        const pdfjsLib = await import('pdfjs-dist');
        // Use unpkg which has all versions
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      // Search for text to highlight
      if (searchTerm) {
        const textContent = await page.getTextContent();
        const foundHighlights: any[] = [];

        textContent.items.forEach((item: any) => {
          const text = item.str.toUpperCase();
          const search = searchTerm.toUpperCase();

          if (text.includes(search)) {
            const transform = item.transform;
            const x = transform[4];
            const y = transform[5];
            const width = item.width;
            const height = item.height;

            // Convert PDF coordinates to canvas coordinates
            const canvasX = x * scale;
            const canvasY = canvas.height - (y * scale) - (height * scale);
            const canvasWidth = width * scale;
            const canvasHeight = height * scale;

            foundHighlights.push({
              x: canvasX,
              y: canvasY,
              width: canvasWidth,
              height: canvasHeight
            });

            // Draw red rectangle around the text
            context.strokeStyle = 'red';
            context.lineWidth = 3;
            context.strokeRect(canvasX - 2, canvasY - 2, canvasWidth + 4, canvasHeight + 4);
            
            // Add semi-transparent red background
            context.fillStyle = 'rgba(255, 0, 0, 0.15)';
            context.fillRect(canvasX - 2, canvasY - 2, canvasWidth + 4, canvasHeight + 4);
          }
        });

        setHighlights(foundHighlights);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, searchTerm]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/products"
            className="text-sm font-medium hover:underline"
            style={{ color: '#00ADEF' }}
          >
            ← Back to Products
          </a>
          <span className="text-gray-400">|</span>
          <h1 className="text-sm font-medium text-gray-900">{fileName}</h1>
        </div>

        {searchTerm && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium text-red-700">
              Highlighting: <strong>{searchTerm}</strong>
            </span>
            {highlights.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold">
                {highlights.length} found
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium"
            title="Zoom in"
          >
            +
          </button>

          <span className="text-gray-400">|</span>

          {/* Page navigation */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} / {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-gray-800 p-8">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="shadow-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
