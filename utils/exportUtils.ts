// Types
import { AlertItem } from '../types';

export const exportToCSV = (alerts: AlertItem[], filename: string = 'alertas') => {
  // Cabeçalhos
  const headers = ['ID', 'Workflow', 'Mensagem', 'Status', 'Prioridade', 'Data'];
  
  // Linhas de dados
  const rows = alerts.map(alert => [
    alert.id,
    alert.workflowName || 'Desconhecido',
    `"${alert.message.replace(/"/g, '""')}"`, // Escape aspas duplas
    alert.status,
    alert.priority,
    new Date(alert.timestamp).toLocaleString('pt-BR'),
  ]);

  // Combinar cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Criar blob e download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (alerts: AlertItem[], filename: string = 'alertas') => {
  const jsonContent = JSON.stringify(alerts, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
