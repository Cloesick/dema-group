'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TestImagesPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    const testImages = [
      '/product-images-by-pdf/abs-persluchtbuizen/ABSBU016_abs-persluchtbuizen_p005_10bar[+ABSBU020+ABSBU025+PN10].webp',
      '/product-images-by-pdf/abs-persluchtbuizen/ABSLK016_abs-persluchtbuizen_p010_10bar[+ABSLK020+ABSLK025].webp',
      '/product-images-by-pdf/abs-persluchtbuizen/ABSR016_abs-persluchtbuizen_p011_10bar[+ABSR020+ABSR025].webp',
    ];

    const results = testImages.map(url => ({
      url,
      shortName: url.split('/').pop()?.substring(0, 30) + '...'
    }));

    setTestResults(results);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Image Loading Test</h1>
        
        <div className="space-y-6">
          {testResults.map((test, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">{test.shortName}</h3>
              <p className="text-xs text-gray-500 mb-4 break-all">{test.url}</p>
              
              <div className="border-2 border-gray-300 rounded p-4 bg-gray-50">
                <p className="text-sm font-semibold mb-2">Standard img tag:</p>
                <img 
                  src={test.url} 
                  alt={`Test ${idx}`}
                  className="max-w-sm h-auto"
                  onLoad={() => console.log('Loaded:', test.url)}
                  onError={(e) => {
                    console.error('Failed to load:', test.url);
                    (e.target as HTMLImageElement).style.border = '2px solid red';
                  }}
                />
              </div>

              <div className="mt-4 border-2 border-blue-300 rounded p-4 bg-blue-50">
                <p className="text-sm font-semibold mb-2">Next.js Image:</p>
                <div className="relative w-64 h-64">
                  <Image
                    src={test.url}
                    alt={`Test ${idx}`}
                    fill
                    className="object-contain"
                    unoptimized
                    onLoadingComplete={() => console.log('Next Image loaded:', test.url)}
                    onError={() => console.error('Next Image failed:', test.url)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p className="text-sm">Check the browser console for loading messages</p>
          <p className="text-sm">Images should be at: public/product-images-by-pdf/abs-persluchtbuizen/</p>
        </div>
      </div>
    </div>
  );
}
