import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AlertItem, ErrorStatus, ErrorPriority, DateRange } from '../types';
import { sanitizeSearchTerm, devLog, errorLog } from '../lib/security';

interface UseAlertsParams {
  page?: number;
  pageSize?: number;
  filters?: {
    searchTerm?: string;
    status?: string;
    priority?: string;
    dateRange?: DateRange;
    onNewAlert?: (alert: AlertItem) => void;
  };
}

export function useAlerts({ page = 1, pageSize = 20, filters }: UseAlertsParams = {}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('errors')
        .select('*', { count: 'exact' });

      // Filtros com sanitização
      if (filters?.searchTerm) {
        const term = sanitizeSearchTerm(filters.searchTerm); // 🔒 SANITIZADO
        // Busca OR em message e workflow_name
        query = query.or(`message.ilike.%${term}%,workflow_name.ilike.%${term}%`);
      }

      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority && filters.priority !== 'All') {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.dateRange?.startDate && filters.dateRange?.endDate) {
        const startDate = new Date(filters.dateRange.startDate);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(filters.dateRange.endDate);
        endDate.setUTCHours(23, 59, 59, 999);

        query = query.gte('created_at', startDate.toISOString())
                     .lte('created_at', endDate.toISOString());
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      devLog('🔍 Dados do Supabase:', { data, error, count }); // DEBUG

      if (error) throw error;

      if (count !== null) setTotalCount(count);

      if (data) {
        const formattedAlerts: AlertItem[] = data.map(item => ({
          id: item.id,
          message: item.message,
          status: item.status as ErrorStatus,
          priority: item.priority as ErrorPriority,
          timestamp: item.created_at,
          workflowName: item.workflow_name
        }));
        setAlerts(formattedAlerts);
      }
    } catch (err) {
      errorLog('Erro ao buscar alertas:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchAlerts();

    const subscription = supabase
      .channel('errors_feed')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'errors' },
        (payload) => {
          devLog('🔔 Novo alerta recebido via Realtime:', payload);
          
          // Adicionar novo erro diretamente ao estado (sem refetch)
          const newAlert: AlertItem = {
            id: payload.new.id,
            message: payload.new.message,
            status: payload.new.status as ErrorStatus,
            priority: payload.new.priority as ErrorPriority,
            timestamp: payload.new.created_at,
            workflowName: payload.new.workflow_name
          };
          
          // Adicionar no início da lista (mais recente primeiro)
          setAlerts(prev => [newAlert, ...prev]);
          
          // Notificar sobre novo alerta
          if (filters?.onNewAlert) {
            devLog('📢 Disparando notificação toast...');
            filters.onNewAlert(newAlert);
          }
        }
      )
      .subscribe((status) => {
        devLog('📡 Status da subscrição Realtime:', status);
      });

    return () => {
      devLog('🔌 Desconectando Realtime...');
      subscription.unsubscribe();
    };
  }, [fetchAlerts, filters]);

  async function updateStatus(id: string, status: ErrorStatus) {
    // Otimistic update
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));

    await supabase
      .from('errors')
      .update({ status })
      .eq('id', id);
  }

  async function clearHistory() {
    if (!confirm('Tem certeza que deseja apagar todo o histórico de erros? Essa ação não pode ser desfeita.')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('errors')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); 
      
      if (error) throw error;
      setAlerts([]);
      setTotalCount(0);
    } catch (err) {
      errorLog('Erro ao limpar histórico:', err);
      alert('Erro ao limpar histórico. Verifique as permissões.');
    } finally {
      setLoading(false);
      fetchAlerts(); // Recarrega para garantir
    }
  }

  async function getAlertById(id: string) {
    const { data, error } = await supabase
      .from('errors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    
    return {
      id: data.id,
      message: data.message,
      status: data.status as ErrorStatus,
      priority: data.priority as ErrorPriority,
      timestamp: data.created_at,
      workflowName: data.workflow_name
    } as AlertItem;
  }

  async function deleteAlert(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('errors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from local state immediately for better UX
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      errorLog('Erro ao deletar alerta:', err);
      return false;
    }
  }

  return { alerts, loading, totalCount, updateStatus, clearHistory, getAlertById, deleteAlert, refresh: fetchAlerts };
}
