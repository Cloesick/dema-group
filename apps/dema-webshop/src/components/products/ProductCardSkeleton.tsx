export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="bg-gray-200 h-48 w-full"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        <div className="mt-6 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
