'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount, notifications, markAsRead, markAllAsRead } =
    useNotifications()

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Criar Evento', href: '/eventos/criar' },
    { name: 'Perfil', href: '/perfil' },
  ]

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>M</span>
              </div>
              <span className='text-xl font-semibold text-gray-900'>
                Mutirões
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className='flex items-center space-x-4'>
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200'
            >
              <MagnifyingGlassIcon className='h-5 w-5' />
            </button>

            {/* Notifications */}
            <div className='relative'>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className='relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200'
              >
                <BellIcon className='h-5 w-5' />
                {unreadCount > 0 && (
                  <Badge
                    variant='destructive'
                    size='sm'
                    className='absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0'
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto'>
                  <div className='px-4 py-2 border-b border-gray-200 flex justify-between items-center'>
                    <h3 className='text-sm font-medium text-gray-900'>
                      Notificações
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className='text-xs text-blue-600 hover:text-blue-800'
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className='px-4 py-8 text-center text-gray-500'>
                      <BellIcon className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                      <p className='text-sm'>Nenhuma notificação</p>
                    </div>
                  ) : (
                    <div className='py-1'>
                      {notifications.slice(0, 10).map(notification => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id)
                            setIsNotificationsOpen(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            !notification.read
                              ? 'bg-blue-50 border-l-4 border-blue-500'
                              : ''
                          }`}
                        >
                          <div className='flex items-start space-x-3'>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>
                                {notification.title}
                              </p>
                              <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                                {notification.body}
                              </p>
                              <p className='text-xs text-gray-400 mt-1'>
                                {new Date(
                                  notification.created_at
                                ).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2'></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className='relative'>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className='flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200'
                >
                  {user.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt={`${user.first_name} ${user.last_name}`}
                      className='w-8 h-8 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                      <UserCircleIcon className='h-5 w-5 text-gray-600' />
                    </div>
                  )}
                  <span className='hidden sm:block text-sm font-medium'>
                    {user.first_name} {user.last_name}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
                    <Link
                      href='/perfil'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Meu Perfil
                    </Link>
                    <hr className='my-1' />
                    <button
                      onClick={() => {
                        logout()
                        setIsUserMenuOpen(false)
                        router.push('/')
                      }}
                      className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                    >
                      <ArrowRightOnRectangleIcon className='h-4 w-4 mr-2' />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => router.push('/login')}
                >
                  Entrar
                </Button>
                <Button size='sm' onClick={() => router.push('/cadastro')}>
                  Cadastrar
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200'
            >
              {isMenuOpen ? (
                <XMarkIcon className='h-5 w-5' />
              ) : (
                <Bars3Icon className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden border-t border-gray-200 py-4'>
            <nav className='flex flex-col space-y-2'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Search Bar */}
        {isSearchOpen && (
          <div className='border-t border-gray-200 py-4'>
            <div className='relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Buscar eventos, organizações...'
                className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
