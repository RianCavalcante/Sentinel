import { Step } from 'react-joyride';

export const tourSteps: Step[] = [
  {
    target: '.header-logo',
    title: '👋 Bem-vindo ao Sentinel!',
    content: 'Este é seu centro de controle para monitorar erros do n8n em tempo real. Vou te mostrar as principais funcionalidades!',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.kpi-grid',
    title: '📊 Visão Geral',
    content: 'Acompanhe métricas importantes: total de erros, taxa de resolução e tendências em tempo real.',
    placement: 'bottom',
  },
  {
    target: '.search-bar',
    title: '🔍 Busca Rápida',
    content: 'Encontre erros específicos digitando palavras-chave relacionadas ao workflow, nó ou mensagem.',
    placement: 'bottom',
  },
  {
    target: '.filter-section',
    title: '🎛️ Filtros Avançados',
    content: 'Filtre por status (pendente/resolvido), prioridade, período de tempo e muito mais.',
    placement: 'left',
  },
  {
    target: '.notifications-bell',
    title: '🔔 Notificações em Tempo Real',
    content: 'Receba alertas instantâneos quando novos erros acontecerem, com som e notificação do navegador.',
    placement: 'bottom-end',
  },
  {
    target: '.profile-dropdown',
    title: '👤 Seu Perfil',
    content: 'Gerencie sua conta, altere seu avatar, configure preferências e muito mais.',
    placement: 'bottom-start',
  },
  {
    target: '.error-table',
    title: '📋 Tabela de Erros',
    content: 'Clique em qualquer linha para ver detalhes completos, incluindo sugestões de correção, possíveis causas e link direto para o workflow no n8n.',
    placement: 'top',
  },
];

export const tourLocale = {
  back: 'Anterior',
  close: 'Fechar',
  last: 'Finalizar',
  next: 'Próximo',
  open: 'Abrir diálogo',
  skip: 'Pular Tutorial',
};
