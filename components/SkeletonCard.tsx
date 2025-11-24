import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 animate-pulse">
      {/* Indicador de Prioridade */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-700"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 pl-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="pl-3 space-y-2 mb-4">
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto pl-3 pt-4 border-t border-dark-border/50">
        <div className="h-6 w-20 bg-gray-700 rounded-md"></div>
        <div className="h-3 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
