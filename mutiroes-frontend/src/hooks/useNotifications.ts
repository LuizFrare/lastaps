'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  notificationService,
  NotificationPermission,
} from '@/lib/notifications'
import { api } from '@/lib/api'

interface Notification {
  id: number
  title: string
  body: string
  type: string
  read: boolean
  created_at: string
  data?: Record<string, unknown>
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false,
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Check permission status on mount
  useEffect(() => {
    setPermission(notificationService.getPermissionStatus())
  }, [])

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.getNotifications()
      const notificationsData = Array.isArray(response.data)
        ? (response.data as Notification[])
        : (response.data as { results?: Notification[] }).results || []
      setNotifications(notificationsData)

      // Count unread notifications
      const unread = notificationsData.filter(
        (n: Notification) => !n.read
      ).length
      setUnreadCount(unread)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar notificações'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load notifications on mount only if authenticated
  useEffect(() => {
    // Only load notifications if we have a valid token
    const token = localStorage.getItem('accessToken')
    if (token) {
      loadNotifications()
    }
  }, [loadNotifications])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const granted = await notificationService.requestPermission()
      setPermission(notificationService.getPermissionStatus())
      return granted
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      return false
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await api.markNotificationRead(notificationId)

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )

      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead()

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))

      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
    }
  }, [])

  // Show local notification
  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      return notificationService.showNotification(title, options)
    },
    []
  )

  // Schedule notification
  const scheduleNotification = useCallback(
    (title: string, options: NotificationOptions & { delay: number }) => {
      return notificationService.scheduleNotification(title, options)
    },
    []
  )

  // Notification helpers
  const notifyEventCreated = useCallback((eventTitle: string) => {
    return notificationService.notifyEventCreated(eventTitle)
  }, [])

  const notifyEventReminder = useCallback(
    (eventTitle: string, timeUntil: string) => {
      return notificationService.notifyEventReminder(eventTitle, timeUntil)
    },
    []
  )

  const notifyEventJoined = useCallback((eventTitle: string) => {
    return notificationService.notifyEventJoined(eventTitle)
  }, [])

  const notifyEventCancelled = useCallback((eventTitle: string) => {
    return notificationService.notifyEventCancelled(eventTitle)
  }, [])

  const notifyBadgeEarned = useCallback((badgeName: string) => {
    return notificationService.notifyBadgeEarned(badgeName)
  }, [])

  const notifyNewMessage = useCallback(
    (senderName: string, message: string) => {
      return notificationService.notifyNewMessage(senderName, message)
    },
    []
  )

  return {
    permission,
    notifications,
    unreadCount,
    isLoading,
    error,
    isSupported: notificationService.isNotificationSupported(),
    requestPermission,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    showNotification,
    scheduleNotification,
    notifyEventCreated,
    notifyEventReminder,
    notifyEventJoined,
    notifyEventCancelled,
    notifyBadgeEarned,
    notifyNewMessage,
  }
}
