// Service Worker para notificações push avançadas
// Este SW permite notificações mesmo com o navegador em background

const CACHE_NAME = 'sentinel-v1';
const NOTIFICATION_TAG = 'sentinel-error';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Receber mensagens do app principal
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data.type === 'NEW_ERROR') {
    const { alert } = event.data;
    showNotification(alert);
  }
});

// Exibir notificação customizada
function showNotification(alert) {
  const title = '🛡️ Sentinel - Novo Erro';
  const workflowName = alert.workflowName || 'Workflow';
  const errorPreview = alert.message?.substring(0, 80) || 'Erro detectado no workflow';
  
  const options = {
    body: `📍 ${workflowName}\n⚠️ ${errorPreview}${alert.message && alert.message.length > 80 ? '...' : ''}`,
    tag: `${NOTIFICATION_TAG}-${alert.id || Date.now()}`, // Tag única para cada notificação
    requireInteraction: false,
    silent: false, // Permite som do sistema
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      alertId: alert.id,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  self.registration.showNotification(title, options);
}

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event.action);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // Abrir ou focar na aba do dashboard
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Procurar por uma aba já aberta
          for (const client of clientList) {
            if (client.url.includes('localhost') && 'focus' in client) {
              return client.focus();
            }
          }
          // Se não encontrar, abrir nova aba
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada');
});
