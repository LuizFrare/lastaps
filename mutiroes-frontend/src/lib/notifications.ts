'use client'

import { api } from './api'

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

class NotificationService {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: false,
  }

  constructor() {
    // Initialize permission status only on client side
    if (typeof window !== 'undefined') {
      this.checkPermission()
    }
  }

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator
  }

  private checkPermission() {
    if (!this.isSupported()) return

    switch (Notification.permission) {
      case 'granted':
        this.permission.granted = true
        break
      case 'denied':
        this.permission.denied = true
        break
      default:
        this.permission.default = true
        break
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notificações não são suportadas neste navegador')
      return false
    }

    if (this.permission.granted) {
      return true
    }

    if (this.permission.denied) {
      console.warn('Permissão de notificação foi negada')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.checkPermission()
      
      if (permission === 'granted') {
        await this.registerServiceWorker()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error)
      return false
    }
  }

  private async registerServiceWorker() {
    if (this.isSupported()) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registrado:', registration)
        
        // Registrar token de push
        await this.registerPushToken()
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error)
      }
    }
  }

  private async registerPushToken() {
    if (!this.isSupported() || !('PushManager' in window)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      })

      // Enviar subscription para o backend
      await api.request('/notifications/push-tokens/', {
        method: 'POST',
        body: JSON.stringify({
          token: JSON.stringify(subscription),
          platform: 'web',
        }),
      })

      console.log('Token de push registrado com sucesso')
    } catch (error) {
      console.error('Erro ao registrar token de push:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (!this.permission.granted) {
      console.warn('Permissão de notificação não concedida')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Erro ao exibir notificação:', error)
    }
  }

  async scheduleNotification(title: string, options: NotificationOptions & { delay: number }) {
    if (!this.permission.granted) {
      console.warn('Permissão de notificação não concedida')
      return
    }

    const { delay, ...notificationOptions } = options

    setTimeout(() => {
      this.showNotification(title, notificationOptions)
    }, delay)
  }

  getPermissionStatus(): NotificationPermission {
    return { ...this.permission }
  }

  isNotificationSupported(): boolean {
    return this.isSupported()
  }

  // Métodos para diferentes tipos de notificações
  async notifyEventCreated(eventTitle: string) {
    return this.showNotification('Novo Evento Criado!', {
      body: `O evento "${eventTitle}" foi criado com sucesso`,
      tag: 'event-created',
    })
  }

  async notifyEventReminder(eventTitle: string, timeUntil: string) {
    return this.showNotification('Lembrete de Evento', {
      body: `O evento "${eventTitle}" começa em ${timeUntil}`,
      tag: 'event-reminder',
    })
  }

  async notifyEventJoined(eventTitle: string) {
    return this.showNotification('Inscrição Confirmada', {
      body: `Você se inscreveu no evento "${eventTitle}"`,
      tag: 'event-joined',
    })
  }

  async notifyEventCancelled(eventTitle: string) {
    return this.showNotification('Evento Cancelado', {
      body: `O evento "${eventTitle}" foi cancelado`,
      tag: 'event-cancelled',
    })
  }

  async notifyBadgeEarned(badgeName: string) {
    return this.showNotification('Badge Conquistado! 🏆', {
      body: `Você conquistou o badge "${badgeName}"`,
      tag: 'badge-earned',
    })
  }

  async notifyNewMessage(senderName: string, message: string) {
    return this.showNotification(`Nova mensagem de ${senderName}`, {
      body: message,
      tag: 'new-message',
    })
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export types
export type { NotificationPermission }
