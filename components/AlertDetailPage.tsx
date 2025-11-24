// External imports
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import { ChevronLeftIcon } from './IconComponents';
import { Linkifier } from './Linkifier';

// Hooks
import { useAlerts } from '../hooks/useAlerts';

// Types
import { AlertItem, ErrorStatus } from '../types';

export const AlertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAlertById, updateStatus } = useAlerts();
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getAlertById(id).then(data => {
        setAlert(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-n8n-red"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-text-primary">
        <h2 className="text-2xl font-bold mb-4">Alerta não encontrado</h2>
        <button onClick={() => navigate('/')} className="text-n8n-red hover:underline">Voltar para o início</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Voltar para o Feed
        </button>

        <div className="bg-dark-card rounded-xl shadow-2xl border border-dark-border overflow-hidden animate-slide-up">
          <div className="p-8 border-b border-dark-border bg-dark-bg/30">
             <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold font-heading mb-2">{alert.workflowName || 'Workflow Desconhecido'}</h1>
                  <p className="text-text-secondary">Ocorrido em {new Date(alert.timestamp).toLocaleString('pt-BR')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase border ${
                  alert.priority === 'Crítica' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  alert.priority === 'Alta' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                  alert.priority === 'Média' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                  {alert.priority}
                </span>
             </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Mensagem de Erro</h3>
            <div className="bg-dark-bg p-6 rounded-lg border border-dark-border overflow-x-auto">
              <pre className="font-mono text-sm text-text-secondary whitespace-pre-wrap">
                <Linkifier text={alert.message} />
              </pre>
            </div>
          </div>

          <div className="p-8 border-t border-dark-border bg-dark-bg/10">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Atualizar Status</h3>
            <div className="flex gap-3 flex-wrap">
              {Object.values(ErrorStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    updateStatus(alert.id, status);
                    setAlert(prev => prev ? { ...prev, status } : null);
                  }}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                    alert.status === status 
                      ? 'bg-n8n-red text-white shadow-lg shadow-n8n-red/20 transform scale-105' 
                      : 'bg-dark-bg border border-dark-border text-text-secondary hover:border-text-secondary hover:text-text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
