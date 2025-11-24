export enum ErrorStatus {
  New = 'pendente',
  Read = 'lido',
  Resolved = 'resolvido',
}

export enum ErrorPriority {
  High = 'Alta',
  Medium = 'Média',
  Low = 'Baixa',
  Critical = 'Crítica'
}

export interface AlertItem {
  id: string;
  message: string;
  status: ErrorStatus;
  priority: ErrorPriority;
  timestamp: string;
  workflowName?: string;
  workflowId?: string;
  severity?: string;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}