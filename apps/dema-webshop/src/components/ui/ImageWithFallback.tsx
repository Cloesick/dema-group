'use client';

import { useState, useMemo } from 'react';
import Image, { ImageProps } from 'next/image';

export interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackText?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackSrc,
  fallbackText,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Generate a placeholder color based on the alt text or src
  const placeholderColor = useMemo(() => {
    const str = alt || String(src);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 90%)`;
  }, [alt, src]);

  if (error || !src) {
    const displayText = fallbackText || alt || 'Product';
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="100%" height="100%" fill="${placeholderColor}" />
        <text x="50%" y="50%" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#6b7280" dy=".3em">
          ${displayText.split(' ').slice(0, 3).join(' ').substring(0, 30)}
        </text>
      </svg>
    `.trim().replace(/\s+/g, ' ');
    
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    
    return (
      <div className={className}>
        <img
          src={dataUrl}
          alt={alt}
          className="w-full h-full object-contain"
          style={{ backgroundColor: placeholderColor }}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default ImageWithFallback;
