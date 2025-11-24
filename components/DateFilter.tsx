
import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, CloseIcon } from './IconComponents';
import { DateRange } from '../types';

interface DateFilterProps {
  currentRange: DateRange;
  onDateChange: (range: DateRange | null) => void;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getDisplayDate = (isoDate: string | null) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export const DateFilter: React.FC<DateFilterProps> = ({ currentRange, onDateChange }) => {
  // Provide default values to prevent errors
  const safeRange = currentRange || { startDate: null, endDate: null };
  
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(safeRange.startDate || '');
  const [customEnd, setCustomEnd] = useState(safeRange.endDate || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  useEffect(() => {
    setCustomStart(safeRange.startDate || '');
    setCustomEnd(safeRange.endDate || '');
  }, [safeRange]);

  const setPreset = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    onDateChange({ startDate: formatDate(startDate), endDate: formatDate(endDate) });
    setIsOpen(false);
  };
  
  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onDateChange({ startDate: customStart, endDate: customEnd });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onDateChange(null);
    setIsOpen(false);
  };

  const isFilterActive = safeRange.startDate && safeRange.endDate;
  const displayLabel = isFilterActive 
    ? `${getDisplayDate(safeRange.startDate)} - ${getDisplayDate(safeRange.endDate)}`
    : 'Filtrar por Data';

  return (
    <div className="relative w-full sm:w-auto" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 
                   bg-dark-card border rounded-lg px-4 py-2.5 text-text-primary 
                   transition-all duration-200 font-medium shadow-sm
                   ${isFilterActive 
                     ? 'border-n8n-red shadow-n8n-red/20 hover:shadow-n8n-red/30' 
                     : 'border-dark-border hover:border-n8n-red/50'} 
                   hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-n8n-red/50`}
      >
        <CalendarIcon className={`w-5 h-5 transition-colors ${isFilterActive ? 'text-n8n-red' : 'text-text-secondary'}`} />
        <span className="text-sm">{displayLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-30 right-0 sm:right-auto sm:left-0 p-5 animate-fade-in backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-text-primary text-base">Filtro de Data</h4>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-text-secondary hover:text-n8n-red transition-colors p-1 rounded-md hover:bg-dark-bg"
            >
              <CloseIcon className="w-5 h-5"/>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col gap-2 mb-4">
            <button 
              onClick={() => setPreset(1)} 
              className="text-left w-full text-sm px-4 py-2.5 rounded-lg
                       bg-dark-bg border border-dark-border text-text-primary
                       hover:border-n8n-red/50 hover:bg-dark-border hover:shadow-md
                       transition-all duration-200 font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-n8n-red/50"></span>
                Últimas 24 horas
              </span>
            </button>
            <button 
              onClick={() => setPreset(7)} 
              className="text-left w-full text-sm px-4 py-2.5 rounded-lg
                       bg-dark-bg border border-dark-border text-text-primary
                       hover:border-n8n-red/50 hover:bg-dark-border hover:shadow-md
                       transition-all duration-200 font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-n8n-red/50"></span>
                Últimos 7 dias
              </span>
            </button>
            <button 
              onClick={() => setPreset(30)} 
              className="text-left w-full text-sm px-4 py-2.5 rounded-lg
                       bg-dark-bg border border-dark-border text-text-primary
                       hover:border-n8n-red/50 hover:bg-dark-border hover:shadow-md
                       transition-all duration-200 font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-n8n-red/50"></span>
                Últimos 30 dias
              </span>
            </button>
          </div>

          <div className="border-t border-dark-border my-4"></div>

          {/* Custom Date Inputs */}
          <div className="space-y-3">
             <div>
                <label className="text-xs text-text-secondary font-semibold block mb-2 uppercase tracking-wide">Data Inicial</label>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => setCustomStart(e.target.value)} 
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-text-primary
                           hover:border-n8n-red/50 focus:border-n8n-red focus:ring-2 focus:ring-n8n-red/20
                           transition-all duration-200 outline-none
                           [color-scheme:dark]" 
                />
             </div>
             <div>
                <label className="text-xs text-text-secondary font-semibold block mb-2 uppercase tracking-wide">Data Final</label>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => setCustomEnd(e.target.value)} 
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-text-primary
                           hover:border-n8n-red/50 focus:border-n8n-red focus:ring-2 focus:ring-n8n-red/20
                           transition-all duration-200 outline-none
                           [color-scheme:dark]" 
                />
             </div>
          </div>

           <div className="border-t border-dark-border my-4"></div>

           {/* Action Buttons */}
           <div className="flex justify-end gap-2">
                <button 
                  onClick={handleClear} 
                  className="px-4 py-2 text-sm bg-dark-bg border border-dark-border text-text-primary rounded-lg
                           hover:border-text-secondary hover:bg-dark-border hover:shadow-md
                           transition-all duration-200 font-medium"
                >
                  Limpar
                </button>
                <button 
                  onClick={handleApplyCustom} 
                  disabled={!customStart || !customEnd} 
                  className="px-4 py-2 text-sm bg-n8n-red hover:bg-red-700 text-white rounded-lg
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-n8n-red
                           transition-all duration-200 font-medium shadow-lg shadow-n8n-red/20
                           hover:shadow-n8n-red/40 hover:scale-[1.02]"
                >
                  Aplicar
                </button>
           </div>
        </div>
      )}
    </div>
  );
};
