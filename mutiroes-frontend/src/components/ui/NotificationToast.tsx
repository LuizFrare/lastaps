'use client'

import React, { useEffect, useState } from 'react'
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from './Button'

interface NotificationToastProps {
  id: string
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: (id: string) => void
  onAction?: () => void
  actionLabel?: string
}

export function NotificationToast({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
  onAction,
  actionLabel = 'Ver',
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className='h-5 w-5 text-green-500' />
      case 'error':
        return <ExclamationTriangleIcon className='h-5 w-5 text-red-500' />
      case 'warning':
        return <ExclamationTriangleIcon className='h-5 w-5 text-yellow-500' />
      case 'info':
      default:
        return <InformationCircleIcon className='h-5 w-5 text-blue-500' />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500'
      case 'error':
        return 'border-l-red-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'info':
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getBorderColor()}
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isLeaving
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>{getIcon()}</div>
          <div className='ml-3 w-0 flex-1'>
            <p className='text-sm font-medium text-gray-900'>{title}</p>
            <p className='mt-1 text-sm text-gray-600'>{message}</p>
            {onAction && (
              <div className='mt-3'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={onAction}
                  className='text-xs'
                >
                  {actionLabel}
                </Button>
              </div>
            )}
          </div>
          <div className='ml-4 flex-shrink-0 flex'>
            <button
              className='bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              onClick={handleClose}
            >
              <span className='sr-only'>Fechar</span>
              <XMarkIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string
    title: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
    onAction?: () => void
    actionLabel?: string
  }>
  onClose: (id: string) => void
}

export function NotificationContainer({
  notifications,
  onClose,
}: NotificationContainerProps) {
  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}


