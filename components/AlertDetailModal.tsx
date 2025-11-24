// External imports
import React from 'react';

// Components
import { CloseIcon } from './IconComponents';
import { Linkifier } from './Linkifier';

// Types
import { AlertItem, ErrorStatus } from '../types';

interface AlertDetailModalProps {
  alert: AlertItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ErrorStatus) => void;
  onViewFullPage?: (id: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose, onUpdateStatus, onViewFullPage }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-dark-border animate-slide-up overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-dark-border bg-dark-bg/30">
          <div>
            <h2 className="text-xl font-bold text-text-primary font-heading">{alert.workflowName || 'Detalhes do Alerta'}</h2>
            <p className="text-sm text-text-secondary mt-1 font-medium">{new Date(alert.timestamp).toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition p-2 hover:bg-dark-bg rounded-full">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="bg-dark-bg/50 p-5 rounded-lg border border-dark-border">
            <pre className="whitespace-pre-wrap text-text-primary text-sm font-mono leading-relaxed">
              <Linkifier text={alert.message} />
            </pre>
          </div>
          
          {onViewFullPage && (
            <div className="mt-4 text-right">
              <button 
                onClick={() => onViewFullPage(alert.id)}
                className="text-sm text-n8n-red hover:underline font-medium"
              >
                Ver em página cheia &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-dark-border bg-dark-card flex justify-between items-center gap-4">
           <div className="flex gap-2 flex-wrap">
              {Object.values(ErrorStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => onUpdateStatus(alert.id, status)}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                    alert.status === status 
                      ? 'bg-text-primary text-dark-bg shadow-md transform scale-105' 
                      : 'bg-dark-bg text-text-secondary hover:bg-dark-border hover:text-text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
           </div>
           <button
            onClick={onClose}
            className="px-5 py-2 bg-dark-border hover:bg-gray-600 text-text-primary font-semibold rounded-md transition text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
