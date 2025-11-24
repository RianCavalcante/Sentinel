import React from 'react';
import { ChevronLeftIcon } from './IconComponents';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Lógica simples para mostrar páginas (pode ser melhorada para muitos números)
  const renderPageNumbers = () => {
    let pagesToShow = pages;
    if (totalPages > 7) {
       // Mostrar apenas algumas páginas se houver muitas
       if (currentPage <= 4) {
         pagesToShow = [...pages.slice(0, 5), -1, totalPages];
       } else if (currentPage >= totalPages - 3) {
         pagesToShow = [1, -1, ...pages.slice(totalPages - 5)];
       } else {
         pagesToShow = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
       }
    }

    return pagesToShow.map((page, index) => {
      if (page === -1) return <span key={`ellipsis-${index}`} className="px-2 text-text-secondary">...</span>;
      return (
        <button
          key={page}
          onClick={() => onPageChange(page as number)}
          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
            currentPage === page
              ? 'bg-n8n-red text-white'
              : 'bg-dark-card text-text-secondary hover:bg-dark-border hover:text-text-primary'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-4 animate-fade-in">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md bg-dark-card text-text-secondary hover:bg-dark-border hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-1">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md bg-dark-card text-text-secondary hover:bg-dark-border hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 transform rotate-180" />
      </button>
    </div>
  );
};
