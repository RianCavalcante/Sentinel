import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './IconComponents';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    console.log('CustomSelect: selecionado', optionValue);
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full sm:w-48 ${className}`} ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 
                   bg-dark-card border rounded-lg px-4 py-2.5 text-text-primary 
                   transition-all duration-200 font-medium shadow-sm
                   ${isOpen 
                     ? 'border-n8n-red shadow-n8n-red/20 ring-1 ring-n8n-red/50' 
                     : 'border-dark-border hover:border-n8n-red/50 hover:bg-dark-bg'} 
                   focus:outline-none`}
      >
        <span className="truncate text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180 text-n8n-red' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-dark-card border border-dark-border rounded-xl shadow-xl z-40 overflow-hidden animate-fade-in backdrop-blur-sm">
          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                          ${option.value === value 
                            ? 'bg-n8n-red/10 text-n8n-red font-medium' 
                            : 'text-text-primary hover:bg-dark-bg hover:text-n8n-red'}
                          `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
