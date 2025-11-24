import React from 'react';
import { motion } from 'framer-motion';
import { AlertItem, ErrorStatus, ErrorPriority } from '../types';
import { TrashIcon } from './IconComponents';

interface AlertCardProps {
  alert: AlertItem;
  onClick: (alert: AlertItem) => void;
  onDelete?: (id: string) => void;
}

const getPriorityColor = (priority: ErrorPriority) => {
  switch (priority) {
    case ErrorPriority.Critical: return 'bg-red-500/10 text-red-500 border-red-500/20';
    case ErrorPriority.High: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case ErrorPriority.Medium: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case ErrorPriority.Low: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getPriorityGlow = (priority: ErrorPriority) => {
  switch (priority) {
    case ErrorPriority.Critical: return 'bg-red-500 shadow-lg shadow-red-500/50';
    case ErrorPriority.High: return 'bg-orange-500 shadow-lg shadow-orange-500/50';
    case ErrorPriority.Medium: return 'bg-yellow-500 shadow-lg shadow-yellow-500/50';
    case ErrorPriority.Low: return 'bg-blue-500 shadow-lg shadow-blue-500/50';
    default: return 'bg-gray-500';
  }
};

const getStatusBadge = (status: ErrorStatus) => {
  switch (status) {
    case ErrorStatus.New: return 'bg-n8n-red text-white shadow-sm shadow-n8n-red/20';
    case ErrorStatus.Read: return 'bg-purple-600 text-white shadow-sm shadow-purple-600/20';
    case ErrorStatus.Resolved: return 'bg-green-600 text-white shadow-sm shadow-green-600/20';
    default: return 'bg-gray-600 text-gray-200';
  }
};

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick, onDelete }) => {
  const summary = alert.message.split('\n')[0].substring(0, 100) + (alert.message.length > 100 ? '...' : '');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(alert.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      onClick={() => onClick(alert)}
      className="glass-card-premium rounded-lg p-6 cursor-pointer 
                 group relative overflow-hidden"
    >
      {/* Indicador de Prioridade com Glow */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${getPriorityGlow(alert.priority)}`}></div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-n8n-red/0 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-3 pl-3">
        <h3 className="font-semibold text-text-primary text-base leading-tight line-clamp-2 
                       group-hover:text-n8n-red transition-colors flex-1" 
            title={alert.workflowName}>
          {alert.workflowName || 'Workflow Desconhecido'}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border 
                           ${getPriorityColor(alert.priority)} 
                           transition-all duration-200 group-hover:scale-105`}>
            {alert.priority}
          </span>
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="p-1.5 rounded-md text-text-secondary hover:text-red-500 
                         hover:bg-red-500/10 transition-all duration-200"
              title="Deletar alerta"
            >
              <TrashIcon className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-grow pl-3 leading-relaxed">
        {summary}
      </p>

      <div className="flex justify-between items-center mt-auto pl-3 pt-4 border-t border-white/5">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 
                         ${getStatusBadge(alert.status)} transition-all duration-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
          {alert.status}
        </span>
        <span className="text-xs text-text-secondary font-medium">
           {new Date(alert.timestamp).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </motion.div>
  );
};

