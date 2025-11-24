// External imports
import React from 'react';

// Components
import { DateFilter } from './DateFilter';
import { CustomSelect } from './CustomSelect';

// Types
import { ErrorStatus, ErrorPriority, DateRange } from '../types';

interface FilterControlsProps {
  filters: {
    searchTerm: string;
    status: string;
    priority: string;
    dateRange: DateRange;
  };
  onFilterChange: (filters: { searchTerm?: string; status?: string; priority?: string; dateRange?: DateRange | null }) => void;
  errorCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  errorCount
}) => {
  const { searchTerm, status, priority, dateRange } = filters;
  
  return (
    <div className="bg-dark-card p-4 border-b border-dark-border sticky top-[64px] z-20 transition-colors duration-300 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 max-w-7xl px-4 sm:px-6">
        <div className="relative w-full md:w-auto md:flex-1">
          <input
            type="text"
            placeholder="Buscar por fluxo de trabalho ou erro..."
            value={searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full bg-dark-bg border border-dark-border rounded-md pl-4 pr-10 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-n8n-red transition"
          />
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto">
          <DateFilter 
            currentRange={dateRange} 
            onDateChange={(newDateRange) => onFilterChange({ dateRange: newDateRange })} 
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <CustomSelect
              value={status}
              onChange={(val) => onFilterChange({ status: val })}
              options={[
                { value: 'All', label: 'Todos os Status' },
                ...Object.values(ErrorStatus).map(s => ({ value: s, label: s }))
              ]}
              placeholder="Status"
              className="w-full sm:w-48"
            />
            <CustomSelect
              value={priority}
              onChange={(val) => onFilterChange({ priority: val })}
              options={[
                { value: 'All', label: 'Todas as Prioridades' },
                ...Object.values(ErrorPriority).map(p => ({ value: p, label: p }))
              ]}
              placeholder="Prioridade"
              className="w-full sm:w-48"
            />
          </div>
        </div>
        <div className="text-text-secondary text-sm font-medium w-full md:w-auto text-center md:text-right">
          {errorCount} {errorCount === 1 ? 'Resultado' : 'Resultados'}
        </div>
      </div>
    </div>
  );
};
