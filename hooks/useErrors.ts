import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ErrorNotification, ErrorStatus, ErrorPriority } from '../types';

export function useErrors() {
  const [errors, setErrors] = useState<ErrorNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchErrors();

    const subscription = supabase
      .channel('errors_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'errors' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchErrors(); // Recarrega lista completa por simplicidade, ou poderia manipular o estado local
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchErrors() {
    try {
      const { data, error } = await supabase
        .from('errors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedErrors: ErrorNotification[] = data.map(item => ({
          id: item.id,
          workflowName: item.workflow_name || 'Desconhecido',
          workflowId: item.workflow_id || '',
          errorNode: item.error_node_name || '', // Atualizado
          errorMessage: item.error_message || '',
          executionUrl: item.execution_url || '', // Atualizado
          timestamp: item.error_timestamp 
            ? new Date(Number(item.error_timestamp)).toISOString() 
            : item.created_at,
          status: mapStatus(item.status),
          priority: mapPriority(item.priority),
          payload: item.raw_data || {},
          errorType: item.error_name,
          errorDescription: item.error_description,
          aiAnalysis: item.ai_analysis
        }));
        setErrors(formattedErrors);
      }
    } catch (err) {
      console.error('Erro ao buscar erros:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: ErrorStatus) {
    // Otimista
    setErrors(prev => prev.map(e => e.id === id ? { ...e, status } : e));

    const dbStatus = Object.keys(statusMap).find(key => statusMap[key] === status) || 'Pending';

    const { error } = await supabase
      .from('errors')
      .update({ status: dbStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      fetchErrors(); // Reverte em caso de erro
    }
  }

  return { errors, loading, updateStatus, refresh: fetchErrors };
}

// Helpers para mapear status/prioridade entre DB (Inglês) e Frontend (Português/Enum)
const statusMap: Record<string, ErrorStatus> = {
  'Pending': ErrorStatus.New,
  'In Progress': ErrorStatus.Acknowledged,
  'Resolved': ErrorStatus.Resolved,
  'Ignored': ErrorStatus.Resolved // Mapeando Ignored para Resolved por enquanto ou criar novo status
};

const priorityMap: Record<string, ErrorPriority> = {
  'High': ErrorPriority.High,
  'Medium': ErrorPriority.Medium,
  'Low': ErrorPriority.Low,
  'Critical': ErrorPriority.High
};

function mapStatus(dbStatus: string): ErrorStatus {
  return statusMap[dbStatus] || ErrorStatus.New;
}

function mapPriority(dbPriority: string): ErrorPriority {
  return priorityMap[dbPriority] || ErrorPriority.Medium;
}
