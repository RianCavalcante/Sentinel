// Helper para gerenciar notificações e Service Worker

export class NotificationManager {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Registra o Service Worker
   */
  static async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não suportado neste navegador');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.swRegistration = registration;
      console.log('✅ Service Worker registrado');

      // Aguardar SW estar pronto
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker pronto');

      // Se não tiver controller, aguardar ou recarregar
      if (!navigator.serviceWorker.controller) {
        console.log('⏳ Aguardando Service Worker assumir controle...');
        
        // Aguardar controllerchange
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('✅ Service Worker assumiu controle');
            resolve();
          }, { once: true });

          // Timeout de 2 segundos
          setTimeout(() => {
            if (!navigator.serviceWorker.controller) {
              console.log('🔄 Recarregando para ativar Service Worker...');
              window.location.reload();
            }
            resolve();
          }, 2000);
        });
      } else {
        console.log('✅ Service Worker já está no controle');
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      return false;
    }
  }

  /**
   * Solicita permissão para notificações
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Envia notificação via Service Worker
   */
  static async sendNotification(alert: any): Promise<void> {
    // Verificar permissão
    if (Notification.permission !== 'granted') {
      console.warn('Permissão de notificação negada');
      return;
    }

    const workflowName = alert.workflowName || 'Workflow';
    const errorPreview = alert.message?.substring(0, 80) || 'Erro detectado no workflow';

    // Tentar enviar via Service Worker
    if (navigator.serviceWorker.controller) {
      console.log('📤 Enviando notificação via Service Worker');
      navigator.serviceWorker.controller.postMessage({
        type: 'NEW_ERROR',
        alert
      });
    } else {
      // Fallback: usar notificação nativa se SW não estiver ativo
      console.warn('⚠️ Service Worker não está ativo, usando notificação nativa');
      
      new Notification('🛡️ Sentinel - Novo Erro', {
        body: `📍 ${workflowName}\n⚠️ ${errorPreview}${alert.message && alert.message.length > 80 ? '...' : ''}`,
        tag: alert.id,
        requireInteraction: false,
        silent: true
      });
    }
  }

  /**
   * Verifica se notificações estão habilitadas
   */
  static isNotificationEnabled(): boolean {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      Notification.permission === 'granted'
    );
  }

  /**
   * Desregistra o Service Worker (para debugging)
   */
  static async unregister(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.unregister();
      this.swRegistration = null;
      console.log('Service Worker desregistrado');
    }
  }
}
