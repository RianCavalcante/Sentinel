import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass = 'bg-n8n-red hover:bg-red-700'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-dark-card border border-dark-border rounded-lg shadow-2xl max-w-md w-full p-6 animate-slide-up">
        {/* Title */}
        <h3 className="text-xl font-semibold text-text-primary mb-3">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-text-secondary mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-text-primary 
                     hover:border-text-secondary hover:bg-dark-border transition-all duration-200
                     font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium
                       transition-all duration-200 shadow-lg
                       ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
