'use client';

import { Skeleton } from './skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Category badge */}
        <Skeleton className="h-4 w-1/3" />
        
        {/* Property badges */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        
        {/* Variants count */}
        <Skeleton className="h-4 w-1/2" />
        
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-16 rounded" />
                <Skeleton className="w-16 h-16 rounded" />
                <Skeleton className="w-16 h-16 rounded" />
              </div>
            </div>

            {/* Details skeleton */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              {/* SKU */}
              <Skeleton className="h-4 w-32" />

              {/* Property badges */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>

              {/* Variant selector */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Add to quote button */}
              <Skeleton className="h-14 w-full rounded-lg" />

              {/* Specifications */}
              <div className="space-y-3 pt-4 border-t">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 rounded" />
                  <Skeleton className="h-10 rounded" />
                  <Skeleton className="h-10 rounded" />
                  <Skeleton className="h-10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
