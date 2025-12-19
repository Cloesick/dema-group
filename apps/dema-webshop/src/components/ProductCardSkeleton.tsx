'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function ProductCardSkeleton({ viewMode = 'grid' }: ProductCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
        <div className="w-56 h-48 bg-gray-200 flex-shrink-0" />
        <div className="flex-1 p-5 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6, viewMode = 'grid' }: { count?: number; viewMode?: 'grid' | 'list' }) {
  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
