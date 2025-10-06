'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/lib/notifications'

interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  // Request permission for push notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications não são suportadas neste navegador')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        await subscribeToPush()
        return true
      } else {
        setError('Permissão para notificações foi negada')
        return false
      }
    } catch (err) {
      setError('Erro ao solicitar permissão: ' + (err as Error).message)
      return false
    }
  }, [isSupported])

  // Subscribe to push notifications
  const subscribeToPush =
    useCallback(async (): Promise<PushSubscription | null> => {
      if (!isSupported || !('serviceWorker' in navigator)) {
        return null
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        setSubscription(subscription)
        setIsSubscribed(true)

        // Send subscription to server
        await sendSubscriptionToServer(subscription)

        return subscription
      } catch (err) {
        setError(
          'Erro ao inscrever-se nas notificações push: ' +
            (err as Error).message
        )
        return null
      }
    }, [isSupported])

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false

    try {
      const result = await subscription.unsubscribe()
      if (result) {
        setSubscription(null)
        setIsSubscribed(false)

        // Notify server about unsubscription
        await removeSubscriptionFromServer(subscription)
      }
      return result
    } catch (err) {
      setError('Erro ao cancelar inscrição: ' + (err as Error).message)
      return false
    }
  }, [subscription])

  // Send subscription to server
  const sendSubscriptionToServer = useCallback(
    async (subscription: PushSubscription) => {
      try {
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            userAgent: navigator.userAgent,
          }),
        })

        if (!response.ok) {
          throw new Error('Falha ao enviar inscrição para o servidor')
        }
      } catch (err) {
        console.error('Erro ao enviar inscrição:', err)
      }
    },
    []
  )

  // Remove subscription from server
  const removeSubscriptionFromServer = useCallback(
    async (subscription: PushSubscription) => {
      try {
        const response = await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })

        if (!response.ok) {
          throw new Error('Falha ao remover inscrição do servidor')
        }
      } catch (err) {
        console.error('Erro ao remover inscrição:', err)
      }
    },
    []
  )

  // Show local notification
  const showNotification = useCallback(
    (notification: Omit<PushNotification, 'id' | 'timestamp'>) => {
      if (permission !== 'granted') {
        console.warn('Notificações não permitidas')
        return null
      }

      const id = Math.random().toString(36).substr(2, 9)
      const timestamp = Date.now()

      const notificationOptions: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico',
        tag: notification.tag,
        data: notification.data,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
        timestamp,
      }

      const n = new Notification(notification.title, notificationOptions)

      // Add to local notifications list
      const pushNotification: PushNotification = {
        id,
        timestamp,
        ...notification,
      }

      setNotifications(prev => [pushNotification, ...prev.slice(0, 49)]) // Keep last 50

      // Handle notification click
      n.onclick = () => {
        window.focus()
        n.close()

        // Handle notification action
        if (notification.data?.action) {
          // Navigate to specific page or perform action
          if (notification.data.action === 'navigate') {
            window.location.href = notification.data.url || '/'
          }
        }
      }

      // Auto-close after 5 seconds if not requiring interaction
      if (!notification.requireInteraction) {
        setTimeout(() => n.close(), 5000)
      }

      return n
    },
    [permission]
  )

  // Schedule notification
  const scheduleNotification = useCallback(
    (
      notification: Omit<PushNotification, 'id' | 'timestamp'>,
      delay: number
    ) => {
      return setTimeout(() => {
        showNotification(notification)
      }, delay)
    },
    [showNotification]
  )

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Remove specific notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Notification helpers
  const notifyEventCreated = useCallback(
    (eventTitle: string, eventId: string) => {
      return showNotification({
        title: 'Novo Evento Criado! 🎉',
        body: `"${eventTitle}" foi criado e está disponível para inscrições`,
        data: { action: 'navigate', url: `/eventos/${eventId}` },
        tag: 'event-created',
      })
    },
    [showNotification]
  )

  const notifyEventReminder = useCallback(
    (eventTitle: string, timeUntil: string, eventId: string) => {
      return showNotification({
        title: 'Lembrete de Evento ⏰',
        body: `"${eventTitle}" começa em ${timeUntil}`,
        data: { action: 'navigate', url: `/eventos/${eventId}` },
        tag: 'event-reminder',
        requireInteraction: true,
      })
    },
    [showNotification]
  )

  const notifyEventJoined = useCallback(
    (eventTitle: string, eventId: string) => {
      return showNotification({
        title: 'Inscrição Confirmada! ✅',
        body: `Você se inscreveu em "${eventTitle}"`,
        data: { action: 'navigate', url: `/eventos/${eventId}` },
        tag: 'event-joined',
      })
    },
    [showNotification]
  )

  const notifyEventCancelled = useCallback(
    (eventTitle: string) => {
      return showNotification({
        title: 'Evento Cancelado ❌',
        body: `"${eventTitle}" foi cancelado`,
        tag: 'event-cancelled',
      })
    },
    [showNotification]
  )

  const notifyBadgeEarned = useCallback(
    (badgeName: string) => {
      return showNotification({
        title: 'Badge Conquistado! 🏆',
        body: `Você ganhou o badge "${badgeName}"`,
        data: { action: 'navigate', url: '/perfil' },
        tag: 'badge-earned',
        requireInteraction: true,
      })
    },
    [showNotification]
  )

  const notifyNewMessage = useCallback(
    (senderName: string, message: string, eventId: string) => {
      return showNotification({
        title: `Nova mensagem de ${senderName}`,
        body: message,
        data: { action: 'navigate', url: `/eventos/${eventId}` },
        tag: 'new-message',
      })
    },
    [showNotification]
  )

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    notifications,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification,
    scheduleNotification,
    clearNotifications,
    removeNotification,
    notifyEventCreated,
    notifyEventReminder,
    notifyEventJoined,
    notifyEventCancelled,
    notifyBadgeEarned,
    notifyNewMessage,
  }
}
