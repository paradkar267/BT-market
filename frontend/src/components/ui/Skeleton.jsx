import React from 'react';

// Basic reusable skeleton block
export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md ${className}`} />
  );
}

// Skeleton for DenseCard (Templates Page)
export function SkeletonCard() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-black rounded-xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm overflow-hidden p-3 pb-4">
      {/* Image Area Skeleton */}
      <Skeleton className="w-full aspect-[4/3] rounded-lg mb-3" />
      
      <div className="flex flex-col flex-1 px-3">
        {/* Title & Author Skeleton */}
        <div className="flex justify-between items-start mb-1 gap-4">
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-3 w-1/3 mb-4" />

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Skeleton className="h-6 w-16 rounded-full" />
             <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for Product Page
export function ProductSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20 mt-16">
      <div className="grid lg:grid-cols-[1fr,400px] gap-12 lg:gap-20">
        
        {/* Main Content Area */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 lg:h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-6 w-1/3" />
          </div>

          {/* Main Image */}
          <Skeleton className="w-full aspect-[16/10] rounded-[2rem] lg:rounded-[3rem]" />

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
             {[1, 2, 3, 4].map(i => (
               <Skeleton key={i} className="h-24 rounded-2xl" />
             ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:mt-32">
          <div className="sticky top-32 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-black shadow-2xl">
             <Skeleton className="h-12 w-32 mb-6" />
             <Skeleton className="h-16 w-full rounded-2xl mb-4" />
             <div className="flex gap-4">
                <Skeleton className="h-14 flex-1 rounded-xl" />
                <Skeleton className="h-14 w-16 rounded-xl" />
             </div>
             
             <div className="space-y-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-3 items-center">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                      <Skeleton className="h-5 w-full" />
                   </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
